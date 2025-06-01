const socket = io('http://localhost:7780');
// const socket = io('https://www.stansgames.fr', {
//     path: '/party/socket.io',
//     transports: ['websocket', 'polling'],
//     withCredentials: true,
//     reconnectionAttempts: 5
// });
const displayData = {};

function cacherSplashscreen(){
    hide('splashscreen');
} 

document.addEventListener('DOMContentLoaded', () => {
    requestWakeLock();
    socket.emit('displayReady');
});

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
        console.log("Erreur wakeLock");
    }
};
