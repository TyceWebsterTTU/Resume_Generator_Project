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