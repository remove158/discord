require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const { botChannelName } = require("./config.json");
const command = require("./command");
const reaction = require("./reaction");
const searchYoutube = require("./algorithm/seachYoutubeAlgo");
const servers = {};
const playTheSong = require("./algorithm/playMusicAlgo");
client.on("ready", () => {
	console.log("The client is ready !");

	//to clear channel
	command(client, ["cc", "clear"], (message) => {
		if (message.member.hasPermission("ADMIN")) {
			message.channel.messages.fetch().then((results) => {
				message.channel.bulkDelete(results);
			});
		}
        message.channel.send(`
        ================= CONSOLE =================

        ** -p <url/name> ** - to play the song !
        ** -help ** - to show command 
        ** -cc ** - to clear the chat (only admin)
        ** -skip ** - to skip playing song . 
        ** react ⏯️** - to the song for play this song now !
        ** react ⏹️** - to the song for skip playing song !

================= END CONSOLE =================
        `);
	});

	command(client, ["help"], (message) => {
		message.delete();
		message.channel.send(`
        ================= CONSOLE =================

        ** -p <url/name> ** - to play the song !
        ** -help ** - to show command 
        ** -cc ** - to clear the chat (only admin)
        ** -skip ** - to skip playing song . 
        ** react ⏯️** - to the song for play this song now !
        ** react ⏹️** - to the song for skip playing song !

================= END CONSOLE =================
        `);
		client.user.setPresence({
			activity: {
				name: `"-help" for help`,
			},
		});
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
		if (myServer.queue.length === 1) {
			message.member.voice.channel.join().then(function (connection) {
				playTheSong(myServer, connection);
			});
		}

		if (!message.guild.voice || !message.guild.voice.connection) {
			message.member.voice.channel.join().then(function (connection) {
				playTheSong(myServer, connection);
			});
		}
		const emb = new Discord.MessageEmbed();
		const info = await ytdl.getInfo(url);

		emb.setTitle(`เพิ่มเพลงเข้าคิว`)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` +
					"\n\n" +
					`queue by ${message.member}`
			)
			.addField("tips", "-p url\n-play url");
            message.channel.send(emb).then((message) => {
			message.react("⏯️");
			message.react("⏹️");
		});
	});

	command(client, ["skip"], async (message) => {
        message.delete()
		const myServer = servers[message.guild.id];
		myServer.dispatcher.end();
    });

	// handle user reaction
	reaction(client, ["⏹️"], (react, user) => {
		const myServer = servers[react.message.guild.id];
		myServer.dispatcher.end();
	});

	reaction(client, ["⏯️"], async (react, user) => {
		react.message.delete();
		const myServer = servers[react.message.guild.id];
		const txt = react.message.embeds[0].description;
		const start = txt.indexOf("https://");
		const stop = txt.indexOf(" ", start);
		let url = txt.slice(start, stop);
		url = url.trim().trim(")");
		const info = await ytdl.getInfo(url);
		const embed = new Discord.MessageEmbed()
			.setTitle(`เล่นเพลงอีกครั้ง`)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` +
					"\n\n" +
					`replay by ${user}`
			)
			.addField("tips", "-p url\n-play url");

		react.message.channel.send(embed).then((message) => {
			message.react("⏯️");
			message.react("⏹️");
		});
		myServer.queue = [url];
		react.message.guild.members.cache
			.get(user.id)
			.voice.channel.join()
			.then(function (connection) {
				playTheSong(myServer, connection);
			});
	});
});

client.login(process.env.TOKEN);
