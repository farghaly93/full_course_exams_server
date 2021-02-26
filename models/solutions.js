const mongoose = require('mongoose');

const solutionSchema = mongoose.Schema({
    type: String,
    unit: String,
    examId: String,
    year: Number,
    number: Number,
    stage: String,
    userId: String,
    sections: Object,
    done: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('solutions', solutionSchema);
