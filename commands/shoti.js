const axios = require('axios');
const fs = require('fs');
const path = require('path');

let isProcessing = false;
let messageToEdit = null;

module.exports = {
    name: "shoti",
    description: "Send a random Shoti video",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const filePath = path.join(__dirname, 'shoti.mp4');

        if (isProcessing) {
            // If processing, edit the previous message instead of sending a new one
            return api.editMessage(global.convertToGothic("The command is already in use. Please wait until the current process finishes."), messageToEdit);
        }

        isProcessing = true;

        try {
            // Send the initial message and store its messageID for potential editing
            const sentMessage = await api.sendMessage(global.convertToGothic("Downloading random Shoti video. Please wait..."), threadID, messageID);
            messageToEdit = sentMessage.messageID;

            // Simulating video download or processing (you can replace this with actual logic)
            const videoExists = fs.existsSync(filePath);
            if (!videoExists) {
                throw new Error("Video file not found");
            }

            const attachment = fs.createReadStream(filePath);

            // Send video to the thread
            await api.sendMessage({ attachment }, threadID);

            // Edit the message after video is sent
            await api.editMessage(global.convertToGothic("Here is your random Shoti video!"), messageToEdit);

        } catch (error) {
            console.error("Error sending video:", error);
            await api.editMessage(global.convertToGothic("Failed to send video. Please try again later."), messageToEdit);
        } finally {
            isProcessing = false;
        }
    }
};
