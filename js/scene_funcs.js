Quintus.SceneFuncs=function(Q){
    Q.startScene = function(type,scene,event,char){
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
                        case "story":
                            path += "edit-story-event.php";
                            break;
                        case "location":
                            path += "edit-location-event.php";
                            break;
                        case "battleScene":
                            path += "edit-battleScene-script.php";
                            break;
                        case "battle":
                            path += "edit-battle-event.php";
                            break;
                    }
                    $.redirect(path, {'scene':testing.scene, 'event':testing.event, 'type':testing.type});
                });
            }
        });
    };
    Q.scene("story",function(stage){
        var data = stage.options.data;
        Q.audioController.playMusic(data.pages[0].music,function(){
            Q.storyController.startEvent(data);
        });
    });
    Q.scene("location",function(stage){
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
        });/*
        var chars = [];
        charData.forEach(function(char){
            var character;

            if(char.nationality){
                char.natNum = Q.charGen.getNatNum(char.nationality);
            }
            if(char.charClass){
                char.classNum = Q.charGen.getClassNum(char.charClass);
            }
            //If the character is an ally, get the data from the allies array
            if(char.team==="ally"){
                //Find the data in the allies array
                var data = Q.state.get("allies").filter(function(ally){
                    return ally.name===char.name;
                })[0];
                if(data){
                    character = new Q.StoryCharacter(Q.charGen.generateCharacter(char,"ally"));

                } else {
                    character = new Q.StoryCharacter(Q.charGen.generateCharacter(char,"ally"));
                }
            } else {
                character = new Q.StoryCharacter(Q.charGen.generateCharacter(char,"enemy"));
            }
            chars.push(character);
            character.p.loc = char.loc;
            character.p.anim = char.anim;
            if(char.hidden==="hide"){
                character.hide();
            }
        });
        chars.forEach(function(char){
            stage.insert(char);
        });*/
    };
    Q.scene("battleScene",function(stage){
        Q.inputs['confirm'] = false;
        //Get the data to play out this scene
        var data = stage.options.data;
        var map = "maps/"+data.map;
        Q.loadTMX(map, function() {
            Q.audioController.playMusic(data.music,function(){
                Q.stageScene("fader",11);
                //Display the tmx tile map
                //If one is not passed in, we are re-using the map from the previous battle
                if(map){
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
    Q.scene("battle",function(stage){
        $("#loading-screen").show();
        //The data that is used for this battle
        var battleData = stage.options.data;//.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var map = "maps/"+battleData.map;
        Q.loadTMX(map, function() {
            Q.audioController.playMusic(battleData.music,function(){
                Q.stageScene("fader",11);
                //Display the tmx tile map
                Q.stageTMX(map, stage);
                stage.lists.TileLayer[0].p.z = -5;
                stage.lists.TileLayer[1].p.z = -4;
                stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
                stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;

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
                chars.forEach(function(char){
                    stage.insert(new Q.Character(Q.charGen.generateCharacter(char,"battleChar")));
                });
                //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
                Q.pointer = stage.insert(new Q.Pointer({loc:battleData.placementSquares[0]}));

                //Default to following the pointer
                Q.viewFollow(Q.pointer,stage);

                //Display the hud which shows character and terrain information
                Q.stageScene("battleHUD",3);
                Q.BatCon.setUpTriggers(battleData.events);
                Q.BatCon.showPlacementSquares();
                Q.BatCon.startPlacingAllies();
                
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
