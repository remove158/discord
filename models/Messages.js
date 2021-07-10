const Discord = require("discord.js");
const ytdl = require("ytdl-core");

const DOMAIN = process.env.DOMAIN || "https://discord.piyaphat.xyz/";
exports.helpMessage = `
================= CONSOLE =================

** -p <url/name> ** - to play the song !
** -help ** - to show command 
** -cc ** - to clear the chat (only admin)
** -skip ** - to skip playing song . 
** -show ** - to show playing queue.
** react ⏯️** - to the song for play this song now !
** react ⏹️** - to the song for skip playing song !
** Voice Control ** - ${DOMAIN}   :) enjoy !

================= END CONSOLE =================
`;

exports.playSongMessage = async (track, header = "Message") => {
	const emb = new Discord.MessageEmbed();
	const title = `**[${header}]** เพิ่มเพลงเข้าคิว`;
	emb?.setTitle(title)
		?.setColor(0xf2c04e)
		?.setDescription(` ${track.title} [ ${track.url} ]`);
	// ?.addField(
	// 	`**TIPS**`,
	// 	`**-p <url/name> รองรับทั้ง spotify , youtube , Playlist  ** \n** Voice Control ** \n - ${DOMAIN}   :) enjoy ! `
	// );
	return emb;
};

exports.addQueueMessage = async (track, queue = [], header = "Message") => {
	const playlist = await Promise.all(
		queue.map(async (item, index) => {
			const result =
				(index + 1).toString() +
				". " +
				`${item.title}  [${item.url} ] \n`;
			return result;
		})
	);
	const title = `**[${header}]** กำลังเล่นเพลง ${track.title}`;
	const emb = new Discord.MessageEmbed()
		?.setTitle(title)
		?.setColor(0xf2c04e)
		?.setDescription(
			"**Queues** \n" +
				`${playlist}\n** Voice Control ** \n - ${DOMAIN}   :) enjoy ! \n -p <url/name> รองรับทั้ง spotify , youtube , Playlist `
		);
	return emb;
};

exports.showQueue = async (queue, header = "Voice") => {
	const playlist = await Promise.all(
		queue.map(async (item, index) => {
			const result =
				(index + 1).toString() + ". " + `${item.title} [${item.url} ]`;
			return result;
		})
	);
	const title = `**[${header}]** รายการ`;
	const embed = new Discord.MessageEmbed()
		?.setTitle(title)

		?.setColor(0x00a352)
		?.setDescription(playlist || "None");
	// ?.addField(
	// 	"**TIPS**",
	// 	`-show \n ** Voice Control **  \n- ${DOMAIN}   :) enjoy !`
	// );

	return embed;
};
