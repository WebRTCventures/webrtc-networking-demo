import Janus from './janus';
// publisher helper

export function publishToRoom({
  janus,
  opaqueId, 
  room, 
  secret, 
  pin, 
  username, 
  isPublisher, 
  callback}) {
  let publisherHandle = null;
  let mystream = null;

  if (!janus) {
    return;
  }

  janus.attach({
    plugin: 'janus.plugin.videoroom',
    opaqueId: opaqueId,
    success: function (pluginHandle) {
      publisherHandle = pluginHandle;
      Janus.log('  -- This is a publisher/manager');
      const exists = {
        request: 'exists',
        room
      }
      publisherHandle.send({
        message: exists,
        success: data => {
          var register = {
            request: 'join',
            room: room,
            ptype: 'publisher',
            display: username || '',
          };
          if (!data.exists) {
            const create = {
              request: 'create',
              room
            }
            publisherHandle.send({
              message: create,
              success: () => {
                publisherHandle.send({ message: register });
              }
            });
          } else {
            publisherHandle.send({ message: register });
          }
        }
      });
    },
    error: function (error) {
      Janus.log('  -- Error attaching plugin...', error);
      callback(publisherHandle, 'error', error);
    },
    consentDialog: function (on) {
      Janus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now');
    },
    mediaState: function (medium, on) {
      Janus.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium);
    },
    iceState: function (on) {
      if (on === 'disconnected') {
        const reload = () => document.location.reload();
        window.reloadingTimeout = setTimeout(reload, 1000 * 3);
      } else if (window.reloadingTimeout) {
        clearTimeout(window.reloadingTimeout);
        window.reloadingTimeout = null;
      }
    },
    webrtcState: function (on) {
      Janus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now');
    },
    onmessage: function (msg, jsep) {
      Janus.debug(' ::: Got a message (publisher) :::');
      Janus.debug(msg);

      Janus.log('Got message', msg);

      const event = msg.videoroom;
      if (event !== undefined && event != null) {
        if (event === 'joined') {
          callback(publisherHandle, 'joined', msg);
        } else if (event === 'destroyed') {
          Janus.warn('The room has been destroyed!');
          callback(publisherHandle, 'destroyed', event);
        } else if (event === 'event') {
          if (msg.error !== undefined && msg.error !== null) {
            callback(publisherHandle, 'error', msg);
          } else if (msg.publishers !== undefined && msg.publishers !== null) {
            callback(publisherHandle, 'publishers', msg);
          } else if (msg['leaving'] !== undefined && msg['leaving'] !== null) {
            callback(publisherHandle, 'leaving', msg);
          } else if (msg['unpublished'] !== undefined && msg['unpublished'] !== null) {
            callback(publisherHandle, 'unpublished', msg);
          }
        }
      }

      if (jsep !== undefined && jsep !== null) {
        Janus.debug('Handling SDP as well...');
        Janus.debug(jsep);
        publisherHandle.handleRemoteJsep({ jsep: jsep });
        // Check if any of the media we wanted to publish has
        // been rejected (e.g., wrong or unsupported codec)
        var audio = msg['audio_codec'];
        if (
          mystream &&
          mystream.getAudioTracks() &&
          mystream.getAudioTracks().length > 0 &&
          !audio
        ) {
          // Audio has been rejected
          Janus.log("Our audio stream has been rejected, viewers won't hear us");
        }
        var video = msg['video_codec'];
        if (
          mystream &&
          mystream.getVideoTracks() &&
          mystream.getVideoTracks().length > 0 &&
          !video
        ) {
          Janus.log("Our video stream has been rejected, viewers won't see us");
        }
      }
    },
    onlocaltrack: function (track) {
      Janus.debug(' ::: Got a local stream :::');
      const stream = new window.MediaStream();
      stream.addTrack(track.clone());
      mystream = stream;
      callback(publisherHandle, 'onlocaltrack', mystream);
    },
    onremotetrack: function (stream) {
      // The publisher stream is sendonly, we don't expect anything here
    },
    oncleanup: function () {
      Janus.log(' ::: Got a cleanup notification: we are unpublished now :::');
      callback(publisherHandle, 'oncleanup');
    },
  });

  return publisherHandle;
}

export function publishOwnFeed({publisherHandle, audio, video}) {
  let specificCamera = false;
  if (video && video.deviceId) {
    specificCamera = true;
  }
  const media = !specificCamera
    ? { audioRecv: false, videoRecv: false, audioSend: !!audio, videoSend: !!video }
    : { audioRecv: false, videoRecv: false, audioSend: !!audio, videoSend: !!video, video };
  // Publish our stream
  publisherHandle.createOffer({
    // Add data:true here if you want to publish datachannels as well
    media,
    simulcast: false,
    success: function (jsep) {
      Janus.debug('Got publisher SDP!');
      Janus.debug(jsep);

      var publish = { request: 'configure', audio: !!audio, video: !!video };
      publisherHandle.send({ message: publish, jsep: jsep });
    },
    error: function (error) {
      Janus.error('WebRTC error:', error);
      if (!!audio && !!video) {
        publishOwnFeed(publisherHandle, audio, false);
      } else {
        Janus.log('Error publishing feed: ' + error);
      }
    },
  });
}

export function unpublishOwnFeed(publisherHandle) {
  var unpublish = { request: 'unpublish' };
  publisherHandle.send({ message: unpublish });
}
