const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  var Form = require('./form')(sequelize)
  var Question = sequelize.define('question', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    idForm: {
      type: Sequelize.INTEGER,
      references: {
        model: Form,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
      },
      field: 'id_form',
      allowNull: false
    },
    title: {
      type: Sequelize.STRING
    },
    required: {
      type: Sequelize.BOOLEAN
    }
  }, {
    timestamps: false,
    tableName: 'questions',
    schema: 'my_forms'
  })

  return Question
}
