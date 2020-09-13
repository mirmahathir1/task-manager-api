const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    quizId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Quiz'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    submissions:{
        type: Array,
    },
    correct: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    incorrect: {
        type: [mongoose.Schema.Types.ObjectId]
    },
    marks:{
        type:Number
    },
    rating:{
        type:Number
    }

},{
    timestamps: true
})




const Submission = mongoose.model('Submission', submissionSchema)

module.exports = Submission