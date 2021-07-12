const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config();
const Messages = require("./models/Messages");
const handles = require("./handles/");
const servers = {};
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { Player } = require("discord-player");
const player = new Player(client);
client.player = player;

app.use(cors({ origin: true }));
app.use(express.json());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));

client.player.on("trackStart", async (message, track) => {
	servers[message.guild.id] = {};
	servers[message.guild.id].message = message;
	servers[message.guild.id].playing = true;

	message.channel
		.send(await Messages.playSongMessage(track, "เล่น"))
		.then((message) => {
			message.react("⏯️");
			message.react("⏹️");
		});
});

client.player.on("trackAdd", async (message, queue, track) => {
	servers[message.guild.id] = {};
	servers[message.guild.id].message = message;
	servers[message.guild.id].playing = true;

	message.channel
		.send(await Messages.addQueueMessage(track, queue.tracks, "เพิ่ม"))
		.then((message) => {
			message.react("⏯️");
			message.react("⏹️");
		});
});
client.on("ready", () => {
	console.log("The client is ready !");

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
		console.log(args);
		client.player.play(message, args, true);
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

		servers[react.message.guild.id].playing =
			!servers[react.message.guild.id];
	});
});

client.login(process.env.TOKEN);

app.post("/actions", async (req, res, next) => {
	const cmd = req.body.msg;
	const VOICE_ID = req.body.channelId || `805858216558329876`;
	const myServer = servers[VOICE_ID];
	if (myServer && myServer.message) {
		handles.voice(cmd, ["เปิดเพลง", "เล่นเพลง"], async () => {
			const url = cmd.split("เพลง")[1];
			if (!url) return;
			client.player.play(myServer.message, url, true);
		});
		handles.voice(cmd, ["Play"], async () => {
			const url = cmd.split("Play").slice(1).join(" ");
			if (!url) return;
			client.player.play(myServer.message, url, true);
		});

		handles.voice(
			cmd,
			["ปิดเพลง", "เปลี่ยนเพลง", "ข้าม", "ปิด"],
			async () => {
				client.player.skip(myServer.message);
			}
		);
		handles.voice(cmd, ["หยุด", "พัก"], async () => {
			client.player.pause(myServer.message);
		});

		handles.voice(cmd, ["กลับ"], async () => {
			client.player.back(myServer.message);
		});
		handles.voice(cmd, ["เปิดเล่นวน"], async () => {
			client.player.setLoopMode(myServer.message, true);
			myServer.message.channel.send("Loop : ON");
		});
		handles.voice(cmd, ["ยกเลิกเล่นวน"], async () => {
			client.player.setLoopMode(myServer.message, false);
			myServer.message.channel.send("Loop : Off");
		});
		handles.voice(cmd, ["เล่น", "ต่อ", "เล่นต่อ"], async () => {
			client.player.resume(myServer.message);
		});

		handles.voice(cmd, ["สลับ", "Shuffle"], async () => {
			client.player.shuffle(myServer.message);
		});

		handles.voice(cmd, ["ไป", "ไปที่", "ไปตอน"], async () => {
			const txt = cmd;
			const min = txt.match(/\d+ นาที/)
				? parseInt(txt.match(/\d+ นาที/)[0].split(" ")[0])
				: 0;
			const sec = txt.match(/\d+ วินาที/)
				? parseInt(txt.match(/\d+ วินาที/)[0].split(" ")[0])
				: 0;
			const half = txt.match("ครึ่ง");
			const mil = (min * 60 + sec) * 1000 + (half ? 30 * 1000 : 0);
			client.player.setPosition(myServer.message, mil);
			myServer.message.channel.send(`**[Voice]** ${txt}`);
		});

		handles.voice(cmd, ["Q", "q", "คิว", "รายการ"], async () => {
			const queues = client.player.getQueue(myServer.message).tracks;
			if (queues) {
				myServer.message.channel.send(await Messages.showQueue(queues));
			}
		});
	}

	return res.sendStatus(200);
});
app.get("/refresh", (req, res) => {
	const execSync = require("child_process").execSync;
	// import { execSync } from 'child_process';  // replace ^ if using ES modules
	const output = execSync("git pull", { encoding: "utf-8" }); // the default is 'buffer'
	console.log("Output was:\n", output);
	return res.json({ succuess: true, output });
});
app.get("/", (req, res) => {
	res.render("main");
});

app.listen(process.env.PORT || 8080, () => {
	console.log(`Server listenning on port ${process.env.PORT}  !`);
});
