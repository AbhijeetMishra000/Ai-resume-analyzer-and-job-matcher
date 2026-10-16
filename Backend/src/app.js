const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "").toLowerCase()
const allowedLocalOrigins = [ "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173" ]
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .concat(allowedLocalOrigins.map((origin) => normalizeOrigin(origin)))
    .filter(Boolean)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true)
        }

        const requestOrigin = normalizeOrigin(origin)
        const isExactMatch = allowedOrigins.includes(requestOrigin)
        const isAllowedVercelPreview = allowedOrigins.some((allowedOrigin) => {
            if (!allowedOrigin.startsWith("https://") || !allowedOrigin.endsWith(".vercel.app")) {
                return false
            }

            return requestOrigin.endsWith(".vercel.app")
        })

        if (isExactMatch || isAllowedVercelPreview) {
            return callback(null, true)
        }

        console.log("Blocked by CORS:", requestOrigin, "Allowed:", allowedOrigins)
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            message: "Resume file is too large. Maximum allowed size is 5 MB."
        })
    }

    if (err?.message === "Not allowed by CORS") {
        return res.status(403).json({
            message: "Request blocked by CORS policy."
        })
    }

    console.error(err)
    return res.status(500).json({
        message: "Internal server error"
    })
})



module.exports = app
