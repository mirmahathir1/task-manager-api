const express = require('express')
const Quiz = require('../models/quiz')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/quizzes', auth, async (req, res) => {
    const quizData = {...req.body, owner: req.user._id};
    quizData.startTime = new Date(quizData.startTime)

    const quiz = new Quiz(quizData)

    try {
        await quiz.save()
        res.status(201).send(quiz)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

router.delete('/quizzes/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!quiz) {
            res.status(404).send()
        }

        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

module.exports = router