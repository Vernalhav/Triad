
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


function addNote(){
    let notesList = document.getElementById("notes_list");
    let text = document.getElementById("note_input").value;

    if (text == "" || notesJSON[text] != undefined) return;

    notesJSON[text] = {};

    let node = document.createElement("LI");
    let anchor = document.createElement("a");
    let textnode = document.createTextNode(text);
    
    anchor.href = "javascript:;";
    anchor.onclick = textClicked;

    anchor.appendChild(textnode);
    node.appendChild(anchor);
    notesList.appendChild(node);

    document.getElementById("note_input").value = "";
    isSaved = false;
}


function requestNotes(name){
    const requestJSON = {
        "function" : "getFile",
        "args" : {
            "name" : FILENAME
        }
    };

    sendJSON(requestJSON, function(event){
        console.log(event);
        let response = JSON.parse(event.target.response);
        if (response.status != MSG_SUCCESS) return;

        notesJSON = response.file;
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


// TODO: write json to screen
function setupPreviousFile(json){
    if (Object.keys(notesJSON).length == 0) return;
}

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
function textClicked(element){
    let text = element.target.childNodes[0].nodeValue;
    console.log(text);

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
    console.log(json);
    let notesList = document.getElementById("notes_list");
     
    while (notesList.hasChildNodes())
        notesList.removeChild(notesList.childNodes[0]);
}


main();