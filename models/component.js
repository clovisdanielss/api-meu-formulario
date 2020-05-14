const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  var Question = require('./question')(sequelize)
  var Component = sequelize.define('component', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    idQuestion: {
      type: Sequelize.INTEGER,
      references: {
        model: Question,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALY_IMMEDIATE
      },
      field: 'id_question',
      allowNull: false
    },
    text: { type: Sequelize.STRING },
    type: { type: Sequelize.STRING, allowNull: false }
  }, {
    timestamps: false,
    tableName: 'components',
    schema: 'my_forms'
  })

  return Component
}
