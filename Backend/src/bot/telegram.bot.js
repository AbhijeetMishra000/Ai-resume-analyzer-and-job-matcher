const { Telegraf } = require("telegraf")
const axios = require("axios")
const bcrypt = require("bcryptjs")
const pdfParse = require("pdf-parse")
const mongoose = require("mongoose")
const userModel = require("../models/user.model")
const interviewReportModel = require("../models/interviewReport.model")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")

const botToken = process.env.TELEGRAM_BOT_TOKEN
const webhookPath = "/telegram/webhook"
const bot = botToken ? new Telegraf(botToken) : null
const sessions = new Map()

const defaultInterviewOptions = {
    roadmapDays: 25,
    technicalQuestionCount: 15,
    behavioralQuestionCount: 15
}

const getSession = (chatId) => {
    if (!sessions.has(chatId)) {
        sessions.set(chatId, {
            step: null,
            resumeBuffer: null,
            selfDescription: "",
            jobDescription: ""
        })
    }

    return sessions.get(chatId)
}

const clearSession = (chatId) => sessions.delete(chatId)

const buildUniqueUsername = async (baseUsername) => {
    let candidate = baseUsername
    let suffix = 0

    while (await userModel.findOne({ username: candidate })) {
        suffix += 1
        candidate = `${baseUsername}_${suffix}`
    }

    return candidate
}

const getOrCreateTelegramUser = async (ctx) => {
    const telegramId = String(ctx.from.id)
    const telegramUsername = ctx.from.username || ""

    const existingUser = await userModel.findOne({ telegramId })
    if (existingUser) {
        if (existingUser.telegramUsername !== telegramUsername) {
            existingUser.telegramUsername = telegramUsername
            await existingUser.save()
        }
        return existingUser
    }

    const baseUsername = (telegramUsername || `tg_${telegramId}`).slice(0, 20)
    const uniqueUsername = await buildUniqueUsername(baseUsername)
    const email = `telegram_${telegramId}@bot.local`
    const password = await bcrypt.hash(`telegram_${telegramId}_${Date.now()}`, 10)

    return userModel.create({
        username: uniqueUsername,
        email,
        password,
        telegramId,
        telegramUsername
    })
}

const getTelegramFileBuffer = async (fileId) => {
    const fileResponse = await axios.get(
        `https://api.telegram.org/bot${botToken}/getFile`,
        { params: { file_id: fileId } }
    )

    const filePath = fileResponse?.data?.result?.file_path
    if (!filePath) {
        throw new Error("Unable to fetch Telegram file path")
    }

    const downloadResponse = await axios.get(
        `https://api.telegram.org/file/bot${botToken}/${filePath}`,
        { responseType: "arraybuffer" }
    )

    return Buffer.from(downloadResponse.data)
}

if (bot) {
    bot.start(async (ctx) => {
        await getOrCreateTelegramUser(ctx)
        clearSession(ctx.chat.id)

        await ctx.reply(
            "Welcome to Resume AI bot.\n\nUse /analyze to generate an interview report.\nUse /report <id> to view a saved report.\nUse /resume <id> to get a tailored resume PDF."
        )
    })

    bot.command("analyze", async (ctx) => {
        await getOrCreateTelegramUser(ctx)
        const session = getSession(ctx.chat.id)
        session.step = "awaiting_resume"
        session.resumeBuffer = null
        session.selfDescription = ""
        session.jobDescription = ""

        await ctx.reply("Send your resume as a PDF document (max recommended: 3MB).")
    })

    bot.command("report", async (ctx) => {
        try {
            const user = await getOrCreateTelegramUser(ctx)
            const [, interviewReportId] = ctx.message.text.split(" ")

            if (!interviewReportId || !mongoose.Types.ObjectId.isValid(interviewReportId)) {
                await ctx.reply("Usage: /report <interview_report_id>")
                return
            }

            const report = await interviewReportModel.findOne({
                _id: interviewReportId,
                user: user._id
            })

            if (!report) {
                await ctx.reply("Report not found.")
                return
            }

            const topSkillGaps = report.skillGaps.slice(0, 5).map((gap) => `${gap.skill} (${gap.severity})`).join(", ")

            await ctx.reply(
                `Report: ${report._id}\nTitle: ${report.title}\nMatch Score: ${report.matchScore}%\nSkill Gaps: ${topSkillGaps || "None"}\n\nUse /resume ${report._id} to download your tailored resume PDF.`
            )
        } catch (err) {
            console.log("Telegram /report error:", err.message)
            await ctx.reply("Unable to fetch the report right now.")
        }
    })

    bot.command("resume", async (ctx) => {
        try {
            const user = await getOrCreateTelegramUser(ctx)
            const [, interviewReportId] = ctx.message.text.split(" ")

            if (!interviewReportId || !mongoose.Types.ObjectId.isValid(interviewReportId)) {
                await ctx.reply("Usage: /resume <interview_report_id>")
                return
            }

            const report = await interviewReportModel.findOne({
                _id: interviewReportId,
                user: user._id
            })

            if (!report) {
                await ctx.reply("Report not found.")
                return
            }

            await ctx.reply("Generating your tailored resume PDF. This can take a minute...")
            const pdfBuffer = await generateResumePdf({
                resume: report.resume,
                selfDescription: report.selfDescription,
                jobDescription: report.jobDescription
            })

            await ctx.replyWithDocument({
                source: pdfBuffer,
                filename: `resume_${report._id}.pdf`
            })
        } catch (err) {
            console.log("Telegram /resume error:", err.message)
            await ctx.reply("Unable to generate resume PDF right now.")
        }
    })

    bot.on("document", async (ctx) => {
        try {
            const session = getSession(ctx.chat.id)
            if (session.step !== "awaiting_resume") {
                await ctx.reply("Send /analyze first, then upload your resume PDF.")
                return
            }

            const document = ctx.message.document
            const mimeType = document?.mime_type || ""
            const fileName = document?.file_name || ""
            const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")

            if (!isPdf) {
                await ctx.reply("Please upload a PDF file.")
                return
            }

            session.resumeBuffer = await getTelegramFileBuffer(document.file_id)
            session.step = "awaiting_self_description"

            await ctx.reply("Resume received. Now send your self-description.")
        } catch (err) {
            console.log("Telegram document error:", err.message)
            await ctx.reply("Unable to read this file. Please try again.")
        }
    })

    bot.on("text", async (ctx) => {
        if (ctx.message.text.startsWith("/")) {
            return
        }

        const session = getSession(ctx.chat.id)

        if (session.step === "awaiting_self_description") {
            session.selfDescription = ctx.message.text
            session.step = "awaiting_job_description"
            await ctx.reply("Great. Now send the job description.")
            return
        }

        if (session.step === "awaiting_job_description") {
            try {
                session.jobDescription = ctx.message.text
                const user = await getOrCreateTelegramUser(ctx)

                await ctx.reply("Generating your interview report. Please wait...")

                const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(session.resumeBuffer))).getText()
                const aiReport = await generateInterviewReport({
                    resume: resumeContent.text,
                    selfDescription: session.selfDescription,
                    jobDescription: session.jobDescription,
                    ...defaultInterviewOptions
                })

                const interviewReport = await interviewReportModel.create({
                    user: user._id,
                    resume: resumeContent.text,
                    selfDescription: session.selfDescription,
                    jobDescription: session.jobDescription,
                    ...aiReport
                })

                clearSession(ctx.chat.id)

                await ctx.reply(
                    `Done.\nReport ID: ${interviewReport._id}\nTitle: ${interviewReport.title}\nMatch Score: ${interviewReport.matchScore}%\n\nUse /report ${interviewReport._id} for summary.\nUse /resume ${interviewReport._id} for PDF.`
                )
            } catch (err) {
                console.log("Telegram analysis error:", err.message)
                await ctx.reply("Could not generate report right now. Please run /analyze and try again.")
                clearSession(ctx.chat.id)
            }
            return
        }

        await ctx.reply("Use /analyze to start interview report generation.")
    })
}

const setupTelegramWebhook = async () => {
    if (!bot) {
        console.log("TELEGRAM_BOT_TOKEN not found. Telegram bot is disabled.")
        return
    }

    const normalizedBaseUrl = (process.env.BASE_URL || "").trim().replace(/\/+$/, "")
    if (!normalizedBaseUrl) {
        console.log("BASE_URL not found. Set BASE_URL to enable Telegram webhook registration.")
        return
    }

    try {
        await bot.telegram.setWebhook(`${normalizedBaseUrl}${webhookPath}`)
        console.log("Telegram webhook configured.")
    } catch (err) {
        console.log("Failed to configure Telegram webhook:", err.message)
    }
}

module.exports = {
    setupTelegramWebhook,
    telegramWebhookMiddleware: bot ? bot.webhookCallback() : null
}
