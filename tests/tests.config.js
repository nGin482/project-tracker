const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs");
require("dotenv").config();

const hashPassword = userPassword => {
    return bcrypt.hash(userPassword, 14);
}

const tokeniseUser = username => {
    return jwt.sign({username}, process.env.SECRET);
}


const rawData = fs.readFileSync('tests/test_data.json');
const testData = JSON.parse(rawData);

testData.users.forEach(user => {
    hashPassword(user.password).then(result => {
        console.log(user.username, result)
    })
    console.log(user.username, tokeniseUser(user.username))
})