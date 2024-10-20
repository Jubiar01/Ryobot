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
            return api.sendMessage(global.convertToGothic("Please provide a TikTok URL."), event.threadID);
        }

        const tiktokUrl = args[0]; // The TikTok URL from the user's command
        const tempFilePath = path.join(__dirname, 'temp_video.mp4'); // Temporary file path

        try {
            // Make a GET request to the new TikTok downloader API
            const response = await axios.get(`https://api.kenliejugarap.com/tikwmbymarjhun/?url=${encodeURIComponent(tiktokUrl)}`);

            // Check if the response is successful
            if (response.data.status && response.data.response === "success") {
                const videoUrl = response.data.hd_play; // Use HD video URL from the response
                const title = response.data.title; // Get the video title

                // Send a message indicating that the video is downloading
                await api.sendMessage(global.convertToGothic("Downloading your TikTok video... Please wait."), event.threadID);

                // Create a promise for the video download
                const downloadVideo = async () => {
                    const videoResponse = await axios({
                        method: 'get',
                        url: videoUrl,
                        responseType: 'stream'
                    });

                    // Create a writable stream to save the video
                    const writer = fs.createWriteStream(tempFilePath);
                    videoResponse.data.pipe(writer);

                    return new Promise((resolve, reject) => {
                        writer.on('finish', () => resolve());
                        writer.on('error', (err) => reject(err));
                    });
                };

                // Execute the download
                try {
                    await downloadVideo();

                    // Send the video as an attachment after successful download
                    await api.sendMessage({
                        body: global.convertToGothic(`Here is your TikTok video: ${title}`),
                        attachment: fs.createReadStream(tempFilePath),
                    }, event.threadID, (error) => {
                        if (error) {
                            console.error("Error sending the video:", error);
                            api.sendMessage(global.convertToGothic("Failed to send the video. Please try again."), event.threadID);
                        } else {
                            // Cleanup the temporary file after sending
                            fs.unlink(tempFilePath, (unlinkError) => {
                                if (unlinkError) {
                                    console.error("Error deleting the temporary file:", unlinkError);
                                }
                            });
                        }
                    }, event.messageID);
                } catch (error) {
                    // Handle download error
                    console.error("Error during the download:", error);
                    api.sendMessage(global.convertToGothic("An error occurred while downloading the video: " + error.message), event.threadID);
                    // Ensure to delete the temporary file if it exists
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlink(tempFilePath, (unlinkError) => {
                            if (unlinkError) {
                                console.error("Error deleting the temporary file:", unlinkError);
                            }
                        });
                    }
                }
            } else {
                return api.sendMessage(global.convertToGothic("Failed to download the video. Please check the TikTok URL."), event.threadID);
            }
        } catch (error) {
            console.error("Error during the API request:", error);
            return api.sendMessage(global.convertToGothic("An error occurred while processing your request. Please try again later."), event.threadID);
        }
    },
};
