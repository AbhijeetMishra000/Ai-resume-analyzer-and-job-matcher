const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

function getBearerToken(authHeader = "") {
    if (!authHeader || typeof authHeader !== "string") {
        return null
    }

    const [ scheme, token ] = authHeader.split(" ")
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null
    }

    return token.trim()
}


async function authUser(req, res, next) {

    const token = req.cookies?.token || getBearerToken(req.get("authorization"))

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


module.exports = { authUser }
