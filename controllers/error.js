module.exports = (app) => {
  app.use((err, req, res, next) => {
    console.log('Retornando erro para usuário', err.message)
    console.error(err)
    if (!err.status) {
      err.status = 500
    }
    res.status(err.status).json(err)
  })
}
