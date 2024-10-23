const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "hentaigen", // The name of the command
    description: "Fetch a list of hentai videos, let the user choose, and download the selected video.", // A brief description of the command
    prefixRequired: false, // No prefix is required
    adminOnly: false, // The command is not restricted to admin users

    async execute(api, event, args) {
        const { threadID, senderID } = event;
        
        // Step 1: Fetch the random hentai videos from the API
        try {
            const response = await axios.get('https://deku-rest-apis.ooguy.com/api/randhntai');
            const result = response.data.result;

            if (!result || result.length === 0) {
                await api.sendMessage("No hentai videos found. Please try again later.", threadID);
                return;
            }

            // Step 2: Create a list of video options
            let videoList = "Select a hentai video to download:\n\n";
            result.forEach((video, index) => {
                videoList += `${index + 1}. ${video.title} (${video.category})\nViews: ${video.views_count}\n\n`;
            });
            videoList += "Please reply with the number of the video you want to download.";

            // Step 3: Send the list of videos to the user
            await api.sendMessage(videoList, threadID);

            // Step 4: Wait for the user’s selection
            const handleMessageResponse = async (responseEvent) => {
                if (responseEvent.senderID !== senderID) return; // Make sure only the original user can respond
                const choice = parseInt(responseEvent.body);

                if (isNaN(choice) || choice < 1 || choice > result.length) {
                    await api.sendMessage("Invalid selection. Please try again.", threadID);
                    return;
                }

                const selectedVideo = result[choice - 1]; // Get the selected video
                const videoUrl = selectedVideo.video_1 || selectedVideo.video_2; // Use the first available video link
                const videoFileName = `${selectedVideo.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`; // Sanitize file name

                // Step 5: Download the video and store it temporarily
                const videoPath = path.join(__dirname, videoFileName);
                const videoResponse = await axios({
                    method: 'get',
                    url: videoUrl,
                    responseType: 'stream', // Stream the video content
                });

                const writer = fs.createWriteStream(videoPath);
                videoResponse.data.pipe(writer);

                // Wait for the video to be written completely
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                // Step 6: Send the video and metadata to the user
                const metadataMessage = `🎥 *Title*: ${selectedVideo.title}
📂 *Category*: ${selectedVideo.category}
👀 *Views*: ${selectedVideo.views_count}
🔗 *Original Link*: ${selectedVideo.link}`;

                await api.sendMessage({
                    body: metadataMessage,
                    attachment: fs.createReadStream(videoPath),
                }, threadID);

                // Clean up the temporary video file
                fs.unlinkSync(videoPath);
            };

            // Register the listener for user response
            api.listenMqtt((responseEvent) => handleMessageResponse(responseEvent));

        } catch (error) {
            // Handle any errors during the process
            await api.sendMessage("An error occurred while fetching or downloading the video. Please try again later.", threadID);
        }
    },
};
