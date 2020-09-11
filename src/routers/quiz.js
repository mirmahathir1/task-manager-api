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

router.get('/quizzes/me',auth,async (req,res)=>{
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

router.patch('/quizzes/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    // const allowedUpdates = ['description', 'completed']
    // const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    // if (!isValidOperation) {
    //     return res.status(400).send({ error: 'Invalid updates!' })
    // }

    try {
        const quiz = await Quiz.findOne({_id:req.params.id,owner:req.user._id})
        //const task = await Task.findById(req.params.id)



        if (!quiz) {
            return res.status(404).send()
        }

        updates.forEach((update) => quiz[update] = req.body[update])
        await quiz.save()

        res.send(quiz)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router