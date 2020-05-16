const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: Sequelize.STRING, unique: true, allowNull: false },
    lastToken: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'last_token'
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
