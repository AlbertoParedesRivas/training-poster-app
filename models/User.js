import validator from "validator"
import { dbModule } from "../db.js";


export class User{
    constructor(data){
        this.usersCollection = dbModule.getDb().collection("users");
        this.data = data;
        this.errors = [];
    }
    
    register(){
        this.cleanUp();
        this.validate();
        if(!this.errors.length){
            this.usersCollection.insertOne(this.data);
        }
    }

    validate(){
        if(this.data.username == ""){
            this.errors.push("You must provide an username.");
        }
        if (this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {
            this.errors.push("Username can only contain letter and numbers.");
        }
        if(!validator.isEmail(this.data.email)){
            this.errors.push("You must provide an email.");
        }
        if(this.data.password == ""){
            this.errors.push("You must provide a password.");
        }
        if(this.data.password.length > 0 && this.data.password.length < 12){
            this.errors.push("Password must be at least 12 characters.");
        }
        if(this.data.password.length > 200){
            this.errors.push("Password cannot exceed 200 characters.");
        }
        if(this.data.username.length > 0 && this.data.username.length < 12){
            this.errors.push("Username must be at least 12 characters.");
        }
        if(this.data.username.length > 200){
            this.errors.push("Username cannot exceed 200 characters.");
        }
    }

    cleanUp(){
        if(typeof(this.username) != "string"){
            this.username = "";
        }
        if(typeof(this.email) != "string"){
            this.email = "";
        }
        if(typeof(this.password) != "string"){
            this.password = "";
        }
        this.data = {
            username: this.data.username,
            email: this.data.email,
            password: this.data.password
        }
    }
}