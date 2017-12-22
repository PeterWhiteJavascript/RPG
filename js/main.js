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
    Q.state.set("saveData",GDATA.game["new-game.json"]);

    Q.state.set("potentialEvents",[]);

    //The main character's object
    var alex = GDATA.chars["Officers.json"]["Officers"].Alex;
    //Gender is based on what the player selected
    alex.gender = options.gender;
    var storyAlex = Q.charGen.generateCharacter(alex,"officer");
    var astraea = Q.charGen.generateCharacter(GDATA.chars["Officers.json"]["Officers"].Astraea,"officer");
    astraea.combatStats.hp = 0;
    astraea.wounded = 111;
    var random1 = Q.charGen.generateCharacter({},"roster");
    random1.combatStats.hp = 0;
    random1.wounded = 5;
    var random2 = Q.charGen.generateCharacter({},"roster");
    random2.combatStats.hp = 0;
    random2.wounded = 5;
    //console.log(legion)
    Q.partyManager.alex = storyAlex;
    Q.partyManager.allies = [storyAlex,astraea,random1,random2];
    Q.partyManager.bag = new Q.Bag({items:Q.state.get("saveData")["inventory"]});
    Q.partyManager.influence = Q.state.get("saveData").influence;
    Q.partyManager.relations = Q.state.get("saveData").relations;
    //Set up the applications roster
    var freeSpaces = 10;
    for(var i=0;i<freeSpaces;i++){
        var char = Q.charGen.generateCharacter({nationality:"Venorian"},"roster");
        Q.partyManager.roster.push(char);
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
    
    /*
    var storyChars = [];
    save.characters.story.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });
    save.characters.rand.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });*/
    
    var alex = Q.charGen.generateCharacter(GDATA.chars["Officers.json"]["Officers"].Alex,"officer");
    var astraea = Q.charGen.generateCharacter(GDATA.chars["Officers.json"]["Officers"].Astraea,"officer");
    Q.partyManager.alex = alex;
    Q.partyManager.allies = [alex,astraea];
    Q.partyManager.bag = new Q.Bag({items:Q.state.get("saveData")["inventory"]});
    Q.partyManager.influence = Q.state.get("saveData").influence;
    Q.partyManager.relations = Q.state.get("saveData").relations;
    
    Q.timeController.week = Q.state.get("saveData").week;
    $("#hud-money").text(Q.state.get("saveData").money);
    $("#hud-week").text(Q.state.get("saveData").week);
    
    //This will be passed in from the save file.
    var freeSpaces = 10;
    for(var i=0;i<freeSpaces;i++){
        Q.partyManager.addToRoster(Q.charGen.generateCharacter({nationality:"Venorian"},"roster"));
    };
    //Set up the Bag.
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
    
    //The modules for text replacement
    //Q.state.set("modules",GDATA.game["modules.json"]);
    //All important story events that happen on a certain week
    //Q.state.set("storyEvents",GDATA.game["story-events.json"].events);
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
    
    //Controls music/sounds
    Q.audioController = new Q.AudioController();
    //Sets and gets options
    Q.optionsController = new Q.OptionsController();
    
    //The battle controller holds all battle specific functions
    Q.BatCon = new Q.BattleController();
    //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
    Q.BattleGrid = new Q.BattleGridObject();
    //The character generator used to create random characters and fill in properties from the save data.
    Q.charGen = new Q.CharacterGenerator();
    
    //Creates a character stats menu (used in locations and battles)
    Q.characterStatsMenu = new Q.CharacterStatsMenu();
    
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
    
    $("body").append("<div id='HUD-container'><div><span>Money: </span><span id='hud-money'></span></div><div><span>Week: </span><span id='hud-week'></span></div></div>");
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