function G(id) {
    return document.getElementById(id);
}

function V(id) {
    return G(id).value;
}

function W(id, contenu) {
    G(id).innerHTML = contenu;
}

function hide(id) {
    G(id).classList.add('cache');
}

function show(id) {
    G(id).classList.remove('cache');
}

function toggle(id) {
    if(G(id).classList.contains('cache')) {
        show(id);
    } else {
        hide(id);
    }
}
function getById(tab, id) {
    for(item of tab) {
        if(item.id == id) {
            return item;
        }
    }
    return null;
}

function getAvatar(avatarData, width = 50, height = 50) {
    avatarData.width = width;
    avatarData.height = height;
    return Avataaars.create(avatarData);
}