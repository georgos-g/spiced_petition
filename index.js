//redis cache
//const cache = require('/cache.js');

const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./db.js");
const csurf = require("csurf");
const hashing = require("./hashing.js");
const { request, response } = require("express");

//setup for express & handlebars & static css

const app = express();

app.engine("handlebars", hb.create({}).engine);
app.set("view engine", "handlebars");

app.use(express.static("static"));
app.use(require("body-parser")());

//COOKIE SESSION
app.use(
    cookieSession({
        secret: "Life is a big enigma",
        maxAge: 1000 * 60 * 60 * 24 * 69, //69 Tage
    })
);

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(csurf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// LOGIN PAGE
app.get("/login", (request, response) => {
    if (request.session.userID) {
        response.redirect("/", 302); //if userID is loged in  -> redirect to home
    } else {
        response.render("login");
    }
});

app.post("/login", (request, response) => {
    //check if fields are filled
    const { email, password } = request.body;
    if (!email || !password) {
        return response.render("register", {
            error: "Required field/s are missing",
            email,
            password,
        });
    }
    db.getUserByEmail(email)
        .then((result) => {
            const userPasswordHashFromDB = result.rows[0].password_hash;
            hashing.compare(password, userPasswordHashFromDB).then((isCorrect) => {
                if (isCorrect) {
                    request.session.userID = result.rows[0].id;
                    response.redirect("/thank-you", 302);
                } else {
                    response.status(401).send("Your email or passwort are incorrect.");
                }
            });
        })
        .catch((error) => {
            response.status(401).send("Your email or passwort are incorrect");
            console.error(error);
        });
});

// REGISTER FORM PAGE
app.get("/register", (request, response) => {
    if (request.session.userID) {
        response.redirect("/", 302); //if userID is logged in  -> redirect to home
    } else {
        response.render("register");
    }
});

// handle register form
app.post("/register", (request, response) => {
    //check if fields are filled
    const { firstname, lastname, email, password } = request.body;
    if (!firstname || !lastname || !email || !password) {
        return response.render("register", {
            error: "Required field/s are missing",
            firstname,
            lastname,
            email,
            password,
        });
    }

    //hash password, save user in db
    hashing.generateHash(password).then((password_hash) => {
        db.saveUser(firstname, lastname, email, password_hash).then((result) => {
            request.session.userID = result.rows[0].id;
            response.redirect("/profile", 302);
        });
    });
});

// PROFILE PAGE
app.get("/profile", (request, response) => {
    if (request.session.userID) {
        response.redirect("/login", 302);
    } else {
        response.render("profile");
    }
});

app.post("/profile", (request, response) => {
    //check if fields are filled
    const age = request.body.age;
    const city = request.body.city;
    const homepage = request.body.homepage;

    if (!age || !city || !homepage) {
        return response.render("register", {
            error: "Required field/s are missing",
            age,
            city,
            homepage,
        });
    }
    //save user to DB
    const userID = request.session.userID;
    db.saveProfile(userID, age, city, homepage)
        .then((result) => {
            //redirect to home / canvas
            response.redirect("/", 302);
        })
        .catch((error) => {
            response.status(503);
            response.send("My appologies! Something goes terribly wrong");
            console.error(error);
        });
});

// PROFILE EDIT  ------
app.get("/profile-edit", (request, response) => {
    if (!request.session.userID) {
    //If not logged in redirect to login
        return response.redirect("/login", 302);
    }

    db.getAllUserInfoByUserID(request.session.userID)
        .then((result) => {
            const userInfo = result.rows[0];
            response.render("profile-edit", userInfo);
        })
        .catch((error) => {
            response.status(500).send("Sorry! We do not recognise you.");
        });
});

app.post("/profile-edit", (request, response) => {
    if (!request.session.userID) {
        return response.redirect("/login", 302);
    }
    // validate users entered data
    const firstname = request.body.firstname;
    const lastname = request.body.lastname;
    const email = request.body.email;
    const password = request.body.password;
    const age = request.body.age;
    const city = request.body.city;
    const homepage = request.body.homepage;

    console.log("request.body", request.body);

    if (!firstname || !lastname || !email || !age) {
        return response.render("profile-edit", {
            error:
        "Please complete your profile: Firstname, Lastname, Email, Age, City, Homepage",
            firstname,
            lastname,
            email,
            age,
            city,
            homepage,
        });
    }
    //update user information
    const userUpdatePr = db.updateUser(
        request.session.userID,
        firstname,
        lastname,
        email
    );

    //update password hash if necessary
    let passwordUpdatePr;
    if (password) {
        passwordUpdatePr = hashing.generateHash(password).then((passwordHash) => {
            return db.updatePasswordHash(request.session.userID, passwordHash);
        });
    }

    //update or insert user profile
    const upsertPr = db.updateOrInsertUserProfile(
        request.session.userID,
        age,
        city,
        homepage
    );

    Promise.all([userUpdatePr, passwordUpdatePr, upsertPr]).then((data) => {
        response.redirect("/thank-you", 302);
    });
});

// SIGN FORM (with canvas)

app.get("/", (request, response) => {
    //if userID not in request,session -> redirect to login
    if (!request.session.userID) {
        return response.redirect("/login", 302);
    }

    //check if user is signed
    db.getSignatureByUserID(request.session.userID).then((result) => {
        if (result.rows.length > 0) {
            response.redirect("/thank-you", 302);
        } else {
            response.render("home");
        }
    });
});

app.post("/sign-petition", (request, response) => {
    let signatureCode = request.body.signatureCode;

    //if requested fields aren't filled out...
    if (!signatureCode) {
        console.log("Required fields are missing");
        response.render("home", {
            error: "Please sign your signature in the field below:",
        });
    } else {
        const userID = request.session.userID;
        db.saveSignature(userID, signatureCode).then((result) => {
            const signatureID = result.rows[0].id;
            console.log("Wrote Session: ", request.session);
            request.session.signatureID = signatureID;
            response.redirect("/thank-you", 302);
        });
    }
});

//unsign petition

app.post("/unsign-petition", (request, response) => {
    //check if user is loged in
    if (!request.session.userID) {
        response.redirect("/login", 302);
    } else {
    //delete signature and redirect to canvas page
        db.deleteSignatureForUserId(request.session.userID).then((result) => {
            response.redirect("/", 302);
        });
    }
});

app.get("/thank-you", (request, response) => {
    //if user is not in request.session, redirect to /login

    const userID = request.session.userID;
    //const signatureID = request.session.signatureID;
    console.log("request for session on thank you page", request.session);

    //db.getSignatureByID(signatureID)
    db.getSignatureByUserID(userID)
        .then((result) => {
            //const firstname = result.rows[0].firstname;
            //const lastname = result.rows[0].lastname;
            const signatureCode = result.rows[0].signature_code;

            response.render("thank-you", {
                signatureCode: signatureCode,
                //firstname: firstname,
                //lastname: lastname
            });
        })

        .catch((error) => {
            response.status(401);
            response.send(
                '<html>This Session is not valid. Go there <a href="/">the homepage</a>.</html>'
            );
            //console.log ('error', error);
        });
});

//
app.get("/signers", (request, response) => {
    db.getSigners().then((results) => {
    //console.log ("results", results);
        response.render("signers", {
            signers: results.rows,
        });
    });
});

app.post("/logout", (request, response) => {
    request.session.userID = 0;
    response.redirect("/login", 302);
});

app.listen(process.env.PORT || 8080);
