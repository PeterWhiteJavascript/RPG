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
        textbox.nextText();
        Q.input.on("confirm", stage, function() {
            textbox.nextText();
        });
    });
    Q.scene("battle",function(stage){
        //The data that is used for this battle
        var battleData = stage.options.battleData = Q.getPathData(stage.options.data,stage.options.path);
        //Load the tmx tile map
        Q.stageTMX(battleData.map, stage);
        Q.stageScene("battleHUD",3);
        stage.add("viewport");
        //Display alex
        var allyData = Q.state.get("allies");
        var allies = [];
        allyData.forEach(function(ally){
            var char = new Q.Character({charClass:ally.charClass,level:ally.level,name:ally.name,attacks:ally.attacks,equipment:ally.equipment,gender:ally.gender,stats:ally.stats,value:ally.value,method:ally.method});
            char.add("statCalcs");
            allies.push(char);
            
        });
        //Display the enemies, interactables, pickups, and placement locations
        var enemyData = battleData.enemies;
        enemyData.forEach(function(enm){
            var char = stage.insert(new Q.Character({loc:enm.loc,charClass:enm.charClass,level:enm.level,equipmentLevel:enm.equipmentLevel,equipmentType:enm.equipmentType,gender:"male"}));
            char.add("randomCharacter,statCalcs");
        });
        
        //Until the placement code is written, place alex at 3,4
        allies[0].p.loc = [3,4];
        stage.insert(allies[0]);
        console.log(allies[0])
        //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
        //var pointer = stage.insert(new Q.Pointer());
        
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
    });
    Q.scene("battleHUD",function(stage){
        //Create the top left hud which gives information about the ground (grass,dirt,etc...)
        var terrainHUD = stage.insert(new Q.TerrainHUD());
        //Create the top right hud that shows condensed stats about the currently hovered object (people, interactable non-human/monsters, etc...)
        var statsHUD = stage.insert(new Q.StatsHUD());
        
        
    });
    Q.scene("location",function(stage){
        Q.state.set("currentLocation",stage.options.location);
        //Set the current menu. Default is 'start'
        if(!stage.options.menu){alert("No Menu Given in JSON!!!");};
        Q.state.set("currentMenu",stage.options.menu?stage.options.menu:Q.state.get("currentMenu"));
        //TO DO: Create menus that you can use
        console.log(stage.options.location)
        console.log("Current Menu: "+Q.state.get("currentMenu"));
        //Load any bgs for this location
        Q.load(stage.options.location.bgs.join(','),function(){
            var bgImage = stage.insert(new Q.BackgroundImage({asset:stage.options.location[Q.state.get("currentMenu")].bg}));
            //For now, let's press enter to select the pub's first quest (this will give an error after beating the first quest as this is not te exact setup that we need)
            Q.input.on("confirm",stage,function(){
                var questName = stage.options.location[Q.state.get("currentMenu")].options.quests[0];
                var data = Q.state.get("quests")[questName];
                //Make sure the bgs and chars are loaded
                Q.load(data.bgs.concat(data.chars).join(','),function(){
                    Q.stageScene("dialogue", 1, {data: data, path:"dialogue"});
                });
                console.log("Showing quest: "+questName)
                Q.input.off("confirm",stage);
            });
        });
    });
};
