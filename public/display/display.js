const displayData = {};

document.addEventListener('DOMContentLoaded', () => {
    requestWakeLock();
    socket.emit('displayReady');

    socket.on('serverTousJoueurs', (data) => {
        const joueurs = trieJoueurs(data, 'ALPHA');
        afficheListeJoueurs(joueurs);
    })

    socket.on('serverPrepareJeu', (data) => {
        W('info', data.titre);
        G('imageCentrale').src = data.imageTitre;
    }) 

    socket.on('serverAllScores', (data) => {
         afficheListeJoueurs(data);
    })

    socket.on('serverResultatsCoup', (data) => {
        afficheScoresCoup(data);
    });
});

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request("screen");
    } catch (err) {
        console.log("Erreur wakeLock");
    }
};

function cacherSplashscreen(){
    hide('splashscreen');
} 

function trieJoueurs(joueurs, tri) {
    switch(tri) {
        case 'ALPHA' : 
            return joueurs.sort((a,b) => a.pseudo.localeCompare(b.pseudo));
        break;
    }
}

function afficheListeJoueurs(joueurs) {
    displayData.joueurs = joueurs;
    let tab = `<table>`;
    for(j of joueurs) {
        tab += `<tr><td>` + j.pseudo + `</td><td>` + getAvatar(j.avatar) + `</td><td>` + j.score + `</td></tr>`;
    }
    tab += `</table>`;
    W('listeScores', tab);
}

function afficheScoresCoup(joueurs) {
    let tab = `<table>`;
    for(j of joueurs) {
        if(j.gagne) {
            tab += `<tr><td>` + j.pseudo + `</td><td>` + getAvatar(j.avatar) + `</td><td>` + j.temps + `s</td><td>` + j.nbPoints + `</td></tr>`;
        }
    }
    tab += `</table>`;
    W('resultatCoup', tab);
}
