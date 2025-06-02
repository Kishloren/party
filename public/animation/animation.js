const animationData = {};

document.addEventListener('DOMContentLoaded', () => {
    animationData.paramsVisible = true;
    //animationData.state = STATE_WAITING_FOR_PLAYERS;
    socket.emit('animationReady');

});

function debutPartie() {
    socket.emit('animationSkip');
}
