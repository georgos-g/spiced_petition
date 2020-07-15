const spicedPG = require('spiced-pg');

const db = spicedPG("postgres:georgos:georgos@localhost:5432/petition");

exports.saveSignature = (firstname, lastname, signatureCode)=>{

    return db.query(
        'INSERT INTO signatures (firstname, lastname, signature_code) VALUES($1, $2, $3) RETURNING id;',
        [firstname, lastname, signatureCode]
        );

};

exports.saveUser = (firstname, lastname, email, pasword_hash) => {
    return db.query(
        'INSERT INTO users (firstname, lastname, email, pasword_hash) VALUES($1, $2, $3, $4) RETURNING *;',
        [firstname, lastname, email, pasword_hash]
    );

};


exports.getSignatureByID = (firstname, lastname, signatureID)=>{
    return db.query('SELECT firstname, lastname signatureID FROM signatures WHERE id = $1;', 
    [firstname, lastname, signatureID]);    
};

exports.getSigners = () => {
    return db.query('SELECT firstname, lastname FROM signatures');
};
