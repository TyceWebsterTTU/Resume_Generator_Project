const { GoogleGenAI } = require("@google/genai")
const env = require('dotenv/config')
const {v4: uuidv4} = require('uuid')
const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const cors = require("cors");


const app = express()
const HTTP_PORT = 8000
app.use(cors())
app.use(express.json())

// Initialize the Google GenAI client with the API key from our .env file
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY)
// identify the model we want to use for story generation
const model = "gemini-3-flash-preview"

const dbResumes = new sqlite3.Database('dbResume.db', (err) => {
    if(err){
        console.error("Error opening database:",err.message)
    } else {
        console.log("Connected to dbResume.db")
    }
})

app.listen(HTTP_PORT,() => {
    console.log('Listening on',HTTP_PORT)
})

function buildPrompt (objData) {
    const strDateDisplay = objData.boolCurrent ? 'Present' : (objData.strEndDate || 'Present')

    const strWorkExperienceList = objData.arrWorkExperience?.map(job => {
        return `${job.strTitle} at ${job.strCompany} (${job.strStart} - ${job.strEnd}) - ${job.strDesc}`
    }).join('\n') || 'Not Provided'
    const strSkillsList = objData.arrSkills?.join(', ') || 'Not Provided'
    const strCertsAwardsList = objData.arrCertsAwards?.join(', ') || 'Not Provided'

    return `You are are a hiring manager and are tasked with looking over resumes. Your task is to generate a complete, polished, ATS-friendly resume in a clean PDF format tailored to the specific job being applied for.
    CANDIDATE INFORMATION:
    - Full Name: ${objData.strFirstName.trim()} ${objData.strLastName.trim()}
    - Email: ${objData.strEmail.trim()}
    - Phone: ${objData.strPhone || 'Not Provided'}
    - Address: ${objData.strAddress || 'Not Provided'}
    - LinkedIn: ${objData.strLinkedIn || 'Not Provided'}
    - GitHub: ${objData.strGitHub || 'Not Provided'}
    
    WORK EXPERIENCE: ${strWorkExperienceList}
    
    SKILLS: ${strSkillsList}
    
    CERTIFICATIONS & AWARDS: ${strCertsAwardsList}
    
    JOB BEING APPLIED FOR:
    ${objData.strAppliedJob || 'General professional position'}`.trim()
}

app.post('/generate', async (req, res) => {
    try {
        const objData = req.body
        const strResumeID = uuidv4()

        const strPrompt = buildPrompt(objData)
        const objResponse = await genAI.models.generateContent({
            model: model,
            contents: strPrompt,
        });
        console.log(objResponse.text)

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
            objData.arrWorkExperience.map(job => `${job.strTitle} at ${job.strCompany}`).join(', '),
            objData.arrSkills.join(', '),
            objData.arrCertsAwards.join(', '),
            objData.strAppliedJob
        ], function(err) {
            if(err) {
                res.status(400).json({message:"Failed to generate resume"})
            } else {
                res.status(201).json({message: "Resume generated successfully"})
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).send('Error generating resume: ' + err.message)
    }
})