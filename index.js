require("dotenv").config();
const Discord = require("discord.js");
const client = new Discord.Client();
const ytdl = require("ytdl-core");

const handles = require("./handles/");
const searchYoutube = require("./algorithm/seachYoutubeAlgo");
const Messages = require("./models/Messages");
const servers = {};
const playTheSong = require("./algorithm/playMusicAlgo");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
var channel;
client.on("ready", () => {
	console.log("The client is ready !");
	channel = client.channels.cache.find(
		(channel) => channel.name === "osm-bot"
	);

	//to clear channel
	handles.command(client, ["cc", "clear"], (message) => {
		if (message.member.hasPermission("ADMIN")) {
			message.channel.messages.fetch().then((results) => {
				message.channel.bulkDelete(results);
			});
		}
		message.channel.send(Messages.helpMessage);
	});
    
	command(client, ["help"], (message) => {
		message.delete();
		message.channel.send(Messages.helpMessage);
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
		if (!servers[message.guild.id]?.queue) {
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
				myServer.connection = connection;
				playTheSong(myServer, connection);
			});
		}

		message.channel.send(Messages.playSongMessage(url)).then((message) => {
			message.react("⏯️");
			message.react("⏹️");
		});
	});

	command(client, ["skip"], async (message) => {
		message.delete();
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

		react.message.channel
			.send(Messages.playSongMessage(url, "React"))
			.then((message) => {
				message.react("⏯️");
				message.react("⏹️");
			});
		myServer.queue = [url];
		react.message.guild.members.cache
			.get(user.id)
			.voice.channel.join()
			.then(function (connection) {
				myServer.connection = connection;
				playTheSong(myServer, connection);
			});
	});
});

client.login(process.env.TOKEN);

app.post("/actions", async (req, res, next) => {
	const cmd = req.body.msg;
	if (cmd.startsWith("เปิดเพลง") || cmd.startsWith("play")) {
		const myServer = servers["552497873116463107"];
		const url = await searchYoutube(cmd);
		if (!url) return;

		myServer.queue.push(url);
		myServer.dispatcher.end();

		playTheSong(myServer, myServer.connection);

		channel
			.send(await Messages.playSongMessage(url, "React"))
			.then((message) => {
				message.react("⏯️");
				message.react("⏹️");
			});
	} else if (
		cmd.startsWith("ปิดเพลง") ||
		cmd.startsWith("เปลี่ยนเพลง") ||
		cmd.startsWith("หยุด")
	) {
		const myServer = servers["552497873116463107"];
		myServer.dispatcher.end();
	} else if (cmd.startsWith("เพิ่มเพลง")) {
		const myServer = servers["552497873116463107"];
		const url = await searchYoutube(cmd);
		if (!url) return;

		myServer.queue.push(url);

		channel
			.send(await Messages.addQueueMessage(url, "Voice"))
			.then((message) => {
				message.react("⏯️");
				message.react("⏹️");
			});
	} else if (cmd.startsWith("คิว") || cmd.toUpperCase().startsWith("Q")) {
		const myServer = servers["552497873116463107"];
		channel.send(Messages.showQueue(myServer));
	}
	return res.send(200);
});
app.listen(80, () => {
	console.log("Voice listenning on port 80!");
});
