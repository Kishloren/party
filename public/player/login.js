const socket = io('http://localhost:7780');

function envoi() {
    if(V('pseudo') != "" && V('pwd') != "") {
        let data = {};
        data.pseudo = V('pseudo');
        data.pwd = V('pwd');
        socket.emit('loginDemandeConnexion', data);
    }
}

socket.on('serverConnexionOK', (id) => {
    window.location.href = "player.html?id=" + id;
});

socket.on('serverConnexionNOK',() => {
    W('uuid', 'Pseudo ou mot de passe incorrect');
});
