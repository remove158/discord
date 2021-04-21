const Discord = require("discord.js");
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const searchYoutube = require("./algorithm/seachYoutubeAlgo");
const Messages = require("./models/Messages");
const handles = require("./handles/");
const servers = {};
const playTheSong = require("./algorithm/playMusicAlgo");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path')
const { Player } = require("discord-player");
const player = new Player(client);

client.player = player;

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname,'views'))
app.set('view engine','ejs')
app.set(express.static(path.join(__dirname, 'public')))
var channel;

const RESET = () => {
	servers = {};
};
client.on("ready", () => {
	console.log("The client is ready !");
	channel = client.channels.cache.find(
		(channel) => channel.id == "824324108681871400"
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

	handles.command(client, ["show"], async (message) => {
		message.delete();
		const queues = client.player.getQueue(message).tracks;
		if (queues) {
			message.channel.send(await Messages.showQueue(queues));
		}
	});
	handles.command(client, ["reset"], async (message) => {
		message.delete();
	});

	handles.command(client, ["help"], (message) => {
		message.delete();
		message.channel.send(Messages.helpMessage);
		client.user.setPresence({
			activity: {
				name: `"-help" for help`,
			},
		});
	});

	handles.command(client, ["get"], (message) => {
		message.delete();
		message.channel.send(`
        Channel Member Id : ${message.member.voice.channel.id}
        Guild Id : ${message.guild.id}
        Text Channel Id : ${message.channel.id}
        `);
	});

	//to play a song
	handles.command(client, ["p", "play"], async (message) => {
		servers[message.guild.id] = {};
		servers[message.guild.id].message = message;
		servers[message.guild.id].playing = true;
		let args = message.content.trim().split(/\s+/).slice(1).join(" ");
		message.delete();
		const url = await searchYoutube(args);
		client.player.play(message, url);
		message.channel
			.send(await Messages.playSongMessage(url))
			.then((message) => {
				message.react("⏯️");
				message.react("⏹️");
			});
	});

	handles.command(client, ["skip"], async (message) => {
		message.delete();
		client.player.skip(message);
	});

	handles.command(client, ["pause"], async (message) => {
		message.delete();
		client.player.pause(message);
	});

	handles.command(client, ["resume"], async (message) => {
		message.delete();
		client.player.resume(message);
	});

	// handle user reaction
	handles.reaction(client, ["⏹️"], (react, user) => {
		client.player.skip(servers[react.message.guild.id].message);
	});

	handles.reaction(client, ["⏯️"], async (react, user) => {
		if (servers[react.message.guild.id].playing) {
			client.player.pause(servers[react.message.guild.id].message);
		} else {
			client.player.resume(servers[react.message.guild.id].message);
		}

		servers[react.message.guild.id].playing = !servers[
			react.message.guild.id
		];
	});
});

client.login("ODA1ODU2NjIwMDI2MjY1NjEw.YBg-dg.bJ3ZHoA55naCcxM_m9-hz64hX4Q");
const VOICE_ID = `552497873116463107`;
app.post("/actions", async (req, res, next) => {
	const cmd = req.body.msg;
	const myServer = servers[VOICE_ID];
	if (myServer && myServer.message) {
		handles.voice(cmd, ["เปิดเพลง", "play"], async () => {
			const url = await searchYoutube(cmd.split("เพลง")[1]);
			if (!url) return;
			client.player.play(myServer.message, url);

			myServer.message.channel
				.send(await Messages.playSongMessage(url, "Voice"))
				.then((message) => {
					message.react("⏯️");
					message.react("⏹️");
				});
		});

		handles.voice(
			cmd,
			["ปิดเพลง", "เปลี่ยนเพลง", "หยุด", "ปิด"],
			async () => {
				client.player.skip(myServer.message);
			}
		);

		handles.voice(cmd, ["Q", "q"], async () => {
			const queues = client.player.getQueue(myServer.message).tracks;
			if (queues) {
				myServer.message.channel.send(await Messages.showQueue(queues));
			}
		});
	}

	return res.sendStatus(200);
});

app.get('/',(req,res)=> {
    res.render('main')
})

app.listen(process.env.PORT || 8080 , () => {
	console.log(`Server listenning on port 8080  !`);
});
