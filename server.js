// All libraries used in the backend
const { GoogleGenAI } = require('@google/genai')
const env = require('dotenv/config')
const {v4: uuidv4} = require('uuid')
const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors");
const PDFDocument = require("pdfkit") // AI Used Here

// Email validation
const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

const app = express()
const HTTP_PORT = 8000
app.use(cors())
app.use(express.json())

// Initialize the Google GenAI client with the API key from our .env file
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)
const strModelName = 'gemini-3-flash-preview'

// Connects to DB
const dbResumes = new sqlite3.Database('dbResume.db', (err) => {
    if(err){
        console.error("Error opening database:",err.message)
    } else {
        console.log("Connected to dbResume.db")
    }
})

// Starts backend
app.listen(HTTP_PORT,() => {
    console.log('Listening on',HTTP_PORT)
})

// Function to help build the prompt being sent to my AI API
function buildPrompt (objData) {
    // Helps determine which date to display is correct
    const strDateDisplay = objData.boolCurrent ? 'Present' : (objData.strEndDate || 'Present')
    // Format work experience into a readable list for the AI
    const strWorkList = objData.arrWorkExperience.length
        ? objData.arrWorkExperience.map(j =>
            `${j.strTitle} at ${j.strCompany} (${j.strLocation || 'N/A'}) ` +
            `${j.strStart} to ${j.strEnd}: ${j.strDesc || 'No description'}`
          ).join('\n')
        : 'Not provided'
    // Format the skills and certs/awards data into a readable list for the AI
    const strSkillsList = objData.arrSkills?.join(', ') || 'Not Provided'
    const strCertsAwardsList = objData.arrCertsAwards?.join(', ') || 'Not Provided'
    
    // Returns the AI prompt that will be sent to the AI API
    return `You are are a hiring manager and are tasked with looking over resumes. Your task is to generate a complete and polished resume in a clean PDF format tailored to the specific job being applied for.
    CANDIDATE INFORMATION:
    - Full Name: ${objData.strFirstName.trim()} ${objData.strLastName.trim()}
    - Email: ${objData.strEmail.trim()}
    - Phone: ${objData.strPhone || 'Not Provided'}
    - Address: ${objData.strAddress || 'Not Provided'}
    - LinkedIn: ${objData.strLinkedIn || 'Not Provided'}
    - GitHub: ${objData.strGitHub || 'Not Provided'}
    
    WORK EXPERIENCE: ${strWorkList}
    
    SKILLS: ${strSkillsList}
    
    CERTIFICATIONS & AWARDS: ${strCertsAwardsList}
    
    JOB BEING APPLIED FOR:
    ${objData.strAppliedJob || 'General professional position'}`.trim()
}

// Generates the PDF that will be downloaded by the user
// AI was used to help me understand how this library works. 
function buildPdf (strContent) {
    return new Promise((fnResolve, fnReject) => {
        try {
            const objDoc = new PDFDocument({ margin: 50, size: 'LETTER' })
            const arrChunks = []
            objDoc.on('data', (buf) => arrChunks.push(buf))
            objDoc.on('end', () => fnResolve(Buffer.concat(arrChunks)))
            objDoc.on('error', fnReject)
 
            strContent.split('\n').forEach((strRaw) => {
                const strLine = strRaw.trimEnd()
 
                if (!strLine.trim()) {
                    objDoc.moveDown(0.4)
                } else {
                    objDoc
                        .fontSize(11)
                        .font('Helvetica')
                        .fillColor('#111111')
                        .text(strLine, { lineGap: 2 })
                }
            })
 
            objDoc.end()
        } catch (err) {
            fnReject(err)
        }
    })
}

// This is the route that generates the Resume utilizing the AI API. It saves the the data into the DB and sends back a PDF
app.post('/generate', async (req, res) => {
    try {
        const objData = req.body
        const strResumeID = uuidv4() // Sets a uuid to the new Resume data in the DB

        console.log(`Calling Gemini for ${objData.strFirstName}`)

        // Builds and calls the AI prompt for the Gemini model
        const strPrompt = buildPrompt(objData)
        const objResponse = await genAI.models.generateContent({
            model: strModelName,
            contents: strPrompt,
        });
        console.log(objResponse.text) 
        
        const strResumeText = objResponse.text

        // Sets up and runs the INSERT query to log all the submissions for this resume form.
        const strQuery = "INSERT INTO tblResumes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        dbResumes.run(strQuery, [
            strResumeID,
            objData.strFirstName.trim(),
            objData.strLastName.trim(),
            objData.strEmail.trim(),
            objData.strPhone,
            objData.strAddress,
            objData.strLinkedIn,
            objData.strGitHub,
            // Converts the arrays to strings for DB storage
            objData.arrWorkExperience.map(job => `${job.strTitle} at ${job.strCompany}`).join(', '),
            objData.arrSkills.join(', '),
            objData.arrCertsAwards.join(', '),
            objData.strAppliedJob
        ], async function(err) {
            if(err) {
                res.status(400).json({message:"Failed to generate resume"})
            } else {
                console.log(`Saved resume: ${strResumeID}`)
                // Converts the AI text into a PDF
                const bufPdf = await buildPdf(strResumeText)
                // Sets the headers so the browser will know how to treat the response
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', `attachment; filename=${objData.strFirstName}_${objData.strLastName}_Resume.pdf`)
                // Sends the data back to the frontend
                res.status(200).send(bufPdf)
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error generating resume: ' + err.message)
    }
})