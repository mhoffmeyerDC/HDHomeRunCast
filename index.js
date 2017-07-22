var express = require('express');

var app = express();

app.use('/', require('./router'));

//Enable CORS
app.use(function(req, res, next) {
  if(req.headers.origin) {
    res.headers['Access-Control-Allow-Origin'] = req.headers.origin;
  }
  next();
});

app.listen(process.env.PORT || 7000, function() {
  console.log("Listening on port 7000.");
});
