// var ambiente_processo = 'producao';
var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require("dotenv").config({ path: caminho_env });

// Importação de Bibliotecas
var express = require("express");
var cors = require("cors");
var path = require("path");

// Indica a porta que está sendo rodado pelo Node.JS
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST; // Certifique-se que HOST_APP está no .env.dev

var app = express()

// --- CORREÇÃO AQUI ---
// Deixe apenas as rotas que você realmente criou.
var usuarioRouter = require("./src/routes/usuario");
var rankingRouter = require("./src/routes/ranking");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    next();
});

// --- CORREÇÃO AQUI ---
// Use apenas as rotas que você importou
app.use("/usuario", usuarioRouter)
app.use("/ranking", rankingRouter)


// Corrigido para usar HOST_APP e PORTA_APP
app.listen(PORTA_APP, HOST_APP, function () {
    console.log(`
    \n\n\n
    Servidor do seu site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n
    `);
});