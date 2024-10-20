const axios = require('axios');

module.exports = {
    name: "gemini",
    description: "Talk to Gemini AI.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        try {
            const userchat = args.join(" ");

            // Notify the user that Gemini is finding an answer
            api.sendMessage(global.convertGothic("Gemini is finding an answer..."), event.threadID);

            const response = await axios.get(`https://deku-rest-apis.ooguy.com/gemini?prompt=${userchat}`);
            let geminiResponse = response.data.gemini;

            // Remove '*' and '**' characters from the response
            geminiResponse = geminiResponse.replace(/\*+/g, ''); 

            // Apply the Gothic font to the response
            api.sendMessage(global.convertGothic(geminiResponse), event.threadID); 
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            api.sendMessage(global.convertGothic("Sorry, there was an error processing your request."), event.threadID);
        }
    },
};
