const mongoose = require('mongoose');

const NotificationsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    user: {
        type: Number,
        required: true
    },
    read: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notifications', NotificationsSchema);