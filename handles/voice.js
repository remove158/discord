exports = (message , aliases , callback)=>{
    if (typeof aliases === "string") {
		aliases = [aliases];
	}
    aliases.forEach(msg => { 
        if(message.startsWith(msg)){
            callback();
        }
    });
}