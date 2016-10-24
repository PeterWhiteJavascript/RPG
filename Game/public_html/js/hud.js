Quintus.HUD=function(Q){
    //The grid that keeps track of all interactable objects in the battle.
    //Any time an object moves, this will be updated
    Q.GameObject.extend("BattleGrid",{
        init:function(p){
            this.stage = p.stage;
            this.grid = [];
            var tilesX = p.stage.mapWidth;
            var tilesY = p.stage.mapHeight;
            for(var i=0;i<tilesY;i++){
                this.grid[i]=[];
                for(var j=0;j<tilesX;j++){
                    this.grid[i][j]=false;
                }
            }
            //When an item is inserted into this stage, check if it's an interactable and add it to the grid if it is
            this.stage.on("inserted",this,function(itm){
                if(itm.has("interactable")){
                    this.setObject(itm.p.loc,itm);
                }
            });
        },
        getObject:function(loc){
            return this.grid[loc[1]][loc[0]];
        },
        setObject:function(loc,obj){
            this.grid[loc[1]][loc[0]] = obj;
        },
        moveObject:function(from,to,obj){
            this.removeObject(from);
            this.setObject(to,obj);
        },
        removeObject:function(loc){
            this.grid[loc[1]][loc[0]] = false;
        }
    });
    //The battle controller holds all battle specific code.
    Q.GameObject.extend("BattleController",{
        init:function(p){
            this.stage = p.stage;
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
            var pointer = this.stage.pointer;
            pointer.checkTarget();
            this.startTurn();
        },
        //Eventuall check custom win conditions. For now, if there are no players OR no enemies, end it.
        checkBattleOver:function(){
            if(this.allies.length===0){
                Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:this.stage.options.battleData.winScene});
                Q.input.off("esc",this.stage);
                Q.input.off("confirm",this.stage);
                //Make sure the HUD is gone
                Q.clearStage(3);
                return;
            }
            if(this.enemies.length===0){
                Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:this.stage.options.battleData.loseScene});
                Q.input.off("esc",this.stage);
                Q.input.off("confirm",this.stage);
                //Make sure the HUD is gone
                Q.clearStage(3);
                
                return;
            }
            this.startTurn();
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            this.turnOrder[0].startTurn();
        },
        //When a character ends their turn, run this to cycle the turn order
        endTurn:function(){
            var lastTurn = this.turnOrder.shift();
            this.turnOrder.push(lastTurn);
            //Remove the pointer if it's not an ally's turn
            if(this.turnOrder[0].p.team!=="ally"&&this.stage.pointer){
                this.stage.pointer.destroy();
                this.stage.pointer = false;
                //Follow the AI object
                Q.viewFollow(this.turnOrder[0],this.stage);
            } else {
                if(!this.stage.pointer){
                    this.stage.pointer = this.stage.insert(new Q.Pointer({loc:this.turnOrder[0].p.loc}));
                    Q.viewFollow(this.stage.pointer,this.stage);
                } else {
                    this.stage.pointer.p.loc = this.turnOrder[0].p.loc;
                    this.setXY(this.stage.pointer);
                }
                this.stage.pointer.checkTarget();
            }
            //Check if the battle is over at this point
            this.checkBattleOver();
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
            this.stage.options.pointer.on("onTerrain",this,"displayTerrain");
            this.stage.options.pointer.getTerrain();
            
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
            this.stage.options.pointer.on("onTarget",this,"displayTarget");
            this.stage.options.pointer.on("offTarget",this,"hideHUD");
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
                ""+obj.p.hp,
                ""+obj.p.sp,
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
            this.on("checkInputs");
            this.on("checkConfirm");
        },
        inserted:function(){
            this.stage.BatCon.setXY(this);
            Q._generatePoints(this,true);
        },
        getTerrain:function(){
            var type = this.stage.BatCon.getTileType(this.p.loc);
            this.trigger("onTerrain",type);
        },
        reset:function(){
            this.stage.BatCon.setXY(this);
            this.checkTarget();
            this.addControls();
            this.on("checkConfirm");
        },
        checkTarget:function(){
            var p = this.p;
            p.target=this.stage.BattleGrid.getObject(p.loc);
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
            Q.stageScene("characterMenu",2,{target:this.p.target,currentTurn:this.stage.BatCon.turnOrder[0],pointer:this});
            this.off("checkInputs");
            this.off("checkConfirm");
        },
        checkConfirm:function(){
            var input = Q.inputs;
            //If we're trying to load a menu
            if(input['confirm']){
                this.displayCharacterMenu();
                input['confirm']=false;
                return;
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
                opacity:0.5
            });
            this.p.x = Q.width-this.p.w;
            this.p.y = Q.height-this.p.h;
            this.on("inserted");
            this.on("step",this,"checkInputs");
        },
        cycle:function(to){
            this.p.conts[this.p.selected].p.fill="red";
            this.p.selected=to;
            this.p.conts[this.p.selected].p.fill="green";
        },
        inserted:function(){
            this.insert(new Q.UI.Text({x:this.p.w/2,y:15,label:"ACTIONS",size:30}));
            var options;
            var funcs;
            if(this.p.active){
                options = ["Move","Attack","Skill","Item","Status","End Turn"];
                funcs = ["loadMove","loadAttack","loadSkills","loadItems","loadStatus","loadEndTurn"];
            } else {
                options = ["Status"];
                funcs = ["loadStatus"];
            }
            this.p.selected = 0;
            this.p.conts = [];
            for(var i=0;i<options.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:50+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"red",radius:0,func:funcs[i]}));
                cont.insert(new Q.UI.Text({x:cont.p.w/2,y:8,label:options[i],cx:0}));
                this.p.conts.push(cont);
            }
            this.cycle(this.p.selected);
        },
        checkInputs:function(){
            if(Q.inputs['up']){
                var to=this.p.selected-1;
                if(this.p.selected===0){to=this.p.conts.length-1;}
                this.cycle(to);
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                var to=this.p.selected+1;
                if(this.p.selected===this.p.conts.length-1){to=0;}
                this.cycle(to);
                Q.inputs['down']=false;
            }
            if(Q.inputs['confirm']){
                this[this.p.conts[this.p.selected].p.func]();
                Q.inputs['confirm']=false;
            }
            if(Q.inputs['esc']){
                this.stage.options.pointer.addControls();
                this.stage.options.pointer.on("checkConfirm");
                //Make sure the characterMenu is gone
                Q.clearStage(2);
                Q.inputs['esc']=false;
            }
        },
        //Shows the move grid
        loadMove:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({target:this.p.target,kind:"walk"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            this.stage.options.pointer.addControls();
        },
        //Shows the attack grid
        loadAttack:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({target:this.p.target,kind:"attack"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            this.stage.options.pointer.addControls();
        },
        //Loads the special skills menu
        loadSkills:function(){
            
        },
        //Loads the items menu
        loadItems:function(){
            
        },
        //Loads the large menu that displays all stats for this character
        loadStatus:function(){
            
        },
        //Loads the directional arrows so the user can decide which direction to face
        loadEndTurn:function(){
            //For now, end the turn without giving direction.
            this.stage.options.pointer.stage.BatCon.endTurn();
            Q.clearStage(2);
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
                guide:[]
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
                    this.getTileRange(target.p.loc,target.p.move,target.p[this.p.kind+"Matrix"]);
                    break;
                case "attack":
                    this.getTileRange(target.p.loc,target.p.range,target.p[this.p.kind+"Matrix"]);
                    break;
                //Used for skills that have a weird range (eg 'T' shape)
                case "custom":
                    
                    break;
                    
            }
        },
        fullDestroy:function(){
            this.p.guide.forEach(function(itm){
                itm.destroy();
            });
            this.destroy();
        },
        //Gets the fastest path to a certain location
        //loc   - the current location of the object that is moving
        //toLoc - [x,y]
        //prop  - search using a maximum cost (movement uses maximum cost during battles)
        //score - if prop:'maxScore' is set, this the maxScore. 
        getPath:function(loc,toLoc,prop,score,graph){
            //Set up a graph for this movement
            var start = graph.grid[loc[0]][loc[1]];
            var end = graph.grid[toLoc[0]][toLoc[1]];
            var result;
            if(prop==="maxScore"){
                result = Q.astar.search(graph, start, end,{maxScore:score});
            } else {
                result = Q.astar.search(graph, start, end);
            }
            return result;
        },
        getTileRange:function(loc,stat,graph){
            var minTile = 0;
            var maxTileRow = graph.grid[0].length;
            var maxTileCol = graph.grid.length;
            var rows=stat*2+1,
                cols=stat*2+1,
                tileStartX=loc[0]-stat,
                tileStartY=loc[1]-stat;
            var dif=0;

            if(loc[0]-stat<minTile){
                dif = cols-(stat+1+loc[0]);
                cols-=dif;
                tileStartX=stat+1-cols+loc[0];
            }
            if(loc[0]+stat>=maxTileCol){
                dif = cols-(maxTileCol-loc[0]+stat);
                cols-=dif;
            }
            if(loc[1]-stat<minTile){
                dif = rows-(stat+1+loc[1]);
                rows-=dif;
                tileStartY=stat+1-rows+loc[1];
            }
            if(loc[1]+stat>=maxTileRow){
                dif = rows-(maxTileRow-loc[1]+stat);
                rows-=dif;
            }

            if(rows+tileStartY>=maxTileRow){rows=maxTileRow-tileStartY;};
            if(cols+tileStartX>=maxTileCol){cols=maxTileCol-tileStartX;};
            var statTiles=[];
            //Get all possible move locations that are within the bounds
            for(var i=tileStartX;i<tileStartX+cols;i++){
                for(var j=tileStartY;j<tileStartY+rows;j++){
                    if(graph.grid[i][j].weight<10000){
                        statTiles.push(graph.grid[i][j]);
                    }
                }
            }
            //If there is at least one place to move
            if(statTiles.length){
                //Loop through the possible tiles
                for(var i=0;i<statTiles.length;i++){
                    var path = this.getPath(loc,[statTiles[i].x,statTiles[i].y],"maxScore",stat,graph);
                    var pathCost = 0;
                    for(var j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=stat&&pathCost<=stat){
                        this.p.guide.push(this.insert(new Q.RangeTile({x:statTiles[i].x*Q.tileW+Q.tileW/2,y:statTiles[i].y*Q.tileH+Q.tileH/2,loc:[statTiles[i].x,statTiles[i].y]})));
                    }
                }
            //If there's nowhere to move
            } else {
                
            }
        },
        //Checks if we've selected a tile
        checkValidPointerLoc:function(){
            var loc = this.p.target.stage.pointer.p.loc;
            var valid = false;
            this.p.guide.forEach(function(tile){
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
                            this.p.target.moveAlong(this.getPath(this.p.target.p.loc,stage.pointer.p.loc,"maxScore",this.p.target.p.move,this.p.target.p[this.p.kind+"Matrix"]));
                            break;
                        case "attack":
                            //Make sure there's a target there
                            if(stage.BattleGrid.getObject(stage.pointer.p.loc)){
                                this.p.target.previewAttackTarget(stage.pointer.p.loc);
                                stage.pointer.off("checkInputs");
                                stage.pointer.off("checkConfirm");
                            } else {return;}
                            break;
                    }
                    
                    this.fullDestroy();
                }
                Q.inputs['confirm']=false;
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
            this.p.y = Q.height/2-this.p.h/2;
            this.on("inserted");
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
            
            return result;
        },
        processResult:function(result){
            //If the attack crit
            if(result.crit){
                //Successful Blow
                if(result.block){
                    this.successfulBlow(result);
                } 
                //Critical Blow
                else {
                    this.criticalBlow(result);
                }
            } 
            //If the attack hit
            else if(result.hit){
                //Glancing Blow
                if(result.block){
                    this.glancingBlow(result);
                }
                //Successful Blow
                else {
                    this.successfulBlow(result);
                }
            } 
            //If the attack missed
            else {
                //Counter Chance
                if(result.block){
                    this.counterChance(result);
                }
                //Miss
                else {
                    this.miss(result);
                }
            }
        },
        successfulBlow:function(result){
            console.log("Successful blow!")
            console.log(result);
        },
        criticalBlow:function(result){
            console.log("Critical blow!")
            console.log(result);
            
        },
        glancingBlow:function(result){
            console.log("Glancing blow!")
            console.log(result);
            
        },
        counterChance:function(result){
            console.log("Counter chance!")
            var temp = this.p.attacker;
            this.p.attacker = this.p.defender;
            this.p.defender = temp;
            console.log(this.p.attacker.p.charClass);
            console.log(result);
            
        },
        miss:function(result){
            console.log("Miss...")
            console.log(result);
            
        },
        doAttack:function(){
            //Compute the attack
            this.processResult(this.getBlow(Math.ceil(Math.random()*100),this.p.attacker,Math.ceil(Math.random()*100),this.p.defender));
            Q.clearStage(2);
        },
        inserted:function(){
            //This will need to be thought out more thoroughly.
            var atkPercent = this.p.attacker.p.strike;
            this.insert(new Q.UI.Text({x:10+this.p.w/2,y:10,label:atkPercent+"% chance of hitting.",size:12,cx:0,cy:0,align:"center"}));
            var missChance = "Pretty high, I guess";
            this.insert(new Q.UI.Text({x:10+this.p.w/2,y:30,label:missChance+"% chance of missing.",size:12,cx:0,cy:0,align:"center"}));
            
            
        },
        step:function(){
            if(Q.inputs['confirm']){
                this.p.attacker.p.attacked = true;
                this.p.attacker.checkEndTurn();
                this.doAttack();
                Q.inputs['confirm']=false;
            }
        }
    });
};