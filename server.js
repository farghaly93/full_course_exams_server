const {server} = require('./app');

server.listen(process.env.PORT || 5000, () => {
  // const port = app.address().port;
    console.log('Connected successfully to PORT:' + '5000');
  })