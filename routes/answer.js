const express = require('express')
const router = express.Router()
const request = require('request')
const superagent = require('superagent')
const userModel = require('../models/user')
module.exports = (app, db) => {
  const User = userModel(db)

  // Erro quando faltar autorização
  // Aqui jaz a importancia do link ser gerado randomizado.
  router.all('', (req, res, next) => {
    const dbQuery = { id: req.body.idUser }
    User.findOne({ where: dbQuery })
      .then((foundUser) => {
        req.headers.authorization = foundUser.dataValues.lastToken
        next()
      })
      .catch((err) => {
        next(err)
      })
  })
  /**

  Uma resposta de formulário será da forma:
  {
    answers:[
      {
        value:'...',
        type:'...',
        titleQuestion:'...',
      },
      ...
    ],
    idList: '...',
    title:'...'
    idUser:'...'
  }

  **/
  router.post('', (req, res, next) => {
    const answers = req.body.answers
    console.log('RespostaS: ', answers)
    var card = {
      idList: req.body.idList,
      name: req.body.title,
      desc: '',
      due: null
    }
    var lastQuestion = ''
    answers.map((answer) => {
      if (answer.type !== 'date') {
        if (lastQuestion !== answer.titleQuestion) {
          card.desc += '\n' + answer.titleQuestion + '\n'
          lastQuestion = answer.titleQuestion
        }
        card.desc += answer.value + '. '
      } else {
        card.due = new Date(answer.value)
      }
    })
    console.log('Card: ', card)
    superagent.post('https://trello.com/1/cards?key=' +
          process.env.TRELLO_KEY + '&token=' +
           req.headers.authorization).send(card).end((err, _res) => {
      if (err) {
        next(err)
      }
      console.log(_res)
      res.end()
    })
  })
  app.use('/answers', router)
}
