const axios = require('axios');
const fs = require('fs');
const path = require('path');

let isProcessing = false;

module.exports = {
    name: "ttdl", // Assuming the command name is 'ttdl'
    description: "Download a TikTok video",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const filePath = path.join(__dirname, 'tiktok_video.mp4');

        // Check if a process is already running
        if (isProcessing) {
            return api.sendMessage(global.convertToGothic("The command is already in use. Please wait until the current process finishes."), threadID, messageID);
        }

        isProcessing = true; // Set processing state to true

        try {
            // Notify user that the video is being downloaded
            await api.sendMessage(global.convertToGothic("Downloading TikTok video. Please wait..."), threadID, messageID);

            const videoUrl = args[0]; // Assuming the TikTok URL is passed as the first argument
            const response = await axios.get(`https://tiktok-downloader-kas69xtdz-ryoevisu-s-projects.vercel.app/api/download?url=${encodeURIComponent(videoUrl)}`);

            // Check if the video URL was successfully retrieved
            if (response.data.status) {
                const videoDownloadLink = response.data.video[0]; // Assuming video is in an array
                const videoTitle = response.data.title;

                // Fetch the video stream
                const videoStream = await axios({
                    url: videoDownloadLink,
                    method: 'GET',
                    responseType: 'stream'
                });

                // Create a writable stream to save the video
                const writer = fs.createWriteStream(filePath);
                videoStream.data.pipe(writer);

                // Wait for the download to finish
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Send the video as an attachment
                await api.sendMessage({
                    body: global.convertToGothic(`Here is the TikTok video: ${videoTitle}`),
                    attachment: fs.createReadStream(filePath)
                }, threadID, messageID);

                // Clean up by deleting the temporary video file
                fs.unlinkSync(filePath);
            } else {
                await api.sendMessage(global.convertToGothic("Failed to fetch TikTok video. Please try again."), threadID, messageID);
            }
        } catch (error) {
            console.error("Error while fetching the TikTok video:", error);
            await api.sendMessage(global.convertToGothic("An error occurred while fetching the TikTok video."), threadID, messageID);
        } finally {
            isProcessing = false; // Reset processing state
        }
    }
};
