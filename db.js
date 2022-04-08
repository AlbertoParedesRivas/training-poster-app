import { MongoClient } from "mongodb";
import { app } from "./app.js";

const client = new MongoClient('mongodb://root:example@localhost:27017/');
let dbModule;

async function start() {
    await client.connect();
    dbModule = await client.db("training-poster");
    app.listen(3000);
}

export {dbModule};
start();