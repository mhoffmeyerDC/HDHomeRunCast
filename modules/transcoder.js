"use strict";

var ffmpeg = require('fluent-ffmpeg');
var TransformStream = require('./transformStream');

var _ = require('highland');

function Transcoder() {
  var stream = null;

  this.pauseStream = function(req, res) {
    ts.pause();
    res.send("Paused");
  }

  this.resumeStream = function(req, res) {
    ts.resume();
    res.send("Resumed");
  }

  var ts = new TransformStream();

  this.play = function(req, res) {
    res.contentType('flv');

    //TODO move hdhomerun selection (finding via mdns?) to seperate module
    // let hdHomerunNetwork;
    let hdHomerunNetwork = process.env.HDHOMERUN_CABLE_IP || '192.168.0.209';
    // if (req.params.broadCast === 'cable') {
    //   hdHomerunNetwork = process.env.HDHOMERUN_CABLE_IP || '192.168.0.60';
    // } else {
    //   hdHomerunNetwork = process.env.HDHOMERUN_OTA_IP || '192.168.0.61'
    // }

    var videoStream = videoConverter(hdHomerunNetwork, req.params.channel);
    var through = _();

    videoStream.pipe(ts).pipe(res);
  }



  function streamRegulator(s) {
    stream = s;
    return s;

    // return es.through(setTimeout(function() {
    //   console.log("pausing");
    //   ps.pause();
    //   setTimeout(function() {
    //     console.log("resuming");
    //     ps.resume();
    //   }, 5000);
    // }, 5000));

    // console.log("streamRegulator")
    // return through(
    //   function write(data) {
    //     console.log(data);
    //     this.emit('data', data);
    //     //this.pause()
    //   }
    // );
  }

  /**
   * @param  {string} ip - IP Address of the HDHomerun Tuner
   * @param  {string} channel - Channel to tune
   * @return {Readable} ffmpeg - Video stream returned from ffmpeg in x264
   */
  function videoConverter(ip, channel) {
    var pathToMovie = 'http://' + ip + ':5004/tuner1/v' + channel;
    var outputOptions = process.env.FFMPEG_OUTPUT_OPTIONS || ['-preset ultrafast', '-tune fastdecode', '-tune zerolatency', '-threads 2', '-async 1'];
    return ffmpeg(pathToMovie)
      .format('avi')
      .videoBitrate('2048k')
      .videoCodec('libx264')
      .size('720x?')
      .audioBitrate('128k')
      .audioCodec('libmp3lame')
      .outputOptions(outputOptions)
      .on('error', function(err) {
        this.emit("end");
        console.log('An error happened with ffmpeg: ' + err.message, err);
      })
      .on('codecData', function(data) {
        console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
      });
  }
}

module.exports = Transcoder;
