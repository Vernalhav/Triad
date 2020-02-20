const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname));


const server = app.listen(8000);

app.use(express.json());

app.post("/", function (request, response){
    console.log(request.body);
    response.send({"status":"OK"});
});
