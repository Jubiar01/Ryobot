const axios = require('axios'); // Assuming you're using axios for HTTP requests

module.exports = {
  name: "ip",
  description: "Get information about an IP address.",
  prefixRequired: false, 
  adminOnly: false,
  async execute(api, event, args) {
    if (args.length === 0) {
      api.sendMessage("Please provide an IP address.", event.threadID);
      return;
    }

    const ipAddress = args[0]; 
    const url = `https://api.ipfind.com/?ip=${ipAddress}&auth=d26dfc22-507f-428d-94bd-f59761882875`;

    try {
      const response = await axios.get(url);
      const data = response.data;

      // Format the response nicely
      const output = `
IP Address: ${data.ip_address}
Country: ${data.country}
Country Code: ${data.country_code}
Continent: ${data.continent}
Continent Code: ${data.continent_code}
City: ${data.city}
Region: ${data.region}
Region Code: ${data.region_code}
Timezone: ${data.timezone} 
Latitude: ${data.latitude}
Longitude: ${data.longitude}
ASN: ${data.asn}
ASN Organization: ${data.asn_organization}
`;

      api.sendMessage(output, event.threadID);

    } catch (error) {
      console.error("Error fetching IP information:", error);
      api.sendMessage("Error fetching IP information. Please try again later.", event.threadID);
    }
  },
};
