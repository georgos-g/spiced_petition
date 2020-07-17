const express = require('express');
const hb = require('express-handlebars');
const cookieSession = require ('cookie-session');
const db = require('./db.js');
const csurf = require('csurf');
const hashing = require("./hashing.js");
const { request, response } = require('express');
//const { request, response } = require('express');


//setup for express & handlebars & static css

const app = express();

app.engine('handlebars', hb.create({}).engine);
app.set('view engine', 'handlebars');

app.use(express.static('static'));
app.use(require('body-parser')());
app.use (cookieSession({
secret: "Life is a big enigma",
maxAge: 1000 * 60 * 60 * 24 * 120 //120 Tage 
})
);

app.use (express.urlencoded({
    extended: false   
})); 


app.use(csurf());
app.use(function(req, res, next){
    res.locals.csrfToken = req.csrfToken();
    next();
});


// LOGIN PAGE 
app.get('/login', (request, response)=>{
    if (request.session.userID){
        response.redirect('/', 302) //if userID is loged in  -> redirect to home
    } else {
        response.render('login'); 
    }
});

app.post('/login', (request, response) => {

     //check if fields are filled 

    const {email, password} = request.body;
    if (!email || !password) {
        return response.render('register', {
            error:'Required field/s are missing',
            email,
            password,

        });
    }; 
    db.getUserByEmail(email).then((result) => {
        const userPasswordHashFromDB = result.rows[0].password_hash;
        hashing.compare(password, userPasswordHashFromDB).then((isCorrect) => {
            if (isCorrect) {
                request.session.userID = result.rows[0].id;
                responce.redirect('/thank-you', 302)
            
            } else {
                response.status(401).send('Your email or passwort are incorrect.');

            }
        });
    }).catch(error => {
        response.status(401).send('Your email or passwort are incorrect')
    });

});  


// REGISTER FORM PAGE 

app.get('/register', (request, response) => {
    if (request.session.userID){
        response.redirect('/', 302) //if userID is loged in  -> redirect to home
    } else {
        response.render('register'); 
    }

        
});

// handle register form
app.post('/register', (request, response)=>{
    
    //check if fields are filled 
    const {firstname, lastname, email, password} = request.body;
    if (!firstname || !lastname || !email || !password) {
        return response.render('register', {
            error:'Required field/s are missing',
            firstname,
            lastname,
            email,
            password,

        });
    } 

    

    //hash password, save user in db
    hashing.generateHash(password).
        then((password_hash)=>{
        db.saveUser(firstname, lastname, email, password_hash)
            .then((result) =>{
                request.session.userID = result.rows[0].id;
                response.redirect('/profile', 302);
            });
    });
  

});


// PROFILE PAGE 
app.get('/profile', (request, response)=>{
    if (request.session.userID){
        response.redirect('/login', 302) 
    } else {
    response.render('profile'); 
    }

});

app.post('/profile', (request, response) => {

  
     //check if fields are filled 

    const {age, city, homepage} = request.body;
    if (!age || !city || !homepage) {
        return response.render('register', {
            error:'Required field/s are missing',
            age, 
            city, 
            homepage

        });
    } 
    //save user to DB
    const 

});  


//------------------------------------------------
app.get('/profile-edit', (request, response)=>{
    response.render('profile-edit'); 

});


//------------------------------------------------


// SIGN FORM (with canvas)
        
app.get('/', (request, response)=>{
    //if userID not in request,session -> redirect to login
    response.render('home');
});

app.post('/sign-petition', (request, response) => {
       let signatureCode = request.body.signatureCode;

        //if requested fields aren't filled out...
        if (!signatureCode){
        console.log ('Required fields are missing');
        response.render('home', {
            error: 'Please sign your signature in the field below:',
        });  


        } else {
            const userID = request.session.userID;
            db.saveSignature(userID, signatureCode).then ((result) => {
                const signatureID = result.rows[0].id; 
                    console.log ('Wrote Session: ', request.session);  
                    request.session.signatureID = signatureID ;
                    response.redirect('/thank-you', 302);

            });

        }

    });

    app.get('/thank-you', (request, response) => {
        const signatureID = request.session.signatureID;
        console.log ('request for session on thank you page', request.session);  
        
        db.getSignatureByID(signatureID)
            .then(result => {
            const firstname = result.rows[0].firstname;
            const lastname = result.rows[0].lastname;
            const signatureCode = result.rows[0].signature_code;

            response.render('thank-you', {signatureCode: signatureCode, firstname: firstname, lastname: lastname});
        
        }) 
        
        .catch(error => {
            response.status(401);
            response.send('<html>This Session is not valid. Go there <a href="/">the homepage</a>.</html>'
            ); 
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
app.listen(process.env.PORT || 8080);