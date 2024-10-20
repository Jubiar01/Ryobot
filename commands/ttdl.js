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
        const timeoutDuration = 30000; // Set timeout duration (e.g., 30 seconds)

        try {
            // Make a GET request to the new TikTok downloader API
            const response = await axios.get(`https://api.kenliejugarap.com/tikwmbymarjhun/?url=${encodeURIComponent(tiktokUrl)}`);

            // Check if the response is successful
            if (response.data.status && response.data.response === "success") {
                const videoUrl = response.data.hd_play; // Use HD video URL from the response
                const title = response.data.title; // Get the video title

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

                // Create a timeout promise
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error("Download timed out."));
                    }, timeoutDuration);
                });

                // Race between download and timeout
                try {
                    await Promise.race([downloadVideo(), timeoutPromise]);

                    // Send the video as an attachment after successful download
                    api.sendMessage({
                        body: `Here is your TikTok video: ${title}`,
                        attachment: fs.createReadStream(tempFilePath),
                    }, event.threadID, (error) => {
                        if (error) {
                            console.error("Error sending the video:", error);
                            api.sendMessage("Failed to send the video. Please try again.", event.threadID);
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
                    // Handle timeout or download error
                    console.error("Error during the download:", error);
                    api.sendMessage("An error occurred while downloading the video: " + error.message, event.threadID);
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
                return api.sendMessage("Failed to download the video. Please check the TikTok URL.", event.threadID);
            }
        } catch (error) {
            console.error("Error during the API request:", error);
            return api.sendMessage("An error occurred while processing your request. Please try again later.", event.threadID);
        }
    },
};
