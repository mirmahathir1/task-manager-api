const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const quizRouter = require('./routers/quiz')
const cors = require('cors');

const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
app.use(quizRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

