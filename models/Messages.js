const Discord = require("discord.js");
const ytdl = require("ytdl-core");

exports.helpMessage = `
================= CONSOLE =================

** -p <url/name> ** - to play the song !
** -help ** - to show command 
** -cc ** - to clear the chat (only admin)
** -skip ** - to skip playing song . 
** -show ** - to show playing queue.
** react ⏯️** - to the song for play this song now !
** react ⏹️** - to the song for skip playing song !
** Voice Control ** - https://osmdiscordbot.web.app/   :) enjoy !

================= END CONSOLE =================
`

exports.addQueueMessage = async(url , header="Message") => {
    const emb = new Discord.MessageEmbed();
		const info = await ytdl.getInfo(url);
        const title = `[${header}] เพิ่มเพลง`
		emb.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` 
			)
			.addField("tips", "-p url\n-play url\n** Voice Control ** - https://osmdiscordbot.web.app/   :) enjoy ! ");
    return emb;
}

exports.playSongMessage = async(url ,header="Message") => {
    const info = await ytdl.getInfo(url);
    const title = `[${header}] เล่นเพลง`
		const emb = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]`
			)
			.addField("tips", "-p url\n-play url\n** Voice Control ** - https://osmdiscordbot.web.app/   :) enjoy !");
        return emb;
}

exports.showQueue = async(myServer,header="Voice")=>{
        if(!myServer.queue){
            myServer.queue = []
        }
        const playlist = await Promise.all(
            myServer.queue.map(async (url, index) => {
                const name = await ytdl.getBasicInfo(url);

                const result =
                    (index + 1).toString() +
                    ". " +
                    `[${name.videoDetails.title}](https://youtu.be/${name.videoDetails.videoId}) [ https://youtu.be/${name.videoDetails.videoId} ]`
                return result;
            })
        );
        const title = `[${header}] รายการ`
        const embed = new Discord.MessageEmbed()
            .setTitle(title)

            .setColor(0x00a352)
            .setDescription(playlist|| "None")
            .addField("tips", "-show \n ** Voice Control ** - https://osmdiscordbot.web.app/   :) enjoy !");

        return embed;
}