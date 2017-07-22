"use strict";

var ffmpeg = require('fluent-ffmpeg');

function Transcoder() {

  this.play = function(req, res) {
    res.contentType('flv');

    let hdHomerunNetwork = process.env.HDHOMERUN_IP || '192.168.0.22';

    var videoStream = videoConverter(hdHomerunNetwork, req.params.channel);
    videoStream.pipe(res);
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
