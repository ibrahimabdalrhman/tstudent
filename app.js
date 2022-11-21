const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const appError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const helmet = require('helmet');
const morgan = require("morgan");
app.use(morgan('dev'));

//set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get("/", (req, res) => {
    res.render("base", {
        student: "talal ganem",
        user:'ali mohamed'

    });
});

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//reading data from body into req.body
app.use(express.json());  //middleaware in app.use


//test middleware 
app.use((req, res, next) => {
    req.requestTime = new Date().toString();
    console.log(req.requestTime);
    next();
});

// create express-rate-limit
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

//user helmet for security http header
app.use(helmet());


//data sanitization against NOSQL query
app.use(mongoSanitize());
//data sanitization against XSS
app.use(xss());

//prevent parameter pollution 
app.use(hpp());



// const students = JSON.parse(
//     fs.readFileSync(`${__dirname}/dev-data/data/student.json`)
// );


// app.get('/api/v1/students', getAllStudents);
// app.get('/api/v1/students/:id',getStudentById);
// app.post('/api/v1/students',postStudent);
// app.patch('/api/v1/students/:id',patchStudent)
// app.delete('/api/v1/students/:id', deleteStudent)



//3) ROUTES


const studentsRouter = require('./routes/studentsRouter');
const usersRouter = require('./routes/usersRouter');
const { mongo } = require('mongoose');

app.get('/', (req, res) => {
    res.render('base');
});

app.use('/api/v1/students', studentsRouter); 
app.use('/api/v1/users', usersRouter); 



app.use('*', (req, res, next) => {
    next(new appError(`can't find ${req.originalUrl}`,404));
})

app.use(errorController);



module.exports = app;