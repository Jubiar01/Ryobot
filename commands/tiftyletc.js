const axios = require('axios'); // Importing axios for making HTTP requests
const fs = require('fs'); // Importing fs to handle file operations
const path = require('path'); // Importing path for file paths
const request = require('request'); // For downloading files

module.exports = {
    name: "tiftyletc",
    description: "Download media from TikTok, Instagram, Facebook, Twitter, YouTube, and LinkedIn.",
    prefixRequired: false,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const userProvidedUrl = args[0]; // The URL provided by the user

        if (!userProvidedUrl) {
            return api.sendMessage("Please provide a URL to download from TikTok, Instagram, Facebook, Twitter, YouTube, or LinkedIn.", threadID, messageID);
        }

        // Inform the user the download is being processed
        const processingMessage = await api.sendMessage("Processing your request, please wait...", threadID, messageID);

        try {
            // Making a request to the API with the user-provided URL
            const apiUrl = `https://deku-rest-apis.ooguy.com/api/anydl?url=${userProvidedUrl}`;
            const response = await axios.get(apiUrl);
            const result = response.data;

            if (result.status && result.result) {
                const downloadUrl = result.result; // The download link provided by the API
                const filename = `download_${Date.now()}.mp4`; // Temporary file name for the download

                // Download the file and store it temporarily
                const filePath = path.join(__dirname, filename);
                const fileStream = fs.createWriteStream(filePath);

                request(downloadUrl).pipe(fileStream).on('close', async () => {
                    // Send the file to the user
                    await api.sendMessage({body: "Here is your downloaded file.", attachment: fs.createReadStream(filePath)}, threadID);

                    // Clean up the temporary file
                    fs.unlinkSync(filePath);

                    // Edit the processing message to indicate completion
                    await api.editMessage("Your file has been downloaded and sent successfully.", processingMessage.messageID);
                });

            } else {
                // If there was an error or no valid download link
                await api.editMessage("Failed to download. The URL may not be supported.", processingMessage.messageID);
            }

        } catch (error) {
            // Handle errors in case the API request fails
            await api.editMessage("An error occurred while processing your request. Please try again later.", processingMessage.messageID);
            console.error(error);
        }
    },
};
              
