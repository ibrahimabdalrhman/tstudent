const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/usersController');


router.post("/signup",authController.signup);
router.post("/login", authController.login);

router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch("/updatePassword/", authController.protect, authController.updatePassword);
router.patch("/updateMe",authController.protect, userController.updateMe);
router.patch("/deleteMe", authController.protect, userController.deleteMe);




router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.postUser);
router
    .route('/:id')
    .get(userController.getUserById);




module.exports = router;