
let isSaved = true;         // Whether document is up to date
let removing = false;       // Whether removing notes or not

let notesJSON = {};         // Object containing all notes
let currentNoteStack = [];  // Path taken from root note to current note

const FILENAME = "notes.json";
const MSG_SUCCESS = "OK";

// Future features
//   Edit notes
//   Name files/open new file


function main(){
    document.addEventListener("keydown", function(e){
        // Captures CTRL+S event
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
            e.preventDefault();
            saveFile();
        }
    }, false);

    requestNotes(FILENAME);
}


function addNoteTextbox(){
    let text = document.getElementById("note_input").value;
    let currentJSON = traverseJSON(currentNoteStack);
 
    if (currentJSON[text] != undefined) return;   // Skips adding duplicates

    addNote(text);

    document.getElementById("note_input").value = "";   // Resets textbox
    isSaved = false;
}


/* Adds non-empty string to the bottom of the notes list HTML  */
function addNote(note){
    if (note == "") return;

    let currentJSON = traverseJSON(currentNoteStack);
    
    // Create new "node" for the tree if the note is new.
    if (currentJSON[note] == undefined)
        currentJSON[note] = {};
    
    let notesList = document.getElementById("notes_list");

    let node = document.createElement("LI");
    let anchor = document.createElement("a");
    let textnode = document.createTextNode(note);
    
    anchor.href = "javascript:;";
    anchor.onclick = textClicked;

    anchor.appendChild(textnode);
    node.appendChild(anchor);
    notesList.appendChild(node);
}


function requestNotes(name){
    const requestJSON = {
        "function" : "getFile",
        "args" : {
            "name" : FILENAME
        }
    };

    sendJSON(requestJSON, function(event){
        let response = JSON.parse(event.target.response);
        if (response.status != MSG_SUCCESS) return;

        Object.assign(notesJSON, response.file);

        displayNotes(notesJSON);
    });
}


function saveFile(){
    const requestJSON = {
        "function" : "saveFile",
        "args" : {
            "name" : FILENAME,
            "json" : notesJSON
        }
    };

    sendJSON(requestJSON, ()=>{
        isSaved = true;
        console.log("File saved.")
    });
}


function ignoreReply(){}


/*
    Sends a json object to the server via a
    POST request. Calls callback when reply
    is available.
    NOTE: Callback should not be an arrow
          function because it overwrites
          'this' to a global scope.
*/
function sendJSON(json, callback=ignoreReply){
    const messageString = JSON.stringify(json);

    var xmlRequest = new XMLHttpRequest();
    xmlRequest.addEventListener("load", callback); // Calls callback when response is complete and reply available
    xmlRequest.open("POST", "/");
    xmlRequest.setRequestHeader("Content-Type", "application/json"); // Needs this so that express.json() recognizes it
    
    xmlRequest.send(messageString);
}


// TODO: Traverse through the tree or remove text
function textClicked(event){
    let textNode = event.target.childNodes[0];
    let text = textNode.nodeValue;

    switch (textNode.className){
        case "removing":
        break;

        case "editing":
        break;

        case "reordering":
        break;

        default:
        currentNoteStack.push(text);
        let textChildren = traverseJSON(currentNoteStack);

        if (textChildren != null){
            document.getElementById("note_header").innerText = text + ":";
            displayNotes(textChildren);
        } else {
            currentNoteStack.pop();
        }   
    }
}


/*
    Returns JSON resulting from
    traversing 'json' through
    'path' keys. Returns null if
    path is invalid.

    json:  json object to traverse
    path:  array of keys to traverse
*/
function traverseJSON(path, json=notesJSON){
    if (!hasProperties(json, path)) return null;

    let traverseResult = json;
    for (let i = 0; i < path.length; i++){
        traverseResult = traverseResult[path[i]];
    }

    return traverseResult;
}


function toggleRemoving(){
    removing = !removing;
    let className = removing ? "removing" : "";
    let notesList = document.getElementById("notes_list");

    let anchorList = notesList.getElementsByTagName("a");
    for (let i = 0; i < anchorList.length; i++)
        anchorList[i].className = className;
}


/*
    Updates the notes list HTML with
    the notes from the json keys.

    json: json file whose keys are notes
*/
function displayNotes(json){

    let notesList = document.getElementById("notes_list");
     
    while (notesList.hasChildNodes())
        notesList.removeChild(notesList.childNodes[0]);

    for (let key in json)
        addNote(key);
}


/* Returns true if obj contains all properties. False otherwise */
function hasProperties(obj, properties){
    for (let i = 0; i < properties.length; i++)
        if (!obj.hasOwnProperty(properties[i])) return false;
    return true;
}


main();