let isSaved = true;         // Whether document is up to date
let removing = false;       // Whether removing notes or not

let notesJSON = {};         // Object containing all notes
let currentNoteStack = [];  // Path taken from root note to current note

const FILENAME = "notes.json";
const MSG_SUCCESS = "OK";
const EDIT_ICON = "edit.png";


function main(){
    document.addEventListener("keydown", function(e){
        // Captures CTRL+S event
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)){
            e.preventDefault();
            saveFile();
        }
    }, false);

    setTimeout(()=>{
        showToast("Tip: you can save your file with CTRL + S", 3000);
    }, 1000);
    
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

    let notesNode = createNote(note);
    notesList.appendChild(notesNode);
}


/*
    Returns HTML element to be appended
    to the notes list as a <li> with text
    as the string 'note'
*/
function createNote(note){

    let node = document.createElement("LI");
    let anchor = document.createElement("a");
    
    anchor.classList.add("note");

    let editIcon = document.createElement("img");

    editIcon.src = EDIT_ICON;
    editIcon.classList.add("edit");
    editIcon.onclick = editClicked;

    anchor.href = "javascript:;";
    anchor.innerText = note;
    anchor.onclick = textClicked;
    anchor.onmouseover = showEdit;
    anchor.onmouseout = hideEdit;

    node.appendChild(anchor);
    node.appendChild(editIcon);

    return node;
}


function editClicked(event){
    let oldText = event.target.parentElement.getElementsByClassName("note")[0].innerText;
    let listItem = event.target.parentElement;

    let textBox = document.createElement("input");
    textBox.setAttribute("type", "text");
    textBox.setAttribute("value", oldText);
    textBox.className = "edit_text";

    listItem.innerHTML = "";
    listItem.appendChild(textBox);

    textBox.onkeydown = function(event){
        let newText = event.target.value;
        let currentJSON = traverseJSON(currentNoteStack);

        let list = listItem.parentElement;

        /* Doesn't update text if new val is empty
            string or a key that already exists */
        if (event.keyCode == 13 && newText != "" &&
            (!currentJSON.hasOwnProperty(newText) ||
            newText == oldText)){

            isSaved = false;

            list.removeChild(listItem);
            list.appendChild(createNote(newText));

            currentJSON[newText] = currentJSON[oldText];
            delete currentJSON[oldText];
        }
    };
}


/* Removes note from JSON and HTML */
function removeNote(note, noteNode){
    let currentJSON = traverseJSON(currentNoteStack);

    if (!currentJSON.hasOwnProperty(note)) return;

    if (Object.keys(currentJSON[note]).length == 0 ||
        confirm("Are you sure you want to delete \"" + note + "\"?")){
        
        delete currentJSON[note];

        let listItem = noteNode.parentElement;
        let list = listItem.parentElement;

        list.removeChild(listItem);
        isSaved = false;
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
    if (isSaved) return;
    
    const requestJSON = {
        "function" : "saveFile",
        "args" : {
            "name" : FILENAME,
            "json" : notesJSON
        }
    };

    sendJSON(requestJSON, ()=>{
        isSaved = true;
        showToast("File saved.", 2000);
    });
}


function textClicked(event){
    let textNode = event.target;
    let text = textNode.innerText;

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


/* Shows edit icon on note hover */
function showEdit(event){
    if (removing) return;

    let editIcon = event.target.parentElement.getElementsByClassName("edit")[0];
    editIcon.style.display = "inline-block";
}


/* Hides edit icon after brief delay */
function hideEdit(event){
    setTimeout(()=>{
        let editIcon = event.target.parentElement.getElementsByClassName("edit")[0];
        editIcon.style.display = "";
    }, 300);
}


/* Sends a toast message for duration ms */
function showToast(message, duration){
    let body = document.getElementById("main_body");
    let toast = document.createElement("div");

    toast.classList.add("toast");
    body.appendChild(toast);

    toast.innerText = message;
    toast.style = "--duration: " + duration + "ms;";
    toast.classList.add("show");

    setTimeout(()=>{body.removeChild(toast)}, duration);
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


function ignoreReply(){}


main();