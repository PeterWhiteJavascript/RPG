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
                //TEMPORARY SINCE THE FINAL SPRITES WILL NOT BE ISOMETRIC
                if(this.p.dir==="down"||this.p.dir==="right"){
                    this.p.flip = 'x';
                } else {
                    this.p.flip = false;
                }
                if(!dir){return this.p.dir;}else{return dir||"down";}
            },
            playStand:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                if(this.p.lifting){
                    this.play("countering"+this.p.dir);
                }
                else if(this.p.hp<=this.p.maxHp/5){
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
            playMiss:function(dir){
                this.p.dir = this.checkPlayDir(dir);
                this.play("missed"+dir);
                var to = [this.p.x-16,this.p.y];
                this.animate({x:to[0], y:to[1]}, .2, Q.Easing.Quadratic.Out)
                        .chain({x:this.p.x,y:this.p.y},.2,Q.Easing.Quadratic.Out);
            },
            playAttack:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("attacking"+this.p.dir);
                this.on("doneAttack",function(){
                    this.off("doneAttack");
                    this.playStand(this.p.dir);
                    if(callback) callback();
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
                this.p.dir = this.checkPlayDir(dir);
                this.play("dying"+this.p.dir);
                this.on("doneDying",function(){
                    this.off("doneDying");
                    this.play("dead"+this.p.dir);
                });
            },
            playLevelUp:function(dir,callback){
                this.p.dir = this.checkPlayDir(dir);
                this.play("levelingUp");
            },
            playSonicBoom:function(dir,callback,targets){
                this.playAttack(dir);
                var boom = Q.stage(0).insert(new Q.DynamicAnim({sheet:"SonicBoom",sprite:"SonicBoom",frame:0,loc:Q.pointer.p.loc,z:this.p.z}));
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
                var z = this.p.z;
                locs.forEach(function(loc,idx){
                    var wind = Q.stage(0).insert(new Q.DynamicAnim({sheet:"Whirlwind",sprite:"Whirlwind",frame:0,loc:loc,z:z}));
                    wind.on("doneAttack",function(){
                        if(idx===0){
                            if(callback) callback();
                        }
                        wind.destroy();
                    });
                    wind.play("winding");
                });
            },
            playPiercing:function(dir,callback,targets){
                this.playAttack(dir);
                var loc = [this.p.loc[0],this.p.loc[1]];
                //Rotation of weapon
                var rot = 0;
                //Flip of weapon
                var flip = false;
                //Change the location slightly
                switch(dir){
                    case "up":
                        loc[1]-=1;
                        rot = 270;
                        break;
                    case "right":
                        loc[0]+=1;
                        break;
                    case "down":
                        loc[1]+=1;
                        rot=90;
                        break;
                    case "left":
                        loc[0]-=1;
                        flip = 'x';
                        break;
                }
                var weapon = Q.stage(0).insert(new Q.DynamicAnim({sheet:"Piercing",sprite:"Piercing",frame:0,loc:loc,z:this.p.z,angle:rot,flip:flip}));
                weapon.on("doneAttack",function(){
                    if(callback) callback();
                });
                weapon.on("finished",function(){
                    weapon.destroy();
                });
                weapon.play("piercingStart");
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
            showMiss:function(attacker,time){
                //Face the attacker
                this.faceTarget(attacker.p.loc);
                this.playMiss(this.p.dir);
                this.stage.insert(new Q.DynamicNumber({color:"#000", loc:this.p.loc, text:"Miss!",z:this.p.z}));
                Q.playSound("cannot_do.mp3");
                return time?time:300;
            },
            //Displays the damage dynamic number
            showDamage:function(dmg,time,sound){
                this.stage.insert(new Q.DynamicNumber({color:"red", loc:this.p.loc, text:"-"+dmg,z:this.p.z}));  
                //Show the death animation at this point
                if(this.p.hp<=0){
                    this.playDying(this.p.dir);
                    //Probably want to do unit specific death sounds
                    Q.playSound("dying.mp3");
                } else {
                    var sound = sound?sound:"hit1.mp3";
                    Q.playSound(sound);
                }
                return time?time:300;
            },
            showCounter:function(toCounter,time){
                this.faceTarget(toCounter.p.loc);
                this.playCounter(this.p.dir);
                Q.playSound("slashing.mp3");
                return time?time:1000;
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
            //This object takes damage and checks if it is defeated. Also displays dynamic number
            //Also can add some feedback to the attackfuncs text
            takeDamage:function(dmg,attacker){
                if(dmg<=0){alert("Damage is less than or equal to 0");};
                //Make the character take damage
                this.p.hp-=dmg;
                this.trigger("saveProp",{name:"hp",value:this.p.hp});
                Q.setAward(attacker,"damageDealt",dmg);
                Q.setAward(this,"damageTaken",dmg);
                //Only add the attacker if there is one (no attacker for hurt by poison, etc...)
                if(attacker) this.addToHitBy(attacker);
                if(this.p.hp<=0){
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
                    Q.BattleGrid.removeZOC(this);
                    //Uncomment this if the object will be removed from the grid when dead
                    //Q.BattleGrid.removeObject(this.p.loc);
                    Q.BatCon.markForRemoval(this);
                    //Set the hp to 0
                    this.p.hp = 0;
                    this.trigger("saveProp",{name:"hp",value:this.p.hp});
                    //Give the character that got the last hit an 'enemiesDefeated' award
                    Q.setAward(attacker,"enemiesDefeated",1);
                    Q.setAward(this,"timesDied",1);
                    if(!this.p.died){
                        //Remove all status effects
                        this.removeAllStatus();
                        //Set died to true so that if the character comes back to life, it will not give exp
                        this.p.died = true;
                        //Only give exp if possible (if an ally killed this character, no exp is given)
                        if(this.p.hitBy.length){
                            //Figure out how much exp should be awarded
                            return Q.BatCon.giveExp(this,this.p.hitBy);
                        }
                    }
                } else {
                    this.playStand(this.p.dir);
                }
            },
            healHp:function(amount){
                this.stage.insert(new Q.DynamicNumber({color:"green", loc:this.p.loc, text:"+"+amount,z:this.p.z}));
            },
            addStatus:function(name,turns,user){
                this.addToHitBy(user);
                if(!this.p.statusDisplay){this.p.statusDisplay = this.stage.insert(new Q.StatusIcon({status:[name],char:this}));}
                else {this.p.statusDisplay.p.status.push(name);}
                this.p.status[name] = {name:name,turns:turns};
                Q.playSound("inflict_status.mp3");
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
            removeAllStatus:function(){
                var status = this.p.status;
                var statusDisplay = this.p.statusDisplay;
                var keys = Object.keys(status);
                keys.forEach(function(key){
                    status[key]=false;
                    if(statusDisplay) statusDisplay.removeStatus(key);
                });
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
                //Any status effects (good and bad)
                status:{
                    //Good
                    sturdy:false,
                    //Bad
                    blind:false,
                    poisoned:false
                },
                //Allows the character to walk on tiles that it normally wouldn't be able to
                canMoveOn:{
                    waterWalk:false
                },
                //All enemies that hit this character are added so the exp can be divided when this character dies
                hitBy:[],
                //The current exp
                exp:0
            });
            this.p.sheet = this.p.charClass;
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
            if(this.p.status.poisoned){
                var text = [];
                var damage = Math.floor(this.p.maxHp/8);
                text.push({func:"showDamage",obj:this,props:[damage,500]});
                var dead = this.takeDamage(damage);
                if(dead){
                    text.push.apply(text,dead);
                    text.push({func:"waitTime",obj:Q.BatCon.attackFuncs,props:[1000]});
                    text.push({func:"endTurn",obj:Q.BatCon,props:[]});
                    Q.BatCon.attackFuncs.doDefensiveAnim(text);
                    return;
                }
                Q.BatCon.attackFuncs.doDefensiveAnim(text);
            }
            this.advanceStatus();
            //Get the grid for walking from this position
            this.p.walkMatrix = new Q.Graph(Q.getMatrix("walk",this.p.team,this.p.canMoveOn));
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
            var t = this;
            exc.animate({scale:1},0.5,Q.Easing.Quadratic.InOut,{callback:function(){exc.destroy();
                //TEMP
                /*if(t.p.team==="enemy"){
                    Q.BatCon.endTurn();
                }*/
                }});
        },
        updateTileEffect:function(loc){
            var tile = Q.BatCon.getTileType(loc);
            var data = Q.state.get("tileTypes")[tile];
            this.p.tileEffect = data.effect;
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
                        Q.pointer.displayCharacterMenu();
                    }
                } else {
                    //TEMP
                    if(false&&this.p.team==="enemy"){
                        this.trigger("setAIDirection");
                    } else {
                        Q.pointer.off("checkInputs");
                        Q.pointer.off("checkConfirm");
                        Q.pointer.snapTo(this);
                        Q.pointer.hide();
                        this.add("directionControls");
                    }
                }
                t.off("doneAutoMove");
            });
        }
    });
    Q.Sprite.extend("StoryCharacter",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sprite:"Character",
                dir:"left"
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
    //A chest that appears on the map that you can pick up
    Q.Sprite.extend("Chest",{
        init:function(p){
            this._super(p,{
                w:20,h:30,
                type:Q.SPRITE_NONE,
                sheet:"chest",
                frame:0
            });
        }
    });
};