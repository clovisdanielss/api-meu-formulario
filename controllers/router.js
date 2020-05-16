const user = require('./user')
const error = require('./error')
const form = require('./form')
const login = require('./login')
const answer = require('./answer')

module.exports = (app, db) => {
  // passport.use('trello', userModel(db).trelloStrategy)
  login(app, db)
  user(app, db)
  form(app, db)
  answer(app, db)
  error(app)
}
