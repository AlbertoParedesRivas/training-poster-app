import { MongoClient } from "mongodb";

class MongoBot{
    constructor(){
        this.url = "mongodb://root:example@localhost:27017/";
        this.client = new MongoClient(this.url);
    }
    async connect(){
        await this.client.connect();
        this.db = this.client.db("training-poster");
    }
    getDb(){
        return this.db;
    }
}

let dbModule = new MongoBot();

export { dbModule };