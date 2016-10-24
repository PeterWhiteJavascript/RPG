Quintus.Objects=function(Q){
    //Any items that are equipped by a character are removed as they are saved in the character's equipment.
    //The save file does not include items in the bag that are equipped by characters.
    Q.GameObject.extend("Bag",{
        init:function(data){
            this.fillBag(data.items);
        },
        //When the bag is created, fill it with the given items
        fillBag:function(data){
            var bagItems = {};
            var items = Q.state.get("items");
            var equipment = Q.state.get("equipment");
            var keys = Object.keys(data);
            keys.forEach(function(key){
                if(key === "consumable" || key === "key"){
                    bagItems[key]=[];
                    //Loop through the category
                    data[key].forEach(function(k){
                        var id = k[0];
                        var itemKeys = Object.keys(items[id]);
                        var newItem = {amount:k[1]};
                        itemKeys.forEach(function(ik){
                            newItem[ik] = items[id][ik];
                        });
                        bagItems[key].push(newItem);
                    });
                    
                } else {
                    bagItems[key]=[];
                    //Loop through the category
                    data[key].forEach(function(k){
                        var id = k[0];
                        var equipKeys = Object.keys(equipment[key][id]);
                        var newEquipment = {amount:k[1]};
                        equipKeys.forEach(function(ek){
                            newEquipment[ek] = equipment[key][id][ek];
                        });
                        bagItems[key].push(newEquipment);
                    });
                }
            });
            this.items = bagItems;
        },
        addItem:function(itm,type){
            
        },
        removeItem:function(itm,type){
            
        },
        increaseItem:function(itm,type){
            
        },
        decreaseItem:function(itm,type){
            
        }
    });
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
            if(t.p.equipmentRank){
                this.randomizeEquipment();
            }
            t.p.stats = this.generateCharStats();
        },
        randomizeEquipment:function(){
            var p = this.entity.p;
            var el = p.equipmentRank;
            var equipment = Q.state.get("equipment");
            var types = ["weapon","shield","body","feet","accessory"];
            
            function rand(type){
                //Chance of going up or down in rank
                var lv = el;
                lv+=Math.floor(Math.random()*3)-1;
                if(lv===0) lv=1;
                if(lv>Q.maxEquipmentRank) lv = Q.maxEquipmentRank;
                var eq = equipment[type+"Sorted"][lv-1][Math.floor(Math.random()*equipment[type+"Sorted"][lv-1].length)];
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
            p.move = this.getMove(Q.state.get("charClasses")[p.charClass].move);
            p.maxHp = this.getHp(base);
            p.hp = this.getHp(base);
            p.sp = this.getSp(base);
            p.totalDamageLow = this.getDamageLow();
            p.totalDamageHigh = this.getDamageHigh();
            p.totalSpeed = this.getSpeed();
            p.strike = this.getStrike();
            p.parry = this.getParry();
            p.criticalChance = this.getCriticalChance();
            p.armour = this.getArmour();
            p.range = this.getRange();
        },
        getMove:function(base){
            var body = this.entity.p.equipment.body.move?this.entity.p.equipment.body.move:0;
            var feet = this.entity.p.equipment.feet.move?this.entity.p.equipment.feet.move:0;
            var accessory = this.entity.p.equipment.accessory.move?this.entity.p.equipment.accessory.move:0;
            return base+body+feet+accessory;
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
        },
        getRange:function(){
            var right = this.entity.p.equipment.righthand.range?this.entity.p.equipment.righthand.range:0;
            var left = this.entity.p.equipment.lefthand.range?this.entity.p.equipment.lefthand.range:0;
            var accessory = this.entity.p.equipment.accessory.range?this.entity.p.equipment.accessory.range:0;
            return (right>left?right:left)+accessory; 
        }
    });
    //Given to characters, interactables, and pickups
    Q.component("interactable",{
        added:function(){
            
        }
    });
    Q.component("combatant",{
        extend:{
            takeDamage:function(dmg){
                if(dmg<=0){dmg=1;};
                console.log("Did "+dmg+" damage.");
                this.p.hp-=dmg;
                if(this.p.hp<=0){
                    this.stage.BattleGrid.removeObject(this.p.loc);
                    this.stage.BatCon.removeFromBattle(this);
                    this.destroy();
                }
            }
        }
    });
    Q.Sprite.extend("Character",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sprite:"Character",
                dir:"left",
                z:10
            });
            this.p.sheet = this.p.charClass;
            //Quintus components
            this.add("2d, animation");
            //Custom components
            this.add("animations,interactable,combatant");
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
            //Get the grid for walking from this position
            this.p.walkMatrix = new Q.Graph(this.getMatrix("walk"));
            //Get the grid for attacking from this position
            this.p.attackMatrix = new Q.Graph(this.getMatrix("attack"));
            //Set to true when the character moves
            this.p.didMove = false;
            //Set to true when the character attacks
            this.p.didAction = false;
            var exc = this.stage.insert(new Q.Sprite({x:this.p.x,y:this.p.y-Q.tileH,sheet:"turn_start_exclamation_mark",frame:0,type:Q.SPRITE_NONE,scale:0.1,z:this.p.z+1}));
            exc.add("tween");
            exc.animate({scale:1},0.5,Q.Easing.Quadratic.InOut,{callback:function(){exc.destroy();}});
            
            if(this.p.team==="enemy"){
                var t = this;
                setTimeout(function(){
                    t.stage.BatCon.endTurn();
                },500);
            }
        },
        //Run when attacking
        checkEndTurn:function(){
            if(this.p.didMove&&this.p.didAction){
                this.stage.BatCon.endTurn();
                return true;
            }
            return false;
        },
        //Move this character to a location based on the passed path
        moveAlong:function(path){
            var newLoc = [path[path.length-1].x,path[path.length-1].y];
            this.stage.BattleGrid.moveObject(this.p.loc,newLoc,this);
            //Store the old loc in the moved variable. This wil allow for redo-s
            this.p.didMove = this.p.loc;
            //Set the new loc
            this.p.loc = newLoc;
            this.stage.BatCon.setXY(this);
            this.stage.pointer.on("checkConfirm");
            this.stage.pointer.checkTarget();
            //If this character hasn't attacked yet this turn, generate a new attackgraph
            if(!this.p.didAction){
                this.p.attackMatrix = new Q.Graph(this.getMatrix("attack"));
                this.stage.pointer.p.loc = this.p.loc;
                this.stage.BatCon.setXY(this.stage.pointer);
                Q.stage(2).ActionMenu.p.conts[0].p.fill="gray";
            } else {
                this.stage.BatCon.endTurn();
            }
        },
        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(targetLoc){
            var target = this.stage.BattleGrid.getObject(targetLoc);
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:this,defender:target}));
        },
        getMatrix:function(matrixType){
            var tileTypes = Q.state.get("tileTypes");
            var cM=[];
            var stage = this.stage;
            function getWalkable(){
                var move = tileTypes[stage.BatCon.getTileType([i_walk,j_walk])].move;
                return move?move:10000;
            }
            function getTarget(){
                return stage.BattleGrid.getObject([i_walk,j_walk]);
            }
            for(var i_walk=0;i_walk<stage.lists.TileLayer[0].p.tiles[0].length;i_walk++){
                var costRow = [];
                for(var j_walk=0;j_walk<stage.lists.TileLayer[0].p.tiles.length;j_walk++){
                    var cost = 1;
                    var objOn = false;
                    //If we're walking, enemies are impassable
                    if(matrixType==="walk"){
                        cost = getWalkable();
                        objOn = getTarget();
                        //Allow walking over allies
                        if(objOn&&objOn.p.team===this.p.team){objOn=false;};
                    }
                    //If there's still no enemy on the sqaure, get the tileCost
                    if(!objOn){
                        costRow.push(cost);
                    } else {
                        costRow.push(10000);
                    }

                }
                cM.push(costRow);
            }
            return cM;
         }
    
    });
};