const fs = require("fs");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require("../models/studentModel");
dotenv.config({ path: './config.env' });

// console.log(app.get('env'));


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then( ()=> {
    console.log('DB connection successful ...');
});

const students = JSON.parse(fs.readFileSync(`${__dirname}/student.json`, 'utf-8'));
const importData = async () => {
    try {
        await Student.create(students);
        console.log('data successful loaded !');
        process.exit();
    } catch (err) {
        console.log("ERROR IN IMPORT DATA",err);
    }
    
}

const deleteData = async() => {
    try{
        await Student.deleteMany();
        console.log('data successful deleted');
        process.exit();

    } catch (err) {
        console.log("ERROR IN DELETED DATA",err);
    }
}

console.log(process.argv);

if (process.argv[2] === '--import') {
    importData();
}
else if (process.argv[2] === '--delete') {
    deleteData();
}