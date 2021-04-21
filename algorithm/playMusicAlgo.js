const ytdl = require("ytdl-core");

const play = (server, connection) => {


	server.dispatcher = connection.play(
		ytdl(server.queue[0], { filter: "audio" })
	);
    

	server.dispatcher.on("finish", function () {
		server.queue.shift();
		if (server.queue[0]) {
			play(server, connection);
		} else {
			// setTimeout(() => {
			// 	if (server.queue.length === 0) {
			// 		connection.disconnect();
			// 	}
			// }, 1.5 * 60 * 1000);
		}
	});
};

module.exports = play;
