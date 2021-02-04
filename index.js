
require("dotenv").config();
const { Client ,MessageEmbed  } = require("discord.js");
const client = new Client();
const PREFIX = "-";
const ytdl = require("ytdl-core");
let embed = new MessageEmbed() 
client.on("ready", () => {
    console.log("Server listenning....");
});

var servers = {};

client.on("message", async(message)=>{
    if(message.author.bot || !message.content.startsWith(PREFIX)) return;
    const [CMD_NAME, ...args]= message.content.trim().substring(PREFIX.length).split(/\s+/)

    switch (CMD_NAME) {
        case "play" :

        case 'p':

            function play(connection, message){
                var server = servers[message.guild.id];
    
                server.dispatcher = connection.play(ytdl(server.queue[0],{filter: "audio"}));
    
    
    
                server.dispatcher.on("finish", function(){
                   server.queue.shift();
                   if(server.queue[0]){
                       play(connection, message);
                   }else {
                       connection.disconnect();
                   }
                })
    
            }         
        
            if(!args[0]){
                message.reply("Please fill youtube url !");
                return;
            }
            
            if(!message.member.voice.channel){
                message.reply("Please fill in voice channel !");
                return;
            }

            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            var server = servers[message.guild.id];

        
            server.queue.push(args[0]);
            message.delete();

            const info = await ytdl.getInfo(args[0])

                embed = new MessageEmbed()
                // Set the title of the field
                .setTitle(`เพิ่มเพลงเข้าคิว`)
                // Set the color of the embed
                .setColor(0xf2c04e)
                // Set the main content of the embed
                .setDescription(`[${info.videoDetails.title}](https://youtu.be/${info.videoDetails.videoId}) [ https://youtu.be/${info.videoDetails.videoId} ]`  + "\n\n"  + `queue by ${message.member}`).addField('tips', "-p url\n-play url")
            
           

 
          // Send the embed to the same channel as the message
            message.channel.send(embed);
            if(!message.guild.voice || !message.guild.voice.connection) {
                
            
    

                message.member.voice.channel.join().then(function(connection){
                    play(connection, message);
                })
            }
        break;
        case  'show':
                var server = servers[message.guild.id];
                let playlist = "None";
                message.delete();
                if(server &&  server.queue)
                {
                    playlist = await Promise.all(server.queue.map( async(url ,index)=> {
                        const name =  await  ytdl.getBasicInfo(url);
                       
                        const result = (index+1).toString() + ". "+`[${name.videoDetails.title}](https://youtu.be/${name.videoDetails.videoId}) [ https://youtu.be/${name.videoDetails.videoId} ]`  + '\n'
                        console.log(result);
                        return  result;
                    })) 
                
                }
                    embed = new MessageEmbed()
                    // Set the title of the field
                    .setTitle('รายการ')
                    // Set the color of the embed
                    .setColor(0x00A352)
                    // Set the main content of the embed
                    .setDescription(playlist).addField('tips', "-show");
   
                  // Send the embed to the same channel as the message
                  message.channel.send(embed)
 

        break;
        case 'skip':
            var server = servers[message.guild.id];
            if(server.dispatcher) server.dispatcher.end();
            embed = new MessageEmbed()
            // Set the title of the field
            .setTitle('Playing')
            // Set the color of the embed
            .setColor(0x00A352)
            // Set the main content of the embed
            .setDescription(server.queue[0]);

 
          // Send the embed to the same channel as the message
          message.channel.send(embed);
        break;

        case 'stop':
            var server = servers[message.guild.id];
            if(!message.guild.voice) return
            if(message.guild.voice.connection){
                for(var i = server.queue.length -1; i >= 0; i--){
                    server.queue.splice(i,1);
                }

                server.dispatcher.end();
                message.channel.send("Thanks , Bye !")
        
            }

            if(message.guild.connection  ) message.guild.voice.connection.disconnect();
        break;


    }
})


client.login(process.env.TOKEN);


