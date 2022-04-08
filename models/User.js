import validator from "validator"
import { dbModule } from "../db.js";


export class User{
    constructor(data){
        this.username = data.username.trim().toLowerCase();
        this.email = data.email.trim().toLowerCase();
        this.password = data.password;
        this.errors = [];
    }
    
    register(){
        usersCollection = dbModule.collections("users");
        this.cleanUp();
        this.validate();
        
        if(!this.errors.length){
            usersCollection.insertOne(this);
        }
    }

    validate(){
        if(this.username == ""){
            this.errors.push("You must provide an username.");
        }
        if (this.username != "" && !validator.isAlphanumeric(this.username)) {
            this.errors.push("Username can only contain letter and numbers.");
        }
        if(!validator.isEmail(this.email)){
            this.errors.push("You must provide an email.");
        }
        if(this.password == ""){
            this.errors.push("You must provide a password.");
        }
        if(this.password.length > 0 && this.password.length < 12){
            this.errors.push("Password must be at least 12 characters.");
        }
        if(this.password.length > 200){
            this.errors.push("Password cannot exceed 200 characters.");
        }
        if(this.username.length > 0 && this.username.length < 12){
            this.errors.push("Username must be at least 12 characters.");
        }
        if(this.username.length > 200){
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
    }
}