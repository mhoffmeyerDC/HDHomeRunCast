var ffmpeg = require('fluent-ffmpeg');

module.exports = function piper(req, res) {
  if(req.params.broadCast === 'cable') {
    ip = 60;
  } else {

  }

  res.contentType('flv');

  var pathToMovie = 'http://192.168.0.'+ip+':5004/auto/v' + req.params.channel;
  var proc = ffmpeg(pathToMovie)
    .format('avi')
    .videoBitrate('1024k')
    .videoCodec('libx264')
    .size('720x?')
    .audioBitrate('128k')
    .audioCodec('libmp3lame')
    .outputOptions(['-preset ultrafast', '-tune fastdecode', '-tune zerolatency', '-threads 2','-async 1'])

    .on('end', function() {
      console.log('file has been converted succesfully');
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message, err);
    })
    .on('codecData', function(data) {
      console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
    })
    .pipe(res, {end:true});

    return res;
}