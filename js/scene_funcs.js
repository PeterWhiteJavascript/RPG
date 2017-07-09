Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(type,scene,event,characters){
        if(scene==="locations"){ 
            Q.stageScene("location",1,{location:event});
        }
        else {
            Q.load("json/story/events/"+type+"/"+scene+"/"+event+".json",function(){
                var data = Q.assets["json/story/events/"+type+"/"+scene+"/"+event+".json"];
                //Do different code for different scene types
                switch(data.kind){
                    case "story":
                        Q.clearStages();
                        Q.stageScene("story",1,{data:data,characters:characters});
                        break;
                    case "battleScene":
                        Q.loadTMX(data.map, function() {
                            Q.clearStages();
                            Q.stageScene("battleScene",0,{data:data});
                        });

                        break;
                    case "battle":
                        Q.loadTMX(data.map, function() {
                            Q.clearStages();
                            Q.stageScene("battle",0,{data:data});
                        });
                        break;
                }
            });
        }
    };
    Q.scene("story",function(stage){
        var data = stage.options.data;
        var characters = stage.options.characters;
        Q.loadSceneAssets(data.pages,function(){
            Q.playMusic(data.pages[0].music,function(){
                var bgImage = stage.insert(new Q.BackgroundImage({asset:data.pages[0].bg}));
                Q.storyController = stage.insert(new Q.StoryController({pages:data.pages,pageNum:0,bgImage:bgImage,vrs:data.vrs,characters:characters}));
                Q.storyController.insertPage(0);
            });
        });
    });
    Q.scene("script",function(stage){
        Q.inputs['confirm'] = false;
        var scriptData = stage.options.scriptData = stage.options.data;
        Q.dialogueController = stage.insert(new Q.DialogueController({script:scriptData.script}));
        
    }); 
    Q.scene("location",function(stage){
        var location = stage.options.location;
        Q.load("json/story/locations/"+location+".json",function(){
            var data = Q.assets["json/story/locations/"+location+".json"];
            Q.load("bg/"+data.bg,function(){
                var bgImage = stage.insert(new Q.BackgroundImage({asset:"bg/"+data.bg}));
                Q.playMusic(data.music,function(){
                    Q.locationController = stage.insert(new Q.LocationController({location:Q.assets["json/story/locations/"+location+".json"],bgImage:bgImage}));
                });
            });
        });
    });
    
    Q.placeCharacters = function(characters,stage){
        var charData = [];
        //Find the character in the files
        /*
        var files = Q.state.get("characterFiles");
        characters.forEach(function(char){
            var ref = files[char.file][char.group][char.handle];
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
                group:char.group,
                file:char.file,
                dir:char.dir,
                loc:char.loc,
                uniqueId:char.uniqueId
            };
            charData.push(newChar);
        });
        var chars = [];
        charData.forEach(function(char){
            var character;

            if(char.nationality){
                char.natNum = Q.charGen.getNatNum(char.nationality);
            }
            if(char.charClass){
                char.classNum = Q.charGen.getClassNum(char.charClass);
            }
            //Set values that are empty as random
            ["level","nationality","charClass","gender","name","value","methodology","personality"].forEach(function(key){
                if(!char[key]||char[key].length===0){
                    char[key] = Q.charGen.generateProp(key,char);
                }
            });
            //If the character is an ally, get the data from the allies array
            if(char.team==="ally"){
                //Find the data in the allies array
                var data = Q.state.get("allies").filter(function(ally){
                    return ally.name===char.name;
                })[0];
                if(data){
                    character = new Q.StoryCharacter({charClass:data.charClass,uniqueId:char.uniqueId,level:data.level,exp:data.exp,name:data.name,skills:data.skills,equipment:data.equipment,gender:data.gender,stats:data.stats,team:char.team,awards:char.awards});

                } else {
                    character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",uniqueId:char.uniqueId,team:char.team,awards:char.awards,handle:char.handle});
                }
            } else {
                character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",uniqueId:char.uniqueId,team:"enemy",handle:char.handle});
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
        Q.stageScene("fader",11);
        //Get the data to play out this scene
        var data = stage.options.data;
        //Display the tmx tile map
        //If one is not passed in, we are re-using the map from the previous battle
        if(data.map){
            Q.stageTMX(data.map, stage);
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
        //Set the batcon's stage
        Q.BatCon.stage = stage;
        
        Q.placeCharacters(data.characters,stage);
        
        //DialogueController holds the functions for the battleScene
        Q.stageScene("script",1,{data:data});
    },{sort:true});
    Q.scene("battle",function(stage){
        Q.stageScene("fader",11);
        //The data that is used for this battle
        var battleData = stage.options.data;//.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var music = battleData.music;
        if(!music) music = Q.state.get("currentMusic"); 
        Q.playMusic(music,function(){
            //Display the tmx tile map
            Q.stageTMX(battleData.map, stage);
            stage.lists.TileLayer[0].p.z = 0;
            stage.lists.TileLayer[1].p.z = 1;
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
            var enemyData = battleData.characters;
            enemyData.forEach(function(enemy){
                stage.insert(new Q.Character(Q.charGen.generateCharacter(enemy,"enemy")));
            });
            //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
            Q.pointer = stage.insert(new Q.Pointer({loc:battleData.placementSquares[0]}));

            //Default to following the pointer
            Q.viewFollow(Q.pointer,stage);

            //Display the hud which shows character and terrain information
            Q.stageScene("battleHUD",3);
            Q.BatCon.showPlacementSquares();
            Q.BatCon.startPlacingAllies();
            
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
