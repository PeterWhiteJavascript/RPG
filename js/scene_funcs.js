Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(type,scene,event){
        Q.load("json/story/events/"+type+"/"+scene+"/"+event+".json",function(){
            Q.clearStages();
            var data = Q.assets["json/story/events/"+type+"/"+scene+"/"+event+".json"];
            Q.stageScene(data.kind,0,{data:data});
        });
    };
    Q.scene("story",function(stage){
        var data = stage.options.data;
        var characters = Q.state.get("allies");
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
        var data = stage.options.data;
        Q.loadSceneAssets([{music:data.music,bg:data.bg}],function(){
            var bgImage = stage.insert(new Q.BackgroundImage({asset:data.bg}));
            Q.playMusic(data.music,function(){
                Q.locationController = stage.insert(new Q.LocationController({location:data,bgImage:bgImage}));
            });
        });
    });
    
    Q.placeCharacters = function(characters,stage){
        var charData = [];
        //Find the character in the files
        
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
        Q.stageScene("fader",11);
        //Get the data to play out this scene
        var data = stage.options.data;
        Q.loadTMX(data.map, function() {
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
        });
    },{sort:true});
    Q.scene("battle",function(stage){
        $("#loading-screen").show();
        //The data that is used for this battle
        var battleData = stage.options.data;//.battleData = Q.getPathData(stage.options.data,stage.options.path);
        Q.loadTMX(battleData.map, function() {
            Q.stageScene("fader",11);
            Q.playMusic(battleData.music,function(){
                //Display the tmx tile map
                Q.stageTMX(battleData.map, stage);
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
            progressCallback:function(loaded,total){
                if(loaded===total){
                    $("#loading-screen").hide();
                }
            }
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
