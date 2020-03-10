const express = require("express");
const fs = require("fs");
const path = require("path");

const MSG_SUCCESS = "OK";
const NOTES_DIR = "notes";

const app = express();

/* Expose all public directories */
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.static(path.join(__dirname, "html")));
app.use(express.static(path.join(__dirname, "assets")));


const server = app.listen(8000);

app.use(express.json());    // Required to parse json POST requests

app.post("/", function (request, response){

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

    The response object will
    contain the following keys:
        - status: message indicating success (MSG_SUCCESS) or failure 
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
            fs.mkdir(NOTES_DIR, (error)=>{
                if (error){
                    response.json({"status" : "Could not create notes directory"});
                    throw error;
                }

                fs.writeFile(filePath, s, "utf-8", (error)=>{
                    if (error) {
                        response.json({"status" : "Could not write file"});
                        throw error;                        
                    }
                    response.json({"status" : MSG_SUCCESS});
                });
            });
        }
        else response.json({"status" : MSG_SUCCESS});
    });
}


/*
    Sends array with all
    note file names 

    args: JSON object that must have
          the following keys:
          - user: string with the username
    response: response object to send to the client

    The response object will
    contain the following keys:
        - status: message indicating success (MSG_SUCCESS) or failure
        - return: array with strings containing all file names without extension
*/
function getFileNames(args, response){
    
    fs.readdir(NOTES_DIR, function(error, files){
        if (error){
            response.json({
                "status" : "Could not read files directory",
                "return" : null
            });
            return;
        }

        let returnArray = [];
        files.forEach(function (file){
            returnArray.push(file.split('.')[0]);
        });

        response.JSON({
            "status" : MSG_SUCCESS,
            "return" : returnArray
        });

        return;
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
        - return: the relevant file in JSON format
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

        let fileJSON = JSON.parse(data);
        response.json({
            "status" : MSG_SUCCESS,
            "return" : fileJSON
        });
    });
}


/* Returns true if obj contains all properties. False otherwise */
function hasProperties(obj, properties){
    for (let i = 0; i < properties.length; i++)
        if (!obj.hasOwnProperty(properties[i])) return false;
    return true;
}