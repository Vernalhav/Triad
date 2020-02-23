
let isSaved = true;         // Whether document is up to date
let removing = false;       // Whether removing notes or not

let notesJSON = {};         // Object containing all notes
let currentNoteStack = [];  // Path taken from root note to current note

const FILENAME = "notes.json";
const MSG_SUCCESS = "OK";


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


/* Adds non-empty string as a note */
function addNote(note){
    if (note == "") return;

    let currentJSON = traverseJSON(currentNoteStack);
    
    // Create new "node" for the tree if the note is new.
    if (currentJSON[note] == undefined)
        currentJSON[note] = {};
    
    let notesList = document.getElementById("notes_list");

    let node = document.createElement("LI");
    let anchor = document.createElement("a");
    let textNode = document.createTextNode(note);
    
    anchor.classList.add("note");

    let editIcon = document.createElement("a");
    let editText = document.createTextNode("EDIT");

    editIcon.href = "javascript:;";
    editIcon.onclick = editClicked;
    editIcon.className = "edit";

    anchor.href = "javascript:;";
    anchor.onclick = textClicked;

    anchor.appendChild(textNode);
    node.appendChild(anchor);

    editIcon.appendChild(editText);
    node.appendChild(editIcon);

    notesList.appendChild(node);
}


function editClicked(event){

}


/* Removes note from JSON and HTML */
function removeNote(note, noteNode){
    let currentJSON = traverseJSON(currentNoteStack);

    if (!currentJSON.hasOwnProperty(note)) return;

    if (Object.keys(currentJSON[note]).length == 0 ||
        confirm("Are you sure you want to delete \"" + note + "\"?")){
        
        delete currentJSON[note];
        noteNode.parentElement.parentElement.removeChild(noteNode.parentElement);
    }
}


/*
    Gets JSON notes file from
    server and displays them

    name:   name of the file to fetch
*/
function requestNotes(name=FILENAME){
    const requestJSON = {
        "function" : "getFile",
        "args" : {
            "name" : name
        }
    };

    sendJSON(requestJSON, function(event){
        let response = JSON.parse(event.target.response);
        if (response.status != MSG_SUCCESS) return;

        Object.assign(notesJSON, response.file);

        displayNotes(notesJSON);
    });
}


/* Sends request to save current JSON */
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
        console.log("File saved.");
    });
}


/*
    Sends a json object to the server via a
    POST request. Calls callback when reply
    is available.
    Callback should receive the event as a
    parameter, and can access the server
    response through event.target.response
*/
function sendJSON(json, callback=ignoreReply){
    const messageString = JSON.stringify(json);

    var xmlRequest = new XMLHttpRequest();
    xmlRequest.addEventListener("load", callback); // Calls callback when response is complete and reply available
    xmlRequest.open("POST", "/");
    xmlRequest.setRequestHeader("Content-Type", "application/json"); // Needs this so that express.json() recognizes it
    
    xmlRequest.send(messageString);
}


function textClicked(event){
    let textNode = event.target;
    let text = textNode.innerText;

    console.log(textNode.classList);

    if (textNode.classList.contains("removing")){
        removeNote(text, textNode);
    } else if (textNode.classList.contains("reordering")){
        console.log("NOT IMPLEMENTED");
    } else {
        forwardTraversal(text);
    }
}


/*
    Updates HTML to the child subtree
    rooted in string 'note'.
*/
function forwardTraversal(note){
    removing = false;

    currentNoteStack.push(note);
    let noteChildren = traverseJSON(currentNoteStack);

    if (noteChildren != null){
        document.getElementById("previous_note").innerText = note;
        document.getElementById("return_arrow").innerText = "<";
        displayNotes(noteChildren);
    } else {
        currentNoteStack.pop(); // Undoes invalid operation
    }
}


/*
    Updates HTML to
    the parent subtree
*/
function backwardTraversal(){
    if (currentNoteStack.length == 0) return;
    removing = false;

    let note = currentNoteStack.pop();
    let noteParent = traverseJSON(currentNoteStack);

    let noteParentText = "";
    if (currentNoteStack.length != 0){
        noteParentText = currentNoteStack[currentNoteStack.length - 1];
        document.getElementById("return_arrow").innerText = "<";
    }
    else {
        noteParentText = "Notes";
        document.getElementById("return_arrow").innerText = "";
    }

    if (noteParent != null){
        document.getElementById("previous_note").innerText = noteParentText;
        displayNotes(noteParent);
    } else {
        currentNoteStack.push(note);    // Undoes invalid operation
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

    let traverseResult = json;
    for (let i = 0; i < path.length; i++){
        traverseResult = traverseResult[path[i]];
        if (traverseResult == undefined) return null;
    }

    return traverseResult;
}


/*
    Changes each list element's class
    to identify whether or not it is
    being removed.
*/
function toggleRemoving(){
    removing = !removing;

    let anchorList = document.querySelectorAll(".note");

    if (removing){
        for (let i = 0; i < anchorList.length; i++)
            anchorList[i].classList.add("removing");
    } else {
        for (let i = 0; i < anchorList.length; i++)
            anchorList[i].classList.remove("removing");
    }
}


/* Adds user input as a note */
function addNoteTextbox(){
    let text = document.getElementById("note_input").value;
    let currentJSON = traverseJSON(currentNoteStack);
 
    if (currentJSON[text] != undefined) return;   // Skips adding duplicates

    addNote(text);

    document.getElementById("note_input").value = "";   // Resets textbox
    isSaved = false;
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


main();


function ignoreReply(){}
