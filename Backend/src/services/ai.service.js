const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")
const path = require("path")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const ALLOWED_ROADMAP_DAYS = [ 7, 25, 45, 60 ]
const ALLOWED_QUESTION_COUNTS = [ 10, 15, 20 ]

const normalizeOption = (value, allowedValues, fallback) => {
    const numericValue = Number(value)
    return allowedValues.includes(numericValue) ? numericValue : fallback
}

const fillQuestion = (questionType, index) => ({
    question: `Sample ${questionType} question ${index + 1}`,
    intention: `Assess ${questionType.toLowerCase()} readiness for this role.`,
    answer: "Provide a concise, role-relevant answer with concrete examples."
})

const ensureQuestionLength = (questions, targetCount, questionType) => {
    const safeQuestions = Array.isArray(questions) ? [ ...questions ] : []
    const trimmed = safeQuestions.slice(0, targetCount)

    while (trimmed.length < targetCount) {
        trimmed.push(fillQuestion(questionType, trimmed.length))
    }

    return trimmed
}

const ensureRoadmapLength = (plan, targetDays) => {
    const safePlan = Array.isArray(plan) ? [ ...plan ] : []
    const trimmed = safePlan.slice(0, targetDays).map((item, index) => ({
        day: index + 1,
        focus: item?.focus || `Preparation focus for day ${index + 1}`,
        tasks: Array.isArray(item?.tasks) && item.tasks.length > 0
            ? item.tasks
            : [
                "Review role requirements and identify weak areas.",
                "Practice role-specific questions and refine responses.",
                "Summarize key learnings and plan next-day priorities."
            ]
    }))

    while (trimmed.length < targetDays) {
        const day = trimmed.length + 1
        trimmed.push({
            day,
            focus: `Preparation focus for day ${day}`,
            tasks: [
                "Review role requirements and identify weak areas.",
                "Practice role-specific questions and refine responses.",
                "Summarize key learnings and plan next-day priorities."
            ]
        })
    }

    return trimmed
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
    roadmapDays,
    technicalQuestionCount,
    behavioralQuestionCount
}) {

    const targetRoadmapDays = normalizeOption(roadmapDays, ALLOWED_ROADMAP_DAYS, 25)
    const targetTechnicalQuestions = normalizeOption(technicalQuestionCount, ALLOWED_QUESTION_COUNTS, 15)
    const targetBehavioralQuestions = normalizeOption(behavioralQuestionCount, ALLOWED_QUESTION_COUNTS, 15)


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Output requirements:
                        - Return exactly ${targetTechnicalQuestions} items in technicalQuestions.
                        - Return exactly ${targetBehavioralQuestions} items in behavioralQuestions.
                        - Return exactly ${targetRoadmapDays} items in preparationPlan.
                        - preparationPlan day values must be sequential integers starting at 1.
                        - Ensure all arrays are complete and match these exact counts.
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    const report = JSON.parse(response.text)

    report.technicalQuestions = ensureQuestionLength(report.technicalQuestions, targetTechnicalQuestions, "Technical")
    report.behavioralQuestions = ensureQuestionLength(report.behavioralQuestions, targetBehavioralQuestions, "Behavioral")
    report.preparationPlan = ensureRoadmapLength(report.preparationPlan, targetRoadmapDays)

    return report


}



async function generatePdfFromHtml(htmlContent) {
    process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR || path.join(__dirname, "../../.cache/puppeteer")

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath()
    let browser = null;
    try {
        browser = await puppeteer.launch({
            executablePath,
            headless: "new",
            args: [ "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu" ]
        })
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })

        return pdfBuffer
    } finally {
        if (browser) {
            try {
                await browser.close()
            } catch (err) {
                console.error("Error closing browser:", err)
            }
        }
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }
