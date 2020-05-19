const express = require('express')
const Sequelize = require('sequelize')
const cors = require('cors')
const app = express()
const dotenv = require('dotenv')
const bp = require('body-parser')
const router = require('./routes/router')
const path = require('path')
const fs = require('fs')
// Reading .env file
dotenv.config()

app.mkdir = (path) => {
  fs.mkdir(path, (err) => {
    if (err) {
      console.log(path)
      console.log('Diretório já existe!')
    } else {
      console.log(path)
      console.log('Diretório de usuário criado!')
    }
  })
}

console.log(__dirname)
app.use(express.static(path.join(__dirname, 'public')))
app.PORT = process.env.PORT || 8080
app.URL = process.env.URI
// form deve ter um email vinculado TRELLO
// Database config
const sequelize = new Sequelize(process.env.URL + '?ssl=require',
  {
    dialect: 'postgres',
    ssl: true,
    native: true,
    timezone: '-06:00'
  })

// middlewares
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://meu-formulario.herokuapp.com']
// }))

app.use(cors())

app.use(bp.urlencoded({ extended: true, limit: '10mb' }))
app.use(bp.json({ limit: '10mb' }))
router(app, sequelize)

sequelize.authenticate().then(() => {
  console.log('Conectado ao banco de dados')
  app.listen(app.PORT, (err) => {
    console.log(err ? 'Erro:' + err : 'Conectado a porta ' + app.PORT)
  })
}).catch((err) => {
  console.log('Erro na conexão com o banco', err)
})
