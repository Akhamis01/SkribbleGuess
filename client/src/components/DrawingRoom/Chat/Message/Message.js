import React from 'react';

import './Message.css';

const Message = ({ message: {user, text}, name }) => {
    
    let isSentByCurrentUser = false;
    const trimmedName = name.trim().toLowerCase();

    if(user === trimmedName){
        isSentByCurrentUser = true;
    }

    return (
        isSentByCurrentUser
        ? (
            <div className="messageContainer justifyStart">
                <p className="pr-10 messageText"><span className="sentText-from">{user}</span>: {text}</p>
            </div>
        ) : (
            <div className="messageContainer justifyStart">
                <p className="pr-10 messageText"><span className="sentText-to">{user}</span>: {text}</p>
            </div>
        )
    )
};

export default Message;