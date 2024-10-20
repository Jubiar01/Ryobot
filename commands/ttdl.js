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
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 'success') {
                const videoUrl = data.video_url;
                await api.sendMessage("Here's your TikTok video:", event.threadID);
                await api.sendMessage({ attachment: await api.getStreamFromURL(videoUrl) }, event.threadID);
            } else {
                await api.sendMessage("Failed to download the TikTok video. Please check the URL and try again.", event.threadID);
            }
        } catch (error) {
            console.error('Error downloading TikTok video:', error);
            await api.sendMessage("An error occurred while trying to download the TikTok video. Please try again later.", event.threadID);
        }
    },
};
