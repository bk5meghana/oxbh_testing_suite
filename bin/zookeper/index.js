require('dotenv').config()
const ZooKeeper = require('node-zookeeper-client');
const dotenv= require('dotenv')
dotenv.config();

const ZOOKEEPER_SERVER = process.env.MESSAGEBUS_ZOOKEEPER;
const client = ZooKeeper.createClient(ZOOKEEPER_SERVER);
//console.log("client===>",client,"Zookeeper===>",ZooKeeper);

const connectToZooKeeper = () => new Promise((resolve, reject) => {
    client.once('connected', resolve);
    client.once('error', reject);
    client.connect();
});

const isConnected = () => {
    return client.getState() === ZooKeeper.State.SYNC_CONNECTED;
};

module.exports = {
    client,
    connectToZooKeeper,
    isConnected
};
