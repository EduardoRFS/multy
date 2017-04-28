const fs = require('fs')
const Multy = require('multy')
const app = new (require('koa'))()
const router = require('koa-Router')()

app.use(router)

router.use(Multy())
router.get('/', ctx => {
  ctx.body = `
    <form action="/" method="post" enctype="multipart/form-data">
      Select file to upload:
      <input type="file" name="file">
      <input type="submit" value="Upload" name="submit">
    </form>
  `
})
router.post('/', ctx => {
  const { file } = ctx.request.body
  const stream = fs.createWriteStream('potato.jpg')
  ctx.body = 'potato'
  return new Promise((resolve, reject) => {
    file
      .pipe(stream)
      .on('close', _ => resolve())
      .on('error', reject)
  })
})
app.listen(3000)
