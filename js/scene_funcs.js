Quintus.SceneFuncs=function(Q){
    Q.startScene = function(type,scene,event,char){
        $("#HUD-container").hide();
        Q.load("json/story/events/"+type+"/"+scene+"/"+event+".json",function(){
            Q.clearStages();
            var data = Q.assets["json/story/events/"+type+"/"+scene+"/"+event+".json"];
            Q.state.set("currentEvent",{type:type,scene:scene,event:event,data:data});
            if(type==="Story"){
                Q.variableProcessor.vars.Event[scene][event] = data.vrs;
            }
            Q.stageScene(data.kind,0,{data:data,char:char});
            if(testing&&!$("#back-button").length){
                $("body").append("<div id='back-button' class='btn btn-default'>Go Back</div>");
                $("#back-button").click(function(){
                    var path = "_tools/Event-Editor/";
                    switch(data.kind){
                        case "Story":
                            path += "edit-story-event.php";
                            break;
                        case "Location":
                            path += "edit-location-event.php";
                            break;
                        case "Battle Scene":
                            path += "edit-battleScene-script.php";
                            break;
                        case "Battle":
                            path += "edit-battle-event.php";
                            break;
                    }
                    $.redirect(path, {'scene':testing.scene, 'event':testing.event, 'type':testing.type});
                });
            }
        });
    };
    Q.scene("Story",function(stage){
        $("#HUD-container").show();
        var data = stage.options.data;
        Q.audioController.playMusic(data.pages[0].music,function(){
            Q.storyController.startEvent(data);
        });
    });
    Q.scene("Location",function(stage){
        $("#HUD-container").show();
        var data = stage.options.data;
        Q.audioController.playMusic(data.pages[0].music,function(){
            Q.locationController.startEvent(data);
        });
    });
    
    Q.scene("script",function(stage){
        Q.inputs['confirm'] = false;
        var scriptData = stage.options.scriptData = stage.options.data;
        Q.dialogueController = stage.insert(new Q.DialogueController({script:scriptData.script,next:scriptData.finished}));
    }); 
    
    Q.placeCharacters = function(characters,stage){
        var charData = [];
        //Find the character in the files
        var files = Q.state.get("characterFiles");
        characters.forEach(function(char){
            var ref = files[char[0]][char[1]][char[2]];
            var newChar = {
                baseStats:ref.baseStats,
                charClass:ref.charClass,
                equipment:ref.equipment,
                gender:ref.gender,
                levelmax:ref.levelmax,
                levelmin:ref.levelmin,
                name:ref.name,
                nationality:ref.nationality,
                techniques:ref.techniques,
                handle:ref.handle,
                group:char[1],
                file:char[0],
                dir:char[5],
                loc:char[4],
                uniqueId:char[3]
            };
            charData.push(newChar);
             stage.insert(new Q.StoryCharacter(newChar));
        });
    };
    Q.scene("Battle Scene",function(stage){
        Q.inputs['confirm'] = false;
        //Get the data to play out this scene
        var data = stage.options.data;
        var map = "maps/"+data.map;
        Q.loadTMX(map, function() {
            $("#background-image").attr("src","images/bg/battle-bg.png");
            Q.audioController.playMusic(data.music,function(){
                Q.stageScene("fader",11);
                //Display the tmx tile map
                //If one is not passed in, we are re-using the map from the previous battle
                if(map){//TODO
                    Q.stageTMX(map, stage);
                }
                stage.lists.TileLayer[0].p.z = 0;
                stage.lists.TileLayer[1].p.z = 1;
                stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
                stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
                stage.add("viewport");
                stage.viewport.scale = 2;
                //The invisible sprite that the viewport follows
                stage.viewSprite = stage.insert(new Q.ViewSprite());
                Q.viewFollow(stage.viewSprite,stage);

                stage.viewSprite.animateTo(Q.BatCon.getXY(data.viewLoc));

                //Set the batcon's stage
                Q.BatCon.stage = stage;
                Q.placeCharacters(data.characters,stage);

                //DialogueController holds the functions for the battleScene
                Q.stageScene("script",1,{data:data});
            });
        },{
            tmxImagePath:"../images/"
        });
    },{
        sort:true
    });
    Q.scene("Battle",function(stage){
        $("#loading-screen").show();
        //The data that is used for this battle
        var battleData = stage.options.data;//.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var map = "maps/"+battleData.map;
        Q.loadTMX(map, function() {
            $("#background-image").attr("src","images/bg/battle-bg.png");
            Q.audioController.playMusic(battleData.music,function(){
                Q.stageScene("fader",11);
                //Display the tmx tile map
                Q.stageTMX(map, stage);
                stage.lists.TileLayer[0].p.z = -5;
                stage.lists.TileLayer[1].p.z = -4;
                stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
                stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
                //The range tiles
                var gridMatrix = function(){
                    var matrix = [];
                    for(var i=0; i<stage.mapHeight; i++) {
                        matrix[i] = [];
                        for(var j=0; j<stage.mapWidth; j++) {
                            matrix[i][j] = 0;
                        }
                    }
                    return matrix;
                };
                
                Q.ModifiedGroundTileLayer = stage.insert(new Q.TileLayer({
                    tileW:Q.tileW,
                    tileH:Q.tileH,
                    sheet:"ui_tiles",
                    tiles:new gridMatrix(),
                    w:32,
                    h:32,
                    type:Q.SPRITE_NONE,
                    opacity:0.7,
                    z:-3
                }));
                Q.ModifiedGroundTileLayer.tileCollisionObjects = {
                    "5":{p:{type:"Icy"}},
                    "4":{p:{type:"Burning"}},
                    "6":{p:{type:"Stable"}},
                    "7":{p:{type:"Caltrops"}},
                    "8":{p:{type:"Mirage"}}
                };
                Q.ModifiedGroundTileLayer.add("tween");
                
                Q.RangeTileLayer = stage.insert(new Q.TileLayer({
                    tileW:Q.tileW,
                    tileH:Q.tileH,
                    sheet:"ui_tiles",
                    tiles:new gridMatrix(),
                    w:32,
                    h:32,
                    type:Q.SPRITE_NONE,
                    opacity:0.7,
                    z:-3
                }));
                Q.RangeTileLayer.add("tween");
                
                Q.AOETileLayer = stage.insert(new Q.TileLayer({
                    tileW:Q.tileW,
                    tileH:Q.tileH,
                    sheet:"ui_tiles",
                    tiles:new gridMatrix(),
                    w:32,
                    h:32,
                    type:Q.SPRITE_NONE,
                    opacity:0.7,
                    z:-3
                }));
                Q.AOETileLayer.add("tween");
                
                
                
                //Set the battlegrid's stage
                Q.BattleGrid.stage = stage;
                //Reset the battle grid for this battle
                Q.BattleGrid.reset();
                //Set the batcon's stage
                Q.BatCon.stage = stage;
                stage.add("viewport");
                stage.viewport.scale = 2;

                //Display the enemies, interactables, pickups, and placement locations
                var chars = [];
                for(var i=0;i<battleData.characters.length;i++){
                    chars.push(battleData.characters[i]);
                }
                var files = Q.state.get("characterFiles");
                chars.forEach(function(char){
                    var charData = files[char[0]][char[1]][char[2]];
                    var c = Q.charGen.generateCharacter(charData);
                    c.uniqueId = char[3];
                    c.loc = char[4];
                    c.dir = char[5];
                    stage.insert(new Q.Character(c));
                });
                //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
                Q.pointer = stage.insert(new Q.Pointer({loc:battleData.placementSquares[0]}));

                //Default to following the pointer
                Q.viewFollow(Q.pointer,stage);

                //Display the hud which shows character and terrain information
                Q.stageScene("battleHUD",3);
                Q.BatCon.battleTriggers.setUpTriggers(battleData.events);
                Q.BatCon.battlePlacement.showPlacementSquares(battleData.placementSquares);
                Q.BatCon.battlePlacement.startPlacingAllies(battleData);
                
            });
        },{
            progressCallback:Q.progressCallback,
            tmxImagePath:"../images/"
        });
        
    },{sort:true});
    //Displayed when selecting a character to place in battle
    Q.scene("placeCharacterMenu",function(stage){
        stage.insert(new Q.CharacterSelectionMenu({selected:stage.options.placedIdx}));
    });
    
    //Displayed when selecting a character in battle
    Q.scene("characterMenu",function(stage){
        var target = stage.options.target;
        var active = stage.options.currentTurn;
        if(target===active){
            stage.ActionMenu = stage.insert(new Q.ActionMenu({target:target,active:true}));
        } else {
            stage.ActionMenu = stage.insert(new Q.ActionMenu({target:target}));
        }
    });
    //Displayed when pressing the menu button at any time.
    Q.scene("optionsMenu",function(stage){
        var menu = stage.insert(new Q.UI.Container({w:Q.width/2,h:Q.height/2,cx:0,cy:0,fill:"blue",opacity:0.5}));
        menu.p.x = Q.width/2-menu.p.w/2;
        menu.p.y = Q.height/2-menu.p.h/2;
        var title = menu.insert(new Q.UI.Text({x:menu.p.w/2,y:15,label:"OPTIONS",size:30}));
        var texts = ["Music","Sound","Text Speed","Auto Scroll","Cursor Speed"];
        var vals = Q.state.get("options");
        var values = ["musicEnabled","soundEnabled","textSpeed","autoScroll","cursorSpeed"];
        var options = [];
        for(var i=0;i<texts.length;i++){
            var option = menu.insert(new Q.UI.Container({x:10,y:50+i*40,fill:"red",w:menu.p.w-20,h:40,cx:0,cy:0,radius:0,value:vals[values[i]]}));
            option.insert(new Q.UI.Text({align:"left",x:10,y:8,label:texts[i]}));
            option.val = option.insert(new Q.UI.Text({align:"right",x:option.p.w-10,y:8,label:""+vals[values[i]]}));
            if(i===0){
                option.p.fill = "green";
            }
            options.push(option);
        }
        var optionNum = 0;
        var optsFuncs  = [
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){opt.p.value++;if(opt.p.value>3){opt.p.value=1;}},
            function(opt){if(opt.p.value){opt.p.value=false;}else{opt.p.value=true;}},
            function(opt){opt.p.value++;if(opt.p.value>3){opt.p.value=1;}}
        ];
        stage.on("step",function(){
            if(Q.inputs['confirm']){
                //Run the proper function
                optsFuncs[optionNum](options[optionNum]);
                vals[values[optionNum]] = options[optionNum].p.value;
                options[optionNum].val.p.label = ""+vals[values[optionNum]];
                Q.state.trigger("change."+values[optionNum],options[optionNum].p.value);
                Q.inputs['confirm']=false;
                return;
            }
            if(Q.inputs['up']){
                options[optionNum].p.fill="red";
                optionNum--;
                if(optionNum<0){optionNum=options.length-1;};
                options[optionNum].p.fill="green";
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                options[optionNum].p.fill="red";
                optionNum++;
                if(optionNum>=options.length){optionNum=0;};
                options[optionNum].p.fill="green";
                Q.inputs['down']=false;
            }
        });
    });
    Q.scene("battleHUD",function(stage){
        //Create the top left hud which gives information about the ground (grass,dirt,etc...)
        var terrainHUD = stage.insert(new Q.TerrainHUD());
        //Create the top right hud that shows condensed stats about the currently hovered object (people, interactable non-human/monsters, etc...)
        var statsHUD = stage.insert(new Q.StatsHUD());
    });
    Q.scene("battleText",function(stage){
        stage.insert(new Q.BattleTextBox({text:stage.options.text,callback:stage.options.callback}));
    });
    Q.scene("fader",function(stage){
        stage.insert(new Q.Fader());
    });
};
