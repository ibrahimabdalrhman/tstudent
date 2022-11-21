const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// console.log(app.get('env'));


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
    .then(() => {
        console.log('DB connection successful ...');
    }).catch(err => console.log('ERROR in connection DB', err));




// const studentTest = new Student({
//     name: 'ibrahim abdalrhman',
//     age:"21"
// });
// studentTest.save().then(doc => {
//         console.log(doc);
// }).catch(err => {
//         console.log('ERROR ',err);
//     })



const port=process.env.port||3000
// start server
app.listen(3000, () => {
    console.log("ـــــــــــــــــــــــــــــــــــــــــــــــــــــ");
    console.log(`              app running in port ${port} `);
    console.log("ـــــــــــــــــــــــــــــــــــــــــــــــــــــ");
});



