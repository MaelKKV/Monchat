const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;

//Connection with mongodb
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
  if(err){
    throw err;
  }

  console.log('MOngoDB connected...');

// Connect to socket.io
client.on('connection', function(socket){
  let chat = db.collection('chats');

  // Create function to send the status
  sendStatus = function(s){
    socket.emit('status', s);
  }
  //Get charts from mongoDB collection

  chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
    if(err){
      throw err;
    }

    // Emit the messages
    socket.emit('output', res);
  });

  //Imput Events
  socket.on('input', function(data){
    let name = data.name;
    let message = data.message;

    //Check for name and messages
    if(name == '' || message == ''){
      //Send error status
      sendStatus('Please enter a name and message');
    } else {
      //Inserting message
      chat.insert({name: name, message: message}, function(){
        client.emit('output', [data]);

        // Send status object
        sendStatus({
          message: 'Message sent',
          clear: true
        });
      });
    }
  });

  // Handle clear
  socket.on('clear', function(data){
    // Remove all chat from collection
    chat.remove({}, function(){
      //Emit cleared
      socket.emit('cleared');
    })
  })
});

});
