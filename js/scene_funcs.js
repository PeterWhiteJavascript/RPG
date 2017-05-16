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
            this.personalityNames = data.personalityNames;
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
        generateAllEquipment:function(char){
            var equipment = {};
            equipment.righthand = this.randomizeEquipment("Weapons");
            equipment.lefthand = this.randomizeEquipment("Shields");
            equipment.armour = this.randomizeEquipment("Armour");
            equipment.footwear = this.randomizeEquipment("Footwear");
            equipment.accessory = false;//this.randomizeEquipment("Accessory");
            return equipment;
        },
        //Generates a random piece of equipment by filling in the vars that are to be randomized.
        randomizeEquipment:function(type,quality,material,gear){
            var eq = Q.state.get("equipment")[type];
            if(!quality) quality = Object.keys(Q.state.get("equipment").Quality)[Math.floor(Math.random()*Object.keys(Q.state.get("equipment").Quality).length)];
            if(!gear) gear = Object.keys(eq)[Math.floor(Math.random()*Object.keys(eq).length)];
            if(!material) material = eq[gear].materials[Math.floor(Math.random()*eq[gear].materials.length)];
            return [type,quality,material,gear];
        },
        rand:function(){
            return Math.ceil(Math.random()*100);
        },
        generateProp:function(prop,char){
            var chapter = Q.state.get("saveData").chapter;
            switch(prop){
                case "name":
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
                    return [this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)],this.personalityNames[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]]];
                    
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
                zoc:0//Q.state.get("charClasses")[char.charClass].zoc
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
            
            char.officer = data.officer;
            char.awards = data.awards?data.awards:this.setUpAwards();
            
            char.nationality = Q._isNumber(data.nationality)?this.nationalities[data.nationality]:this.generateProp("nationality",char);
            char.natNum = Q._isNumber(char.natNum)?char.natNum:data.nationality;
            
            char.charClass = Q._isNumber(data.charClass)?this.classNames[data.charClass]:this.generateProp("charClass",char);
            char.classNum = Q._isNumber(char.classNum)?char.classNum:data.charClass;
            
            char.skills = data.skills?getSkills(data.skills):this.generateSkills(char);
            
            char.gender = data.gender?data.gender:this.generateProp("gender",char);
            char.level = data.level?data.level:this.generateProp("level",char);
            char.exp = data.exp?data.exp:0;
            char.baseStats = data.baseStats?data.baseStats:this.getStats(char.level,char.classNum);
            //No equipment is set
            if(!data.equipment){
                char.equipment = this.generateAllEquipment(char);
            } 
            //Some equipment is set
            else {
                char.equipment = {};
                char.equipment.righthand = data.equipment.righthand?data.equipment.righthand:this.randomizeEquipment("Weapon");
                char.equipment.lefthand = false;//data.equipment.lefthand?data.equipment.lefthand:this.randomizeEquipment("Weapon");
                char.equipment.armour = data.equipment.armour?data.equipment.armour:this.randomizeEquipment("Armour");
                char.equipment.footwear = data.equipment.footwear?data.equipment.footwear:this.randomizeEquipment("Footwear");
                char.equipment.accessory = false;//data.equipment.accessory?data.equipment.accessory:this.randomizeEquipment("Accessory");
            }
            
            
            char.value = data.value?data.value:this.generateProp("value",char);
            char.methodology = data.methodology?data.methodology:this.generateProp("methodology",char);
            char.loyalty = data.loyalty?data.loyalty:50;
            char.morale = data.morale?data.morale:50;
            char.name = data.name?data.name:this.generateProp("name",char);
            char.combatStats = this.generateStats(char);
            
            //For now, there is only one personality generated
            char.personality = data.personality?data.personality:[this.generateProp("personality")];
            
            //Clone the scenesList. When an event is shown from this character, remove it.
            char.events =  JSON.parse(JSON.stringify(Q.state.get("scenesList").Character));
            
            //Checks if this character should trigger an event
            char.checkEvents = function(prop){
                //Step 1: Check if any conditions are met to do an event
                //Step 2: Make sure the event hasn't been completed yet
                //Step 3: Add the event to the potentialEvents in Q.state
                var scene = "";
                var event = "";
                //Only do events based on what property has changed (So we don't get unrelated events triggering).
                switch(prop){
                    case "feasted":
                        scene = "Feasts";
                        //If the character is Hedonistic
                        if(this.hasPersonality("Hedonistic")){
                            event = this.findEvent(scene,"HedonisticFeast");
                        }
                        //The character has never been to a feast and is the guest of honour.
                        else if(this.awards.feasted===1&&this.awards.guestOfHonour===1){
                            event = this.findEvent(scene,"Feast1");
                        } 
                        //The character has been to a feast before and is now the guest of honour.
                        else if(this.awards.feasted>2&this.awards.guestOfHonour===1){
                            event = this.findEvent(scene,"Feast2");
                        }
                        //If the character has been the guest of honour 5 times
                        else if(this.awards.guestOfHonour>=5){
                            event = this.findEvent(scene,"Feast3");
                        }
                        break;
                    case "enemiesDefeated":
                        scene = "EnemiesDefeated";
                        //Enemies defeated is at least 200
                        if(this.awards.enemiesDefeated>=200){
                            event = this.findEvent(scene,"EnemiesDefeated200");
                        }
                        //Enemies defeated is at least 100
                        else if(this.awards.enemiesDefeated>=100){
                            event = this.findEvent(scene,"EnemiesDefeated100");
                        } 
                        //Enemies defeated is at least 50
                        else if(this.awards.enemiesDefeated>=50){
                            event = this.findEvent(scene,"EnemiesDefeated50");
                        }
                        break;
                    case "assisted":
                        scene = "Assisted";
                        //Assisted is at least 500
                        if(this.awards.assisted>=500){
                            event = this.findEvent(scene,"Assisted500");
                        }
                        //Assisted is at least 250
                        else if(this.awards.assisted>=250){
                            event = this.findEvent(scene,"Assisted250");
                        } 
                        //Assisted is at least 100
                        else if(this.awards.assisted>=100){
                            event = this.findEvent(scene,"Assisted100");
                        }
                        break;
                    case "battlesParticipated":
                        scene = "BattlesParticipated";
                        if(this.awards.battlesParticipated>=20){
                            event = this.findEvent(scene,"BattlesParticipated20");
                        }
                        else if(this.awards.battlesParticipated>=10){
                            event = this.findEvent(scene,"BattlesParticipated10");
                        } 
                        else if(this.awards.battlesParticipated>=5){
                            event = this.findEvent(scene,"BattlesParticipated5");
                        }
                        break;
                    case "damageDealt":
                        scene = "DamageDealt";
                        if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"DamageDealt5000");
                        }
                        else if(this.awards.damageDealt>=2500){
                            event = this.findEvent(scene,"DamageDealt2500");
                        } 
                        else if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"DamageDealt500");
                        }
                        break;
                    case "damageTaken":
                        scene = "DamageTaken";
                        if(this.awards.damageTaken>=10000){
                            event = this.findEvent(scene,"DamageTaken10000");
                        }
                        else if(this.awards.damageTaken>=5000){
                            event = this.findEvent(scene,"DamageTaken5000");
                        } 
                        else if(this.awards.damageTaken>=1000){
                            event = this.findEvent(scene,"DamageTaken1000");
                        }
                        break;
                    case "selfHealed":
                        scene = "SelfHealed";
                        if(this.awards.selfHealed>=5000){
                            event = this.findEvent(scene,"SelfHealed5000");
                        }
                        else if(this.awards.damageDealt>=2500){
                            event = this.findEvent(scene,"SelfHealed2500");
                        } 
                        else if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"SelfHealed500");
                        }
                        break;
                    case "targetHealed":
                        scene = "TargetHealed";
                        if(this.awards.targetHealed>=10000){
                            event = this.findEvent(scene,"TargetHealed10000");
                        }
                        else if(this.awards.targetHealed>=5000){
                            event = this.findEvent(scene,"TargetHealed5000");
                        } 
                        else if(this.awards.targetHealed>=1000){
                            event = this.findEvent(scene,"TargetHealed1000");
                        }
                        break;
                    case "wounded":
                        scene = "Wounded";
                        if(this.awards.timesWounded>=20){
                            event = this.findEvent(scene,"Wounded20");
                        }
                        else if(this.awards.timesWounded>=10){
                            event = this.findEvent(scene,"Wounded10");
                        } 
                        else if(this.awards.timesWounded>=5){
                            event = this.findEvent(scene,"Wounded5");
                        }
                        break;
                    case "rested":
                        scene = "Rested";
                        if(this.awards.timesRested>=20){
                            event = this.findEvent(scene,"Rested20");
                        }
                        else if(this.awards.timesRested>=10){
                            event = this.findEvent(scene,"Rested10");
                        } 
                        else if(this.awards.timesRested>=5){
                            event = this.findEvent(scene,"Rested5");
                        }
                        break;
                    //Each time the character is mentored, they get a scene
                    case "mentored":
                        scene = "Mentored";
                        if(this.awards.mentored>=3){
                            event = this.findEvent(scene,"Mentored3");
                        }
                        else if(this.awards.mentored>=2){
                            event = this.findEvent(scene,"Mentored2");
                        } 
                        else if(this.awards.mentored>=1){
                            event = this.findEvent(scene,"Mentored1");
                        }
                        break;
                    case "hunted":
                        scene = "Hunted";
                        if(this.awards.timesHunted>=3){
                            event = this.findEvent(scene,"Hunted3");
                        }
                        else if(this.awards.timesHunted>=2){
                            event = this.findEvent(scene,"Hunted2");
                        } 
                        else if(this.awards.timesHunted>=1){
                            event = this.findEvent(scene,"Hunted1");
                        }
                        break;
                    //Any custom events that require unique conditions
                    case "custom":
                        scene = "Custom";
                        //Nomadic Legionnaire's backstory is triggered when the reputation with Venoriae is low and loyalty of the character is high.
                        if(Q.state.get("saveData").relations.Venoriae[0]<=30&&this.loyalty>=70){
                            event = this.findEvent(scene,"NomadicLegionnaireBackstory");
                        }
                        break;
                }
                if(scene.length&&event.length) Q.state.get("potentialEvents").push([char,scene,event]);
            };
            //Search to see if the character has triggered this event already.
            char.findEvent = function(scene,event){
                return this.events[scene].filter(function(ev){
                    return ev===event;
                })[0];
            };
            //Check through the character's personality array to see if they have a certain personality.
            char.hasPersonality = function(per){
                var hasPersonality = false;
                this.personality.forEach(function(p){
                    if(p===per) hasPersonality = true;
                });
                return hasPersonality;
            };
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
        stage.add("viewport");
        stage.viewport.scale = 2;
        //The invisible sprite that the viewport follows
        stage.viewSprite = stage.insert(new Q.ViewSprite());
        Q.viewFollow(stage.viewSprite,stage);
        //Set the batcon's stage
        Q.BatCon.stage = stage;

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
            //Set the battlegrid's stage
            Q.BattleGrid.stage = stage;
            //Reset the battle grid for this battle
            Q.BattleGrid.reset();
            //Set the batcon's stage
            Q.BatCon.stage = stage;
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
