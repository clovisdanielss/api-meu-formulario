const user = require('./user')
const error = require('./error')
const form = require('./form')
const login = require('./login')

module.exports = (app, db) => {
  // passport.use('trello', userModel(db).trelloStrategy)
  login(app, db)
  user(app, db)
  form(app, db)
  error(app)
}
