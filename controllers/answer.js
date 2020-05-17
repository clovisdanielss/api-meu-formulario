const express = require('express')
const router = express.Router()
const request = require('request')
const superagent = require('superagent')

module.exports = (app, db) => {
  // Erro quando faltar autorização
  app.use('/answers', (req, res, next) => {
    if (req.headers && req.headers.authorization) {
      next()
    } else {
      const err = new Error('Sem autorização')
      err.status = 300
      next(err)
    }
  })
  /**

  Uma resposta de formulário será da forma:
  {
    answers:[
      {
        value:'...',
        type:'...',
        titleQuestion:'...',
        titleForm:'...',
      },
      ...
    ],
    idList: '...'
  }

  **/
  router.post('', (req, res, next) => {
    const answers = req.body.answers
    console.log('RespostaS: ', answers)
    var card = {
      idList: req.body.idList,
      name: answers[0].titleForm,
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
