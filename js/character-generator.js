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
        this.statNames = data.statNames;
        this.primaryStats = data.primaryStats;
        this.primaryCoordinates = data.primaryCoords;
        this.levelUpGraph = data.levelUpGraph;
        this.levelUpMultiplier = data.levelUpMultiplier;
        
        this.equipment = equipment;
        this.qualityKeys = Object.keys(this.equipment.Quality);
        
        this.defaultEquipment = defaultEquipment;
        
        this.techniques = techniques;
        this.allTechs = this.convertTechniques(techniques);
        this.talents = talents;
        this.awards = awards;
    },
    generateCharacter:function(act,data){
        var char = {
            tempStatChanges:[]
        };
        char.team = "ally";
        //Generate the level based on the Act
        char.level = data.level || this.generateLevel(act);
        char.nationality = data.nationality==="Random" || !data.nationality ? this.generateNationality(act) : data.nationality;
        char.natNum = this.getNatNum(char.nationality);
        
        if(data.personality){
            char.personality = data.personality;
        } else {
            char.personality = [];
            for(var i=0,j=Math.ceil(Math.random()*3);i<j;i++){
                char.personality.push(this.generatePersonality());
            }
        }
        char.charClass = data.charClass==="Random" || !data.charClass ? this.generateCharClass(char.nationality) : data.charClass;
        char.classNum = this.getClassNum(char.charClass);
        char.charGroup = this.generateCharGroup(char.classNum);

        char.primaryStat = this.primaryStats[char.classNum];
        char.primaryCoordinate = this.primaryCoordinates[char.classNum];
        char.equipment = this.getEquipment(data.equipment,char.classNum,char.natNum,char.level);
        char.techniques = this.getTechniques(data.techniques,char.charClass) || this.generateTechniques(char.charClass,char.level);//Requires charClass and level
        char.talents = this.getTalents(char.charClass,char.charGroup);
        char.lean = [this.getStatLean(),this.getStatLean()];
        char.baseStats = data.baseStats || this.statsToLevel(this.generateBaseStats(),char.primaryStat,char.primaryCoordinate,char.level,char.lean);
        char.gender = data.gender || this.generateGender(char.charClass,char.natNum);//Requires charClass and natNum
        char.name = data.name || this.generateName(char.natNum,char.gender);//Requires natNum and gender
        char.exp = data.exp || 0;
        char.loyalty = data.loyalty || 50;
        char.morale = data.morale || 50;
        char.awards =  this.emptyAwards();

        char.completedEvents =  [];
        return char;
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
    //Generates four random numbers that all add up to 100
    getStatLean:function(){
        //Force at least 1 percent chance for each stat
        var lean = [1,1,1,1];
        //Start at 96 since 4 is already taken.
        var num = 96;
        //The skew is how far apart the numbers will probably be. Higher skew = higher chance of very big/very small numbers.
        var skew = 15;
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
                var gear = this.defaultEquipment.gear;
                var eq = gear[classNum][natNum][position];
                //Randomize between the few that are here
                //The 0th position is reserved for the random chance array.
                return eq[this.getIdx(eq[0],this.rand())+1];
            case "None":
                return false;
            default:
                return [gearName,material];
        }
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
            name:eq[1]
        };
        keys.forEach(function(key){
            if(key==="materials") return;
            gear[key] = data[key];
        });
        var materialData = this.equipment.Materials[gear.material] || 0;
        var qualityData = this.equipment.Quality[gear.quality] || 0;
        gear.weight = Math.ceil(gear.weight+materialData[0]) || gear.weight;
        gear.cost = Math.ceil(gear.cost*qualityData[1]*materialData[2]) || gear.cost;
        if(gear.block) gear.block = Math.ceil(gear.block*materialData[1]*qualityData[0]);
        if(gear.wield) gear.wield = Math.ceil(gear.wield*qualityData[0]);
        if(gear.mindmg) gear.mindmg = Math.ceil(gear.mindmg*materialData[1]);
        if(gear.maxdmg) gear.maxdmg = Math.ceil(gear.maxdmg*materialData[1]);
        if(gear.speed) gear.speed = Math.ceil(gear.speed*qualityData[0]);
        if(gear.damageReduction) gear.damageReduction = Math.ceil(gear.damageReduction*materialData[1]*qualityData[0]);
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
    getEquipment:function(val,classNum,natNum,level){
        var rh = typeof val.righthand==="string" ? false : this.convertEquipment(this.equipGear(val.righthand[1],val.righthand[2],classNum,natNum,0),this.equipQuality(val.righthand[0],level));
        var lh = false;
        if(!rh||rh.hands!==2){
            lh = typeof val.lefthand==="string" ? false : this.convertEquipment(this.equipGear(val.lefthand[1],val.lefthand[2],classNum,natNum,1),this.equipQuality(val.lefthand[0],level));
        }
        var ar = typeof val.armour==="string" ? false : this.convertEquipment(this.equipGear(val.armour[1],val.armour[2],classNum,natNum,2),this.equipQuality(val.armour[0],level));
        var ft = typeof val.footwear==="string" ? false : this.convertEquipment(this.equipGear(val.footwear[1],val.footwear[2],classNum,natNum,3),this.equipQuality(val.footwear[0],level));
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
    convertTechniques:function(data){
        var charClasses = this.characterGeneration.classNames;
        var techs = {};
        for(var i=0;i<charClasses.length;i++){
            for(var j=0;j<data[charClasses[i]].length;j++){
                techs[data[charClasses[i]][j].name] = data[charClasses[i]][j];
            }
        }
        return techs;
    },
    getTechniques:function(techs,charClass){
        if(!techs) return;
        var fullTechs = [];
        var allTechs = this.allTechs;
        var skills = this.techniques;
        for(var i=0;i<techs.length;i++){
            if(techs[i].length){
                if(techs[i]==="Default"){
                    fullTechs.push(skills[charClass][i]);
                } else {
                    fullTechs.push(allTechs[techs[i]]);
                }
            } else {
                i = techs.length;
            }
        }
        return fullTechs;
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
    //TO REWORK (LOOK AT CREATE-CHARACTERS.JS)
    enemyBaseStats:function(val,level,primary,primaryCoordinate,lean){
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
    generatePersonality:function(){
        return [this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)],this.personalityNames[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]]];
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
            do{
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
    generateTechniques:function(charClass,level){
        var skills = Q.state.get("skills");
        var techs = [];
        //How many techniques are possible (up to level 20, each character gets 1 technique per 4 levels and start with 1 technique).
        var len = Math.floor(level/4)+1;
        //For now, always give class specific techniques.
        if(len>6) len = 6;
        for(var i=0;i<len;i++){
            techs.push(skills[charClass][i]);
        }
        return this.setLevelTechniques(techs,level);
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
    getCombatStats:function(char){
        var baseCombatStats = {
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
        char.combatStats = baseCombatStats;
        //var stats = ["maxHp","painTolerance","damageReduction","physicalResistance","mentalResistance","magicalResistance","atkRange","maxAtkDmg","minAtkDmg","maxSecondaryDmg","minSecondaryDmg","maxTp","encumbranceThreshold","totalWeight","encumbrancePenalty","defensiveAbility","atkAccuracy","critChance","counterChance","atkSpeed","moveSpeed"];
        char.combatStats.maxHp = this.get_maxHp(char);
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

        char.combatStats.encumbranceThreshold = this.get_encumbranceThreshold(char);
        char.combatStats.totalWeight = this.get_totalWeight(char);
        char.combatStats.encumbrancePenalty = this.get_encumbrancePenalty(char);
        char.combatStats.defensiveAbility = this.get_defensiveAbility(char);
        char.combatStats.atkAccuracy = this.get_atkAccuracy(char);
        char.combatStats.critChance = this.get_critChance(char);
        char.combatStats.counterChance = this.get_counterChance(char);
        char.combatStats.atkSpeed = this.get_atkSpeed(char);

        char.combatStats.moveSpeed = this.get_moveSpeed(char);
        return char.combatStats;
    },
    get_maxHp:function(p){
        var level = p.level, end = p.combatStats.endurance, charGroup = p.charGroup;
        var r = charGroup==="Fighter"?3:charGroup==="Rogue"?2:charGroup==="Mage"?1:0;
        var q = charGroup==="Fighter"?12:charGroup==="Rogue"?10:charGroup==="Mage"?3:0;
        return Math.floor((end*q)+(level*r));
    },
    get_painTolerance:function(p){
        var level = p.level, end = p.combatStats.endurance, charGroup = p.charGroup;
        var z = charGroup==="Fighter"?5:charGroup==="Rogue"?4:charGroup==="Mage"?3:0;
        return Math.floor(end*z+level);
    },
    get_defensiveAbility:function(p){
        var rfl = p.combatStats.reflexes, 
            encPenalty = p.talents.includes("Armoured Defense")?0:p.combatStats.encumbrancePenalty,
            level = p.level,
            block = this.getEquipmentProp("block",p.equipment.lefthand);
        var dualWield = p.talents.includes("Dual Wielder")&&p.equipment.lefthand.wield?5:0;
        return rfl+encPenalty+level+block+dualWield;
    },
    get_damageReduction:function(p){
        return this.getEquipmentProp("damageReduction",p.equipment.armour);
    },
    get_physicalResistance:function(p){
        var str = p.combatStats.strength, end = p.combatStats.endurance;
        return Math.min(25,str+end);
    },
    get_mentalResistance:function(p){
        var ini = p.combatStats.initiative, eff = p.combatStats.efficiency;
        return Math.min(25,ini+eff);
    },
    get_magicalResistance:function(p){
        var enr = p.combatStats.energy, skl = p.combatStats.skill;
        return Math.min(25,enr+skl);
    },
    get_atkAccuracy:function(p){
        //If there is a left hand equipped, we need an average of the two.
        var equipped = p.equipment.lefthand?2:1;
        var wsk = p.combatStats.weaponSkill,
            wield = ((this.getEquipmentProp("wield",p.equipment.righthand)+this.getEquipmentProp("wield",p.equipment.lefthand))/equipped), 
            encPenalty = p.talents.includes("Armoured Attack")?0:p.combatStats.encumbrancePenalty,
            level = p.level;
        //I multiplied by 2 to get some better accuracies.
        return Math.min(99,Math.floor(wsk+wield+encPenalty+level)*2);
    },
    get_critChance:function(p){
        var attackAccuracy = p.combatStats.atkAccuracy,charGroup = p.charGroup;
        var g = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
        return Math.min(99,Math.floor(attackAccuracy/g));
    },
    get_counterChance:function(p){
        var defensiveAbility = p.combatStats.defensiveAbility,charGroup = p.charGroup;
        var g = charGroup==="Fighter"?10:charGroup==="Rogue"?7:charGroup==="Mage"?20:0;
        return Math.min(75,Math.floor(defensiveAbility/g));
    },
    get_atkSpeed:function(p){
        var dex = p.combatStats.dexterity, weaponSpeedRight = this.getEquipmentProp("speed",p.equipment.righthand),weaponSpeedLeft = this.getEquipmentProp("speed",p.equipment.lefthand),encPenalty = p.combatStats.encumbrancePenalty,level = p.level, charGroup = p.charGroup;
        var d = charGroup==="Fighter"?1:charGroup==="Rogue"?2:charGroup==="Mage"?1:0;
        var dualWield = p.talents.includes("Dual Wielder")&&p.equipment.lefthand.wield?5:0;
        var amount = Math.floor(dex+weaponSpeedRight+(weaponSpeedLeft/2)-encPenalty+(level*d)+dualWield);
        return amount;
    },
    get_atkRange:function(p){
        var attackRangeRight = this.getEquipmentProp("range",p.equipment.righthand), attackRangeLeft = this.getEquipmentProp("range",p.equipment.lefthand);
        var range = attackRangeRight>attackRangeLeft?attackRangeRight:attackRangeLeft;
        if(range>1&&p.talents.includes("Sniper")) range+=2;
        return range || 1;
    },
    get_maxAtkDmg:function(p){
        var str = p.combatStats.strength, level = p.level, maxDamageRight = this.getEquipmentProp("maxdmg",p.equipment.righthand), handed = this.getEquipmentProp("handed",p.equipment.righthand),charGroup = p.charGroup;
        var t = handed===1?1:1.5;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return Math.floor((str*t)+(level*h)+maxDamageRight);
    },
    get_minAtkDmg:function(p){
        var str = p.combatStats.strength, level = p.level, minDamageRight = this.getEquipmentProp("mindmg",p.equipment.righthand), handed = this.getEquipmentProp("handed",p.equipment.righthand),charGroup = p.charGroup;
        var t = handed===1?1:1.5;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return Math.floor((str*t)+(level*h)+minDamageRight);
    },
    get_maxSecondaryDmg:function(p){
        var str = p.combatStats.strength, level = p.level, maxDamageLeft = this.getEquipmentProp("maxdmg",p.equipment.lefthand), charGroup = p.charGroup;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return Math.floor((str*0.5)+(level*h)+maxDamageLeft);
    },
    get_minSecondaryDmg:function(p){
        var str = p.combatStats.strength, level = p.level, minDamageLeft = this.getEquipmentProp("mindmg",p.equipment.lefthand), charGroup = p.charGroup;
        var h = charGroup==="Fighter"?2:charGroup==="Rogue"?1:charGroup==="Mage"?0:0;
        return Math.floor((str*0.5)+(level*h)+minDamageLeft);
    },

    get_maxTp:function(p){
        var enr = p.combatStats.energy, level = p.level, charGroup = p.charGroup;
        var f = charGroup==="Fighter"?2:charGroup==="Rogue"?3:charGroup==="Mage"?5:0;
        return Math.floor((enr*f)+level);
    },
    get_moveSpeed:function(p){
        var encPenalty = p.talents.includes("Armoured March")?0:p.combatStats.encumbrancePenalty,
            charGroup = p.charGroup;
        var m = charGroup==="Fighter"?6:charGroup==="Rogue"?7:charGroup==="Mage"?5:0;
        var shoes = this.getEquipmentProp("move",p.equipment.footwear);
        return m + Math.floor(encPenalty/10) + shoes;
    },
    get_encumbranceThreshold:function(p){
        var str = p.combatStats.strength, charGroup = p.charGroup;
        var e = charGroup==="Fighter"?2:charGroup==="Rogue"?1.5:charGroup==="Mage"?1:0;
        return Math.floor(str*e);
    },
    get_totalWeight:function(p){
        var rightHandWeight = this.getEquipmentProp("weight",p.equipment.righthand), leftHandWeight = this.getEquipmentProp("weight",p.equipment.lefthand), armourWeight = this.getEquipmentProp("weight",p.equipment.armour), shoesWeight = this.getEquipmentProp("weight",p.equipment.shoes), accessoryWeight = this.getEquipmentProp("weight",p.equipment.accessory);
        return rightHandWeight+leftHandWeight+armourWeight+shoesWeight+accessoryWeight;
    },
    get_encumbrancePenalty:function(p){
        var totalWeight = p.combatStats.totalWeight, encThreshold = p.combatStats.encumbranceThreshold;
        return Math.max(0,totalWeight-encThreshold);
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
        return Math.floor(trimmedStat);
    },
    get_strength:function(p){
        return this.trimBaseStat(p.baseStats.str);
    },
    get_endurance:function(p){
        return this.trimBaseStat(p.baseStats.end);
    },
    get_dexterity:function(p){
        return this.trimBaseStat(p.baseStats.dex);
    },
    get_weaponSkill:function(p){
        return this.trimBaseStat(p.baseStats.wsk);
    },
    get_reflexes:function(p){
        return this.trimBaseStat(p.baseStats.rfl);
    },
    get_initiative:function(p){
        return this.trimBaseStat(p.baseStats.ini);
    },
    get_energy:function(p){
        return this.trimBaseStat(p.baseStats.enr);
    },
    get_skill:function(p){
        return this.trimBaseStat(p.baseStats.skl);
    },
    get_efficiency:function(p){
        return this.trimBaseStat(p.baseStats.eff);
    }
};
CharacterGenerator.init(GDATA.dataFiles["character-generation.json"],GDATA.dataFiles['equipment.json'],GDATA.dataFiles['default-equipment.json'],GDATA.dataFiles['skills.json'],GDATA.dataFiles['talents.json'],GDATA.dataFiles['awards.json']);