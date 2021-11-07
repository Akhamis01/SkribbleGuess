import React, {useState, useEffect, useRef} from 'react';
import {  MDBContainer, MDBRow, MDBIcon } from "mdbreact";
import querystring from 'query-string';
import io from 'socket.io-client';
import useSound from 'use-sound';

import Winning from '../../../Audio/Kids_Cheering.mp3';
import Losing from '../../../Audio/Fail_1.mp3';
import Correct_Guess from '../../../Audio/Bell_Transition.mp3';
import Next_Round from '../../../Audio/Whoosh_4.mp3';
import Join_Room from '../../../Audio/Cartoon_Accent.mp3';
import Leave_Room from '../../../Audio/Pop_1.mp3';
import Start_Game_Sound from '../../../Audio/among-us-start-sound.mp3';

import InfoBar from '../InfoBar/InfoBar';
import Users from '../Users/Users';
import Canvas from '../Canvas/Canvas';
import Chat from '../Chat/Chat';

import './DrawingPage.css';

let socket;
const ENDPOINT = 'https://skribbleguessbackend.ue.r.appspot.com/';

const DrawingPage = ({ location }) => {

    const [Win_Sound] = useSound(Winning, {volume: 0.2});
    const [Lose_Sound] = useSound(Losing, {volume: 0.2});
    const [Correct_Guess_Sound] = useSound(Correct_Guess, {volume: 0.2});
    const [Next_Round_Sound] = useSound(Next_Round, {volume: 0.2});
    const [Join_Sound] = useSound(Join_Room, {volume: 0.2});
    const [Leave_Sound] = useSound(Leave_Room, {volume: 0.2});
    const [Start_Sound] = useSound(Start_Game_Sound, {volume: 0.2});

    const userIndex = useRef(0);
    const roundTime = useRef(75);
    const timer = useRef(null);

    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [currentUser, setCurrentUser] = useState('');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [userDraw, setUserDraw] = useState({x: null, y: null});
    const [userMove, setUserMove] = useState({x:null, y:null});
    const [userScale, setUserScale] = useState(null);
    const [canvasClear, setCanvasClear] = useState(false);

    const [initialTime, setInitialTime] = useState(null);
    const [startTimer, setStartTimer] = useState(false);
    const [disableButton, setDisableButton] = useState(false);

    const [strokeColor, setStrokeColor] = useState("black");


    const [currentDrawer, setCurrentDrawer] = useState('');
    const [guessWord, setGuessWord] = useState('');
    const [disableChat, setDisableChat] = useState(false);



    // When user joins a room
    useEffect( () => {
        const {name, room} = querystring.parse(location.search);

        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);

        socket.emit('join', { name, room }, (error) => {
            if(error){
                alert(error);
            }
        });

        return () => {
            setName(null);
            setRoom(null);
        };

    }, [location.search]);
    //



    // All socket listeners
    useEffect( () => {
        userIndex.current = 0;

        socket.on('message', (message) => {
            setMessages(messages => [...messages, message]);
        });

        socket.on('currentUser', ({ user }) => {
            setCurrentUser(user);
        });

        socket.on('currentDrawer', ({ drawer }) => {
            setCurrentDrawer(drawer);
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        });

        socket.on('mouse', (offsetX, offsetY) => {
            setUserDraw(prev => ({
                ...prev, x:offsetX, y:offsetY
            }));
        });

        socket.on('move2', (offsetX, offsetY) => {
            setUserMove(prev => ({
                ...prev, x:offsetX, y:offsetY
            }));
        });

        socket.on('scale2', (scale) => {
            setUserScale(scale);
        });

        socket.on('clear2', () => {
            setCanvasClear(true);
            setCanvasClear(false);
        });

        socket.on('canvasClear', () => {
            setCanvasClear(false);
        });

        socket.on('time2', () => {
            setDisableButton(true);
            setInitialTime(roundTime.current);
            setStartTimer(true);
        });

        socket.on('updateUsers2', ({ newUserList, newIndex }) => {
            userIndex.current = newIndex;
            setUsers(newUserList);
        });

        socket.on('setGuessWord', (wordToGuess) => {
            setGuessWord(wordToGuess);
        });

        socket.on('changeTime', (time) => {
            clearInterval(timer.current);
            setInitialTime(time);
        });

        socket.on('setColor2', (color) => {
            setStrokeColor(color);
        });

        socket.on('endGame', () => {
            setStartTimer(false);
        });


        //When user leaves page, disconnect the socket
        return () => {
            socket.close();
        };

    }, []);
    //

    useEffect( () => {
        socket.on('winSound', () => {
            Win_Sound();
        });
    }, [Win_Sound]);

    useEffect( () => {
        socket.on('loseSound', () => {
            Lose_Sound();
        });
    }, [Lose_Sound]);

    useEffect( () => {
        socket.on('correctGuessSound', () => {
            Correct_Guess_Sound();
        });
    }, [Correct_Guess_Sound]);

    useEffect( () => {
        socket.on('nextRoundSound', () => {
            Next_Round_Sound();
        });
    }, [Next_Round_Sound]);

    useEffect( () => {
        socket.on('joinSound', () => {
            Join_Sound();
        });
    }, [Join_Sound]);

    useEffect( () => {
        socket.on('leaveSound', () => {
            Leave_Sound();
        });
    }, [Leave_Sound]);

    useEffect( () => {
        socket.on('startSound', () => {
            Start_Sound();
        });
    }, [Start_Sound]);




    // Sending Messages
    const sendMessage = (event) => {
        event.preventDefault();
        if(message.length === 0) return;
        
        if(message.toLowerCase() === guessWord.toLowerCase()){
            socket.emit('correctGuess', users, () => setMessage(''));
            setDisableChat(true);
        } else{
            socket.emit('sendMessage', message, () => setMessage(''));
        }
    }
    //



    // Drawing Canvas
    const sendDrawing = (offsetX, offsetY) => {
        socket.emit('mouse', offsetX, offsetY);
    }

    const sendMove = (offsetX, offsetY) => {
        socket.emit('move', offsetX, offsetY);
    }

    const sendScale = (scale) => {
        socket.emit('scale', scale);
    }
    //



    // Timer (Start game)
    const timerButtonClick = () => {
        setDisableButton(true);
        setInitialTime(roundTime.current);
        setStartTimer(true);
        socket.emit('clear');
        socket.emit('timer');
        socket.emit('startedGame');
        socket.emit('getWord');
    };
    //


    // When timer ends
    useEffect( () => {
        if(initialTime === 0 && startTimer){
            setDisableChat(false);
            setCanvasClear(true);
            setStrokeColor("black");
            setInitialTime(roundTime.current);
            socket.emit('updateUsers', userIndex.current, users);
            
            if(currentUser.host){
                socket.emit('revealWord', guessWord);
                socket.emit('removeFirstGuess');
                socket.emit('getWord');
            }
        }

        if(initialTime > 0){
            timer.current = setTimeout( () => {
                setInitialTime(initialTime - 1);
            }, 1000);
        }

        // eslint-disable-next-line
    }, [initialTime, startTimer, users, currentUser.host]);
    //


    const colorChange = (color) => {
        setStrokeColor(color);
        socket.emit('setColor', color);
    };
    //




    return (
        <div className="drawing-container">
            <MDBContainer className="drawing-inner-container" fluid={true}>
                <InfoBar currentUser={currentUser} room={room} initialTime={initialTime} currentDrawer={currentDrawer.name} guessWord={guessWord}/>

                <MDBRow className="drawing-canvas-outer">
                    <Users currentUser={currentUser} users={users} />
                    <Canvas strokeColor={strokeColor} sendDrawing={sendDrawing} sendMove={sendMove} userMove={userMove} userDraw={userDraw} sendScale={sendScale} userScale={userScale} currentUser={currentUser} canvasClear={canvasClear} />
                    <Chat message={message} setMessage={setMessage} sendMessage={sendMessage} messages={messages} name={name} currentUser={currentUser} currentDrawer={currentDrawer.name} disableChat={disableChat}/>
                </MDBRow>
                {
                    currentUser.host ? (
                        <button className="drawing-button" hidden={disableButton} onClick={timerButtonClick}>Start Game!</button>
                    ) : null
                }

                {
                    currentUser.name === currentDrawer.name && disableButton ? (
                        <div>
                            <div className={`dot black-dot`} onClick={() => colorChange('black')}></div>
                            <span className={`dot white-dot`} onClick={() => colorChange('white')}></span>
                            <span className={`dot red-dot`} onClick={() => colorChange('red')}></span>
                            <span className={`dot blue-dot`} onClick={() => colorChange('blue')}></span>
                            <span className={`dot green-dot`} onClick={() => colorChange('green')}></span>
                            <span className={`dot yellow-dot`} onClick={() => colorChange('yellow')}></span>
                            <span className="dot fill-color" onClick={() => socket.emit('clear')}><MDBIcon icon="fill-drip" size="3x"/></span>
                        </div>
                    ) : null
                }
            </MDBContainer>
        </div>
    )
};

export default DrawingPage;