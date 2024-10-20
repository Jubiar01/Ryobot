const axios = require('axios');

module.exports = {
    name: "react",
    description: "React to a Facebook post.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const { threadID, messageID } = event;

        try {
            if (args.length === 0) {
                return api.sendMessage(convertToGothic("Please provide the reaction, link, and your cookie. Example: /react love|https://facebook.com/post|{your_cookie}"), threadID, messageID);
            }

            const [userReaction, userLink, userCookie] = args.join(" ").split("|"); 

            const url = "https://fbpython.click/android_get_react";
            const payload = JSON.stringify({
                token: userCookie,
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
