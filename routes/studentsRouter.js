
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');


router
    .route('/top-5-cheap')
    .get(studentController.aliasTopStudents, studentController.getAllStudents);
router
    .route('/monthly-plan/')
    .get(studentController.getMonthlyPlan);
router
    .route("/students-stats/")
    .get(studentController.getStudentStats);

// router.param('id', studentController.checkId);
router
    .route('/')
    .get(authController.protect, studentController.getAllStudents)
    .post(studentController.postStudent);
router
    .route('/:id')
    .get(studentController.getStudentById)
    .patch(studentController.patchStudent)
    .delete(authController.protect,authController.restrictTo('admin'), studentController.deleteStudent); 

module.exports = router;
