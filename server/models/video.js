var mongoose = require('mongoose');

var Video = mongoose.model('Video', {
    video_id: {
        type: Number,
        required: true,
        minlength: 3,
        trim: true
    },
    title: {
        type: String,
        required: true,
        minlength: 4,
        trim: true
    },
    thumb: {
        type: String,
        required: true,
        minlength: 10,
        trim: true,
    },
    savedAt: {
        type: Number,
        default: new Date().getTime()
    }
});

module.exports = {Video};