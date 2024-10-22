const axios = require('axios');

module.exports = {
    name: "react",
    description: "Send a reaction to a Facebook post using the format: !react <reaction>|<cookie>|<facebook-post-link>",
    prefixRequired: true,
    adminOnly: false,

    async execute(api, event, args) {
        const { threadID, messageID } = event;

        // Combine args and split by "|" to extract reaction, cookie, and link
        const input = args.join(" ").split("|");

        // Validate if all required arguments are provided
        if (input.length !== 3) {
            return api.sendMessage("Usage: !react <reaction>|<cookie>|<facebook-post-link>", threadID, messageID);
        }

        const reaction = input[0].trim();  // The reaction type (e.g., "WOW", "LIKE", "LOVE")
        const cookie = input[1].trim();    // The user's Facebook cookie
        const link = input[2].trim();      // The link to the Facebook post

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
                const messageIndicator = response.data.message || `Reaction "${reaction}" sent successfully to the post!`;
                await api.editMessage(messageIndicator, processingMessage.messageID);
            } else {
                // Handle invalid reaction type message
                if (response.data.message === "Invalid reaction type!") {
                    const availableReactionsMessage = "Here's the available reactions: WOW, LOVE, SAD, CARE, HAHA, ANGRY";
                    await api.editMessage(availableReactionsMessage, processingMessage.messageID);
                }
                // Handle cooldown message
                else if (response.data.message && response.data.message.includes("You're currently in cooldown phase")) {
                    const minutes = parseInt(response.data.message.match(/(\d+) minute/)[1], 10); // Extract cooldown time in minutes

                    await api.editMessage(`You are in cooldown for ${minutes} minute(s). I will notify you when the cooldown is over.`, processingMessage.messageID);

                    // Wait for the cooldown period to end
                    setTimeout(async () => {
                        await api.sendMessage(`Your cooldown has ended. You can try submitting the reaction again.`, threadID, messageID);
                    }, minutes * 60 * 1000); // Convert minutes to milliseconds
                } else {
                    // Handle other failure messages
                    const errorMessage = response.data.message || "Failed to send the reaction. Please try again.";
                    await api.editMessage(errorMessage, processingMessage.messageID);
                }
            }
        } catch (error) {
            console.error(error);
            await api.editMessage("An error occurred while trying to send the reaction. Please try again.", processingMessage.messageID);
        }
    },
};
