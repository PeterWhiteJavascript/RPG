window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, QFunctions, AI, Animations, HUD, Music, Objects, UIObjects, SceneFuncs, GameObjects")
        .setup({development: true})
        .touch().controls(true)
        .enableSound();

Q.input.drawButtons = function(){};

//Constants
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

//End Constants

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
        "musicEnabled":false,
        "musicVolume":20,
        "soundEnabled":true,
        "soundVolume":100,
        "textSpeed":3,
        "autoScroll":true,
        "cursorSpeed":3,
        
        "brightness":100,
        "damageIndicators":true,
        "factionHighlighting":true,
        
        "tooltips":true
    },
    //Which tunes have been loaded (so that we don't load music twice)
    loadedMusic:[],
    //The current music
    currentMusic:""
});

//When new game is selected, generate a new game state
Q.newGame=function(options){
    //Load the default starting data
    Q.load("json/data/new-game.json",function(){
        //Set up the save data
        Q.state.set("saveData",Q.assets["json/data/new-game.json"]);
        
        Q.state.set("potentialEvents",[]);
        
        //The main character's object
        var alex = Q.state.get("characters").Alex;
        //Gender is based on what the player selected
        alex.gender = options.gender;
        
        var storyAlex = Q.charGen.generateCharacter(alex,"alex");
        //For now, alex is the only character
        var astraea = Q.charGen.generateCharacter(Q.state.get("characters").Astraea,"officer");
        
        //console.log(legion)
        Q.state.set("allies",[storyAlex,astraea]);
        //Set up the new game bag
        Q.state.set("Bag",new Q.Bag({items:{
            consumable:[
                ["potion",3]
            ],
            weapon:[],
            shield:[],
            body:[],
            feet:[],
            accessory:[],
            key:[]
        }}));
        //Set up the applications roster
        //For now, there will be 4 random characters in it
        var freeSpaces = 4;
        for(var i=0;i<freeSpaces;i++){
            var char = Q.charGen.generateCharacter({},"roster");
            Q.state.get("saveData").applicationsRoster.push(char);
        };
        //TESTING ONLY
        if(Q.state.get("startSceneName")) Q.state.get("saveData").startSceneName = Q.state.get("startSceneName");
        if(Q.state.get("startEventName")) Q.state.get("saveData").startEventName = Q.state.get("startEventName");
        if(Q.state.get("startSceneType")) Q.state.get("saveData").startSceneType = Q.state.get("startSceneType");
        
        //Start a scene
        Q.startScene(Q.state.get("saveData").startSceneType,Q.state.get("saveData").startSceneName,Q.state.get("saveData").startEventName,[Q.state.get("allies")[1]]);
        
    });
};
//Start the game from the save data
Q.startGame=function(save){
    Q.state.set({
        options:save.options
    });
    var storyChars = [];
    save.allies.forEach(function(ally){
        storyChars.push(Q.charGen.generateCharacter(ally));
    });
    Q.state.set("alex",storyChars.filter(function(ally){return ally.name==="Alex";})[0]);
    Q.state.set("allies",storyChars);
    //Set up the Bag.
    Q.state.set("Bag",new Q.Bag({items:save.inventory}));//Q.Bag is in objects.js
    
    Q.startScene(Q.state.get("startSceneType"),Q.state.get("startSceneName"),Q.state.get("startEventName"));
};
var files = [
    //IMAGES SPRITES
    "sprites/archer.png",
    "sprites/assassin.png",
    "sprites/berserker.png",
    "sprites/elementalist.png",
    "sprites/healer.png",
    "sprites/illusionist.png",
    "sprites/legionnaire.png",
    "sprites/skirmisher.png",
    "sprites/vanguard.png",
    
    //IMAGES UI
    "ui/ui_objects.png",
    //IMAGES TILES
    "tiles/tiles.png",
    "tiles/interactables.png",
    //ANIMATIONS
    "animations/SonicBoom.png",
    "animations/Whirlwind.png",
    "animations/Piercing.png",
    //AUDIO SFX
    "sfx/cannot_do.mp3",
    "sfx/coin.mp3",
    "sfx/confirm.mp3",
    "sfx/dying.mp3",
    "sfx/explosion.mp3",
    "sfx/critical_hit.mp3",
    "sfx/glancing_blow.mp3",
    "sfx/hit1.mp3",
    "sfx/inflict_status.mp3",
    "sfx/shooting.mp3",
    "sfx/slashing.mp3",
    "sfx/text_stream.mp3",
    "sfx/whirlwind.mp3",
    //AUDIO BGM
    //"bgm/demo.mp3"
    //JSON DATA
    "json/data/character-generation.json",
    "json/data/equipment.json",
    "json/data/items.json",
    "json/data/locations.json",
    "json/data/character-classes.json",
    "json/data/officers.json",
    "json/data/skills.json",
    "json/data/status.json",
    "json/data/awards.json",
    "json/data/ui_objects.json",
    "json/data/tile_types.json",
    "json/data/modules.json",
    "json/data/story-events.json",
    "json/data/scenes-list.json",
    "json/data/default-equipment.json",
    
    "json/story/global-vars.json"
];
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
        });
    });
    return obj;
};
//Load all of the assets that we need. We should probably load bgm only when necessary as it takes several seconds per file.
Q.load(files.join(','),function(){
    //All equipment data
    Q.state.set("equipment",convertEquipment(Q.assets['json/data/equipment.json']));
    //Items that are not equipment. I may make key items seperate.
    Q.state.set("items",Q.assets['json/data/items.json']);
    //All default values for the locations (used when generating the menus).
    Q.state.set("locations",Q.assets['json/data/locations.json']);
    //All quests that can be taken by the player at the pub.
    Q.state.set("quests",Q.assets['json/data/quests.json']);
    //All base settings for character classes
    Q.state.set("charClasses",Q.assets['json/data/character-classes.json']);
    //The story characters that you can recruit (including alex)
    Q.state.set("characters",Q.assets['json/data/officers.json']);
    //The list of skills and their effects
    Q.state.set("skills",Q.assets['json/data/skills.json']);
    //The list of awards and descriptions
    Q.state.set("awards",Q.assets['json/data/awards.json']);
    //The descriptions for status effects
    Q.state.set("status",Q.assets['json/data/status.json']);
    //The attributes of each type of tile that can be stepped on.
    Q.state.set("tileTypes",Q.assets['json/data/tile_types.json']);
    //A bunch of values for generating random characters
    Q.state.set("charGeneration",Q.assets['json/data/character-generation.json']);
    //The global variables that are set in global-vars.json
    Q.state.set("globalVars",Q.assets['json/story/global-vars.json'].vrs);
    //The modules for text replacement
    Q.state.set("modules",Q.assets["json/data/modules.json"]);
    //All important story events that happen on a certain week
    Q.state.set("storyEvents",Q.assets["json/data/story-events.json"].events);
    //The list of events
    Q.state.set("scenesList",Q.assets["json/data/scenes-list.json"]);
    //All of the character files
    Q.state.set("characterFiles",JSON.parse($("#all-characters").text()));
    //Default equipment for enemy generation
    Q.state.set("defaultEquipment",Q.assets["json/data/default-equipment.json"]);
    
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
    if(document.getElementById("title")&&document.getElementById("title").innerHTML.length){
        var scene = document.getElementById("title").innerHTML;
        var name = document.getElementById("title2").innerHTML;
        var type = document.getElementById("title3").innerHTML;
        Q.state.set("startSceneName",scene);
        Q.state.set("startEventName",name);
        Q.state.set("startSceneType",type);
        Q.state.set(
            "sceneVars",
            Q.state.get("scenesList")[type].filter(function(sc){
                return sc.name===scene;
            })[0].vrs
        );
        Q.load("json/story/events/"+type+"/"+scene+"/"+name+".json",function(){
            Q.state.set("testingScene",Q.assets["json/story/events/"+type+"/"+scene+"/"+name+".json"]);
            var kind = Q.state.get("testingScene").kind;
            switch(kind){
                case "story":
                    Q.newGame({gender:"Female",eventName:name});
                    $(document.body).append('<div id="back-button" class="btn btn-default">TO EDITOR</div>');
                    $(document.body).append('<div id="back-button2" class="btn btn-default">TO EVENTS</div>');
                    $("#back-button").click(function(){
                        var scene = $("#title").text();
                        var name = $("#title2").text();
                        var type = $("#title3").text();
                        var form = $('<form action="_tools/Event-Editor/edit-story-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
                        $("body").append(form);
                        form.submit();
                    });
                    $("#back-button2").click(function(){
                        var scene = $("#title").text();
                        var name = $("#title2").text();
                        var type = $("#title3").text();
                        var form = $('<form action="_tools/Event-Editor/show-events.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
                        $("body").append(form);
                        form.submit();
                    });
                    break;
                case "battleScene":
                    Q.newGame({gender:"Female",eventName:name});
                    $(document.body).append('<div id="back-button" class="btn btn-default">TO SCRIPT</div>');
                    //$(document.body).append('<div id="back-button2" class="btn btn-default">TO CHARACTERS</div>');  
                    $(document.body).append('<div id="back-button3" class="btn btn-default">TO SHOW EVENTS</div>');  
                    $("#back-button").click(function(){
                        var scene = $("#title").text();
                        var name = $("#title2").text();
                        var type = $("#title3").text();
                        var form = $('<form action="_tools/Event-Editor/edit-battleScene-script.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
                        $("body").append(form);
                        form.submit();
                    });
                    /*$("#back-button2").click(function(){
                        var scene = $("#title").text();
                        var name = $("#title2").text();
                        var type = $("#title3").text();
                        var form = $('<form action="_tools/Event-Editor/edit-battleScene-event.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
                        $("body").append(form);
                        form.submit();
                    });*/
                    $("#back-button3").click(function(){
                        var scene = $("#title").text();
                        var name = $("#title2").text();
                        var type = $("#title3").text();
                        var form = $('<form action="_tools/Event-Editor/show-events.php" method="post"><input type="text" name="name" value="'+name+'"><input type="text" name="scene" value="'+scene+'"><input type="text" name="type" value="'+type+'"></form>');
                        $("body").append(form);
                        form.submit();
                    });
                    break;
            }
            
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