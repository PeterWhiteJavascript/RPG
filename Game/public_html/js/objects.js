Quintus.Objects=function(Q){
    //Adds more control over what animations are playing.
    Q.component("animations", {
        added:function(){
            this.entity.on("playStand");
        },
        extend:{
            checkPlayDir:function(dir){
                if(!dir){return this.p.dir;}else{return dir||"down";}
            },
            playStand:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("standing"+this.p.dir);
            },
            playWalk:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("walking"+this.p.dir);
            },
            playAttack:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("attacking"+this.p.dir);
            }
        }
    });
    
    Q.component("randomCharacter",{
        added:function(){
            var t = this.entity;
            //Equipment level is random enemy only as it is used for generating equipment at that level
            if(t.p.equipmentLevel){
                this.randomizeEquipment();
            }
            t.p.stats = this.generateCharStats();
        },
        randomizeEquipment:function(){
            var p = this.entity.p;
            var el = p.equipmentLevel;
            var equipment = Q.state.get("equipment");
            var types = ["weapon","shield","body","feet","accessory"];
            
            function rand(type){
                //Chance of going up or down in rank
                var lv = el;
                lv+=Math.floor(Math.random()*3)-1;
                if(lv===0) lv=1;
                if(lv>Q.maxEquipmentRank) lv = Q.maxEquipmentRank;
                var eq = equipment[type+"Sorted"][lv-1][Math.floor(Math.random()*equipment[type+"Sorted"][lv-1].length)];
                eq.level = lv+Math.floor(Math.random()*2)-1;
                return eq;
            }
            p.equipment={
                righthand:rand(types[Math.floor(Math.random()*2)]),
                lefthand:rand(types[Math.floor(Math.random()*2)]),
                body:rand(types[2]),
                feet:rand(types[3]),
                accessory:rand(types[4])
            };
            //If they have a set equipment type, make sure they get it
            while(p.equipmentType&&p.equipment.righthand.equipmentType!==p.equipmentType&&p.equipment.lefthand.equipmentType!==p.equipmentType){
                p.equipment.righthand = rand(types[0]);
                //If the equipment is two handed, the left hand hould be empty
                if(p.equipment.righthand.twoHanded){
                    p.equipment.lefthand = {};
                } else {
                    //If the righthand equipment is not two handed, find a weapon or shield for the left hand
                    while(p.equipment.lefthand.twoHanded){
                        p.equipment.lefthand = rand(types[Math.floor(Math.random()*2)]);
                    }
                }
            }
            //Make sure they are not holding a two handed weapon and something else
            if(p.equipment.righthand.twoHanded){
                p.equipment.lefthand = {};
            }
            if(p.equipment.lefthand.twoHanded){
                p.equipment.righthand = {};
            }
            //Make sure that they are not holding two shields (unless we want that :D)
            if(p.equipment.righthand.equipmentType==="shield"&&p.equipment.lefthand.equipmentType==="shield"){
                p.equipment.righthand = rand(types[0]);
            }
        },
        generateCharStats:function(){
            var p = this.entity.p;
            var lv = p.level;
            var base = Q.state.get("charClasses")[p.charClass].baseStats;
            return {
                str:Math.floor(Math.random()*lv+base.str*(lv/3)+1),
                end:Math.floor(Math.random()*lv+base.end*(lv/3)+1),
                dex:Math.floor(Math.random()*lv+base.dex*(lv/3)+1),
                wsk:Math.floor(Math.random()*lv+base.wsk*(lv/3)+1),
                rfl:Math.floor(Math.random()*lv+base.rfl*(lv/3)+1)
            };
        }
    });
    Q.component("statCalcs",{
        added:function(){
            var p = this.entity.p;
            var base = Q.state.get("charClasses")[p.charClass].baseStats;
            p.className = Q.state.get("charClasses")[p.charClass].name;
            p.hp = this.getHp(base);
            p.sp = this.getSp(base);
            p.totalDamageLow = this.getDamageLow();
            p.totalDamageHigh = this.getDamageHigh();
            p.totalSpeed = this.getSpeed();
            p.strike = this.getStrike();
            p.parry = this.getParry();
            p.criticalChance = this.getCriticalChance();
            p.armour = this.getArmour();
        },
        getHp:function(base){
            var p = this.entity.p;
            //Every 5 levels, get a stat boost. every 10 levels, get a big stat boost
            return Math.floor(Math.ceil(p.level/5)*(base.end+base.str)+Math.ceil(p.level/10)*(p.stats.str+p.stats.end))+1;
        },
        getSp:function(base){
            var p = this.entity.p;
            return Math.floor(Math.ceil(p.level/10)*(base.dex+p.stats.dex))+1;
        },
        //Calculate damage based on attack + weapon1 +weapon2
        getDamageLow:function(){
            var right = this.entity.p.equipment.righthand.damageLow?this.entity.p.equipment.righthand.damageLow:0;
            var left = this.entity.p.equipment.lefthand.damageLow?this.entity.p.equipment.lefthand.damageLow:0;
            var str = this.entity.p.stats.str;
            if(right&&left) str*=2;
            return right+left+str;
        },
        getDamageHigh:function(){
            var right = this.entity.p.equipment.righthand.damageHigh?this.entity.p.equipment.righthand.damageHigh:0;
            var left = this.entity.p.equipment.lefthand.damageHigh?this.entity.p.equipment.lefthand.damageHigh:0;
            var str = this.entity.p.stats.str;
            if(right&&left) str*=2;
            return right+left+str;
        },
        getSpeed:function(){
            var right = this.entity.p.equipment.righthand.speed?this.entity.p.equipment.righthand.speed:0;
            var left = this.entity.p.equipment.lefthand.speed?this.entity.p.equipment.lefthand.speed:0;
            var dex = this.entity.p.stats.dex;
            return right+Math.floor(left/2)+dex;
        },
        getStrike:function(){
            var right = this.entity.p.equipment.righthand.wield?this.entity.p.equipment.righthand.wield:0;
            var left = this.entity.p.equipment.lefthand.wield?this.entity.p.equipment.lefthand.wield:0;
            var wsk = this.entity.p.stats.wsk;
            return Math.floor((right+left)/2)+wsk;
        },
        getParry:function(){
            var right = this.entity.p.equipment.righthand.wield?this.entity.p.equipment.righthand.wield:0;
            var left = this.entity.p.equipment.lefthand.wield?this.entity.p.equipment.lefthand.wield:0;
            var rfl = this.entity.p.stats.rfl;
            return Math.floor((right+left)/2)+rfl;
        },
        getCriticalChance:function(){
            return Math.floor(this.entity.p.strike/10);
        },
        getArmour:function(){
            var right = this.entity.p.equipment.righthand.defense?this.entity.p.equipment.righthand.defense:0;
            var left = this.entity.p.equipment.lefthand.defense?this.entity.p.equipment.lefthand.defense:0;
            var body = this.entity.p.equipment.body.defense?this.entity.p.equipment.body.defense:0;
            var feet = this.entity.p.equipment.feet.defense?this.entity.p.equipment.feet.defense:0;
            var accessory = this.entity.p.equipment.accessory.defense?this.entity.p.equipment.accessory.defense:0;
            return right+left+body+feet+accessory; 
        }
    });
    //Given to characters, interactables, and pickups
    Q.component("interactable",{
        added:function(){
            
        }
    });
    Q.Sprite.extend("Character",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sprite:"Character",
                dir:"left"
            });
            this.p.sheet = this.p.charClass;
            //Quintus components
            this.add("2d, animation");
            //Custom components
            this.add("animations,interactable");
            /*var t = this;
            setTimeout(function(){
                console.log(t.p.charClass+"'s Equipment: ");
                console.log(t.p.equipment);
                console.log(t.p.charClass+"'s Stats: ");
                console.log(t.p.stats);
                console.log("Battle stats: ")
                console.log("Damage Low: "+t.p.totalDamageLow);
                console.log("Damage High: "+t.p.totalDamageHigh);
                console.log("Speed: "+t.p.totalSpeed);
                console.log("Strike: "+t.p.strike);
                console.log("Parry: "+t.p.parry);
                console.log("Critical Chance: "+t.p.criticalChance);
                console.log("Armour: "+t.p.armour);
                console.log("---------------------------");
            },1);*/
            this.on("inserted");
        },
        //Will run when this character is inserted into the stage (whether it be placement by the user, or when inserting enemies)
        inserted:function(){
            this.stage.BatCon.setXY(this);
            this.playStand(this.p.dir);
            Q._generatePoints(this,true);
        },
        startTurn:function(){
            console.log("It's my turn! I am the "+this.p.className+".");
            if(this.p.team==="enemy"){
                console.log("Since there's no AI written, the turn is skipped!");
                this.stage.BatCon.endTurn();
            }
        },
        endTurn:function(){
            
        }
    
    });
};