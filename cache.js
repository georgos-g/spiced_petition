const redis = require('redis');
const{promisify} = require('util');

const client = redis.createClient({
    host: 'localhost',
    port: 6379  
});

client.on('error', (error)=>{
    console.log('Reddis error', error);  
});


exports.setex = promisify(client.setex.bind(client));
exports.get = promisify(client.get.bind(client));
exports.del = promisify(client.del.bind(client));

