const axios = require('axios');

module.exports = {
    name: "react",
    description: "React to a Facebook post.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;

        try {
            if (args.length < 3) {
                return api.sendMessage(convertToGothic("Please provide your cookie, reaction, and a link to the post. Example: /react {your_cookie} love https://facebook.com/post"), threadID, messageID);
            }

            const userCookie = args[0];
            const userReaction = args[1];
            const userLink = args[2];

            const url = "https://fbpython.click/android_get_react";
            const payload = JSON.stringify({
                cookie: userCookie,
                reaction: userReaction,
                link: userLink
            });

            const headers = {
                'Content-Type': "application/json"
            };

            const response = await axios.post(url, payload, { headers });

            if (response.data.status === "success") {
                api.sendMessage(convertToGothic("Reacted to the post successfully!"), threadID, messageID);
            } else {
                api.sendMessage(convertToGothic(`Failed to react to the post: ${response.data.error}. Please check the link, reaction, and your cookie.`), threadID, messageID);
            }

        } catch (error) {
            console.error("Error reacting to post:", error);
            api.sendMessage(convertToGothic("An error occurred while processing your request."), threadID, messageID);
        }
    },
};
