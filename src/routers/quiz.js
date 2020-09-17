const mongoose = require('mongoose')
const express = require('express')
const Quiz = require('../models/quiz')
const User = require('../models/user')

const Submission = require('../models/submission')

const auth = require('../middleware/auth')
const router = new express.Router()
const macro = require('../macros/index')
router.post('/quizzes', auth, async (req, res) => {
    const quizData = {...req.body, owner: req.user._id};
    quizData.startTime = new Date(quizData.startTime * 1000)

    const quiz = new Quiz(quizData)

    try {
        await quiz.save()
        res.status(201).send(quiz)
    } catch (e) {
        console.log(e);
        res.status(400).send()
    }
})

router.delete('/quizzes/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!quiz) {
            res.status(404).send({message:"Quiz id not found"})
        }

        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }

})

router.get('/quizzes/me', auth, async (req, res) => {
    // const match={}
    // const sort = {}

    // if(req.query.completed){
    //     match.completed = req.query.completed==='true'
    // }

    // if(req.query.sortBy){
    //     const parts = req.query.sortBy.split(':')
    //     sort[parts[0]]= parts[1]==='desc'?-1:1
    // }

    try {
        // const tasks = await Task.find({owner:req.user._id})
        // res.send(tasks)
        await req.user.populate({
            path: 'quizzes',
            // match,
            // options:{
            //     limit: parseInt(req.query.limit),
            //     skip: parseInt(req.query.skip),
            //     sort
            // }
        }).execPopulate()
        res.send(req.user.quizzes)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.patch('/quizzes/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    // const allowedUpdates = ['description', 'completed']
    // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    // if (!isValidOperation) {
    //     return res.status(400).send({ error: 'Invalid updates!' })
    // }

    try {
        const quiz = await Quiz.findOne({_id: req.params.id, owner: req.user._id})
        //const task = await Task.findById(req.params.id)


        if (!quiz) {
            return res.status(404).send({message:"Quiz id not found"})
        }

        updates.forEach((update) => quiz[update] = req.body[update])
        await quiz.save()

        res.send(quiz)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.get('/quizzes', auth, async (req, res) => {
    // const match={}
    // const sort = {}

    // if(req.query.completed){
    //     match.completed = req.query.completed==='true'
    // }

    // if(req.query.sortBy){
    //     const parts = req.query.sortBy.split(':')
    //     sort[parts[0]]= parts[1]==='desc'?-1:1
    // }
    let find = {}

    if (req.query.title) {
        find.title = {"$regex": req.query.title, "$options": "i"}
    }

    if (req.query.tag) {
        find.tags = {"$regex": req.query.tag, "$options": "i"}
    }


    const select = "tags _id title duration password startTime owner questions"

    try {

        let quizzes = await Quiz.find(find)
            .sort('-createdAt')
            .skip(parseInt(req.query.skip))
            .limit(parseInt(req.query.limit))
            .select(select)

        for(let i=0;i<quizzes.length;i++){
            await quizzes[i].populate('ownerInfo','name').execPopulate()
            await quizzes[i].populate('submissions').execPopulate()
        }

        quizzes = quizzes.map((quiz) => {
            let newQuiz = quiz.toObject()
            newQuiz.access = quiz.password === macro.NO_PASSWORD ? macro.quizAccess.PUBLIC : macro.quizAccess.PRIVATE
            newQuiz.rating = Math.round(Math.random() * 5 * 1000) / 1000
            newQuiz.difficulty = Math.round(Math.random() * 10 * 1000) / 1000
            newQuiz.ownerName = newQuiz.ownerInfo[0].name
            newQuiz.userCount = newQuiz.submissions.length
            newQuiz.questionCount = newQuiz.questions.length

            delete newQuiz.questions
            delete newQuiz.submissions
            delete newQuiz.ownerInfo
            delete newQuiz.id
            delete newQuiz.password
            return newQuiz
        })


        res.send(quizzes)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.get('/quizzes/:id', auth, async (req, res) => {
    try {
        // console.log(req.params.id)
        let quiz = await Quiz.findOne({_id: req.params.id})
        if (!quiz) {
            return res.status(404).send({message: "Quiz id not found"})
        }

        if (quiz.password !== macro.NO_PASSWORD
            && quiz.password !== req.query.pwd) {
            return res.status(401).send({message: "Incorrect password"})
        }

        quiz = quiz.toObject()

        delete quiz.tags
        delete quiz.password
        delete quiz.responses
        delete quiz.owner
        delete quiz.createdAt
        delete quiz.updatedAt
        // delete quiz.

        quiz.questions.forEach((question) => {
            if (question.type === macro.questionTypes.TEXT) {
                delete question.options
            }
            delete question.answers
        })

        res.send(quiz)
    } catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

router.post('/quizzes/:id', auth, async (req, res) => {
    let userSubmissions = req.body.userSubmissions

    let correct = []
    let incorrect = []
    try {
        let quiz = await Quiz.findOne({_id: req.params.id})

        // console.log(quiz)

        let marks = 0;

        quiz.questions.forEach((question)=>{
            let userSubmissionOfQuestion = userSubmissions.filter((userSubmission)=>{
                return question._id.toString()===userSubmission.questionId
            })[0]

            // console.log(userSubmissionOfQuestion)

            if(question.type===macro.questionTypes.MCQ){
                let correctAnswerCount = question.answers.length

                let userCorrectedCount = 0;

                userSubmissionOfQuestion.answers.forEach((answer)=>{
                    if(question.answers.includes(answer)){
                        userCorrectedCount++;
                    }else{
                        userCorrectedCount = -1;
                    }
                })

                if(userCorrectedCount===correctAnswerCount){
                    correct.push(mongoose.Types.ObjectId(question._id))
                    marks+=question.marks
                }else{
                    incorrect.push(mongoose.Types.ObjectId(question._id))
                }

            }else if(question.type===macro.questionTypes.SINGLE){
                if(question.answers.includes(userSubmissionOfQuestion.answers[0])){
                    correct.push(mongoose.Types.ObjectId(question._id))
                    marks+=question.marks
                }else{
                    incorrect.push(mongoose.Types.ObjectId(question._id))
                }
            }else if(question.type===macro.questionTypes.TEXT){
                if(question.answers.includes(userSubmissionOfQuestion.answers[0])){
                    correct.push(mongoose.Types.ObjectId(question._id))
                    marks+=question.marks
                }else{
                    incorrect.push(mongoose.Types.ObjectId(question._id))
                }
            }
        })



        userSubmissions.forEach((submission) => {
            submission.questionId = mongoose.Types.ObjectId(submission.questionId);
        })

        let finalSubmission = {
            quizId: mongoose.Types.ObjectId(req.params.id),
            userId: req.user._id,
            submissions: userSubmissions,
            correct: correct,
            incorrect: incorrect,
            marks: marks
        }

        // console.log(finalSubmission)
        let submission = new Submission(finalSubmission)
        await submission.save()

        return res.status(201).send(submission)
    } catch (e) {
        console.log(e)
        return res.status(500).send()
    }

})

router.post('/quizzes/review/:id',auth,async (req,res)=>{
    try{
        let submission = await Submission.findOne({_id: req.params.id})
        if(!submission){
            return res.status(404).send({message:"Submission id not found"})
        }
        console.log(req.body.rating)
        submission.rating=req.body.rating;

        await submission.save()
        res.send(submission)
    }catch (e){
        console.log(e)
        return res.status(400).send()
    }
})

module.exports = router