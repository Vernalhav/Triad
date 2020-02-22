const express = require("express");
const fs = require("fs");
const path = require("path");

const MSG_SUCCESS = "OK";
const NOTES_DIR = "notes";

const app = express();

app.use(express.static(__dirname));


const server = app.listen(8000);

app.use(express.json());    // Required to parse json POST requests

app.post("/", function (request, response){
    response.setContentType("application/json");

    if (!hasProperties(request.body, ["function", "args"])){
        response.json({"status" : "Invalid JSON (no function or args)"});
        return;
    }

    const f = request.body["function"]; // String determining which function to execute
    const args = request.body["args"];     // JSON with the function arguments
    console.log("request function: " + f);

    switch(f){
        case "saveFile":
        console.log("Calling save function...");
        saveFile(args, response);
        break;

        case "getFile":
        console.log("Calling get file function...");
        getFile(args, response);
        break;

        default:
        console.log("Invalid function.");
        response.json({"status" : "Invalid JSON (invalid function property)"});
        break;
    }
});


/*
    Saves JSON file

    args: JSON object that must have
          the following keys:
    - name: string with the file name
    - json: JSON object
    response: response object to send to the client.

    The response object should
    contain the following keys:
    - status: message indicating success or failure 
*/
function saveFile(args, response){
    if (!hasProperties(args, ["name", "json"])){        
        response.json({"status" : "Invalid JSON (missing function parameters)"});
        return;
    }

    const s = JSON.stringify(args.json, null, 4);
    const filePath = path.join(NOTES_DIR, args.name);

    // Writes file and creates notes directory if it doesn't exist
    fs.writeFile(filePath, s, "utf-8", (error)=>{
        if (error && error.code == "ENOENT"){
            fs.mkdir(filePath, (error)=>{
                if (error){
                    response.json({"status" : "Could not create notes directory"});
                    throw error;
                }

                fs.writeFile(filePath, s, "utf-8", (error)=>{
                    response.json({"status" : "Could not write file"});
                    throw error;
                });
                response.json({"status" : MSG_SUCCESS});
            });
        }
        response.json({"status" : MSG_SUCCESS});
    });
}


/*
    Sends notes JSON
    
    args: JSON object that must have
          the following keys:
    - name: string with the file name
    response: response object to send to the client.
    
    The response object should
    contain the following keys:
    - status: message indicating success (MSG_SUCCESS) or failure 
    - file:   the relevant file
*/
function getFile(args, response){
    if (!hasProperties(args, ["name"])){
        response.json({"status" : "Invalid JSON (missing function parameters)"});
        return;
    }

    const filePath = path.join(NOTES_DIR, args.name);
    fs.readFile(filePath, "utf-8", (error, data)=>{
        if (error){
            response.json({"status" : "Could not read file. Maybe it doesn't exist."});
            return;
        }
        response.json({
            "status" : MSG_SUCCESS,
            "file" : JSON.parse(data)
        });
    });
}


/* Returns true if obj contains all properties. False otherwise */
function hasProperties(obj, properties){
    for (let i = 0; i < properties.length; i++)
        if (!obj.hasOwnProperty(properties[i])) return false;
    return true;
}