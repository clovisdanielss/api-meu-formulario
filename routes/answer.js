const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const fs = require('fs')
const superagent = require('superagent')
const userModel = require('../models/user')
const path = require('path')

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
    const idUser = req.body.idUser.toString()
    app.mkdir(path.join('public', idUser))
    var card = {
      idList: req.body.idList,
      name: req.body.title,
      desc: '',
      due: null,
      pos: 'top'
    }
    var lastQuestion = ''
    answers.map((answer, key) => {
      if (answer.type !== 'date' && answer.type !== 'file') {
        if (lastQuestion !== answer.titleQuestion) {
          card.desc += '\n**' + answer.titleQuestion + '**\n'
          lastQuestion = answer.titleQuestion
          card.desc += answer.value
        } else {
          card.desc += ' - ' + answer.value
        }
      } else if (answer.type === 'date') {
        card.due = new Date(answer.value)
      } else {
        var name = crypto.randomBytes(4).toString('hex')
        var arr = answer.value.name.split('.')
        var ext = '.' + arr[arr.length - 1]
        name += ext
        var b = Buffer.from(answer.value.data)

        fs.writeFile(path.join('public', idUser, name), b, (err) => {
          if (err) {
            return next(err)
          } else {
            console.log('Arquivo salvo')
          }
        })
        card.urlSource = process.env.THIS + '/' + path.join(idUser, name)
      }
    })
    superagent.post('https://trello.com/1/cards?key=' +
          process.env.TRELLO_KEY + '&token=' +
           req.headers.authorization).send(card).end((err, _res) => {
      if (err) {
        return next(err)
      }
      res.end()
    })
  })
  app.use('/answers', router)
}
