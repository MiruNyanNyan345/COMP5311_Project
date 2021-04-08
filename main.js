const express = require("express");
const app = express()
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const bodyParser = require('body-parser');
const crypto = require('crypto');

const {publicKey, privateKey} = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});
// const verifiableData = "this need to be verified"
// console.log(verifiableData)
// let signature = crypto.sign("sha256", Buffer.from(verifiableData), {
//     key: privateKey,
//     padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
// })
// const isVerified = crypto.verify(
//     "sha256",
//     Buffer.from(verifiableData),
//     {
//         key: publicKey,
//         padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
//     },
//     signature
// )
// console.log("signature verified: ", isVerified)

const {joinUser, removeUser} = require('./users')

app.use(bodyParser.json());
app.use('/static', express.static('static'));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

let thisRoom = "";

app.post('/signMessage', signMessage);

function signMessage(req, res) {
    let reqObj = req.body;
    let unSignMessage = reqObj.message;
    let signature = crypto.sign("sha256", Buffer.from(unSignMessage), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    })
    res.json({sign: signature})
}

app.post('/verifyMessage', verifySign);

function verifySign(req, res) {
    let reqObj = req.body;
    let message = reqObj.message;
    let signature = Buffer.from(reqObj.signature);

    const isVerified = crypto.verify(
        "sha256",
        Buffer.from(message),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signature
    )

    res.json({verified: isVerified})
}

io.on("connection", function (socket) {
    socket.on("join room", (data) => {
        console.log(data.username + " joined room " + data.roomName)
        let newUser = joinUser(socket.id, data.username, data.roomName)
        thisRoom = newUser.roomname;
        // console.log(newUser)
        socket.join(newUser.roomname)
        socket.emit('send data', {id: socket.id, username: newUser.username, roomname: newUser.roomname});
        socket.emit('onConnect', {user: data.username, room: data.roomName});
        socket.to(data.roomName).emit("onConnect", {user: data.username, room: data.roomName});

    });

    socket.on("chat message", (data) => {
        io.to(thisRoom).emit("chat message", {data: data, id: socket.id});
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        console.log(user);
        if (user) {
            console.log(user.username + ' has left');
        }
        console.log("disconnected");
    })

})


server.listen(3000, function () {
});

