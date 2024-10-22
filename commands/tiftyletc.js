const axios = require('axios');
const fs = require('fs');
const path = require('path');
const request = require('request');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

module.exports = {
    name: "tiftyletc",
    description: "Download from TikTok, Instagram, Facebook, Twitter, YouTube, and LinkedIn.",
    prefixRequired: true,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const userUrl = args[0]; // Get the user-provided URL

        if (!userUrl) {
            return api.sendMessage("Please provide a valid URL.", threadID, messageID);
        }

        const processingMessage = await api.sendMessage("Processing your download, please wait...", threadID, messageID);

        try {
            // Call the API with the user-provided URL
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/api/anydl?url=${userUrl}`);
            const { status, result } = response.data;

            if (!status) {
                await api.editMessage("Failed to process the provided URL. Please try again later.", processingMessage.messageID);
                return;
            }

            const downloadUrl = result;
            const fileName = `downloaded_file_${Date.now()}.mp4`; // Generate a temporary file name
            const filePath = path.join(__dirname, fileName);

            // Download the file from the result URL
            await new Promise((resolve, reject) => {
                request(downloadUrl)
                    .pipe(fs.createWriteStream(filePath))
                    .on('finish', resolve)
                    .on('error', reject);
            });

            // Determine platform based on the URL and customize the message
            let platform = "file"; // Default to generic file
            if (userUrl.includes('tiktok.com')) platform = "TikTok";
            else if (userUrl.includes('instagram.com')) platform = "Instagram";
            else if (userUrl.includes('facebook.com')) platform = "Facebook";
            else if (userUrl.includes('twitter.com')) platform = "Twitter";
            else if (userUrl.includes('youtube.com')) platform = "YouTube";
            else if (userUrl.includes('linkedin.com')) platform = "LinkedIn";

            // Send the file to the user with the customized Gothic-formatted message
            await api.sendMessage({
                body: convertToGothic(`Here is your downloaded ${platform} file:`),
                attachment: fs.createReadStream(filePath)
            }, threadID);

            // Clean up: Delete the temporary file
            await unlinkAsync(filePath);

            // Edit the processing message to indicate completion
            await api.editMessage(convertToGothic("Download completed successfully!"), processingMessage.messageID);
        } catch (error) {
            console.error(error);
            await api.editMessage("An error occurred while processing your request. Please try again.", processingMessage.messageID);
        }
    },
};
