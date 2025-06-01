const socket = io('http://localhost:7780');
// const socket = io('https://www.stansgames.fr', {
//     path: '/party/socket.io',
//     transports: ['websocket', 'polling'],
//     withCredentials: true,
//     reconnectionAttempts: 5
// });
const animationData = {};

document.addEventListener('DOMContentLoaded', () => {
    animationData.paramsVisible = true;
    //animationData.state = STATE_WAITING_FOR_PLAYERS;
    socket.emit('animationReady');

});

function debutPartie() {
    socket.emit('animationSkip');
}
