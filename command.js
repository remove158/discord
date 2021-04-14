const { prefix } = require("./config.json");

module.exports = (client, aliases, callback) => {
	if (typeof aliases === "string") {
		aliases = [aliases];
	}

	client.on("message", (message) => {
		const { content } = message;
		//return if message comming form bot
		if (message.author.bot) return;

		aliases.forEach((alias) => {
			const command = `${prefix}${alias}`;
			if (content.startsWith(command) || content === command) {
				callback(message);
			}
		});
	});
};
