const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
    year: Number,
    stage: String,
    number: Number,
    model: String,
    deadLine: Date,
    timer: Number,
    sections: Array,
    students: Array,
    type: String
});

module.exports = mongoose.model('exams', examSchema);
