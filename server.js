const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.static(__dirname));


const server = app.listen(8000);

app.use(express.json());    // Required to parse json POST requests

app.post("/", function (request, response){
    if (!hasProperties(request.body, ["function", "args"])){
        response.send({"status" : "Invalid JSON (no function or args)"});
        return;
    }

    const f = request.body["function"]; // String determining which function to execute
    console.log("request function: " + f);

    switch(f){
        case "saveFile":
        console.log("Calling save function...");
        const status = saveFile(request.body.args);
        response.send(status);
        break;

        case "getFile":
        console.log("Calling get file function...");
        const status = saveFile(request.body);
        response.send(status);

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
    if (!hasProperties(args, ["name", "json"]))
        return {"status" : "Invalid JSON (missing function parameters)"};

    const s = JSON.stringify(args.json, null, 4);
    const filePath = path.join("notes", args.name);

    // Writes file and creates notes directory if it doesn't exist
    fs.writeFile(filePath, s, "utf-8", (error)=>{
        if (error && error.code == "ENOENT"){
            fs.mkdir(filePath, (error)=>{
                if (error) throw error;
                fs.writeFile(filePath, s, "utf-8", (error)=>{throw error})
            });
        }

    });

    return {"status" : "OK"};
}


/* Returns true if obj contains all properties. False otherwise */
function hasProperties(obj, properties){
    for (let i = 0; i < properties.length; i++)
        if (!obj.hasOwnProperty(properties[i])) return false;
    return true;
}

/*
    
*/
function getFile(args){

}