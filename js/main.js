window.addEventListener("load", function() {
var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, QFunctions, AI, Animations, HUD, Music, Objects, UIObjects, SceneFuncs, GameObjects")
        .setup({development: true})
        .touch().controls(true)
        .enableSound();

Q.input.drawButtons = function(){};

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

Q.progressCallback = function(loaded,total){
    var progress = Math.floor(loaded/total*100);
    var str = progress+"%";
    $("#bar-top").width(str);
    $("#bar-text").text(str);
    if(loaded===total){
        $("#loading-screen").hide();
    }
};
//Wraps the text to fit inside a container.
//Really useful for long descriptions
//Automatically run when the label is changed and the text is inside a container
//label is the new incoming label
//maxWidth is either the textWidth property of the container that the text is in, or it is the container's w
//I might delete this if we only use css for this display.
Q.UI.Text.prototype.wrapLabel = function(label,maxWidth){
    var ctx = Q.ctx;
    var split = label.split(' ');
    var newLabel = '';
    var tempLabel = '';
    var spaceWidth = ctx.measureText(" ").width;
    var spaces = 0;
    //Loop through the array of the split label
    for(var i=0;i<split.length;i++){
        //Run regex to get rid of extra line breaks (Optimally, the logic could be improved to not need this)
        //This is only needed for the streaming text for Dialogue. Maybe the label for that should be saved before this modification or something
        split[i] = split[i].replace(/(\r\n|\n|\r)/gm,"");
        //The upcoming width for this word
        var nextWidth = split[i]?ctx.measureText(split[i]).width:0;
        for(var j=0;j<split[i].length;j++){
            var measured = ctx.measureText(tempLabel);
            //Move to a new line
            if(measured.width+nextWidth+spaceWidth*spaces>=maxWidth){
                newLabel+="\n";
                tempLabel = '';
                spaces = 0;
            } else {
                tempLabel+=split[i][j];
            }
        }
        newLabel+=split[i];
        if(i!==split.length-1){
            newLabel+=" ";
        }
        spaces++;
    }
    return newLabel;
};

//Set up the game state's options
//The default values will be overridden by data coming from the save file.
Q.state.set({
    options:{
        musicEnabled:false,
        musicVolume:20,
        soundEnabled:true,
        soundVolume:100,
        textSpeed:3,
        autoScroll:true,
        cursorSpeed:3,
        
        brightness:100,
        damageIndicators:true,
        factionHighlighting:true,
        
        cannotRecallMove:false,
        
        tooltips:true
    },
    //Which tunes have been loaded (so that we don't load music twice)
    loadedMusic:[],
    //The current music
    currentMusic:""
});

//When new game is selected, generate a new game state
Q.newGame=function(options){
    Q.state.set("saveData",GDATA.game["new-game.json"]);

    Q.state.set("potentialEvents",[]);

    //The main character's object
    var alex = Q.state.get("characters").Alex;
    //Gender is based on what the player selected
    alex.gender = options.gender;
    var storyAlex = Q.charGen.generateCharacter(alex,"alex");
    var astraea = Q.charGen.generateCharacter(Q.state.get("characters").Astraea,"officer");
    astraea.combatStats.hp = 0;
    astraea.wounded = 111;
    var random1 = Q.charGen.generateCharacter({},"roster");
    random1.combatStats.hp = 0;
    random1.wounded = 5;
    var random2 = Q.charGen.generateCharacter({},"roster");
    random2.combatStats.hp = 0;
    random2.wounded = 5;
    //console.log(legion)
    Q.state.set("allies",[storyAlex,astraea,random1,random2]);
    //Set up the new game bag
    Q.state.set("Bag",new Q.Bag({items:Q.state.get("saveData")["inventory"]}));
    //Set up the applications roster
    //At the start of the game, there will be 10 random characters in it and they will all be venorian
    var freeSpaces = 10;
    for(var i=0;i<freeSpaces;i++){
        var char = Q.charGen.generateCharacter({nationality:"Venorian"},"roster");
        Q.state.get("saveData").applicationsRoster.push(char);
    };
    Q.state.set(
        "sceneVars",
        Q.state.get("scenesList").Story.filter(function(sc){
            return sc.name===Q.state.get("saveData").startSceneName;
        })[0].vrs
    );
    
    //Start a scene
    Q.startScene(Q.state.get("saveData").startSceneType,Q.state.get("saveData").startSceneName,Q.state.get("saveData").startEventName);
        
};
//Start the game from the save data
Q.startGame=function(save){
    /*Q.state.set({
        options:save.options
    });
    */
    Q.state.set("saveData",save);
    
    Q.state.set(
        "sceneVars",
        Q.state.get("scenesList").Story.filter(function(sc){
            return sc.name===Q.state.get("saveData").startSceneName;
        })[0].vrs
    );
    /*
    var storyChars = [];
    save.characters.story.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });
    save.characters.rand.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });*/
    
    var alex = Q.state.get("characters").Alex;
    var storyAlex = Q.charGen.generateCharacter(alex,"alex");
    Q.state.set("alex",storyAlex);
    Q.state.set("allies",[storyAlex]);
    //Set up the Bag.
    Q.state.set("Bag",new Q.Bag({items:save.inventory}));//Q.Bag is in objects.js
    Q.startScene(Q.state.get("startSceneType"),Q.state.get("startSceneName"),Q.state.get("startEventName"));
};

function convertEquipment(data){
    var obj = {
        gear:{},
        Quality:data.Quality,
        Materials:data.Materials
    };
    var keys = ["Weapons","Shields","Armour","Footwear","Accessories"];
    keys.forEach(function(key){
        var gears = Object.keys(data[key]);
        gears.forEach(function(gear){
            obj.gear[gear] = data[key][gear];
            obj.gear[gear].kind = key;
            obj.gear[gear].name = gear;
        });
    });
    return obj;
};
function convertSkills(data){
    var charClasses = Q.state.get("charGeneration").classNames;
    var techs = {};
    for(var i=0;i<charClasses.length;i++){
        for(var j=0;j<data[charClasses[i]].length;j++){
            techs[data[charClasses[i]][j].name] = data[charClasses[i]][j];
        }
    }
    return techs;
    
}
//Load all of the assets that we need. We should probably load bgm only when necessary as it takes several seconds per file.
var toLoad = [];
var fileKeys = Object.keys(GDATA);
//TEMP: don't load music on every page refresh. Music also won't be loaded unless enabled, so if it's set to off, then loading times while testing will be great.
delete GDATA["bgm"];
for(var i=0;i<fileKeys.length;i++){
    var files = GDATA[fileKeys[i]];
    if(Array.isArray(files)){
        toLoad.push(files);
        delete GDATA[fileKeys[i]];
    }
}
toLoad.push("json/story/global-vars.json");
toLoad.push("json/data/ui-objects.json");
Q.load(toLoad.join(","),function(){
    //All equipment data
    Q.state.set("equipment",convertEquipment(GDATA.game["equipment.json"]));
    //Items that are not equipment. I may make key items seperate.
    Q.state.set("items",GDATA.game["items.json"]);
    //All base settings for character classes
    Q.state.set("charClasses",GDATA.game['character-classes.json']);
    //The story characters that you can recruit (including alex)
    Q.state.set("characters",GDATA.game['officers.json']);
    //A bunch of values for generating random characters
    Q.state.set("charGeneration",GDATA.game['character-generation.json']);
    //The list of skills and their effects
    Q.state.set("skills",GDATA.game['skills.json']);
    //Puts all of the skills in a single object for easy access
    Q.state.set("allSkills",convertSkills(Q.state.get("skills")));
    //The talents list
    Q.state.set("talents",GDATA.game['talents.json']);
    //The list of awards and descriptions
    Q.state.set("awards",GDATA.game['awards.json']);
    //The descriptions for status effects
    Q.state.set("status",GDATA.game['status.json']);
    //The attributes of each type of tile that can be stepped on.
    Q.state.set("tileTypes",GDATA.game['tile-types.json']);
    //The global variables that are set in global-vars.json
    Q.state.set("globalVars",GDATA.game['global-vars.json'].vrs);
    //The modules for text replacement
    Q.state.set("modules",GDATA.game["modules.json"]);
    //All important story events that happen on a certain week
    Q.state.set("storyEvents",GDATA.game["story-events.json"].events);
    //The list of events
    Q.state.set("scenesList",GDATA.game["scenes-list.json"]);
    //All of the character files
    Q.state.set("characterFiles",GDATA.chars);
    //Default equipment for enemy generation
    Q.state.set("defaultEquipment",GDATA.game["default-equipment.json"]);
    //Events that are triggered after doing things
    Q.state.set("flavourEvents",GDATA.game["flavour-events-list.json"]);
    
    //UI Objects
    Q.compileSheets("ui/ui-objects.png","json/data/ui-objects.json");
    
    //Initialize the sprite sheets and make the animations work. -> animations.js
    Q.setUpAnimations();
    
    //The battle controller holds all battle specific functions
    Q.BatCon = new Q.BattleController();
    //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
    Q.BattleGrid = new Q.BattleGridObject();
    //The character generator used to create random characters and fill in properties from the save data.
    Q.charGen = new Q.CharacterGenerator();
    //The functions that take text from the modules.json
    Q.textModules = new Q.TextModules();
    
    /* TESTING EVENT */
    //testing = {type:"Story",scene:"Act-1-1",name:"Start"};
    if(testing){
        var scene = testing.scene;
        var event = testing.event;
        var type = testing.type;
        Q.state.set("startSceneName",scene);
        Q.state.set("startEventName",event);
        Q.state.set("startSceneType",type);
        Q.load("json/save/sample_save_data.json",function(){
            Q.startGame(Q.assets["json/save/sample_save_data.json"]);
        });
    } 
    /* END TESTING EVENT */
    else {
    //For now, just start a new game when we load in. -> main.js
        Q.newGame({gender:"Female"});
    }
    //Start the game from the JSON save data
    //Q.startGame(Q.assets['json/save/sample_save_data.json']);
    //Make it so that you can open the options menu at all times
    //For now, press space or z to load
    Q.input.on("fire",Q,"loadOptions");
},{
    progressCallback:Q.progressCallback
});
//Checks if the user wants to go to the options menu
Q.loadOptions = function(){
    if(!Q.stage(4)){
        Q.pauseAllStages();
        Q.stageScene("optionsMenu",4);
    } else  {
        Q.clearStage(4);
        Q.unpauseAllStages();
    }
};
//Q.debug=true;
});