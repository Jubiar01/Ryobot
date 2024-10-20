const axios = require('axios');

module.exports = {
  name: "ip",
  description: "Get information about an IP address.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    try {
      // Get the IP address from the command arguments. If no IP address is provided, use the user's IP address.
      const ipAddress = args[0] || event.senderID; 

      // Make a request to the IPFind API.
      const response = await axios.get(`https://api.ipfind.com/?ip=${ipAddress}&auth=d26dfc22-507f-428d-94bd-f59761882875`);
      const data = response.data;

      // Check if the API returned an error
      if (data.error) {
        api.sendMessage(`Error: ${data.error}`, event.threadID, event.messageID);
        return;
      }

      // Format the API response.
      let message = `IP Address: ${data.ip_address}\n`;
      message += `Country: ${data.country}\n`;
      message += `Country Code: ${data.country_code}\n`;
      message += `City: ${data.city}\n`;
      message += `Continent: ${data.continent}\n`;
      message += `Latitude: ${data.latitude}\n`;
      message += `Longitude: ${data.longitude}\n`;
      message += `Time Zone: ${data.time_zone}\n`;
      message += `Currency: ${data.currency}\n`;
      message += `ASN: ${data.asn}\n`;
      message += `Organization: ${data.organization}\n`;

      // Send the formatted message to the user.
      api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while fetching IP information.", event.threadID, event.messageID);
    }
  },
};
