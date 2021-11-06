import React, {useState, useEffect, useRef } from 'react';
import { MDBCol } from "mdbreact";

import './Canvas.css';

const Canvas = ({ strokeColor, sendDrawing, sendMove, userMove, userDraw, sendScale, userScale, currentUser, canvasClear }) => {

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const scale = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect( () => {
        const canvas = canvasRef.current;
        canvas.width = canvas.parentNode.offsetWidth-25;
        canvas.height = canvas.parentNode.offsetHeight;
        canvas.style.width = `${canvas.parentNode.offsetWidth-25}px`;
        canvas.style.height = `${canvas.parentNode.offsetHeight}px`;

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.strokeStyle = "blue";
        context.lineWidth = 5;
        contextRef.current = context;
    }, []);

    useEffect( () => {
        contextRef.current.beginPath();
        contextRef.current.strokeStyle = strokeColor;
    }, [strokeColor]);

    useEffect( () => {
        if(canvasClear){
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            finishDrawing();
        }
    }, [canvasClear]);


    useEffect( () => {
        scale.current = canvasRef.current.width / userScale;
    }, [userScale])

    useEffect( () => {
        const {x, y} = userDraw;
        contextRef.current.lineTo(x * scale.current, y * scale.current);
        contextRef.current.stroke();
    }, [userDraw])

    useEffect( () => {
        const {x, y} = userMove;
        contextRef.current.moveTo(x * scale.current, y * scale.current);
    }, [userMove])


    const startDrawing = ({ nativeEvent }) => {
        contextRef.current.beginPath();
        const {offsetX, offsetY} = nativeEvent;
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        sendScale(canvasRef.current.width);
        sendMove(offsetX, offsetY);
    }


    const draw = ({ nativeEvent }) => {
        const {offsetX, offsetY} = nativeEvent;
        if(!isDrawing){
            return;
        }
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        sendDrawing(offsetX, offsetY);
    }


    const finishDrawing = () => {
        contextRef.current.beginPath();
        setIsDrawing(false);
    }

    
    return (
        <MDBCol className="canvas-col" size="6">
            {
                currentUser.isDrawing ? (
                    <canvas 
                        className="drawing-canvas b-black"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={finishDrawing}
                        ref={canvasRef}
                    />
                ): (
                    <canvas className="drawing-canvas b-black" ref={canvasRef}/>
                )
            }
        </MDBCol>
    )
};

export default Canvas;