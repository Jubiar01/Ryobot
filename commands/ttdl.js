const axios = require('axios'); // Ensure axios is installed for making HTTP requests

module.exports = {
    name: "ttdl",
    description: "Download TikTok video from a given URL.",
    prefixRequired: true, // You might want a prefix for this command
    adminOnly: false, // Allow all users to access this command
    async execute(api, event, args) {
        // Check if a URL is provided
        if (!args[0]) {
            return api.sendMessage("Please provide a TikTok URL.", event.threadID);
        }

        const tiktokUrl = args[0]; // The TikTok URL from the user's command

        try {
            // Make a GET request to the TikTok downloader API
            const response = await axios.get(`https://tiktok-downloader-kas69xtdz-ryoevisu-s-projects.vercel.app/api/download?url=${encodeURIComponent(tiktokUrl)}`);

            // Check if the response is successful
            if (response.data.status) {
                const videoUrl = response.data.video[0]; // Get the video URL from the response
                const title = response.data.title; // Get the video title

                // Send the video as an attachment
                return api.sendMessage({
                    body: `Here is your TikTok video: ${title}`,
                    attachment: await axios.get(videoUrl, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data)),
                }, event.threadID, event.messageID);
            } else {
                return api.sendMessage("Failed to download the video. Please check the TikTok URL.", event.threadID);
            }
        } catch (error) {
            console.error(error);
            return api.sendMessage("An error occurred while processing your request.", event.threadID);
        }
    },
};
