import {User} from "../models/User.js";

let login = function (request, response) {
    let user = new User(request.body);
    user.login().then(function (result) {
        response.send(result);
    }).catch(function (e) {
        response.send(e);
    });
};

let logout = function () {
    
};

let register = function (request, response) {
    let user = new User(request.body);
    user.register();
    if (!user.errors.length) {
        response.send("Registration complete");
    }else{
        response.send(user.errors);
    }
};

let home = function (request, response) {
    response.render("home-guest");
};

export { login, logout, register, home };