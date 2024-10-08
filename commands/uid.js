module.exports = {
    name: "uid",
    description: "Get your user ID.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event) {
        try {
            const { threadID, messageID, senderID } = event;
            if (senderID) {
                await api.sendMessage(global.convertToGothic(`${senderID}`), threadID, messageID);
            }
        } catch {}
    },
};
