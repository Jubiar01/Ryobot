const axios = require('axios');  // Required for making API requests
const fs = require('fs');        // Required for file system operations
const path = require('path');    // Required for handling file paths
const download = require('download'); // Required for downloading files

module.exports = {
    name: "tiftyletc",
    description: "Download from TikTok, Instagram, Facebook, Twitter, YouTube, or LinkedIn using a URL.",
    prefixRequired: false,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event;
        const url = args[0];

        if (!url) {
            return api.sendMessage("Please provide a URL.", threadID);
        }

        try {
            // Step 1: Notify the user that the request is being processed
            const processingMessage = await api.sendMessage("Processing your request, please wait...", threadID, messageID);

            // Step 2: Call the API to get the download link
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/api/anydl?url=${url}`);
            
            // Check if the API returned a valid result
            if (response.data.status && response.data.result) {
                const downloadUrl = response.data.result;

                // Step 3: Notify the user that the file is being downloaded
                await api.editMessage("Download link retrieved, downloading the file...", processingMessage.messageID);

                // Step 4: Download the file from the provided URL
                const fileName = path.basename(downloadUrl);
                const tempFilePath = path.join(__dirname, fileName);

                await download(downloadUrl, __dirname); // Download the file to the current directory

                // Step 5: Notify the user that the file is being sent
                await api.editMessage("File downloaded successfully, sending the file...", processingMessage.messageID);

                // Step 6: Send the downloaded file to the user
                const fileStream = fs.createReadStream(tempFilePath);
                await api.sendMessage({ 
                    body: `Here is your downloaded file: ${fileName}`, 
                    attachment: fileStream 
                }, threadID);

                // Step 7: Delete the temporary file after sending it
                fs.unlinkSync(tempFilePath);
                
                // Optional: Final message to indicate completion
                await api.editMessage("File sent successfully!", processingMessage.messageID);

            } else {
                await api.editMessage("Failed to retrieve download link. Please check the URL and try again.", processingMessage.messageID);
            }

        } catch (error) {
            console.error("Error occurred:", error);
            await api.sendMessage("An error occurred while processing the request.", threadID);
        }
    },
};
