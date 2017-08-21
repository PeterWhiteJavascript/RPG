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
        getBagItem:function(type,name){
            for(var i=0;i<this.items[type].length;i++){
                var item = this.items[type][i];
                if(item.name===name){
                    return item;
                }
            }
        },
        addItem:function(itm,type){
            //Check if the item is contained in the bag already
            var item = this.getBagItem(type,itm.name);
            //If the item wasn't found, add it
            if(!item){
                this.items[type].push(itm);
            } else {
                item.amount+=itm.amount;
            }
        },
        removeItem:function(itm,type){
            for(var i=0;i<this.items[type].length;i++){
                var item = this.items[type][i];
                if(item.name===itm.name){
                    this.items[type].splice(i,1);
                    return;
                }
            }
        },
        increaseItem:function(itm,amount){
            itm.amount+=amount;
        },
        decreaseItem:function(itm,type,amount){
            var item = this.getBagItem(type,itm.name);
            item.amount-=amount?amount:1;
            if(item.amount<=0) this.removeItem(item,type);
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
                /*if(this.p.lifting){
                    this.play("countering"+this.p.dir);
                }
                else*/ if(this.p.combatStats.hp<=this.p.combatStats.maxHp/5){
                    this.play("hurt"+this.p.dir);
                } 
                else {
                    this.play("standing"+this.p.dir);
                }
            },
            playWalk:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("walking"+this.p.dir);
            },
            playMiss:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("missed"+dir);
                var to = [this.p.x-16,this.p.y];
                this.animate({x:to[0], y:to[1]}, .2, Q.Easing.Quadratic.Out)
                        .chain({x:this.p.x,y:this.p.y},.2,Q.Easing.Quadratic.Out);
                this.on("doneMissed",function(){
                    this.off("doneMissed");
                    this.playStand(this.p.dir);
                    if(callback) callback();
                });
            },
            playAttack:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("attacking"+this.p.dir);
                this.on("doneAttack",function(){
                    this.off("doneAttack");
                    this.playStand(this.p.dir);
                    if(callback){
                        setTimeout(function(){
                            callback();
                        },400);
                        
                    }
                });
            },
            playCounter:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("countering"+this.p.dir);
                this.on("doneCounter",function(){
                    this.off("doneCounter");
                    this.playAttack(dir,callback);
                });
            },
            playLift:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("lift"+this.p.dir);
            },
            playLifted:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("lifted"+this.p.dir);
            },
            //Used in the story
            playHurt:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("hurt"+this.p.dir);
            },
            playDying:function(dir,callback){
                if(this.p.animation==="dying"+this.p.dir) return;
                this.p.dir = this.checkPlayDir(dir);
                this.play("dying"+this.p.dir);
                this.on("doneDying",function(){
                    this.off("doneDying");
                    if(callback) callback();
                    this.play("dead"+this.p.dir);
                });
            },
            playLevelUp:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("levelingUp");
                this.on("doneLevelingUp",function(){
                    this.off("doneLevelingUp");
                    if(callback) callback();
                    this.play("stand"+this.p.dir);
                });
            },
            playFainted:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("fainting"+this.p.dir);
                this.on("doneFainting",function(){
                    this.off("doneDying");
                    if(callback) callback();
                    this.play("dead"+this.p.dir);
                    
                });
            },
            playFlamethrower:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.animate({angle:360}, .2, Q.Easing.Quadratic.Out)
                        .chain({angle:0},.2,Q.Easing.Quadratic.Out);
                this.play("countering"+this.p.dir);
                this.on("doneCounter",function(){
                    this.off("doneCounter");
                    this.playAttack(dir,callback);
                });
            }
        }
    });
    //Given to characters, interactables, and pickups
    //Checked to see if this object should be placed in the BattleGrid, and also if it has ZOC.
    Q.component("interactable",{
        added:function(){
            
        }
    });
    //Any object that saves some properties
    Q.component("save",{
        added:function(){
            this.entity.on("saveProp",this,"saveProp");
        },
        saveProp:function(props){
            var name = props.name;
            var value = props.value;
            this.entity.p.savedData[name] = value;
        }
    });
    //Any functions that are run because of skills are here as well
    Q.component("combatant",{
        extend:{
            pulled:function(tileTo,targetTileTo,user,callback){
                var posTo = Q.BatCon.getXY(tileTo);
                this.hideStatusDisplay();
                this.animate({x:posTo.x, y:posTo.y}, .4, Q.Easing.Quadratic.Out, { callback: function() {
                    Q.BattleGrid.moveObject(this.p.loc,tileTo,this);
                    this.p.loc = tileTo;
                    Q.BatCon.setXY(this);
                    this.revealStatusDisplay();
                }});
                var posTo = Q.BatCon.getXY(targetTileTo);
                user.hideStatusDisplay();
                user.animate({x:posTo.x, y:posTo.y}, .4, Q.Easing.Quadratic.Out, { callback: function() {
                    Q.BattleGrid.moveObject(user.p.loc,targetTileTo,user);
                    user.p.loc = targetTileTo;
                    Q.BatCon.setXY(user);
                    user.revealStatusDisplay();
                    if(callback) callback();
                }});
                Q.playSound("shooting.mp3");
            },
            pushed:function(tileTo,callback){
                var posTo = Q.BatCon.getXY(tileTo);
                this.hideStatusDisplay();
                this.animate({x:posTo.x, y:posTo.y}, .4, Q.Easing.Quadratic.Out, { callback: function() {
                    Q.BattleGrid.moveObject(this.p.loc,tileTo,this);
                    this.p.loc = tileTo;
                    Q.BatCon.setXY(this);
                    this.revealStatusDisplay();
                    if(callback) callback();
                }});
                Q.playSound("shooting.mp3");
            },
            chargedThrough:function(tileTo,target,callback){
                var posTo = Q.BatCon.getXY(tileTo);
                this.hideStatusDisplay();
                this.animate({x:posTo.x, y:posTo.y}, .4, Q.Easing.Quadratic.Out, { callback: function() {
                    Q.BattleGrid.moveObject(this.p.loc,tileTo,this);
                    this.p.loc = tileTo;
                    Q.BatCon.setXY(this);
                    this.revealStatusDisplay();
                    if(callback) callback();
                }});
                target.playMiss(target.p.dir);
                Q.playSound("shooting.mp3");
            },
            //Displays the miss dynamic number
            showMiss:function(attacker,callback){
                //Face the attacker
                this.playMiss(Q.compareLocsForDirection(this.p.loc,attacker.p.loc,this.p.dir),callback);
                this.stage.insert(new Q.DynamicNumber({color:"#000", loc:this.p.loc, text:"Miss!",z:this.p.z}));
                Q.playSound("cannot_do.mp3");
            },
            showResisted:function(attacker,callback){
                this.playMiss(this.p.dir,callback);
                this.stage.insert(new Q.DynamicNumber({color:"#000", loc:this.p.loc, text:"Resisted!",z:this.p.z}));
                Q.playSound("cannot_do.mp3");
            },
            //Displays the damage dynamic number
            showDamage:function(dmg,sound,callback){
                this.stage.insert(new Q.DynamicNumber({color:"red", loc:this.p.loc, text:"-"+dmg,z:this.p.z}));  
                //Show the death animation at this point
                if(this.p.combatStats.hp<=0){
                    this.playDying(this.p.dir,callback);
                    //Probably want to do unit specific death sounds
                    Q.playSound("dying.mp3");
                } else {
                    sound = sound?sound:"hit1.mp3";
                    Q.playSound(sound);
                    if(callback){
                        setTimeout(function(){
                            callback();
                        },500);
                    }
                }
            },
            showCounter:function(toCounter,callback){
                this.playCounter(Q.compareLocsForDirection(this.p.loc,toCounter.p.loc,this.p.dir),callback);
                Q.playSound("slashing.mp3");
            },
            showExpGain:function(exp,leveledUp,time){
                this.stage.insert(new Q.DynamicNumber({color:"green", loc:this.p.loc, text:"+"+exp,z:this.p.z}));
                //If the character leveled up
                if(leveledUp){
                    this.stage.insert(new Q.DynamicNumber({color:"white", loc:this.p.loc, text:"Lv. up!",z:this.p.z}));
                    this.playLevelUp(this.p.dir);
                    time = 1000;
                    Q.playSound("confirm.mp3");
                } else {
                    Q.playSound("coin.mp3");
                }
                return time?time:300;
            },
            showHealed:function(amount,callback){
                this.stage.insert(new Q.DynamicNumber({color:"green", loc:this.p.loc, text:"+"+amount,z:this.p.z}));
                Q.playSound("coin.mp3");
                if(!this.p.fainted&&this.p.combatStats.hp){
                    this.playStand(this.p.dir);
                }
                if(callback){
                    setTimeout(function(){
                        callback();
                    },500);
                }
            },
            showFainted:function(attacker,callback){
                var t = this;
                this.playFainted(this.p.dir,function(){t.addStatus("fainted",5,"debuff",attacker,null,callback);});
            },
            //This object takes damage and checks if it is defeated. Also displays dynamic number
            //Also can add some feedback to the attackfuncs text
            takeDamage:function(dmg,attacker,callback){
                var text = [];
                if(dmg<=0){alert("Damage is less than or equal to 0");};
                //Make the character take damage
                this.p.combatStats.hp-=dmg;
                this.trigger("saveProp",{name:"hp",value:this.p.combatStats.hp});
                Q.setAward(attacker,"damageDealt",dmg);
                Q.setAward(this,"damageTaken",dmg);
                //Only add the attacker if there is one (no attacker for hurt by poison, etc...)
                if(attacker){
                    this.addToHitBy(attacker);
                    if(attacker.p.talents.includes("Frenzy")){
                        if(this.p.fainted||this.p.combatStats.hp<=0){
                            Q.BatCon.removeFromTurnOrder(attacker);
                            Q.BatCon.addToStartOfTurnOrder(attacker);
                        }
                    }
                    if(attacker.p.talents.includes("Draining Strike")){
                        this.p.combatStats.tp-=dmg;
                    }
                }
                if(this.p.combatStats.hp<=0){
                    //If this character that is dying is lifting another object
                    if(this.p.lifting){
                        this.on("doneDying",function(){
                            //Get all of the empty tiles around this object (prioritize closer squares)
                            var locs = Q.BattleGrid.getEmptyAround(this.p.loc,this.p.lifting.p.canMoveOn);
                            //Select a random spot
                            var dropLoc = Math.floor(Math.random()*locs.length);
                            //Randomly place the lifted object around in the area around the character
                            Q.BatCon.dropObject(this,this.p.lifting,locs[dropLoc]);
                        });
                    }
                    //Q.BattleGrid.removeZOC(this);
                    //Uncomment this if the object will be removed from the grid when dead
                    //Q.BattleGrid.removeObject(this.p.loc);
                    //Q.BatCon.markForRemoval(this);
                    //Set the hp to 0
                    this.p.combatStats.hp = 0;
                    this.trigger("saveProp",{name:"hp",value:this.p.combatStats.hp});
                    //Give the character that got the last hit an 'enemiesDefeated' award
                    Q.setAward(attacker,"enemiesDefeated",1);
                    Q.setAward(this,"timesDied",1);
                    //Remove all status effects
                    this.removeAllStatus();
                    this.removeAllGaveStatus();
                    this.removeStatus("fainted");
                    this.addStatus("bleedingOut",5,"debuff",this);
                    if(this.p.mirage) this.p.mirage.dispellMirage();
                    this.p.fainted = false;
                    if(!this.p.died){
                        //Set died to true so that if the character comes back to life, it will not give exp
                        this.p.died = true;
                        //Only give exp if possible (if an ally killed this character, no exp is given)
                        if(this.p.hitBy.length){
                            //Figure out how much exp should be awarded
                            text.push(Q.BatCon.giveExp(this,this.p.hitBy));
                        }
                    }
                    if(callback){
                        if(text.length) Q.BatCon.attackFuncs.text.unshift(text);
                        callback();
                    }
                    return text;//If this is returned, the character is dead and it executes
                } else {
                    if(this.p.talents.includes("Second Wind")&&this.p.tempHp<=Math.floor(this.p.combatStats.maxHp/10)){
                        Q.BatCon.removeFromTurnOrder(this);
                        Q.BatCon.addToStartOfTurnOrder(this);
                    } 
                    if(!this.p.fainted){
                        this.playStand(this.p.dir);
                    }
                }
                if(callback) callback();
            },
            //Generates stats based on buffs (called after adding and removing a buff)
            generateRelevantStats:function(statName){
                switch(statName){
                    //Reflexes affects defensive ability, so recalculate it using the new value. Defensive Ability affects counter chance
                    case "reflexes":
                        this.p.combatStats.defensiveAbility = Q.charGen.get_defensiveAbility(this.p);
                        this.p.combatStats.counterChance =  Q.charGen.get_counterChance(this.p);
                        break;
                    case "initiative":
                        this.p.combatStats.mentalResistance = Q.charGen.get_mentalResistance(this.p);
                        break;
                    case "strength":
                        this.p.combatStats.physicalResistance = Q.charGen.get_physicalResistance(this.p);
                        this.p.combatStats.encumbranceThreshold = Q.charGen.get_encumbranceThreshold(this.p);
                        this.p.combatStats.encumbrancePenalty = Q.charGen.get_encumbrancePenalty(this.p);
                        this.p.combatStats.minAtkDmg = Q.charGen.get_minAtkDmg(this.p);
                        this.p.combatStats.maxAtkDmg = Q.charGen.get_maxAtkDmg(this.p);
                        this.p.combatStats.minSecondaryDmg = Q.charGen.get_minSecondaryDmg(this.p);
                        this.p.combatStats.minSecondaryDmg = Q.charGen.get_minSecondaryDmg(this.p);
                        this.p.combatStats.defensiveAbility = Q.charGen.get_defensiveAbility(this.p);
                        this.p.combatStats.counterChance =  Q.charGen.get_counterChance(this.p);
                        this.p.combatStats.atkAccuracy =  Q.charGen.get_atkAccuracy(this.p);
                        this.p.combatStats.critChance =  Q.charGen.get_critChance(this.p);
                        this.p.combatStats.moveSpeed =  Q.charGen.get_moveSpeed(this.p);
                        break;
                    case "skill":
                        this.p.combatStats.magicalResistance =  Q.charGen.get_magicalResistance(this.p);
                        break;
                    case "efficiency":
                        this.p.combatStats.mentalResistance =  Q.charGen.get_mentalResistance(this.p);
                        break;
                    case "defensiveAbility":
                        this.p.combatStats.counterChance =  Q.charGen.get_counterChance(this.p);
                        break;
                    case "atkAccuracy":
                        this.p.combatStats.critChance =  Q.charGen.get_critChance(this.p);
                        break;
                    case "moveSpeed":
                        this.p.combatStats.moveSpeed = Q.charGen.get_moveSpeed(this.p);
                        break;
                        
                }
            },
            addStatus:function(name,turns,type,user,props,callback){
                this.addToHitBy(user);
                if(!this.p.statusDisplay){this.p.statusDisplay = this.stage.insert(new Q.StatusIcon({status:[name],char:this}));}
                else {this.p.statusDisplay.p.status.push(name);}
                this.p.status[name] = {name:name,turns:turns,type:type,user:user};
                if(props){
                    this.p.status[name].props = props;
                    this.p.combatStats[props.name] += props.amount;
                    this.generateRelevantStats(props.name);
                }
                Q.playSound("inflict_status.mp3");
                if(callback) callback();
            },
            refreshStatus:function(name,turns,user,props,callback){
                if(this.p.combatStats.hp<=0) return;
                this.addToHitBy(user);
                if(props){
                    if(this.p.status[name].props.amount<props.amount){
                        this.p.combatStats[props.name] -= this.p.status[name].props.amount;
                        this.p.combatStats[props.name] += props.amount;
                        this.p.status[name].amount = props.amount;
                        this.generateRelevantStats(props.name);
                    }
                } else {
                    this.p.status[name].turns = turns;
                }
                Q.playSound("coin.mp3");
                if(callback) callback();
            },
            addToHitBy:function(obj){
                //Don't add team attackers for exp
                if(obj&&obj.p.team!==this.p.team){
                    //Don't add the attacker if they are already in there.
                    if(!this.p.hitBy.filter(function(ob){
                        return ob.p.id===obj.p.id;
                    })[0]){
                        //Add the attacker to the hitBy array
                        this.p.hitBy.push(obj);
                    }
                }
            },
            doAttackAnim:function(target,animation,sound,dir,callback){
                //If there's a dir, use that, else if there's a target, face it, else default
                var dir = dir ? dir : target ? Q.compareLocsForDirection(this.p.loc,target.p.loc,this.p.dir) : this.p.dir;
                this["play"+animation](dir,callback);
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
                            this.removeStatus(st.name);
                        }
                    }
                }
            },
            hasStatus:function(name){
                return this.p.status[name];
            },
            removeStatus:function(name){
                if(!this.p.status[name]) return;
                this.p.status[name].user.removeGaveStatus(this);
                this.removeGaveStatus(this.p.status[name]);
                //this.p.combatStats[props.name] += props.amount;
                if(this.p.status[name].props&&this.p.combatStats[this.p.status[name].props.name]){
                    this.p.combatStats[this.p.status[name].props.name]-= this.p.status[name].props.amount;
                }
                delete this.p.status[name];
                this.p.statusDisplay.removeStatus(name);
                this.generateRelevantStats(name);
                
                if(name==="fainted"){
                    this.p.fainted = false;
                    this.playStand(this.p.dir);
                }
            },
            removeGaveStatus:function(obj){
                for(var i=this.p.gaveStatus.length-1;i>0;i--){
                    if(obj===this.p.gaveStatus[i].char) this.p.gaveStatus.splice(i,1);
                }
            },
            removeAllGaveStatus:function(){
                for(var i=0;i<this.p.gaveStatus.length;i++){
                    this.p.gaveStatus[i].char.removeStatus(this.p.gaveStatus[i].status);
                }
                this.p.gaveStatus = [];
            },
            removeAllBadStatus:function(){
                var status = this.p.status;
                var statusDisplay = this.p.statusDisplay;
                var keys = Object.keys(status);
                var t = this;
                keys.forEach(function(key){
                    if(status[key].type==="debuff"){
                        t.removeStatus(key);
                        if(statusDisplay) statusDisplay.removeStatus(key);
                    }
                });
            },
            removeAllStatus:function(){
                var status = this.p.status;
                var statusDisplay = this.p.statusDisplay;
                var keys = Object.keys(status);
                var t = this;
                keys.forEach(function(key){
                    t.removeStatus(key);
                    if(statusDisplay) statusDisplay.removeStatus(key);
                });
            },
            hideStatusDisplay:function(){
                if(this.p.statusDisplay) this.p.statusDisplay.hide();
            },
            revealStatusDisplay:function(){
                if(this.p.statusDisplay) this.p.statusDisplay.reveal();
            },
            checkRegeneratingAura:function(){
                var alliesAround = Q.BattleGrid.removeEnemies(Q.BattleGrid.getObjectsWithin(this.p.loc,1),this.p.team);
                for(var i=0;i<alliesAround.length;i++){
                    var ally = alliesAround[i];
                    if(ally.p.talents.includes("Regenerating Aura")){
                        this.showHealed(5);
                    }
                }
            },
            validToCarry:function(){
                if(!this.p.lifting&&!this.p.lifted){
                    if(this.hasStatus("bleedingOut")||this.hasStatus("dead")){
                        return true;
                    }
                }
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
            this.entity.playStand(p.dir);
            this.entity.del("autoMove");
            this.entity.trigger("doneAutoMove");
            this.entity.trigger("atDest",[(p.x-Q.tileW/2)/Q.tileW,(p.y-Q.tileH/2)/Q.tileH]);
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
                p.z=p.y;
                if(p.lifting){
                    p.lifting.p.x += p.diffX * dt / p.stepDelay;
                    p.lifting.p.y += p.diffY * dt / p.stepDelay;
                    p.lifting.p.z=p.y+Q.tileH;
                }
            }

            if(p.stepWait > 0) {return; }
            //At destination
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
                p.walkPath.shift();
                this.entity.trigger("atDest",[(p.x-Q.tileW/2)/Q.tileW,(p.y-Q.tileH/2)/Q.tileH]);
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
                            break;
                        case "down":
                            p.dir="down";
                            break;
                    }
                    if(p.dir.length===0){
                        switch(p.walkPath[0][0]){
                            case "right":
                                p.dir+="right";
                                break;
                            case "left":
                                p.dir+="left";
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
                //Store amounts for certain buffs/debuffs. Amounts are reset to 0 when the status finishes.
                buffs:{
                    poisonDamage:0
                    
                },
                status:{},
                gaveStatus:[],
                //Allows the character to walk on tiles that it normally wouldn't be able to
                canMoveOn:{
                    waterWalk:false
                },
                //All enemies that hit this character are added so the exp can be divided when this character dies
                hitBy:[],
                //The current exp
                exp:0
            });
            this.p.sheet = this.p.charClass.toLowerCase();
            //Quintus components
            this.add("2d, animation, tween");
            //Custom components
            this.add("animations,interactable,combatant");
            //Turn the inserted function on. This is called when the sprite is added to a stage.
            this.on("inserted");
        },
        //Will run when this character is inserted into the stage (whether it be placement by the user, or when inserting enemies)
        inserted:function(){
            Q.BatCon.setXY(this);
            this.playStand(this.p.dir);
            Q._generatePoints(this,true);
            this.p.z = this.p.y;
            this.updateTileEffect(this.p.loc);
        },
        startTurn:function(){
            //This will be put in a 'process status at start of turn' function
            if(this.hasStatus("poisoned")){
                var text = [];
                var damage = this.p.buffs.poisonDamage;
                this.showDamage(damage);
                var dead = this.takeDamage(damage);
                if(dead){
                    text.push.apply(text,dead);
                    text.push({func:"waitTime",obj:Q.BatCon.attackFuncs,props:[1000]});
                    text.push({func:"endTurn",obj:Q.BatCon,props:[]});
                    
                    Q.BatCon.attackFuncs.processText(text);
                    return;
                }
            }
            //If the character's initiative is under 0, skip the turn
            if(this.p.combatStats.initiative<0){
                this.p.didMove = true;
                var text = [];
                text.push({func:"waitTime",obj:Q.BatCon.attackFuncs,props:[1000]});
                Q.BatCon.attackFuncs.processText(text);
                return;
            }
            //If the character is drawn to the mirage, refresh the status if the mirage still exists and move towards it.
            if(this.hasStatus("drawnToMirage")){
                this.refreshStatus("drawnToMirage",100,this.p.status.drawnToMirage.user);
                this.moveTowardsMirage(this.p.status.drawnToMirage.user);
                return false;
            }
            //If the character is in range of a mirage, roll and then move towards it if it failed.
            if(Q("Mirage").items.length){
                var inRange;
                var itms = Q("Mirage").items;
                for(var i=0;i<itms.length;i++){
                    inRange = itms[i].checkInRange(this);
                    if(inRange) i = itms.length;
                }
                if(inRange){
                    var atkRoll = Math.floor(Math.random()*100)+inRange.p.user.p.combatStats.skill+inRange.p.user.p.level;
                    var defRoll = Math.floor(Math.random()*100)+this.p.combatStats.skill+this.p.level;
                    if(atkRoll>defRoll){
                        this.p.didAction = true;
                        this.moveTowardsMirage(inRange);
                        this.addStatus("drawnToMirage",100,"debuff",inRange);
                        return false;
                    }
                }
            }
            //If the character has a stability field. Reduce the turns by 1
            if(this.p.stabilityField){
                this.p.stabilityField.p.turns--;
                if(this.p.stabilityField.p.turns<=0){
                    this.p.stabilityField.destroy();
                    Q.playSound("shooting.mp3");
                    this.p.stabilityField = false;
                }
            }
            this.p.cannotRecallMove = Q.state.get("options").cannotRecallMove;
            //Get the grid for walking from this position
            this.p.walkMatrix = new Q.Graph(Q.getMatrix("walk",this.p.team,this.p.canMoveOn,this));
            //Get the grid for attacking from this position
            this.p.attackMatrix = new Q.Graph(Q.getMatrix("attack"));
            //Set to true when the character moves
            this.p.didMove = false;
            //Set to true when the character attacks
            this.p.didAction = false;
            //The initial location of this character at the start of its turn
            this.p.initialLoc = [this.p.loc[0],this.p.loc[1]];
            var exc = this.stage.insert(new Q.Sprite({x:this.p.x,y:this.p.y-Q.tileH,sheet:"turn_start_exclamation_mark",frame:0,type:Q.SPRITE_NONE,scale:0.1,z:this.p.z+1}));
            exc.add("tween");
            exc.animate({scale:1},0.5,Q.Easing.Quadratic.InOut,{callback:function(){exc.destroy();}});
            return true;
        },
        //Moves the character back to its original location (from the start of the turn)
        resetMove:function(){
            Q.BattleGrid.moveObject(this.p.loc,this.p.didMove,this);
            this.p.loc = [this.p.didMove[0],this.p.didMove[1]];
            Q.BatCon.setXY(this);
            this.p.z = this.p.y;
            this.updateTileEffect(this.p.loc);
            this.p.didMove = false;
            this.revealStatusDisplay();
        },
        updateTileEffect:function(loc){
            var tile = Q.BatCon.getTileType(loc);
            var data = Q.state.get("tileTypes")[tile];
            this.p.tileEffect = data.effect;
        },
        //Pass in a loc to walk 1 step towards
        moveTowardsMirage:function(mirage){
            var toLoc = mirage.p.loc;
            var loc = this.p.loc;
            var path = Q.getPath(loc,toLoc,new Q.Graph(Q.getMatrix("walk",false,this.p.canMoveOn,this)),1000);
            //The object that is at the spot we're going (it may move there this turn)
            if(toLoc[0]===path[0].x&&toLoc[1]===path[0].y){
                mirage.dispellMirage();
                this.removeStatus("drawnToMirage");
            }
            this.moveAlong([path[0]],true);
        },
        //Move this character to a location based on the passed path
        moveAlong:function(path,noDir){
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
                this.off("doneAutoMove");
                this.revealStatusDisplay();
                //If the character landed on caltrops, do some damage
                if(Q.BattleGrid.caltrops&&Q.BattleGrid.caltrops.getTile(this.p.loc[0],this.p.loc[1])){
                    var dmg = Math.ceil(Math.random()*10);
                    this.showDamage(dmg);
                    this.takeDamage(dmg);
                    //Also disallow for recalling move
                    this.p.cannotRecallMove = true;
                }
                if(this!==Q.BatCon.turnOrder[0]){
                    return;
                }
                Q.pointer.checkTarget();
                //If this character hasn't attacked yet this turn, generate a new attackgraph
                if(!t.p.didAction){
                    t.p.attackMatrix = new Q.Graph(Q.getMatrix("attack"));
                    Q.pointer.p.loc = t.p.loc;
                    Q.BatCon.setXY(Q.pointer);
                    //Do the AI action
                    //TEMP
                    if(false&&this.p.team==="enemy") {
                        this.trigger("startAIAction");
                    } 
                    //Load the action menu
                    else {
                        Q.pointer.pointerMoveControls.remove();
                    }
                } else {
                    //TEMP
                    if(noDir){
                        setTimeout(function(){
                            Q.BatCon.endTurn();
                        },500);
                        
                    } else if(false&&this.p.team==="enemy"){
                        this.trigger("setAIDirection");
                    } else {
                        Q.BatCon.showEndTurnDirection(this);
                        Q.pointer.del("pointerMoveControls");
                    }
                }
            });
        }
    });
    Q.Sprite.extend("StoryCharacter",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sprite:"Character",
                dir:"left",
                combatStats:{hp:100}
            });
            this.p.sheet = this.p.charClass.toLowerCase();
            //Quintus components
            this.add("2d, animation, tween");
            this.add("animations");
            this.on("inserted");
        },
        inserted:function(){
            Q.BatCon.setXY(this);
            if(this.p.anim){
                this["play"+this.p.anim](this.p.dir);
            } else {
                this.playStand(this.p.dir);
            }
            
            Q._generatePoints(this,true);
            this.p.z = this.p.y;
        },
        //Moves the character along a path of preset points
        moveAlongPath:function(data){
            var path = [];
            var locNow = this.p.loc;
            var checkAt = [];
            var checkFuncs = [];
            var prevLoc;
            for(var i=0;i<data.length;i++){
                //Get a new walk matrix for every point (This allows for going back and forth over the same tile more than once)
                var walkMatrix = new Q.Graph(Q.getMatrix("walk","story"));
                //If the data is a loc array.
                if(Q._isArray(data[i])){
                    var to = Q.getPath(locNow,data[i],walkMatrix);
                    path.push.apply(path,to);
                    locNow = data[i];
                    prevLoc = data[i];
                } 
                //Otherwise, it's a function
                else {
                    if(prevLoc){
                        checkAt.push(prevLoc);
                        checkFuncs.push(data[i]);
                    } else { alert("Can't put a function at the start"); }
                }
            }
            if(checkAt.length){
                this.p.checkAt = checkAt;
                this.p.checkFuncs = checkFuncs;
                this.on("atDest",this,"checkAtLoc");
            }
            this.p.calcPath = path;
            this.p.destLoc = data[data.length-1];
            this.add("autoMove");
            this.on("doneAutoMove");
        },
        //Run this when an object does the at dest trigger from an automove
        checkAtLoc:function(loc){
            if(!loc) return;
            var checkAt = this.p.checkAt[0];
            if(loc[0]===checkAt[0]&&loc[1]===checkAt[1]){
                var data = this.p.checkFuncs.shift();
                var destObj;
                if(data.obj==="text"){
                    destObj = Q.stage(1).textBox;
                }
                destObj[data.func].apply(destObj,data.props);
                this.p.checkAt.shift();
                if(this.p.checkAt.length===0){
                    this.off("atDest",this,"checkAtLoc");
                }
            }
        },
        doneAutoMove:function(){
            this.off("doneAutoMove");
            this.off("atDest","checkAtLoc");
        }
    });
    
    Q.Sprite.extend("Mirage",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sheet:"mirage",
                sprite:"mirage",
                radius:Q.state.get("allSkills")["Hypnotic Mirage"].aoe[0]
            });
            this.add("animation");
            this.on("inserted");
        },
        inserted:function(){
            Q.BatCon.setXY(this);
            Q._generatePoints(this,true);
            this.p.z = this.p.y;
            this.play("doingItsThing");
        },
        checkInRange:function(obj){
            var xDiff = Math.abs(obj.p.loc[0]-this.p.loc[0]);
            var yDiff = Math.abs(obj.p.loc[1]-this.p.loc[1]);
            if(xDiff+yDiff<=this.p.radius){
                return this;
            }
        },
        dispellMirage:function(){
            this.p.user.p.mirage = false;
            this.destroy();
            var mirage = this;
            Q(".combatant").each(function(){
                if(this.hasStatus("drawnToMirage")){
                    if(this.p.status.drawnToMirage.user===mirage){
                        this.removeStatus("drawnToMirage");
                    }
                }
            });
            Q.playSound("shooting.mp3");
        },
        removeGaveStatus:function(){}
    });
};