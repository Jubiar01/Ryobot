const axios = require('axios');
const fs = require('fs');
const path = require('path');

let isProcessing = false;

module.exports = {
    name: "shoti",
    description: "Send a random Shoti video",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const filePath = path.join(__dirname, 'shoti.mp4');

        if (isProcessing) {
            return api.sendMessage(global.convertToGothic("The command is already in use. Please wait until the current process finishes."), threadID, messageID);
        }

        isProcessing = true;

        try {
            // Send initial message indicating the download process
            const initialMessage = await api.sendMessage(global.convertToGothic("Downloading random Shoti video. Please wait..."), threadID, messageID);
            
            const response = await axios.get('https://shoti.kenliejugarap.com/getvideo.php?apikey=shoti-0763839a3b9de35ae3da73816d087d57d1bbae9f8997d9ebd0da823850fb80917e69d239a7f7db34b4d139a5e3b02658ed26f49928e5ab40f57c9798c9ae7290c536d8378ea8b01399723aaf35f62fae7c58d08f04');

            if (response.data.status) {
                const videoUrl = response.data.videoDownloadLink;
                const videoTitle = response.data.title;

                // Stream the video data and save to the file
                const videoStream = await axios({
                    url: videoUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(filePath);
                videoStream.data.pipe(writer);

                // Wait for the file to finish writing
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Edit the initial message with the video once the download is complete
                await api.editMessage({
                    body: global.convertToGothic(`Here is the Shoti video: ${videoTitle}`),
                    attachment: fs.createReadStream(filePath)
                }, threadID, initialMessage.messageID);

                // Remove the video file after sending
                fs.unlinkSync(filePath);
            } else {
                // If fetching the video failed, edit the initial message with the error
                await api.editMessage(global.convertToGothic("Failed to fetch Shoti video. Please try again."), threadID, initialMessage.messageID);
            }
        } catch (error) {
            console.error(error);
            // If an error occurs, edit the initial message with the error message
            await api.editMessage(global.convertToGothic("An error occurred while fetching the Shoti video."), threadID, initialMessage.messageID);
        } finally {
            // Reset the processing flag
            isProcessing = false;
        }
    }
};
