require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const PREFIX = "-";
const ytdl = require("ytdl-core");
var youtube=require('youtube-search-api');
let embed = new MessageEmbed();
let channel;
client.on("ready", () => {
    console.log("Server listenning....");
    channel = client.channels.cache.find(channel => channel.name === "temp")
});

var servers = {};

async function searchYouTubeAsync(args) {
    var video = (await youtube.GetListByKeyword(args.toString().replace(/,/g,' ')));
    return `https://youtu.be/${video.items[0].id}`
  }


client.on("message", async (message) => {
	if (message.author.bot || !message.content.startsWith(PREFIX)) return;
	let [CMD_NAME, args] = message.content
		.trim()
		.substring(PREFIX.length)
        .split(/\s+/);


	switch (CMD_NAME) {
		case "play":

		case "p":
			function play(connection, message) {
                
				var server = servers[message.guild.id];

				server.dispatcher = connection.play(
					ytdl(server.queue[0], { filter: "audio" })
				);

				server.dispatcher.on("finish", function () {
					server.queue.shift();
					if (server.queue[0]) {
						play(connection, message);
					} else {
						connection.disconnect();
					}
				});
			}

			if (!args) {
				message.reply("Please fill youtube url !");
				return;
			}

			if (!message.member.voice.channel) {
				message.reply("Please fill in voice channel !");
				return;
			}

			if (!servers[message.guild.id])
				servers[message.guild.id] = {
					queue: [],
				};
			var server = servers[message.guild.id];
            if(!args.startsWith('http')) args = await searchYouTubeAsync(args)
			server.queue.push(args);
			message.delete();

			const info = await ytdl.getInfo(args);

			embed = new MessageEmbed()
				.setTitle(`เพิ่มเพลงเข้าคิว`)
				.setColor(0xf2c04e)
				.setDescription(
					`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` +
						"\n\n" +
						`queue by ${message.member}`
				)
				.addField("tips", "-p url\n-play url");

			channel.send(embed);
			if (!message.guild.voice || !message.guild.voice.connection) {
				message.member.voice.channel.join().then(function (connection) {
					play(connection, message);
				});
			}
			break;
		case "show":
			var server = servers[message.guild.id];
			let playlist = "None";
			message.delete();
			if (server && server.queue) {
				playlist = await Promise.all(
					server.queue.map(async (url, index) => {
						const name = await ytdl.getBasicInfo(url);

						const result =
							(index + 1).toString() +
							". " +
							`[${name.videoDetails.title}](https://youtu.be/${name.videoDetails.videoId}) [ https://youtu.be/${name.videoDetails.videoId} ]` +
							"\n";

						return result;
					})
				);
			}
			embed = new MessageEmbed()
				.setTitle("รายการ")

				.setColor(0x00a352)
				.setDescription(playlist)
				.addField("tips", "-show");
                
			channel.send(embed);

			break;
		case "skip":
			var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.delete();
         
            


			const send = (result) =>{embed = new MessageEmbed()
				.setTitle("เพลงต่อไป..")
				.setColor(0x00a352)
				.setDescription(result)
                .addField("tips", "-skip")
                channel.send(embed);
            }
			setTimeout(async () => {
                const name = await ytdl.getBasicInfo(server.queue[0]);
                const result = `[${name.videoDetails.title}](https://youtu.be/${name.videoDetails.videoId}) [ https://youtu.be/${name.videoDetails.videoId} ]` 
                send(result);
            }
                
            , 500);
			break;

		case "stop":
			var server = servers[message.guild.id];
            if (!message.guild.voice) return;
            message.delete();
			if (message.guild.voice.connection) {
				for (var i = server.queue.length - 1; i >= 0; i--) {
					server.queue.splice(i, 1);
				}

				server.dispatcher.end();
				channel.send("Thanks , Bye !");
			}

			if (message.guild.connection)
				message.guild.voice.connection.disconnect();
            break;
	}
});

client.login(process.env.TOKEN);
