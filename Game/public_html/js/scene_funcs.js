Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene){
        Q.load("json/story/"+scene+".json",function(){
            var data = Q.assets["json/story/"+scene+".json"];
            //Load the bg assets and create the scene
            Q.loadTMX(data.bgs.concat(data.chars).concat(data.maps).join(','), function() {
                //If there is dialogue
                if(data.dialogue){
                    //Stage the scene
                    Q.stageScene("dialogue",1,{data: data, dialogue: data.dialogue,path:"dialogue"});
                }
                if(data.battle) {
                    //For those occasions where there's no dialogue cutscene, stage the battle scene.
                    if(!data.dialogue){
                        Q.stageScene("battle",0,{data:data,battle:data.battle});
                    }
                }
            });
        });
    };
    Q.scene("dialogue",function(stage){
        var dialogueData = stage.options.dialogueData = Q.getPathData(stage.options.data,stage.options.path);
        var bgImage = stage.insert(new Q.BackgroundImage({asset:dialogueData.bg}));
        //The textbox is in charge of all of the functions that need to be run to do custom events.
        //It also shows the text_box.png
        var textbox = stage.insert(new Q.TextBox({dialogueData:dialogueData,bgImage:bgImage,bg:dialogueData.bg}));
        //The left/right Assets are the characters that are speaking in the dialogue
        textbox.p.leftAsset = stage.insert(new Q.StoryImage({x:100,y:Q.height-textbox.p.h-150}));
        textbox.p.rightAsset = stage.insert(new Q.StoryImage({x:Q.width-100,y:Q.height-textbox.p.h-150,flip:'x'}));
        //The Dialogue Area is the inner area of the text box. It will be transparent later on.
        textbox.p.dialogueArea = stage.insert(new Q.DialogueArea({w: Q.width-20}));
        //The Dialogue is the text that is inside the dialogue area
        textbox.p.dialogueText = textbox.p.dialogueArea.insert(new Q.Dialogue({label:"...", align: 'left', x: 10}));
        Q.input.on("confirm", stage, function() {
            textbox.nextText();
        });
        textbox.next();
    });
    Q.scene("battle",function(stage){
        //The data that is used for this battle
        var battleData = stage.options.battleData = Q.getPathData(stage.options.data,stage.options.path);
        //Load the tmx tile map
        Q.stageTMX(battleData.map, stage);
        stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
        stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
        //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
        stage.BattleGrid = new Q.BattleGrid({stage:stage});
        //The battle controller holds all battle specific functions
        stage.BatCon = new Q.BattleController({stage:stage});
        stage.add("viewport");
        stage.viewport.scale = 2;
        //Display alex
        var allyData = Q.state.get("allies");
        var allies = [];
        allyData.forEach(function(ally){
            var char = new Q.Character({charClass:ally.charClass,level:ally.level,name:ally.name,attacks:ally.attacks,equipment:ally.equipment,gender:ally.gender,stats:ally.stats,value:ally.value,method:ally.method,team:"ally"});
            char.add("statCalcs");
            allies.push(char);
            
        });
        //Display the enemies, interactables, pickups, and placement locations
        var enemyData = battleData.enemies;
        enemyData.forEach(function(enm){
            var char = stage.insert(new Q.Character({loc:enm.loc,charClass:enm.charClass,level:enm.level,equipmentLevel:enm.equipmentLevel,equipmentType:enm.equipmentType,gender:"male",team:"enemy"}));
            char.add("randomCharacter,statCalcs");
        });
        
        //Until the placement code is written, place alex at 3,4
        allies[0].p.loc = [3,4];
        stage.insert(allies[0]);
        //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
        var pointer = stage.insert(new Q.Pointer({loc:[3,4]}));
        
        //Default to following the pointer
        Q.viewFollow(pointer,stage);
        
        //Display the hud which shows character and terrain information
        Q.stageScene("battleHUD",3,{pointer:pointer});
        // Temporary: press 'enter' to win the battle
        Q.input.on("confirm", stage, function() {
            Q.stageScene("dialogue", 1, {data: stage.options.data,path:stage.options.battleData.winScene});
            Q.input.off("esc",stage);
            Q.input.off("confirm",stage);
            //Make sure the HUD is gone
            Q.clearStage(3);
        });
        // Temporary: press 'esc' to win the battle
        Q.input.on("esc", stage, function() {
            Q.stageScene("dialogue", 1, {data: stage.options.data,path:stage.options.battleData.defeatScene});
            Q.input.off("esc",stage);
            Q.input.off("confirm",stage);
            //Make sure the HUD is gone
            Q.clearStage(3);
        });
        stage.BatCon.startBattle();
    });
    Q.scene("battleHUD",function(stage){
        //Create the top left hud which gives information about the ground (grass,dirt,etc...)
        var terrainHUD = stage.insert(new Q.TerrainHUD());
        //Create the top right hud that shows condensed stats about the currently hovered object (people, interactable non-human/monsters, etc...)
        var statsHUD = stage.insert(new Q.StatsHUD());
        
        
    });
    Q.scene("location",function(stage){
        //Set the current menu. Default is 'start'
        if(!stage.options.menu){alert("No Menu Given in JSON!!!");};
        Q.state.set("currentMenu",stage.options.menu?stage.options.menu:Q.state.get("currentMenu"));
        console.log("Current Menu: "+Q.state.get("currentMenu"), stage.options.data);
        //Load any bgs for this location
        Q.load(stage.options.data.bgs.join(','),function(){
            Q.stageScene("dialogue", 1, {data: stage.options.data, path: Q.state.get("currentMenu")});
        });
    });
};
