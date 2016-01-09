"use strict";

var ffmpeg = require('fluent-ffmpeg');

module.exports = function piper(req, res) {
  //TODO move hdhomerun selection (finding via mdns?) to seperate module
  let hdHomerunNetwork;
  if(req.params.broadCast === 'cable') {
    hdHomerunNetwork = process.env.HDHOMERUN_CABLE_IP || '192.168.0.60';
  } else {
    hdHomerunNetwork = process.env.HDHOMERUN_OTA_IP || '192.168.0.61'
  }

  res.contentType('flv');
  videoStream(hdHomerunNetwork, req.params.channel).pipe(res);
}

function videoStream(ip, channel) {
  var pathToMovie =  'http://' + ip +':5004/auto/v' + channel;
  var outputOptions = process.env.FFMPEG_OUTPUT_OPTIONS || ['-preset ultrafast', '-tune fastdecode', '-tune zerolatency', '-threads 2','-async 1'];
  return ffmpeg(pathToMovie)
    .format('avi')
    .videoBitrate('1024k')
    .videoCodec('libx264')
    .size('720x?')
    .audioBitrate('128k')
    .audioCodec('libmp3lame')
    .outputOptions(outputOptions)
    .on('error', function(err) {
      this.emit( "end" );
      console.log('An error happened with ffmpeg: ' + err.message, err);
    })
    .on('codecData', function(data) {
      console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
    });
}