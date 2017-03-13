Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene,event){
        if(scene==="locations"){ 
            Q.stageScene("location",{location:event});
            console.log(Q.state.p)
        }
        else {
            Q.load("json/story/events/"+scene+"/"+event+".json",function(){
                var data = Q.assets["json/story/events/"+scene+"/"+event+".json"];
                //Do different code for different scene types
                switch(data.kind){
                    case "story":
                        Q.clearStages();
                        Q.stageScene("story",1,{data:data});
                        break;
                    case "battleScene":
                        Q.loadTMX(data.map, function() {
                            Q.clearStages();
                            Q.stageScene("battleScene",0,{data:data});
                        });

                        break;
                    case "battle":
                        Q.loadTMX(data.bgs.concat(data.chars).concat(data.maps).join(','), function() {
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
        Q.loadSceneAssets(data.pages,function(){
            Q.playMusic(data.pages[0].music,function(){
                var bgImage = stage.insert(new Q.BackgroundImage({asset:data.pages[0].bg}));
                Q.storyController = stage.insert(new Q.StoryController({pages:data.pages,pageNum:0,bgImage:bgImage,vrs:data.vrs}));
            });
        });
    });
    Q.scene("script",function(stage){
        Q.inputs['confirm'] = false;
        var scriptData = stage.options.scriptData = stage.options.data;
        Q.dialogueController = stage.insert(new Q.DialogueController({script:scriptData.scene}));
        
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
    Q.GameObject.extend("CharacterGenerator",{
        init:function(){
            var data = Q.state.get("charGeneration");
            this.personalities = data.personalities;
            this.traitsKeys = Object.keys(this.personalities.traits);
            this.scenes = data.scenes;
            this.nationalities = data.nationalities;
            this.values = data.values;
            this.methodologies = data.methodologies;
            this.classNames = data.classNames;
            this.natClasses = data.natClasses;
            this.natKeys = Object.keys(this.natClasses);
            this.classes = data.classes;
            this.classKeys = Object.keys(this.classes);
            this.nameParts = data.nameParts;
            this.genders = data.genders;
            this.statTexts = data.statTexts;
            this.statNames = data.statNames;
            this.primaryStats = data.primaryStats;
            this.secondaryStats = data.secondaryStats;
            this.order = data.order;
            this.autoChance = data.autoChance;
        },
        getIdx:function(group,num){
            //Loop through elements in array until a match is found
            for(var i=0;i<group.length;i++){
                var sum = group.slice(0,i+1).reduce(function(a,b){return a+b;},0);
                if(num<=sum){
                    return i;
                }
            }
        },
        levelUp:function(statTo,stats,primary,secondary){
            switch(statTo){
                case "primary":
                    stats[primary]+=1;
                    break;
                case "secondary":
                    stats[secondary]+=1;
                    break;
                case "random":
                    stats[this.statNames[Math.floor(Math.random()*this.statNames.length)]]+=1;
                    break;
                case "auto":
                    stats = this.levelUp(this.autoChance[Math.floor(Math.random()*this.autoChance.length)],stats,primary,secondary);
                    break;
            }
            return stats;
        },
        getNatNum:function(nat){
            return this.nationalities.indexOf(nat);
        },
        getClassNum:function(cl){
            return this.classNames.indexOf(cl);
        },
        getStats:function(level,classNum){
            var stats = {};
            //Set all starting stats
            this.statNames.forEach(function(st){
                stats[st] = Math.floor(Math.random()*10)+10;
            });
            var primary = this.primaryStats[classNum];
            var secondary = this.secondaryStats[classNum];
            stats[primary]+=5;
            stats[secondary]+=3;
            
            for(var idx=0;idx<level;idx++){
                var num = idx%this.order.length;
                stats = this.levelUp(this.order[num],stats,primary,secondary);
            }
            return stats;
        },
        
        generateSkills:function(char){
            var allSkills = Q.state.get("skills");
            //To do: Come up with a way to give reasonable skills
            var skills = {};
            skills[char.charClass] = [allSkills[char.charClass][0],allSkills[char.charClass][1]];
            return skills;
        },
        randomizeEquipment:function(char){
            var el = 1;//p.equipmentRank;
            var equipmentType = "sword";
            var equipmentData = Q.state.get("equipment");
            var types = ["weapon","shield","body","feet","accessory"];
            
            function rand(type){
                //Chance of going up or down in rank
                var lv = el;
                lv+=Math.floor(Math.random()*3)-1;
                if(lv===0) lv=1;
                if(lv>Q.maxEquipmentRank) lv = Q.maxEquipmentRank;
                var eq = equipmentData[type+"Sorted"][lv-1][Math.floor(Math.random()*(equipmentData[type+"Sorted"][lv-1].length))];
                return eq;
            }
            var rh = rand(types[Math.floor(Math.random()*2)]);
            var lh = {};
            if(rh){
                //Chance that there's no equipment here
                if(Math.random()*100>9){
                   lh = rand(types[Math.floor(Math.random()*2)]);
                }
            } else {
                lh = rand(types[Math.floor(Math.random()*2)]);
            }
            var equipment = {
                righthand:rh,
                lefthand:lh,
                body:rand(types[2]),
                feet:rand(types[3]),
                accessory:rand(types[4])
            };
            //Process the equipment
            //If they have a set equipment type, make sure they get it
            while(equipmentType&&equipment.righthand.equipmentType!==equipmentType&&equipment.lefthand.equipmentType!==equipmentType){
                equipment.righthand = rand(types[0]);
                //If the equipment is two handed, the left hand should be empty
                if(equipment.righthand.twoHanded){
                    equipment.lefthand = {};
                } else {
                    //If the righthand equipment is not two handed, find a weapon or shield for the left hand
                    while(equipment.lefthand.twoHanded){
                        equipment.lefthand = rand(types[Math.floor(Math.random()*2)]);
                    }
                }
            }
            //Make sure they are not holding a two handed weapon and something else
            if(equipment.righthand.twoHanded){
                equipment.lefthand = {};
            }
            if(equipment.lefthand.twoHanded){
                equipment.righthand = {};
            }
            //Make sure that they are not holding two shields (unless we want that :D)
            if(equipment.righthand.equipmentType==="shield"&&equipment.lefthand.equipmentType==="shield"){
                equipment.righthand = rand(types[0]);
            }
            return equipment;
        },
        rand:function(){
            return Math.ceil(Math.random()*100);
        },
        generateProp:function(prop,char){
            var chapter = "Chapter1-1";
            switch(prop){
                case "name":
                    console.log(char.natNum)
                    var numNameParts = this.getIdx(this.nameParts[char.natNum].nameParts,this.rand())+1;
                    var charName = "";
                    var main = this.nameParts[char.natNum].main;
                    for(var i=0;i<numNameParts;i++){
                        charName+=main[Math.floor(Math.random()*main.length)];
                    }

                    //Nomads have different prefix
                    if(this.nationalities[char.natNum]==="Nomadic") charName=this.nameParts[char.natNum][char.gender][Math.floor(Math.random()*this.nameParts[char.natNum][char.gender].length)]+charName;
                    else charName+=this.nameParts[char.natNum][char.gender][Math.floor(Math.random()*this.nameParts[char.natNum][char.gender].length)];
                    charName = charName.charAt(0).toUpperCase() + charName.slice(1);
                    return charName;
                case "level":
                    
                    return this.scenes[chapter].startLevel+this.getIdx(this.scenes[chapter].spread,this.rand());
                case "nationality":
                    var natNum = this.getIdx(this.scenes[chapter].natSpread,this.rand());
                    char.natNum = natNum;
                    var charNat = this.natKeys[natNum];
                    return charNat;
                case "charClass":
                    var classNum = this.getIdx(this.natClasses[char.nationality].classSpread,this.rand());
                    char.classNum = classNum;
                    var charClass = this.classKeys[classNum];
                    return charClass;
                case "gender":
                    
                    return this.genders[this.getIdx([this.classes[char.charClass].gender[char.natNum],100],this.rand())];
                case "value":
                    return this.values[this.getIdx(this.classes[char.charClass].value[char.natNum],this.rand())];
                case "methodology":
                    
                    return this.methodologies[this.getIdx(this.classes[char.charClass].methodology[char.natNum],this.rand())];
                case "personality":
                    var randPersonalityText = this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)];
                    var randPersonality = this.personalities.traits[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]];
                    return randPersonalityText+randPersonality;
                    
            }
        },
        
        generateStats:function(char){
            var stats = {
                maxHp:this.getHp(char.level,char.baseStats.str,char.baseStats.end),
                painTolerance:100,
                maxTp:this.getTp(char.level,char.baseStats.dex),
                accuracy:100,
                criticalChance:0,//this.getCriticalChance(base),
                defense:0,//this.getDefense(base),
                attackSpeed:100,
                range:0,//this.getRange(base),
                maxAtk:0,//this.getDamageHigh(base),
                minAtk:0,//this.getDamageLow(base),
                encThreshold:100,
                totalWeight:100,
                encPenalty:100,
                moveSpeed:0,//this.getSpeed(base),
                move:Q.state.get("charClasses")[char.charClass].move,
                zoc:Q.state.get("charClasses")[char.charClass].zoc
            };
            stats.hp = stats.maxHp;
            stats.tp = stats.maxTp;
            return stats;
        },
        //The user's hp is a bit complex :)
        getHp:function(level,str,end){
            //Every 5 levels, get a stat boost. every 10 levels, get a big stat boost
            return Math.floor(Math.ceil(level/5)*(end+str)+Math.ceil(level/10)*(str+end))+1;
        },
        //The user's tp is a bit complex :)
        getTp:function(level,dex){
            return Math.floor(Math.ceil(level/10)*(dex+dex))+1;
        },
        //Generates a character by filling in the blanks for data that is not set
        generateCharacter:function(data){
            function getEquipment(equipmentData){
                var equipment = Q.state.get("equipment");
                var keys = Object.keys(equipmentData);
                var eq = {};
                keys.forEach(function(key){
                    if(equipmentData[key]){
                        eq[key] = equipment[equipmentData[key][0]][equipmentData[key][1]];
                    } else {
                        eq[key] = {};
                    }
                });
                return eq;
            }
            function getSkills(skillsData){
                var skills = Q.state.get("skills");
                var keys = Object.keys(skillsData);
                
                var sk = {};
                keys.forEach(function(key){
                    sk[key] = [];
                    for(var i=0;i<skillsData[key].length;i++){
                        sk[key].push(skills[key][skillsData[key][i]]);
                    }
                });
                return sk; 
            }
            var char = {};
            char.awards = data.awards?data.awards:this.setUpAwards();
            
            char.nationality = data.nationality?this.nationalities[data.nationality]:this.generateProp("nationality",char);
            char.natNum = typeof char.natNum !== 'undefined'?char.natNum:data.nationality;
            
            char.charClass = data.charClass?this.classNames[data.charClass]:this.generateProp("charClass",char);
            char.classNum = typeof char.classNum !== 'undefined'?char.classNum:data.charClass;
            
            char.skills = data.skills?getSkills(data.skills):
            
            char.gender = data.gender?data.gender:this.generateProp("gender",char);
            char.level = data.level?data.level:this.generateProp("level",char);
            char.exp = data.exp?data.exp:0;
            char.baseStats = data.baseStats?data.baseStats:this.getStats(char.level,char.classNum);
            
            char.equipment = data.equipment?getEquipment(data.equipment):this.randomizeEquipment(char);
            
            char.value = data.value?data.value:50;
            char.methodology = data.methodology?data.methodology:50;
            char.loyalty = data.loyalty?data.loyalty:50;
            char.morale = data.morale?data.morale:50;
            char.name = data.name?data.name:this.generateProp("name",char);
            char.combatStats = this.generateStats(char);
            return char;
        },
        setUpAwards:function(){
            var awards = Q.state.get("awards");
            var keys = Object.keys(awards);
            var obj = {};
            //The default value for all awards is 0
            keys.forEach(function(key){
                obj[key] = 0;
            });
            return obj;
        },
        setAward:function(obj,prop,value){
            if(!obj) return;
            obj.p.awards[prop]+=value;
        }
    });
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
        //The battle controller holds all battle specific functions
        Q.BatCon = new Q.BattleController({stage:stage});
        stage.add("viewport");
        stage.viewport.scale = 2;
        //The invisible sprite that the viewport follows
        stage.viewSprite = stage.insert(new Q.ViewSprite());
        Q.viewFollow(stage.viewSprite,stage);

        var allyData = Q.state.get("allies");
        var charData = data.characters;
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
            ["level","nationality","charClass","gender","name","value","method","personality"].forEach(function(key){
                if(!char[key]||char[key].length===0){
                    char[key] = Q.charGen.generateProp(key,char);
                }
            });
            //If the character is an ally, get the data from the allies array
            if(char.team==="ally"){
                //Find the data in the allies array
                var data = allyData.filter(function(ally){
                    return ally.name===char.name;
                })[0];
                if(data){
                    character = new Q.StoryCharacter({charClass:data.charClass,storyId:char.storyId,level:data.level,exp:data.exp,name:data.name,skills:data.skills,equipment:data.equipment,gender:data.gender,stats:data.stats,team:char.team,awards:char.awards});
                    character.add("statCalcs");
                } else {
                    character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",storyId:char.storyId,team:char.team,awards:char.awards});
                }
            } else {
                character = new Q.StoryCharacter({charClass:char.charClass,dir:char.dir?char.dir:"left",storyId:char.storyId,team:"enemy"});
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
        });
        Q.stageScene("script",1,{data:data});
    },{sort:true});
    Q.scene("battle",function(stage){
        Q.stageScene("fader",11);
        //The data that is used for this battle
        var battleData = stage.options.battleData = Q.getPathData(stage.options.data,stage.options.path);
        var music = battleData.music;
        if(!music) music = Q.state.get("currentMusic"); 
        Q.playMusic(music,function(){
            //Display the tmx tile map
            Q.stageTMX(battleData.map, stage);
            stage.lists.TileLayer[0].p.z = -2;
            stage.lists.TileLayer[1].p.z = -1;
            stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
            stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
            //Create the grid which keeps track of all interactable objects. This allows for easy searching of objects by location
            Q.BattleGrid = new Q.BattleGridObject({stage:stage});
            //The battle controller holds all battle specific functions
            Q.BatCon = new Q.BattleController({stage:stage});
            stage.add("viewport");
            stage.viewport.scale = 2;
            
            var allyData = Q.state.get("allies");
            var allies = [];
            allyData.forEach(function(ally,i){
                var char = new Q.Character({charClass:ally.charClass,level:ally.level,exp:ally.exp,name:ally.name,skills:ally.skills,equipment:ally.equipment,gender:ally.gender,stats:ally.stats,team:"ally",hp:ally.hp,sp:ally.sp,awards:ally.awards});
                char.p.savedData = ally;
                char.add("statCalcs,save");
                allies.push(char);
                char.p.loc = [battleData.placementSquares[i][0],battleData.placementSquares[i][1]];
                char.p.dir = battleData.placementSquares[i][2];
            });
            //Display the enemies, interactables, pickups, and placement locations
            var enemyData = battleData.enemies;
            var enemies = [];
            enemyData.forEach(function(enm){
                var char = new Q.Character({charClass:enm.charClass,level:enm.level,equipmentRank:enm.equipmentRank,equipmentType:enm.equipmentType,gender:"male",team:"enemy",dir:enm.dir?enm.dir:"left",awards:Q.setUpAwards()});
                char.add("randomCharacter,statCalcs");
                enemies.push(char);
                char.p.loc = enm.loc;
            });
            
            var neutralData = battleData.neutral?battleData.neutral:[];
            var neutral = [];
            neutralData.forEach(function(neu){
                var ally = Q.state.get("characters")[neu.name];
                var char;
                //If the neutral character is a story character
                if(ally){
                    var storyChar = Q.charGen.generateCharacter(ally);
                    char = new Q.Character({charClass:storyChar.charClass,level:storyChar.level,exp:storyChar.exp,name:storyChar.name,skills:storyChar.skills,equipment:storyChar.equipment,gender:storyChar.gender,stats:storyChar.stats,team:"ally",awards:storyChar.awards});
                    char.add("statCalcs");
                } else {
                    char = new Q.Character({charClass:neu.charClass,level:neu.level,equipmentRank:neu.equipmentRank,equipmentType:neu.equipmentType,gender:"male",team:"enemy",dir:neu.dir?neu.dir:"left",awards:Q.setUpAwards()});
                    char.add("randomCharacter,statCalcs");
                }
                neutral.push(char);
                char.p.loc = neu.loc;
            });
            
            var interactables = battleData.ineractables?battleData.ineractables:[];
            var inter = [];
            //Insert the interactables (TODO)
            interactables.forEach(function(){
                
            });
            allies.forEach(function(ally){
                stage.insert(ally);
            });
            enemies.forEach(function(enemy){
                stage.insert(enemy);
            });
            neutral.forEach(function(neut){
                stage.insert(neut);
            });
            //The pointer is what the user controls to select things. At the start of the battle it is used to place characters and hover enemies (that are already placed).
            Q.pointer = stage.insert(new Q.Pointer({loc:allies[0].p.loc}));

            //Default to following the pointer
            Q.viewFollow(Q.pointer,stage);

            //Display the hud which shows character and terrain information
            Q.stageScene("battleHUD",3,{pointer:Q.pointer});
            Q.BatCon.startBattle();
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
