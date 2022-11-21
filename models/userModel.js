const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name required']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'invalide email']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'this field required'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'are not the same '
        }
    },
    photo: String,

    passwordChangeAt: Date,

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select:false
    }
});
userSchema.pre('save',async function (next) {
    //run this function if password actually modified
    if (!this.isModified('password')) return next();

    //hash the password with cast of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});


userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000,10);

        console.log('passwordChangeAt',this.passwordChangeAt);
        console.log("JWTTimestamp", JWTTimestamp);
        console.log("changeTimestamp", changeTimestamp);
        return JWTTimestamp < changeTimestamp;
    }
    
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken
};


userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordResetExpires = Date.now()-1000;
    next();

});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});




const User = mongoose.model('User', userSchema);
module.exports = User;