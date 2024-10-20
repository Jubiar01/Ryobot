const axios = require('axios');

module.exports = {
    name: "llama",
    description: "Ask LLaMA a question.",
    prefixRequired: false,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event; 
        const userPrompt = args.join(" ");
        const generateUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const uid = generateUID();

        const sentMessage = await api.sendMessage(convertToGothic("Finding results...."), threadID, messageID); // Send initial message

        try {
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/ai/llama-3-8b?q=${userPrompt}&uid=${uid}`);

            if (response.data.status) {
                const llamaResponse = response.data.result;
                await api.editMessage(convertToGothic(llamaResponse), sentMessage.messageID); // Edit the message with the response
            } else {
                await api.editMessage(convertToGothic("Error: Could not get a response from LLaMA."), sentMessage.messageID);
            }
        } catch (error) {
            console.error("Error fetching response from LLaMA API:", error);
            await api.editMessage(convertToGothic("Error: An error occurred while processing your request."), sentMessage.messageID);
        }
    },
};
