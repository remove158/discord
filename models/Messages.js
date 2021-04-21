const Discord = require("discord.js");
const ytdl = require("ytdl-core");

exports.helpMessage = `
================= CONSOLE =================

** -p <url/name> ** - to play the song !
** -help ** - to show command 
** -cc ** - to clear the chat (only admin)
** -skip ** - to skip playing song . 
** react ⏯️** - to the song for play this song now !
** react ⏹️** - to the song for skip playing song !

================= END CONSOLE =================
`

exports.addQueueMessage = async(url , header="Message") => {
    const emb = new Discord.MessageEmbed();
		const info = await ytdl.getInfo(url);
        const title = `[${header}] เล่นเพลง`
		emb.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` +
					"\n\n" +
					`queue by ${message.member}`
			)
			.addField("tips", "-p url\n-play url");
    return emb;
}

exports.playSongMessage = async(url ,header="Message") => {
    const info = await ytdl.getInfo(url);
    const title = `[${header}] เล่นเพลง`
		const emb = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` +
					"\n\n" +
					`replay by ${user}`
			)
			.addField("tips", "-p url\n-play url");
        return emb;
}

exports.showQueue = async(myServer)=>{

        const playlist = await Promise.all(
            myServer.queue.map(async (url, index) => {
                const name = await ytdl.getBasicInfo(url);

                const result =
                    (index + 1).toString() +
                    ". " +
                    `[${name.videoDetails.title}](https://youtu.be/${name.videoDetails.videoId}) [ https://youtu.be/${name.videoDetails.videoId} ]` +
                    "\n";

                return result;
            })
        );

        const embed = new Discord.MessageEmbed()
            .setTitle("รายการ")

            .setColor(0x00a352)
            .setDescription(playlist)
            .addField("tips", "-show");

        return embed;
}