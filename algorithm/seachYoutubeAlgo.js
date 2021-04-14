const youtube = require('youtube-search-api')
module.exports = async (title = "") => {
	var video = await youtube.GetListByKeyword(
		title.toString().replace(/,/g, " ")
	);
	return `https://youtu.be/${video.items[0].id}`;
};
