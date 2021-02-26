const mongoose = require('mongoose');

const outExams = new mongoose.Schema({
    stage: {
        type: String,
        required: true,
        unique: true
    },
    exams: {
        type: Array,
        default: [0]
    },
});

module.exports = new mongoose.model('outExams', outExams);