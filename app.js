const express= require('express');
const path = require('path');
const bodyParser= require('body-parser');
const mongoose= require('mongoose');
const Users = require('./models/users');
const app= express();
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const upload = require('express-fileupload');
mongoose.connect("mongodb+srv://farghaly:farghaly_93@cluster0-i8la2.mongodb.net/E-shop",{ useNewUrlParser: true,  useUnifiedTopology: true  })
// mongoose.connect("mongodb+srv://farghaly:farghaly_93@cluster0-i8la2.mongodb.net/lessons_2",{ useNewUrlParser: true,  useUnifiedTopology: true  })
.then(() => {
  console.log('Connected successfully to database..');
}
).catch(()=>{
  console.log('Connection failed ... !');
});


let live = false;
let broadcasting_rooms = {};
io.on('connection', function(socket) {

  socket.on('add_boradcaster', (room) => {
    live = true;
    broadcasting_rooms = {};
    broadcasting_rooms[room] = socket.id;
    console.log('start Broadcasting in room '+room);
    var interval = setInterval(() => {socket.broadcast.emit('live', room);if(!live){clearInterval(interval)}}, 1000);
    socket.join(room);
  });
  
  socket.on('stop', () => {
    live = false;
    socket.broadcast.emit('finish');
  })
  socket.on('register as user', async user => {
    const userData = await Users.findOne({_id: user.userId});
    const isAllowed = userData.confirmed == 1 && broadcasting_rooms[userData.stage]?true: false;
    if(!isAllowed || !live) {
      socket.emit('not allowed', true);
      return;
    }
    else {
      console.log('register as user');
      socket.join(user.room);
      socket.to(broadcasting_rooms[user.room]).emit('new user', user);
    }
  })

  socket.on('quit', (user) => {
    socket.to(broadcasting_rooms[user.room]).emit('quit', user);
  })
  
  socket.on("do comment", function (comm) {
    console.log(comm);
    io.sockets.emit("COMMENT", comm);
  });
});
app.use(upload({useTempFiles: true, preserveExtension: 4}));
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: false}));
app.use('/images', express.static(path.join(__dirname,'images')));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
   "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
}); 

app.use(usersRouter);
app.use(adminRouter);

app.use('/', express.static(path.join(__dirname, 'dist')));

// //app.use(expressValidator);


 app.use((req, res, next) => {
   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
 });







// here we are configuring dist to serve app files
// app.use('/.*/', serveStatic(path.join(__dirname, '/dist')))

// this * route is to serve project on different page routes except root `/`
// app.get(/.*/, function (req, res) {
// 	res.sendFile(path.join(__dirname, '/dist/index.html'))
// })



exports.server = server;
exports.app = app;
