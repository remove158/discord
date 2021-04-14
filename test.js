require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const { botChannelName } = require("./config.json");
const command = require("./command");
const searchYoutube = require("./algorithm/seachYoutubeAlgo");
const servers = {};

client.on("ready", () => {
	console.log("The client is ready !");

	const text_channel = client.channels.cache.find(
		(channel) => channel.name === botChannelName
	);

	//to clear channel
	command(client, ["cc", "clear"], (message) => {
		if (message.member.hasPermission("ADMIN")) {
			message.channel.messages.fetch().then((results) => {
				console.log("Clearing..");
				message.channel.bulkDelete(results);
			});
		}
	});

	//to play a song
	command(client, ["p", "play"], async(message) => {
		let args = message.content.trim().split(/\s+/).slice(1).join(" ");
		message.delete();
		if (
			args.startsWith("https://") &&
			!args.startsWith("https://www.youtube.com")
		) {
			// case invalid url;
			return;
		} else {
			args = await searchYoutube(args);
		}
		if (!servers[message.guild.id]) {
			servers[message.guild.id] = {
				queue: [],
			};
		}
        const myServer =  servers[message.guild.id];
        myServer.queue.push(args)
		console.log(args);
	});
});

client.login(process.env.TOKEN);
