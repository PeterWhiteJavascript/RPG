Quintus.SceneFuncs=function(Q){
    Q.startScene = function(type,scene,event,char){
        Q.menuBuilder.MenuControls.turnOff();
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
                    window.location.href = path + '?' + $.param({'scene':testing.scene, 'event':testing.event, 'type':testing.type});
                });
            }
        });
    };
    Q.scene("Story",function(stage){
        $("#HUD-container").show();
        var data = stage.options.data;
        Q.audioController.playMusic(data.pages[0].music,function(){
            Q.storyController.startEvent(data);
            Q.menuBuilder.MenuControls.disabled = false;
            Q.menuBuilder.MenuControls.turnOn();
        });
    });
    Q.scene("Location",function(stage){
        $("#HUD-container").show();
        var data = stage.options.data;
        Q.audioController.playMusic(data.mainMusic,function(){
            Q.locationController.data = data;
            Q.jobsController.currentJobs = Q.jobsController.getCurrentJobs();
            Q.missionsController.currentMissions = Q.missionsController.getCurrentMissions();
            Q.locationController.startEvent(data);
            Q.menuBuilder.MenuControls.disabled = false;
            Q.menuBuilder.MenuControls.turnOn();
            
            //TEMP
            $(".menu-option:eq(2)").trigger("click");
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
            $("#background-container").css("background-image","url('images/bg/battle-bg.png')");
            Q.audioController.playMusic(data.music,function(){
                Q.fadeAnim(800);
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
    Q.clickStage = function(e){
        //Can't click sprite if placing one
        var x = e.offsetX || e.layerX,
            y = e.offsetY || e.layerY,
            stage = Q.stage();
        //If we've dragged or it's disabled, don't click
        if(stage.dragged || stage.disabled || !stage){
            stage.dragged = false;
            return;
        }

        var stageX = Q.canvasToStageX(x, stage),
            stageY = Q.canvasToStageY(y, stage);
        if(stageX < 0 || stageY < 0) return;

        var locX = Math.floor(stageX / Q.tileW);
        var locY = Math.floor(stageY / Q.tileH);
        var objAt = Q.getSpriteAt([locX, locY]);
        if(objAt){
            Q.stage().trigger("selectedCharacter", objAt);
        } else {
            Q.stage().trigger("selectedLocation", [locX, locY]);
        }
        Q.stage().trigger("clickedStage", {stageX:stageX, stageY:stageY, dragged:stage.dragged});
    };
    Q.mouseOverStage = function(e){
        var x = e.offsetX || e.layerX,
        y = e.offsetY || e.layerY;
        var stage = Q.stage(0);
        var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);
        Q.stage().trigger("mouseAt", {stageX:stageX, stageY:stageY});
    };
    Q.listenForInput = function(){
        if(Q.inputs['confirm']){
            this.trigger("pressedConfirm", "confirm");
            Q.inputs['confirm'] = false;
        } else if(Q.inputs['back']){
            this.trigger("pressedBack", "back");
            Q.inputs['back'] = false;
        } else if(Q.inputs['shift']){
            this.trigger("pressedShift", "shift");
            Q.inputs['shift'] = false;
        } else if(Q.inputs['ctrl']){
            this.trigger("pressedCtrl", "ctrl");
            Q.inputs['ctrl'] = false;
        } else {
            if(Q.inputs['up']){
                this.trigger("pressedUp", "up");
            } else if(Q.inputs['down']){
                this.trigger("pressedDown", "down");
            }
            if(Q.inputs['right']){
                this.trigger("pressedRight", "right");
            } else if(Q.inputs['left']){
                this.trigger("pressedLeft", "left");
            }
        }
    };
    Q.scene("Battle",function(stage){
        $("#loading-screen").show();
        //The data that is used for this battle
        var battleData = stage.options.data;//.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var map = "maps/"+battleData.map;
        Q.loadTMX(map, function() {
            $("#background-container").css("background-image","url('images/bg/battle-bg.png')");
            Q.audioController.playMusic(battleData.music,function(){
                Q.fadeAnim(400);
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
                
                
                stage.dragged = false;
                //Turn on clicking sprites/ground
                Q.el.addEventListener("click", Q.clickStage);
                Q.el.addEventListener("mousemove", Q.mouseOverStage);
                Q.stage(0).on("step", Q.listenForInput);
                stage.add("viewport");
                stage.viewport.scale = 2;
                
                //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
                Q.pointer = stage.insert(new Q.Pointer({loc:battleData.placementSquares[0]}));
                Q.pointer.add("pointerControls, pointerPlacementRoaming");
                
                //The viewSprite is what moves when dragging the viewport
                stage.viewSprite = stage.insert(new Q.ViewSprite());
                //stage.viewSprite.followObj(Q.pointer);
                Q.viewFollow(Q.pointer, stage);
                //Time specific events in battle
                Q.BatCon.battleTriggers.setUpTriggers(battleData.events);
                //Show the squares that the player can place characters on
                Q.BatCon.battlePlacement.showPlacementSquares(battleData.placementSquares);
                //Create the list of placeable characters and set the direction they should be facing by default
                Q.BatCon.battlePlacement.startPlacingAllies(battleData);
                
                //Show the three battle menus
                Q.BattleMenusController = new Q.Menus("battle");
                
                //Start at the first square
                Q.stage(0).trigger("selectedLocation", battleData.placementSquares[0]);
                //Beyond is TEMP to place characters at start.
                /*Q.stage(0).trigger("pressedConfirm");
                Q.stage(0).trigger("pressedConfirm"); 
                Q.stage(0).trigger("selectedLocation", battleData.placementSquares[1]);
                Q.stage(0).trigger("pressedConfirm");
                Q.stage(0).trigger("pressedConfirm");
                //Q.BattleMenusController.actionsMenu.selected = 2;
                //Q.stage(0).trigger("pressedConfirm");
                */
                
            });
        },{
            progressCallback:Q.progressCallback,
            tmxImagePath:"../images/"
        });
        
    },{sort:true});
    
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
    Q.scene("battleText",function(stage){
        stage.insert(new Q.BattleTextBox({text:stage.options.text,callback:stage.options.callback}));
    });
};
