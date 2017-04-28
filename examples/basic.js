const fs = require('fs')
const Multy = require('../')
const app = require('express')()

app.use(Multy())
app.get('/', (req, res) => {
  res.type('html')
  res.end(`
    <form action="/" method="post" enctype="multipart/form-data">
      Select file to upload:
      <input type="file" name="file">
      <input type="submit" value="Upload" name="submit">
    </form>
  `)
})
app.post('/', (req, res) => {
  const { file } = req.body
  const stream = fs.createWriteStream('batata.jpg')
  file.pipe(stream).on('close', _ => res.end('batata'))

})
app.listen(3000)
