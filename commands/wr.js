const axios = require('axios');

// wr.js
module.exports = {
  name: "wr",
  description: "Get Mobile Legends winrate data.",
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
      const response = await fetch(`https://api.kenliejugarap.com/mobilelegends/?userid=${userId}&zoneid=${zoneId}`);
      const data = await response.json();

      if (data.error) {
        api.sendMessage(data.error, event.threadID);
      } else {
        const winRate = (data.winrate * 100).toFixed(2);
        api.sendMessage(`Win Rate for User ID ${userId} (Zone ID ${zoneId}): ${winRate}%`, event.threadID);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      api.sendMessage("An error occurred while fetching data.", event.threadID);
    }
  },
};
