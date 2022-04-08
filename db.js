import { MongoClient } from "mongodb";

class MongoBot{
    constructor(){
        this.url = "mongodb://root:example@localhost:27017/";
    }
    connect(callback){
        let self = this;
        MongoClient.connect(this.url, function (err, client) {
            self.db = client.db("training-poster");
            return callback(err);
        });
    }
    getDb(){
        return this.db;
    }
}

let dbModule = new MongoBot();

export { dbModule };