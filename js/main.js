$(function() {
var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, QFunctions, AI, Animations, HUD, Music, Objects, UIObjects, SceneFuncs, GameObjects, Pointer")
        .setup("quintus",{development:true, width:$("#content-container").width(), height:$("#content-container").height()})
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
        $("#loading-bar").hide();
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
//When new game is selected, generate a new game state
Q.newGame=function(options){

    Q.state.set("potentialEvents",[]);

    //The main character's object
    var alex = GDATA.chars["Officers.json"]["Officers"].Alex;
    //Gender is based on what the player selected
    alex.gender = options.gender;
    var storyAlex = Q.charGen.generateCharacter(alex);
    Q.partyManager.alex = storyAlex;
    var astraea = Q.charGen.generateCharacter(GDATA.chars["Officers.json"]["Officers"].Astraea);
    astraea.loyalty = 60;
    Q.partyManager.allies = [storyAlex, astraea];
    Q.partyManager.bag = new Q.Bag({items:Q.state.get("saveData")["bag"]});
    Q.partyManager.influence = Q.state.get("saveData").influence;
    Q.partyManager.relations = Q.state.get("saveData").relations;
    //Set up the applications roster
    var freeSpaces = 3;
    for(var i=0;i<freeSpaces;i++){
        Q.partyManager.addToRoster(Q.charGen.generateCharacter());
    };
    Q.state.set(
        "sceneVars",
        Q.state.get("scenesList").Story.filter(function(sc){
            return sc.name===Q.state.get("saveData").startSceneName;
        })[0].vrs
    );
    Q.startScene(Q.state.get("saveData").startSceneType, Q.state.get("saveData").startSceneName, "Pannopolis"/*Q.state.get("saveData").startEventName*/);
    
    $("#hud-money").text(Q.state.get("saveData").money);
    $("#hud-week").text(Q.state.get("saveData").week);
    Q.timeController.week = Q.state.get("saveData").week;
};
//Start the game from the save data
Q.startGame=function(save){
    /*Q.state.set({
        options:save.options
    });
    */
    /*
    var storyChars = [];
    save.characters.story.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });
    save.characters.rand.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });*/
    
    var alex = Q.charGen.generateCharacter(GDATA.chars["Officers.json"]["Officers"].Alex);
    Q.partyManager.alex = alex;
    Q.partyManager.allies = [alex];
    Q.partyManager.bag = new Q.Bag({items:Q.state.get("saveData")["bag"]});
    Q.partyManager.influence = Q.state.get("saveData").influence;
    Q.partyManager.relations = Q.state.get("saveData").relations;
    
    Q.timeController.week = Q.state.get("saveData").week;
    
    //This will be passed in from the save file.
    var freeSpaces = 3;
    for(var i=0;i<freeSpaces;i++){
        Q.partyManager.addToRoster(Q.charGen.generateCharacter());
    };
    Q.startScene(Q.state.get("startSceneType"),Q.state.get("startSceneName"),Q.state.get("startEventName"));
    
    $("#hud-money").text(Q.state.get("saveData").money);
    $("#hud-week").text(Q.state.get("saveData").week);
    
};

function convertTechs(data){
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
    //All base settings for character classes
    Q.state.set("charClasses",GDATA.dataFiles['character-classes.json']);
    
    //A bunch of values for generating random characters
    Q.state.set("charGeneration",GDATA.dataFiles['character-generation.json']);
    //The list of skills and their effects
    Q.state.set("techniques",GDATA.dataFiles['techniques.json']);
    //Puts all of the skills in a single object for easy access
    //Q.state.set("allTechniques",convertTechs(Q.state.get("techniques")));
    //The talents list
    Q.state.set("talents",GDATA.dataFiles['talents.json']);
    //The list of awards and descriptions
    Q.state.set("awards",GDATA.dataFiles['awards.json']);
    //The descriptions for status effects
    Q.state.set("status",GDATA.dataFiles['status.json']);
    //The attributes of each type of tile that can be stepped on.
    Q.state.set("tileTypes",GDATA.dataFiles['tile-types.json']);
    
    //The modules for text replacement
    //Q.state.set("modules",GDATA.dataFiles["modules.json"]);
    //All important story events that happen on a certain week
    //Q.state.set("storyEvents",GDATA.dataFiles["story-events.json"].events);
    //The list of events
    Q.state.set("scenesList",GDATA.dataFiles["scenes-list.json"]);
    //All of the character files
    Q.state.set("characterFiles",GDATA.chars);
    Q.state.set("equipment",GDATA.dataFiles['equipment.json']);
    //Default equipment for enemy generation
    Q.state.set("defaultEquipment",GDATA.dataFiles["default-equipment.json"]);
    //Events that are triggered after doing things
    Q.state.set("flavourEvents",GDATA.dataFiles["flavour-events-list.json"]);
    
    Q.state.set("jobsList",GDATA.dataFiles["jobs-list.json"]);
    Q.state.set("entourageRanks", GDATA.dataFiles["entourage-ranks.json"]);
    
    Q.state.set("saveData",GDATA.dataFiles["new-game.json"]);
    console.log(Q.state.p)
    //UI Objects
    Q.compileSheets("ui/ui-objects.png","json/data/ui-objects.json");
    
    CharacterGenerator.init(Q.state.get("charGeneration"),Q.state.get("equipment"),Q.state.get("defaultEquipment"),Q.state.get("techniques"),Q.state.get("talents"),Q.state.get("awards"));
    
    //Initialize the sprite sheets and make the animations work. -> animations.js
    Q.setUpAnimations();
    
    //Sets and gets options
    Q.optionsController = new Q.OptionsController();
    //Controls music/sounds
    Q.audioController = new Q.AudioController();
    
    //The battle controller holds all battle specific functions. Includes getting range/aoe and the damage calculations in the attackFuncs component
    Q.BatCon = new Q.BattleController();
    //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
    Q.BattleGrid = new Q.BattleGridObject();
    //The character generator used to create random characters and fill in properties from the save data.
    Q.charGen = CharacterGenerator;
    
    //Creates a character stats menu (used in locations and battles)
    Q.characterStatsMenu = new Q.CharacterStatsMenu();
    //Controls changes in tiles (icy, burning,etc);
    Q.modifiedTilesController = new Q.ModifiedTilesController();
    //Shows the ranges
    Q.rangeController = new Q.RangeController();
    //Shows the aoe
    Q.aoeController = new Q.AOEController();
    
    //Any variable functions (set and get)
    Q.variableProcessor = new Q.VariableProcessor();
    //Processes conditions and effects
    Q.groupsProcessor = new Q.GroupsProcessor();
    //Functions for doing things with text
    Q.textProcessor = new Q.TextProcessor();
    //Functions for story scene
    Q.storyController = new Q.StoryController();
    //Functions for the location scene
    Q.locationController = new Q.LocationController();
    
    //Changes week and does other time-related functions
    Q.timeController = new Q.TimeController();
    //Controls adding and removing party members and much more
    Q.partyManager = new Q.PartyManager();
    //Advance jobs each week
    Q.jobsController = new Q.JobsController();
    //Keep track of missions
    Q.missionsController = new Q.MissionsController();
    
    
    //Creates menus (screens)
    Q.menuBuilder = new Q.MenuBuilder();
    
    
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
},{
    progressCallback:Q.progressCallback
});
//Q.debug=true;
});