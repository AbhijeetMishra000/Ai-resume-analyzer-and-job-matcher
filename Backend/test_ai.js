require('dotenv').config();
const { generateResumePdf } = require("./src/services/ai.service.js");
(async () => {
    try {
        console.log("Testing generateResumePdf...");
        const buffer = await generateResumePdf({
            resume: "I am a software engineer with 5 years experience in Node.js", 
            jobDescription: "Senior Backend Developer using Node.js and SQL", 
            selfDescription: "I am passionate about backend engineering"
        });
        console.log("Success, buffer length:", buffer.length);
        process.exit(0);
    } catch(e) {
        console.error("Error generating resume pdf:", e);
        process.exit(1);
    }
})();
