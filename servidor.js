// imports
const express=require('express');
const servidor=express();
const porto = 3000;
const fs = require('fs');
const sha1 = require('sha1');
const session = require('express-session');
const fileUpload = require('express-fileupload');
servidor.use(express.json());

// Imports for oauth2
const dotenv = require("dotenv");
dotenv.config();
require('dotenv').config();
// const { google } = require('googleapis');

//Import to be able to send ewmails 
const nodemailer = require("nodemailer");
const mailgun = require('mailgun-js');

// // credentials used to send emails with gmail
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;


// const { google } = require('googleapis');



servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

servidor.use(express.urlencoded({
    extended: true
}));

servidor.use(fileUpload({
    limits: {
        fileSize: 10000000   // 10 MB
    },
    abortOnLimit: true
}));

//static files
servidor.use(express.static('public'))
servidor.use('/css',express.static(__dirname+'public/css'))

servidor.get('', function (req, res) {
    res.render('pages/principal.ejs',{username: req.session.username });
});

servidor.get('/registo', function (req, res) {
    res.render('pages/registo.ejs',{ username: req.session.username });
});

servidor.get('/login', function (req, res) {
    res.render('pages/login.ejs', { username: req.session.username });
});

servidor.get('pages/principal', function (req, res) {
    res.render('pages/principal.ejs', { username: req.session.username });
});

servidor.get('/principal', function (req, res) {
    res.render('pages/principal.ejs', { username: req.session.username });
});

servidor.get('/notificacoes', function (req, res) {
    res.render('pages/notificacoes.ejs', { username: req.session.username });
});

servidor.get('/contacto', function (req, res) {
    res.render('pages/contacto.ejs', { username: req.session.username });
});

servidor.get('/email', function (req, res) {
    res.render('pages/email.ejs', { username: req.session.username });
});

servidor.get('/abre_atividade', function (req, res) {
    res.render('pages/abre_atividade.ejs', { username: req.session.username });
});
servidor.get('/criar_atividade', function (req, res) {
    res.render('pages/criar_atividade.ejs', { username: req.session.username });
});
servidor.get('/minhas_atividades', function (req, res) {
    res.render('pages/minhas_atividades.ejs', { username: req.session.username });
});
servidor.get('/minhas_participacoes', function (req, res) {
    res.render('pages/minhas_participacoes.ejs', { username: req.session.username });
});

//set views
servidor.set('views','./views')
servidor.set('view engine', 'ejs');




//registo
servidor.get('/processa_registo',function(req,res){
    let nome=req.query.nome;
    let apelido=req.query.apelido;
    let morada=req.query.morada;
    let data=req.query.data;
    let numero=req.query.numero;
    let email=req.query.email;
    let username=req.query.username;
    let password = sha1(req.query.password);

    if(nome && apelido && morada && data && numero && email && username && password){
        let registos = {};
        try{
            registos=JSON.parse(fs.readFileSync('registos.json'));
        }
        catch(erro){
            console.log(erro)
        }

        let usernames = Object.keys(registos);
        if (usernames.includes(username)) {
            res.render('pages/mensagem', {
                titulo: 'Não foi possível concluir o registo.',
                texto: 'O username já existe. Por favor, escolha outro.',
                buttonTitle:"Registo",
                buttonLink:"/registo"
            });
        }else{
            registos[username] = { "nome": nome, "apelido": apelido, "morada": morada, "data": data, "numero": numero, "email": email,"username": username, "password":password };
            try {
                fs.writeFileSync('registos.json', JSON.stringify(registos));
                res.render('pages/mensagem', { 
                    titulo: 'O seu registo foi concluído com sucesso.', 
                    texto: 'Pode agora iniciar sessão com os seus dados.',
                    buttonTitle:"Login",
                    buttonLink:"/login" });
            }
            catch (erro) {
                res.render('pages/mensagem', { 
                    titulo: 'Ocorreu um erro no sistema.', 
                    texto: 'Tente novamente em instantes.',
                    buttonTitle:"Registo",
                    buttonLink:"/registo" });
                console.error("erro ao alterar dados no ficheiro");
                console.error(erro);
            }
        }
    } else{
        res.render('pages/mensagem', { 
            titulo: 'Erro no registo.', 
            texto: 'Todos os campos devem ser preenchidos antes de continuar.',
            buttonTitle:"Registo",
            buttonLink:"/registo" });
    }
})


//login
servidor.get('/processa_login',function(req,res){
    let username = req.query.username;
    let password = sha1(req.query.password);

    if(username && password){
        let registos={};
        try{
            let dadosFicheiro = fs.readFileSync('registos.json','utf-8');
            registos = JSON.parse(dadosFicheiro);
        }
        catch(erro){
            console.error('ficheiro inexistente ou sem registos anteriores');
            console.error(erro);
        }

        let usernames = Object.keys(registos);
        if (usernames.includes(username) && registos[username].password == password) {
            req.session.username = username;

            res.render('pages/index', { username: req.session.username});
        }
        else {
            res.render('pages/mensagem', { 
                titulo: 'Não foi possível aceder à sua conta', 
                texto: 'O nome de usuário e a senha informados não correspondem. Por favor, tente novamente.',
                buttonTitle:"Login",
                buttonLink:"/login" });
        }
    }else{
        res.render('pages/mensagem', { 
                titulo: 'Informações incompletas', 
                texto: 'Todos os campos devem ser preenchidos antes de continuar.',
                buttonTitle:"Voltar",
                buttonLink:"/login" });
    }
})

//logout
servidor.get('/processa_logout', function (req, res) {
    req.session.destroy();
    res.render('pages/principal');
});

//ler & alterar registo
servidor.get('/perfil', function (req, res) {
    if (req.session.username) {
        let username = req.session.username;
        let registos = {};
        try {
            registos = JSON.parse(fs.readFileSync('registos.json'));
        }
        catch (erro) {
            res.render('pages/mensagem', { 
                titulo: 'Ocorreu um erro no sistema.', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:"Voltar",
                buttonLink:"/index"});
            console.error(erro);
        }

        let usernames = Object.keys(registos);
        if (usernames.includes(username)) {
            res.render('pages/perfil', { nome: registos[username].nome,
                 apelido: registos[username].apelido,
                 morada: registos[username].morada, 
                 numero: registos[username].numero, 
                 email: registos[username].email, 
                 username: username, 
                 password: registos[username].password,
                 data: registos[username].data })
        }
        else {
            res.render('pages/mensagem', { 
                titulo: 'Dados não encontrados', 
                texto: 'Não conseguimos localizar os seus dados. Verifique as informações e tente novamente.',
                buttonTitle:"Voltar",
                buttonLink:"/index" });
        }
    }
    else {
        res.render('pages/mensagem', { 
            titulo: 'Dados não encontrados', 
            texto: 'Não foi possível localizar os seus dados. Por favor, faça login novamente para continuar.',
            buttonTitle:"Login",
            buttonLink:"/login" });
    }
});

//Alterar registo
servidor.get('/altera_registo', function (req, res) {
    let nome=req.query.nome;
    let apelido=req.query.apelido;
    let morada=req.query.morada;
    let data=req.query.data;
    let numero=req.query.numero;
    let email=req.query.email;
    let username=req.query.username;
    let password = req.query.password;

if (nome && apelido && morada && numero && data && email && password) {
        let registos = {};
        try {
            registos = JSON.parse(fs.readFileSync('registos.json'));
        }
        catch (erro) {
            console.error('Ficheiro inexistente ou sem registos válidos');
            console.error(erro);
        }

        let usernames = Object.keys(registos);
        if (usernames.includes(username)) {
            registos[username] = { 
                "nome": nome, 
                "apelido": apelido,
                "morada" : morada,
                "data" : data, 
                "numero": numero, 
                "email": email, 
                "password": password 
                };
            try {
                fs.writeFileSync('registos.json', JSON.stringify(registos));
              
                res.render('pages/mensagem', { 
                    titulo: 'Atividade atualizada com sucesso', 
                    texto: 'As alterações foram salvas corretamente.',
                    buttonTitle:"Homepage",
                    buttonLink:"/index" });
            }
            catch (erro) {
                res.render('pages/mensagem', { 
                    titulo: 'Ocorreu um erro no sistema.', 
                    texto: 'Tente novamente em instantes.',
                    buttonTitle:"Voltar",
                    buttonLink:"/perfil" });
                console.error("erro ao alterar dados no ficheiro");
                console.error(erro);
            }
        }
        else {
            res.render('pages/mensagem', { 
                titulo: 'Erro ao alterar os dados', 
                texto: 'Por favor, faça login novamente para continuar.',
                buttonTitle:"Voltar",
                buttonLink:"/login" });
        }
    }
    else {
        res.render('pages/mensagem', { 
            titulo: 'Informações incompletas', 
            texto: 'Todos os campos devem ser preenchidos antes de continuar.',
            buttonTitle:"Voltar",
            buttonLink:"/perfil" });
    }
});

//criar atividade
servidor.post('/processa_criar_atividade', (req, res) => {
    let titulo = req.body.titulo;
        let data = req.body.data;
        let hora = req.body.hora;
        let localidade = req.body.localidade;
        let participantes = req.body.participantes;
        let descricao = req.body.descricao;
        let username = req.session.username; 
    
        if (!req.files || !req.files.imagem) {
            return res.render('pages/mensagem', { 
                titulo: 'Erro ao enviar a atividade', 
                texto: 'Uma imagem é necessária para continuar.',
                buttonTitle: "Criar Atividade",
                buttonLink: "/criar_atividade" 
            });
        }

        let imagem = req.files.imagem.name

        if(!(titulo && data && hora && localidade && descricao)){
            return res.render('pages/mensagem', { 
                titulo: 'Erro ao enviar a atividade', 
                texto: 'Todos os campos devem ser preenchidos antes de continuar.',
                buttonTitle: "Criar Atividade",
                buttonLink: "/criar_atividade" 
            });
        }

        let atividades = {};
        try{
            atividades=JSON.parse(fs.readFileSync('atividades.json'));
        }
        catch(erro){
            console.log(erro)
        }
    
        let titulos = Object.keys(atividades);
        if(titulos.includes(titulo)){
            return res.render('pages/mensagem', {
                titulo: 'Não foi possível criar a atividade.',
                texto: 'Já existe uma atividade com este título. Por favor, escolha um título diferente.',
                buttonTitle:"Voltar",
                buttonLink:"/criar_atividade"
            });
        }

        if(req.files.imagem.mimetype.match('^image/(jpeg|jpg|bmp|png|gif)')){
            req.files.imagem.mv('public/uploads/' + req.files.imagem.name, function (error) {
                if (error) {
                    console.error('erro ao carregar a foto de perfil para o servidor');
                    res.render('pages/mensagem', {
                        titulo: 'Formato de imagem inválido',
                        texto: 'Por favor, faça upload apenas de arquivos de imagem (JPEG, JPG, BMP, PNG ou GIF).',
                        buttonTitle: "Voltar",
                        buttonLink: "/criar_atividade"
                    });                
                }
            });  
        }

        atividades[titulo] = { 
            "titulo": titulo, 
            "data": data, 
            "hora": hora, 
            "localidade": localidade, 
            "imagem": imagem, 
            "participantes":participantes,
            "descricao": descricao,
            "username":username
        };

        try {
            fs.writeFileSync('atividades.json', JSON.stringify(atividades));
            res.render('pages/mensagem', { 
                titulo: 'Atividade criada com sucesso.', 
                texto: 'A atividade foi enviada com sucesso. Você pode encontrá-la na página de Atividades.',
                buttonTitle:"Aitividades",
                buttonLink:"/atividades" });
        }
        catch (erro) {
            res.render('pages/mensagem', { 
                titulo: 'Ocorreu um erro no sistema.', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:"Criar Aitividade",
                buttonLink:"/criar_atividade" });
        }
        
});

//find all activites from one user
servidor.get('/minhas_atividades/:username', function(req,res) {
    let username = req.session.username;
    if(username){
        let atividades=[];
        try{
            let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
            atividades = JSON.parse(dadosFicheiro);

            let usernameAtividades = [];
            for (const key in atividades) {
                const atividade = atividades[key];
                if (atividade.username === username) {
                  usernameAtividades.push(atividade);
                }
            }
            res.json(usernameAtividades);
        }
        catch(erro){
            console.error('ficheiro inexistente ou sem registos anteriores');
            console.error(erro);
        }
    }
});

// open the page according to the title of the activity with input fields to allow users to edit and update
servidor.get('/abre_atividade/:titulo', function(req,res) {
    let titulo = req.params.titulo;

    let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
    let atividades = JSON.parse(dadosFicheiro);

    let atividade = atividades[titulo]; 
  
    if(titulo){
        res.send(`
      <html>
        <head>
            <link rel="stylesheet" href="/css/registo.css">
        </head>
        <body>
              <section>
        <div class="top">
            <a href="/minhas_atividades"><img id="backIcon" src="/recursos/arrow-left.svg" alt=""></a>
        </div>
        <div class="content">
            <h1>Editar: <u>${atividade.titulo}</u></h1>
            <div class="container" id="containerA">
            <div class="imagemB">
                <img class="imagemPr" src="/uploads/${atividade.imagem}" alt="">
            </div>

            <form action="/altera_atividade" nome="formA" id="formA" method="get">
                <div class="inputBox ">
                    <input  type="hidden" name="titulo" id="titulo" value="${atividade.titulo}">
                    <input  type="hidden" name="username" id="username" value="${atividade.username}">
                </div>
                <div class="inputBox">
                    <label for="data">Data</label>
                    <input class="criarAti" type="date" name="data" id="data" value="${atividade.data}">
                </div>
                <div class="inputBox">
                    <label for="hora">Hora</label>
                    <input class="criarAti" type="time" name="hora" id="hora" value="${atividade.hora}">
                </div>
                <div class="inputBox">
                    <label for="localidade">Localidade</label>
                    <input class="criarAti" type="text" name="localidade" id="localidade" value="${atividade.localidade}">
                </div>
                <div class="inputBox">
                    <label for="imagem">Imagem</label>
                    <input class="criarAti" type="text" name="imagem" id="imagem" value="${atividade.imagem}">
                </div>
                <div class="inputBox descr">
                    <label for="descricao">Descricao</label>
                    <textarea class="criarAti textareaC" name="descricao" id="descricao">${atividade.descricao}</textarea>
                </div>
                <div id="buttonBoxC">
                    <input class="buttons" type="submit" name="guardarBtn" id="guardarBtn" value="Guardar">
                    <a href="/apaga_atividade/${atividade.titulo}" id="apagaAtiBtn" onclick='return confirm("Tem certeza de que deseja eliminar permanentemente esta atividade?");'>Apagar Atividade</a>
                </div>
            </form>
        </div>
           
        </div>
    </section>
    <img class="leafImg" src="/recursos/leaf2.svg" alt="">
</body>
</html>

        `);
    }
});


//Alterar atividades
servidor.get('/altera_atividade', function (req, res) {
    let data=req.query.data;
    let hora=req.query.hora;
    let localidade=req.query.localidade;
    let imagem = req.query.imagem;
    let descricao = req.query.descricao;
    let username = req.session.username;
    let titulo = req.query.titulo;

    if (titulo && data && hora && localidade && imagem && descricao) {
        let atividades = {};
        try {
            atividades = JSON.parse(fs.readFileSync('atividades.json'));
        }
        catch (erro) {
            res.render('pages/mensagem', { 
                titulo: 'Erro ao alterar os dados', 
                texto: 'Ocorreu um erro ao tentar alterar os seus dados. Por favor, verifique as informações e tente novamente.',
                buttonTitle:"Voltar",
                buttonLink:"/perfil" });
        }

        let titulos = Object.keys(atividades);
        if (titulos.includes(titulo)) {
            atividades[titulo] = { 
                "titulo": titulo, 
                "data": data,
                "hora" : hora,
                "localidade" : localidade, 
                "imagem": imagem, 
                "descricao": descricao,
                "username":username
                };
            try {
                fs.writeFileSync('atividades.json', JSON.stringify(atividades));
              
                res.render('pages/mensagem', { 
                    titulo: 'Alteração concluída com sucesso', 
                    texto: 'Os dados da atividade foram alterados com sucesso e podem ser consultados na página "Minhas Atividades"',
                    buttonTitle:"Atividades",
                    buttonLink:`/atividades` });
            }
            catch (erro) {
                res.render('pages/mensagem', { 
                    titulo: 'Ocorreu um erro no sistema.', 
                    texto: 'Tente novamente em instantes.',
                    buttonTitle:"Voltar",
                    buttonLink:`/abre_atividade/${titulo}` });
                console.error("erro ao alterar dados no ficheiro");
                console.error(erro);
            }
        }
        else {
            res.render('pages/mensagem', { 
                titulo: 'Atividade não encontrada', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:"Voltar",
                buttonLink:`/abre_atividade/${titulo}`});
        }
    }
    else {
        res.render('pages/mensagem', { 
            titulo: 'Informações incompletas', 
            texto: 'Todos os campos devem ser preenchidos antes de continuar.',
            buttonTitle:"Voltar",
            buttonLink:`/abre_atividade/${titulo}`});
    }
});

//
servidor.get('/atividades', function(req, res) {
    let username = req.session.username;
    res.render('pages/atividades.ejs', { username: username });
});

//find all activities that were uploaded from any user
servidor.get('/atividades/data', function(req,res) {
    // let username = req.session.username;
       
        try{
            let dadosFicheiro = fs.readFileSync('atividades.json', 'utf-8');
            let atividades = JSON.parse(dadosFicheiro);
            let lista = Object.values(atividades);
            res.json(lista);
        }
        catch(erro){
            console.error('ficheiro inexistente ou sem registos anteriores');
            console.error(erro);
            res.json([])
        }}
);


// open the page according to the title of the activity without input fields, those are activities that dont belong to you
servidor.get('/outras_atividades/:titulo', function(req,res) {
    let titulo = req.params.titulo;
    let username = req.session.username;

    let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
    let atividades = JSON.parse(dadosFicheiro);
    let atividade = atividades[titulo]; 

    let participantesHTML = '';
    if (atividade.participantes && atividade.participantes.length > 0) {
        participantesHTML = atividade.participantes.join(', ');
    } else {
        participantesHTML = 'Ainda não há participantes.';
    }
  
    if(titulo){
        res.send(`
      <html>
        <head>
            <link rel="stylesheet" href="/css/registo.css">
        </head>
        <body>
        <section>
        <div class="top">
            <a href="/atividades"><img id="backIcon" src="/recursos/arrow-left.svg" alt=""></a>
        </div>
        <div class="content">
            <h1><u>${atividade.titulo}</u></h1>
            <div class="container" id="containerA">
                <div class="imagemB">
                    <img class="imagemPr" src="/uploads/${atividade.imagem}" alt="">
                </div>
                <div class="detailsBox">
                <div class="activityDetails">
                    <p><b>Criador: </b>${atividade.username}</p>
                    <p><b>Data: </b>${atividade.data}</p>
                    <p><b>Hora: </b>${atividade.hora}</p>
                    <p><b>Localidade: </b>${atividade.localidade}</p>
                    <p><b>Participantes: </b>${participantesHTML}</p>
                    <p><b>Descricao: </b>${atividade.descricao}</p>
                </div>
                <div id="buttonBoxC">
                    <input class="buttons" type="button" name="associarBtn" id="associarBtn" data-title="${atividade.titulo}" value="Associar">
                </div>
                </div>
            </div>
        </div>
    </section>
    <img class="leafImg" src="/recursos/leaf2.svg" alt="">
    <script>

  let atividadeTitulo = '${atividade.titulo}'; 
    let username = '${username}';
    document.getElementById('associarBtn').addEventListener('click',function(){

            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/associar?titulo=${atividade.titulo}');

            xhr.onload = function () {
                if (xhr.status === 200) {
                  window.location.href = '/atividades';
                } else {
                  const error = JSON.parse(xhr.responseText);
                }
              
            };
        xhr.send();
    })

   
    </script>
</body>
</html>
`);
}
});

//add your username to an activity
servidor.get('/associar', function(req, res){
    let username = req.session.username;
    let titulo = req.query.titulo;

    let atividades={}

    try{
    let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
    atividades = JSON.parse(dadosFicheiro)
    }
    catch(erro){
        res.render('pages/mensagem', { 
        titulo: 'Ocorreu um erro no sistema.', 
        texto: 'Tente novamente em instantes.',
        buttonTitle:"Voltar",
        buttonLink:`/outras_atividades`});
    }

    let atividade = atividades[titulo];
    if (!atividade.participantes) {
        atividade.participantes = [];
    }

    if (atividade.participantes.includes(username)) {
        return res.render('pages/mensagem', { 
            titulo: 'Erro ao associar.', 
            texto: 'Já está na lista de participantes.',
            buttonTitle: "Voltar",
            buttonLink: `/outras_atividades/${titulo}`
        });
    }
    
    atividade.participantes.push(username);
        
    try {
        fs.writeFileSync('atividades.json', JSON.stringify(atividades));
      
        res.render('pages/mensagem', { 
            titulo: 'Participante adicionado com sucesso', 
            texto: 'O participante foi incluído na lista com sucesso.',
            buttonTitle:"Voltar",
            buttonLink:"/atividades" });
    }
    catch (erro) {
        res.render('pages/mensagem', { 
            titulo: 'Ocorreu um erro no sistema.', 
            texto: 'Tente novamente em instantes.',
            buttonTitle:"Voltar",
            buttonLink:"/atividades" });
        console.error("erro ao alterar dados no ficheiro");
        console.error(erro);
    }
})


//ssee all activitiess that you participated in
//find all activites from one user
servidor.get('/minhas_participacoes/data', function(req,res) {
    res.setHeader('Content-Type', 'application/json');
  
        try{
            let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
            let todasAtividades
            
            try{
                todasAtividades= JSON.parse(dadosFicheiro);
                const atividadesArray = Object.values(todasAtividades);
                const userActivities = atividadesArray.filter(atividade => 
                    atividade.participantes?.includes(req.session.username)
                );
                res.json(userActivities);
            }
            catch(erro){
                console.error('JSON inválido no arquivo de atividades.', jsonError);
                return res.status(500).json({ error: 'JSON inválido no arquivo de atividades.' });
            }
        }
        catch(erro){
            res.status(500).json({ error: 'Erro do sistema.' });
        }
    
});

//desassociar - remove partivipant from the json file
servidor.get('/desassociar',function(req,res){
    let username = req.session.username;
    let titulo = req.query.titulo;

    try{
        let dadosFicheiro = fs.readFileSync('atividades.json','utf-8');
        let atividades = JSON.parse(dadosFicheiro);
        let found = false;
        for(const key in atividades){
            let atividade = atividades[key]
            if(atividade.titulo === titulo){
                found=true;
                let index = atividade.participantes.indexOf(username); 
                if(index !== -1){
                    atividade.participantes.splice(index,1)
                    fs.writeFileSync('atividades.json', JSON.stringify(atividades))
                    return res.json({ success: true, message: 'Removido da lista de participantes.' });
                }
            }
        }
    }
    catch(erro){
        res.render('pages/mensagem',{
        titulo: 'Ocorreu um erro no sistema.', 
        texto: 'Tente novamente em instantes.',
        buttonTitle:"Voltar",
        buttonLink:`/outras_atividades`
        })
    }
})

//classificacao
servidor.get('/classificacao',function(req,res){
    let dadosFicheiro = fs.readFileSync('atividades.json','utf-8')
    let atividades = JSON.parse(dadosFicheiro)
    let numeroAtividades={}
    let numeroParticipacoes={}
    
    for(const key in atividades){
        let atividade = atividades[key];
        let criador = atividade.username;
        let participantes = atividade.participantes

        numeroAtividades[criador]=(numeroAtividades[criador] || 0)+1

        if (Array.isArray(participantes)) {
            for (let participante of participantes) {
                if (participante && participante !== criador) {
                    numeroParticipacoes[participante] = (numeroParticipacoes[participante] || 0) + 1;
                }   
            }
        }
    }
    
    
    let allUsers = new Set([
        ...Object.keys(numeroAtividades), 
        ...Object.keys(numeroParticipacoes)
    ]);

    let classificacao = [];
    for(let username of allUsers){
        let enviosUtilizador = numeroAtividades[username]||0;
        let participacoesUtilizador = numeroParticipacoes[username]||0
       
            classificacao.push({
                username:username,
                enviosUtilizador: enviosUtilizador,
                participacoesUtilizador:participacoesUtilizador,
                total: enviosUtilizador + participacoesUtilizador})
    
    }
    
    classificacao.sort(function(a,b){
        return b.total - a.total
    })
    
    
    let currentRank = 1;
    for (let i = 0; i < classificacao.length; i++) {
        if (i > 0 && classificacao[i].total === classificacao[i - 1].total) {
            classificacao[i].rank = classificacao[i - 1].rank;
        } else {
            classificacao[i].rank = currentRank;
            currentRank++;
        }
    }
    res.render('pages/classificacao.ejs',{classificacao:classificacao})
})

servidor.get('/index', function (req, res) {
    res.render('pages/index.ejs',{username:req.session.username})
});

//apaga registo - confirm first 
servidor.get('/apaga_registo', function (req, res) {
    if (req.session.username) {
        const htmlContent = `<a href="/perfil" style="text-decoration:underline">Não, eu desejo manter a minha conta.</a> `;
        res.render('pages/mensagem', { 
            titulo: `Tem certeza de que deseja eliminar permanentemente esta conta?`, 
            texto: htmlContent,
            buttonTitle:'Sim',
            buttonLink:`/processa_apaga_registo`
        });
           
    }
    else {
        res.render('pages/mensagem', {
            titulo: 'Não foi possível excluir sua conta.', 
            texto: 'Por favor, faça login novamente para continuar.',
            buttonTitle:'Voltar',
            buttonLink:`/login`
        });
    }
});

//if yes: processa apaga registo
servidor.get('/processa_apaga_registo',function(req,res){
    if(req.session.username){
        let registos={};
        let atividades={};
        try{
            registos = JSON.parse(fs.readFileSync('registos.json','utf-8'))
            atividades = JSON.parse(fs.readFileSync('atividades.json','utf-8'))
        }
        catch(erro){
            res.render('pages/mensagem', {
                titulo: 'Ocorreu um erro no sistema.', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:'Voltar',
                buttonLink:`/index`
            });
        }

        let usernames = Object.keys(registos);
        if(usernames.includes(req.session.username)){
            delete registos[req.session.username];

            for(let key in atividades){
                if(atividades[key].username === req.session.username){
                    delete atividades[key]
                }
            }

            try{
                fs.writeFileSync('registos.json',JSON.stringify(registos))
                fs.writeFileSync('atividades.json',JSON.stringify(atividades))
                res.render('pages/mensagem', {
                    titulo: 'Conta eliminada com sucesso.', 
                    texto: 'Sua conta foi removida permanentemente do sistema.',
                    buttonTitle:'Homepage',
                    buttonLink:`/principal`
                });
            }
            catch(erro){
                res.render('pages/mensagem', {
                    titulo: 'Ocorreu um erro no sistema.', 
                    texto: 'Tente novamente em instantes.',
                    buttonTitle:'Voltar',
                    buttonLink:`/index`
                });
            }
        }else{
            res.render('pages/mensagem', {
                titulo: 'Não foi possível eliminar sua conta.', 
                texto: 'Você não tem acesso a esta ação. Por favor, faça login novamente para continuar.',
                buttonTitle:'Voltar',
                buttonLink:`/login`
            });
        }
    }else{
        res.render('pages/mensagem', {
            titulo: 'Não foi possível eliminar sua conta.', 
            texto: 'Você não tem acesso a esta ação. Por favor, faça login novamente para continuar.',
            buttonTitle:'Voltar',
            buttonLink:`/login`
        });
    }
})


servidor.get('/apaga_atividade/:titulo',function(req,res){
    let titulo = req.params.titulo;
    if(titulo){
        let atividades={};
        try{
            let dadosFicheiro = fs.readFileSync('atividades.json','utf-8')
            atividades = JSON.parse(dadosFicheiro)
        }
        catch(erro){
            res.render('pages/mensagem', {
                titulo: 'Ocorreu um erro no sistema.', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:'Voltar',
                buttonLink:`/minhas_atividades`
            });
        }

        for(let key in atividades){
            if(atividades[key].titulo===titulo){
                delete atividades[key]
            }
        }

        try{
            fs.writeFileSync('atividades.json',JSON.stringify(atividades))
            res.redirect('/mensagem_sucesso'); 
            
        }
        catch(erro){
            res.render('pages/mensagem', {
                titulo: 'Ocorreu um erro no sistema.', 
                texto: 'Tente novamente em instantes.',
                buttonTitle:'Voltar',
                buttonLink:`/minhas_atividades`
            });
        }
    }else{
        res.render('pages/mensagem', {
            titulo: 'Não foi possível eliminar sua atividade.', 
            texto: 'Atividade não encontrada.',
            buttonTitle:'Voltar',
            buttonLink:`/minhas_atividades`
        });
    }
})


servidor.get('/mensagem_sucesso', function(req, res) {
    res.render('pages/mensagem', {
        titulo: 'Atividade eliminada com sucesso', 
        texto: 'Pode consultar as restantes na sua lista de atividades.',
        buttonTitle:'Minhas Atividades',
        buttonLink:`/minhas_atividades`
    });
  });


//Sending email to confirm getting tickets

servidor.post('/email_process',async (req,res)=>{
    
    let nome = req.body.nome;
    let email = req.body.email;
    let numberOfTickets = req.body.numberOfTickets;

    try {
        console.log('Form was successfully validated ');
        

        //Nodemailer - worked for localhost, but doesnt work with render.com
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         type: "OAuth2",
        //         user: process.env.EMAIL_USER,
        //         clientId: process.env.CLIENT_ID,
        //         clientSecret: process.env.CLIENT_SECRET,
        //         refreshToken: process.env.REFRESH_TOKEN
        //     },
        // })

        //doesnt work with render.com (gets blocked)
        // const transporter = nodemailer.createTransport({
        //     host: 'smtp-relay.brevo.com',
        //     port: 587,
        //     secure: false,
        //     auth: {
        //         user: process.env.BREVO_USER, 
        //         pass: process.env.BREVO_KEY
        //     }
        // });
        // await transporter.sendMail({
        //     from:`"Event Team" <${process.env.EMAIL_USER}>`,
        //     to: email,
        //     subject: "Reservation Confirmation",
        //     html: `
        //         <h2>Hello ${nome},</h2>
        //         <p>Thank you for your reservation!</p>
        //         <p><strong>Tickets reserved:</strong> ${numberOfTickets}</p>
        //         <p>See you soon!</p>`
        // });

        const mg = mailgun({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN
        });
        
        const data = {
            from: `Event Team <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Reservation Confirmation',
            html: `<h2>Hello ${nome},</h2>...`
        };
        
        await mg.messages().send(data);


        console.log("Sending email to: ", email);

        
        res.render('pages/mensagem', {
            titulo: 'Tickets were sent.', 
            texto: 'Look at your inbox for the tickets.',
            buttonTitle:'Homepage',
            buttonLink:`/principal`
        });


    } catch (error) {


        console.error('=== EMAIL ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Full error:', error);
        console.error('===================');
        
        
        console.error('Error in submitting the form');
        res.render('pages/mensagem', {
            titulo: 'Error in getting tickets', 
            texto: 'Please try again later',
            buttonTitle:'Homepage',
            buttonLink:`/principal`
        });
    }
})

//listen to port 3000
servidor.listen(porto, function () {
    console.log('servidor a ser executado em http://localhost:' + porto);
});