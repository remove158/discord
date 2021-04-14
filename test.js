require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();

const { botChannelName } = require("./config.json");
const command = require("./command");
const reaction = require('./reaction')
const searchYoutube = require("./algorithm/seachYoutubeAlgo");
const servers = {};
const playTheSong = require("./algorithm/playMusicAlgo");
client.on("ready", () => {
	console.log("The client is ready !");

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
	command(client, ["p", "play"], async (message) => {
		let args = message.content.trim().split(/\s+/).slice(1).join(" ");
		message.delete();
		const url = await searchYoutube(args);
		if (!url) return;
		if (!servers[message.guild.id]) {
			servers[message.guild.id] = {
				queue: [],
			};
		}
		const myServer = servers[message.guild.id];
		myServer.queue.push(url);
		if (!message.guild.voice || !message.guild.voice.connection) {
			message.member.voice.channel.join().then(function (connection) {
				playTheSong(myServer, connection);
			});
		}
	});

    // handle user reaction
    reaction(client , ["🔂"] , (react,user)=> {

    })

});

client.login(process.env.TOKEN);
