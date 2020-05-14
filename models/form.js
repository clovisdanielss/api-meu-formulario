const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  var User = require('./user')(sequelize)
  var Form = sequelize.define('form', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    idUser: {
      type: Sequelize.INTEGER,
      references: {
        model: User,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
      allowNull: false,
      field: 'id_user'
    },
    title: {
      type: Sequelize.STRING
    },
    link: {
      type: Sequelize.STRING
    },
    trelloMail: {
      field: 'trello_mail',
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'forms',
    schema: 'my_forms'
  })

  return Form
}
