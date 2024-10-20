const axios = require('axios'); // Importing the axios library for making HTTP requests

module.exports = {
    name: "llama",
    description: "Ask LLaMA a question.",
    prefixRequired: false,
    adminOnly: false,

    async execute(api, event, args) {
        const userPrompt = args.join(" "); // Combine all arguments into a single string
        const generateUID = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Function to generate a unique ID
        const uid = generateUID();

        try {
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/ai/llama-3-8b?q=${userPrompt}&uid=${uid}`);
            
            if (response.data.status) {
                const llamaResponse = response.data.result; 
                api.sendMessage(convertToGothic(llamaResponse), event.threadID); // Send the formatted response
            } else {
                api.sendMessage(convertToGothic("Error: Could not get a response from LLaMA."), event.threadID);
            }
        } catch (error) {
            console.error("Error fetching response from LLaMA API:", error);
            api.sendMessage(convertToGothic("Error: An error occurred while processing your request."), event.threadID);
        }
    },
};
