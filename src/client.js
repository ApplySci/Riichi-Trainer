/*
This file does the communications with the server. It will delegates all game tasks down to the SichuanClient object
*/
import React from 'react';
import ReactDOM from 'react-dom';
import openSocket from 'socket.io-client';
import SichuanClient from './states/SichuanClient';
import registerServiceWorker from './serviceWorker';

let socket = openSocket('wss://ws.azps.info/');
let root = document.getElementById('root');

state = {messages: ''};

function addMsg(msg) {
    messages = state.messages + <hr/> + msg;
    setState({messages: messages});
}

socket.on('discard', addMsg);
socket.on('turn', addMsg);

onClick = evt => socket.emit('discard', evt);

ReactDOM.render(
    <section>
    <h1>Communicating</h1>
    <div>{messages}</div>
    </section>
    , root);

registerServiceWorker();