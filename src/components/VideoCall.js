import React, { useState } from 'react';
import {
  JanusComponent,
  JanusPublisher,
  JanusSubscriber,
  JanusVideoRoom
} from '../vendor/react-janus';

function VideoCall({janus, room, username, setInCall}) {
  const [pubId, setPubId] = useState(null);
  const [pubPvtId, setPubPvtId] = useState(null);
  const [remotePublishers, setRemotePublishers] = useState([]);
  const [publisherHandle, setPublisherHandle] = useState(null);

  return (
    <>
      <JanusComponent 
        server="/janus"
        iceUrls='stun:stun.l.google.com:19302'>
        <JanusVideoRoom>
          <JanusPublisher
            opaqueId={username}
            room={room}
            username={username}
            setPubId={_pubId => setPubId(_pubId)}
            setPubPvtId={_pubPvtId => setPubPvtId(_pubPvtId)}
            setRemotePublishers={_remotePublishers => {
              _remotePublishers.forEach(newPublisher => {
                setRemotePublishers(prevState => [...prevState, newPublisher])
              });
            }}
            unsetRemotePublisher={_remotePublisher => {
              setRemotePublishers(prevState => prevState.filter((p, i) => (
                p.id !== _remotePublisher.id
              )));
            }}
            publisherHandle={publisherHandle}
            setPublisherHandle={_publisherHandle => setPublisherHandle(_publisherHandle)}/>
          <JanusSubscriber
            opaqueId={username}
            room={room}
            pubId={pubId}
            pubPvtId={pubPvtId}
            remotePublishers={remotePublishers}/>
        </JanusVideoRoom>
      </JanusComponent>
    </>
  )
}

export default VideoCall;