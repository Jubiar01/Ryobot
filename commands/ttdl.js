const axios = require('axios');

module.exports = {
    name: "ttdl",
    description: "Download a TikTok video by providing its URL.",
    prefixRequired: true,
    adminOnly: false,
    async execute(api, event, args) {
        if (args.length === 0) {
            await api.sendMessage("Please provide a TikTok video URL.", event.threadID);
            return;
        }

        const tiktokUrl = args[0];
        const apiUrl = `https://tiktok-downloader-kas69xtdz-ryoevisu-s-projects.vercel.app/api/download?url=${encodeURIComponent(tiktokUrl)}`;

        try {
            const response = await axios.get(apiUrl, { timeout: 10000 }); // 10 second timeout
            const data = response.data;

            if (data.status === 'success' && data.video_url) {
                await api.sendMessage("Downloading your TikTok video. This may take a moment...", event.threadID);
                try {
                    await api.sendMessage({ attachment: await api.getStreamFromURL(data.video_url) }, event.threadID);
                } catch (streamError) {
                    console.error('Error streaming video:', streamError);
                    await api.sendMessage("The video was found, but there was an error while sending it. The video might be too large or temporarily unavailable.", event.threadID);
                }
            } else if (data.status === 'error') {
                await api.sendMessage(`Failed to download the TikTok video: ${data.message || 'Unknown error'}`, event.threadID);
            } else {
                await api.sendMessage("The API response was in an unexpected format. Please try again later or contact the bot administrator.", event.threadID);
            }
        } catch (error) {
            console.error('Error downloading TikTok video:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                await api.sendMessage(`Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}. Please check the URL and try again.`, event.threadID);
            } else if (error.request) {
                // The request was made but no response was received
                await api.sendMessage("No response received from the server. The service might be down or experiencing issues. Please try again later.", event.threadID);
            } else if (error.code === 'ECONNABORTED') {
                // Timeout error
                await api.sendMessage("The request timed out. The server might be overloaded. Please try again later.", event.threadID);
            } else {
                // Something happened in setting up the request that triggered an Error
                await api.sendMessage("An unexpected error occurred. Please try again later or contact the bot administrator.", event.threadID);
            }
        }
    },
};
