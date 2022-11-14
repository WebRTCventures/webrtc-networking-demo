import React, { useState } from 'react';
import './App.css';
import VideoCall from './components/VideoCall';

function App() {
  const [inCall, setInCall] = useState(false);
  const [room, setRoom] = useState('')
  const [username, setUsername] = useState('')

  const handleJoinCall = () => {
    if (room && username) setInCall(true);
  }
  return (
    <div id="container">
      {inCall ? (
        <>
          <VideoCall 
            room={parseInt(room)} 
            username={username} 
            setInCall={setInCall}/>
        </>
      ) : (
        <div id="form">
          <input 
            type='text' 
            placeholder='Enter Room Number' 
            value={room} 
            onChange={(evt) => setRoom(evt.target.value)} />
          <input 
            type='text' 
            placeholder="Enter Username" 
            value={username} 
            onChange={(evt) => setUsername(evt.target.value)} />
          <button onClick={handleJoinCall}>Join Call</button>
        </div>
      )}
    </div>
  );
}

export default App;
