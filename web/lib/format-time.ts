const formatTime = (date: Date | string | undefined): string => {



    if(!date) return "";



    if(typeof date === "string"){

   
        date = new Date(date);
    }

 


        
    
    return (date as Date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export { formatTime };