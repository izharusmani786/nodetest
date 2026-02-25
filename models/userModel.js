const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// Schema
userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']

    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: { 
            validator: validator.isEmail, 
            message: 'Please provide a valid email' 
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8
    },
    confirmPassword: {
        type: String,
        required: [true, 'Confirm password is required'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guide', 'lead-guide'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date

})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();
    
    this.passwordChangedAt = Date.now() - 1000;
    next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    console.log({resetToken}, this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;