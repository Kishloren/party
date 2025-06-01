customData = {};

document.addEventListener('DOMContentLoaded', () => {
    customData.currentAvatarData = parent.getPlayerData();
    W('avatar', getAvatar(customData.currentAvatarData, 150, 150));

    getSkinData();
    getTopData();
    getHairColorData();
    getHatColorData();
    getEyebrowsData();
    getAccessoriesData();
    getAccessoriesColorData();
    getEyesData();
    getMouthData();
    getFacialHairData();
    getFacialHairColorData();
    getClothingData();
    getClothingGraphicData();
    getClothingColorData();
});

function getSkinData() {
    customData.skin={};
    customData.skin.values = Object.keys(Avataaars.colors.skin);
    customData.skin.maxIndex = customData.skin.values.length;
    customData.skin.currentIndex = 0;
    for(let i=0;i<customData.skin.values.length;i++) {
        if(customData.currentAvatarData.skin == customData.skin.values[i]) {
            customData.skin.currentIndex = i;
        }
    }
}

function getTopData() {
    customData.top = {};
    customData.top.values = Object.keys(Avataaars.paths.top);
    customData.top.maxIndex = customData.top.values.length;
    customData.top.currentIndex = 0;
    for(let i=0;i<customData.top.values.length;i++) {
        if(customData.currentAvatarData.top == customData.top.values[i]) {
            customData.top.currentIndex = i;
        }
    }
    
}

function getHairColorData(){
    customData.hairColor = {};
    customData.hairColor.values = Object.keys(Avataaars.colors.hair);
    customData.hairColor.maxIndex = customData.hairColor.values.length;
    customData.hairColor.currentIndex = 0;
    for(let i=0;i<customData.hairColor.values.length;i++) {
        if(customData.currentAvatarData.hairColor == customData.hairColor.values[i]) {
            customData.hairColor.currentIndex = i;
        }
    }
} 

function getHatColorData(){
    customData.hatColor = {};
    customData.hatColor.values = Object.keys(Avataaars.colors.palette);
    customData.hatColor.maxIndex = customData.hatColor.values.length;
    customData.hatColor.currentIndex = 0;
    for(let i=0;i<customData.hatColor.values.length;i++) {
        if(customData.currentAvatarData.hatColor == customData.hatColor.values[i]) {
            customData.hatColor.currentIndex = i;
        }
    }
} 


function getEyebrowsData() {
    customData.eyebrows = {};
    customData.eyebrows.values = Object.keys(Avataaars.paths.eyebrows);
    customData.eyebrows.maxIndex = customData.eyebrows.values.length;
    customData.eyebrows.currentIndex = 0;
    for(let i=0;i<customData.eyebrows.values.length;i++) {
        if(customData.currentAvatarData.eyebrows == customData.eyebrows.values[i]) {
            customData.eyebrows.currentIndex = i;
        }
    }
}

function getAccessoriesData() {
    customData.accessories = {};
    customData.accessories.values = Object.keys(Avataaars.paths.accessories);
    customData.accessories.maxIndex = customData.accessories.values.length;
    customData.accessories.currentIndex = 0;
    for(let i=0;i<customData.accessories.values.length;i++) {
        if(customData.currentAvatarData.accessories == customData.accessories.values[i]) {
            customData.accessories.currentIndex = i;
        }
    }
}

function getAccessoriesColorData(){
    customData.accessoriesColor = {};
    customData.accessoriesColor.values = Object.keys(Avataaars.colors.palette);
    customData.accessoriesColor.maxIndex = customData.accessoriesColor.values.length;
    customData.accessoriesColor.currentIndex = 0;
    for(let i=0;i<customData.accessoriesColor.values.length;i++) {
        if(customData.currentAvatarData.accessoriesColor == customData.accessoriesColor.values[i]) {
            customData.accessoriesColor.currentIndex = i;
        }
    }
} 

function getEyesData() {
    customData.eyes = {};
    customData.eyes.values = Object.keys(Avataaars.paths.eyes);
    customData.eyes.maxIndex = customData.eyes.values.length;
    customData.eyes.currentIndex = 0;
    for(let i=0;i<customData.eyes.values.length;i++) {
        if(customData.currentAvatarData.eyes == customData.eyes.values[i]) {
            customData.eyes.currentIndex = i;
        }
    }
} 

function getMouthData() {
    customData.mouth = {};
    customData.mouth.values = Object.keys(Avataaars.paths.mouth);
    customData.mouth.maxIndex = customData.mouth.values.length;
    customData.mouth.currentIndex = 0;
    for(let i=0;i<customData.mouth.values.length;i++) {
        if(customData.currentAvatarData.mouth == customData.mouth.values[i]) {
            customData.mouth.currentIndex = i;
        }
    }
} 


function getFacialHairData() {
    customData.facialHair = {};
    customData.facialHair.values = Object.keys(Avataaars.paths.facialHair);
    customData.facialHair.maxIndex = customData.facialHair.values.length;
    customData.facialHair.currentIndex = 0;
    for(let i=0;i<customData.facialHair.values.length;i++) {
        if(customData.currentAvatarData.facialHair == customData.facialHair.values[i]) {
            customData.facialHair.currentIndex = i;
        }
    }
    
}

function getFacialHairColorData(){
    customData.facialHairColor = {};
    customData.facialHairColor.values = Object.keys(Avataaars.colors.hair);
    customData.facialHairColor.maxIndex = customData.facialHairColor.values.length;
    customData.facialHairColor.currentIndex = 0;
    for(let i=0;i<customData.facialHairColor.values.length;i++) {
        if(customData.currentAvatarData.facialHairColor == customData.facialHairColor.values[i]) {
            customData.facialHairColor.currentIndex = i;
        }
    }
} 

function getClothingData() {
    customData.clothing = {};
    customData.clothing.values = Object.keys(Avataaars.paths.clothing);
    customData.clothing.maxIndex = customData.clothing.values.length;
    customData.clothing.currentIndex = 0;
    for(let i=0;i<customData.clothing.values.length;i++) {
        if(customData.currentAvatarData.clothing == customData.clothing.values[i]) {
            customData.clothing.currentIndex = i;
        }
    }
    
}

function getClothingGraphicData() {
    customData.clothingGraphic = {};
    customData.clothingGraphic.values = Object.keys(Avataaars.paths.clothingGraphic);
    customData.clothingGraphic.maxIndex = customData.clothingGraphic.values.length;
    customData.clothingGraphic.currentIndex = 0;
    for(let i=0;i<customData.clothingGraphic.values.length;i++) {
        if(customData.currentAvatarData.clothingGraphic == customData.clothingGraphic.values[i]) {
            customData.clothingGraphic.currentIndex = i;
        }
    }
    
}

function getClothingColorData(){
    customData.clothingColor = {};
    customData.clothingColor.values = Object.keys(Avataaars.colors.palette);
    customData.clothingColor.maxIndex = customData.clothingColor.values.length;
    customData.clothingColor.currentIndex = 0;
    for(let i=0;i<customData.clothingColor.values.length;i++) {
        if(customData.currentAvatarData.clothingColor == customData.clothingColor.values[i]) {
            customData.clothingColor.currentIndex = i;
        }
    }
} 

function moins(carac) {
    let element = eval('customData.' + carac); 
    element.currentIndex--;
    if(element.currentIndex < 0) {
        element.currentIndex = element.maxIndex - 1; 
    }
    redraw();
}

function plus(carac) {
    let element = eval('customData.' + carac);
    element.currentIndex++;
    if(element.currentIndex >= element.maxIndex) {
        element.currentIndex = 0;
    } 
    redraw();
} 

function redraw() {
    customData.currentAvatarData.skin = customData.skin.values[customData.skin.currentIndex];
    customData.currentAvatarData.top = customData.top.values[customData.top.currentIndex];
    customData.currentAvatarData.hairColor = customData.hairColor.values[customData.hairColor.currentIndex];
    customData.currentAvatarData.hatColor = customData.hatColor.values[customData.hatColor.currentIndex];
    customData.currentAvatarData.eyebrows = customData.eyebrows.values[customData.eyebrows.currentIndex];
    customData.currentAvatarData.eyes = customData.eyes.values[customData.eyes.currentIndex];
    customData.currentAvatarData.mouth = customData.mouth.values[customData.mouth.currentIndex];
    customData.currentAvatarData.accessories = customData.accessories.values[customData.accessories.currentIndex];
    customData.currentAvatarData.accessoriesColor = customData.accessoriesColor.values[customData.accessoriesColor.currentIndex];
    customData.currentAvatarData.facialHair = customData.facialHair.values[customData.facialHair.currentIndex];
    customData.currentAvatarData.facialHairColor = customData.facialHairColor.values[customData.facialHairColor.currentIndex];
    customData.currentAvatarData.clothing = customData.clothing.values[customData.clothing.currentIndex];
    customData.currentAvatarData.clothingColor = customData.clothingColor.values[customData.clothingColor.currentIndex];
    customData.currentAvatarData.clothingGraphic = customData.clothingGraphic.values[customData.clothingGraphic.currentIndex];
    
    W('avatar', getAvatar(customData.currentAvatarData, 150, 150));
    parent.updateAvatar(customData.currentAvatarData);
} 