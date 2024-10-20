const axios = require('axios');

module.exports = {
  name: "gemini",
  description: "Get a response from the Gemini AI model.",
  prefixRequired: false,
  adminOnly: false,
  async execute(api, event, args) {
    try {
      const userchat = args.join(" "); // Combine all arguments into a single string
      const response = await axios.get(`https://deku-rest-apis.ooguy.com/gemini?prompt=${encodeURIComponent(userchat)}`);
      const geminiData = response.data; 

      // Send the Gemini response back to the user
      api.sendMessage(geminiData, event.threadID); 
    } catch (error) {
      console.error("Error fetching Gemini data:", error); 
      api.sendMessage("Sorry, there was an error processing your request.", event.threadID);
    }
  },
};
