// // imports
// const express = require('express');
// const app = express();
// const PORT = 3000;
// app.use(express.json());


// app.use(express.urlencoded({
//     extended: true
// }));
// app.use(express.static('public'))
// app.use('/css',express.static(__dirname+'/public/css'))

// //set views
// app.set('views','./views')
// app.set('view engine', 'ejs');


// //used for oauth2
// const dotenv = require("dotenv");
// dotenv.config();
// require('dotenv').config();
// const { google } = require('googleapis');

// app.get('/email', (req, res) => {
//     res.render('email');
// });


// // credentials used to send emails with gmail
// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;

// // const REDIRECT_URI = "http://localhost:3000/oauth2callback";

// // POST route to send emails 
// app.post('/email_process', async (req, res) => {

//     console.log('this is working');
//     console.log(req.body);
//     res.send('works ');
    

// });

// app.listen(PORT, function () {
//     console.log('servidor a ser executado em http://localhost:' + PORT);
// });

//   servidor.post('/email_process', async(req, res) => {

//     console.log("🔵 Server file started");
//     // res.send("Route works!"); 
      
//       const { nome, email, numberOfTickets } = req.body;
      
//       try{

        

//         //Nodemailer transporter
//       const transporter = nodemailer.createTransport({
//           service: 'gmail',
//           auth: {
//             type: "OAuth2",
//             user: process.env.EMAIL_USER,
//             clientId: process.env.CLIENT_ID,
//             clientSecret: process.env.CLIENT_SECRET,
//             refreshToken: process.env.REFRESH_TOKEN,
//           },
//         });
        
//         await transporter.sendMail({
//           from:`"Event Team" <${process.env.EMAIL_USER}>`,
//           to: email,
//           subject: "Reservation Confirmation",
//           html: `
//             <h2>Hello ${nome},</h2>
//             <p>Thank you for your reservation!</p>
//             <p><strong>Tickets reserved:</strong> ${numberOfTickets}</p>
//             <p>See you soon!</p>
//         `
//         });


//         console.log("Sending email to:", email);

//         res.redirect('/mensagem_sucesso'); 
//      }

//     catch(erro){
//         console.error(" Error sending email:", erro);
//         res.render('pages/mensagem', {
//             titulo: 'Ocorreu um erro no sistema.', 
//             texto: 'Tente novamente em instantes.',
//             buttonTitle:'Voltar',
//             buttonLink:`/minhas_atividades`
//         });
//     }
//   });
  


// // GETTING AUTHENTIFICATION TOKEN



// console.log('client id', CLIENT_ID)


// const oauth2Client = new google.auth.OAuth2(
//     CLIENT_ID,
//     CLIENT_SECRET,
//     REDIRECT_URI
//   );


//   console.log({
//     CLIENT_ID,
//     CLIENT_SECRET,
//     REDIRECT_URI,
//   });

