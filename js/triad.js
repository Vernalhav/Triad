
let removing = false;       // Whether removing notes or not
let notesJSON = {};         // Object containing all notes
let currentNoteStack = [];  // Path taken from root note to current note


function main(){

}


function ignoreReply(){}


function setupPreviousFile(){
    notesJSON = JSON.parse(this.response);
    if (Object.keys(notesJSON).length == 0) return;

    
}

/*
    Sends a json object to the server via a
    POST request. Calls callback when reply
    is available
*/
function sendJSON(json, callback=ignoreReply){
    const message_string = JSON.stringify(json);

    var xml_request = new XMLHttpRequest();
    xml_request.addEventListener("load", callback); // Calls callback when response is complete and reply available
    xml_request.open("POST", "/");
    xml_request.setRequestHeader("Content-Type", "application/json"); // Needs this so that express.json() recognizes it
    
    xml_request.send(message_string);
}


function textClicked(element){
    let text = element.target.childNodes[0].nodeValue;
    console.log(text);

}


function addNote(){
    let notesList = document.getElementById("notes_list");
    let text = document.getElementById("note_input").value;

    if (text == "" || notesJSON[text] != undefined) return;
    sendJSON({"text" : text});  // Sends JSON to server

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
}


main();


