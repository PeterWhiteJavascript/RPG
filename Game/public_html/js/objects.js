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
            playMiss:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("missed"+dir);
                var to = [this.p.x-16,this.p.y];
                this.animate({x:to[0], y:to[1]}, .2, Q.Easing.Quadratic.Out)
                        .chain({x:this.p.x,y:this.p.y},.2,Q.Easing.Quadratic.Out);
            },
            playAttack:function(dir,callback,targets){
                this.p.dir = this.checkPlayDir(dir);
                this.play("attacking"+this.p.dir);
                this.on("doneAttack",function(){
                    this.playStand(this.p.dir);
                    this.off("doneAttack");
                    if(callback) callback();
                });
            },
            playSonicBoom:function(dir,callback,targets){
                this.playAttack(dir);
                var boom = Q.stage(0).insert(new Q.DynamicAnim({sheet:"SonicBoom",sprite:"SonicBoom",frame:0,loc:Q.pointer.p.loc,z:101}));
                boom.on("doneAttack",function(){
                    if(callback) callback();
                    boom.destroy();
                });
                boom.play("booming");
            },
            playWhirlwind:function(dir,callback,targets){
                this.playAttack(dir);
                var locs = [];
                targets.forEach(function(target){
                    locs.push(target.p.loc);
                });
                locs.forEach(function(loc,idx){
                    var wind = Q.stage(0).insert(new Q.DynamicAnim({sheet:"Whirlwind",sprite:"Whirlwind",frame:0,loc:loc,z:101}));
                    wind.on("doneAttack",function(){
                        if(idx===0){
                            if(callback) callback();
                        }
                        wind.destroy();
                    });
                    wind.play("winding");
                });
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
            t.p.skills = this.generateSkills();
            t.p.name = Q.state.get("charClasses")[t.p.charClass].name+t.p.id;
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
        },
        generateSkills:function(){
            var allSkills = Q.state.get("skills");
            var p = this.entity.p;
            p.skills = {};
            //To do: Come up with a way to give reasonable skills
            p.skills[p.equipment.righthand.equipmentType] = allSkills[p.equipment.righthand.equipmentType];
            p.skills[p.equipment.lefthand.equipmentType] = allSkills[p.equipment.lefthand.equipmentType];
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
            p.maxSp = this.getSp(base);
            p.sp = this.getSp(base);
            p.totalDamageLow = this.getDamageLow();
            p.totalDamageHigh = this.getDamageHigh();
            p.totalSpeed = this.getSpeed();
            p.strike = this.getStrike();
            p.parry = this.getParry();
            p.criticalChance = this.getCriticalChance();
            p.armour = this.getArmour();
            p.range = this.getRange();
            p.zoc = Q.state.get("charClasses")[p.charClass].zoc;
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
    //Any functions that are run because of skills are here as well
    Q.component("combatant",{
        extend:{
            pushed:function(tileTo){
                var posTo = Q.BatCon.getXY(tileTo);
                this.hideStatusDisplay();
                this.animate({x:posTo.x, y:posTo.y}, .4, Q.Easing.Quadratic.Out, { callback: function() {
                    Q.BattleGrid.moveObject(this.p.loc,tileTo,this);
                    this.p.loc = tileTo;
                    Q.BatCon.setXY(this);
                    this.revealStatusDisplay();
                }});
            },
            //Displays the miss dynamic number
            showMiss:function(){
                this.playMiss(this.p.dir);
                this.stage.insert(new Q.DynamicNumber({color:"#000", loc:this.p.loc, text:"Miss!"}));
            },
            //Displays the damage dynamic number
            showDamage:function(dmg){
                this.stage.insert(new Q.DynamicNumber({color:"#fff", loc:this.p.loc, text:"-"+dmg}));  
            },
            //This object takes damage and checks if it is defeated. Also displays dynamic number
            takeDamage:function(dmg){
                if(dmg<=0){dmg=1;};
                this.p.hp-=dmg;
                if(this.p.hp<=0){
                    Q.BattleGrid.removeZOC(this);
                    Q.BattleGrid.removeObject(this.p.loc);
                    Q.BatCon.markForRemoval(this);
                }
                //Q.playSound("hit1.mp3");
            },
            addStatus:function(name,turns){
                if(!this.p.statusDisplay){this.p.statusDisplay = this.stage.insert(new Q.StatusIcon({status:[name],char:this}));}
                else {this.p.statusDisplay.p.status.push(name);}
                this.p.status[name] = {name:name,turns:turns};
                Q.playSound("inflict_status.mp3");
            },
            doAttackAnim:function(targets,animation,sound,callback){
                this.faceTarget(targets[0].p.loc);
                this["play"+animation](this.p.dir,callback,targets);
                Q.playSound(sound+".mp3");
            },
            
            advanceStatus:function(){
                var status = this.p.status;
                var keys = Object.keys(status);
                for(var i=0;i<keys.length;i++){
                    var st = status[keys[i]];
                    if(st){
                        st.turns--;
                        if(st.turns===0){
                            status[keys[i]]=false;
                            this.p.statusDisplay.removeStatus(st.name);
                        }
                    }
                }
            },
            hasStatus:function(name){
                return this.p.status[name];
            },
            removeStatus:function(name){
                this.p.status[name] = false;
                this.p.statusDisplay.removeStatus(name);
            },
            hideStatusDisplay:function(){
                if(this.p.statusDisplay) this.p.statusDisplay.hide();
            },
            revealStatusDisplay:function(){
                if(this.p.statusDisplay) this.p.statusDisplay.reveal();
            },
            faceTarget:function(tLoc){
                var pLoc = this.p.loc;
                var xDif = tLoc[0]-pLoc[0];
                var yDif = tLoc[1]-pLoc[1];
                if(xDif===0&&yDif===0){return this.p.dir;};
                var newDir = "";
                switch(true){
                    case yDif<0:
                        newDir+="up";
                        this.p.flip=false;
                        break
                    case yDif>0:
                        newDir+="down";
                        this.p.flip='x';
                        break;
                }
                if(newDir.length===0){
                    switch(true){
                        case xDif<0:
                            newDir+="left";
                        this.p.flip=false;
                            break
                        case xDif>0:
                            newDir+="right";
                            this.p.flip='x';
                            break;
                    }
                }
                this.p.dir = newDir;
            }
            
        }
    });
    Q.component("autoMove", {
        added: function() {
            var p = this.entity.p;
            p.stepX = Q.tileW;
            p.stepY = Q.tileH;
            if(!p.stepDelay) { p.stepDelay = 0.3; }
            p.stepWait = 0;
            p.stepping=false;
            this.entity.on("step",this,"step");
            p.walkPath = this.moveAlong(p.calcPath);
            p.calcPath=false;
        },

        atDest:function(){
            var p = this.entity.p;
            p.loc = p.destLoc;
            Q.BatCon.setXY(this.entity);
            this.entity.trigger("doneAutoMove");
            this.entity.trigger("atDest");
            this.entity.playStand(p.dir);
            this.entity.del("autoMove");
        },
        moveAlong:function(to){
            if(!to){this.atDest();return;};
            var p = this.entity.p;
            var walkPath=[];
            var curLoc = {x:p.loc[0],y:p.loc[1]};
            var going = to.length;
            for(var i=0;i<going;i++){
                var path = [];
                //Going right
                if(to[i].x>curLoc.x){
                    path.push("right");
                //Going left
                } else if(to[i].x<curLoc.x){
                    path.push("left");
                //Stay same
                } else {
                    path.push(false);
                }
                //Going down
                if(to[i].y>curLoc.y){
                    path.push("down");

                //Going up
                } else if(to[i].y<curLoc.y){
                    path.push("up");
                //Stay same
                } else {
                    path.push(false);
                }
                walkPath.push(path);

                curLoc=to[i];

            }
            if(walkPath.length===0||(walkPath[0][0]===false&&walkPath[0][1]===false&&walkPath.length===1)){this.atDest();return;};
            return walkPath;
        },

        step: function(dt) {
            var p = this.entity.p;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
            }

            if(p.stepWait > 0) {return; }
            //At destination
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
                p.walkPath.shift();
                this.entity.trigger("atDest");
                if(p.walkPath.length===0){
                    this.atDest();
                    return;
                }
            }
            p.stepping = false;

            p.diffX = 0;
            p.diffY = 0;
            //p.walkPath = [["left","up"],["left",false],[false,"up"],["right","down"]]
            if(p.walkPath[0][0]==="left") {
                p.diffX = -p.stepX;
            } else if(p.walkPath[0][0]==="right") {
                p.diffX = p.stepX;
            } else if(p.walkPath[0][1]==="up") {
                p.diffY = -p.stepY;
            } else if(p.walkPath[0][1]==="down"){
                p.diffY = p.stepY;
            }
            //Run the first time
            if(p.diffX || p.diffY ){
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;

                p.stepWait = p.stepDelay;
                p.stepped=true;

                //If we have passed all of the checks and are moving
                if(p.stepping){
                    p.dir="";
                    switch(p.walkPath[0][1]){
                        case "up":
                            p.dir="up";
                            p.flip = false;
                            break;
                        case "down":
                            p.dir="down";
                            p.flip = 'x';
                            break;
                    }
                    if(p.dir.length===0){
                        switch(p.walkPath[0][0]){
                            case "right":
                                p.dir+="right";
                                p.flip = 'x';
                                break;
                            case "left":
                                p.dir+="left";
                                p.flip = false;
                                break;
                        }
                    }
                    //Play the correct direction walking animation
                    this.entity.playWalk(p.dir);
                };
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
                z:10,
                status:{
                    sturdy:false,
                    blind:false,
                    poisoned:false
                }
            });
            this.p.sheet = this.p.charClass;
            //Quintus components
            this.add("2d, animation, tween");
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
            Q.BatCon.setXY(this);
            this.playStand(this.p.dir);
            Q._generatePoints(this,true);
            //TEMPORARY SINCE THE FINAL SPRITES WILL NOT BE ISOMETRIC
            if(this.p.dir==="down"||this.p.dir==="right"){
                this.p.flip = 'x';
            }
        },
        startTurn:function(){
            //This will be put in a 'process status at start of turn' function
            if(this.p.status.poisoned) this.takeDamage(Math.floor(this.p.maxHp/8));
            if(this.p.hp<=0) Q.BatCon.endTurn();
            this.advanceStatus();
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
            
        },
        //Move this character to a location based on the passed path
        moveAlong:function(path){
            Q.pointer.off("checkInputs");
            Q.pointer.off("checkConfirm");
            this.hideStatusDisplay();
            
            var newLoc = [path[path.length-1].x,path[path.length-1].y];
            Q.BattleGrid.moveObject(this.p.loc,newLoc,this);
            //Store the old loc in the moved variable. This will allow for redo-s
            this.p.didMove = this.p.loc;
            this.p.calcPath = path;
            this.p.destLoc = newLoc;
            this.add("autoMove");
            var t = this;
            this.on("doneAutoMove",function(){
                Q.pointer.on("checkInputs");
                Q.pointer.on("checkConfirm");
                Q.pointer.checkTarget();
                this.revealStatusDisplay();
                //If this character hasn't attacked yet this turn, generate a new attackgraph
                if(!t.p.didAction){
                    t.p.attackMatrix = new Q.Graph(t.getMatrix("attack"));
                    Q.pointer.p.loc = t.p.loc;
                    Q.BatCon.setXY(Q.pointer);
                    if(this.p.team==="enemy") {
                        this.trigger("startAIAction");
                    }
                } else {
                    Q.BatCon.endTurn();
                }
                t.off("doneAutoMove");
            });
        },
        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(targetLoc){
            var target = Q.BattleGrid.getObject(targetLoc);
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:this,targets:[target]}));
        },
        previewDoSkill:function(targetLoc,skill){
            var targets = [];
            if(skill.aoe){
                targets = Q.BattleGrid.getObjectsAround(targetLoc,skill.aoe);
            } else {
                targets[0] = Q.BattleGrid.getObject(targetLoc);
            }
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:this,targets:targets,skill:skill}));
        },
        getMatrix:function(matrixType){
            var tileTypes = Q.state.get("tileTypes");
            var cM=[];
            var stage = this.stage;
            var otherTeam = this.p.team==="enemy"?"ally":"enemy";
            function getWalkable(){
                var move = tileTypes[Q.BatCon.getTileType([i_walk,j_walk])].move;
                return move?move:1000000;
            }
            function getTarget(){
                return Q.BattleGrid.getObject([i_walk,j_walk]);
            }
            function getZOC(){
                return Q.BattleGrid.getZOC(otherTeam,[i_walk,j_walk]);
            }
            for(var i_walk=0;i_walk<stage.lists.TileLayer[0].p.tiles[0].length;i_walk++){
                var costRow = [];
                for(var j_walk=0;j_walk<stage.lists.TileLayer[0].p.tiles.length;j_walk++){
                    var cost = 1;
                    var objOn = false;
                    var zocOn = false;
                    //If we're walking, enemies are impassable
                    if(matrixType==="walk"){
                        cost = getWalkable();
                        objOn = getTarget();
                        if(!objOn) zocOn = getZOC();
                        
                        //Allow walking over allies
                        if(objOn&&objOn.p.team===this.p.team){objOn=false;};
                    }
                    //If there's still no enemy on the sqaure, get the tileCost
                    if(objOn){
                        costRow.push(1000000);
                    } else if(zocOn){
                        costRow.push(1000);
                    } else {
                        costRow.push(cost);
                    }
                }
                cM.push(costRow);
            }
            return cM;
         }
    
    });
};