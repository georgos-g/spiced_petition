const express = require('express');
const hb = require('express-handlebars');
const cookieSession = require ('cookie-session');
const db = require('./db.js');
const csurf = require('csurf');
const { request, response } = require('express');


//setup for express & handlebars & static css

const app = express();

app.engine('handlebars', hb.create({}).engine);
app.set('view engine', 'handlebars');

app.use(express.static('static'));
app.use(require('body-parser')());
app.use (cookieSession({
secret: "Life is a big enigma",
maxAge: 1000 * 60 * 60 * 24 * 120 //120 Tage 
}));

app.use (express.urlencoded({
    extended: false   
})); 


app.use(csurf());
app.use(function(req, res, next){
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.get

app.get('/', (request, response)=>{
response.render('home');
});

app.post('/sign-petition', (request, response)=>{
    let firstname = request.body.firstname;
    let lastname = request.body.lastname;
    let signatureCode = request.body.signatureCode;

        //if requested fields aren't filled out...
        if (!firstname || !lastname || !signatureCode){
        console.log ('Required fields are missing');
        response.render('home', {
        error: 'Required field/s are missing',
        firstname: firstname,
        lastname: lastname,

        });  


        } else {
            db.saveSignature(firstname, lastname, signatureCode)
            .then ((result) => {
            const signatureID = result.rows[0].id; 
            console.log ('request.session', request.session);  
            response.cookie('signed', true);
            request.session.name = "Petition for Music" ;
            response.redirect('/thank-you', 302);

            });

        }

    });

    app.get('/thank-you', (request, response) => {
        const signatureID = request.session.signatureID;
        console.log ('request for session on thank you page', request.session);  
        
        db.getSignatureByID(signatureID).then(result => {
            const firstname = result.rows[0].firstname;
            const lastname = result.rows[0].lastname;
            const signatureCode = result.rows[0].signature_code;

            response.render('thank-you', {signatureCode: signatureCode, firstname: firstname, lastname: lastname});
        
        }) .catch(error => {
            response.status(401);
            response.send('<html>This Session is not valid. Go there <a href="/">the homepage</a>.</html>'); 
        });    

    }); 
 
    app.get('/signers', (request, response)=>{
    

        db.getSigners()
        .then(results => {
        response.render('signers', {
            signers: results.rows,

        });
    });


});
app.listen(8080);