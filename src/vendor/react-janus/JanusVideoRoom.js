import React from 'react';

const JanusVideoRoom = ({ children, janus}) => {
    return (
        <div className="janus-video-room">
            <div className="grid-container">
            {children &&
                children.length && 
                    children.map((child, i) => (
                        React.cloneElement(child, { janus: janus, key: i })
                    ))
            }
            {children &&
                !children.length && 
                    React.cloneElement(children, { janus: janus })
            }
            </div>
        </div>
    );
}

export default JanusVideoRoom