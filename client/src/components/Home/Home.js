import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MDBInput } from "mdbreact";
import 'animate.css';

import './Home.css';

const Home = () => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [joinBtn, setJoinBtn] = useState('Invite your Friends!');
    const hostRoom = useRef(null);

    useEffect( () => {
        hostRoom.current = hostRoomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }, []);

    useEffect( () => {
        if(room){
            setJoinBtn('Join your Friends!')
        } else{
            setJoinBtn('Invite your Friends!');
        }
    }, [room]);

    const hostRoomString = (length, chars) => {
        var result = '';
        for (var i = length; i > 0; i--) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading animate__animated animate__bounceInDown">SkribbleGuess!</h1>
                <div><MDBInput label="Name" size="lg" labelClass="md-outline" type="text" onChange={ (event) => setName(event.target.value) } /> </div>
                <div><MDBInput label="Room (Leave blank to host)" size="lg" type="text" onChange={ (event) => setRoom(event.target.value) } /> </div>
                {
                    room ? (
                        <Link onClick={ event => (!name) ? event.preventDefault() : null} to={`/DrawingRoom?name=${name}&room=${room}`}>
                            <button className="button button2" type="submit">{joinBtn}</button>
                        
                        </Link>
                    ): (
                        <Link onClick={ event => (!name) ? event.preventDefault() : null} to={`/DrawingRoom?name=${name}&room=${hostRoom.current}`}>
                            <button className=" button button2" type="submit">{joinBtn}</button>
                            
                        </Link>
                    )
                }
            </div>
        </div>
    );
};

export default Home;