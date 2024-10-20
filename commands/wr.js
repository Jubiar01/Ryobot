const axios = require('axios');

// wr.js
module.exports = {
  name: "wr",
  description: "Get Mobile Legends username.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    if (args.length < 2) {
      api.sendMessage("Please provide User ID and Zone ID. Example: !wr 123456789 123", event.threadID);
      return;
    }

    const userId = args[0];
    const zoneId = args[1];

    try {
      const response = await axios.get(`https://api.kenliejugarap.com/mobilelegends/?userid=${userId}&zoneid=${zoneId}`);
      const data = response.data;

      if (data.error) {
        api.sendMessage(data.error, event.threadID);
      } else {
        const username = data.username;
        api.sendMessage(`Username for User ID ${userId} (Zone ID ${zoneId}): ${username}`, event.threadID);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      api.sendMessage("An error occurred while fetching data.", event.threadID);
    }
  },
};
