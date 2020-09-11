require('./db/mongoose')
const Quiz = require('models/quiz')

// const quiz = n
quizData = {
    title:"Exam on Electric Machinery",
    duration: 30,
    password:"123456",
    startTime:new Date(),
}
const quiz = new Quiz(quizData)

await qask.save()