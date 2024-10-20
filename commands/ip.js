const axios = require('axios');

module.exports = {
    name: "ip",
    description: "Get IP information of a user.",
    prefixRequired: false,
    adminOnly: false,
    async execute(api, event, args) {
        const userChat = event.senderID; // Get the user's chat ID
        const apiUrl = `https://api.ipfind.com/?ip=${userChat}&auth=d26dfc22-507f-428d-94bd-f59761882875`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                api.sendMessage(`Error: ${data.error_message}`, event.threadID);
            } else {
                // Format the IP information nicely
                const ipInfo = `
                    IP Address: ${data.ip_address}
                    Country: ${data.country}
                    City: ${data.city}
                    Region: ${data.region}
                    Timezone: ${data.timezone}
                `;
                api.sendMessage(ipInfo, event.threadID);
            }
        } catch (error) {
            console.error("Error fetching IP information:", error);
            api.sendMessage("An error occurred while fetching IP information.", event.threadID);
        }
    },
};
