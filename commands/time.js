module.exports = {
    name: "time", // The name of the command
    description: "Returns the current date, day, and time in Gothic font for the specified timezone (Asia/Manila or USA).", // A brief description of what the command does
    prefixRequired: false, // Set to true if the command requires a prefix
    adminOnly: false, // Set to true if the command is restricted to admin users

    async execute(api, event, args) {
        const { threadID, messageID } = event;

        // List of available timezones
        const availableTimezones = ['manila', 'usa'];

        // Check if the user specified a timezone
        const userTimezoneChoice = args[0] ? args[0].toLowerCase() : null; // Get the first argument (e.g., "manila" or "usa")

        let timeZone;
        let location;

        // Determine the timezone based on user input
        if (userTimezoneChoice === 'manila') {
            timeZone = 'Asia/Manila'; // Philippines time zone
            location = 'Manila, Philippines';
        } else if (userTimezoneChoice === 'usa') {
            timeZone = 'America/New_York'; // USA Eastern Time
            location = 'USA';
        } else {
            // If the user enters an invalid option or no option, send an error message
            const availableOptions = availableTimezones.map(zone => zone.charAt(0).toUpperCase() + zone.slice(1)).join(' or '); // "Manila or USA"
            const errorMessage = `Invalid or missing option. Please use ${availableOptions}.`;

            // Convert error message to Gothic font
            const gothicErrorMessage = global.convertToGothic(errorMessage);

            // Send the error message in Gothic font
            await api.sendMessage(gothicErrorMessage, threadID, messageID);
            return;
        }

        // Get current date in mm/dd/yyyy format for the chosen time zone
        const currentDate = new Date().toLocaleDateString('en-US', { timeZone });

        // Get the current day of the week (e.g., Monday, Tuesday) for the chosen time zone
        const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone });

        // Get the current time in 12-hour format with AM/PM for the chosen time zone
        const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, timeZone });

        // Construct the full message
        const fullMessage = `Current Date: ${currentDate}\nCurrent Day: ${currentDay}\nCurrent Time: ${currentTime}\nLocation: ${location}`;

        // Convert the message to Gothic font
        const gothicMessage = global.convertToGothic(fullMessage);

        // Send the Gothic style message with the selected time zone info
        await api.sendMessage(gothicMessage, threadID, messageID);
    },
};
