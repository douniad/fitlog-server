const express = require('express')
const SummariesService = require('./summaries-service')
const {requireAuth} = require('../middleware/jwt-auth')

const summariesRouter = express.Router()
const jsonBodyParser = express.json()

summariesRouter
.route('/')
.get(requireAuth, (req, res, next) => {
    SummariesService.getAllSummaries(req.app.get('db'), req.user.id)
    .then(summaries => {
        console.log(summaries)
        res.json(summaries.map(SummariesService.serializeSummary))
    })
    .catch(next)
})

.post(requireAuth, jsonBodyParser, (req, res, next) => {
    const {area, duration, satisfaction} = req.body
    const newSummary = {area, duration, satisfaction}

    for (const [key, value] of Object.entries(newSummary))
    if (value == null)
    return res.status(400).json({
        error: `Missing '${key}' in request body`
    })

    SummariesService.insertSummary (
        req.app.get('db'),
        SummariesService.deserializeSummary(newSummary, req.user.id)
    )
    .then(summary => {
        res
        .status(201)
        .json(SummariesService.serializeSummary(summary))
    })
    .catch(next)
})

summariesRouter
.route('/:summary_id')
.all(requireAuth)
.all(checkSummaryExists)
.get((req, res) => {
    res.json(SummariesService.serializeSummary(res.summary))
})
.delete((req, res) => {
    const id = req.params.summary_id

    SummariesService.deleteSummary(
        req.app.get('db'),
        id
    )
    .then(data => {
        res
        .sendStatus(204)
    })
})

/* async/await syntax for promises */
async function checkSummaryExists(req, res, next) {
    try {
      const summary = await SummariesService.getById(
        req.app.get('db'),
        req.params.summary_id
      )
  
      if (!summary)
        return res.status(404).json({
          error: `Summary does not exist`
        })
  
      res.summary = summary
      next()
    } catch (error) {
      next(error)
    }
  }
  
  module.exports = summariesRouter
  