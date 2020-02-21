const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname));


const server = app.listen(8000);

app.use(express.json());    // Required to parse json POST requests

app.post("/", function (request, response){
    if (!request.body.hasOwnProperty("function")){
        response.send({"status" : "Invalid JSON (no function property)"});
        return;
    }

    const f = request.body["function"]; // String determining which function to execute
    console.log("request function: " + f);

    switch(f){
        case "saveFile":
        console.log("Calling save function...");
        break;

        case "getFile":
        console.log("Calling get file function...");
        break;

        default:
        console.log("Invalid function.");
        response.send({"status" : "Invalid JSON (invalid function property)"});
        break;
    }
});


/*
    Saves JSON file
    args: JSON object with the following keys
    - name: string with the file name
    - json: JSON object

*/
function saveFile(args){

}


/*
    
*/
function getFile(args){

}