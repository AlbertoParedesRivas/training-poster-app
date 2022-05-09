import Search from "./modules/search.js";
import Chat from "./modules/chat.js";

if(document.querySelector(".header-search-icon")){
    new Search();
}
if(document.querySelector("#chat-wrapper")){
    new Chat();
}