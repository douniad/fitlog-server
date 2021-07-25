const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    
  ]
}

function makeSummariesArray(users) {

  return [
    {
      id: 1,
      duration: 'first duration',
      area: 'first area',
      satisfaction: 'first satisfaction',
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      duration: 'second duration',
      area: 'second area',
      satisfaction: 'second satisfaction',
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      duration: 'third duration',
      area: 'third area',
      satisfaction: 'third satisfaction',
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      duration: 'fourth duration',
      area: 'fourth area',
      satisfaction: 'fourth satisfaction',
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      duration: 'fifth duration',
      area: 'fifth area',
      satisfaction: 'fifth satisfaction',
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 6,
      duration: 'sixth duration',
      area: 'sixth area',
      satisfaction: 'sixth satisfaction',
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 7,
      duration: 'seventh duration',
      area: 'seventh area',
      satisfaction: 'seventh satisfaction',
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}


function makeSummariesFixtures() {
  const testUsers = makeUsersArray()
  const testSummaries = makeSummariesArray(testUsers)
  return { testUsers, testSummaries }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users,
        summary
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE summaries_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('summaries_id_seq', 0)`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedSummariesTables(db, users, summaries=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('summary').insert(summaries)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('summary_id_seq', ?)`,
      [summaries[summaries.length - 1].id],
    )
  })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeSummariesArray,
  makeSummariesFixtures,
  cleanTables,
  seedSummariesTables,
  makeAuthHeader,
  seedUsers,
}