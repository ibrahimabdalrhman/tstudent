const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
    
}



exports.getAllUsers =catchAsync( async (req, res) => {

    const users = await User.find();

    res.json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});


exports.postUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this yet route is not defined",
    });
};
exports.getUserById = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "this yet route is not defined  /:id",
    });
};

exports.updateMe = async (req, res, next) => {
    //update user

    //to filter fieldes to allow updated or not
    const filterBody = filterObj(req.body, 'name', 'email');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
        new: true,
        runValidators:true
    });

    res.json({
        status: "success",
        user:updateUser
    });
};

exports.deleteMe = catchAsync(async (req, res, next) => {
    const deleteUser = await User.findByIdAndUpdate(req.user.id, { active: false });
    
    res.json({
        status: "success",
        user: null
    });

});
