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
** Voice Control ** - https://osmdiscordbot.herokuapp.com   :) enjoy !

================= END CONSOLE =================
`

exports.addQueueMessage = async(url , header="Message") => {
    const emb = new Discord.MessageEmbed();
		const info = await ytdl.getInfo(url);
        const title = `[${header}] เพิ่มเพลงเข้าคิว`
		emb.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]` 
			)
			.addField("**TIPS**", "-q url\n** Voice Control ** \n - https://osmdiscordbot.herokuapp.com   :) enjoy ! ");
    return emb;
}

exports.playSongMessage = async(url ,header="Message",queue=[]) => {
    const info = await ytdl.getInfo(url);
    const playlist = await Promise.all(
        queue.map(async (item, index) => {

            const result =
                (index + 1).toString() +
                ". " +
                `[${item.title}](${item.url}) [${item.url} ]`
            return result;
        })
    );
    const title = `[${header}] กำลังเล่นเพลง`
		const emb = new Discord.MessageEmbed()
			.setTitle(title)
			.setColor(0xf2c04e)
			.setDescription(
				`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]`
			)
			.addField("**Queues**", `${playlist}\n** Voice Control ** \n - https://osmdiscordbot.herokuapp.com   :) enjoy !`);
        return emb;
}

exports.showQueue = async(queue,header="Voice")=>{
  
        const playlist = await Promise.all(
            queue.map(async (item, index) => {

                const result =
                    (index + 1).toString() +
                    ". " +
                    `[${item.title}](${item.url}) [${item.url} ]`
                return result;
            })
        );
        const title = `[${header}] รายการ`
        const embed = new Discord.MessageEmbed()
            .setTitle(title)

            .setColor(0x00a352)
            .setDescription(playlist|| "None")
            .addField("**TIPS**", "-show \n ** Voice Control **  \n- https://osmdiscordbot.herokuapp.com   :) enjoy !");

        return embed;
}