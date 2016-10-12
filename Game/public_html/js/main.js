window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, QFunctions, AI, Animations, HUD, Music, Objects, UIObjects, SceneFuncs")
        .setup({development: true})
        .touch().controls(true)
        .enableSound();

//Constants
//
//Sprites that do not collide with anything are considered sprite_none. 
//This includes all ui elements, objects that are in the foreground, objects that the player can walk over, etc...
Q.SPRITE_NONE = 0;
//sprite_default is for objects that can be collided with normally such as walls, players, 
Q.SPRITE_DEFAULT = 1;
//Each of these sprite types have to do with movement on them, 
//for example it might take twice as much move to go across swamp compared to grass.
Q.SPRITE_GRASS = 2;
Q.SPRITE_DEEPGRASS  = 4;
Q.SPRITE_SWAMP  = 8;
Q.SPRITE_MOUNTAIN  = 16;
Q.SPRITE_WATER  = 32;

//Since this is a top-down game, there's no gravity
Q.gravityY=0;
//The height of the tiles (the width is the same, so just use tileH)
Q.tileH = 64;
//Astar functions used for pathfinding
Q.astar = astar;
//A necessary component of Astar
Q.Graph = Graph;

//End Constants

//Set up the game state's options
//The default value will be overridden by data coming from the save file. TODO
Q.state.set({
    options:{
        //If true, BGM will play
        musicEnabled:true,
        //If true, SFX will play
        soundEnabled:true,
        //The speed at which the text cycles on screen (1,2, or 3)
        textSpeed:1,
        //If true, text will automatically go to the next text after the previous one completes.
        autoScroll:false
    }
});
//When new game is selected, generate a new game state
Q.newGame=function(){
    //Set up the game state with default values
    Q.state.set({
        sceneName:"act1",
        sceneNum:1
    });
    //Start a scene
    //The flow for the game is: dialogue -> battle -> menus -> repeat.
    //startScene is in -> scenes.js
    Q.startScene(Q.state.get("sceneName")+"_"+Q.state.get("sceneNum"));
};
var files = [
    //IMAGES SPRITES
    "sprites/player.png",
    //IMAGES UI
    "ui/ui_objects.png",
    "ui/text_box.png",
    //AUDIO SFX
    "sfx/attack.mp3",
    //AUDIO BGM
    //"bgm/demo.mp3"
    //JSON DATA
    "json/data/items.json",
    "json/data/locations.json",
    //JSON STORY
    "json/story/act1_1.json",
    "json/story/act1_2.json",
    "json/story/act1_3.json",
    //TMX MAPS
    "tmx/homeland.tmx"
];
//Load all of the assets that we need. We should probably load bgm only when necessary as it takes several seconds per file.
Q.load(files.join(','),function(){
    //Most json data should be stored in Q.state for easy retrieval later.
    Q.state.set("items",Q.assets['json/data/items.json']);
    Q.state.set("locations",Q.assets['json/data/locations.json']);
    //You can look in the console to see the items from the items.json file.
    console.log(Q.state.get("items"));
    
    //Initialize the sprite sheets and make the animations work. -> animations.js
    Q.setUpAnimations();
    //For now, just start a new game when we load in. -> main.js
    Q.newGame();
});
Q.debug=true;
});