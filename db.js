const spicedPG = require('spiced-pg');
const { query } = require('express');

const db = spicedPG("postgres:georgos:georgos@localhost:5432/petition");
//Sa
exports.saveSignature = (userID, signatureCode)=>{
    return db.query(
        'INSERT INTO signatures (user_id, signature_code) VALUES($1, $2) RETURNING id;',
        [userID, signatureCode]
        );
};

exports.saveUser = (firstname, lastname, email, pasword_hash) => {
    return db.query(
        'INSERT INTO users (firstname, lastname, email, pasword_hash) VALUES($1, $2, $3, $4) RETURNING *;',
        [firstname, lastname, email, pasword_hash]
    );

};

exports.saveProfile =(userID, age, city, homepage) => {
    return db.query(
        'INSERT INTO profiles (user_id, age, city, homepage) VALUES($1, $2, $3, $4) RETURNING *;',
        [userID, age, city, homepage]   

    );
}; 

exports.getUserByEmail = (email) => {
    return db.query
    ('SELECT * FROM users WHERE email = $1;', [email]);
};

exports.getSignatureByID = (signatureID) => {
    return db.query
    ('SELECT * FROM signatures WHERE id = $1;', [signatureID]);    
};

exports.getSignatureByUserID = (userID) => {
    return db.query
    ('SELECT * FROM signatures WHERE id = $1;', [userID])
};
exports.getSigners = () => {
    return db.query
    ('SELECT firstname, lastname FROM signatures JOIN users ON (signatures.id = users.id)' );
};
