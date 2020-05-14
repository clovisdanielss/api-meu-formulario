const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  var Question = require('./question')(sequelize)
  var Component = require('./component')(sequelize)
  var Answer = sequelize.define('answer', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    idQuestion: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: Question,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALY_IMMEDIATE
      },
      field: 'id_question'
    },
    idComponent: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: Component,
        key: 'id',
        deferrable: Sequelize.Deferrable.INITIALY_IMMEDIATE
      },
      field: 'id_component'
    },
    value: {
      // Não colocar, caso seja imagem.
      // Se for um arquivo, usar o nome.
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: 'answers',
    schema: 'my_forms'
  })

  return Answer
}
