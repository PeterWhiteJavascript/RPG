function convertEquipment(data){
    var obj = {
        gear:{},
        Quality:data.Quality,
        Materials:data.Materials
    };
    var keys = ["Weapons","Shields","Armour","Footwear","Accessories"];
    keys.forEach(function(key){
        var gears = Object.keys(data[key]);
        gears.forEach(function(gear){
            obj.gear[gear] = data[key][gear];
            obj.gear[gear].kind = key;
            obj.gear[gear].name = gear;
        });
    });
    return obj;
};

var CharacterGenerator = {
    init:function(data,equipment,defaultEquipment,techniques,talents,awards){
        this.characterGeneration = data;
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
        this.trimmedBaseStats = data.trimmedBaseStats;
        this.statNames = data.statNames;
        this.primaryStats = data.primaryStats;
        this.primaryCoordinates = data.primaryCoords;
        this.levelUpGraph = data.levelUpGraph;
        this.levelUpMultiplier = data.levelUpMultiplier;
        
        this.equipment = convertEquipment(equipment);
        this.qualityKeys = Object.keys(this.equipment.Quality);
        
        this.defaultEquipment = defaultEquipment;
        
        this.techniques = techniques;
        this.allTechs = this.convertTechniques(techniques);
        this.talents = talents;
        this.awards = awards;
    },
    generateCharFromSave:function(data){
        
    },
    generateCharacter:function(data){
        data = data || {};
        var act = Q ? "Act-"+Q.state.get("saveData").act : "Act-1-1";
        var char = {
            tempStatChanges:[]
        };
        char.team = data.team || "Ally";
        
        char.level = data.level || this.generateLevel(data.levelmin,data.levelmax,act);
        char.nationality = data.nationality==="Random" || !data.nationality ? this.generateNationality(act) : data.nationality;
        char.natNum = this.getNatNum(char.nationality);
        
        char.personality = data.personality ? data.personality : this.getPersonality();
        
        char.charClass = data.charClass === "Random" || !data.charClass ? this.generateCharClass(char.nationality) : data.charClass;
        char.classNum = this.getClassNum(char.charClass);
        char.charGroup = this.generateCharGroup(char.classNum);

        char.primaryStat = this.primaryStats[char.classNum];
        char.primaryCoordinate = this.primaryCoordinates[char.classNum];
        char.equipment = data.equipment ? this.getEquipment(data.equipment,char.classNum,char.natNum,char.level) : this.generateEquipment(char.classNum,char.natNum,char.level);
        char.classTechniques = this.setLevelTechniques(this.generateCharClassTechniques(char.charClass,char.level),char.level);
        
        char.lean = this.getLean(data.lean) || [this.generateStatLean(),this.generateStatLean()];
        char.baseStats = data.baseStats ? this.getBaseStats(data.baseStats,char.primaryStat,char.primaryCoordinate,char.level,char.lean) : this.statsToLevel(this.generateBaseStats(),char.primaryStat,char.primaryCoordinate,char.level,char.lean);
        
        //If the character has a random charClass, generate default techniques.
        char.techniques = data.techniques && data.charClass !== "Random" ? this.categorizeTechniques(this.getTechniques(this.setLevelTechniques(data.techniques,char.level),char.charClass,char.equipment),char.equipment,char.baseStats.skl) : this.categorizeTechniques(this.generateTechniques(char.charClass,char.level,char.equipment),char.equipment,char.baseStats.skl);
        char.talents = this.getTalents(char.charClass, char.charGroup);
        
        char.gender = data.gender === "Random" || !data.gender ? this.generateGender(char.charClass,char.natNum) : data.gender;
        char.name = data.name || this.generateName(char.natNum,char.gender);//Requires natNum and gender
        char.exp = data.exp || 0;
        char.loyalty = data.loyalty || 50;
        char.morale = data.morale || 50;
        char.awards =  this.emptyAwards();

        char.completedEvents =  [];
        char.combatStats = this.getCombatStats(char);
        
        //TEMP: print out alex for testing
        //char.name === "Alex" ? console.log(char) : false;
        //console.log(char)
        return char;
    },
    calculateCostOfCharacter:function(char){
        var baseCost = 100;
        var levelMultiplier = 20;
        var cost = Math.floor(baseCost + (char.level * levelMultiplier) + this.getAllGearCost(char.equipment));
        return cost;
    },
    emptyAwards:function(){
        var awards = this.awards;
        var keys = Object.keys(awards);
        var obj = {};
        keys.forEach(function(key){
            obj[key] = 0;
        });
        return obj;
    },
    getLean:function(lean){
        if(!lean) return false;
        //If we need to process the lean, do it here
        return lean;
    },
    //Generates four random numbers that all add up to 100
    generateStatLean:function(){
        //Force at least 1 percent chance for each stat
        var lean = [1,1,1,1];
        //Start at 96 since 4 is already taken.
        var num = 96;
        //The skew is how far apart the numbers will probably be. Higher skew = higher chance of very big/very small numbers.
        var skew = 12;
        //Generate some pretty decent random numbers
        while(num>0){
            var rand = Math.ceil(Math.random()*skew);
            if(rand>num) rand = num;
            lean[Math.floor(Math.random()*4)] += rand;
            num -= rand;
        }
        return lean;
    },
    equipQuality:function(val,level){
        var qualities = this.defaultEquipment.quality;
        var qualityChance = 0;
        switch(val){
            case "Default":
                if(level>=50) qualityChance = 5;
                else if(level>=40) qualityChance = 4;
                else if(level>=30) qualityChance = 3;
                else if(level>=20) qualityChance = 2;
                else if(level>=10) qualityChance = 1;
                else if(level>=1) qualityChance = 0;
                var num = Math.min(this.qualityKeys.length-1,this.getIdx(qualities[qualityChance],this.rand()));
                return this.qualityKeys[num];
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
    generateEquipment:function(classNum,natNum,level){
        
        //TODO: primary/secondary hands wand/staff/bow
        return [
            this.convertEquipment(this.equipGear("Default",false,classNum,natNum,0),this.equipQuality("Default",level)),
            this.convertEquipment(this.equipGear("Default",false,classNum,natNum,1),this.equipQuality("Default",level)),
            this.convertEquipment(this.equipGear("Default",false,classNum,natNum,2),this.equipQuality("Default",level)),
            this.convertEquipment(this.equipGear("Default",false,classNum,natNum,3),this.equipQuality("Default",level)),
            "None"
        ];
    },
    //Position is rh,lh,armour, etc..
    equipGear:function(gearName,material,classNum,natNum,position){
        if(!gearName) return false;
        switch(gearName){
            case "Default":
                var gear = this.defaultEquipment.gear;
                var eq = gear[classNum][natNum][position];
                //Randomize between the few that are here
                //The 0th position is reserved for the random chance array.
                var itm = eq[this.getIdx(eq[0],this.rand())+1];
                return itm;
            case "None":
                return false;
            default:
                return [material,gearName];
        }
    },
    getGearCost:function(gear){
        var base = gear.cost;
        var quality = this.equipment.Quality[gear.quality] || 0;
        var material = this.equipment.Materials[gear.material] || 0;
        return Math.floor(base * quality.cost * material.cost) || base;
    },
    //Changes the equipment from an array to an object containing all of the stats from equipment.json
    //eq is an array [gearMaterial,gearName]
    convertEquipment:function(eq,quality){//console.log(eq,quality)
        if(!eq) return false;
        var data = this.equipment.gear[eq[1]];
        var keys = Object.keys(data);
        var gear = {
            material:eq[0],
            quality:quality,
            gear:eq[1]
        };
        keys.forEach(function(key){
            if(key==="materials") return;
            gear[key] = data[key];
        });
        var materialData = this.equipment.Materials[gear.material] || 0;
        var qualityData = this.equipment.Quality[gear.quality] || 0;
        gear.weight = Math.ceil(gear.weight+materialData.weight) || gear.weight;
        gear.cost = this.getGearCost(gear);
        if(gear.block) gear.block = Math.ceil(gear.block*materialData.power*qualityData.power);
        if(gear.wield) gear.wield = Math.ceil(gear.wield*qualityData.power);
        if(gear.mindmg) gear.mindmg = Math.ceil(gear.mindmg*materialData.power);
        if(gear.maxdmg) gear.maxdmg = Math.ceil(gear.maxdmg*materialData.power);
        if(gear.speed) gear.speed = Math.ceil(gear.speed*qualityData.power);
        if(gear.damageReduction) gear.damageReduction = Math.ceil(gear.damageReduction*materialData.power*qualityData.power);
        return gear;
    },
    getTalents:function(charClass,charGroup,promo){
        promo = promo || 0;
        var talents = this.talents;
        //Each character gets at least two talents.
        var t = [talents.General[charGroup][0].name,talents.CharClass[charClass][0].name];
            /*t.push(talents.CharClass[charClass][1].name);
            t.push(talents.CharClass[charClass][2].name);*/
        if(promo===1){
            t.push(talents.CharClass[charClass][1].name);
        } else if(promo===2){
            t.push(talents.CharClass[charClass][1].name);
            t.push(talents.CharClass[charClass][2].name);
        }
        return t;
    },
    getAllGearCost:function(gear){
        function getCost(a,b){
            return a + (b && b !== "None" ? b.cost : 0);
        }
        return gear.reduce(getCost,0);
    },
    getEquipment:function(val,classNum,natNum,level){
        function checkDefault(val){
            return val === "Default";
        }
        function checkString(val){
            return typeof val === "string";
        }
        function getEq(gearName,material,classNum,natNum,pos,level,quality){
            return CharacterGenerator.convertEquipment(CharacterGenerator.equipGear(gearName,material,classNum,natNum,pos),CharacterGenerator.equipQuality(quality,level));
        }
        //First, check if it's a default equipment (for randoms). In that case, generate the default. 
        //Otherwise, check if it's a string (for None).
        //If it's not a string, generate the equipment from the object provided.
        var rh = checkDefault(val[0]) ? getEq("Default",false,classNum,natNum,0,level,"Default") : checkString(val[0]) ? false : getEq(val[0][0],val[0][1],classNum,natNum,0,level,val[0][2]);
        
        var lh = false;
        if(!rh||rh.hands!==2){
            lh = checkDefault(val[0]) ? getEq("Default",false,classNum,natNum,1,level,"Default") : checkString(val[0]) ? false : getEq(val[1][0],val[1][1],classNum,natNum,1,level,val[0][2]);
        }
        var ar = checkDefault(val[0]) ? getEq("Default",false,classNum,natNum,2,level,"Default") : checkString(val[0]) ? false : getEq(val[2][0],val[2][1],classNum,natNum,2,level,val[0][2]);
        var ft = checkDefault(val[0]) ? getEq("Default",false,classNum,natNum,3,level,"Default") : checkString(val[0]) ? false : getEq(val[3][0],val[3][1],classNum,natNum,3,level,val[0][2]);
        //Accessory is always either set or not. No Random.
        var ac = false;
        if(val[4]&&val[4]!=="None"){
            ac = this.equipment.gear[val[4]];
        }
        return [rh,lh,ar,ft,ac];
    },
    categorizeTechniques:function(techs, equipment, skill){
        var processed = {
            active:[],
            passive:[]
        };
        
        function processArgs(args,tech){
            var processedArgs = [];
            args ? false : console.log(args);
            for(var i=0;i<args.length;i++){
                var func = args[i][0];
                var props = args[i][1];
                var arg = {
                    func:func
                };
                switch(func){
                    case "Change Stat Active":
                        arg.affects = props[0];
                        arg.statType = props[1];
                        arg.stat = props[2];
                        arg.oper = props[3];
                        arg.value = {
                            type:props[4],
                            stat:props[5],
                            oper:props[6],
                            amount:props[7]
                        };
                        arg.turns = props[8];
                        arg.accuracy = props[9];
                        break;
                    case "Change Stat After Combat":
                        arg.affects = props[0];
                        arg.statType = props[1];
                        arg.stat = props[2];
                        arg.oper = props[3];
                        arg.value = {
                            type:props[4],
                            stat:props[5],
                            oper:props[6],
                            amount:props[7]
                        };
                        arg.turns = props[8];
                        arg.accuracy = props[9];
                        break;
                    case "Change Stat Passive":
                        arg.statType = props[0];
                        arg.stat = props[1];
                        arg.oper = props[2];
                        arg.value = props[3];
                        break;
                    case "Apply Status Effect":
                        arg.affects = props[0];
                        arg.statusEffect = props[1];
                        arg.turns = props[2];
                        arg.accuracy = props[3];
                        break;
                    case "Change Ground":
                        arg.target = props[0];
                        arg.tile = props[1];
                        arg.minTurns = props[2];
                        arg.maxTurns = props[3];
                        arg.accuracy = props[4];
                        break;
                    case "Move Character":
                        arg.target = props[0];
                        arg.direction = props[1];
                        arg.numTiles = props[2];
                        arg.movementType = props[3];
                        tech.hasMovement = true;
                        break;
                }
                processedArgs.push(arg);
            }
            tech.args = processedArgs;
        }
        function getRange(amount,type,rh,lh,skill){
            if(type === "Normal") return amount;
            if(type === "Weapon"){
                var weaponOfChoice = rh;
                if(rh && lh){
                    weaponOfChoice = rh.range < lh.range ? lh : rh;
                }
                return weaponOfChoice.range;
            }
            if(type === "Weapon w Skill"){
                var weaponOfChoice = rh;
                if(rh && lh){
                    weaponOfChoice = rh.range >= lh.range ? rh : lh;
                }
                return weaponOfChoice.range + Math.max(1,Math.floor(skill/amount));
            }
            if(type === "Custom"){
                alert("Custom range is not yet coded.");
            }
        }
        function processActive(data){
            var tech = {
                name:data[0],
                desc:data[1],
                type1:data[2][0],
                type2:data[2][1],
                initialRange:data[3][0],
                range:getRange(data[3][0],data[3][1],equipment[0],equipment[1],skill),
                rangeType:data[3][1],
                rangeProps:data[3][2],
                aoe:data[4][0],
                aoeType:data[4][1],
                aoeProps:data[4][2],
                resistedBy:data[5],
                damage:data[6],
                accuracy:data[7],
                tpCost:data[8],
                animation:data[9],
                sound:data[10],
                equipment:data[12]
            };
            processArgs(data[11],tech);
            return tech;
        }
        function processPassive(data){
            var tech = {
                name:data[0],
                desc:data[1],
                equipment:data[3]
            };
            processArgs(data[2],tech);
            return tech;
        };
        for(var i=0;i<techs.length;i++){
            if(techs[i].length<10) processed.passive.push(processPassive(techs[i]));
            else processed.active.push(processActive(techs[i]));
        }
        return processed;
    },
    //When equipping a piece of gear
    addEquipment:function(character,idx,equipment){
        character.equipment[idx] = equipment;
        character.techniques = CharacterGenerator.categorizeTechniques(character.classTechniques.concat(CharacterGenerator.getEquipmentTechniques(character.equipment)),character.equipment,character.baseStats.skl);
        //Reset combatStats
        character.combatStats = CharacterGenerator.getCombatStats(character);
    },
    //When removing gear.
    removeEquipment:function(character,idx){
        function removeEquipmentTechniques(techs,eq){
            for(var i=techs.length-1;i>=0;i--){
                if(techs[i].equipment && techs[i].equipment.gear === eq.gear && techs[i].equipment.quality === eq.quality && techs[i].equipment.material === eq.material){
                    techs.splice(i,1);
                }
            }
            return techs;
        };
        if(idx <= 2){
            var toRemove = character.equipment[idx];
            var techs = character.techniques;
            techs.active = removeEquipmentTechniques(techs.active,toRemove);
            techs.passive = removeEquipmentTechniques(techs.passive,toRemove);
        }
        character.equipment[idx] = false;
    },
    convertTechniques:function(data){
        var charClassKeys = Object.keys(data.CharClass);
        var techs = data.Active.concat(data.Passive);
        for(var i=0;i<charClassKeys.length;i++){
            techs = techs.concat(data.CharClass[charClassKeys[i]]);
        }
        return techs;
    },
    findTechnique:function(name){
        return this.allTechs.find(function(tech){return tech[0] === name;});
    },
    cloneTech:function(tech){
        return $.extend(true,[],tech);
    },
    getEquipmentTechniques:function(equipment){
        function getTech(eq){
            function getGearArgs(props,args){
                for(var i=0;i<args.length;i++){
                    var arg = args[i];
                    switch(arg[0]){
                        case "Change Stat Active":
                            arg[1][7] = props[i];
                            break;
                        case "Change Stat Passive":
                            arg[1][3] = props[i];
                            break;
                    }
                }
                return args;
            };
            var data = CharacterGenerator.equipment.gear[eq.name];
            var rank = Math.ceil(CharacterGenerator.qualityKeys.indexOf(eq.quality));
            var processedTechs = [];
            
            var baseTech = CharacterGenerator.cloneTech(CharacterGenerator.findTechnique(data.techniques.Base[0]));
            var baseArgs = data.techniques.Base[1];
            baseTech[baseTech.length-1] = getGearArgs(baseArgs[rank],baseTech[baseTech.length-1]);
            //If there is TP
            if(data.techniques.Base[2]) baseTech[8] = data.techniques.Base[2][rank];
            //If there is damage
            if(data.techniques.Base[3]) baseTech[6] += data.techniques.Base[3][rank];
            processedTechs.push(baseTech);
            var techs = data.techniques[eq.material].slice(0,Math.floor(rank/2)+1);
            for(var i=0;i<techs.length;i++){
                var tech = techs[i];
                var found = CharacterGenerator.cloneTech(CharacterGenerator.findTechnique(tech[0]));
                var num = ~~(rank/2)*i;
                //Only if the num is equal to rank will it be 0.
                var rankIdx = num < rank || num > rank ? 1 : 0;
                found[found.length-1] = getGearArgs(tech[1][rankIdx],found[found.length-1]);
                if(tech[2]) found[8] = tech[2][rankIdx];
                if(tech[3]) found[6] = tech[3][rankIdx];
                processedTechs.push(found);
            }
            processedTechs.forEach(function(t){
                t.push(eq);
            });
            return processedTechs;
        }
        var techs = [];
        var primary = equipment[0];
        if(primary) techs = techs.concat(getTech(primary));
        var secondary = equipment[1];
        if(secondary) techs = techs.concat(getTech(secondary));
        //https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
        function uniq(a) {
            var seen = {};
            return a.filter(function(item) {
                return seen.hasOwnProperty(item[0]) ? false : (seen[item[0]] = true);
            });
        }
        var t = uniq(techs);
        return t;
    },
    getTechniques:function(techs,charClass,equipment){
        if(!techs) return;
        var techniques = [];
        for(var i=0;i<techs.length;i++){
            if(techs[i].length){
                if(techs[i]==="Default"){
                    techniques.push(this.techniques.CharClass[charClass][i]);
                } else {
                    techniques.push(this.findTechnique(techs[i]));
                }
            } else {
                i = techs.length;
            }
        }
        return techniques.concat(this.getEquipmentTechniques(equipment));
    },
    generateCharClassTechniques:function(charClass,level){
        var techniques = this.techniques;
        var techs = [];
        //How many techniques are possible (up to level 20, each character gets 1 technique per 4 levels and start with 1 technique).
        var len = Math.floor(level/4)+1;
        //For now, always give class specific techniques.
        if(len>6) len = 6;
        for(var i=0;i<len;i++){
            techs.push(techniques.CharClass[charClass][i]);
        }
        return techs;
    },
    generateTechniques:function(charClass,level,equipment){
        var techs = this.generateCharClassTechniques(charClass,level);
        return this.setLevelTechniques(techs,level).concat(this.getEquipmentTechniques(equipment));
    },
    //Remove some later techniques if the level is not enough
    setLevelTechniques:function(techs,level){
        if(level>=20) return techs;
        var techniques = [];
        var len = Math.floor(level/4)+1;
        if(len>6) len = 6;
        for(var i=0;i<len;i++){
            techniques.push(techs[i]);
        }
        return techniques;
    },
    getBaseStats:function(val,primary,primaryCoordinate,level,lean){
        if(Q._isArray(val)){
            switch(val[0]){
                case "Random":
                    switch(val[1]){
                        case "Low":
                            return this.statsToLevel(this.generateBaseStats(10,5),primary,primaryCoordinate,level,lean);
                        case "Medium":
                            return this.statsToLevel(this.generateBaseStats(12,5),primary,primaryCoordinate,level,lean);
                        case "High":
                            return this.statsToLevel(this.generateBaseStats(15,5),primary,primaryCoordinate,level,lean);
                        case "Maxed":
                            return this.statsToLevel(this.generateBaseStats(20,0),primary,primaryCoordinate,level,lean);
                    }
                    break;
                case "Specialized":
                    switch(val[1]){
                        case "Low":
                            var stats = this.statsToLevel(this.generateBaseStats(10,5),primary,primaryCoordinate,level,lean);
                            stats[primary]+=5;
                            return stats;
                        case "Medium":
                            var stats = this.statsToLevel(this.generateBaseStats(12,5),primary,primaryCoordinate,level,lean);
                            stats[primary]+=5;
                            return stats;
                        case "High":
                            var stats = this.statsToLevel(this.generateBaseStats(15,5),primary,primaryCoordinate,level,lean);
                            stats[primary]+=5;
                            return stats;
                        case "Maxed":
                            var stats = this.statsToLevel(this.generateBaseStats(20,0),primary,primaryCoordinate,level,lean);
                            stats[primary]+=5;
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
    getPersonality:function(){
        var personality = [];
        for(var i=0,j=Math.ceil(Math.random()*3);i<j;i++){
            personality.push(this.generatePersonality());
        }
        return personality;
    },
    generatePersonality:function(){
        return [this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)],this.personalityNames[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]]];
    },
    generateMethodology:function(charClass,natNum){
        return this.methodologies[this.getIdx(this.classes[charClass].methodology[natNum],this.rand())];
    },
    generateValue:function(charClass,natNum){
        return this.values[this.getIdx(this.classes[charClass].value[natNum],this.rand())];
    },
    generateLevel:function(levelmin,levelmax,act){
        if(levelmin && levelmax){
            return Math.floor(Math.random()*(levelmax - levelmin))+ levelmin;
        } else {
            return this.scenes[act].startLevel+this.getIdx(this.scenes[act].spread,this.rand());  
        }
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
    checkLevelUp:function(exp){
        if(exp >= 100) return true;
    },
    levelWithExp:function(exp,stats,primary,primaryCoordinate,lean){
        var levels = Math.floor(exp / 100);
        var newStats = stats;
        for(var i=0;i<levels;i++){
            newStats = this.levelUp(newStats,primary,primaryCoordinate,lean);
        }
        var newExp = exp - levels * 100;
        return {stats:newStats, levels:levels, newExp:newExp};
    },
    levelUp:function(stats,primary,primaryCoordinate,lean){
        function inBounds(num){
            return num>2 ? 0 : num<0 ? 2 : num;
        };
        stats[primary] += 1;
        var center = primaryCoordinate;
        var graph = this.levelUpGraph;
        var mult = this.levelUpMultiplier;
        //Get 3 unique secondary stats.
        var secStats = [];
        for(var i=0;i<3;i++){
            var secStat;
            do {
                var secondary = this.getIdx(lean[0],this.rand());
                var secPos = [inBounds(center[0]+mult[secondary][0]),inBounds(center[1]+mult[secondary][1])];
                secStat = graph[secPos[1]][secPos[0]];
            } while(secStats.indexOf(secStat)!==-1);
            secStats.push(secStat);
            stats[secStat]++;
        }
        //Get 1 tertiary stat.
        var tertiary = this.getIdx(lean[1],this.rand());
        var terPos = [inBounds(center[0]+mult[tertiary+4][0]),inBounds(center[1]+mult[tertiary+4][1])];
        var terStat = graph[terPos[1]][terPos[0]];
        stats[terStat]++;
        return stats;
    },
    statsToLevel:function(stats,primary,primaryCoordinate,level,lean){
        stats[primary]+=5;
        for(var idx=0;idx<level;idx++){
            stats = this.levelUp(stats,primary,primaryCoordinate,lean);
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
    resetCombatStat:function(obj,prop){
        obj.p.combatStats[prop] = this["get_"+prop](obj.p);
    },
    getBaseCombatStats:function(char){
        return {
            strength:this.get_strength(char),
            endurance:this.get_endurance(char),
            dexterity:this.get_dexterity(char),
            weaponSkill:this.get_weaponSkill(char), 
            reflexes:this.get_reflexes(char),
            initiative:this.get_initiative(char),
            energy:this.get_energy(char),
            skill:this.get_skill(char), 
            efficiency:this.get_efficiency(char)
        };
    },
    getCombatStats:function(char){
        char.combatStats = this.getBaseCombatStats(char);
        //var stats = ["maxHp","painTolerance","damageReduction","physicalResistance","mentalResistance","magicalResistance","atkRange","maxAtkDmg","minAtkDmg","maxSecondaryDmg","minSecondaryDmg","maxTp","encumbranceThreshold","totalWeight","encumbrancePenalty","defensiveAbility","atkAccuracy","critChance","counterChance","atkSpeed","moveSpeed"];
        char.combatStats.maxHp = this.get_maxHp(char);
        char.combatStats.hp = char.combatStats.maxHp;
        char.combatStats.painTolerance = this.get_painTolerance(char);
        char.combatStats.damageReduction = this.get_damageReduction(char);
        char.combatStats.physicalResistance = this.get_physicalResistance(char);
        char.combatStats.mentalResistance = this.get_mentalResistance(char);
        char.combatStats.magicalResistance = this.get_magicalResistance(char);

        char.combatStats.atkRange = this.get_atkRange(char);
        char.combatStats.maxAtkDmg = this.get_maxAtkDmg(char);
        char.combatStats.minAtkDmg = this.get_minAtkDmg(char);
        char.combatStats.maxSecondaryDmg = this.get_maxSecondaryDmg(char);
        char.combatStats.minSecondaryDmg = this.get_minSecondaryDmg(char);

        char.combatStats.maxTp = this.get_maxTp(char);
        char.combatStats.tp = char.combatStats.maxTp;

        char.combatStats.encumbranceThreshold = this.get_encumbranceThreshold(char);
        char.combatStats.totalWeight = this.get_totalWeight(char);
        char.combatStats.encumbrancePenalty = this.get_encumbrancePenalty(char);
        char.combatStats.defensiveAbility = this.get_defensiveAbility(char);
        char.combatStats.atkAccuracy = this.get_atkAccuracy(char);
        char.combatStats.critChance = this.get_critChance(char);
        char.combatStats.counterChance = this.get_counterChance(char);
        char.combatStats.atkSpeed = this.get_atkSpeed(char);

        char.combatStats.moveSpeed = this.get_moveSpeed(char);
        
        char.combatStats.statusResistance = {
            Poisoned:this.getPassiveEffect(0,"statusResistance","Poisoned",char.techniques.passive),
            Bleeding:this.getPassiveEffect(0,"statusResistance","Bleeding",char.techniques.passive),
            Weakened:this.getPassiveEffect(0,"statusResistance","Weakened",char.techniques.passive),
            Blinded:this.getPassiveEffect(0,"statusResistance","Blinded",char.techniques.passive),
            Stunned:this.getPassiveEffect(0,"statusResistance","Stunned",char.techniques.passive),
            Disabled:this.getPassiveEffect(0,"statusResistance","Disabled",char.techniques.passive),
            Immobilized:this.getPassiveEffect(0,"statusResistance","Immobilized",char.techniques.passive),
            "Seeking Mirage":this.getPassiveEffect(0,"statusResistance","Seeking Mirage",char.techniques.passive)
        };
        return char.combatStats;
    },
    evaluateExpression:function(val1,operator,val2){
        switch(operator){
            case "+":
                return val1 + val2;
            case "-":
                return val1 - val2;
            case "/":
                return val1 / val2;
            case "*":
                return val1 * val2;
            case "=":
                return val2;
        }
    },
    getPassiveEffect:function(value,category,stat,techs){
        for(var i=0;i<techs.length;i++){
            var args = techs[i].args;
            var matched = args.filter(function(arg){return arg.statType === category && arg.stat === stat;});
            for(var j=0;j<matched.length;j++){
                value = this.evaluateExpression(value,matched[j].oper,matched[j].value);
            }
        }
        return value;
    },
    get_maxHp:function(p){
        var level = p.level, end = p.combatStats.endurance, charGroup = p.charGroup;
        var r = charGroup==="Fighter"?3:charGroup==="Rogue"?2:charGroup==="Mage"?1:0;
        var q = charGroup==="Fighter"?12:charGroup==="Rogue"?10:charGroup==="Mage"?3:0;
        return this.getPassiveEffect(Math.floor((end*q)+(level*r)),"combatStats","maxHp",p.techniques.passive);
    },
    get_painTolerance:function(p){
        var level = p.level, end = p.combatStats.endurance, charGroup = p.charGroup;
        var z = charGroup==="Fighter"?5:charGroup==="Rogue"?4:charGroup==="Mage"?3:0;
        return this.getPassiveEffect(Math.floor(end*z+level),"combatStats","painTolerance",p.techniques.passive);
    },
    get_defensiveAbility:function(p){
        var rfl = p.combatStats.reflexes, 
            encPenalty = p.talents.includes("Armoured Defense")?0:p.combatStats.encumbrancePenalty,
            level = p.level,
            block = this.getEquipmentProp("block",p.equipment[1]);
        var dualWield = p.talents.includes("Dual Wielder")&&p.equipment[1].wield?5:0;
        return this.getPassiveEffect(rfl+encPenalty+level+block+dualWield,"combatStats","defensiveAbility",p.techniques.passive);
    },
    get_damageReduction:function(p){
        return this.getPassiveEffect(this.getEquipmentProp("damageReduction",p.equipment[2]),"combatStats","damageReduction",p.techniques.passive);
    },
    get_physicalResistance:function(p){
        var str = p.combatStats.strength/10, end = p.combatStats.endurance/10;
        return this.getPassiveEffect(Math.min(50,Math.floor(str+end)),"combatStats","physicalResistance",p.techniques.passive);
    },
    get_mentalResistance:function(p){
        var ini = p.combatStats.initiative/10, eff = p.combatStats.efficiency/10;
        return this.getPassiveEffect(Math.min(50,Math.floor(ini+eff)),"combatStats","mentalResistance",p.techniques.passive);
    },
    get_magicalResistance:function(p){
        var enr = p.combatStats.energy/10, skl = p.combatStats.skill/10;
        return this.getPassiveEffect(Math.min(50,Math.floor(enr+skl)),"combatStats","magicalResistance",p.techniques.passive);
    },
    get_atkAccuracy:function(p){
        //If there is a left hand equipped, we need an average of the two.
        var equipped = p.equipment[1]?2:1;
        var wsk = p.combatStats.weaponSkill,
            //I multiplied by 2 to get some better accuracies.
            wield = (((this.getEquipmentProp("wield",p.equipment[0])+this.getEquipmentProp("wield",p.equipment[1]))/equipped))*2, 
            encPenalty = p.talents.includes("Armoured Attack")?0:p.combatStats.encumbrancePenalty,
            level = p.level;
        return this.getPassiveEffect(Math.min(99,Math.floor(wsk+wield+encPenalty+level)),"combatStats","atkAccuracy",p.techniques.passive);
    },
    get_critChance:function(p){
        var attackAccuracy = p.combatStats.atkAccuracy,charGroup = p.charGroup;
        var g = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
        return this.getPassiveEffect(Math.min(99,Math.floor(attackAccuracy/g)),"combatStats","critChance",p.techniques.passive);
    },
    get_counterChance:function(p){
        var defensiveAbility = p.combatStats.defensiveAbility,charGroup = p.charGroup;
        var g = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
        return this.getPassiveEffect(Math.min(75,Math.floor(defensiveAbility/g)),"combatStats","counterChance",p.techniques.passive);
    },
    get_atkSpeed:function(p){
        var dex = p.combatStats.dexterity, weaponSpeedRight = this.getEquipmentProp("speed",p.equipment[0]),weaponSpeedLeft = this.getEquipmentProp("speed",p.equipment[1]),encPenalty = p.combatStats.encumbrancePenalty,level = p.level, charGroup = p.charGroup;
        var d = charGroup==="Fighter"?1:charGroup==="Rogue"?2:charGroup==="Mage"?1:0;
        var dualWield = p.talents.includes("Dual Wielder")&&p.equipment[1].wield?5:0;
        var amount = Math.floor(dex+weaponSpeedRight+(weaponSpeedLeft/2)-encPenalty+(level*d)+dualWield);
        return this.getPassiveEffect(amount,"combatStats","atkSpeed",p.techniques.passive);
    },
    get_atkRange:function(p){
        var attackRangeRight = this.getEquipmentProp("range",p.equipment[0]), attackRangeLeft = this.getEquipmentProp("range",p.equipment[1]);
        var range = attackRangeRight>attackRangeLeft?attackRangeRight:attackRangeLeft;
        if(range>1&&p.talents.includes("Sniper")) range+=2;
        return this.getPassiveEffect(range || 1,"combatStats","atkRange",p.techniques.passive);
    },
    get_maxAtkDmg:function(p){
        var str = p.combatStats.strength, level = p.level, maxDamageRight = this.getEquipmentProp("maxdmg",p.equipment[0]), handed = this.getEquipmentProp("handed",p.equipment[0]),charGroup = p.charGroup;
        var t = handed===1?1:1.5;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return this.getPassiveEffect(Math.floor((str*t)+(level*h)+maxDamageRight),"combatStats","maxAtkDmg",p.techniques.passive);
    },
    get_minAtkDmg:function(p){
        var str = p.combatStats.strength, level = p.level, minDamageRight = this.getEquipmentProp("mindmg",p.equipment[0]), handed = this.getEquipmentProp("handed",p.equipment[0]),charGroup = p.charGroup;
        var t = handed===1?1:1.5;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return this.getPassiveEffect(Math.floor((str*t)+(level*h)+minDamageRight),"combatStats","minAtkDmg",p.techniques.passive);
    },
    get_maxSecondaryDmg:function(p){
        var str = p.combatStats.strength, level = p.level, maxDamageLeft = this.getEquipmentProp("maxdmg",p.equipment[1]), charGroup = p.charGroup;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return this.getPassiveEffect(Math.floor((str*0.5)+(level*h)+maxDamageLeft),"combatStats","maxAtkDmg",p.techniques.passive);
    },
    get_minSecondaryDmg:function(p){
        var str = p.combatStats.strength, level = p.level, minDamageLeft = this.getEquipmentProp("mindmg",p.equipment[1]), charGroup = p.charGroup;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return this.getPassiveEffect(Math.floor((str*0.5)+(level*h)+minDamageLeft),"combatStats","minAtkDmg",p.techniques.passive);
    },

    get_maxTp:function(p){
        var enr = p.combatStats.energy, level = p.level, charGroup = p.charGroup;
        var f = charGroup==="Fighter"?2:charGroup==="Rogue"?3:charGroup==="Mage"?5:0;
        return this.getPassiveEffect(Math.floor((enr*f)+level),"combatStats","maxTp",p.techniques.passive);
    },
    get_moveSpeed:function(p){
        var encPenalty = p.talents.includes("Armoured March")?0:p.combatStats.encumbrancePenalty,
            charGroup = p.charGroup;
        var m = charGroup==="Fighter"?6:charGroup==="Rogue"?7:charGroup==="Mage"?5:0;
        var shoes = this.getEquipmentProp("move",p.equipment[3]);
        return this.getPassiveEffect(m + Math.floor(encPenalty/10) + shoes,"combatStats","moveSpeed",p.techniques.passive);
    },
    get_encumbranceThreshold:function(p){
        var str = p.combatStats.strength, charGroup = p.charGroup;
        var e = charGroup==="Fighter"?2:charGroup==="Rogue"?1.5:charGroup==="Mage"?1:0;
        return this.getPassiveEffect(Math.floor(str*e),"combatStats","encumbranceThreshold",p.techniques.passive);
    },
    get_totalWeight:function(p){
        var rightHandWeight = this.getEquipmentProp("weight",p.equipment[0]), leftHandWeight = this.getEquipmentProp("weight",p.equipment[1]), armourWeight = this.getEquipmentProp("weight",p.equipment[2]), shoesWeight = this.getEquipmentProp("weight",p.equipment[3]), accessoryWeight = this.getEquipmentProp("weight",p.equipment[4]);
        return this.getPassiveEffect(rightHandWeight+leftHandWeight+armourWeight+shoesWeight+accessoryWeight,"combatStats","totalWeight",p.techniques.passive);
    },
    get_encumbrancePenalty:function(p){
        var totalWeight = p.combatStats.totalWeight, encThreshold = p.combatStats.encumbranceThreshold;
        return this.getPassiveEffect(Math.max(0,totalWeight-encThreshold),"combatStats","encumbrancePenaly",p.techniques.passive);
    },

    //Trims a base stat down once it reaches certain thresholds.
    trimBaseStat:function(num){
        //At which point the stat changes
        var threshold = 20;
        //The final stat value
        var trimmedStat = num;
        //The multiplier each iteration
        var mult = 1;
        for(var i=0;i<Math.floor(num/threshold);i++){
            trimmedStat -= threshold;
            trimmedStat += threshold * mult;
            mult *= 0.8;
        }
        //Don't go over 100
        return Math.min(100,Math.floor(trimmedStat));
    },
    get_strength:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.str),"baseStats","str",p.techniques.passive);
    },
    get_endurance:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.end),"baseStats","end",p.techniques.passive);
    },
    get_dexterity:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.dex),"baseStats","dex",p.techniques.passive);
    },
    get_weaponSkill:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.wsk),"baseStats","wsk",p.techniques.passive);
    },
    get_reflexes:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.rfl),"baseStats","rfl",p.techniques.passive);
    },
    get_initiative:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.ini),"baseStats","ini",p.techniques.passive);
    },
    get_energy:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.enr),"baseStats","enr",p.techniques.passive);
    },
    get_skill:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.skl),"baseStats","skl",p.techniques.passive);
    },
    get_efficiency:function(p){
        return this.getPassiveEffect(this.trimBaseStat(p.baseStats.eff),"baseStats","eff",p.techniques.passive);
    }
};