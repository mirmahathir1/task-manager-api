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

    questions: [{

        description:{
            type:String,
            required: true,
            trim: true,
        },
        options: {
            type: Array
        },
        answers:{
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

    }],
},{
    timestamps: true
})

const Quiz = mongoose.model('Quiz', quizSchema)

module.exports = Quiz