Quintus.HUD=function(Q){
    //The grid that keeps track of all interactable objects in the battle.
    //Any time an object moves, this will be updated
    Q.GameObject.extend("BattleGrid",{
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
                    //Don't add a tile if there already is one
                    if(grid[loc[1]+j-(zoc-Math.abs(i))][loc[0]+i]) continue;
                    
                    //Keep a reference to the ZOC tiles in each object and also here
                    var tile = this.stage.insert(new Q.ZOCTile({loc:[loc[0]+i,loc[1]+j-(zoc-Math.abs(i))]}));
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
        getObjectsAround:function(loc,area){
            var objects = [];
            var radius = area[1];
            var bounds = this.getBounds(loc,radius);
            switch(area[0]){
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
            }
            //Don't include the middle square
            if(area[2]==="excludeCenter"){
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
            //Get the pointer to send a target if it is on one when this menu is created
            var pointer = Q.pointer;
            pointer.checkTarget();
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
                setTimeout(function(){
                    Q.BatCon.endTurn();
                },500);
            } else {
                Q.pointer.reset();
                Q.viewFollow(Q.pointer,this.stage);
                Q.pointer.p.loc = this.turnOrder[0].p.loc;
                this.setXY(Q.pointer);
                Q.pointer.p.target = this.turnOrder[0];
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
                this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,0]},attacker.p.name+" missed "+defender.p.name+".");
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
            if(result.block){
                this.text.push({func:"doAttackAnim",obj:attacker,props:[attacker,damage]});
            }
            else if(result.hit||result.crit){
                var damage = Math.floor(Math.random()*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow)+attacker.p.totalDamageLow)-attacker.p.armour;
                this.text.push({func:"doAttackAnim",obj:attacker,props:[attacker,damage]});
                if(attacker.p.hp<=0){
                    this.text.push(attacker.p.name+" was killed by their own attack!");
                }  
            }
            return damage;
        },
        successfulBlow:function(attacker,defender,result){
            var damage = Math.floor(Math.random()*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow)+attacker.p.totalDamageLow)-defender.p.armour;
            
            this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,damage]});if(result.hit) this.text.push(attacker.p.name+" hit "+defender.p.name+".");
            if(result.crit) this.text.push(attacker.p.name+" went critical, but "+defender.p.name+" defended well!");
            if(defender.p.hp<=0){
                this.text.push(defender.p.name+" was defeated.");
            }  
            return damage;
        },
        criticalBlow:function(attacker,defender,result){
            var damage = attacker.p.totalDamageHigh;
            var rand = Math.ceil(Math.random()*100);
            this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,damage]});
            this.text.push(attacker.p.name+" hit a critical blow against "+defender.p.name+".");
            if(defender.p.hp<=0){
                this.text.push(defender.p.name+" was defeated.");
            }  
            else if(rand<=attacker.p.totalSpeed){
                this.text.push(attacker.p.name+" was so fast, they got another attack in!");
                this.calcAttack(attacker,defender);
            }
            return damage;
        },
        glancingBlow:function(attacker,defender,result){
            var damage = Math.floor(((Math.random()*(attacker.p.totalDamageHigh-attacker.p.totalDamageLow)+attacker.p.totalDamageLow)-defender.p.armour)/10);
            
            this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,damage]});
            this.text.push(attacker.p.name+" hit a glancing blow against "+defender.p.name+".");
            if(defender.p.hp<=0){
                this.text.push(defender.p.name+" was defeated.");
            }
            return damage;
        },
        counterChance:function(attacker,defender,result){
            if(defender.p.hp<=0){return;};
            this.text.push(attacker.p.name+" tried to attack "+defender.p.name+", but");
            this.text.push(defender.p.name+" countered "+attacker.p.name+"!");
            //TO DO: Check range for counter so defender can't attack further than their range.
            this.calcAttack(defender,attacker);
            return 0;
        },
        miss:function(attacker,defender,result){
            this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,0]});
            var rand = Math.ceil(Math.random()*100);
            if(rand<=attacker.p.totalSpeed){
                this.text.push(attacker.p.name+" got an extra attack!");
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
            attacker.p.didAction = true;
            if(skill){
                attacker.p.sp-=skill.cost;
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                this.calcAttack(attacker,targets[i],skill);
            }
            if(turnEnded){
                Q.stage(2).insert(new Q.BattleTextBox({text:this.text,callback:function(){Q.BatCon.endTurn();}}));
            } else {
                Q.stage(2).insert(new Q.BattleTextBox({text:this.text,callback:function(){
                    if(Q.BatCon.turnOrder[0].p.hp<=0){
                        Q.BatCon.endTurn();
                        return;
                    }
                    //Remove any characters that have been defeated
                    Q.BatCon.removeMarked();
                    //Check if there's either no more enemies, or no more allies
                    if(Q.BatCon.checkBattleOver()) return;
                    //Get the new walk matrix since objects may have moved
                    attacker.p.walkMatrix = new Q.Graph(attacker.getMatrix("walk"));
                    //Set the menu to the start
                    Q.stage(2).ActionMenu.p.menuNum = 0;
                    //Display the menu
                    Q.stage(2).ActionMenu.displayMenu();
                    //Unhide the action menu
                    Q.stage(2).ActionMenu.show();
                    //Enable inputs on the menu
                    Q.stage(2).ActionMenu.on("step","checkInputs");
                    //Snap the pointer to the current character
                    Q.pointer.snapTo(Q.BatCon.turnOrder[0]);
                }}));
            }
        }
    });
    Q.component("skillFuncs",{
        //This will only be called on the enemy that has been selected.
        //Calculate any affected units here based on the difference between the user and target's loc + range
        pierce:function(damageLow,damageHigh,range,target,user){
            var text = [];
            
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
                //Pushing to the up
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
                    text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tile!");
                } else {
                    text.push(user.p.name+" pushed "+target.p.name+" "+tiles+" tiles!");
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
                text.push(target.p.name+"'s "+status+" has been extended!");
            } else {
                text.push({func:"addStatus",obj:target,props:[status,num]});
                text.push(target.p.name+" was given "+status+" status.");
            }
            return text;
        }
    });
    Q.UI.Container.extend("TerrainHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:250,h:95,
                type:Q.SPRITE_NONE,
                fill:"blue",
                opacity:0.5
            });
            this.on("inserted");
        },
        inserted:function(){
            var info = ["Terrain","Move","Buffs"];
            this.p.stats = [];
            for(var i=0;i<info.length;i++){
                this.insert(new Q.HUDText({label:info[i],x:10,y:10+i*25}));
                this.p.stats.push(this.insert(new Q.HUDText({x:this.p.w-10,y:10+i*25,align:"right"})));
            }
            Q.pointer.on("onTerrain",this,"displayTerrain");
            Q.pointer.getTerrain();
            
        },
        displayTerrain:function(type){
            var terrain = Q.state.get("tileTypes")[type];
            var stats = this.p.stats;
            var labels = [
                terrain.name,
                ""+terrain.move,
                ""+terrain.buff
            ];
            for(var i=0;i<stats.length;i++){
                stats[i].p.label = labels[i];
            }
        }
    });
    Q.UI.Text.extend("HUDText",{
        init:function(p){
            this._super(p,{
                label:"",
                align:'left',
                size:20
            });
        }
    });
    Q.UI.Container.extend("StatsHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:220,h:320,
                type:Q.SPRITE_NONE,
                fill:"blue",
                opacity:0.5
            });
            this.p.x=Q.width-this.p.w;
            this.on("inserted");
        },
        inserted:function(){
            var info = ["Class","Level","Move","HP","SP","Damage","Armour","Speed","Strike","Parry","Critical","Range"];
            this.p.stats = [];
            for(var i=0;i<info.length;i++){
                this.insert(new Q.HUDText({label:info[i],x:10,y:10+i*25}));
                this.p.stats.push(this.insert(new Q.HUDText({x:this.p.w-10,y:10+i*25,align:"right"})));
            }
            Q.pointer.on("onTarget",this,"displayTarget");
            Q.pointer.on("offTarget",this,"hideHUD");
        },
        displayTarget:function(obj){
            this.show();
            if(obj.p.team==="ally") this.p.fill = "blue";
            if(obj.p.team==="enemy") this.p.fill = "crimson";
            var stats = this.p.stats;
            var labels = [
                ""+obj.p.className,
                ""+obj.p.level,
                ""+obj.p.move,
                ""+obj.p.hp+"/"+obj.p.maxHp,
                ""+obj.p.sp+"/"+obj.p.maxSp,
                ""+obj.p.totalDamageLow+"-"+obj.p.totalDamageHigh,
                ""+obj.p.armour,
                ""+obj.p.totalSpeed,
                ""+obj.p.strike,
                ""+obj.p.parry,
                ""+obj.p.criticalChance,
                ""+obj.p.range
            ];
            for(var i=0;i<stats.length;i++){
                stats[i].p.label = labels[i];
            }
            
        },
        hideHUD:function(){
            this.hide();
        }
    });
    Q.component("AOEGuide",{
        added:function(){
            this.getAOERange(this.entity.p.loc,this.entity.p.skill.aoe);
        },
        moveTiles:function(to){
            this.aoeTiles.forEach(function(tile){
                tile.p.loc = [tile.p.relative[0]+to[0],tile.p.relative[1]+to[1]];
                Q.BatCon.setXY(tile);
            });
        },
        destroyGuide:function(){
            var stage = this.entity.stage;
            this.aoeTiles.forEach(function(tile){
                stage.remove(tile);
            });
            this.entity.p.skill=false;
            this.entity.del("AOEGuide");
        },
        getAOERange:function(loc,aoe){
            var area = aoe[0];
            var radius = aoe[1];
            var special = aoe[2];
            var aoeTiles = this.aoeTiles =[];
            var bounds = Q.BattleGrid.getBounds(loc,radius);
            switch(area){
                //Diamond shape
                case "normal":
                    for(var i=-radius;i<radius+1;i++){
                        for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                            aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:[loc[0]+i,loc[1]+j-(radius-Math.abs(i))],relative:[i,j-(radius-Math.abs(i))]})));
                        }
                    }
                    break;
                    //Square shape
                case "corners":
                    for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                        for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                            aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:[i,j],relative:[loc[0]-i,loc[1]-j]})));
                        }
                    }
                    break;
            }
            //Don't include the middle square
            if(special==="excludeCenter"){
                aoeTiles.forEach(function(obj,i){
                    if(obj.p.loc[0]===loc[0]&&obj.p.loc[1]===loc[1]){
                        aoeTiles[i].destroy();
                        aoeTiles.splice(i,1);
                    }
                });
            }
        }
    });
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
        addControls:function(){
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
            if(this.has("AOEGuide")) this.AOEGuide.moveTiles(this.p.loc);
            this.trigger("checkInputs");
            this.trigger("checkConfirm");
        }
    });
    
    Q.UI.Container.extend("ActionMenu",{
        init: function(p) {
            this._super(p, {
                w:200,h:300,
                cx:0,cy:0,
                fill:"blue",
                opacity:0.5,
                menuNum:0,
                titles:["ACTIONS","ACTIONS","SKILLS"],
                options:[["Move","Attack","Skill","Item","Status","End Turn"],["Status"],[]],
                funcs:[["loadMove","loadAttack","loadSkillsMenu","loadItems","loadStatus","loadEndTurn"],["loadStatus"],[]],
                conts:[]
            });
            this.p.x = Q.width-this.p.w;
            this.p.y = Q.height-this.p.h;
            this.on("inserted","displayMenu");
            this.on("step",this,"checkInputs");
            if(!this.p.active){
                this.p.menuNum=1;
            } else {
                var target = this.p.target;
                var opts = [];
                var funcs = [];
                var skills = [];
                //Set possible skills
                var rh = target.p.equipment.righthand;
                var lh = target.p.equipment.lefthand;
                if(rh.equipmentType){
                    var keys = Object.keys(target.p.skills[rh.equipmentType]);
                    keys.forEach(function(key){
                        opts.push(target.p.skills[rh.equipmentType][key].name);
                        funcs.push("loadSkill");
                        skills.push(target.p.skills[rh.equipmentType][key]);
                    });
                }
                if(lh.equipmentType){
                    var keys = Object.keys(target.p.skills[lh.equipmentType]);
                    keys.forEach(function(key){
                        opts.push(target.p.skills[lh.equipmentType][key].name);
                        funcs.push("loadSkill");
                        skills.push(target.p.skills[lh.equipmentType][key]);
                    });
                }
                this.p.options[2]=opts;
                this.p.funcs[2]=funcs;
                this.p.skills=skills;
            }
        },
        cycle:function(to){
            this.p.conts[this.p.selected].p.fill="red";
            this.p.selected=to;
            this.p.conts[this.p.selected].p.fill="green";
            this.checkGray();
        },
        checkGray:function(){
            if(this.p.menuNum===0){
                if(this.p.target.p.didMove){this.p.conts[0].p.fill="gray";};
                if(this.p.target.p.didAction){
                    this.p.conts[1].p.fill="gray";
                    this.p.conts[2].p.fill="gray";
                    this.p.conts[3].p.fill="gray";
                };
            }
        },
        destroyConts:function(){
            this.p.conts.forEach(function(cont){
                cont.destroy();
            });
        },
        displayMenu:function(){
            if(this.p.title) this.p.title.destroy();
            if(this.p.conts.length) this.destroyConts();
            this.p.title = this.insert(new Q.UI.Text({x:this.p.w/2,y:15,label:this.p.titles[this.p.menuNum],size:20}));
            var options = this.p.options[this.p.menuNum];
            var funcs = this.p.funcs[this.p.menuNum];
            this.p.selected = 0;
            if(this.p.target.p.didMove&&this.p.menuNum===0) this.p.selected++;
            this.p.conts = [];
            for(var i=0;i<options.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:50+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0,func:funcs[i]}));
                var name = cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:options[i],cx:0,size:16}));
                if(this.p.menuNum===2){
                    name.p.x = 4;
                    name.p.align="left";
                    cont.insert(new Q.UI.Text({x:cont.p.w-4,y:12,label:""+this.p.skills[i].cost,cx:0,align:"right",size:16}));
                }
                this.p.conts.push(cont);
            }
            this.cycle(this.p.selected);
        },
        checkInBoundsUp:function(to){
            if(this.p.selected===0||to<0){
                to=this.p.options[this.p.menuNum].length-1;
            }
            return to;
        },
        checkInBoundsDown:function(to){
            if(this.p.selected>=this.p.options[this.p.menuNum].length-1){
                this.p.selected=this.p.options[this.p.menuNum].length-1;to=0;
            };
            return to;
        },
        checkInputs:function(){
            if(Q.inputs['up']){
                var to=this.checkInBoundsUp(this.p.selected-1);
                while(this.p.conts[to]&&this.p.conts[to].p.fill==="gray"){to--;}
                to=this.checkInBoundsUp(to);
                this.cycle(to);
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                var to=this.checkInBoundsDown(this.p.selected+1);
                while(this.p.conts[to]&&this.p.conts[to].p.fill==="gray"){to++;}
                to=this.checkInBoundsDown(to);
                this.cycle(to);
                Q.inputs['down']=false;
            }
            if(Q.inputs['confirm']){
                this[this.p.conts[this.p.selected].p.func]();
                Q.inputs['confirm']=false;
            }
            if(Q.inputs['esc']){
                //If we're in the skillsmenu
                if(this.p.menuNum===2){
                    this.p.menuNum=0;
                    this.displayMenu();
                } else {
                    Q.pointer.addControls();
                    Q.pointer.on("checkConfirm");
                    //Make sure the characterMenu is gone
                    Q.clearStage(2);
                }
                Q.inputs['esc']=false;
            }
        },
        //Shows the move grid and zoc
        loadMove:function(){
            Q.BattleGrid.showZOC(this.p.team==="enemy"?"ally":"enemy");
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({target:this.p.target,kind:"walk"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Shows the attack grid
        loadAttack:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({target:this.p.target,kind:"attack"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Loads the special skills menu
        loadSkillsMenu:function(){
            this.p.menuNum=2;
            this.displayMenu();
        },
        //Show the attack grid for the skill
        loadSkill:function(){
            var skill = this.p.skills[this.p.selected];
            if(this.p.target.p.sp-skill.cost<0) return;
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({target:this.p.target,kind:"skill",skill:skill}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
            if(!skill.aoe){
                skill.aoe = ["normal",0];
            }
            Q.pointer.p.skill = skill;
            Q.pointer.add("AOEGuide");
        },
        //Loads the items menu
        loadItems:function(){
            
        },
        //Loads the large menu that displays all stats for this character
        loadStatus:function(){
            
        },
        //Loads the directional arrows so the user can decide which direction to face
        loadEndTurn:function(){
            Q.clearStage(2);
            //For now, end the turn without giving direction.
            Q.BatCon.endTurn();
            //this.off("step");
            //this.hide();
        }
    });
    //Contains the character's full information
    Q.UI.Container.extend("StatsMenu",{
        init: function(p) {
            this._super(p, {
                w:Q.width/2,h:Q.height/2,
                cx:0,cy:0,
                fill:"black",
                opacity:0.5
            });
            this.p.x = Q.width/2-this.p.w/2;
            this.p.y = Q.height/2-this.p.h/2;
        }
    });
    
    Q.UI.Container.extend("RangeGrid",{
        init:function(p){
            this._super(p,{
                moveGuide:[]
            });
            this.on("inserted");
            this.on("step");
        },
        inserted:function(){
            var target = this.p.target;
            //Insert all of the squares
            switch(this.p.kind){
                case "walk":
                    //Loop through the target's move the get the move range
                    this.getTileRange(target.p.loc,target.p.move,target.p["walkMatrix"]);
                    break;
                case "attack":
                    this.getTileRange(target.p.loc,target.p.range,target.p["attackMatrix"]);
                    break;
                //Used for skills that have a weird range (eg 'T' shape)
                case "skill":
                    var skill = this.p.skill;
                    switch(skill.range[0]){
                        case "self":
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[target.p.loc[0],target.p.loc[1]]})));
                            break;
                        case "normal":
                            this.getTileRange(target.p.loc,skill.range[1],target.p["attackMatrix"]);
                            break;
                        //No diagonal attack
                        case "straight":
                            this.getTileRange(target.p.loc,skill.range[1],target.p["attackMatrix"],skill.range[0]);
                            break;
                    }
                    break;
            }
        },
        fullDestroy:function(){
            this.p.moveGuide.forEach(function(itm){
                itm.destroy();
            });
            this.destroy();
        },
        process:{
            straight:function(tiles,center){
                for(var i=0;i<tiles.length;i++){
                    if(tiles[i].x!==center[0]&&tiles[i].y!==center[1]){
                        tiles.splice(i,1);
                        i--;
                    }
                }
                return tiles;
            }
        },
        //Gets the fastest path to a certain location 
        getPath:function(loc,toLoc,graph){
            var start = graph.grid[loc[0]][loc[1]];
            var end = graph.grid[toLoc[0]][toLoc[1]];
            return Q.astar.search(graph, start, end);
        },
        //TODO: Don't use maxScore for movement grid ZOC costs 1000. 
        //After getting the paths, if the path cost is greater than 1000, make sure that we haven't been through an impassable or two ZOC.
        getTileRange:function(loc,stat,graph,special){
            var bounds = Q.BattleGrid.getBounds(loc,stat);
            var tiles=[];
            //Get all possible move locations that are within the bounds
            for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                    if(graph.grid[i][j].weight<10000){
                        tiles.push(graph.grid[i][j]);
                    }
                }
            }
            if(special){
                tiles = this.process[special](tiles,loc);
            }
            //If there is at least one place to move
            if(tiles.length){
                //Loop through the possible tiles
                for(var i=0;i<tiles.length;i++){
                    //Get the path and then slice it if it goes across enemy ZOC
                    var path = this.getPath(loc,[tiles[i].x,tiles[i].y],graph);
                    var pathCost = 0;
                    for(var j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=stat&&pathCost<=stat+1000){
                        //If the path is normal
                        if(pathCost<=stat){
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[tiles[i].x,tiles[i].y]})));
                        } 
                        //If the path includes a single ZOC tile
                        else if(pathCost>=1000) {
                            //Only include this path if the last tile is the ZOC tile
                            if(path[path.length-1].weight===1000){
                                this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[tiles[i].x,tiles[i].y]})));
                            }
                        }
                    }
                }
            //If there's nowhere to move
            } else {
                
            }
        },
        //Checks if we've selected a tile
        checkValidPointerLoc:function(){
            var loc = Q.pointer.p.loc;
            var valid = false;
            this.p.moveGuide.forEach(function(tile){
                if(tile.p.loc[0]===loc[0]&&tile.p.loc[1]===loc[1]){
                    valid=true;
                }
            });
            if(valid) return true;
            return false;
        },
        step:function(){
            if(Q.inputs['confirm']){
                if(this.checkValidPointerLoc()){
                    var stage = this.p.target.stage;
                    switch(this.p.kind){
                        case "walk":
                            if(Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                return;                            
                            }
                            //Hide the zoc
                            Q.BattleGrid.hideZOC(this.p.target.p.team==="enemy"?"ally":"enemy");
                            //Make the character move to the spot
                            this.p.target.moveAlong(this.getPath(this.p.target.p.loc,Q.pointer.p.loc,this.p.target.p[this.p.kind+"Matrix"]));
                            break;
                        case "attack":
                            //Make sure there's a target there
                            if(Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                this.p.target.previewAttackTarget(Q.pointer.p.loc);
                                Q.pointer.off("checkInputs");
                                Q.pointer.off("checkConfirm");
                            } else {return;}
                            break;
                        case "skill":
                            //Make sure there's a target there
                            if(Q.BattleGrid.getObjectsAround(Q.pointer.p.loc,this.p.skill.aoe?this.p.skill.aoe:["normal",0])){
                                this.p.target.previewDoSkill(Q.pointer.p.loc,this.p.skill);
                                Q.pointer.off("checkInputs");
                                Q.pointer.off("checkConfirm");
                            } else {return;}
                            
                            break;
                    }
                    this.fullDestroy();
                    if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                }
                Q.inputs['confirm']=false;
            } else if(Q.inputs['esc']){
                //Hide the zoc
                Q.BattleGrid.hideZOC(this.p.target.p.team==="enemy"?"ally":"enemy");
                Q.stage(2).ActionMenu.show();
                Q.stage(2).ActionMenu.on("step","checkInputs");
                Q.pointer.snapTo(this.p.target);
                Q.pointer.off("checkInputs");
                Q.pointer.off("checkConfirm");
                this.fullDestroy();
                if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                
                Q.inputs['esc']=false;
            }
        } 
        
    });
    Q.Sprite.extend("RangeTile",{
        init:function(p){
            this._super(p,{
                sheet:"range_tile",
                frame:0,
                opacity:0.3,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.Sprite.extend("AOETile",{
        init:function(p){
            this._super(p,{
                sheet:"aoe_tile",
                frame:0,
                opacity:0.8,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.Sprite.extend("ZOCTile",{
        init:function(p){
            this._super(p,{
                sheet:"zoc_tile",
                frame:0,
                opacity:0.8,
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE,
                hidden:true
            });
            Q.BatCon.setXY(this);
        }
    });
    Q.UI.Container.extend("AttackPreviewBox",{
        init:function(p){
            this._super(p,{
                opacity:0.3,
                cx:0,cy:0,
                w:400,h:200,
                type:Q.SPRITE_NONE,
                fill:"blue"
            });
            this.p.x = Q.width/2-this.p.w/2;
            this.p.y = 0;
            this.on("inserted");
            this.on("step",this,"checkInputs");
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                var attacker = this.p.attacker;
                var targets = this.p.targets;
                var skill = this.p.skill;
                var turnEnded = attacker.p.didMove?true:false;
                Q.BatCon.attackFuncs.doAttack(attacker,targets,skill,turnEnded);
                this.off("step",this,"checkInputs");
                this.destroy();
                Q.inputs['confirm']=false;
            } else if(Q.inputs['esc']){
                this.destroy();
                if(this.p.skill){
                if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
                    this.stage.ActionMenu.loadSkill();
                } else {
                    this.stage.ActionMenu.loadAttack();
                }
                Q.inputs['esc']=false;
            }
        },
        inserted:function(){
            //Get the comparison between the two char's directions
            this.p.attackingFrom = Q.BatCon.getDirComparison(this.p.attacker,this.p.targets[0]);
            //If the attack is a skill, display different information
            if(this.p.skill){
                if(this.p.skill.damageLow&&this.p.skill.damageHigh){
                    var atkPercent = this.p.attacker.p.strike;
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:10,label:atkPercent+"% chance of hitting.",size:12,cx:0,cy:0,align:"center"}));
                    var missChance = "Pretty high, I guess";
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:30,label:missChance+"% chance of missing.",size:12,cx:0,cy:0,align:"center"}));
                    var damageLow = this.p.attacker.p.totalDamageLow+this.p.skill.damageLow-this.p.targets[0].p.armour;
                    var damageHigh = this.p.attacker.p.totalDamageHigh+this.p.skill.damageHigh-this.p.targets[0].p.armour;
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:50,label:"It'll do between "+damageLow+" and "+damageHigh+" damage, I reckon.",size:12,cx:0,cy:0,align:"center"}));
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:70,label:"The skill's name is "+this.p.skill.name+".",size:12,cx:0,cy:0,align:"center"}));
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:90,label:"It is targetting "+this.p.targets.length+" targets.",size:12,cx:0,cy:0,align:"center"}));
                }
                //The the skill has an effect, display some info on it
                if(this.p.skill.effect){
                    this.insert(new Q.UI.Text({x:10+this.p.w/2,y:110,label:"This skill has a special effect. "+"The function is "+this.p.skill.effect.func,size:12,cx:0,cy:0,align:"center"}));
                }
            } else {
                //This accuracy will need to be thought out more thoroughly.
                var atkPercent = this.p.attacker.p.strike;
                this.insert(new Q.UI.Text({x:10+this.p.w/2,y:10,label:atkPercent+"% chance of hitting.",size:12,cx:0,cy:0,align:"center"}));
                var missChance = "Pretty high, I guess";
                this.insert(new Q.UI.Text({x:10+this.p.w/2,y:30,label:missChance+"% chance of missing.",size:12,cx:0,cy:0,align:"center"}));
                var damageLow = this.p.attacker.p.totalDamageLow-this.p.targets[0].p.armour;
                var damageHigh = this.p.attacker.p.totalDamageHigh-this.p.targets[0].p.armour;
                this.insert(new Q.UI.Text({x:10+this.p.w/2,y:50,label:"It'll do between "+damageLow+" and "+damageHigh+" damage, I reckon.",size:12,cx:0,cy:0,align:"center"}));
            }
            this.insert(new Q.UI.Text({x:10+this.p.w/2,y:this.p.h-30,label:"Press enter to DO IT.",size:12,cx:0,cy:0,align:"center"}));
        }
    });
    //The in-battle dialogue equivalent
    Q.Sprite.extend("BattleTextBox",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                asset:"ui/text_box.png",
                textIndex:-1
            });
            this.p.y=Q.height-this.p.h;
            this.on("inserted");
            this.on("step",this,"checkInputs");
        },
        nextText:function(){
            this.p.textIndex++;
            while(Q._isObject(this.p.text[this.p.textIndex])){
                var text = this.p.text[this.p.textIndex];
                text.obj[text.func].apply(text.obj,text.props);
                this.p.textIndex++;
            }
            if(this.p.textIndex>=this.p.text.length){this.destroy();this.p.dialogueArea.destroy();this.p.callback();return;};
            this.p.dialogueText.setNewText(this.p.text[this.p.textIndex]);
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(this.p.dialogueText.interact()){
                    this.nextText();
                };
                Q.inputs['confirm']=false;
            }
        },
        inserted:function(){
            this.p.dialogueArea = this.stage.insert(new Q.DialogueArea({w:Q.width-20}));
            this.p.dialogueText = this.p.dialogueArea.insert(new Q.Dialogue({text:this.p.text[this.p.textIndex], align: 'left', x: 10}));
            this.nextText();
        }
    });
    
    //The status icon displays the current status of the character. There can be multiple status's that cycle through.
    Q.Sprite.extend("StatusIcon",{
        init:function(p){
            this._super(p, {
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE,
                z:99,
                status:[],
                statusNum:0,
                time:0,
                timeCycle:60,
                sheet:"ui_blind",
                frame:0
            });
            this.setPos();
            this.displayStatus();
        },
        setPos:function(){
            this.p.loc = [this.p.char.p.loc[0],this.p.char.p.loc[1]-1];
            Q.BatCon.setXY(this);
        },
        step:function(){
            var p = this.p;
            if(p.status.length<2) return;
            p.time++;
            if(p.time>p.timeCycle){
                this.changeStatus();
                p.time=0;
            }
        },
        displayStatus:function(){
            this.p.sheet = "ui_"+this.p.status[this.p.statusNum];
        },
        changeStatus:function(){
            var p = this.p;
            var cur = p.statusNum;
            var max = p.status.length;
            cur+1>=max?cur=0:cur++;
            p.statusNum = cur;
            this.displayStatus();
        },
        removeStatus:function(status){
            for(var i=0;i<this.p.status.length;i++){
                if(status===this.p.status[i]){
                    this.p.status.splice(i,1);
                }
            }
            if(!this.p.status.length){
                this.p.char.p.statusDisplay = false;
                this.destroy();
            }
        },
        reveal:function(){
            this.setPos();
            this.show();
        }
    });
    
    Q.Sprite.extend("DynamicNumber", {
        init:function(p){
            //For bigger boxes, set the w and h values when creating
            //12 is the default size since it's used for the damage box
            this._super(p, {
                color: "black",
                w: Q.tileW,
                h: Q.tileH,
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE,
                opacity:1,
                size:12,
                text:"",
                fill:"white",
                z:100
            });
            Q.BatCon.setXY(this);
            this.add("tween");
            this.animate({ y:this.p.y-Q.tileH, opacity: 0 }, 2, Q.Easing.Quadratic.Out, { callback: function() { this.destroy(); }});
        },


        draw: function(ctx){
            ctx.fillStyle = this.p.color;
            ctx.font      = 'Bold 15px Arial';
            ctx.fillText(this.p.text, -this.p.w/2,0);
        }
    });
};