const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "tiftyletc", // The name of the command
    description: "Download content from TikTok, Instagram, Facebook, Twitter, YouTube, and LinkedIn.", // A brief description of the command
    prefixRequired: false, // Set to false to allow it to be triggered without a prefix
    adminOnly: false, // Set to false, so anyone can use the command

    async execute(api, event, args) {
        const { threadID } = event;
        const userUrl = args[0]; // The URL to download from

        if (!userUrl) {
            return api.sendMessage("Please provide a URL to download.", threadID);
        }

        try {
            // Fetch download link from API
            const response = await axios.get(`https://deku-rest-apis.ooguy.com/api/anydl?url=${encodeURIComponent(userUrl)}`);
            const { result, status } = response.data;

            if (status && result) {
                // Create a temp file to store the download
                const tempFilePath = path.join(__dirname, 'temp.mp4');
                
                // Download file and store it temporarily
                const downloadStream = await axios({
                    method: 'get',
                    url: result,
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(tempFilePath);
                downloadStream.data.pipe(writer);

                writer.on('finish', async () => {
                    // Send the file to the user
                    await api.sendMessage({
                        body: "Here is your downloaded file:",
                        attachment: fs.createReadStream(tempFilePath)
                    }, threadID);

                    // Delete the temp file after sending it
                    fs.unlink(tempFilePath, (err) => {
                        if (err) console.error("Failed to delete the temporary file.", err);
                    });
                });

                writer.on('error', (err) => {
                    console.error("Error writing the file.", err);
                    api.sendMessage("There was an error downloading the file.", threadID);
                });
            } else {
                api.sendMessage("Failed to retrieve the download link. Please check the URL and try again.", threadID);
            }
        } catch (error) {
            console.error("Error occurred while fetching the download link: ", error);
            api.sendMessage("An error occurred while processing the request.", threadID);
        }
    },
};
