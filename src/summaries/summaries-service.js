const xss = require('xss')

const SummariesService = {
  getAllSummaries(db, user_id) {
    return db
      .from('summary')
      .select('*')
      .where({user_id})
  },

  getById(db, id) {
    return SummariesService.getAllSummaries(db)
      .where('id', id)
      .first()
  },

  serializeSummary(summary) {
    return {
      id: summary.id,
      date_created: summary.date_created,
      area: summary.area.split(','),
      duration: summary.duration,
      satisfaction: summary.satisfaction
    }
  },

  deserializeSummary(summary, user_id){
    return {
      user_id: user_id,
      id: summary.id,
      date_created: summary.date_created,
      area: summary.area.join(','),
      duration: summary.duration,
      satisfaction: summary.satisfaction
    }
  },

  insertSummary(db, newSummary) {
    return db
      .insert(newSummary)
      .into('summary')
      .returning('*')
      .then(([summary]) => summary)
  },

  removeSummary(db, id) {
    return db('summary')
    .where({id})
    .del()
  }


}

module.exports = SummariesService
