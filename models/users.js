const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    confirmed: {
        type: Number,
        required: true,
        default: 0
    },
    
    allowed: {
        type: Number,
        default: 0
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true,
        default: 0
    },
    type: {
        type: String,
    },
    bonus: {
        type: Number,
        default: 0
    },
    units: Array
});

module.exports = new mongoose.model('users', usersSchema);