Quintus.GameObjects=function(Q){
    
    //Used to place allies at the start of a battle
    Q.component("pointerPlaceAllies",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.BatCon,"checkPlacement");
            this.entity.on("checkInputs");
            this.entity.on("checkConfirm");
        },
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.BatCon,"checkPlacement");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerPlaceAllies");
        }
    });
    //When a pointer is selecting where the character should move to
    Q.component("pointerMoveControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.RangeGridObj,"checkConfirmMove");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkInputs");
            this.entity.on("checkConfirm");
            this.entity.on("inputMoved",this,"inputMoved");
            this.entity.snapTo(this.entity.p.user);
        },
        disable:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.RangeGridObj,"checkConfirmMove");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.off("inputMoved",this,"inputMoved");
        },
        remove:function(){
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
            Q.stage(2).ActionMenu.displayMenu(Q.stage(2).ActionMenu.menuControls.menuNum,0);
            this.entity.del("pointerMoveControls");
        },
        pressedBack:function(){
            this.entity.snapTo(Q.RangeGridObj.p.user);
            Q.RangeGridObj.fullDestroy();
            this.disable();
            this.remove();
        },
        inputMoved:function(){
            this.entity.p.user.playStand(Q.compareLocsForDirection(this.entity.p.user.p.loc,this.entity.p.loc,this.entity.p.user.p.dir));
        }
    });
    Q.component("pointerRoamingControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",this,"checkOnCharacter");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkInputs");
            this.entity.on("checkConfirm");
        },
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",this,"checkOnCharacter");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerRoamingControls");
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
        },
        pressedBack:function(){
            this.entity.snapTo(Q.BatCon.turnOrder[0]);
            this.remove();
        },
        checkOnCharacter:function(){
            if(this.entity.p.target){
                //Load the action menu (active character)
                if(Q.BatCon.turnOrder[0]===this.entity.p.target){
                    this.remove();
                } 
                //Load the status menu (not active character)
                else {
                    console.log("TODO")
                }
            }
        }
    });
    
    Q.component("pointerAttackControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.RangeGridObj,"checkConfirmAttack");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkConfirm");
            //Set up an aoe guide
            if(this.entity.p.skill){
                var skill = this.entity.p.skill;
                if(skill.range[1]==="straight"){
                    this.entity.p.movingStraight = true;
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    //The pointer is hidden
                    this.entity.hide();
                    //Force the first direction
                    Q.inputs[this.entity.p.user.p.dir]=true;
                    this.entity.on("inputMoved",this.entity.AOEGuide,"moveStraightTiles");
                } else if(skill.aoe[1]==="hLine"){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this.entity.AOEGuide,"moveHLineTiles");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else if(skill.aoe[1]==="hLineForward"){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this.entity.AOEGuide,"moveHLineForwardTiles");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else if(skill.range[1]==="self"&&skill.range[0]===0){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else if(skill.name==="Phalanx"){ 
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this.entity.AOEGuide,"movePhalanxTiles");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else {
                    this.entity.on("inputMoved",this,"moveTiles");
                    this.entity.on("checkInputs");
                }
            } else {
                this.entity.on("checkInputs");
                this.entity.on("inputMoved",this,"inputMoved");
            }
        },
        inputMoved:function(){},
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.RangeGridObj,"checkConfirmAttack");
            this.entity.off("pressedBack",this,"pressedBack");
            if(this.entity.p.skill){
                if(this.entity.p.skill.range[1]==="straight"){
                    this.entity.p.movingStraight = false;
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveStraightTiles");
                } else if(this.entity.p.skill.range[1]==="hLine"){
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveHLineTiles");
                } else if(this.entity.p.skill.range[1]==="hLineForward"){
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveHLineForwardTiles");
                } else {
                    this.entity.off("checkInputs");
                    this.entity.off("inputMoved",this,"moveTiles");
                }
            } else {
                this.entity.off("checkInputs");
                this.entity.off("inputMoved");
            }
            if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
            this.entity.off("checkConfirm");
            this.entity.p.skill = false;
            this.entity.del("pointerAttackControls");
        },
        moveTiles:function(){
            Q.pointer.AOEGuide.moveTiles(this.entity);
        },
        showMenu:function(){
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
        },
        pressedBack:function(){
            this.entity.snapTo(Q.BatCon.turnOrder[0]);
            Q.RangeGridObj.fullDestroy();
            this.remove();
            this.showMenu();
        }
    });
    
    //All that the pointer should do is move around the map and listen for confirm and back inputs (For the base class)
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
            this.add("animation, tween");
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
            this.getTerrain();
        },
        getTerrain:function(){
            var type = Q.BatCon.getTileType(this.p.loc);
            this.trigger("onTerrain",type);
        },
        /*
        reset:function(){
            Q.BatCon.setXY(this);
            this.show();
            this.checkTarget();
            this.addControls();
            this.show();
            this.on("checkConfirm");
        },*/
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
        },/*
        checkStartBattle:function(){
            var ready = false;
            var allies = Q.state.get("allies");
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.placedOnMap){
                    ready = true;
                }
            }
            if(ready){
                //Make sure there is at least one character placed.
                var start = confirm("Start Battle?");
                if(start){
                    Q.BatCon.startBattle();
                }
            }
        },*/
        /*
        addControls:function(skill){
            this.show();
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
            //The standard checkInputs.
            this.on("checkInputs");
        },*/
        /**/
        //Check confirm only runs when the user is moving around the pointer without any menu selection
        /*checkConfirm:function(){
            var input = Q.inputs;
            //If we're trying to load a menu
            if(input['confirm']){
                this.trigger("pressedConfirm",this);
                //this.displayCharacterMenu();
                input['confirm']=false;
                return;
            } else if(input['back']){
                this.trigger("pressedBack",this);
                
                var obj = Q.BatCon.turnOrder[0];
                //If the character has moved this turn
                if(obj.p.didMove){
                    //If the pointer is on top of the character, move the character back to its initial starting loc from the start of this turn
                    if(this.p.loc[0]===obj.p.loc[0]&&this.p.loc[1]===obj.p.loc[1]){
                        //Reset the character's loc
                        Q.BattleGrid.moveObject(obj.p.loc,obj.p.initialLoc,obj);
                        obj.p.loc = [obj.p.initialLoc[0],obj.p.initialLoc[1]];
                        Q.BatCon.setXY(obj);
                        //Allow the character to move again
                        obj.p.didMove = false;
                    }
                }
                this.snapTo(obj);
                
                input['esc']=false;
            } else if(input['shift']){
                this.trigger("pressedShift",this);
            }
        },*/
        checkConfirm:function(){
            if(Q.inputs['confirm']){
                this.trigger("pressedConfirm",this);
                Q.inputs['confirm'] = false;
            } else if(Q.inputs['back']){
                this.trigger("pressedBack",this);
                Q.inputs['back'] = false;
            } else if(Q.inputs['shift']){
                this.trigger("pressedShift",this);
                Q.inputs['shift'] = false;
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
                p.user.playStand(Q.compareLocsForDirection(p.user.p.loc,p.loc,p.user.p.dir));
                this.trigger("inputMoved",this);
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //If we are rotating a sprite
        checkStraightInputs:function(){
            var p = this.p;
            var input = Q.inputs;
            var newLoc = [p.user.p.loc[0],p.user.p.loc[1]];
            var dir;
            if(input['up']){
                if(this.p.movingStraight) newLoc[1]-=1;
                dir = "up";
                input['up']=false;
            } else if(input['down']){
                if(this.p.movingStraight) newLoc[1]+=1;
                dir = "down";
                input['down']=false;
            } else if(input['right']){
                if(this.p.movingStraight) newLoc[0]+=1;
                dir = "right";
                input['right']=false;
            } else if(input['left']){
                if(this.p.movingStraight) newLoc[0]-=1;
                dir = "left";
                input['left']=false;
            }
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a dir, loc, and the loc is valid
            if(dir&&validLoc){
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
                this.trigger("inputMoved",this);
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //Moves the invisible pointer to an object at the start of a turn
        //The time it takes for the pointer to reach its target is affected by how far away the object is.
        tweenTo:function(obj){
            var loc = obj.p.loc;
            var coords = Q.BatCon.getXY(loc);
            var dist = Q.BattleGrid.getTileDistance(loc,this.p.loc);
            //Set lower to go faster
            var baseSpeed = 50;
            var speed = (baseSpeed*dist)/1000;
            this.animate({x:coords.x,y:coords.y},speed,Q.Easing.Quadratic.Out,{callback:function(){this.trigger("atDest",[(coords.x-Q.tileW/2)/Q.tileW,(coords.y-Q.tileH/2)/Q.tileH]);}});
            this.p.loc = [loc[0],loc[1]];
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
        reset:function(){
            //When an item is inserted into this stage, check if it's an interactable and add it to the grid if it is
            this.stage.on("inserted",this,function(itm){
                if(!itm.p.loc) return;
                this.addObjectToBattle(itm);
            });
            this.grid = [];
            this.allyZocGrid = [];
            this.enemyZocGrid = [];
            var tilesX = this.stage.mapWidth;
            var tilesY = this.stage.mapHeight;
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
        },
        //Returns the correct grid
        getGrid:function(obj){
            return obj.p.team==="enemy"?this.enemyZocGrid:this.allyZocGrid;
        },/*
        //Show a team's zoc
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
        //Hide a team's zoc
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
        //Get all zoc tiles for a team
        getZOC:function(team,loc){
            return this[team+"ZocGrid"][loc[1]][loc[0]];
        },
        //Set the zone of control in an object's zocTiles
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
                    if(tileLoc[0]<0||tileLoc[1]<0||tileLoc[0]>=this.stage.mapWidth||tileLoc[1]>=this.stage.mapHeight) continue;
                    //There is already a tile there.
                    var tileThere = this.getZOC(obj.p.team,tileLoc);
                    if(tileThere){
                        tileThere.p.number++;
                        obj.p.zocTiles.push(tileThere);
                    } else {
                        //Keep a reference to the ZOC tiles in each object and also here
                        var tile = this.stage.insert(new Q.ZOCTile({loc:tileLoc}));
                        grid[tile.p.loc[1]][tile.p.loc[0]] = tile;
                        obj.p.zocTiles.push(tile);
                    }
                    
                }
            }
        },
        
        //Remove the zone of control from an area
        removeZOC:function(obj){
            if(!obj.p.zoc) return;
            var grid = this.getGrid(obj);
            obj.p.zocTiles.forEach(function(tile){
                var gridTile = grid[tile.p.loc[1]][tile.p.loc[0]];
                if(gridTile){
                    gridTile.p.number--;
                    if(gridTile.p.number<=0){
                        grid[tile.p.loc[1]][tile.p.loc[0]] = false;
                        tile.destroy();
                    }
                }
            });
        },
        //Move the zone of control
        moveZOC:function(to,obj){
            if(!obj.p.zoc) return;
            //First, remove the current ZOC
            this.removeZOC(obj);
            //Then, create a new ZOC for this object
            this.setZOC(to,obj);
        },*/
        outOfBounds:function(loc){
            return loc[0]<0||loc[1]<0||loc[0]>this.stage.mapWidth||loc[1]>this.stage.mapHeight;
        },
        //Get an object at a location in the grid
        getObject:function(loc){
            if(this.outOfBounds(loc)) return false;
            return this.grid[loc[1]][loc[0]];
        },
        //Set an object to a space in the grid
        setObject:function(loc,obj){
            this.grid[loc[1]][loc[0]] = obj;
        },
        //Move an object in the grid
        moveObject:function(from,to,obj){
            if(obj.p.zoc) this.moveZOC(to,obj);
            this.removeObject(from);
            this.setObject(to,obj);
            //Update the effect of the tile that this object is on
            obj.updateTileEffect(to);
        },
        //Removes an object from the grid
        removeObject:function(loc){
            this.grid[loc[1]][loc[0]] = false;
        },
        addObjectToBattle:function(obj){
            if(obj.has("interactable")){
                //Place the object in the grid
                this.setObject(obj.p.loc,obj);
                //If the object has ZOC, create the tiles
                //this.setZOC(obj.p.loc,obj);
            }
        },
        //Used to get rid of the object. Used in lifting and if an interactable is destroyed(TODO)
        removeObjectFromBattle:function(obj){
            if(obj.p.zoc) this.removeZOC(obj);
            this.removeObject(obj.p.loc);
        },
        getObjectsAround:function(tiles){
            var objects = [];/*
            var radius = aoe[0];
            var bounds = this.getBounds(loc,radius);
            switch(aoe[1]){
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
                    var dir = target?target.p.dir:false;
                    var arr = Q.getDirArray(dir);
                    for(var i=0;i<radius;i++){
                        if(aoe[2]==="excludeCenter"&&i===0) i++;
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        var object = this.getObject(spot);
                        if(object) objects.push(object);
                    }
                    break;
                case "hLine":
                    var dir = target.p.dir;
                    var arr = Q.getDirArray(Q.getRotatedDir(dir));
                    for(var i=-radius;i<radius+1;i++){
                        if(aoe[2]==="excludeCenter"&&i===0) i++;
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        var object = this.getObject(spot);
                        if(object) objects.push(object);
                    }
                    break;
            }*/
            for(var i=0;i<tiles.length;i++){
                var object = this.getObject(tiles[i].p.loc);
                if(object) objects.push(object);
            };
            return objects;
        },
        //Gets the closest empty tiles around a location
        getEmptyAround:function(loc,required){
            var tiles = [];
            var radius = 1;
            //If the search fails for the closest 4 tiles, try the next range
            while(!tiles.length){
                for(var i=-radius;i<radius+1;i++){
                    for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                        var curLoc = [loc[0]+i,loc[1]+j-(radius-Math.abs(i))];
                        var object = this.getObject(curLoc);
                        var tile = Q.BatCon.getTileType(curLoc);
                        if(!object&&tile!=="impassable"&&(!tile.required||(tile.required&&required[tile.required]))) tiles.push(curLoc);
                    }
                }
                radius++;
            }
            return tiles;
        },
        //Removes any objects that are dead
        removeDead:function(arr){
            return arr.filter(function(itm){
                return itm.p.combatStats.hp>0;
            });
        },
        //Gets the bounds of the level
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
        },
        //Gets the tile distance between two locations
        getTileDistance:function(loc1,loc2){
            return Math.abs(loc1[0]-loc2[0])+Math.abs(loc1[1]-loc2[1]);
        }
    });

    //The battle controller holds all battle specific code.
    Q.GameObject.extend("BattleController",{
        init:function(){
            //Any characters that have their hp reduced to 0 or under get removed all at once (they get destroyed when they're killed, but only removed here after)
            this.markedForRemoval = [];
            this.add("attackFuncs,skillFuncs");
        },
        checkPlacement:function(pointer){
            //If there's a character there, select it and go to the directional phase
            var allies = Q.state.get("allies");
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.placedOnMap){
                    if(ally.loc[0]===pointer.p.loc[0]&&ally.loc[1]===pointer.p.loc[1]){
                        ally.placedOnMap = false;
                        //Re-create the list of possible allies
                        Q.BatCon.genPlaceableAllies();
                        //Find the ally's sprite and set up directional controls for this character
                        Q.stage(0).lists['Character'].forEach(function(char,j){
                            if(char.p.name===ally.name&&char.p.uniqueId===ally.uniqueId){
                                char.add("directionControls");
                                char.on("pressedConfirm",function(){
                                    Q.BatCon.confirmPlacement(this);
                                    this.directionControls.removeControls();
                                });
                                char.on("pressedBack",function(){
                                    this.directionControls.removeControls();
                                    this.destroy();
                                    Q.stageScene("placeCharacterMenu",1,{placedIdx:0});
                                });
                            }
                        });
                        pointer.pointerPlaceAllies.remove();
                        return;
                    }
                }
            }
            var canPlace = false;
            var tiles = Q.BatCon.stage.options.data.placementSquares;
            //Check if we're on a placement square.
            tiles.forEach(function(tile){
                if(pointer.p.loc[0]===tile[0]&&pointer.p.loc[1]===tile[1]){
                    canPlace = true;
                }
            });
            //If we're on a placement square, load the menu that shows all of the allies that the player can choose from for this battle.
            if(canPlace){
                Q.stageScene("placeCharacterMenu",1);
                pointer.pointerPlaceAllies.remove();
            } else {
                Q.playSound("cannot_do.mp3");
            }
        },
        showPlacementSquares:function(){
            var stage = this.stage;
            var tiles = stage.options.data.placementSquares;
            tiles.forEach(function(tile){
                var sq = stage.insert(new Q.PlacementSquare({loc:tile}));
                Q.BatCon.setXY(sq);
            });
        },
        removePlacementSquares:function(){
            Q("PlacementSquare",0).invoke("destroy");
        },
        genPlaceableAllies:function(){
            //All placeable allies (not wounded, must be preset, not already placed)
            var placeableAllies = [];
            Q.state.get("allies").forEach(function(ally){
                if(ally.wounded) return;
                else if(ally.unavailable) return;
                else if(ally.placedOnMap) return;
                placeableAllies.push(ally);
            });
            this.placeableAllies = placeableAllies;
        },
        //Start placing allies at the start of a battle
        startPlacingAllies:function(){
            var t = this;
                t.startBattle();
                
            return;
            this.genPlaceableAllies();
            Q.pointer.add("pointerPlaceAllies");
        },
        //Confirms when a character is placed after their direction is set
        confirmPlacement:function(char){
            //Find the character in placeable allies and set placedOnMap to true
            var allies = Q.state.get("allies");
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.name===char.p.name&&ally.uniqueId===char.p.uniqueId){
                    ally.placedOnMap = true;
                    ally.loc = char.p.loc;
                    i = allies.length;
                }
            }
            //If all allies are placed, start the battle.
            if(allies.filter(function(c){return c.placedOnMap;}).length===allies.length){
                this.startBattle();
            } else {
                this.startPlacingAllies();
            }
        },
        //Run once at the start of battle
        startBattle:function(){
            /*Q.pointer.destroy();
            Q.clearStage(1);
            Q.clearStage(3);
            //Create a new pointer
            Q.pointer = Q.stage(0).insert(new Q.Pointer({loc:[0,0]}));
            Q.viewFollow(Q.pointer,Q.stage(0));
            */
           this.removePlacementSquares();
            this.allies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="ally"; 
            });
            this.enemies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="enemy"; 
            });
            this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            //Do start battle animation, and then start turn (TODO)
            this.startTurn();
        },
        finishBattle:function(){
            this.allies.forEach(function(ally){
                if(ally.p.savedData){
                    ally.p.savedData.awards = ally.p.awards;  
                }
            });
            Q.clearStages();
        },
        //Eventually check custom win conditions. For now, if there are no players OR no enemies, end it.
        checkBattleOver:function(){
            //FOR TESTING, DON'T END THE BATTLE
            return false;
            if(this.allies.length===0){
                //Do anything that happens after a battle
                this.finishBattle();
                var defeat = this.stage.options.battleData.defeat;
                if(defeat.func==="loadBattleScene"){
                    Q.stageScene("battleScene",0,{data:this.stage.options.data, path:defeat.scene});
                } else if(defeat.func==="loadDialogue"){
                    Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:defeat.scene});
                } else if(defeat.func==="loadBattle"){
                    Q.stageScene("battle",0,{data:this.stage.options.data, path:defeat.scene});
                }
                return true;
            }
            if(this.enemies.length===0){
                //Do anything that happens after a battle
                this.finishBattle();
                var victory = this.stage.options.battleData.victory;
                if(victory.func==="loadBattleScene"){
                    Q.stageScene("battleScene",0,{data:this.stage.options.data, path:victory.scene});
                } else if(victory.func==="loadDialogue"){
                    Q.stageScene("dialogue", 1, {data: this.stage.options.data,path:victory.scene});
                } else if(victory.func==="loadBattle"){
                    Q.stageScene("battle",0,{data:this.stage.options.data, path:victory.scene});
                }
                
                return true;
            }
        },
        valid:function(obj){
            if(obj.p.combatStats.hp>0&&!obj.p.fainted) return true;
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            var obj = this.turnOrder[0];
            if(!obj) alert("Everything is dead.");
            while(!this.valid(obj)){
                this.turnOrder.shift();
                if(!this.turnOrder[0]){
                    this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
                }
                obj = this.turnOrder[0];
            }
            //Hide and disable the pointer if it's not an ally's turn
            //TEMP (Take out false to enable)
            if(false&&obj.p.team!=="ally"&&Q.pointer){
               /* Q.pointer.hide();
                Q.pointer.off("checkInputs");
                Q.pointer.off("checkConfirm");
                Q.pointer.trigger("offTarget");*/
                Q.pointer.on("atDest",function(){
                    Q.BatCon.turnOrder[0].startTurn();
                    //Follow the AI object
                    Q.viewFollow(Q.BatCon.turnOrder[0],this.stage);
                    //Q.CharacterAI(Q.BatCon.turnOrder[0]);
                    this.off("atDest");
                });
            } else {
                Q.pointer.checkTarget();
                Q.pointer.on("atDest",function(){
                    this.p.loc = Q.BatCon.turnOrder[0].p.loc;
                    this.checkTarget();
                    //Start the turn. Will return false if the character can't do anything this turn  for whatever reason (dead, ini under 0, etc...)
                    if(Q.BatCon.turnOrder[0].startTurn()){
                        //Display the menu on turn start
                        Q.stageScene("characterMenu",2,{target:this.p.target,currentTurn:Q.BatCon.turnOrder[0],pointer:this});
                        
                    };
                    this.off("atDest");
                });
            }
            Q.viewFollow(Q.pointer,this.stage);
            //Tween the pointer to the AI
            Q.pointer.tweenTo(obj);
        },
        //When a character ends their turn, run this to cycle the turn order
        endTurn:function(){
            //Move the first character to the back (Maybe do some speed calculations to place them somewhere else)
            var lastTurn = this.turnOrder.shift();
            //Advance the last character's status effects.
            lastTurn.advanceStatus();
            /*this.turnOrder.push(lastTurn);
            while(this.turnOrder[0].p.fainted){
                var lastTurn = this.turnOrder.shift();
                this.turnOrder.push(lastTurn);
            }*/
            
            if(!this.turnOrder.length) this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            
            //Remove any dead characters
           // this.removeMarked();
            //Check if the battle is over at this point
            if(this.checkBattleOver()) return; 
            this.startTurn();
        },
        //Generates the turn order
        generateTurnOrder:function(objs){
            var refs = [];
            for(var i=0;i<objs.length;i++){
                refs.push({obj:objs[i],ini:objs[i].p.combatStats.initiative});
                if(objs[i].p.combatStats.initiative>200){
                    refs.push({obj:objs[i],ini:objs[i].p.combatStats.initiative-200});
                }
                if(objs[i].p.combatStats.initiative>100){
                    refs.push({obj:objs[i],ini:objs[i].p.combatStats.initiative-100});
                }
            }
            
            var turnOrder = [];
            var sortForSpeed = function(objects){
                var topSpeed = objects[0];
                var idx = 0;
                for(var i=0;i<objects.length;i++){
                    if(objects[i].ini>topSpeed.ini){
                        topSpeed=objects[i];
                        idx = i;
                    }
                }
                turnOrder.push(topSpeed.obj);
                objects.splice(idx,1);
                if(objects.length>0){
                    return sortForSpeed(objects);
                } else {
                    return turnOrder;
                }
            };
            var tO = sortForSpeed(refs);
            return tO;
        },
        //When an object is destroyed, mark them for removal at the end of the turn
        /*markForRemoval:function(obj){
            this.markedForRemoval.push(obj);
        },
        removeMarked:function(){
            if(this.markedForRemoval.length){
                for(var i=0;i<this.markedForRemoval.length;i++){
                    this.removeFromBattle(this.markedForRemoval[i]);
                    //this.markedForRemoval[i].destroy();
                }
                this.markedForRemoval = [];
            }
        },*/
        addToTurnOrder:function(obj){
            this.turnOrder.push(obj);
        },
        //Removes an object from the turn order
        removeFromTurnOrder:function(obj){
            for(var i=0;i<this.turnOrder.length;i++){
                if(this.turnOrder[i].p.id===obj.p.id){
                    this.turnOrder.splice(i,1);
                }
            }
            //this.turnOrder.splice(this.turnOrder.indexOf(this.turnOrder.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
        },
        addToTeam:function(obj){
            var team = obj.p.team==="ally"?this.allies:this.enemies;
            team.push(obj);
        },
        removeFromTeam:function(obj){
            if(obj.p.team==="ally"){
                this.allies.splice(this.allies.indexOf(this.allies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            } else if(obj.p.team==="enemy"){
                this.enemies.splice(this.enemies.indexOf(this.enemies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            }
        },
        //Adds an object to battle (currently used when dropping a lifted object)
        addToBattle:function(obj){
            this.addToTurnOrder(obj);
            this.addToTeam(obj);
        },
        //Removes the object from battle (at end of turn)
        /*removeFromBattle:function(obj){
            this.removeFromTurnOrder(obj);
            this.removeFromTeam(obj);
        },*/
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
        validateTileTo:function(tileType,obj){
            var required = Q.state.get("tileTypes")[tileType].required;
            if(required){
                if(obj.p.canMoveOn[required]){
                    return tileType;
                }
                return "impassable";
            }
            return tileType;
        },
        getTileType:function(loc){
            //Prioritize the collision objects
            var tileLayer = this.stage.lists.TileLayer[1];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                var type = tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type; 
                return type || "impassable";
            }
            //If there's nothing on top, check the ground
            var tileLayer = this.stage.lists.TileLayer[0];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                 return tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type;
            }
        },
        //Removes any objects that are not a certain team from an array
        removeTeamObjects:function(arr,team){
            for(var i=arr.length-1;i>=0;i--){
                if(arr[i].p.team!==team){
                    arr.splice(i,1);
                }
            }
        },
        //Removes any targets that are not facing the user.
        removeNotFacing:function(targets,user){
            for(var i=targets.length-1;i>=0;i--){
                var dir = this.attackFuncs.compareDirection(targets[i],user);
                if(dir==="back"||dir==="side"){
                    targets.splice(i,1);
                }
            }
        },
        getOtherTeam:function(team){
            return team==="enemy"?"ally":"enemy";
        },

        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(user,loc){
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:[Q.BattleGrid.getObject(loc)]}));
        },
        //Previews a skill
        previewDoSkill:function(user,loc,skill){
            var targets = [];
            if(skill.range[2]==="ground"){
               
            } else if((Q._isNumber(skill.aoe[0])&&skill.aoe[0]>0)||skill.aoe[0]==="custom"||skill.aoe[0]==="customRadius"){
                targets = Q.BattleGrid.removeDead(Q.BattleGrid.getObjectsAround(Q.pointer.AOEGuide.aoeTiles));
                //Don't allow for unnaffected targets
                if(skill.range[1]==="enemy") this.removeTeamObjects(targets,Q.BatCon.getOtherTeam(user.p.team));
            } else {
                targets[0] = Q.BattleGrid.getObject(loc);
            }
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:targets,skill:skill}));
        },
        showEndTurnDirection:function(obj,dirs){
            obj.add("directionControls");
            if(dirs&&dirs.length){
                obj.directionControls.left = false;
                obj.directionControls.right = false;
                obj.directionControls.up = false;
                obj.directionControls.down = false;
                dirs.forEach(function(dir){
                    obj.directionControls[dir] = true;
                });
            }
            obj.on("pressedConfirm",function(){
                obj.off("pressedConfirm");
                obj.directionControls.removeControls();
                Q.BatCon.endTurn();
            });
        },
        //Divide the exp amongst any characters that fought this enemy
        /*How it works:
            Sort the array of attackers that hit this target from lowest level to highest level.
            The base exp gain is 10exp. This means the exp gain for an enemy that has been defeated by a single character of the same level will get 10 exp.
            Every level difference between the lowest level attacker and the defender results in a 2exp increase/decrease
            Characters that appear later in the sorted array get half of the previous character's exp
        */
        giveExp:function(defeated,shared){
            //Whoever got the last hit gets an additional share of the exp
            var lastHit = shared[shared.length-1];
            //Sort from lowest to highest level
            var sorted = shared.sort(function(a,b){
                return a.p.level>b.p.level;
            });
            var defeatedLevel = defeated.p.level;
            var lowestLevel = sorted[0].p.level;
            var dif = defeatedLevel-lowestLevel;
            //Set the exp to be 10 + 2 for each level higher the defeated enemy was. It's negative if the enemy was lower than the lowest level. Must be at least 1.
            var exp = 10+dif>0?10+dif:1;
            var text = [];
            //Give the exp to all participants
            sorted.forEach(function(obj,i){
                Q.setAward(obj,"assisted",1);
                //Don't give exp to dead people
                if(obj.p.combatStats.hp<=0) return;
                var gain = Math.floor(exp/(i+1));
                if(lastHit.p.id===obj.p.id){
                    gain*=2;
                }
                obj.p.exp+= gain;
                obj.trigger("saveProp",{name:"exp",value:obj.p.exp});
                var leveledUp = false;
                //Level up the character if they are at or over 100
                if(obj.p.exp>=100){
                    leveledUp = true;
                    obj.levelUp();
                    obj.trigger("saveProp",{name:"level",value:obj.p.level});
                }
                text.push({func:"showExpGain",obj:obj,props:[gain,leveledUp]});
            });
            return text;
        },
        //The user lifts the object
        liftObject:function(user,obj){
            //Set the obj to be lifted by the user
            user.p.lifting = obj;
            //Remove the obj from battle (lifted units cannot be targetted nor take up space)
            Q.BattleGrid.removeObjectFromBattle(obj);
            //The lifts object doesn't get a turn
            this.removeFromTurnOrder(obj);
            obj.p.loc = [user.p.loc[0],user.p.loc[1]-1];
            this.setXY(obj);
            obj.p.z = user.p.y+Q.tileH;
            obj.playLifted(obj.p.dir);
            user.playLift(user.p.dir);
        },
        dropObject:function(user,obj,locTo){
            user.p.lifting = false;
            obj.p.loc = locTo;
            Q.BatCon.setXY(obj);
            obj.p.z = obj.p.y;
            obj.playStand(obj.p.dir);
            user.playStand(user.p.dir);
            //Add the object to the grid
            Q.BattleGrid.setObject(locTo,obj);
            //Only add into the battle if the object is alive
            if(obj.p.combatStats.hp>0){
                //Set the character's ZOC
                Q.BattleGrid.setZOC(locTo,obj);
                //Add the object to allies/enemies and the turnorder
                this.addToBattle(obj);
            }
        },
        //Returns true if the object is liftable
        isLiftable:function(user,obj){
            if(!obj.p.lifting&&(obj.p.interactable||obj.p.team===user.p.team||obj.p.combatStats.hp<=0)){
                return true;
            }
            return false;
        }

    });
    
    Q.component("attackFuncs",{
        added:function(){
            //Any feedback from the attack is stored here
            this.text = [];
            //If any defenders dies from an attack, save the feedback and add it on to text at the end
            this.expText = [];
            this.previousDamage = 0;
        },
        getDiagDirs:function(aLoc,dLoc){
            if(aLoc[0]<dLoc[0]&&aLoc[1]>dLoc[1]) return ["up","right"];
            if(aLoc[0]<dLoc[0]&&aLoc[1]<dLoc[1]) return ["down","right"];
            if(aLoc[0]>dLoc[0]&&aLoc[1]>dLoc[1]) return ["up","left"];
            if(aLoc[0]>dLoc[0]&&aLoc[1]<dLoc[1]) return ["down","left"];
        },
        //Compares the first obj's dir to the second object's dir.
        compareDirection:function(attacker,defender){
            var getDirection = function(dir,dirs){
                for(var i=0;i<dirs.length;i++){
                    if(dir===dirs[i]){
                        return i;
                    }
                }
            };
            var checkBounds = function(num){
                if(num>=dirs.length){
                    return num-dirs.length;
                }
                return num;
            };
            //Set values 
            var back = "back";
            var side = "side";
            var front = "front";
            
            //If the characters are diagonal to each other, we're attacking from the side, regardless of which direction either participants are facing
            if(Math.abs(attacker.p.loc[0]-defender.p.loc[0])===Math.abs(attacker.p.loc[1]-defender.p.loc[1])){
                attacker.p.canSetDir = this.getDiagDirs(attacker.p.loc,defender.p.loc);
                return side;
            }
            //Array of possible directions clockwise from 12 o'clock
            var dirs = ["up", "right", "down", "left"];
            //Get the number for the user dir
            var userDir = getDirection(attacker.p.dir,dirs);
            //Get the number for the target dir
            var targetDir = getDirection(defender.p.dir,dirs);
            //An array of the values (also clockwise from 12 o'clock)
            //EX:
            //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
            var values = [back,side,front,side];
            for(var j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir+j)===targetDir){
                    //If we've found the proper value, return it
                    return values[j];
                }
            }
        },
        getBlow:function(props){
            var attackResult = {
                crit:false,
                hit:false,
                miss:false
            };
            var defenseResult = {
                counter:false,
                block:false,
                fail:false
            };
            if(props.defenderFainted){
                attackResult.hit = true;
            } else if(props.attackNum<props.attackerCritChance){
                attackResult.crit = true;
            } else if(props.attackNum<props.attackerAtkAccuracy){
                attackResult.hit = true;
            } else {
                attackResult.miss = true;
            }
            var dir = this.compareDirection(props.attacker,props.defender);
            if(props.defenderFainted){
                defenseResult.fail = true;
            } else if(dir==="back"){
                defenseResult.fail = true;
            } else if(props.defendNum<props.defenderCounterChance){
                defenseResult.counter = true;
            } else if(dir==="side"&&props.defendNum<props.defenderReflexes){
                defenseResult.block = true;
            } else if(dir==="front"&&props.defendNum<props.defenderDefensiveAbility){
                defenseResult.block = true;
            } else {
                defenseResult.fail = true;
            }
            var result = "Solid";
            if(attackResult.crit){
                if(defenseResult.counter){
                    result = "Glancing";
                } else if(defenseResult.block){
                    result = "Critical";
                } else if(defenseResult.fail){
                    result = "Critical";
                }
            } else if(attackResult.hit){
                if(defenseResult.counter){
                    result = "Counter";
                } else if(defenseResult.block){
                    result = "Glancing";
                } else if(defenseResult.fail){
                    result = "Solid";
                }
            } else if(attackResult.miss){
                if(defenseResult.counter){
                    result = "Counter";
                } else if(defenseResult.block){
                    result = "Miss";
                } else if(defenseResult.fail){
                    result = "Miss";
                }
            };
            return result;
        },
        //Forces the damage to be at least 1
        getDamage:function(dmg){
            if(dmg<=0) dmg=1;
            return dmg;
        },
        //When a regular attack is used
        processResult:function(props){
            var damage = 0;
            var sound = "hit1.mp3";
            if(props.attackerHP<=0||props.attackerFainted||props.defenderHP<=0){return {damage:damage,sound:sound};};
            switch(props.result){
                case "Critical":
                    damage = this.criticalBlow(props.attackerAtkSpeed,props.attackerMaxAtkDmg,props.defenderHP,props.attacker,props.defender,props.skill);
                    sound = "critical_hit.mp3";
                    break;
                case "Solid":
                    damage = this.solidBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDamageReduction);
                    break;
                case "Glancing":
                    damage = this.glancingBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDefensiveAbility);
                    sound = "glancing_blow.mp3";
                    break;
                case "Miss":
                    damage = 0;
                    break;
                case "Counter":
                    var dist = Q.BattleGrid.getTileDistance(props.attacker.p.loc,props.defender.p.loc);
                    if(props.defenderAtkRange>=dist){
                        damage = -1;
                    } else {
                        damage = 0;
                    }
                    break;
            }
            return {damage:damage,sound:sound};
        },
        processSelfTarget:function(attacker,result){
            var damage = 0;
            if(result.hit||result.crit){
                var attackerTile = attacker.p.tileEffect;
                var low = attacker.p.totalDamageLow;
                var high = attacker.p.totalDamageHigh;
                if(attackerTile.stat==="damage") {
                    low*=attackerTile.amount;
                    high*=attackerTile.amount;
                }
                var armour = attacker.p.armour;
                if(attacker.p.status.sturdy) armour*=1.5;
                if(attackerTile.stat==="armour") armour*=attackerTile.amount;
                damage = this.getDamage(Math.floor(Math.random()*(high-low)+low)-armour);
            }
            return damage;
        },
        calcSkillBlowDamage:function(float, low, high, armour) {
            return Math.floor(float*(high-low) + low)-Math.floor(armour);
        },
        successfulSkillBlow:function(float, low, high, armour){
            return this.getDamage(this.calcSkillBlowDamage(float, low, high, armour));
        },
        calcBlowDamage:function(attackerMinAtkDmg,attackerMaxAtkDmg,defenderDamageReduction,float) {
            return Math.floor(float*(attackerMaxAtkDmg-attackerMinAtkDmg) + attackerMinAtkDmg)-Math.floor(defenderDamageReduction);
        },
        solidBlow:function(attackerMinAtkDmg,attackerMaxAtkDmg,defenderDamageReduction){
            return this.getDamage(this.calcBlowDamage(attackerMinAtkDmg,attackerMaxAtkDmg,defenderDamageReduction, Math.random()));
        },
        criticalBlow:function(attackerAtkSpeed,attackerMaxAtkDmg,defenderHP,attacker,defender,skill){
            //Maybe attack again!
            //BUG: If a character attacks 3 times, it doesn't take into account all of the damage for less than 0.
            var rand = Math.ceil(Math.random()*100)
            console.log(this.previousDamage)
            if(rand<=attackerAtkSpeed&&defenderHP-attackerMaxAtkDmg-this.previousDamage>0){
                this.previousDamage += attackerMaxAtkDmg;
                console.log(this.previousDamage)
                console.log("Attacking Again!");
                this.calcAttack(attacker,defender,skill);
            }
            return attackerMaxAtkDmg;
        },
        glancingBlow:function(attackerMinAtkDmg,attackerMaxAtkDmg,defenderDefensiveAbility){
            return this.getDamage(Math.floor(((Math.random()*(attackerMaxAtkDmg-attackerMinAtkDmg)+attackerMinAtkDmg)-defenderDefensiveAbility)/2));
        },/*
        counterChance:function(defenderHP,defenderLoc,attackerLoc,defenderAtkRange,attacker,defender){
            if(defenderHP<=0){return 0;};
            //Only allow counter attacking if the defender has enough range
            if(Q.BattleGrid.getTileDistance(defenderLoc,attackerLoc)<=defenderAtkRange){
                this.calcAttack(defender,attacker);
            }
            return this.miss();
        },*/
        miss:function(){
            return 0;
        },
        useSupportSkill:function(user,target,skill){
            var newText;
            switch(skill.name){
                case "Forced March":
                    newText = this.entity.skillFuncs["addStatus"]("movePlus",2,"buff",target,user,{name:"moveSpeed",amount:Math.ceil(user.p.combatStats.skill/10)});
                    break;
                case "Fortify":
                    newText = this.entity.skillFuncs["addStatus"]("defensePlus",2,"buff",target,user,{name:"defensiveAbility",amount:user.p.combatStats.skill});
                    break;
                case "Embolden":
                    newText = this.entity.skillFuncs["addStatus"]("skillPlus",2,"buff",target,user,{name:"skill",amount:user.p.combatStats.skill});
                    break;
                case "Fervour":
                    newText = this.entity.skillFuncs["addStatus"]("strengthPlus",2,"buff",target,user,{name:"strength",amount:user.p.combatStats.skill});
                    break;
                case "Direct":
                    newText = this.entity.skillFuncs["addStatus"]("efficiencyPlus",2,"buff",target,user,{name:"efficiency",amount:Math.floor(user.p.combatStats.skill/2)});
                    break;
                case "Phalanx":
                    newText = this.entity.skillFuncs["addStatus"]("damageReductionPlus",2,"buff",target,user,{name:"damageReduction",amount:Math.floor(user.p.combatStats.skill/2)});
                    newText = newText.concat(this.entity.skillFuncs["addStatus"]("physicalResistancePlus",2,"buff",target,user,{name:"physicalResistance",amount:100}));
                    break;
                case "Quicken":
                    newText = this.entity.skillFuncs["addStatus"]("initiativePlus",2,"buff",target,user,{name:"initiative",amount:user.p.combatStats.skill});
                    break;
                case "Forewarn":
                    newText = this.entity.skillFuncs["addStatus"]("counterChancePlus",2,"buff",target,user,{name:"counterChance",amount:user.p.combatStats.skill});
                    break;
                case "Sharpen":
                    newText = this.entity.skillFuncs["addStatus"]("atkAccuracyPlus",2,"buff",target,user,{name:"atkAccuracy",amount:user.p.combatStats.skill});
                    break;
                case "Vitalize":
                    newText = this.entity.skillFuncs["addStatus"]("critChancePlus",2,"buff",target,user,{name:"critChance",amount:Math.floor(user.p.combatStats.skill/2)});
                    break;
                case "Vivify":
                    newText = this.entity.skillFuncs["addStatus"]("atkSpeedPlus",2,"buff",target,user,{name:"atkSpeed",amount:user.p.combatStats.skill});
                    break;
                case "Heal":
                    newText = this.entity.skillFuncs["healHp"](Math.floor(Math.random()*user.p.combatStats.skill)+user.p.combatStats.skill,target,user);
                    break;
                case "Cure":
                    newText = this.entity.skillFuncs["removeDebuff"]("all",target,user);
                    break;
                case "Revive":
                    newText = this.entity.skillFuncs["removeDebuff"]("fainted",target,user);
                    break;
                case "Energize":
                    newText = this.entity.skillFuncs["healTp"](user.p.combatStats.skill+25,target,user);
                    break;
                case "Resurrect":
                    newText = this.entity.skillFuncs["removeDebuff"]("bleedingOut",target,user);
                    newText = newText.concat(this.entity.skillFuncs["healHp"](Math.floor(Math.random()*user.p.combatStats.skill)+user.p.combatStats.skill,target,user));
                    break;
            }
            for(var i=0;i<newText.length;i++){
                this.text.push(newText[i]);
            }
        },
        useDebilitateSkill:function(attacker,defender,skill){
            var newText = [];
            switch(skill.name){
                case "Unnerve":
                    newText = this.entity.skillFuncs["addStatus"]("painToleranceDown",100,"debuff",defender,attacker,{name:"painTolerance",amount:-(attacker.p.combatStats.skill*2)});
                    attacker.p.gaveStatus.push({char:defender,status:"painToleranceDown"});
                    break;
                case "Stun":
                    newText = this.entity.skillFuncs["addStatus"]("stunned",100,"debuff",defender,attacker);
                    attacker.p.gaveStatus.push({char:defender,skill:"stunned"});
                    break;
                case "Blind":
                    newText = this.entity.skillFuncs["addStatus"]("atkAccuracyDown",100,"debuff",defender,attacker,{name:"atkAccuracy",amount:-Math.floor(defender.p.combatStats.atkAccuracy/2)});
                    newText = newText.concat(this.entity.skillFuncs["addStatus"]("defensiveAbilityDown",100,"debuff",defender,attacker,{name:"defensiveAbility",amount:-Math.floor(defender.p.combatStats.defensiveAbility/2)}));
                    attacker.p.gaveStatus.push({char:defender,skill:"atkAccuracyDown"});
                    attacker.p.gaveStatus.push({char:defender,skill:"defensiveAbilityDown"});
                    break;
                case "Temporary Insanity":
                    newText = this.entity.skillFuncs["addStatus"]("insane",100,"debuff",defender,attacker);
                    attacker.p.gaveStatus.push({char:defender,skill:"insane"});
                    break;
                case "Antithesis":
                    newText = this.entity.skillFuncs["addStatus"]("TPDrain",100,"debuff",defender,attacker);
                    attacker.p.gaveStatus.push({char:defender,skill:"TPDrain"});
                    break;
                case "Push":
                    newText = this.entity.skillFuncs.push(1,defender,attacker);
                    break;
                case "Staredown":
                    newText = this.entity.skillFuncs["addStatus"]("atkAccuracyDown",3,"debuff",defender,attacker,{name:"atkAccuracy",amount:-attacker.p.combatStats.skill});
                    break;
                case "Charge Through":
                    newText = this.entity.skillFuncs.chargeThrough(defender,attacker);
                    attacker.p.canSetDir = [];
                    break;
                case "Headbutt":
                    newText = this.entity.skillFuncs["addStatus"]("initiativeDown",3,"debuff",defender,attacker,{name:"initiative",amount:-(attacker.p.combatStats.skill*2)});
                    break;
                case "Pull":
                    newText = this.entity.skillFuncs.pull(defender,attacker);
                    break;
                case "War Cry":
                    newText = this.entity.skillFuncs["addStatus"]("moveDown",2,"debuff",defender,attacker,{name:"moveSpeed",amount:-defender.p.combatStats.moveSpeed+1});
                    break;
            }
            this.text = this.text.concat(newText);
            this.text.push({func:"waitTime",obj:this,props:[400]});
        },
        useDamageSkill:function(attacker,defender,skill){
            var damage;
            var sound;
            var result;
            var props;
            var atkProps = {
                attackNum:Math.ceil(Math.random()*100),
                defendNum:Math.ceil(Math.random()*100),
                attackerCritChance:attacker.p.combatStats.critChance,
                attackerAtkAccuracy:attacker.p.combatStats.atkAccuracy,
                defenderCounterChance:defender.p.combatStats.counterChance,
                defenderReflexes:defender.p.combatStats.reflexes,
                defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                defenderFainted:defender.p.fainted,
                
                attackerFainted:attacker.p.fainted,
                attackerAtkSpeed:attacker.p.combatStats.atkSpeed,
                
                attackerMaxAtkDmg:attacker.p.combatStats.maxAtkDmg,
                attackerMinAtkDmg:attacker.p.combatStats.minAtkDmg,
                attackerSecMaxAtkDmg:attacker.p.combatStats.maxSecondaryDmg,
                attackerSecMinAtkDmg:attacker.p.combatStats.minSecondaryDmg,
                
                defenderHP:defender.p.combatStats.hp,
                defenderDamageReduction:defender.p.combatStats.damageReduction,
                defenderAtkRange:defender.p.combatStats.atkRange,
                attacker:attacker,
                defender:defender
            };
            switch(skill.name){
                case "Long Shot":
                    
                    break;
                case "Armour Piercing Shot":
                    atkProps.defenderDamageReduction = Math.max(0,atkProps.defenderDamageReduction - attacker.p.combatStats.skill);
                    break;
                case "Rapid Shot":
                    atkProps.attackerAtkSpeed+=attacker.p.combatStats.skill;
                    break;
                case "Critical Shot":
                    atkProps.critChance+=attacker.p.combatStats.skill;
                    break;
                case "Painful Shot":
                    atkProps.defenderPainTolerance = Math.max(0,defender.p.combatStats.painTolerance - attacker.p.combatStats.skill);
                    break;
                case "Sniper Shot":
                    var wsk = attacker.p.combatStats.skill,
                        wield = ((Q.charGen.getEquipmentProp("wield",attacker.p.equipment.righthand)+Q.charGen.getEquipmentProp("wield",attacker.p.equipment.lefthand))/2), 
                        encPenalty = attacker.p.combatStats.encumbrancePenalty,
                        level = attacker.p.level;
                    atkProps.attackerAtkAccuracy = wsk+wield+encPenalty+level;
                    break;
                case "Critical Strike":
                    atkProps.critChance+=attacker.p.combatStats.skill;
                    break;
                case "Rapid Strike":
                    atkProps.attackerAtkSpeed+=attacker.p.combatStats.skill;
                    break;
                case "Surprising Strike":
                    atkProps.defendNum = 100;
                    break;
                case "Armour Piercing Strike":
                    atkProps.defenderDamageReduction = Math.max(0,atkProps.defenderDamageReduction - attacker.p.combatStats.skill);
                    break;
                case "Painful Strike":
                    atkProps.defenderPainTolerance = Math.max(0,defender.p.combatStats.painTolerance - attacker.p.combatStats.skill);
                    break;
                case "Whirlwind Strike":
                    atkProps.minAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.minSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    break;
                case "Bleeding Strike":
                    atkProps.minAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.minSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps);
                    props = this.processResult(atkProps);
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("painToleranceDown",100,"debuff",defender,attacker,{name:"painTolerance",amount:-Math.floor(props.damage/2)}));
                    }
                    break;
                case "Weakening Strike":
                    atkProps.minAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.minSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps);
                    props = this.processResult(atkProps);
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("strengthDown",2,"debuff",defender,attacker,{name:"strength",amount:-Math.floor(props.damage/10)}));
                    }
                    break;
                case "Nerve Strike":
                    atkProps.minAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.minSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps);
                    props = this.processResult(atkProps);
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("physicalResistanceDown",100,"debuff",defender,attacker,{name:"physicalResistance",amount:-Math.floor(props.damage/10)}));
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("mentalResistanceDown",100,"debuff",defender,attacker,{name:"mentalResistance",amount:-Math.floor(props.damage/10)}));
                    }
                    break;
                case "Acid Bomb":
                    props = {
                        damage:Math.ceil(Math.random()*30)+10+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("damageReductionDown",100,"debuff",defender,attacker,{name:"damageReduction",amount:-attacker.p.combatStats.skill}));
                    }
                    break;
                case "Poison Strike":
                    atkProps.minAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.minSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.maxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps);
                    result = this.processResult(atkProps);
                    if(result.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("poisoned",2,"debuff",defender,attacker));
                        defender.p.buffs.poisonDamage = Math.floor(result.damage/4);
                    }
                    break;
                case "Coordinated Attack":
                    
                    break;
                case "Stone":
                    props = {
                        damage:Math.ceil(Math.random()*10)+10+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Flamethrower":
                    props = {
                        damage:Math.ceil(Math.random()*30)+50+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Fireball":
                    props = {
                        damage:Math.ceil(Math.random()*30)+50+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Frost Ray":
                    props = {
                        damage:Math.ceil(Math.random()*40)+10+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Choke":
                    atkProps.defenderDamageReduction = 0;
                    props = {
                        damage:Math.ceil(Math.random()*100)+100+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Lightning Storm":
                    atkProps.defenderDamageReduction = 0;
                    props = {
                        damage:Math.ceil(Math.random()*50)+150+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
            }
            if(!result){
                atkProps.result = this.getBlow(atkProps);
            }
            if(!props){
                props = this.processResult(atkProps);
            }
            props.sound = sound || props.sound;
            return {damage:props.damage,sound:props.sound};
        },
        useGroundSkill:function(targetLoc,user,skill){
            switch(skill.name){
                case "Hypnotic Mirage":
                    this.text.push({func:"createMirage",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
                case "Stability Field":
                    this.text.push({func:"createStabilityField",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
            }
        },
        useItem:function(user,target,item){
            var newText;
            switch(item.name){
                case "Potion":
                    newText = this.entity.skillFuncs["healHp"](20,target,user);
                    break;
            }
            for(var i=0;i<newText.length;i++){
                this.text.push(newText[i]);
            }
        },
        //Checks against the defender's resistance of a certain skill type.
        checkResisted:function(attacker,defender,skill){
            //If the skill always hits allies and the target is an ally, it hit.
            if(skill.range[2]==="allyNoMiss"&&attacker.p.team===defender.p.team) return false;
            var skillResist = skill.resist;
            for(var i=0;i<skillResist.length;i++){
                if(skillResist[i]==="physical"||skillResist[i]==="mental"||skillResist[i]==="magical"){
                    var rand = Math.floor(Math.random()*100);
                    var stat = defender.p.combatStats[skillResist[i]+"Resistance"];
                    if(rand<stat) return true;
                }
            }
            return false;
        },
        calcAttack:function(attacker,defender,skill){
            if(attacker.p.combatStats.hp<=0) return;
            //The time it takes between defensive animations
            //This sometimes is different depending on the skill
            var time;
            var damage;
            var sound;
            if(skill){
                if(this.checkResisted(attacker,defender,skill)){
                    this.text.push({func:"showResisted",obj:defender,props:[attacker]});
                    return;
                }
                switch(skill.type){
                    case "Consumable":
                        var bag = Q.state.get("Bag");
                        bag.decreaseItem(skill,skill.kind);
                        this.useItem(attacker,defender,skill);
                        return;
                    case "Support":
                        this.useSupportSkill(attacker,defender,skill);
                        return;
                    case "Debilitate":
                        this.useDebilitateSkill(attacker,defender,skill);
                        break;
                    case "Damage":
                        props = this.useDamageSkill(attacker,defender,skill);
                        damage = Math.max(0,props.damage);
                        sound = props.sound;
                        break;
                    case "Item":
                        this.useItem(attacker,defender,skill);
                        break;
                }
            } 
            //Regular attack
            else {
                var blow = this.getBlow({
                    attackNum:Math.ceil(Math.random()*100),
                    defendNum:Math.ceil(Math.random()*100),
                    attackerCritChance:attacker.p.combatStats.critChance,
                    attackerAtkAccuracy:attacker.p.combatStats.atkAccuracy,
                    defenderCounterChance:defender.p.combatStats.counterChance,
                    defenderReflexes:defender.p.combatStats.reflexes,
                    defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                    defenderFainted:defender.p.fainted,
                    attacker:attacker,
                    defender:defender
                });
                var props = this.processResult({
                    result:blow,
                    attackerFainted:attacker.p.fainted,
                    attackerAtkSpeed:attacker.p.combatStats.atkSpeed,
                    attackerMaxAtkDmg:attacker.p.combatStats.maxAtkDmg,
                    attackerMinAtkDmg:attacker.p.combatStats.minAtkDmg,
                    defenderHP:defender.p.combatStats.hp,
                    defenderDamageReduction:defender.p.combatStats.damageReduction,
                    defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                    defenderAtkRange:defender.p.combatStats.atkRange,
                    attacker:attacker,
                    defender:defender
                });
                damage = props.damage;
                sound = props.sound;
            }
            //After the damage has been calculated, come up with the text to show the user
            if(damage>0){
                //Only faint if the defender does not die
                if(damage<defender.p.combatStats.hp&&damage>defender.p.combatStats.painTolerance){
                    defender.p.fainted = true;
                    this.text.splice(this.text.length-2,0,{func:"showFainted",obj:defender,props:[attacker]});
                }
                this.text.push({func:"playAttack",obj:attacker,props:[attacker.p.dir]});
                this.text.push({func:"takeDamage",obj:defender,props:[damage,attacker]});
                this.text.push({func:"showDamage",obj:defender,props:[damage,time,sound]});
            } 
            //Miss
            else if(damage===0){
                this.text.push({func:"showMiss",obj:defender,props:[attacker,time]});
            } 
            //Counter chance
            else if(damage===-1){
                this.previousDamage = 0;
                if(skill){
                    this.text.push({func:"showMiss",obj:defender,props:[attacker,time]});
                } else {
                    this.text.push({func:"showCounter",obj:defender,props:[attacker,time]});
                    this.calcAttack(defender,attacker);
                }
            }
        },
        doAttack:function(attacker,targets,skill){
            this.text = [];
            var anim = "Attack";
            var sound = "slashing";
            attacker.p.didAction = true;
            if(skill){
                if(skill.cost) {
                    attacker.p.combatStats.tp-=(skill.cost-attacker.p.combatStats.efficiency);
                    //Save the sp use
                    attacker.trigger("saveProp",{name:"tp",value:attacker.p.combatStats.tp});
                }
                if(skill.anim) anim = skill.anim;
                if(skill.sound) sound = skill.sound;
            }
            //If we have targetted the ground.
            if(!targets.length){
                this.useGroundSkill(Q.pointer.p.loc,attacker,skill);
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                this.calcAttack(attacker,targets[i],skill);
                this.previousDamage = 0;
            }
            
            var text = this.text;
            //If a defender died, there will be an exp gain
            if(this.expText.length){
                //Wait between damage and exp gain
                text.push({func:"waitTime",obj:this,props:[800]});
                text.push.apply(text,this.expText);
                //Empty the expText array for next time
                this.expText = [];
            }
            var obj = this;
            attacker.doAttackAnim(targets,anim,sound,function(){
                obj.doDefensiveAnim(text);
            });
        },
        //Play the defensive animation for each targetted character
        doDefensiveAnim:function(text){
            var t = text.shift();
            var time = t.obj[t.func].apply(t.obj,t.props);
            var obj = this;
            setTimeout(function(){
                if(text.length){
                    obj.doDefensiveAnim(text);
                } else {
                    obj.entity.attackFuncs.finishAttack();
                }
            },time);
        },
        finishAttack:function(){
            var active = Q.BatCon.turnOrder[0];
            //The current character died (from being counter attacked, etc...)
            if(active.p.combatStats.hp<=0||active.p.fainted){
                Q.BatCon.endTurn();
                return;
            }
            //Remove any characters that have been defeated
            //Q.BatCon.removeMarked();
            //If this character has now attacked and moved, end their turn.
            if(active.p.didMove){
                if(active.p.canSetDir){
                    Q.BatCon.showEndTurnDirection(active,active.p.canSetDir);
                    active.p.canSetDir = false;
                }
                //TEMP
                else if(true||active.p.team!=="enemy"){
                    //Q.BatCon.showEndTurnDirection(active);
                    Q.BatCon.endTurn();
                } else {
                    //Set the AI's direction and end its turn
                }
            }   
            //If the character has not moved yet
            else {
                //Check if there's either no more enemies, or no more allies
                if(Q.BatCon.checkBattleOver()) return;
                //Get the new walk matrix since objects may have moved
                active.p.walkMatrix = new Q.Graph(Q.getMatrix("walk",active.p.team,active.p.canMoveOn));
                //Snap the pointer to the current character
                Q.pointer.snapTo(active);
                //If the current character is not AI
                //TEMP
                if(true||active.p.team!=="enemy"){
                    Q.stage(2).ActionMenu.show();
                    Q.stage(2).ActionMenu.menuControls.turnOnInputs();
                    Q.stage(2).ActionMenu.displayMenu(0,0);
                } else {
                    //Do whatever the AI does after attacking and can still move
                }
            }
        },
        waitTime:function(time){
            return time?time:1000;
        }
    });
    Q.component("skillFuncs",{
        pull:function(target,user){
            var tiles = 1;
            var text = [];
            var userTileTo = [];
            var targetTileTo = [user.p.loc[0],user.p.loc[1]];
            //Pulling in the y direction
            if(user.p.loc[0]===target.p.loc[0]){
                //Pulling up
                if(user.p.loc[1]-target.p.loc[1]>0){
                    userTileTo = [user.p.loc[0],user.p.loc[1]+tiles];
                } 
                //Pulling down
                else {
                    userTileTo = [user.p.loc[0],user.p.loc[1]-tiles];
                }
            }
            //Pulling in the x direction
            else if(user.p.loc[1]===target.p.loc[1]){
                //Pulling left
                if(user.p.loc[0]-target.p.loc[0]>0){
                    userTileTo = [user.p.loc[0]+tiles,user.p.loc[1]];
                } 
                //Pulling right
                else {
                    userTileTo = [user.p.loc[0]-tiles,user.p.loc[1]];
                }
            }
            if(!Q.BattleGrid.getObject(userTileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(userTileTo),user)!=="impassable"){
                text.push({func:"pulled",obj:target,props:[targetTileTo,userTileTo,user]});
            };
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
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(tileTo),target)!=="impassable"){
                text.push({func:"pushed",obj:target,props:[tileTo]});
            };
            return text;
        },
        chargeThrough:function(target,user){
            var tiles = 1;
            var text = [];
            var tileTo = [];
            //Charging in the y direction
            if(user.p.loc[0]===target.p.loc[0]){
                //Charging up
                if(user.p.loc[1]-target.p.loc[1]>0){
                    tileTo = [target.p.loc[0],target.p.loc[1]-tiles];
                } 
                //Charging down
                else {
                    tileTo = [target.p.loc[0],target.p.loc[1]+tiles];
                }
            }
            //Charging in the x direction
            else if(user.p.loc[1]===target.p.loc[1]){
                //Charging left
                if(user.p.loc[0]-target.p.loc[0]>0){
                    tileTo = [target.p.loc[0]-tiles,target.p.loc[1]];
                } 
                //Charging right
                else {
                    tileTo = [target.p.loc[0]+tiles,target.p.loc[1]];
                }
            }
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(tileTo),user)!=="impassable"){
                text.push({func:"chargedThrough",obj:user,props:[tileTo,target]});
            };
            return text;
        },
        addStatus:function(status,turns,type,target,user,props){
            var text = [];
            var num = turns;
            if(Q._isArray(turns)){
                num = Math.floor(Math.random()*turns[1])+turns[0];
            }
            var curStatus = target.hasStatus(status);
            if(curStatus){
                curStatus.turns = curStatus.turns>num?num:curStatus.turns;
                text.push({func:"refreshStatus",obj:target,props:[status,num,user,props]});
            } else {
                text.push({func:"addStatus",obj:target,props:[status,num,type,user,props]});
            }
            //text.push({func:"waitTime",obj:this.entity.attackFuncs,props:[100]});
            return text;
        },
        removeDebuff:function(name,target,user){
            if(name==="all"){
                return [{func:"removeAllBadStatus",obj:target,props:[]}];
            } else {
                return [{func:"removeStatus",obj:target,props:[name]}];
            }
        },
        healTp:function(amount,target,user){
            var text = [];
            if(target.p.combatStats.tp+amount>target.p.combatStats.maxTp) amount=target.p.combatStats.maxTp-target.p.combatStats.tp;
            target.p.combatStats.tp+=amount;
            text.push({func:"showHealed",obj:target,props:[amount]});
            return text;
        },
        healHp:function(amount,target,user){
            var text = [];
            if(target.p.combatStats.hp+amount>target.p.combatStats.maxHp) amount=target.p.combatStats.maxHp-target.p.combatStats.hp;
            target.p.combatStats.hp+=amount;
            text.push({func:"showHealed",obj:target,props:[amount]});
            return text;
        },
        
        changeCombatStat:function(amount,stat,target,user){
            var text = [];
            target.p.combatStats[stat]+=amount;
            text.push({func:"showStatUp",obj:target,props:[amount,stat]});
            return text;
        },
        createMirage:function(loc,user){
            if(user.p.mirage) user.p.mirage.dispellMirage();
            user.p.mirage = user.stage.insert(new Q.Mirage({loc:loc,objType:"mirage",user:user}));
        },
        createStabilityField:function(loc,user){
            
        }
    });
    
    Q.GameObject.extend("CharacterGenerator",{
        init:function(){
            var data = Q.state.get("charGeneration");
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
            this.secondaryStats = data.secondaryStats;
            this.order = data.order;
            this.autoChance = data.autoChance;
            
            this.equipment = Q.state.get("equipment");
            this.qualityKeys = Object.keys(this.equipment.Quality);
        },
        //Generates a character by processing the passed in data.
        //All properties are included except loc and dir, which depend on the event.
        //These properties should be added to the returned character
        generateCharacter:function(data,type){
            var char = {};
            var act = "Act-"+Q.state.get("saveData").act;
            switch(type){
                //Create a character for the applications roster.
                //Data will not be completely random, but will be based on the act/chapter.
                //Seeds are taken from the character-genartion.json file.
                case "roster":
                    char.team = "ally";
                    //Generate the level based on the Act
                    char.level = data.level || this.generateLevel(act);
                    char.nationality = data.nationality || this.generateNationality(act);
                    
                    if(data.personality){
                        char.personality = data.personality;
                    } else {
                        char.personality = [];
                        for(var i=0,j=Math.ceil(Math.random()*3);i<j;i++){
                            char.personality.push(this.generatePersonality());
                        }
                    }
                    
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass || this.generateCharClass(char.nationality);
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.primaryStat = this.primaryStats[char.classNum];
                    char.secondaryStat = this.secondaryStats[char.classNum];
                    //Generate random values for the roster. At the moment it's the same as enemy generation
                    char.equipment = this.getEquipment(
                        {
                            "righthand": [
                                "Default",
                                "Default",
                                "Default"
                            ],
                            "lefthand": [
                                "Default",
                                "Default",
                                "Default"
                            ],
                            "armour": [
                                "Default",
                                "Default",
                                "Default"
                            ],
                            "footwear": [
                                "Default",
                                "Default",
                                "Default"
                            ],
                            "accessory": "None"
                        },char.classNum,char.natNum,char.level);
                    char.techniques = this.getTechniques(data.techniques) || this.generateTechniques(char.charClass,char.level);//Requires charClass and level
                    char.talents = this.getTalents(char.charClass,char.charGroup);
                    char.baseStats = data.baseStats || this.statsToLevel(this.generateBaseStats(),char.primaryStat,char.secondaryStat,char.level);//Requires level, primary, and secondary
                    char.gender = data.gender || this.generateGender(char.charClass,char.natNum);//Requires charClass and natNum
                    char.name = data.name || this.generateName(char.natNum,char.gender);//Requires natNum and gender
                    char.combatStats = this.getCombatStats(char);
                    
                    char.exp = data.exp || 0;
                    char.loyalty = data.loyalty || 50;
                    char.morale = data.morale || 50;
                    break;
                //Special case for Alex as he/she does not have personality, methodology, value, loyalty, or morale.
                case "alex":
                    char.team = "ally";
                    char.officer = true;
                    char.name = data.name;
                    char.level = data.level;
                    char.gender = data.gender;
                    char.equipment = {
                        righthand:data.equipment.righthand?this.convertEquipment([data.equipment.righthand[1],data.equipment.righthand[2]],data.equipment.righthand[0]):false,
                        lefthand:data.equipment.lefthand?this.convertEquipment([data.equipment.lefthand[1],data.equipment.lefthand[2]],data.equipment.lefthand[0]):false,
                        armour:data.equipment.armour?this.convertEquipment([data.equipment.armour[1],data.equipment.armour[2]],data.equipment.armour[0]):false,
                        footwear:data.equipment.footwear?this.convertEquipment([data.equipment.footwear[1],data.equipment.footwear[2]],data.equipment.footwear[0]):false,
                        accessory:data.equipment.accessory?this.equipment.gear[data.accessory]:false
                    };
                    char.baseStats = data.baseStats;
                    char.techniques = this.getTechniques(data.techniques);
                    char.nationality = data.nationality;
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    char.talents = this.getTalents(char.charClass,char.charGroup);
                    
                    char.exp = data.exp;
                    char.primaryStat = data.primaryStat;
                    char.secondaryStat = data.secondaryStat;
                    
                    char.combatStats = this.getCombatStats(char);
                    char.uniqueId = 0;
                break;
                //This is done when generating an officer from the officers.json. Only do this for new officers.
                //Officers have all of their properties preset so they always start the same each playthrough.
                case "officer":
                    //Set this character to officer for easy reference later.
                    char.officer = true;
                    data.uniqueId = 0;
                //Take the save data and create an ally character based on it.
                //This is done only when the game is initialized.
                case "saved":
                    char.team = "ally";
                    char.name = data.name;
                    char.uniqueId = data.uniqueId;
                    char.level = data.level;
                    char.gender = data.gender;
                    
                    char.equipment = {
                        righthand:data.equipment.righthand?this.convertEquipment([data.equipment.righthand[1],data.equipment.righthand[2]],data.equipment.righthand[0]):false,
                        lefthand:data.equipment.lefthand?this.convertEquipment([data.equipment.lefthand[1],data.equipment.lefthand[2]],data.equipment.lefthand[0]):false,
                        armour:data.equipment.armour?this.convertEquipment([data.equipment.armour[1],data.equipment.armour[2]],data.equipment.armour[0]):false,
                        footwear:data.equipment.footwear?this.convertEquipment([data.equipment.footwear[1],data.equipment.footwear[2]],data.equipment.footwear[0]):false,
                        accessory:data.equipment.accessory?this.equipment.gear[data.accessory]:false
                    };
                    char.baseStats = data.baseStats;
                    char.techniques = this.getTechniques(data.techniques);
                    char.nationality = data.nationality;
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    char.talents = this.getTalents(char.charClass,char.charGroup);
                    
                    char.value = data.value;
                    char.methodology = data.methodology;
                    char.exp = data.exp;
                    char.primaryStat = data.primaryStat;
                    char.secondaryStat = data.secondaryStat;
                    char.loyalty = data.loyalty;
                    char.morale = data.morale;
                    char.personality = data.personality;
                    
                    char.combatStats = this.getCombatStats(char);
                    break;
                //Create an enemy used in battles
                //The data will include a reference to the actual character properties that are in the character's file.
                case "enemy":
                    char.team = "enemy";
                    char.loc = data.loc;
                    char.dir = data.dir;
                    char.uniqueId = data.uniqueId;
                    char.exp = 0;
                    //Reset the data variable
                    data = Q.state.get("characterFiles")[data.file][data.group][data.handle];
                    
                    //Random number between levelmin and levelmax
                    char.level = Math.floor(Math.random()*(data.levelmax-data.levelmin))+data.levelmin;
                    char.nationality = data.nationality==="Random"?this.generateNationality(act):data.nationality;
                    
                    char.natNum = this.getNatNum(char.nationality);
                    char.charClass = data.charClass==="Random"?this.generateCharClass(char.nationality):data.charClass;
                    char.classNum = this.getClassNum(char.charClass);
                    char.charGroup = this.generateCharGroup(char.classNum);
                    
                    char.primaryStat = this.primaryStats[char.classNum];
                    char.secondaryStat = this.secondaryStats[char.classNum];
                    
                    char.equipment = this.getEquipment(data.equipment,char.classNum,char.natNum,char.level);
                    char.techniques = this.getTechniques(this.setLevelTechniques(data.techniques,char.level));//Techniques are always filled out and are not random for enemies.
                    char.talents = this.getTalents(char.charClass,char.charGroup);
                    char.baseStats = this.enemyBaseStats(data.baseStats,char.level,char.primaryStat,char.secondaryStat);
                    
                    char.gender = data.gender==="Random"?this.generateGender(char.charClass,char.natNum):data.gender;//Requires charClass and natNum
                    char.name = data.name.length ? data.name : this.generateName(char.natNum,char.gender);
                    
                    char.combatStats = this.getCombatStats(char);
                    break;
                //Creates a simple character sprite used in battle scenes.
                //Doesn't generate combat 
                case "simple":
                    
                    break;
            }
            return char;
        },
        equipQuality:function(val,level){
            var qualities = Q.state.get("defaultEquipment").quality;
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
                    var gear = Q.state.get("defaultEquipment").gear;
                    var eq = gear[classNum][natNum][position];
                    //Randomize between the few that are here
                    //The 0th position is reserved for the random chance array.
                    return eq[this.getIdx(eq[0],this.rand())+1];
                case "None":
                    return false;
                default:
                    return [gear,material];
            }
        },
        //Changes the equipment from an array to an object containing all of the stats from equipment.json
        //eq is an array [gearMaterial,gearName]
        convertEquipment:function(eq,quality){
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
            var materialData = this.equipment.Materials[gear.material];
            var qualityData = this.equipment.Quality[gear.quality];
            gear.weight = Math.ceil(gear.weight+materialData[0]);
            gear.cost = Math.ceil(gear.cost*qualityData[1]*materialData[2]);
            if(gear.block) gear.block = Math.ceil(gear.block*materialData[1]*qualityData[0]);
            if(gear.wield) gear.wield = Math.ceil(gear.wield*qualityData[0]);
            if(gear.mindmg) gear.mindmg = Math.ceil(gear.mindmg*materialData[1]);
            if(gear.maxdmg) gear.maxdmg = Math.ceil(gear.maxdmg*materialData[1]);
            if(gear.speed) gear.speed = Math.ceil(gear.speed*qualityData[0]);
            if(gear.damageReduction) gear.damageReduction = Math.ceil(gear.damageReduction*materialData[1]*qualityData[0]);
            return gear;
        },
        //TODO: promotions
        getTalents:function(charClass,charGroup,promo){
            promo = promo || 0;
            var talents = Q.state.get("talents");
            //Each character gets at least two talents.
            var t = [talents.General[charGroup][0],talents.CharClass[charClass][0]];
            if(promo===1){
                t.push(talents.CharClass[charClass][1]);
            } else if(promo===2){
                t.push(talents.CharClass[charClass][1]);
                t.push(talents.CharClass[charClass][2]);
            }
            return t;
        },
        getEquipment:function(val,classNum,natNum,level){
            var rh = this.convertEquipment(this.equipGear(val.righthand[1],val.righthand[2],classNum,natNum,0),this.equipQuality(val.righthand[0],level));
            var lh = false;
            if(rh.hands!==2){
                lh = this.convertEquipment(this.equipGear(val.lefthand[1],val.lefthand[2],classNum,natNum,1),this.equipQuality(val.lefthand[0],level));
            }
            var ar = this.convertEquipment(this.equipGear(val.armour[1],val.armour[2],classNum,natNum,2),this.equipQuality(val.armour[0],level));
            var ft = this.convertEquipment(this.equipGear(val.footwear[1],val.footwear[2],classNum,natNum,3),this.equipQuality(val.footwear[0],level));
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
        getTechniques:function(techs){
            if(!techs) return;
            var fullTechs = [];
            var allSkills = Q.state.get("allSkills");
            for(var i=0;i<techs.length;i++){
                if(techs[i].length){
                    fullTechs.push(allSkills[techs[i]]);
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
        enemyBaseStats:function(val,level,primary,secondary){
            if(Q._isArray(val)){
                switch(val[0]){
                    case "Random":
                        switch(val[1]){
                            case "Low":
                                return this.statsToLevel(this.generateBaseStats(10,5),primary,secondary,level);
                            case "Medium":
                                return this.statsToLevel(this.generateBaseStats(12,5),primary,secondary,level);
                            case "High":
                                return this.statsToLevel(this.generateBaseStats(15,5),primary,secondary,level);
                            case "Maxed":
                                return this.statsToLevel(this.generateBaseStats(20,0),primary,secondary,level);
                        }
                        break;
                    case "Specialized":
                        switch(val[1]){
                            case "Low":
                                var stats = this.statsToLevel(this.generateBaseStats(10,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "Medium":
                                var stats = this.statsToLevel(this.generateBaseStats(12,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "High":
                                var stats = this.statsToLevel(this.generateBaseStats(15,5),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
                                return stats;
                            case "Maxed":
                                var stats = this.statsToLevel(this.generateBaseStats(20,0),primary,secondary,level);
                                stats[primary]+=5;
                                stats[secondary]+=3;
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
            return this.personalities.muchValues[Math.floor(Math.random()*this.personalities.muchValues.length)],this.personalityNames[this.traitsKeys[Math.floor(Math.random()*this.traitsKeys.length)]];
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
        levelUp:function(statTo,stats,primary,secondary){
            switch(statTo){
                case "primary":
                    stats[primary]+=1;
                    break;
                case "secondary":
                    stats[secondary]+=1;
                    break;
                case "random":
                    stats[this.statNames[Math.floor(Math.random()*this.statNames.length)]]+=1;
                    break;
                case "auto":
                    stats = this.levelUp(this.autoChance[Math.floor(Math.random()*this.autoChance.length)],stats,primary,secondary);
                    break;
            }
            return stats;
        },
        statsToLevel:function(stats,primary,secondary,level){
            stats[primary]+=5;
            stats[secondary]+=3;
            for(var idx=0;idx<level;idx++){
                var num = idx%this.order.length;
                stats = this.levelUp(this.order[num],stats,primary,secondary);
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
            return this.getTechniques(techs);
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
            
            char.combatStats.hp = char.combatStats.maxHp;
            char.combatStats.tp = char.combatStats.maxTp;
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
            var rfl = p.combatStats.reflexes, encPenalty = p.combatStats.encumbrancePenalty,level = p.level,block = this.getEquipmentProp("block",p.equipment.lefthand);
            return rfl+encPenalty+level+block;
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
            var wsk = p.combatStats.weaponSkill,
                wield = ((this.getEquipmentProp("wield",p.equipment.righthand)+this.getEquipmentProp("wield",p.equipment.lefthand))/2), 
                encPenalty = p.combatStats.encumbrancePenalty,
                level = p.level;
            return Math.min(99,Math.floor(wsk+wield+encPenalty+level));
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
            return Math.min(99,Math.floor(dex+weaponSpeedRight+(weaponSpeedLeft/2)+encPenalty+(level*d)));
        },
        get_atkRange:function(p){
            var attackRangeRight = this.getEquipmentProp("range",p.equipment.righthand), attackRangeLeft = this.getEquipmentProp("range",p.equipment.lefthand);
            return attackRangeRight>attackRangeLeft?attackRangeRight:attackRangeLeft;
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
            var encPenalty = p.combatStats.encumbrancePenalty,charGroup = p.charGroup;
            var m = charGroup==="Fighter"?6:charGroup==="Rogue"?7:charGroup==="Mage"?5:0;
            return m + Math.floor(encPenalty/10);
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
        
        get_strength:function(p){
            return p.baseStats.str;
        },
        get_endurance:function(p){
            return p.baseStats.end;
        },
        get_dexterity:function(p){
            return p.baseStats.dex;
        },
        get_weaponSkill:function(p){
            return p.baseStats.wsk;
        },
        get_reflexes:function(p){
            return p.baseStats.rfl;
        },
        get_initiative:function(p){
            return p.baseStats.ini;
        },
        get_energy:function(p){
            return p.baseStats.enr;
        },
        get_skill:function(p){
            return p.baseStats.skl;
        },
        get_efficiency:function(p){
            return p.baseStats.eff;
        }
        //Generates a character by filling in the blanks for data that is not set
        /*generateCharacter:function(data){
            function getSkills(skillsData){
                var skills = Q.state.get("skills");
                var keys = Object.keys(skillsData);
                
                var sk = {};
                keys.forEach(function(key){
                    sk[key] = [];
                    for(var i=0;i<skillsData[key].length;i++){
                        sk[key].push(skills[key][skillsData[key][i]]);
                    }
                });
                return sk; 
            }
            var char = {};
            
            char.officer = data.officer;
            char.awards = data.awards?data.awards:this.setUpAwards();
            
            char.nationality = data.nationality?data.nationality:this.generateProp("nationality",char);
            char.natNum = Q.getNationalityNum(char.nationality);
            
            char.charClass = data.charClass?data.charClass:this.generateProp("charClass",char);
            char.classNum = Q.getCharClassNum(char.charClass);
            
            char.level = data.level?data.level:this.generateProp("level",char);
            
            char.skills = data.skills?getSkills(data.skills):this.generateSkills(char);
            
            char.gender = data.gender?data.gender:this.generateProp("gender",char);
            char.exp = data.exp?data.exp:0;
            char.baseStats = data.baseStats?data.baseStats:this.getStats(char.level,char.classNum);
            //No equipment is set
            if(!data.equipment){
                char.equipment = this.generateAllEquipment(char);
            } 
            //Some equipment is set
            else {
                char.equipment = {};
                char.equipment.righthand = data.equipment.righthand?data.equipment.righthand:this.randomizeEquipment("Weapon");
                char.equipment.lefthand = false;//data.equipment.lefthand?data.equipment.lefthand:this.randomizeEquipment("Weapon");
                char.equipment.armour = data.equipment.armour?data.equipment.armour:this.randomizeEquipment("Armour");
                char.equipment.footwear = data.equipment.footwear?data.equipment.footwear:this.randomizeEquipment("Footwear");
                char.equipment.accessory = false;//data.equipment.accessory?data.equipment.accessory:this.randomizeEquipment("Accessory");
            }
            
            
            char.value = data.value?data.value:this.generateProp("value",char);
            char.methodology = data.methodology?data.methodology:this.generateProp("methodology",char);
            char.loyalty = data.loyalty?data.loyalty:50;
            char.morale = data.morale?data.morale:50;
            char.name = data.name?data.name:this.generateProp("name",char);
            //TODO: make sure that if a character has the same name as another character, they have a different uniqueId
            char.uniqueId = data.uniqueId?data.uniqueId:0;
            char.combatStats = this.generateStats(char);
            
            //For now, there is only one personality generated
            char.personality = data.personality?data.personality:[this.generateProp("personality")];
            
            //Clone the scenesList. When an event is shown from this character, remove it.
            char.events =  JSON.parse(JSON.stringify(Q.state.get("scenesList").Character));
            
            //Checks if this character should trigger an event
            char.checkEvents = function(prop){
                //Step 1: Check if any conditions are met to do an event
                //Step 2: Make sure the event hasn't been completed yet
                //Step 3: Add the event to the potentialEvents in Q.state
                var scene = "";
                var event = "";
                //Only do events based on what property has changed (So we don't get unrelated events triggering).
                switch(prop){
                    case "feasted":
                        scene = "Feasts";
                        //If the character is Hedonistic
                        if(this.hasPersonality("Hedonistic")){
                            event = this.findEvent(scene,"HedonisticFeast");
                        }
                        //The character has never been to a feast and is the guest of honour.
                        else if(this.awards.feasted===1&&this.awards.guestOfHonour===1){
                            event = this.findEvent(scene,"Feast1");
                        } 
                        //The character has been to a feast before and is now the guest of honour.
                        else if(this.awards.feasted>2&this.awards.guestOfHonour===1){
                            event = this.findEvent(scene,"Feast2");
                        }
                        //If the character has been the guest of honour 5 times
                        else if(this.awards.guestOfHonour>=5){
                            event = this.findEvent(scene,"Feast3");
                        }
                        break;
                    case "enemiesDefeated":
                        scene = "EnemiesDefeated";
                        //Enemies defeated is at least 200
                        if(this.awards.enemiesDefeated>=200){
                            event = this.findEvent(scene,"EnemiesDefeated200");
                        }
                        //Enemies defeated is at least 100
                        else if(this.awards.enemiesDefeated>=100){
                            event = this.findEvent(scene,"EnemiesDefeated100");
                        } 
                        //Enemies defeated is at least 50
                        else if(this.awards.enemiesDefeated>=50){
                            event = this.findEvent(scene,"EnemiesDefeated50");
                        }
                        break;
                    case "assisted":
                        scene = "Assisted";
                        //Assisted is at least 500
                        if(this.awards.assisted>=500){
                            event = this.findEvent(scene,"Assisted500");
                        }
                        //Assisted is at least 250
                        else if(this.awards.assisted>=250){
                            event = this.findEvent(scene,"Assisted250");
                        } 
                        //Assisted is at least 100
                        else if(this.awards.assisted>=100){
                            event = this.findEvent(scene,"Assisted100");
                        }
                        break;
                    case "battlesParticipated":
                        scene = "BattlesParticipated";
                        if(this.awards.battlesParticipated>=20){
                            event = this.findEvent(scene,"BattlesParticipated20");
                        }
                        else if(this.awards.battlesParticipated>=10){
                            event = this.findEvent(scene,"BattlesParticipated10");
                        } 
                        else if(this.awards.battlesParticipated>=5){
                            event = this.findEvent(scene,"BattlesParticipated5");
                        }
                        break;
                    case "damageDealt":
                        scene = "DamageDealt";
                        if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"DamageDealt5000");
                        }
                        else if(this.awards.damageDealt>=2500){
                            event = this.findEvent(scene,"DamageDealt2500");
                        } 
                        else if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"DamageDealt500");
                        }
                        break;
                    case "damageTaken":
                        scene = "DamageTaken";
                        if(this.awards.damageTaken>=10000){
                            event = this.findEvent(scene,"DamageTaken10000");
                        }
                        else if(this.awards.damageTaken>=5000){
                            event = this.findEvent(scene,"DamageTaken5000");
                        } 
                        else if(this.awards.damageTaken>=1000){
                            event = this.findEvent(scene,"DamageTaken1000");
                        }
                        break;
                    case "selfHealed":
                        scene = "SelfHealed";
                        if(this.awards.selfHealed>=5000){
                            event = this.findEvent(scene,"SelfHealed5000");
                        }
                        else if(this.awards.damageDealt>=2500){
                            event = this.findEvent(scene,"SelfHealed2500");
                        } 
                        else if(this.awards.damageDealt>=500){
                            event = this.findEvent(scene,"SelfHealed500");
                        }
                        break;
                    case "targetHealed":
                        scene = "TargetHealed";
                        if(this.awards.targetHealed>=10000){
                            event = this.findEvent(scene,"TargetHealed10000");
                        }
                        else if(this.awards.targetHealed>=5000){
                            event = this.findEvent(scene,"TargetHealed5000");
                        } 
                        else if(this.awards.targetHealed>=1000){
                            event = this.findEvent(scene,"TargetHealed1000");
                        }
                        break;
                    case "wounded":
                        scene = "Wounded";
                        if(this.awards.timesWounded>=20){
                            event = this.findEvent(scene,"Wounded20");
                        }
                        else if(this.awards.timesWounded>=10){
                            event = this.findEvent(scene,"Wounded10");
                        } 
                        else if(this.awards.timesWounded>=5){
                            event = this.findEvent(scene,"Wounded5");
                        }
                        break;
                    case "rested":
                        scene = "Rested";
                        if(this.awards.timesRested>=20){
                            event = this.findEvent(scene,"Rested20");
                        }
                        else if(this.awards.timesRested>=10){
                            event = this.findEvent(scene,"Rested10");
                        } 
                        else if(this.awards.timesRested>=5){
                            event = this.findEvent(scene,"Rested5");
                        }
                        break;
                    //Each time the character is mentored, they get a scene
                    case "mentored":
                        scene = "Mentored";
                        if(this.awards.mentored>=3){
                            event = this.findEvent(scene,"Mentored3");
                        }
                        else if(this.awards.mentored>=2){
                            event = this.findEvent(scene,"Mentored2");
                        } 
                        else if(this.awards.mentored>=1){
                            event = this.findEvent(scene,"Mentored1");
                        }
                        break;
                    case "hunted":
                        scene = "Hunted";
                        if(this.awards.timesHunted>=3){
                            event = this.findEvent(scene,"Hunted3");
                        }
                        else if(this.awards.timesHunted>=2){
                            event = this.findEvent(scene,"Hunted2");
                        } 
                        else if(this.awards.timesHunted>=1){
                            event = this.findEvent(scene,"Hunted1");
                        }
                        break;
                    //Any custom events that require unique conditions
                    case "custom":
                        scene = "Custom";
                        //Nomadic Legionnaire's backstory is triggered when the reputation with Venoriae is low and loyalty of the character is high.
                        if(Q.state.get("saveData").relations.Venoriae[0]<=30&&this.loyalty>=70){
                            event = this.findEvent(scene,"NomadicLegionnaireBackstory");
                        }
                        break;
                }
                if(scene.length&&event.length) Q.state.get("potentialEvents").push([char,scene,event]);
            };
            //Search to see if the character has triggered this event already.
            char.findEvent = function(scene,event){
                return this.events[scene].filter(function(ev){
                    return ev===event;
                })[0];
            };
            //Check through the character's personality array to see if they have a certain personality.
            char.hasPersonality = function(per){
                var hasPersonality = false;
                this.personality.forEach(function(p){
                    if(p===per) hasPersonality = true;
                });
                return hasPersonality;
            };
            return char;
        },
        setUpAwards:function(){
            var awards = Q.state.get("awards");
            var keys = Object.keys(awards);
            var obj = {};
            //The default value for all awards is 0
            keys.forEach(function(key){
                obj[key] = 0;
            });
            return obj;
        },
        setAward:function(obj,prop,value){
            if(!obj) return;
            obj.p.awards[prop]+=value;
        }*/
    });
};
