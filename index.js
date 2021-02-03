require("dotenv").config();

const {Client}=  require('discord.js')
const client = new  Client();


client.on('ready',()=>{

console.log("Test discord " )

})


client.login(process.env.TOKEN)



