require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const summariesRouter = require('./summaries/summaries-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
  }))

app.use(helmet())
app.use(cors())
app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/summaries', summariesRouter)
app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    console.error(error)
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        
        response = {message: error.message, error}
    }
    res.status(500).json(response)
})

module.exports = app