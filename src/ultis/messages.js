const  jenerateMessage = (username,text)=> {
    return{
        username,
        text,
        createdAt : new Date().getTime() 
    }
}
const jenerateLocationMessage = (username,location)=>{
    return{
        username,
        location,
        createdAt : new Date().getTime() 
    }
}
module.exports = {jenerateMessage,jenerateLocationMessage}