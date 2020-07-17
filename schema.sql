
DROP TABLE users;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(500) NOT NULL,
    lastname VARCHAR(500) NOT NULL,
    email VARCHAR(500) NOT NULL UNIQUE,
    password_hash VARCHAR(70) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE signatures;
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE profiles;
CREATE TABLE profiles (
 id SERIAL PRIMARY KEY,
 user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
 age INTEGER NOT NULL,
 city VARCHAR(500),
 homepage VARCHAR(500) 
);
