const animationData = {};

document.addEventListener('DOMContentLoaded', () => {
    animationData.paramsVisible = true;
    //animationData.state = STATE_WAITING_FOR_PLAYERS;
    socket.emit('animationReady');

});

function debutPartie() {
    socket.emit('animationSkip');
}

function jeu(name) {
    socket.emit('animationPrepareJeu', name);
}

function ready() {
    socket.emit('animationReadyJeu');
}

function depart() {
    socket.emit('animationDepartJeu');
}

function fin() {
    socket.emit('animationFinJeu')
}

function resultat() {
    socket.emit('animationDemandeResultat');
}

function score() {
    socket.emit('animationDemandeScores');
}