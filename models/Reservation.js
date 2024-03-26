const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    reserveDate: {
        type: Date,
        require: true
    },
    reserveDateStart:{
        type: Date,
        required: true
    },
    reserveDateEnd:{
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true        
    },
    coworking: {
        type: mongoose.Schema.ObjectId, 
        ref: 'Coworking',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);