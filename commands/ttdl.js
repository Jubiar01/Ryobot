const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "ttdl",
    description: "Download TikTok video from a given URL.",
    prefixRequired: true, // Require a prefix for the command
    adminOnly: false, // Allow all users to access this command
    async execute(api, event, args) {
        // Check if a URL is provided
        if (!args[0]) {
            return api.sendMessage("Please provide a TikTok URL.", event.threadID);
        }

        const tiktokUrl = args[0]; // The TikTok URL from the user's command
        const tempFilePath = path.join(__dirname, 'temp_video.mp4'); // Temporary file path

        try {
            // Make a GET request to the TikTok downloader API
            const response = await axios.get(`https://tiktok-downloader-kas69xtdz-ryoevisu-s-projects.vercel.app/api/download?url=${encodeURIComponent(tiktokUrl)}`);

            // Check if the response is successful
            if (response.data.status) {
                const videoUrl = response.data.video[0]; // Get the video URL from the response
                const title = response.data.title; // Get the video title

                // Download the video and save it to a temporary file
                const videoResponse = await axios({
                    method: 'get',
                    url: videoUrl,
                    responseType: 'stream'
                });

                // Create a writable stream to save the video
                const writer = fs.createWriteStream(tempFilePath);

                // Pipe the response data to the writable stream
                videoResponse.data.pipe(writer);

                // Handle successful write completion
                writer.on('finish', () => {
                    // Send the video as an attachment
                    api.sendMessage({
                        body: `Here is your TikTok video: ${title}`,
                        attachment: fs.createReadStream(tempFilePath),
                    }, event.threadID, (error) => {
                        // Clean up the temporary file after sending
                        fs.unlink(tempFilePath, (unlinkError) => {
                            if (unlinkError) {
                                console.error("Error deleting the temporary file:", unlinkError);
                            }
                        });
                    }, event.messageID);
                });

                // Handle write errors
                writer.on('error', (writeError) => {
                    console.error("Error writing the video file:", writeError);
                    api.sendMessage("An error occurred while saving the video.", event.threadID);
                });
            } else {
                return api.sendMessage("Failed to download the video. Please check the TikTok URL.", event.threadID);
            }
        } catch (error) {
            console.error("Error during the API request:", error);
            return api.sendMessage("An error occurred while processing your request. Please try again later.", event.threadID);
        }
    },
};
