const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "aimage", // The name of the command
    description: "Generate an AI art image based on a prompt.", // A brief description of what the command does
    prefixRequired: false, // No prefix is required
    adminOnly: false, // The command is not restricted to admin users

    async execute(api, event, args) {
        const prompt = args.join(" "); // Combine arguments into a single prompt
        const { threadID } = event;

        if (!prompt) {
            return api.sendMessage("Please provide a prompt to generate an image.", threadID);
        }

        // Sending a message to inform the user that the image generation is in progress
        const loadingMessage = await api.sendMessage(`Generating art for: "${prompt}"...`, threadID);

        try {
            // Call the API to generate an image based on the user's prompt
            const response = await axios({
                method: 'get',
                url: `https://deku-rest-apis.ooguy.com/api/art?prompt=${encodeURIComponent(prompt)}`,
                responseType: 'arraybuffer' // Ensures that the image is received as binary data
            });

            // Save the image to a temporary file
            const imagePath = path.join(__dirname, 'generated_image.png');
            fs.writeFileSync(imagePath, response.data);

            // Send the generated image to the chat
            await api.sendMessage({
                body: `Here is your AI-generated art for: "${prompt}"`,
                attachment: fs.createReadStream(imagePath)
            }, threadID);

            // Delete the temporary image file after sending
            fs.unlinkSync(imagePath);

        } catch (error) {
            // Handle any errors during the API call
            await api.sendMessage("There was an error generating the image. Please try again later.", threadID);
        } finally {
            // Unsend the loading message after the process is complete
            api.unsendMessage(loadingMessage.messageID);
        }
    },
};
