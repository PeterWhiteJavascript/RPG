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
//sprite_default is for objects that can be collided with normally such as walls, players 
//THIS WILL PROBABLY NOT BE USED AS ALL MOVEMENT WILL BE CALCUALTED AND THERE WILL BE NO ROAMING OVERWORLD
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
//The width of the tiles
Q.tileW = 32;
//The height of the tiles
Q.tileH = 32;
//Astar functions used for pathfinding
Q.astar = astar;
//A necessary component of Astar
Q.Graph = Graph;
//The highest rank for weapons
Q.maxEquipmentRank = 2;
//End Constants

//Set up the game state's options
//The default values will be overridden by data coming from the save file. TODO
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

//Sort the equipment by rank so it doesn't have to be done every time
Q.organizeEquipment=function(){
    var eq = Q.state.get("equipment");
    //This is the highest rank that we've added in the game
    var ranks = Q.maxEquipmentRank;
    eq.weaponSorted = [];
    eq.shieldSorted = [];
    eq.bodySorted = [];
    eq.feetSorted = [];
    eq.accessorySorted = [];
    
    var types = ["weapon","shield","body","feet","accessory"];
    //Loop through each type
    for(var i=0;i<types.length;i++){
        //Create the sorted array in the equipment object
        var srt =  eq[types[i]+"Sorted"] = [];
        //Loop through the total ranks
        for(var j=1;j<=ranks;j++){
            //Create an empty array at this rank at fill it with all euqipment of this rank from this type
            srt[j-1] = [];
            var type = types[i];
            //Get all of the different types of equipment
            var keys = Object.keys(eq[type]);
            for(var k=0;k<keys.length;k++){
                //If the equipment's rank is equal to the current rank, put it into this array
                if(eq[type][keys[k]].rank===j){
                    srt[j-1].push(eq[type][keys[k]]);
                }
            }
        }
    }
    console.log(eq);
};
//When new game is selected, generate a new game state
Q.newGame=function(options){
    //Set up the game state with default values
    Q.state.set({
        //The scene name. This does not have to be 'act', but it does have to match the json.
        sceneName:"act1",//"side_quest1",
        //The scene within the act
        sceneNum:1,
        //The quests that have been accepted. Array full of strings
        acceptedQuests:[]
    });
    //The main character's object
    var alex = Q.state.get("characters").alex;
    alex.gender = options.gender;
    var storyAlex = Q.setUpStoryCharacter(alex);
    Q.state.set("alex",storyAlex);
    //For now, alex is the only character
    Q.state.set("allies",[storyAlex]);
    //Start a scene
    Q.startScene(Q.state.get("sceneName")+"_"+Q.state.get("sceneNum"));
};
var files = [
    //IMAGES SPRITES
    "sprites/archer.png",
    "sprites/barbarian.png",
    "sprites/knight.png",
    //IMAGES UI
    "ui/ui_objects.png",
    "ui/text_box.png",
    //IMAGES TILES
    "tiles/tiles.png",
    //AUDIO SFX
    "sfx/attack.mp3",
    //AUDIO BGM
    //"bgm/demo.mp3"
    //JSON DATA
    "json/data/equipment.json",
    "json/data/items.json",
    "json/data/locations.json",
    "json/data/quests.json",
    "json/data/character_classes.json",
    "json/data/characters.json",
    "json/data/attacks.json",
    //JSON STORY
    "json/story/act1_1.json",
    "json/story/act1_2.json",
    "json/story/act1_3.json"
    //TMX MAPS
];
//Load all of the assets that we need. We should probably load bgm only when necessary as it takes several seconds per file.
Q.load(files.join(','),function(){
    //All equipment data
    Q.state.set("equipment",Q.assets['json/data/equipment.json']);
    //Items that are not equipment. I may make key items seperate.
    Q.state.set("items",Q.assets['json/data/items.json']);
    //All default values for the locations (used when generating the menus). This value will be modified from the save file, but it is default here on load. This will help keep the save files small as it will only save information that has been changed.
    Q.state.set("locations",Q.assets['json/data/locations.json']);
    //All quests that can be taken by the player at the pub. This value will be modified with data from the save file.
    Q.state.set("quests",Q.assets['json/data/quests.json']);
    //All base settings for character classes
    Q.state.set("charClasses",Q.assets['json/data/character_classes.json']);
    //The story characters that you can recruit (including alex)
    Q.state.set("characters",Q.assets['json/data/characters.json']);
    //The list of attacks and their effects
    Q.state.set("attacks",Q.assets['json/data/attacks.json']);
    Q.organizeEquipment();
    //Initialize the sprite sheets and make the animations work. -> animations.js
    Q.setUpAnimations();
    //For now, just start a new game when we load in. -> main.js
    Q.newGame({gender:"female"});
});
//Q.debug=true;
});