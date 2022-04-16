import { dbModule } from "../mongo.js";
import { ObjectId } from "mongodb";

export class Post{
    constructor(data, userId){
        this.data = data;
        this.userId = userId;
        this.errors = [];
        this.postCollection = dbModule.getDb().collection("posts");
        this.cleanUp();
        this.validate();
    }

    create(){
        return new Promise((resolve, reject) => {
            if (!this.errors.length) {
                this.postCollection.insertOne(this.data).then(() => {
                    resolve();
                }).catch(()=>{
                    this.errors.push("Please try again later");
                    reject(this.errors);
                });
            } else {
                reject(this.errors);
            }
        });
    }
    
    cleanUp(){
        if(typeof(this.data.title) != "string"){
            this.data.title = "";
        }
        if(typeof(this.data.body) != "string"){
            this.data.body = "";
        }
        this.data = {
            title: this.data.title.trim(),
            body: this.data.body.trim(),
            createdDate: new Date(),
            author: ObjectId(this.userId)
        }
    }

    validate(){
        if(this.data.title == "")
            this.errors.push("You must provide a title");
        if(this.data.body == "")
            this.errors.push("You must provide post content");
    }

    static findPostById(id){
        return new Promise(async function (resolve, reject) {
            if(typeof(id) != "string" || !ObjectId.isValid(id)) {
                reject();
                return
            }
            let post = await dbModule.getDb().collection("posts").findOne({_id: new ObjectId(id)});
            if (post) {
                resolve(post);
            } else {
                reject();
            }
        });
    }
}