const mongoose = require('mongoose');

const videosSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
    },
    unit: {
        type: Number,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    stage: {
        type: String,
        required: true,
    },
    explain: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        unique: true
    },
    videoPath: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
    },
});
module.exports = new mongoose.model('lessons', videosSchema);