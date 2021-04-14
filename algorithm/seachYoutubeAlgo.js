const youtube = require("youtube-search-api");
module.exports = async (title = "") => {
	if (
		title.startsWith("https://") &&
		!title.startsWith("https://www.youtube.com")
	) {
		// case invalid url;
		return;
	}
	const video = await youtube.GetListByKeyword(
		title.toString().replace(/,/g, " ")
	);
	return `https://youtu.be/${video.items[0].id}`;
};
