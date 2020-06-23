const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const fs = require('fs')
const superagent = require('superagent')
const userModel = require('../models/user')
const path = require('path')
const AWS = require('aws-sdk')
AWS.config.update({
  region:'sa-east-1'
})

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

  async function createFiles (idUser, name, b) {
    const s3 = new AWS.S3()
    let bucketParams = {
      Bucket:"bucket-meu-formulario",
      ACL : "public-read",
      Body : b,
      Key : "public/" + path.join(idUser, name)
    }
    s3.upload(bucketParams,(err,data)=>{
      console.log(err,data)
    })
  }

  function searchFor (answers, string) {
    for (let i = 0; i < answers.length; i++) {
      if (answers[i].titleQuestion === string) {
        return answers[i].value
      }
    }
  }

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
    var files = []
    app.mkdir(path.join('public', idUser))
    var card = {
      idList: req.body.idList,
      name: searchFor(answers, 'Nome da Postagem'),
      desc: '',
      due: null,
      pos: 'top'
    }
    var lastQuestion = ''
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i]
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
        const name = answer.value.name.toLowerCase()
        var b = Buffer.from(answer.value.data)
        createFiles(idUser, name, b)
        files.push({
          url: process.env.STATIC + '/' + path.join(idUser, name),
          name: name,
          mimeType:answer.value.mimeType
        })
      }
    }
    console.log('New card: ', card)
    req.files = files
    superagent.post('https://trello.com/1/cards?key=' +
          process.env.TRELLO_KEY + '&token=' +
           req.headers.authorization).send(card).end((err, _res) => {
      if (err) {
        return console.error(err)
      }
      req.id = _res.body.id
      next()
    })
  })

  router.post('', (req, res, next) => {
    if (req.files.length >= 1) {
      req.files.map((file, key) => {
        file.id = req.id
        superagent.post('https://trello.com/1/cards/' + req.id +
       '/attachments?key=' + process.env.TRELLO_KEY +
       '&token=' + req.headers.authorization)
          .send(file).end()
      })
    }
    res.end()
  })

  app.use('/answers', router)
}
