const { client } = require('./index');
//import  client from "./index.js"

const ensureZNodeExists = (path, data) => new Promise((resolve, reject) => {
    const bufferData = Buffer.from(data);
   // console.log("Inside ensureZNodeExists for path ",path,"and data",data,"client  ",client);
    client.exists(path, (error, stat) => {
       // console.log('Inside exists ==============>', );
        if (error) {
            reject(error);
            return;
        }

        if (stat) {
            //console.log('inside if===>', );
            // If the ZNode already exists, update its data.
            client.setData(path, bufferData, -1, (setDataError) => {
                if (setDataError) {
                    reject(setDataError);
                } else {
                    //console.log("Znode data updated for path:", path, "and data", data);
                    resolve();
                }
            });
        } else {
            console.log("Inside else==>");
            // If the ZNode doesn't exist, create it with the given data.
            client.create(path, bufferData, (createError) => {
                if (createError) {
                    reject(createError);
                } else {
                    console.log("Znode Created for path:", path, "and data", data);
                    resolve();
                }
            });
        }
    });
});


const readZNodeData=(path)=> new Promise((resolve,reject)=>{
    client.getData(path,function (event) {
        console.log("********************Zookeeper watch*********************");
        console.log("****got event for node=======>",event.getPath());
        console.log("**** event type =======>",event.getType());
       
    },(error,data)=>{
        if(error){
            reject(error);
            return;
        }
        resolve(data?data.toString():null);
    });
 });

// export default {readZNodeData,ensureZNodeExists} ;
module.exports = {
    ensureZNodeExists,
    readZNodeData
};
