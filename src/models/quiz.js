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
        type: [String],
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
            type: [String]
        },
        answers:{
            type: [String],
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
    }],

},{
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
})

quizSchema.virtual('submissions', {
    ref: 'Submission',
    localField: '_id',
    foreignField: 'quizId'
})

quizSchema.virtual('ownerInfo',{
    ref: 'User',
    localField: 'owner',
    foreignField: '_id'
})


const Quiz = mongoose.model('Quiz', quizSchema)

module.exports = Quiz