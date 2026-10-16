const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "").toLowerCase()
const isLocalOrigin = (origin = "") => {
    return origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")
}
const getBearerToken = (authHeader = "") => {
    if (!authHeader || typeof authHeader !== "string") {
        return null
    }

    const [ scheme, token ] = authHeader.split(" ")
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null
    }

    return token.trim()
}

const getCookieOptions = (req) => {
    const requestOrigin = normalizeOrigin(req.get("origin") || "")
    const isCrossSite = Boolean(requestOrigin) && !isLocalOrigin(requestOrigin)

    return {
        httpOnly: true,
        secure: isCrossSite,
        sameSite: isCrossSite ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000
    }
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, getCookieOptions(req))


    res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token, getCookieOptions(req))
    res.status(200).json({
        message: "User loggedIn successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies?.token || getBearerToken(req.get("authorization"))

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", getCookieOptions(req))

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}



module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
