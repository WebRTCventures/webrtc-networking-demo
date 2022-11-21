import React, { useEffect } from 'react';
import Janus from './utils/janus';
import { subscribeRemoteFeed } from './utils/subscriber';

function JanusSubscriber ({
  janus,
  opaqueId,
  room,
  pubId,
  pubPvtId,
  remotePublishers,
}) {

  const [videoAreaRefs, setVideoAreaRefs] = React.useState([]);

  let remoteStream = null;

  const callback = (_remoteFeed, _remoteFeedIndex, eventType, data) => {
    switch(eventType) {
      case 'onremotetrack':
        remoteStream = data;
        const videoContainer = videoAreaRefs[_remoteFeedIndex];
        const videoPlayer = videoContainer.querySelector('.janus-video-player');

        Janus.attachMediaStream(videoPlayer, remoteStream);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (!janus || !room) {
      return;
    }
    if (remotePublishers.length > 0) {
      remotePublishers.forEach((publisher) => {
        const { id, display, video_codec } = publisher;
        subscribeRemoteFeed({
          janus,
          opaqueId,
          room,
          id,
          pubPvtId,
          display,
          video: video_codec,
          callback
        })
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [janus, room, pubId, pubPvtId, remotePublishers]);

  return (
    Array.isArray(remotePublishers) && remotePublishers.map((publisher, i) => {
      return (
        <div className="janus-subscriber grid-item">
          <div className="janus-video">
            <div 
              className="janus-video-container" 
              ref={(ref) => {videoAreaRefs[publisher.id] = ref}}>
                <video
                  className='janus-video-player'
                  autoPlay
                  playsInline />
            </div>
          </div>
        </div>
      )
    })
  );
}

export default JanusSubscriber;