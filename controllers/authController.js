const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const crypto = require("crypto");


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {    
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: user,
    });
}




exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError('please provide email and password', 400));
    }
    const user = await User.findOne({email}).select('+password');
    const correct = await user.correctPassword(password, user.password);

    if (!user || !correct) {
        return next(new appError('incorrect email or password'), 401);
    }
    createSendToken(user, 201, res);

    next();
});




exports.protect = catchAsync(async (req, res, next) => {
    //getting token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    console.log('token : ', token);

    if (!token) {
        return next(new appError('you are not loged in ,please log in',401));
    }
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log("decoded : ", decoded);
    
    //Check if user still exists
    const freshUser = await User.findById(decoded.id);
    console.log('freshUser : ',freshUser.email);
    if (!freshUser) {
        return next(new appError('you are not logged in,please log in', 401));
    };

    //check if user change password after the token was issued

    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(new appError("password changed, please log in again.",401))
    };

    req.user = freshUser;
    
    next();
});





exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError('You not have permission to perform this action', 403));
        };
    next();    
    };
}






exports.forgetPassword = catchAsync(async (req, res, next) => {
    //get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('invalid email', 404));
    }

    //generate the rondom reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    //send it to user's email

    const resetURL = `${req.protocal}://${req.get('host')}/api/v1/users/reserPassword/${resetToken}`;
    const message = `forget your password : create a new password by this link ${resetURL}, 
    if youdid't forget your password please ignore this email`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'your password reset token',
            message
        });

        res.json({
            status: 'success',
            message: 'token send a email'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new appError('err in sending email, thy again later', 500)); 
    }
});





exports.resetPassword =async (req, res, next) => {
  //get user based on token
    const hashToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: { $gt: Date.now() },
    });

  //if token has not expired , set the password
    if (!user) {
        return next(new appError("invalid user ", 400));
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

  //update the password
  //log the user in ,send JWT
    createSendToken(user._id, 200, res);
    
};






exports.updatePassword =catchAsync( async (req, res, next) => {
    //get user
    const user = await User.findById(req.user.id).select('+password');

    //check if user correct
    if (!await(user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new appError('your current password is wrong',401))
    }

    //update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //login user
    createSendToken(user, 200, res);
});



