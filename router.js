'use strict';

let express = require('express');

let router = express.Router();

// let Chromecast = require('./modules/chromecast');
// let chromecast = new Chromecast();

let Transcoder = require('./modules/transcoder');
let transcoder = new Transcoder();

router.get('/stream/:channel', transcoder.play);

module.exports = router;
