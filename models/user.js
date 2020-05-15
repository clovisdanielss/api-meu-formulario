const Sequelize = require('sequelize')
const crypto = require('crypto')

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    mail: { type: Sequelize.STRING, unique: true, allowNull: false },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      set (password) {
        const hash = crypto.createHash('sha512')
        password = password + this.mail
        hash.update(password)
        password = hash.digest('hex')
        this.setDataValue('password', password)
      }
    }
  }, {
    timestamps: false,
    tableName: 'users',
    schema: 'my_forms'
  })

  // const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
  // const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
  // const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'

  return User
}
