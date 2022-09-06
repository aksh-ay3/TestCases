const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, {useNewUrlParser: true});
var conn = mongoose.connection;
conn.on('connected', function() {
    console.log('database is connected successfully');
    // console.log(process.env.DB_URL);
});
conn.on('disconnected',function(){
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));
module.export = conn;