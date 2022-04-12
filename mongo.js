import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

class MongoBot{
    constructor(){
        this.url = process.env.CONNECTION_STRING;
        this.client = new MongoClient(this.url);
    }
    async connect(){
        await this.client.connect();
        this.db = this.client.db();
    }
    getDb(){
        return this.db;
    }
    getClient(){
        return this.client;
    }
}

let dbModule = new MongoBot();

export { dbModule };