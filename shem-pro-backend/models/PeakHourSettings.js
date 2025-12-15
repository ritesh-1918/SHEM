const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
    startHour: {
        type: Number,
        required: true,
        min: 0,
        max: 23
    },
    endHour: {
        type: Number,
        required: true,
        min: 0,
        max: 23
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    }
});

const PeakHourSettingsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    timezone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    peakHours: {
        type: [TimeSlotSchema],
        default: []
    },
    offPeakHours: {
        type: [TimeSlotSchema],
        default: []
    },
    userState: {
        type: String,
        required: true,
        enum: ['Delhi', 'Maharashtra', 'Hyderabad', 'Bangalore', 'Kolkata']
    },
    userDiscountFlag: {
        type: Boolean,
        default: false
    },
    monthlySubsidyUnits: {
        type: Number,
        default: 100
    },
    monthlyConsumption: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PeakHourSettings', PeakHourSettingsSchema);
