Quintus.GameObjects=function(Q){
    Q.Sprite.extend("Pointer",{
        init: function(p) {
            this._super(p, {
                sheet:"ui_pointer",
                frame:0,
                type:Q.SPRITE_NONE,
                
                guide:[],
                movTiles:[],
                
                stepDistanceX:Q.tileW,
                stepDistanceY:Q.tileH,
                stepDelay:0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[]
            });
            this.on("inserted");
            this.hide();
        },
        inserted:function(){
            Q.BatCon.setXY(this);
            Q._generatePoints(this,true);
        },
        //Makes the pointer go to a certain object
        snapTo:function(obj){
            this.p.loc = obj.p.loc;
            this.p.diffX = 0;
            this.p.diffY = 0;
            this.p.stepping=false;
            Q.BatCon.setXY(this);
            this.checkTarget();
        },
        getTerrain:function(){
            var type = Q.BatCon.getTileType(this.p.loc);
            this.trigger("onTerrain",type);
        },
        reset:function(){
            Q.BatCon.setXY(this);
            this.show();
            this.checkTarget();
            this.addControls();
            this.show();
            this.on("checkConfirm");
        },
        checkTarget:function(){
            var p = this.p;
            p.target=Q.BattleGrid.getObject(p.loc);
            if(p.target){
                this.trigger("onTarget",p.target);
            } else {
                this.trigger("offTarget");
            }
        },
        //Checks to see if we're going off the map and stop it.
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=this.stage.mapWidth||loc[1]>=this.stage.mapHeight){
                return false;
            }
            return loc;
        },
        addControls:function(skill){
            if(skill&&skill.range){
                if(skill.range[0]==="straight"){
                    //Only takes into account the direction of the input.
                    //Viewport is centered around the middle of the range
                    this.on("checkInputs",this,"checkStraightInputs");
                    //The pointer is hidden for straight aoe
                    this.hide();
                    //Force the first direction
                    Q.inputs[this.p.user.p.dir]=true;
                    return;
                }
            }
            //The standard checkInputs. This creates a 
            this.on("checkInputs");
            
        },
        displayCharacterMenu:function(){
            if(!this.p.target) return;
            Q.stageScene("characterMenu",2,{target:this.p.target,currentTurn:Q.BatCon.turnOrder[0],pointer:this});
            this.off("checkInputs");
            this.off("checkConfirm");
        },
        //Check confirm only runs when the user is moving around the pointer without any menu selection
        checkConfirm:function(){
            var input = Q.inputs;
            //If we're trying to load a menu
            if(input['confirm']){
                this.displayCharacterMenu();
                input['confirm']=false;
                return;
            } else if(input['esc']){
                this.snapTo(Q.BatCon.turnOrder[0]);
                input['esc']=false;
            }
        },
        //Do the logic for the directional inputs that were pressed
        checkInputs:function(){
            var p = this.p;
            var input = Q.inputs;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                p.diffY = -p.stepDistanceY;
                newLoc[1]--;
            } else if(input['down']){
                p.diffY = p.stepDistanceY;
                newLoc[1]++;
            }
            if(input['right']){
                p.diffX = p.stepDistanceX;
                newLoc[0]++;
            } else if(input['left']){
                p.diffX = -p.stepDistanceX;
                newLoc[0]--;
            }
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a loc and the loc was changed
            if(validLoc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                this.getTerrain();
                this.checkTarget();
                if(this.has("AOEGuide")) this.AOEGuide.moveTiles(p.loc);
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        checkStraightInputs:function(){
            var p = this.p;
            var input = Q.inputs;
            var newLoc = [p.user.p.loc[0],p.user.p.loc[1]];
            var dir;
            if(input['up']){
                newLoc[1]-=1;
                dir = "up";
                input['up']=false;
            } else if(input['down']){
                newLoc[1]+=1;
                dir = "down";
                input['down']=false;
            } else if(input['right']){
                newLoc[0]+=1;
                dir = "right";
                input['right']=false;
            } else if(input['left']){
                newLoc[0]-=1;
                dir = "left";
                input['left']=false;
            }
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a dir, loc, and the loc was changed
            if(dir&&validLoc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.diffX = (newLoc[0]-p.loc[0])*p.stepDistanceX;
                p.diffY = (newLoc[1]-p.loc[1])*p.stepDistanceY;
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x+p.diffX;
                p.destY = p.y+p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                this.getTerrain();
                this.checkTarget();
                p.user.playStand(dir);
                if(this.has("AOEGuide")) this.AOEGuide.moveStraightTiles(dir);
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        step:function(dt){
            var p = this.p;
            p.z=p.y+Q.tileH/2;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
            }
            if(p.stepWait > 0) { return;}
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
            }
            p.stepping = false;
            p.diffX = 0;
            p.diffY = 0;
            this.trigger("checkInputs");
            this.trigger("checkConfirm");
        }
    });
    
    //The grid that keeps track of all interactable objects in the battle.
    //Any time an object moves, this will be updated
    Q.GameObject.extend("BattleGridObject",{
        init:function(p){
            this.stage = p.stage;
            this.grid = [];
            this.allyZocGrid = [];
            this.enemyZocGrid = [];
            var tilesX = p.stage.mapWidth;
            var tilesY = p.stage.mapHeight;
            for(var i=0;i<tilesY;i++){
                this.grid[i]=[];
                this.allyZocGrid[i]=[];
                this.enemyZocGrid[i]=[];
                for(var j=0;j<tilesX;j++){
                    this.grid[i][j]=false;
                    this.allyZocGrid[i][j]=false;
                    this.enemyZocGrid[i][j]=false;
                }
            }
            //When an item is inserted into this stage, check if it's an interactable and add it to the grid if it is
            Q.stage(0).on("inserted",this,function(itm){
                if(itm.has("interactable")){
                    //Place the object in the grid
                    this.setObject(itm.p.loc,itm);
                    //If the object has ZOC, create the tiles
                    this.setZOC(itm.p.loc,itm);
                }
            });
        },
        //Returns the correct grid
        getGrid:function(obj){
            return obj.p.team==="enemy"?this.enemyZocGrid:this.allyZocGrid;
        },
        showZOC:function(team){
            var objs = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team===team&&char.p.zoc; 
            });
            if(!objs) return;
            objs.forEach(function(obj){
                obj.p.zocTiles.forEach(function(tile){
                    tile.show();
                });
            });
        },
        hideZOC:function(team){
            var objs = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team===team&&char.p.zoc; 
            });

            if(!objs) return;
            objs.forEach(function(obj){
                obj.p.zocTiles.forEach(function(tile){
                    tile.hide();
                });
            });
        },
        getZOC:function(team,loc){
            return this[team+"ZocGrid"][loc[1]][loc[0]];
        },
        setZOC:function(loc,obj){
            if(!obj.p.zoc) return;
            var zoc = obj.p.zoc;
            var grid = this.getGrid(obj);
            obj.p.zocTiles = [];
            for(var i=-zoc;i<zoc+1;i++){
                for(var j=0;j<((zoc*2+1)-Math.abs(i*2));j++){
                    //Don't add a tile if it is impassable
                    if(Q.BatCon.getTileType([loc[0]+i,loc[1]+j-(zoc-Math.abs(i))])==="impassable") continue;
                    //Don't allow the center tile
                    if(i===0&&loc[1]+j-(zoc-Math.abs(i))===loc[1]) continue;

                    var tileLoc = [loc[0]+i,loc[1]+j-(zoc-Math.abs(i))];
                    //Don't allow tiles that are offscreen
                    if(tileLoc[0]<0||tileLoc[1]<0) continue;
                    //Keep a reference to the ZOC tiles in each object and also here
                    var tile = this.stage.insert(new Q.ZOCTile({loc:tileLoc}));
                    grid[tile.p.loc[1]][tile.p.loc[0]] = tile;
                    obj.p.zocTiles.push(tile);
                }
            }
        },
        removeZOC:function(obj){
            if(!obj.p.zoc) return;
            var grid = this.getGrid(obj);
            obj.p.zocTiles.forEach(function(tile){
                grid[tile.p.loc[1]][tile.p.loc[0]] = false;
                tile.destroy();
            });
        },
        moveZOC:function(to,obj){
            if(!obj.p.zoc) return;
            //First, remove the current ZOC
            this.removeZOC(obj);
            //Then, create a new ZOC for this object
            this.setZOC(to,obj);
        },
        getObject:function(loc){
            return this.grid[loc[1]][loc[0]];
        },
        setObject:function(loc,obj){
            this.grid[loc[1]][loc[0]] = obj;
        },
        moveObject:function(from,to,obj){
            if(obj.p.zoc) this.moveZOC(to,obj);
            this.removeObject(from);
            this.setObject(to,obj);
        },
        removeObject:function(loc){
            this.grid[loc[1]][loc[0]] = false;
        },
        getObjectsAround:function(loc,aoe,target){
            var objects = [];
            var radius = aoe[1];
            var bounds = this.getBounds(loc,radius);
            var dir = target?target.p.dir:false;
            switch(aoe[0]){
                //Diamond shape
                case "normal":
                    for(var i=-radius;i<radius+1;i++){
                        for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                            var object = this.getObject([loc[0]+i,loc[1]+j-(radius-Math.abs(i))]);
                            if(object) objects.push(object);
                        }
                    }
                    break;
                    //Square shape
                case "corners":
                    for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                        for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                            var object = this.getObject([i,j]);
                            if(object) objects.push(object);
                        }
                    }
                    break;
                    //Straight line
                case "straight":
                    var arr = Q.getDirArray(dir);
                    for(var i=0;i<radius;i++){
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        var object = this.getObject(spot);
                        if(object) objects.push(object);
                    }
                    break;
            }
            //Don't include the middle square
            if(aoe[2]==="excludeCenter"){
                objects.forEach(function(obj,i){
                    if(obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1]){
                        objects.splice(i,1);
                    }
                });
            }
            return objects;
        },
        getBounds:function(loc,num){
            var maxTileRow = this.grid.length;
            var maxTileCol = this.grid[0].length;
            var minTile = 0;
            var rows=num*2+1,
                cols=num*2+1,
                tileStartX=loc[0]-num,
                tileStartY=loc[1]-num;
            var dif=0;

            if(loc[0]-num<minTile){
                dif = cols-(num+1+loc[0]);
                cols-=dif;
                tileStartX=num+1-cols+loc[0];
            }
            if(loc[0]+num>=maxTileCol){
                dif = cols-(maxTileCol-loc[0]+num);
                cols-=dif;
            }
            if(loc[1]-num<minTile){
                dif = rows-(num+1+loc[1]);
                rows-=dif;
                tileStartY=num+1-rows+loc[1];
            }
            if(loc[1]+num>=maxTileRow){
                dif = rows-(maxTileRow-loc[1]+num);
                rows-=dif;
            }
            if(cols+tileStartX>=maxTileCol){cols=maxTileCol-tileStartX;};
            if(rows+tileStartY>=maxTileRow){rows=maxTileRow-tileStartY;};
            return {tileStartX:tileStartX,tileStartY:tileStartY,rows:rows,cols:cols,maxTileRow:maxTileRow,maxTileCol:maxTileCol};
        }
    });

    //The battle controller holds all battle specific code.
    Q.GameObject.extend("BattleController",{
        init:function(p){
            this.stage = p.stage;
            //Any characters that have their hp reduced to 0 or under get removed all at once (they get destroyed when they're killed, but only removed here after)
            this.markedForRemoval = [];
            this.add("attackFuncs,skillFuncs");
        },
        //Run once at the start of battle
        startBattle:function(){
            this.turnOrder = this.generateTurnOrder(this.stage.lists["Character"]);
            this.allies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="ally"; 
            });
            this.enemies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="enemy"; 
            });
            Q.viewFollow(this.turnOrder[0],this.stage);
            this.startTurn();
        },
        //Eventually check custom win conditions. For now, if there are no players OR no enemies, end it.
        checkBattleOver:function(){
            if(this.allies.length===0){
                Q.clearStages();
                Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:this.stage.options.battleData.loseScene});
                return true;
            }
            if(this.enemies.length===0){
                Q.clearStages();
                Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:this.stage.options.battleData.winScene});
                return true;
            }
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            this.turnOrder[0].startTurn();
            //Hide and disable the pointer if it's not an ally's turn
            if(this.turnOrder[0].p.team!=="ally"&&Q.pointer){
                Q.pointer.hide();
                Q.pointer.off("checkInputs");
                Q.pointer.off("checkConfirm");
                Q.pointer.trigger("offTarget");
                //Follow the AI object
                Q.viewFollow(this.turnOrder[0],this.stage);
                Q.CharacterAI(this.turnOrder[0]);
            } else {
                Q.pointer.reset();
                Q.viewFollow(Q.pointer,this.stage);
                Q.pointer.p.loc = this.turnOrder[0].p.loc;
                this.setXY(Q.pointer);
                Q.pointer.checkTarget();
                //Display the menu on turn start
                Q.pointer.displayCharacterMenu();
            }
        },
        //When a character ends their turn, run this to cycle the turn order
        endTurn:function(){
            var lastTurn = this.turnOrder.shift();
            this.turnOrder.push(lastTurn);
            this.removeMarked();
            //Check if the battle is over at this point
            if(this.checkBattleOver()) return; 
            this.startTurn();
        },
        //Generates the turn order at the start of the battle
        generateTurnOrder:function(objects){
            var turnOrder = [];
            var sortForSpeed = function(){
                var topSpeed = objects[0];
                var idx = 0;
                for(var i=0;i<objects.length;i++){
                    if(objects[i].p.totalSpeed>topSpeed.p.totalSpeed){
                        topSpeed=objects[i];
                        idx = i;
                    }
                }
                turnOrder.push(topSpeed);
                objects.splice(idx,1);
                if(objects.length){
                    return sortForSpeed();
                } else {
                    return turnOrder;
                }
            };
            var tO = sortForSpeed();
            return tO;
        },
        //When an object is destroyed, mark them for removal at the end of the turn
        markForRemoval:function(obj){
            this.markedForRemoval.push(obj);
        },
        removeMarked:function(){
            if(this.markedForRemoval.length){
                for(var i=0;i<this.markedForRemoval.length;i++){
                    this.removeFromBattle(this.markedForRemoval[i]);
                    this.markedForRemoval[i].destroy();
                }
                this.markedForRemoval = [];
            }
        },
        //Removes the object from battle (at end of turn)
        removeFromBattle:function(obj){
            this.turnOrder.splice(this.turnOrder.indexOf(this.turnOrder.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            if(obj.p.team==="ally"){
                this.allies.splice(this.allies.indexOf(this.allies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            } else if(obj.p.team==="enemy"){
                this.enemies.splice(this.enemies.indexOf(this.enemies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            }
        },
        getXY:function(loc){
            return {x:loc[0]*Q.tileW+Q.tileW/2,y:loc[1]*Q.tileH+Q.tileH/2};
        },
        setXY:function(obj){
            obj.p.x = obj.p.loc[0]*Q.tileW+Q.tileW/2;
            obj.p.y = obj.p.loc[1]*Q.tileH+Q.tileH/2;
        },
        getInteractableAt:function(loc){
            var target = this.stage.lists[".interactable"].items.filter(function(obj){
                return obj.p.loc&&obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1];
            })[0];
            return target;
        },
        getTileType:function(loc){
            //Prioritize the collision objects
            var tileLayer = this.stage.lists.TileLayer[1];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                var type = tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type; 
                 return type?type:"impassable";
            }
            //If there's nothing on top, check the ground
            var tileLayer = this.stage.lists.TileLayer[0];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                 return tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type;
            }
        },
        //Compares the first obj's dir to the second object's dir.
        getDirComparison:function(obj1,obj2){
            var from = "side";
            if(obj1.p.dir==="left"){
                //if(obj.p.dir)
            }

            return from;
        },

        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(user,loc){
            var target = Q.BattleGrid.getObject(loc);
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:[target]}));
        },
        //Previews a skill
        previewDoSkill:function(user,loc,skill){
            var targets = [];
            if(skill.aoe){
                targets = Q.BattleGrid.getObjectsAround(loc,skill.aoe,user);
            } else {
                targets[0] = Q.BattleGrid.getObject(loc);
            }
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:targets,skill:skill}));
        },
        showEndTurnDirection:function(obj){
            Q.pointer.off("checkInputs");
            Q.pointer.off("checkConfirm");
            Q.pointer.snapTo(obj);
            Q.pointer.hide();
            obj.add("directionControls");
        }

    });
    Q.component("attackFuncs",{
        added:function(){
            this.text = [];
        },
        getBlow:function(attackNum,attacker,defendNum,defender){
            var result = {
                hit:false,
                crit:false,
                block:false
            };
            if(attackNum<=attacker.p.crit){
                result.crit = true;
            } else if(attackNum<=attacker.p.strike){
                result.hit = true;
            }

            if(defendNum<=defender.p.parry){
                result.block = true;
            }

            return {attacker:attacker,defender:defender,result:result};
        },
        processSkillResult:function(obj){
            var attacker = obj.attacker;
            var defender = obj.defender;
            var result = obj.result;
            var damage = 0;
            if(attacker.p.hp<=0||defender.p.hp<=0){return;};
            //Miss
            if(result.block||result.miss){
                this.text.push({func:"showMiss",obj:defender,props:[]});
            } else {
                damage = this.successfulBlow(attacker,defender,result);
            }
            return damage;
        },
        processResult:function(obj){
            var attacker = obj.attacker;
            var defender = obj.defender;
            var result = obj.result;
            if(attacker.p.hp<=0||defender.p.hp<=0){return;};
            //If the attack crit
            if(result.crit){
                //Successful Blow
                if(result.block){
                    this.successfulBlow(attacker,defender,result);
                } 
                //Critical Blow
                else {
                    this.criticalBlow(attacker,defender,result);
                }
            } 
            //If the attack hit
            else if(result.hit){
                //Glancing Blow
                if(result.block){
                    this.glancingBlow(attacker,defender,result);
                }
                //Successful Blow
                else {
                    this.successfulBlow(attacker,defender,result);
                }
            } 
            //If the attack missed
            else {
                //Counter Chance
                if(result.block){
                    this.counterChance(attacker,defender,result);
                }
                //Miss
                else {
                    this.miss(attacker,defender,result);
                }
            }
        },
        processSelfTarget:function(attacker,defender,result){
            var damage = 0;
            if(result.block){
                this.text.push({func:"showMiss",obj:defender,props:[]});
            }
            else if(result.hit||result.crit){
                damage = Math.floor(Math.random()*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow)+attacker.p.totalDamageLow)-attacker.p.armour;
                this.text.push({func:"showDamage",obj:defender,props:[damage]});
                attacker.takeDamage(damage);
                //Show an animation if the user of the skill kills themselves
                if(attacker.p.hp<=0){

                }  
            }
            return damage;
        },
        calcBlowDamage:function(attacker, defender, float) {
            return Math.floor(float*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow) + attacker.p.totalDamageLow)-defender.p.armour;
        },
        successfulBlow:function(attacker,defender,result){
            var damage = this.calcBlowDamage(attacker, defender, Math.random());
            this.text.push({func:"showDamage",obj:defender,props:[damage]});
            defender.takeDamage(damage);
            return damage;
        },
        criticalBlow:function(attacker,defender,result){
            var damage = attacker.p.totalDamageHigh;
            var rand = Math.ceil(Math.random()*100);
            this.text.push({func:"showDamage",obj:defender,props:[damage]});
            if(rand<=attacker.p.totalSpeed&&defender.p.hp>0){
                this.calcAttack(attacker,defender);
            }
            defender.takeDamage(damage);
            return damage;
        },
        glancingBlow:function(attacker,defender,result){
            var damage = Math.floor(((Math.random()*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow)+attacker.p.totalDamageLow)-defender.p.armour)/10);
            this.text.push({func:"showDamage",obj:defender,props:[damage]});
            defender.takeDamage(damage);
            return damage;
        },
        counterChance:function(attacker,defender,result){
            if(defender.p.hp<=0){return;};
            this.text.push({func:"showMiss",obj:defender,props:[]});
            //this.text.push(attacker.p.name+" tried to attack "+defender.p.name+", but");
            //this.text.push(defender.p.name+" countered "+attacker.p.name+"!");
            //TO DO: Check range for counter so defender can't attack further than their range.
            this.calcAttack(defender,attacker);
            return 0;
        },
        miss:function(attacker,defender,result){
            this.text.push({func:"showMiss",obj:defender,props:[]});
            var rand = Math.ceil(Math.random()*100);
            if(rand<=attacker.p.totalSpeed){
                //this.text.push(attacker.p.name+" got an extra attack!");
                this.calcAttack(attacker,defender);
            }
            return 0;
        },
        calcAttack:function(attacker,defender,skill){
            if(skill){
                if(attacker.p.hp<=0) return;
                var damage = 0;
                var blow = this.getBlow(Math.ceil(Math.random()*100),attacker,Math.ceil(Math.random()*100),defender);
                //If the skill is damaging
                if(skill.damageLow&&skill.damageHigh){
                    if(attacker.p.id===defender.p.id){
                        damage = this.processSelfTarget(blow.attacker,blow.defender,blow.result);
                    } else {
                        damage = this.processSkillResult(blow);
                    }
                }
                //No negative damage please :)
                if(damage<0) damage = 0;
                if(defender.p.hp-damage<=0) return;
                if(skill.effect){
                    var rand = Math.ceil(Math.random()*skill.effect.accuracy);
                    if(rand<=skill.effect.accuracy){
                        var props = skill.effect.props.slice();
                        props.push(defender,attacker);
                        //The skill func will return the feedback
                        var newText =  this.entity.skillFuncs[skill.effect.func].apply(this,props);
                        for(var i=0;i<newText.length;i++){
                            this.text.push(newText[i]);
                        }
                    }
                }

            } else {
                this.processResult(this.getBlow(Math.ceil(Math.random()*100),attacker,Math.ceil(Math.random()*100),defender));
            }
        },
        doAttack:function(attacker,targets,skill,turnEnded){
            this.text = [];
            var anim = "Attack";
            var sound = "slashing";
            attacker.p.didAction = true;
            if(skill){
                attacker.p.sp-=skill.cost;
                if(skill.anim) anim = skill.anim;
                if(skill.sound) sound = skill.sound;
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                this.calcAttack(attacker,targets[i],skill);
            }
            var t = this;
            attacker.doAttackAnim(targets,anim,sound,function(){
                for(var i=0;i<t.text.length;i++){
                    t.text[i].obj[t.text[i].func].apply(t.text[i].obj,t.text[i].props);
                }
                //The the current character died (from being counter attacked, etc...)
                if(Q.BatCon.turnOrder[0].p.hp<=0){
                    Q.BatCon.endTurn();
                    return;
                }
                //Remove any characters that have been defeated
                Q.BatCon.removeMarked();
                //If this character has now attacked and moved, end their turn.
                if(turnEnded){
                    setTimeout(function(){
                        if(Q.BatCon.turnOrder[0].p.team!=="enemy"){
                            Q.BatCon.showEndTurnDirection(Q.BatCon.turnOrder[0]);
                        } else {
                            //Set the AI's direction and end its turn
                        }
                    },500);
                }   
                //If the character has not moved yet
                else {
                    setTimeout(function(){
                        //Check if there's either no more enemies, or no more allies
                        if(Q.BatCon.checkBattleOver()) return;
                        //Get the new walk matrix since objects may have moved
                        attacker.p.walkMatrix = new Q.Graph(attacker.getMatrix("walk"));
                        //Snap the pointer to the current character
                        Q.pointer.snapTo(Q.BatCon.turnOrder[0]);
                        //If the current character is not AI
                        if(Q.BatCon.turnOrder[0].p.team!=="enemy"){
                            Q.pointer.displayCharacterMenu();
                        } else {
                            //Do whatever the AI does after attacking and can still move
                        }
                    },500);
                }
            });
        }
    });
    Q.component("skillFuncs",{
        //Damage is reduced for further targets
        pierce:function(damageLow,damageHigh,range,target,user){
            var text = [];
            console.log(damageLow,damageHigh,range,target,user)
            /*var userLoc = user.p.loc;
            var targetLoc = target.p.loc;
            //If we're attacking in the y direction
            if(targetLoc[0]-userLoc[0]===0){
                //Attacking up
                if(targetLoc[1]-userLoc[1]<0){

                } 
                //Attacking down
                else {

                }
            } 
            //If we're attacking in the x direction
            else {
                //Attacking left
                if(targetLoc[0]-userLoc[0]<0){

                } 
                //Attacking right
                else {

                }
            }

            */
            return text;

        },
        pull:function(tiles,target,user){
            var text = [];

            return text;
        },
        //pushes a target
        push:function(tiles,target,user){
            var text = [];
            var tileTo = [];
            //Pushing in the y direction
            if(user.p.loc[0]===target.p.loc[0]){
                //Pushing up
                if(user.p.loc[1]-target.p.loc[1]>0){
                    tileTo = [target.p.loc[0],target.p.loc[1]-tiles];
                } 
                //Pushing down
                else {
                    tileTo = [target.p.loc[0],target.p.loc[1]+tiles];
                }
            }
            //Pushing in the x direction
            else if(user.p.loc[1]===target.p.loc[1]){
                //Pushing left
                if(user.p.loc[0]-target.p.loc[0]>0){
                    tileTo = [target.p.loc[0]-tiles,target.p.loc[1]];
                } 
                //Pushing right
                else {
                    tileTo = [target.p.loc[0]+tiles,target.p.loc[1]];
                }
            }
            //Make sure there's no object or impassable tile where the target will be pushed to.
            //TO DO: Only push as far as the object can go without crashing into something (for 2+ tile push)
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.getTileType(tileTo)!=="impassable"){
                text.push({func:"pushed",obj:target,props:[tileTo]});
                if(tiles===1){
                    //text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tile!");
                } else {
                    //text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tiles!");
                }
            };
            return text;
        },
        changeStatus:function(status,turns,target,user){
            var text = [];
            var num = turns;
            if(Q._isArray(turns)){
                num = Math.floor(Math.random()*turns[1])+turns[0];
            }
            var curStatus = target.hasStatus(status);
            if(curStatus){
                curStatus.turns = curStatus.turns>num?num:curStatus.turns;
                //text.push(target.p.name+"'s "+status+" has been extended!");
            } else {
                text.push({func:"addStatus",obj:target,props:[status,num]});
                //text.push(target.p.name+" was given "+status+" status.");
            }
            return text;
        }
    });
};