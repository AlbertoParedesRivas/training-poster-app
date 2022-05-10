import axios from "axios";

export default class RegistrationForm{
    constructor(){
        this._csrf = document.querySelector("[name='_csrf']").value;
        this.form = document.querySelector("#registration-form");
        this.allFields = document.querySelectorAll("#registration-form .form-control");
        this.insertValidationElements();
        this.username = document.querySelector("#username-register");
        this.email = document.querySelector("#email-register");
        this.password = document.querySelector("#password-register");
        this.username.isUnique = false;
        this.email.isUnique = false;
        this.events();
    }

    // Events
    events(){
        this.form.addEventListener("submit", e => {
            e.preventDefault();
            this.formSubmitHandler();
        })
        this.username.addEventListener("input", () => this.usernameHandler());
        this.email.addEventListener("input", () => this.emailHandler());
        this.password.addEventListener("input", () => this.passwordHandler());
    }

    // Methods
    formSubmitHandler(){
        this.immediateUsernameValidations();
        this.delayedUsernameValidations();
        this.immediatePasswordValidations();
        this.delayedPasswordValidations();
        this.delayedEmailValidations();

        if (
            this.username.isUnique && 
            this.email.isUnique && 
            !this.username.errors && 
            !this.email.errors &&
            !this.password.errors) {
            this.form.submit();
        }
    }

    passwordHandler(){
        this.password.errors = false;
        this.immediatePasswordValidations();
        clearTimeout(this.password.timer);
        this.password.timer = setTimeout(() => this.delayedPasswordValidations(), 800);
    }

    immediatePasswordValidations(){
        if(this.password.value.length > 50){
            this.showValidationError(this.password, "Password cannot exceed 50 characters");
        }

        if (!this.password.errors) {
            this.hideValidationError(this.password)
        }
    }

    delayedPasswordValidations(){
        if (this.password.value.length < 12) {
            this.showValidationError(this.password, "Passwords must be at least 12 characters");
        }
    }

    emailHandler(){
        this.email.errors = false;
        clearTimeout(this.email.timer);
        this.email.timer = setTimeout(() => this.delayedEmailValidations(), 800);
    }

    delayedEmailValidations(){
        if (!/^\S+@\S+$/.test(this.email.value)) {
            this.showValidationError(this.email, "You must provide a valid email address.");
        }

        if (!this.email.errors) {
            axios.post("/doesEmailExists", {email: this.email.value, _csrf: this._csrf}).then(response => {
                if (response.data) {
                    this.email.isUnique = false;
                    this.showValidationError(this.email, "This email is already registered");
                } else {
                    this.email.isUnique = true;
                    this.hideValidationError(this.email);
                }
            }).catch(() => {
                console.log("Try again later");
            });
        }
    }

    usernameHandler(){
        this.username.errors = false;
        this.immediateUsernameValidations();
        clearTimeout(this.username.timer);
        this.username.timer = setTimeout(() => this.delayedUsernameValidations(), 800);
    }

    immediateUsernameValidations(){
        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            this.showValidationError(this.username, "Username can only contain letters and numbers.")
        }
        if (this.username.value.length > 30) {
            this.showValidationError(this.username, "Username cannot exceed 30 characters");
        }


        if (!this.username.errors) {
            this.hideValidationError(this.username);
        }
    }

    delayedUsernameValidations(){
        if(this.username.value.length < 3){
            this.showValidationError(this.username, "Username must be at least 3 characters.");
        }
        if (!this.username.errors) {
            axios.post("/doesUsernameExists", {username: this.username.value, _csrf: this._csrf}).then(response => {
                if (response.data) {
                    this.showValidationError(this.username, "This username already exists");
                    this.username.isUnique = false;
                } else {
                    this.username.isUnique = true;
                }
            }).catch(() => {
                console.log("Try again later.");
            });
        }
    }

    showValidationError(field, message){
        field.nextElementSibling.innerHTML = message;
        field.nextElementSibling.classList.add("liveValidateMessage--visible");
        field.errors = true;
    }

    hideValidationError(field){
        field.nextElementSibling.classList.remove("liveValidateMessage--visible");
    }

    insertValidationElements(){
        this.allFields.forEach(function (element) {
            element.insertAdjacentHTML("afterend", "<div class='alert alert-danger small liveValidateMessage'></div>");
        })
    }
}