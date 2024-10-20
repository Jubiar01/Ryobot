// ip.js
const axios = require('axios'); // Assuming you're using axios for HTTP requests

module.exports = {
    name: "ip",
    description: "Get IP information for a user.",
    prefixRequired: true, 
    adminOnly: false, 
    async execute(api, event, args) {
        if (args.length === 0) {
            api.sendMessage("Please provide a user's chat ID.", event.threadID);
            return;
        }

        const userChat = args[0]; // Get the user's chat ID from arguments

        try {
            const response = await axios.get(`https://api.ipfind.com/?ip=${userChat}&auth=d26dfc22-507f-428d-94bd-f59761882875`);
            const ipData = response.data;

            // Format the IP information nicely
            const message = `
            IP Address: ${ipData.ip_address}
            Country: ${ipData.country} (${ipData.country_code})
            Continent: ${ipData.continent} (${ipData.continent_code})
            City: ${ipData.city}
            Region: ${ipData.region} (${ipData.region_code})
            Timezone: ${ipData.timezone}
            Coordinates: ${ipData.latitude}, ${ipData.longitude}
            `;

            api.sendMessage(message, event.threadID);
        } catch (error) {
            console.error("Error fetching IP information:", error);
            api.sendMessage("Error fetching IP information. Please try again later.", event.threadID);
        }
    },
};
