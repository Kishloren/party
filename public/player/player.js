const playerData = {};

document.addEventListener('DOMContentLoaded', () => {
    requestWakeLock();
    playerData.myId = new URLSearchParams(window.location.search).get('id');
    // 
    //socket.emit('playerConnexion', playerData.myId);


});

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
        console.log("Erreur wakeLock");
    }
};

// traitement des messages
socket.on('serverDonneesJoueur', (data) => {
    if(data.id == playerData.myId) {
        playerData.me = data;
        W('pseudo', playerData.me.pseudo);
        W('testAvatar',getAvatar(data.avatar));
    }
});


socket.on('connect', () => {
    console.log("Connected with ID:", socket.id);
    socket.emit('playerConnexion', playerData.myId);
});

socket.on('connect_error', (err) => {
    console.error("Socket connection error:", err);
});
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('message', (msg) => {
    console.log('Received message:', msg);
});

function customizeAvatar() {
    if(G('avatarFrame').src.indexOf('empty.html') != -1) {
        G('avatarFrame').src = 'custom.html';
    }
    toggle('avatarFrame');
    toggle('gameFrame');
}

function getPlayerData() { 
    return playerData.me.avatar;
} 

function updateAvatar(avatarData) {
    playerData.me.avatar = avatarData;
    W('testAvatar',getAvatar(playerData.me.avatar));
    socket.emit('playerUpdateData', playerData.me);
}