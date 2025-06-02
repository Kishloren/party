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
