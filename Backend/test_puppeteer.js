const puppeteer = require('puppeteer');
(async () => {
    try {
        process.env.PUPPETEER_CACHE_DIR = "./.cache/puppeteer"
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
        console.log("Executable Path:", executablePath);
        const browser = await puppeteer.launch({
            executablePath,
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        console.log("Browser launched successfully!");
        await browser.close();
    } catch (err) {
        console.error("Error launching browser:", err);
    }
})();
