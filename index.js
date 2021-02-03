
require("dotenv").config();
const { Client } = require("discord.js");
const client = new Client();
const PREFIX = "-";


client.on("ready", () => {
    console.log("Server listenning....");
});


client.on("message", async(message)=>{
    if(message.author.bot || !message.content.startsWith(PREFIX)) return;
    const [CMD_NAME, ...args]= message.content.trim().substring(PREFIX.length).split(/\s+/)
    console.log(CMD_NAME);
    console.log(args);
})


client.login(process.env.TOKEN);


