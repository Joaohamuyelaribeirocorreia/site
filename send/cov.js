var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();

var command = ffmpeg('input.mp4')
 .audioCodec('libfaac')
  .videoCodec('libx264')
  .format('avi');
  
  command.save('output.avi')