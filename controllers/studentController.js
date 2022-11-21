const { fail } = require('assert');
const { query } = require('express');
const { Error } = require('mongoose');
const Student = require("../models/studentModel");
const ApiFeatures = require('../utils/ApiFeatures.js');
const catchAsync = require('../utils/catchAsync');
const appError = require("../utils/appError");




// const fs = require('fs');
// const students = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/student.json`)
// );





//Better API aliasing
exports.aliasTopStudents = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'age';
    req.query.fields = 'name,age';
    next();   
}


// exports.checkId = (req, res, next, val) => {
//     console.log(`student id = ${val}`);
//     if (req.params.id*1 > students.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message :'invalid id'
//         })
//     }
//     next();
// };


// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.gpa) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Missing name or price'
//         })
//     }
//     next();
// };


exports.getAllStudents = catchAsync(async (req, res) => {
    const features = new ApiFeatures(Student.find(), req.query)
        .filter()
        .sort()
        .field()
        .pagination();

    const Students = await features.query;

    res.json({
        status: "success",
        results: Students.length,
        data: {
            Students,
        },
    });

});

exports.getStudentById = catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);

    // if (!student) {
    //     return next(new appError(`can't found student by this ID`, 404));
    // };

    res.json({
        status: 'success',
        data: {
            student
        }
    })


});

exports.postStudent = catchAsync(async (req, res, next) => {
    const student = await Student.create(req.body);

    res.json({
        status: "success",
        data: {
        data: student ,
        },
    });
    });

exports.patchStudent = catchAsync(async (req, res) => {

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidator: true
    });

    if (!student) {
        return next(new appError(`can't found student by this ID`, 404));
    };

    res.json({
        status: 'success',
        data: {
            student
        }
    });

});

exports.deleteStudent = catchAsync(async (req, res) => {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
        return next(new appError(`can't found student by this ID`, 404));
    };

    res.json({
        status: 'success',
        data: null
    });


});


exports.getMonthlyPlan = async (req, res) => {
    try {
    } catch (err) {
        res.json({
            status: "fail",
            message: err,
        });
    }
};



exports.getStudentStats = catchAsync(async (req, res) => {
    const stats = await Student.aggregate([
        {
            $match: { age: { $gte: 40 } }
        },
        {
            $group: {
                _id: null,
                numStudents: { $sum: 1 },
                minAge: { $min: "$age" },
                maxAge: { $max: "$age" },
                avgAge: { $avg: "$age" },
                minIde: { $min: "$ide" },
                maxIde: { $max: "$ide" },
                avgIde: { $avg: "$ide" },
            },
        },
    ]);

    res.json({
        status: "success",
        data: {
            stats
        }
    });

        

});
