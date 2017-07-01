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
            
            this.equipment = Q.state.get("equipment");
            this.qualityKeys = Object.keys(this.equipment.Quality);
        },
        //Generates a character by processing the passed in data.
        //All properties are included except loc and dir, which depend on the event.
        //These properties should be added to the returned character
        generateCharacter:function(data,type){
            var char = {};
            var act = "Act-"+Q.state.get("saveData").act;
            switch(type){
                //Create a character for the applications roster.
                //Data will not be completely random, but will be based on the act/chapter.
                //Seeds are taken from the character-genartion.json file.
                case "roster":
                    char.team = "ally";
                    //Generate the level based on the Act
                    char.level = data.level || this.generateLevel(act);
                    char.nationality = data.nationality || this.generateNationality(act);
                    
                    if(data.personality){
                        char.personality = data.personality;
                    } else {
                        char.personality = [];
                        for(var i=0,j=Math.ceil(Math.random()*3);i<j;i++){
                            char.personality.push(this.generatePersonality());
                        }
                    }
                    
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass || this.generateCharClass(char.nationality);
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.primaryStat = this.primaryStats[char.classNum];
                    char.secondaryStat = this.secondaryStats[char.classNum];
                    
                    char.equipment = data.equipment || this.generateAllEquipment(char.charClass);//TODO
                    char.techniques = data.techniques || this.generateTechniques(char.charClass,char.level);//Requires charClass and level
                    char.baseStats = data.baseStats || this.statsToLevel(this.generateBaseStats(),char.primaryStat,char.secondaryStat,char.level);//Requires level, primary, and secondary
                    char.gender = data.gender || this.generateGender(char.charClass,char.natNum);//Requires charClass and natNum
                    char.name = data.name || this.generateName(char.natNum,char.gender);//Requires natNum and gender
                    char.combatStats = this.getCombatStats(char);
                    
                    char.exp = data.exp || 0;
                    char.loyalty = data.loyalty || 50;
                    char.morale = data.morale || 50;
                    break;
                //Special case for Alex as he/she does not have personality, methodology, value, loyalty, or morale.
                case "alex":
                    char.team = "ally";
                    char.officer = true;
                    char.name = data.name;
                    char.level = data.level;
                    char.gender = data.gender;
                    char.equipment = {
                        righthand:data.equipment.righthand?this.convertEquipment([data.equipment.righthand[1],data.equipment.righthand[2]],data.equipment.righthand[0]):false,
                        lefthand:data.equipment.lefthand?this.convertEquipment([data.equipment.lefthand[1],data.equipment.lefthand[2]],data.equipment.lefthand[0]):false,
                        armour:data.equipment.armour?this.convertEquipment([data.equipment.armour[1],data.equipment.armour[2]],data.equipment.armour[0]):false,
                        footwear:data.equipment.footwear?this.convertEquipment([data.equipment.footwear[1],data.equipment.footwear[2]],data.equipment.footwear[0]):false,
                        accessory:data.equipment.accessory?this.equipment.gear[data.accessory]:false
                    };
                    char.baseStats = data.baseStats;
                    char.techniques = data.techniques;
                    char.nationality = data.nationality;
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.exp = data.exp;
                    char.primaryStat = data.primaryStat;
                    char.secondaryStat = data.secondaryStat;
                    
                    char.combatStats = this.getCombatStats(char);
                    char.uniqueId = 0;
                break;
                //This is done when generating an officer from the officers.json. Only do this for new officers.
                //Officers have all of their properties preset so they always start the same each playthrough.
                case "officer":
                    //Set this character to officer for easy reference later.
                    char.officer = true;
                    data.uniqueId = 0;
                //Take the save data and create an ally character based on it.
                //This is done only when the game is initialized.
                case "saved":
                    char.team = "ally";
                    char.name = data.name;
                    char.uniqueId = data.uniqueId;
                    char.level = data.level;
                    char.gender = data.gender;
                    
                    char.equipment = {
                        righthand:data.equipment.righthand?this.convertEquipment([data.equipment.righthand[1],data.equipment.righthand[2]],data.equipment.righthand[0]):false,
                        lefthand:data.equipment.lefthand?this.convertEquipment([data.equipment.lefthand[1],data.equipment.lefthand[2]],data.equipment.lefthand[0]):false,
                        armour:data.equipment.armour?this.convertEquipment([data.equipment.armour[1],data.equipment.armour[2]],data.equipment.armour[0]):false,
                        footwear:data.equipment.footwear?this.convertEquipment([data.equipment.footwear[1],data.equipment.footwear[2]],data.equipment.footwear[0]):false,
                        accessory:data.equipment.accessory?this.equipment.gear[data.accessory]:false
                    };
                    char.baseStats = data.baseStats;
                    char.techniques = data.techniques;
                    char.nationality = data.nationality;
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.value = data.value;
                    char.methodology = data.methodology;
                    char.exp = data.exp;
                    char.primaryStat = data.primaryStat;
                    char.secondaryStat = data.secondaryStat;
                    char.loyalty = data.loyalty;
                    char.morale = data.morale;
                    char.personality = data.personality;
                    
                    char.combatStats = this.getCombatStats(char);
                    break;
                //Create an enemy used in battles
                //The data will include a reference to the actual character properties that are in the character's file.
                case "enemy":
                    char.team = "enemy";
                    char.loc = data.loc;
                    char.dir = data.dir;
                    char.uniqueId = data.uniqueId;
                    char.exp = 0;
                    //Reset the data variable
                    data = Q.state.get("characterFiles")[data.file][data.group][data.handle];
                    
                    //Random number between levelmin and levelmax
                    char.level = Math.floor(Math.random()*(data.levelmax-data.levelmin))+data.levelmin;
                    char.nationality = data.nationality==="Random"?this.generateNationality(act):data.nationality;
                    
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass==="Random"?this.generateCharClass(char.nationality):data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.primaryStat = this.primaryStats[char.classNum];
                    char.secondaryStat = this.secondaryStats[char.classNum];
                    
                    char.equipment = this.enemyEquipment(data.equipment,char.classNum,char.natNum);
                    
                    char.techniques = data.techniques;//Techniques are always filled out and are not random for enemies.
                    char.baseStats = this.enemyBaseStats(data.baseStats,char.level,char.primaryStat,char.secondaryStat);
                    
                    char.gender = data.gender==="Random"?this.generateGender(char.charClass,char.natNum):data.gender;//Requires charClass and natNum
                    char.name = data.name.length ? data.name : this.generateName(char.natNum,char.gender);
                    
                    char.combatStats = this.getCombatStats(char);
                    break;
                //Creates a simple character sprite used in battle scenes.
                //Doesn't generate combat 
                case "simple":
                    
                    break;
            }
            return char;
        },
        equipQuality:function(val,level){
            var qualities = Q.state.get("defaultEquipment").quality;
            var qualityChance = 0;
            switch(val){
                case "Default":
                    if(level>=50) qualityChance = 5;
                    else if(level>=40) qualityChance = 4;
                    else if(level>=30) qualityChance = 3;
                    else if(level>=20) qualityChance = 2;
                    else if(level>=10) qualityChance = 1;
                    else if(level>=1) qualityChance = 0;
                    return this.qualityKeys[this.getIdx(qualities[qualityChance],this.rand())];
                case "Random Low":
                    qualityChance = Math.floor(Math.random()*2);
                    return this.qualityKeys[qualityChance];
                case "Random Medium":
                    qualityChance = Math.floor(Math.random()*3)+2;
                    return this.qualityKeys[qualityChance];
                case "Random High":
                    qualityChance = Math.floor(Math.random()*2)+5;
                    return this.qualityKeys[qualityChance];
                case "Random":
                    qualityChance = Math.floor(Math.random()*7);
                    return this.qualityKeys[qualityChance];
                default:
                    return val;
            }
        },
        //Position is rh,lh,armour, etc..
        equipGear:function(gearName,material,classNum,natNum,position){
            switch(gearName){
                case "Default":
                    var gear = Q.state.get("defaultEquipment").gear;
                    var eq = gear[classNum][natNum][position];
                    //Randomize between the few that are here
                    //The 0th position is reserved for the random chance array.
                    return eq[this.getIdx(eq[0],this.rand())+1];
                case "None":
                    return false;
                default:
                    return [gear,material];
            }
        },
        //Changes the equipment from an array to an object containing all of the stats from equipment.json
        //eq is an array [gearMaterial,gearName]
        convertEquipment:function(eq,quality){
            var data = this.equipment.gear[eq[1]];
            var keys = Object.keys(data);
            var gear = {
                material:eq[0],
                quality:quality,
                name:eq[1]
            };
            keys.forEach(function(key){
                if(key==="materials") return;
                gear[key] = data[key];
            });
            var materialData = this.equipment.Materials[gear.material];
            var qualityData = this.equipment.Quality[gear.quality];
            gear.weight = Math.ceil(gear.weight+materialData[0]);
            gear.cost = Math.ceil(gear.cost*qualityData[1]*materialData[2]);
            if(gear.block) gear.block = Math.ceil(gear.block*materialData[1]*qualityData[0]);
            if(gear.wield) gear.wield = Math.ceil(gear.wield*qualityData[0]);
            if(gear.mindmg) gear.mindmg = Math.ceil(gear.mindmg*materialData[1]);
            if(gear.maxdmg) gear.maxdmg = Math.ceil(gear.maxdmg*materialData[1]);
            if(gear.speed) gear.speed = Math.ceil(gear.speed*qualityData[0]);
            if(gear.damageReduction) gear.damageReduction = Math.ceil(gear.damageReduction*materialData[1]*qualityData[0]);
            return gear;
        },
        enemyEquipment:function(val,classNum,natNum){
            var rh = this.convertEquipment(this.equipGear(val.righthand[1],val.righthand[2],classNum,natNum,0),this.equipQuality(val.righthand[0],classNum,natNum));
            var lh = false;
            if(rh.hands!==2){
                lh = this.convertEquipment(this.equipGear(val.lefthand[1],val.lefthand[2],classNum,natNum,1),this.equipQuality(val.lefthand[0],classNum,natNum));
            }
            var ar = this.convertEquipment(this.equipGear(val.armour[1],val.armour[2],classNum,natNum,2),this.equipQuality(val.armour[0],classNum,natNum));
            var ft = this.convertEquipment(this.equipGear(val.footwear[1],val.footwear[2],classNum,natNum,3),this.equipQuality(val.footwear[0],classNum,natNum));
            //Accessory is always either set or not. No Random.
            var ac = false;
            if(val.accessory&&val.accessory!=="None"){
                ac = this.equipment.gear[val.accessory];
            }
            return {
               righthand:rh,
               lefthand:lh,
               armour:ar,
               footwear:ft,
               accessory:ac
            };
        },
        enemyBaseStats:function(val,level,primary,secondary){
            if(Q._isArray(val)){
                switch(val[0]){
                    case "Random":
                        switch(val[1]){
                            case "Low":
                                return this.statsToLevel(this.generateBaseStats(10,5),primary,secondary,level);
                            case "Medium":
                                return this.statsToLevel(this.generateBaseStats(12,5),primary,secondary,level);
                            case "High":
                                return this.statsToLevel(this.generateBaseStats(15,5),primary,secondary,level);
                            case "Maxed":
                                return this.statsToLevel(this.generateBaseStats(20,0),primary,secondary,level);
                        }
                        break;
                    case "Specialized":
                        switch(val[1]){
                            case "Low":
                                var stats = this.statsToLevel(this.generateBaseStats(10,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "Medium":
                                var stats = this.statsToLevel(this.generateBaseStats(12,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "High":
                                var stats = this.statsToLevel(this.generateBaseStats(15,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "Maxed":
                                var stats = this.statsToLevel(this.generateBaseStats(20,0),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                        }
                        break;
                }
            } 
            //If the stats are in object form, they are already generated
            else {
                return val;
            }
        },
        getNatNum:function(nat){
            return this.nationalities.indexOf(nat);
        },
        getClassNum:function(cl){
            return this.classNames.indexOf(cl);
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
        generatePersonality:function(){
            return this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)],this.personalityNames[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]];
        },
        generateMethodology:function(charClass,natNum){
            return this.methodologies[this.getIdx(this.classes[charClass].methodology[natNum],this.rand())];
        },
        generateValue:function(charClass,natNum){
            return this.values[this.getIdx(this.classes[charClass].value[natNum],this.rand())];
        },
        generateLevel:function(act){
            return this.scenes[act].startLevel+this.getIdx(this.scenes[act].spread,this.rand());  
        },
        generateCharClass:function(nationality){
            return this.classKeys[this.getIdx(this.natClasses[nationality].classSpread,this.rand())];
        },
        generateCharGroup:function(classNum){
            return classNum<3?"Fighter":classNum>5?"Mage":"Rogue";
        },
        generateNationality:function(act){
            return this.natKeys[this.getIdx(this.scenes[act].natSpread,this.rand())];
        },
        generateGender:function(charClass,natNum){
            return this.genders[this.getIdx([this.classes[charClass].gender[natNum],100],this.rand())]; 
        },
        
        generateName:function(natNum,gender){
            var numNameParts = this.getIdx(this.nameParts[natNum].nameParts,this.rand())+1;
            var charName = "";
            var main = this.nameParts[natNum].main;
            for(var i=0;i<numNameParts;i++){
                charName+=main[Math.floor(Math.random()*main.length)];
            }
            //Nomads have different prefix
            if(this.nationalities[natNum]==="Nomadic") charName=this.nameParts[natNum][gender][Math.floor(Math.random()*this.nameParts[natNum][gender].length)]+charName;
            else charName+=this.nameParts[natNum][gender][Math.floor(Math.random()*this.nameParts[natNum][gender].length)];
            return charName.charAt(0).toUpperCase() + charName.slice(1);
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
        statsToLevel:function(stats,primary,secondary,level){
            stats[primary]+=5;
            stats[secondary]+=3;
            for(var idx=0;idx<level;idx++){
                var num = idx%this.order.length;
                stats = this.levelUp(this.order[num],stats,primary,secondary);
            }  
            return stats;
        },
        //Generate lv 1 base stats for a character with control over the range of random values (default 10-20)
        generateBaseStats:function(min,variance){
            min = min?min:10,variance = variance?variance:10;
            var stats = {};
            //Set all lv 1 stats
            this.statNames.forEach(function(st){
                stats[st] = Math.floor(Math.random()*variance)+min;
            });
            return stats;
        },
        generateTechniques:function(charClass,level){
            var allSkills = Q.state.get("skills");
            var techs = [];
            //How many techniques are possible (up to level 20, each character gets 1 technique per 4 levels and start with 1 technique).
            var len = Math.floor(level/4)+1;
            //For now, always give class specific techniques.
            if(len>6) len = 6;
            for(var i=0;i<len;i++){
                techs.push(allSkills[charClass][i]);
            }
            return techs;
        },
        //Used for the applications roster. TODO: take into account the act for what equipment to spawn. Also the charClass.
        generateAllEquipment:function(charClass){
            var equipment = {};
            equipment.righthand = this.randomizeEquipment();
            equipment.lefthand = this.randomizeEquipment();
            equipment.armour = this.randomizeEquipment();
            equipment.footwear = this.randomizeEquipment();
            equipment.accessory = false;//this.randomizeEquipment("Accessory");
            return equipment;
        },
        //Generates a random piece of equipment by filling in the vars that are to be randomized.
        randomizeEquipment:function(quality,material,gear){
            var eq = this.equipment.gear;
            if(!quality) quality = this.qualityKeys[Math.floor(Math.random()*this.qualityKeys.length)];
            if(!gear) gear = Object.keys(eq)[Math.floor(Math.random()*Object.keys(eq).length)];
            if(!material) material = eq[gear].materials[Math.floor(Math.random()*eq[gear].materials.length)];
            return [quality,material,gear];
        },
        rand:function(){
            return Math.ceil(Math.random()*100);
        },
        getEquipmentProp:function(prop,eq){
            return eq&&eq[prop]?eq[prop]:0;
        },
        getCombatStats:function(char){
            var stats = {
                maxHp:this.getHp(char.level,char.baseStats.end,char.charGroup),
                painTolerance:this.getPainTolerance(char.level,char.baseStats.end,char.charGroup),
                damageReduction:this.getDamageReduction(this.getEquipmentProp("damageReduction",char.equipment.armour)),
                physicalResistance:this.getPhysicalResistance(char.baseStats.str,char.baseStats.end),
                mentalResistance:this.getMentalResistance(char.baseStats.ini,char.baseStats.eff),
                magicalResistance:this.getMagicalResistance(char.baseStats.enr,char.baseStats.skl),
                
                atkRange:this.getAttackRange(this.getEquipmentProp("range",char.equipment.righthand),this.getEquipmentProp("range",char.equipment.lefthand)),
                maxAtkDmg:this.getMaxAttackDamage(char.baseStats.str,char.level,this.getEquipmentProp("maxdmg",char.equipment.righthand),this.getEquipmentProp("handed",char.equipment.righthand),char.charGroup),
                minAtkDmg:this.getMinAttackDamage(char.baseStats.str,char.level,this.getEquipmentProp("mindmg",char.equipment.righthand),this.getEquipmentProp("handed",char.equipment.righthand),char.charGroup),
                maxSecondaryDmg:this.getMaxSecondaryAttackDamage(char.baseStats.str,char.level,this.getEquipmentProp("maxdmg",char.equipment.lefthand),char.charGroup),
                minSecondaryDmg:this.getMinSecondaryAttackDamage(char.baseStats.str,char.level,this.getEquipmentProp("mindmg",char.equipment.lefthand),char.charGroup),
                
                maxTp:this.getTp(char.baseStats.enr,char.level,char.charGroup),
                
                encumbranceThreshold:this.getEncumbranceThreshold(char.baseStats.str,char.charGroup),
                totalWeight:this.getTotalWeight(this.getEquipmentProp("weight",char.equipment.righthand),this.getEquipmentProp("weight",char.equipment.lefthand),this.getEquipmentProp("weight",char.equipment.armour),this.getEquipmentProp("weight",char.equipment.shoes),this.getEquipmentProp("weight",char.equipment.accessory)),
                
                initiative:this.getInitiative(char.baseStats.ini)
            };
            stats.encumbrancePenalty = this.getEncumbrancePenalty(stats.totalWeight,stats.encumbranceThreshold);
            stats.atkAccuracy = this.getAttackAccuracy(char.baseStats.wsk,((this.getEquipmentProp("wield",char.equipment.righthand)+this.getEquipmentProp("wield",char.equipment.lefthand))/2),stats.encumbrancePenalty,char.level);
            stats.critChance = this.getCriticalChance(stats.atkAccuracy,char.charGroup);
            stats.atkSpeed = this.getAttackSpeed(char.baseStats.dex,this.getEquipmentProp("speed",char.equipment.righthand),this.getEquipmentProp("speed",char.equipment.lefthand),stats.encumbrancePenalty,char.level,char.charGroup);
            stats.defensiveAbility = this.getDefensiveAbility(char.baseStats.rfl,stats.encumbrancePenalty,char.level,this.getEquipmentProp("block",char.equipment.lefthand));
            stats.moveSpeed = this.getMoveSpeed(stats.encumbrancePenalty,char.charGroup);
            
            stats.hp = stats.maxHp;
            stats.tp = stats.maxTp;
            return stats;
        },
        getHp:function(level,end,charGroup){
            var r = charGroup==="Fighter"?3:charGroup==="Rogue"?2:charGroup==="Mage"?1:0;
            var q = charGroup==="Fighter"?12:charGroup==="Rogue"?10:charGroup==="Mage"?3:0;
            return Math.floor((end*q)+(level*r));
        },
        getPainTolerance:function(level,end,charGroup){
            var z = charGroup==="Fighter"?5:charGroup==="Rogue"?4:charGroup==="Mage"?3:0;
            return Math.floor(end*z+level);
        },
        getDefensiveAbility:function(rfl,encPenalty,level,block){
            return rfl+encPenalty+level+block;
        },
        getDamageReduction:function(damageReductionOfArmour){
            return damageReductionOfArmour;
        },
        getPhysicalResistance:function(str,end){
            return str+end;
        },
        getMentalResistance:function(ini,eff){
            return ini+eff;
        },
        getMagicalResistance:function(enr,skl){
            return enr+skl;
        },
        getAttackAccuracy:function(wsk,wield,encPenalty,level){
            return Math.floor(wsk+wield+encPenalty+level);
        },
        getCriticalChance:function(attackAccuracy,charGroup){
            var g = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
            return Math.floor(attackAccuracy/g);
        },
        getAttackSpeed:function(dex,weaponSpeedRight,weaponSpeedLeft,encPenalty,level,charGroup){
            var d = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
            return Math.floor(dex+weaponSpeedRight+(weaponSpeedLeft/2)+encPenalty+(level*d));
        },
        getAttackRange:function(attackRangeRight,attackRangeLeft){
            return attackRangeRight>attackRangeLeft?attackRangeRight:attackRangeLeft;
        },
        getMaxAttackDamage:function(str,level,maxDamageRight,handed,charGroup){
            var t = handed===1?1:1.5;
            var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
            return Math.floor((str*t)+(level*h)+maxDamageRight);
        },
        getMinAttackDamage:function(str,level,minDamageRight,handed,charGroup){
            var t = handed===1?1:1.5;
            var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
            return Math.floor((str*t)+(level*h)+minDamageRight);
        },
        getMaxSecondaryAttackDamage:function(str,level,maxDamageLeft,charGroup){
            var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
            return Math.floor((str*0.5)+(level*h)+maxDamageLeft);
        },
        getMinSecondaryAttackDamage:function(str,level,minDamageLeft,charGroup){
            var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
            return Math.floor((str*0.5)+(level*h)+minDamageLeft);
        },
        
        getTp:function(enr,level,charGroup){
            var f = charGroup==="Fighter"?2:charGroup==="Rogue"?3:charGroup==="Mage"?5:0;
            return Math.floor((enr*f)+level);
        },
        getMoveSpeed:function(encPenalty,charGroup){
            var m = charGroup==="Fighter"?6:charGroup==="Rogue"?7:charGroup==="Mage"?5:0;
            return m + Math.floor(encPenalty/10);
        },
        getEncumbranceThreshold:function(str,charGroup){
            var e = charGroup==="Fighter"?2:charGroup==="Rogue"?1.5:charGroup==="Mage"?1:0;
            return Math.floor(str*e);
        },
        getTotalWeight:function(rightHandWeight,leftHandWeight,armourWeight,shoesWeight,accessoryWeight){
            return rightHandWeight+leftHandWeight+armourWeight+shoesWeight+accessoryWeight;
        },
        getEncumbrancePenalty:function(totalWeight,encThreshold){
            return Math.max(0,totalWeight-encThreshold);
        },
        getInitiative:function(ini){
            return ini;
        }
        //Generates a character by filling in the blanks for data that is not set
        /*generateCharacter:function(data){
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
            
            char.nationality = data.nationality?data.nationality:this.generateProp("nationality",char);
            char.natNum = Q.getNationalityNum(char.nationality);
            
            char.charClass = data.charClass?data.charClass:this.generateProp("charClass",char);
            char.classNum = Q.getCharClassNum(char.charClass);
            
            char.level = data.level?data.level:this.generateProp("level",char);
            
            char.skills = data.skills?getSkills(data.skills):this.generateSkills(char);
            
            char.gender = data.gender?data.gender:this.generateProp("gender",char);
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
            //TODO: make sure that if a character has the same name as another character, they have a different uniqueId
            char.uniqueId = data.uniqueId?data.uniqueId:0;
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
        }*/
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
            Q.stageScene("battleHUD",3,{pointer:Q.pointer});
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
