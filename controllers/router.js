const user = require('./user')
const error = require('./error')
const form = require('./form')
module.exports = (app, db) => {
  user(app, db)
  form(app, db)
  error(app)
}
