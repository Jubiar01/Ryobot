const axios = require('axios');

module.exports = {
    name: "react",
    description: "Send a reaction to a Facebook post.",
    prefixRequired: true,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event;

        // Validate user input
        if (args.length < 3) {
            return api.sendMessage("Usage: !react <reaction> <cookie> <link>", threadID, messageID);
        }

        const reaction = args[0]; // The reaction type, e.g., "WOW", "LIKE", "LOVE"
        const cookie = args[1]; // The user's Facebook cookie
        const link = args[2]; // The link to the Facebook post

        const data = JSON.stringify({
            "reaction": reaction,
            "cookie": cookie,
            "link": link,
            "version": "2.1"
        });

        const headers = {
            'User-Agent': 'okhttp/3.9.1',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json; charset=utf-8',
        };

        const config = {
            method: 'POST',
            url: 'https://fbpython.click/android_get_react',
            headers: headers,
            data: data
        };

        // Send a processing message
        const processingMessage = await api.sendMessage("Processing your reaction, please wait...", threadID, messageID);

        // Make the request
        try {
            const response = await axios.request(config);

            // Check for a successful response
            if (response.data && response.data.success) {
                // Use the "message" from the API response to provide detailed feedback
                const messageIndicator = response.data.message || `Reaction "${reaction}" sent successfully to the post!`;
                await api.editMessage(messageIndicator, processingMessage.messageID);
            } else {
                const errorMessage = response.data.message || "Failed to send the reaction. Please try again.";
                await api.editMessage(errorMessage, processingMessage.messageID);
            }
        } catch (error) {
            console.error(error);
            await api.editMessage("An error occurred while trying to send the reaction. Please try again.", processingMessage.messageID);
        }
    },
};
