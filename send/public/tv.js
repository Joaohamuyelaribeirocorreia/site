const express = require("express");
const app = express();
const path = require("path");

const video = path.join(__dirname, "video.mp4")

app.get("/tv", function(req, res){
    const resposta = `<video src="video.mp4" autoplay controls title="myvideo"></video>`
    //res.type = "video/mp4";
    res.send(resposta);
});

app.listen(30, function(){
    console.log("Servidor televisivo rodando na porta:30")
})