module = module.exports = (client, aliases, callback) => {
	if (typeof aliases === "string") {
		aliases = [aliases];
	}

	client.on("messageReactionAdd", async (reaction, user) => {
		aliases.forEach((alias) => {
			if (
				!user.bot &&
				reaction.emoji.name === alias &&
				reaction.message.embeds[0]?.description
			) {
				callback(reaction, user);
			}
		});
	});
	client.on("messageReactionRemove", async (reaction, user) => {
		aliases.forEach((alias) => {
			if (
				!user.bot &&
				reaction.emoji.name === alias &&
				reaction.message.embeds[0]?.description
			) {
				reaction.message.delete();
				callback(reaction, user);
			}
		});
	});
};
