const axios = require('axios');

module.exports = {
    name: "gemini",
    description: "Talk to Gemini AI.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        try {
            const userchat = args.join(" ");

            // Notify the user that Gemini is finding an answer
            const sentMessage = await api.sendMessage(convertToGothic("Gemini is finding an answer..."), threadID, messageID);

            const response = await axios.get(`https://deku-rest-apis.ooguy.com/gemini?prompt=${userchat}`);
            let geminiResponse = response.data.gemini;

            // Remove '*' and '**' characters from the response
            geminiResponse = geminiResponse.replace(/\*+/g, '');

            // Apply the Gothic font to the response and edit the original message
            await api.editMessage(convertToGothic(geminiResponse), sentMessage.messageID);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            await api.editMessage(convertToGothic("Sorry, there was an error processing your request."), sentMessage.messageID);
        }
    },
};
