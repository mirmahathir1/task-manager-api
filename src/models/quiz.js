const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
    },
    duration: {
        type: Number,
    },
    password:{
        type:String,
    },
    startTime:{
        type: Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    tags:{
        type: Array,
    },
    questions: [{
        description:{
            type:String,
            required: true,
            trim: true,
        },
        type:{
            type:String,
            required: true,
        },
        marks:{
            type: Number,
            default: 1,
        },
        options: {
            type: Array
        },
        answers:{
            type: Array,
        },

    }],
    responses: [{
        low:{
            type: Number,
        },
        high:{
            type: Number
        },
        message:{
            type: String,
            trim: true
        }
    }]
},{
    timestamps: true
})

const Quiz = mongoose.model('Quiz', quizSchema)

module.exports = Quiz