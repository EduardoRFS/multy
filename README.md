# Basic Usage

```javascript
// on express
var Multy = require('multy');

app.use(Multy()); // files returned as stream in req.body
app.use(function (req, res) {
  const image = req.body.image;
  req.send(image.name); // send original name of image
});
```

```javascript
// on koa v2
var Multy = require('multy');

app.use(Multy()); // files returned as stream in ctx.request.body
app.use(ctx => {
  const image = ctx.request.body.image;
  ctx.body = image.name; // send original name of image
});
```
