'use strict';

let express = require('express');

let router = express.Router();

let Chromecast = require('./modules/chromecast');
let chromecast = new Chromecast();

router.get('/cast/:channel', chromecast.cast);
router.get('/cast/:channel/stop', chromecast.stop);

router.get('/:broadCast/:channel', require('./modules/piper'));


module.exports = router;
