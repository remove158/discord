const Discord = require("discord.js");
const client = new Discord.Client();
require('dotenv').config()
const handles = require("./handles");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { Player } = require("discord-player");
const player = new Player(client);

client.player = player;

app.use(cors({ origin: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



const getChannel = (name) => {
   
    return client.channels.cache.find(channel => {
        return channel.guild.id == "552497873116463107" && channel.name.startsWith(name)  
    })
}

const getMessageType = (message) => {
    if(message.content.startsWith("http")){
        return "link"
    }
    if(message.attachments.size > 0){
        return "files"
    }

    if(message.content.startsWith("```")){
        return "code"
    }
    if(message.content) {

        return "text"
    }
    

    return null
}

client.on("ready", () => {
	console.log("The message manager is ready !");


    client.on("message", (message) => {
        // enable only my discord 
        if(message.guild.id == "552497873116463107") {
            const botCommand = ". ! - + /".split(' ')
            if(message.author.bot ||  botCommand.some(e=> e===message.content[0])) return
    
           
            const channelName = message.channel.name
            const messageType = getMessageType(message)
            if(!messageType) return;
            if(messageType != channelName) {
              
                const sendTo = getChannel(messageType)
                if(sendTo) {
                    message.channel.send(`${message.author} มึงส่งผิด channel ละไอ่เด็กเหี้ย กูย้ายไป ${messageType} ให้แล้ว`).then( (message) => {
                        setTimeout( () => {
                            message.delete()
                        }, 15 * 1000)
                    })
                    if(messageType== "files") {
                        for(let i of message.attachments){
                            const file = new Discord.MessageAttachment(i[1].url)
                            getChannel(messageType).send(file)
                       
                        }
                        message.delete()
                    }else{
                    
                        getChannel(messageType).send(  `${message.author}, ${message.content}`)
                    }
                    message.delete()
                }else{
                    console.log('Not found target room.')
                }
                
    
            }
        }
       
		
	});

});

client.login(process.env.TOKEN);

