const { prefix } = require("../config.json");

module.exports = (client, aliases, callback) => {
	if (typeof aliases === "string") {
		aliases = [aliases];
	}

	client.on("message", (message) => {
		const { content } = message;
		//return if message comming form bot
        console.log(message.channel.id);
		aliases.forEach((alias) => {
			const command = `${prefix}${alias}`;
            const cs = content.split(" ");
            console.log(cs);
			if (cs[0] === command || content === command) {
				callback(message);
			}
		});
	});
};
