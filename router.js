'use strict';

let express = require('express');

let router = express.Router();

let Chromecast = require('./modules/chromecast');
let chromecast = new Chromecast();

let Transcoder = require('./modules/piper');
let transcoder = new Transcoder();

router.get('/cast/:channel', chromecast.cast);
router.get('/cast/:channel/stop', chromecast.stop);

router.get('/:broadCast/:channel', transcoder.play);
router.get('/pause', transcoder.pauseStream);
router.get('/resume', transcoder.resumeStream);


module.exports = router;
