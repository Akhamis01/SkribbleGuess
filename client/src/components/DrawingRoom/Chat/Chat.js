import React from 'react';
import { MDBCol } from "mdbreact";
import ScrollToBottom from 'react-scroll-to-bottom';

import Message from './Message/Message';
import './Chat.css';

const Chat = ({ message, setMessage, sendMessage, messages, name, currentUser, currentDrawer, disableChat }) => {


    return (
        <MDBCol className="drawing-chat-column" size="3">
            <div className="drawing-chat">
                <h1 className="chat-title">Chat</h1>

                <ScrollToBottom className="messages">
                    {messages.map( (message, index) => <div key={index}><Message message={message} name={name}/></div>)}
                </ScrollToBottom>
                {
                    currentUser.name === currentDrawer || disableChat ? (
                        <form className="form">
                            <input className="input"
                                disabled
                                type="text"
                                placeholder="Guess the drawing..."
                                value={message}
                                onChange={ (event) => setMessage(event.target.value)}
                                onKeyPress={ (event) => event.key === 'Enter' ? sendMessage(event) : null} 
                            />
                        </form>
                    ): (
                        <form className="form">
                            <input className="input"
                                type="text"
                                placeholder="Guess the drawing..."
                                value={message}
                                onChange={ (event) => setMessage(event.target.value)}
                                onKeyPress={ (event) => event.key === 'Enter' ? sendMessage(event) : null} 
                            />
                        </form>
                    )
                }
            </div>
        </MDBCol>
    )
};

export default Chat;