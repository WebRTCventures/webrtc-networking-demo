import React, { useEffect, useRef } from 'react';
import Janus from './utils/janus';
import { publishOwnFeed, publishToRoom } from './utils/publisher';

function JanusPublisher({
  janus,
  opaqueId,
  room,
  secret,
  pin,
  username,
  setPubId,
  setPubPvtId,
  setRemotePublishers,
  unsetRemotePublisher,
  publisherHandle,
  setPublisherHandle
}) {
  const videoArea = useRef(null);
  let mystream = null;

  const callback = (_publisherHandle, eventType, data) => {
    setPublisherHandle(_publisherHandle);
    switch (eventType) {
      case 'joined':
        const { id, private_id, publishers } = data

        setPubId(id);
        setPubPvtId(private_id);

        if (publishers && publishers.length > 0) {
          setRemotePublishers(publishers);
        }
        break;
      case 'publishers':
        if (data.publishers && data.publishers.length > 0) {
          setRemotePublishers(data.publishers);
        }
        break;
      case 'onlocaltrack':
        mystream = data;
        const videoContainer = videoArea.current;
        const videoPlayer = videoContainer.querySelector(".janus-video-player");

        Janus.attachMediaStream(videoPlayer, mystream);
        break;
      case 'unpublished':
        unsetRemotePublisher({
          id: data.unpublished
        });
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    publishToRoom({
      janus,
      opaqueId,
      room,
      secret,
      pin,
      username,
      callback
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [janus]);

  useEffect(() => {
    if (publisherHandle) {
      console.log('publishing...');
      publishOwnFeed({
        publisherHandle,
        audio: false, // no audio for this demo
        video: true
      })
    }
  }, [publisherHandle]);

  return (
    <div className={"janus-publisher grid-item"}>
      <div className="janus-video">
        <div className='janus-video-container' ref={videoArea}>
          <video
            className='janus-video-player'
            autoPlay
            playsInline />
        </div>
      </div>
    </div>
  )
}

export default JanusPublisher;