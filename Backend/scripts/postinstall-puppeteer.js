const fs = require("fs")
const { spawnSync } = require("child_process")

const pathExists = (filePath) => {
    if (!filePath) {
        return false
    }
    try {
        return fs.existsSync(filePath)
    } catch {
        return false
    }
}

const resolveExecutablePath = () => {
    if (pathExists(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH
    }

    try {
        const puppeteer = require("puppeteer")
        const executablePath = puppeteer.executablePath()
        return pathExists(executablePath) ? executablePath : null
    } catch {
        return null
    }
}

const existingExecutable = resolveExecutablePath()

if (existingExecutable) {
    console.log(`[postinstall] Puppeteer browser already available: ${existingExecutable}`)
    process.exit(0)
}

console.log("[postinstall] Installing Chrome for Puppeteer...")

const command = process.platform === "win32" ? "npx.cmd" : "npx"
const args = [ "puppeteer", "browsers", "install", "chrome", "--path", "./.cache/puppeteer" ]
const result = spawnSync(command, args, { stdio: "inherit" })

if (result.status === 0) {
    const installedExecutable = resolveExecutablePath()
    if (installedExecutable) {
        console.log(`[postinstall] Puppeteer browser installed: ${installedExecutable}`)
    } else {
        console.log("[postinstall] Puppeteer install finished.")
    }
    process.exit(0)
}

console.warn("[postinstall] Chrome download failed, but install will continue.")
console.warn("[postinstall] PDF generation requires a browser binary.")
console.warn("[postinstall] If needed, set PUPPETEER_EXECUTABLE_PATH in Backend/.env.")
process.exit(0)
