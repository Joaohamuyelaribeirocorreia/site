const express = require("express");
const app = express();
const upload = require("upload-files-express");
const path = require("path");

const porta = 6060;

app.use(upload({
    //config
	uploadDir: "./public/upload",
    maxFileSize: 100 * 1024 * 1024, // ~100 MB
	encoding: "utf-8",
	
}));

const inicio = path.join(__dirname, "public", "test", "index.html");

app.get("/",function(req, res){
	res.sendFile(inicio);
})

app.post("/upload", function(req, res){
    //nome arquivo
	const recebido = req.files.arquivo;
	const nomeRecebido = recebido.name;
	const pasta_upload = path.join("public", "upload");
	
    if(req.files.arquivo){
        let file = {
            nome: req.files.arquivo.name,
            tamanho: req.files.arquivo.size,
        };
        console.log(recebido);
		
		res.send("arquivo recebido com sucesso!");
		} else {
        console.log("Nenhum arquivo enviado!");
        res.send("Nenhum arquivo enviado!");
		
    }
});

app.listen(porta, function(){
    console.log(`Servidor rodando na porta:${porta}`)
});

