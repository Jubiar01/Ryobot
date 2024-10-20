const axios = require('axios');

module.exports = {
    name: "gemini",
    description: "Talk to Gemini AI.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        try {
            const userchat = args.join(" ");
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/gemini?prompt=${userchat}`);
            const geminiResponse = response.data.gemini;

            api.sendMessage(geminiResponse, event.threadID);
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            api.sendMessage("Sorry, there was an error processing your request.", event.threadID);
        }
    },
};
