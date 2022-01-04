const express = require('express');
const http = require('http');
const path = require('path');
// const ejs = require('ejs');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {jenerateMessage,jenerateLocationMessage} = require('./ultis/messages');
const {addUser, removeUser, getUser, getUserInRoom} = require('./ultis/users');

    
const app = express();
const port = process.env.PORT || 3000

const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname,'../public');


app.use(express.static(publicDirectoryPath));
// let count = 0;
let value = ""

io.on("connection",(socket)=>{
    console.log("new webDocket connection");
    
    socket.on('join',(option,callback)=>{

        const {error, user} = addUser({id:socket.id,...option});

        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit("message",jenerateMessage('Admin','welcome'));
        socket.broadcast.to(user.room).emit("message",jenerateMessage('Admin',`${user.username} has joined!`));

        io.to(user.room).emit("roomData",{
            room: user.room,
            users:getUserInRoom(user.room)
        })
    callback();
    })
socket.on("sendMessage",(message, callback) => {

    const user = getUser(socket.id)
    const filter = new Filter();

    if(filter.isProfane(message)){
        return callback("profane is not allowed")
    }
        io.to(user.room).emit("message",jenerateMessage(user.username,message))
        callback()
})
socket.on("sendLocation",(coords, callback)=>{
    const user = getUser(socket.id)

    io.to(user.room).emit("locationMessage",jenerateLocationMessage(user.username,`https://google.com/maps/?q=${coords.latitude},${coords.longitude}`))
    callback('location has shared')
})

socket.on("disconnect",()=>{
    const user = removeUser(socket.id)
    if (user) {
        io.to(user.room).emit("message",jenerateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit("roomData",{
            room: user.room,
            users:getUserInRoom(user.room)
        })
    }
})


    // socket.emit("countUpdated",count)

    // socket.on("increment", ()=>{
    //     count++
    //     socket.emit("countUpdated",count)
    //     io.emit("countUpdated",count)
    // })
})

server.listen(port,()=>{
    console.log(`server is up on port ${port}...`);
})