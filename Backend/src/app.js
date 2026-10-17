const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

const normalizeOrigin = (value = "") =>
    value.trim().replace(/\/+$/, "").toLowerCase();

const allowedOrigins = [
    "https://ai-resume-analyzer-and-job-matcher-mu.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    ...(process.env.CLIENT_URL || "")
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean)
];

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
            return callback(null, true);
        }

        console.log("Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


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
