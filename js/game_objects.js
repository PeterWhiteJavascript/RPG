Quintus.GameObjects=function(Q){
    //Used to place allies at the start of a battle
    Q.component("pointerPlaceAllies",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.BatCon.battlePlacement,"checkPlacement");
            this.entity.on("checkInputs");
            this.entity.on("checkConfirm");
        },
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.BatCon.battlePlacement,"checkPlacement");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerPlaceAllies");
        }
    });
    //When a pointer is selecting where the character should move to
    Q.component("pointerMoveControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.rangeController,"checkConfirmMove");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkInputs");
            this.entity.on("checkConfirm");
            this.entity.on("inputMoved",this,"inputMoved");
            this.entity.snapTo(this.entity.p.user);
        },
        disable:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.rangeController,"checkConfirmMove");
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
            this.entity.p.user = false;
        },
        pressedBack:function(){
            this.entity.snapTo(Q.rangeController.target);
            Q.rangeController.resetGrid();
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
            this.entity.p.user = false;
        },
        disable:function(){
            this.entity.off("pressedConfirm",this,"checkOnCharacter");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
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
                    var box = Q.stage(2).insert(new Q.BigStatusBox({target:this.entity.p.target}));
                    this.disable();
                    box.on("pressedBack",function(){
                        Q.pointer.add("pointerRoamingControls");
                        Q.pointer.pointerRoamingControls.added();
                    });
                }
            }
        }
    });
    Q.component("pointerDropControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",this,"checkValidToDrop");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkConfirm");
            this.entity.on("checkInputs");
        },
        
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",this,"checkValidToDrop");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerDropControls");
            this.entity.p.user = false;
        },
        checkValidToDrop:function(){
            var user = Q.BatCon.turnOrder[0];
            var loc = this.entity.p.loc;
            var objAt = user.p.lifting;
            if(!Q.BattleGrid.getObject(loc)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(loc),objAt)!=="impassable"){
                if(Q.BattleGrid.getTileDistance(user.p.loc,loc)>1) return Q.audioController.playSound("cannot_do.mp3");
                Q.BatCon.dropObject(user,objAt,loc);
                user.p.didAction = true;
                objAt.hideStatusDisplay();
                if(user.p.didMove){
                    Q.rangeController.resetGrid();
                    this.remove();
                    Q.BatCon.endTurn();
                } else {
                    this.pressedBack();
                    Q.stage(2).ActionMenu.displayMenu(0,0);
                }
            } else {
                Q.audioController.playSound("cannot_do.mp3");
            }
        },
        showMenu:function(){
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
        },
        pressedBack:function(){
            this.entity.snapTo(Q.BatCon.turnOrder[0]);
            Q.rangeController.resetGrid();
            this.remove();
            this.showMenu();
        }
    });
    Q.component("pointerLiftControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",this,"checkValidToCarry");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkConfirm");
            this.entity.on("checkInputs");
        },
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",this,"checkValidToCarry");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerLiftControls");
            this.entity.p.user = false;
        },
        checkValidToCarry:function(){
            var user = Q.BatCon.turnOrder[0];
            var loc = this.entity.p.loc;
            var objAt = Q.BattleGrid.getObject(loc);
            if(objAt&&objAt.validToCarry()){
                if(Q.BattleGrid.getTileDistance(user.p.loc,objAt.p.loc)>1) return Q.audioController.playSound("cannot_do.mp3");
                Q.BatCon.liftObject(user,objAt);
                user.p.didAction = true;
                user.p.lifting = objAt;
                objAt.p.lifted = user;
                objAt.hideStatusDisplay();
                if(user.p.didMove){
                    Q.rangeController.resetGrid();
                    this.remove();
                    Q.BatCon.endTurn();
                } else {
                    this.pressedBack();
                    Q.stage(2).ActionMenu.displayMenu(0,0);
                }
            } else {
                Q.audioController.playSound("cannot_do.mp3");
            }
        },
        showMenu:function(){
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
        },
        pressedBack:function(){
            this.entity.snapTo(Q.BatCon.turnOrder[0]);
            Q.rangeController.resetGrid();
            this.remove();
            this.showMenu();
            Q.rangeController.resetGrid();
        }
    });
    
    Q.component("pointerAttackControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",Q.rangeController,"checkConfirmAttack");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkConfirm");
            //Set up an aoe guide
            if(this.entity.p.skill){
                var skill = this.entity.p.skill;
                if(skill.aoe[1]==="straight"){
                    this.entity.p.movingStraight = true;
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    //The pointer is hidden
                    this.entity.hide();
                    this.entity.on("inputMoved",this.entity.AOEGuide,"moveStraightTiles");
                    //Force the first direction
                    var dir = this.entity.p.user.p.dir;
                    setTimeout(function(){
                        Q.inputs[dir]=true;
                    });
                } else if(skill.name==="Phalanx"){ 
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this.entity.AOEGuide,"movePhalanxTiles");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
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
                } else if(skill.aoe[1]==="T"){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this.entity.AOEGuide,"moveTTiles");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else if(skill.range[1]==="self"&&skill.range[0]===0){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.hide();
                    Q.inputs[this.entity.p.user.p.dir]=true;
                } else {
                    this.entity.on("inputMoved",this,"moveTiles");
                    this.entity.on("checkInputs");
                }
            } else {
                this.entity.on("checkInputs");
                this.entity.on("inputMoved",this,"inputMoved");
                var possibleTargets = Q.rangeController.getPossibleTargets(Q.rangeController.tiles);
                if(possibleTargets.length){
                    //Set the pointer on the first target
                    this.entity.snapTo(possibleTargets[0]);
                }
            }
        },
        inputMoved:function(){},
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",Q.rangeController,"checkConfirmAttack");
            this.entity.off("pressedBack",this,"pressedBack");
            if(this.entity.p.skill){
                if(this.entity.p.skill.aoe[1]==="straight"){
                    this.entity.p.movingStraight = false;
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveStraightTiles");
                } else if(this.entity.p.skill.aoe[1]==="hLine"){
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveHLineTiles");
                } else if(this.entity.p.skill.aoe[1]==="hLineForward"){
                    this.entity.off("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.off("inputMoved",Q.pointer.AOEGuide,"moveHLineForwardTiles");
                } else {
                    this.entity.off("checkInputs");
                    this.entity.off("inputMoved",this,"moveTiles");
                }
            } else {
                this.entity.off("checkInputs");
                this.entity.off("inputMoved",this,"inputMoved");
            }
            if(Q.pointer.has("AOEGuide")) Q.pointer.AOEGuide.destroyGuide();
            this.entity.off("checkConfirm");
            this.entity.p.skill = false;
            this.entity.del("pointerAttackControls");
            this.entity.p.user = false;
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
            Q.rangeController.resetGrid();
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
            var allies = Q.partyManager.allies;
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
                if(p.user) p.user.playStand(Q.compareLocsForDirection(p.user.p.loc,p.loc,p.user.p.dir));
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
            } 
            
            if(input['right']){
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
            return obj.p.team==="Enemy"?this.enemyZocGrid:this.allyZocGrid;
        },
        //Returns a grid that is as big as the level that is empty
        emptyGrid:function(){
            var grid = [];
            for(var i=0;i<Q.stage(0).mapHeight;i++){
                grid.push([]);
                for(var j=0;j<Q.stage(0).mapWidth;j++){
                    grid[i].push(0);
                }
            }
            return grid;
        },
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
            }
        },
        //Used to get rid of the object. Used in lifting and if an interactable is destroyed(TODO)
        removeObjectFromBattle:function(obj){
            if(obj.p.zoc) this.removeZOC(obj);
            this.removeObject(obj.p.loc);
        },
        getObjectsWithin:function(centerLoc,radius){
            var objects = [];
            for(var i=-radius;i<radius+1;i++){
                for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                    if(i===0&&j===radius) j++;
                    var object = this.getObject([centerLoc[0]+i,centerLoc[1]+j-(radius-Math.abs(i))]);
                    if(object) objects.push(object);
                }
            }
            return objects;
        },
        getObjectsAround:function(tiles){
            var objects = [];
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
        removeAllies:function(arr,allyTeam){
            return arr.filter(function(itm){
                return itm.p.team!==allyTeam;
            });
        },
        removeEnemies:function(arr,allyTeam){
            return arr.filter(function(itm){
                return itm.p.team===allyTeam;
            });
        },
        //Removes any objects that are dead
        removeDead:function(arr){
            return arr.filter(function(itm){
                return itm.p.combatStats.hp>0;
            });
        },
        removeDebilitateResisted:function(arr){
            return arr.filter(function(itm){
                return !itm.p.talents.includes("Self Empowerment");
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
        },
        
        checkIcyStatus:function(){
            if(this.icyStatus){
                //Check if any of the icy is expired
                for(var i=this.icyStatus.length-1;i>=0;i--){
                    var st = this.icyStatus[i];
                    st.turns--;
                    if(!st.turns){
                        for(var j=0;j<st.locs.length;j++){
                            this.icy.setTile(st.locs[j][0],st.locs[j][1],0);
                        }
                    }
                    this.icyStatus.splice(i,0);
                }
            }
        }
    });
    //All code for controlling placement of allies at the start of a battle.
    Q.component("battlePlacement",{
        checkPlacement:function(pointer){
            //If there's a character there, select it and go to the directional phase
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.placedOnMap){
                    if(ally.loc[0]===pointer.p.loc[0]&&ally.loc[1]===pointer.p.loc[1]){
                        ally.placedOnMap = false;
                        //Re-create the list of possible allies
                        Q.BatCon.battlePlacement.genPlaceableAllies();
                        //Find the ally's sprite and set up directional controls for this character
                        Q.stage(0).lists['Character'].forEach(function(char,j){
                            if(char.p.name===ally.name&&char.p.uniqueId===ally.uniqueId){
                                char.add("directionControls");
                                char.on("pressedConfirm",function(){
                                    Q.BatCon.battlePlacement.confirmPlacement(this);
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
            var tiles = this.entity.stage.options.data.placementSquares;
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
                Q.audioController.playSound("cannot_do.mp3");
            }
        },
        showPlacementSquares:function(tiles){
            var stage = this.entity.stage;
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
            
            Q.partyManager.allies.forEach(function(ally){
                if(ally.wounded) return;
                else if(ally.unavailable) return;
                else if(ally.placedOnMap) return;
                placeableAllies.push(ally);
            });
            this.placeableAllies = placeableAllies;
        },
        setAlliesDir:function(dir){
            dir = dir || "up";
            Q.partyManager.allies.forEach(function(ally){
                ally.dir = dir;
            });
        },
        //Start placing allies at the start of a battle
        startPlacingAllies:function(data){
            /*var t = this;
                t.startBattle();
                
            return;*/
            //Set all allies to the direction they should be facing for this battle
            this.setAlliesDir(data.defaultDir);
            this.genPlaceableAllies();
            Q.pointer.add("pointerPlaceAllies");
        },
        //Confirms when a character is placed after their direction is set
        confirmPlacement:function(char){
            //Find the character in placeable allies and set placedOnMap to true
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.name===char.p.name&&ally.uniqueId===char.p.uniqueId){
                    ally.placedOnMap = true;
                    ally.loc = char.p.loc;
                    i = allies.length;
                }
            }
            this.genPlaceableAllies();
            //If all allies are placed, start the battle. Also goes if we reach the max allies limit.
            var numPlaced = allies.filter(function(c){return c.placedOnMap;}).length;
            if(!this.placeableAllies.length||numPlaced===this.entity.stage.options.data.maxAllies){
                this.removePlacementSquares();
                this.entity.startBattle();
            } else {
                Q.pointer.add("pointerPlaceAllies");
            }
        }
    });
    Q.component("battleTriggers",{
        setUpTriggers:function(events){
            function battleEvent(conds,effects,required){
                this.conds = conds;
                this.effects = effects;
                this.required = required;
                this.completed = [];
            }
            //Each type of event goes in its own array and is all checked at once. An event will be in more than one array if it has multiple conditions.
            this.triggers = {
                rounds:[],
                charHealth:[]
            };
            //For each event
            for(var i=0;i<events.length;i++){
                var event = events[i];
                var obj = new battleEvent(event.conds,event.effects,event.required);
                //Loop through each condition and set up listeners
                for(var j=0;j<event.conds.length;j++){
                    this.triggers[event.conds[j][0]].push(obj);
                }
            }
        },
        effectsFuncs:{
            setVar:function(props){
                switch(props[0]){
                    case "Event":
                        Q.state.get("eventVars")[props[1]] = props[2];
                        break;
                    case "Scene":
                        Q.state.get("sceneVars")[props[1]] = props[2];
                        break;
                    case "Global":
                        Q.state.get("globalVars")[props[1]] = props[2];
                        break;
                }
            },
            spawnEnemy:function(props){
                var char = Q.stage(0).insert(new Q.Character(Q.charGen.generateCharacter({file:props[0],group:props[1],handle:props[2],loc:[props[3],props[4]],dir:props[5]})));
                //TODO: generate uniqueID
                //Add to allies or enemeies
                Q.BatCon.addToTeam(char);
                Q.BatCon.addToTurnOrder(char);
            },
            changeMusic:function(props){
                Q.playMusic(props[0]);
            }
        },
        triggerEffects:function(effects){
            for(var i=0;i<effects.length;i++){
                this.effectsFuncs[effects[i][0]](effects[i][1]);
            }
        },
        processCond:function(conds,obj){
            var name = conds[0];
            var props = conds[1];
            switch(name){
                case "rounds":
                    var round = obj;
                    //If recurring
                    if(props[2]){
                        if(props[1]%round===0){
                            props[2] -- ;
                            if(props[1] === 0){
                                return {recur:true};
                            } else {
                                return true;
                            }
                        }
                    } else {
                        if(Q.textModules.evaluateStringOperator(round,props[0],props[1])){
                            return true;
                        }
                    }
                    break;
                case "charHealth":
                    var char = obj;
                    if(props[0] === char.p.handle + " " + char.p.uniqueId){
                        var hpRatio = char.p.combatStats.hp / char.p.combatStats.maxHp;
                        switch(props[1]){
                            case "deadOrFainted":
                                if(hpRatio<=0 || char.hasStatus("fainted")) return true;
                            case "dead":
                                if(hpRatio<=0) return true;
                            case "fainted":
                                if(char.hasStatus("fainted")) return true;
                            case "fullHealth":
                                if(char.hpRatio===100) return true;
                            case "takenDamage":
                                if(char.hpRatio!==100) return true;
                            case "belowHalfHealth":
                                if(char.hpRatio<50) return true;
                        }
                    } else {
                        return false;
                    }
                    break;
            }
        },
        processTrigger:function(name,obj){
            for(var i=0;i<this.triggers[name].length;i++){
                var group = this.triggers[name][i];
                for(var j=group.conds.length-1;j>=0;j--){
                    if(group.conds[j][0]===name){
                        var complete = this.processCond(group.conds[j],obj);
                        if(complete){
                            this.completedCond(group,j);
                            if(!complete.recur) this.triggers[name].splice(j,1);
                        };
                    }
                }
            }
        },
        completedCond:function(obj,num){
            obj.completed.push(obj.conds.splice(num,1));
            if((obj.required&&obj.conds.length===0)){
                this.triggerEffects(obj.effects);
            }
        }
    });

    //The battle controller holds all battle specific code.
    Q.GameObject.extend("BattleController",{
        init:function(){
            //Any characters that have their hp reduced to 0 or under get removed all at once (they get destroyed when they're killed, but only removed here after)
            this.markedForRemoval = [];
            this.round = 0;
            this.add("battlePlacement, battleTriggers, attackFuncs, skillFuncs");
        },
        
        //Run once at the start of battle
        startBattle:function(){
            this.allies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="Ally"; 
            });
            this.enemies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="Enemy"; 
            });
            this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            //Do start battle animation, and then start turn (TODO)
            this.startTurn();
        },
        finishBattle:function(props){
            //Save some of the properties for allies
            this.allies.forEach(function(ally){
                //Find the associated saved ally
                var char = Q.partyManager.allies.filter(function(c){
                    return c.name===ally.p.name&&c.uniqueId===ally.p.uniqueId;
                })[0];
                if(!char) return;
                char.exp = ally.p.exp;
                char.level = ally.p.level;
                //TEMP - IF ALEX, SET HP TO FULL AND NOT WOUNDED
                if(char.name==="Alex"){
                    char.combatStats.hp = char.combatStats.maxHp;
                    char.combatStats.tp = char.combatStats.maxTp;
                    return;
                }
                //TEMP for now set hp to 1 after battle if dead.
                char.combatStats.hp = ally.p.combatStats.hp || 1;
                char.combatStats.tp = ally.p.combatStats.tp;
                if(ally.hasStatus("dead")){
                    char.wounded = 5;
                } else if(ally.hasStatus("bleedingOut")){
                    char.wounded = 5-ally.hasStatus("bleedingOut").turns+1;
                }
            });
            Q.partyManager.allies.forEach(function(char){
                char.placedOnMap = false;
            });
            //TODO: checks
            var events = props.events;
            //Start the next scene
            Q.startScene(props.next[0],props.next[1],props.next[2]);
        },
        //Eventually check custom win conditions. For now, if there are no players OR no enemies, end it.
        checkBattleOver:function(){
            //FOR TESTING, DON'T END THE BATTLE
            //return false;
            var aliveAllies = this.allies.filter(function(c){return c.p.combatStats.hp>0;}).length;
            if(!aliveAllies){
                //Do anything that happens after a battle
                this.finishBattle(this.stage.options.data.defeat);
                return true;
            }
            var aliveEnemies = this.enemies.filter(function(c){return c.p.combatStats.hp>0;}).length;
            if(!aliveEnemies){
                //Do anything that happens after a battle
                this.finishBattle(this.stage.options.data.victory);
                return true;
            }
        },
        valid:function(obj){
            if(!obj.hasStatus("dead")&&!obj.hasStatus("bleedingOut")&&!obj.hasStatus("fainted")&&!obj.p.lifted){
                return true;
            } else if(obj.hasStatus("fainted")){ 
                obj.advanceStatus();
                if(!obj.p.status.fainted){
                    obj.playStand();
                    obj.p.fainted = false;
                }
                return false;
            } else {
                var stabilityFields = Q(".stability").items;
                var onField = false;
                stabilityFields.forEach(function(f){
                    var tile = f.getTile(obj.p.loc[0],obj.p.loc[1]);
                    if(tile) onField = true;
                });
                if(!onField){
                    obj.advanceStatus();
                    if(!obj.p.status.bleedingOut){
                        obj.p.angle = 90;
                        //obj.removeStatus("bleedingOut");
                        obj.addStatus("dead",999,"debuff",obj);
                    }
                }
            }
        },
        
        advanceRound:function(){
            this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            this.round ++;
            Q.BattleGrid.checkIcyStatus();
            this.battleTriggers.processTrigger("rounds",this.round);
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            var obj = this.turnOrder[0];
            if(!obj) alert("Everything is dead.");
            while(!this.valid(obj)){
                this.turnOrder.shift();
                if(!this.turnOrder[0]){
                    this.advanceRound();
                }
                obj = this.turnOrder[0];
            }
            //Hide and disable the pointer if it's not an ally's turn
            //TEMP (Take out false to enable)
            if(false&&obj.p.team!=="Ally"&&Q.pointer){
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
            var lastTurn = this.turnOrder.shift();
            //Advance the last character's status effects.
            lastTurn.advanceStatus();
            lastTurn.checkRegeneratingAura();
            if(!this.turnOrder.length){
                this.advanceRound();
                this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            }
            //Check if the battle is over at this point
            if(this.checkBattleOver()) return; 
            this.startTurn();
        },
        //Generates the turn order
        //This should probably be redone at some point to just add the character that just did its turn to the back of the turn order (or wherever they'd go)
        //Maybe we could generate 40 turns worth and only display the first 20 moves or so to the player.
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
        addToTurnOrder:function(obj){
            this.turnOrder.push(obj);
        },
        addToStartOfTurnOrder:function(obj){
            this.turnOrder.unshift(obj);
        },
        //Removes an object from the turn order
        removeFromTurnOrder:function(obj){
            for(var i=0;i<this.turnOrder.length;i++){
                if(this.turnOrder[i].p.id===obj.p.id){
                    this.turnOrder.splice(i,1);
                }
            }
        },
        getOtherTeam:function(team){
            return team==="Enemy"?"Ally":"Enemy";
        },
        addToTeam:function(obj){
            var team = obj.p.team==="Ally"?this.allies:this.enemies;
            team.push(obj);
        },
        removeFromTeam:function(obj){
            if(obj.p.team==="Ally"){
                this.allies.splice(this.allies.indexOf(this.allies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            } else if(obj.p.team==="Enemy"){
                this.enemies.splice(this.enemies.indexOf(this.enemies.filter(function(ob){return ob.p.id===obj.p.id;})[0]),1);
            }
        },
        //Adds an object to battle (currently used when dropping a lifted object)
        addToBattle:function(obj){
            this.addToTeam(obj);
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

        //Loads the preview to the attack when the user presses enter on an enemy while in the attack menu
        previewAttackTarget:function(user,loc){
            Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:[Q.BattleGrid.getObject(loc)]}));
        },
        //Previews a skill
        previewDoSkill:function(user,loc,skill){
            var targets = [];
            if(skill.range[2]==="ground"||skill.range[2]==="allGround"){
               
            } else if((Q._isNumber(skill.aoe[0])&&skill.aoe[0]>0)||skill.aoe[0]==="custom"||skill.aoe[0]==="customRadius"){
                targets = Q.BattleGrid.removeDead(Q.BattleGrid.getObjectsAround(Q.pointer.AOEGuide.aoeTiles));
                //Don't allow for unnaffected targets
                if(skill.range[1]==="Enemy") this.removeTeamObjects(targets,Q.BatCon.getOtherTeam(user.p.team));
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
        //The user lifts the object
        liftObject:function(user,obj){
            //Set the obj to be lifted by the user
            user.p.lifting = obj;
            //Remove the obj from battle (lifted units cannot be targetted nor take up space)
            Q.BattleGrid.removeObjectFromBattle(obj);
            //The lifted object doesn't get a turn
            //this.removeFromTurnOrder(obj);
            obj.p.loc = [user.p.loc[0],user.p.loc[1]-0.5];
            this.setXY(obj);
            obj.p.z = user.p.y+Q.tileH;
            obj.playLifted(obj.p.dir);
            obj.p.angle = 90;
            user.playLift(user.p.dir);
        },
        dropObject:function(user,obj,locTo){
            user.p.lifting = false;
            obj.p.lifted = false;
            obj.p.angle = 0;
            obj.revealStatusDisplay();
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
        }
    });
    
    Q.component("attackFuncs",{
        added:function(){
            //Any feedback from the attack is stored here
            this.text = [];
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
                    var dir = values[j];
                    //If the characters are diagonal to each other and the characters are behind, we're attacking from the side.
                    if(dir==="back"&&Math.abs(attacker.p.loc[0]-defender.p.loc[0])===Math.abs(attacker.p.loc[1]-defender.p.loc[1])){
                        attacker.p.canSetDir = this.getDiagDirs(attacker.p.loc,defender.p.loc);
                        return side;
                    }
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
            //Look at the attacker if whirlwind defense
            if(props.defender.p.talents.includes("Whirlwind Defense")){
                props.defender.playStand(Q.compareLocsForDirection(props.defender.p.loc,props.attacker.p.loc,props.defender.p.dir));
            }
            var dir = this.compareDirection(props.attacker,props.defender);
            if(dir==="front"){
                if(props.attacker.p.talents.includes("Aggressive Formation")){
                    var arr = Q.getDirArray(props.attacker.p.dir);
                    var ally1 = Q.BattleGrid.getObject([props.attacker.p.loc[0]+arr[1],props.attacker.p.loc[1]+arr[0]]);
                    if(ally1&&ally1.p.dir===props.attacker.p.dir){
                        props.attackerAtkAccuracy+=5;
                    }
                    var ally2 = Q.BattleGrid.getObject([props.attacker.p.loc[0]-arr[1],props.attacker.p.loc[1]-arr[0]]);
                    if(ally2&&ally2.p.dir===props.attacker.p.dir){
                        props.attackerAtkAccuracy+=5;
                    }
                }
                if(props.defender.p.talents.includes("Defensive Formation")){
                    var arr = Q.getDirArray(props.defender.p.dir);
                    var ally1 = Q.BattleGrid.getObject([props.defender.p.loc[0]+arr[1],props.defender.p.loc[1]+arr[0]]);
                    if(ally1&&ally1.p.dir===props.defender.p.dir){
                        props.defenderDamageReduction+=5;
                    }
                    var ally2 = Q.BattleGrid.getObject([props.defender.p.loc[0]-arr[1],props.defender.p.loc[1]-arr[0]]);
                    if(ally2&&ally2.p.dir===props.defender.p.dir){
                        props.defenderDamageReduction+=5;
                    }
                }
            } else if(dir==="side"){
                if(props.attacker.p.talents.includes("Flanking Strike")){
                    props.attackerAtkSpeed = Math.min(80,props.attackerAtkSpeed+30);
                }
            } else if(dir==="back"){
                if(props.attacker.p.talents.includes("Backstab")){
                    props.attackerCritChance*=3;
                }
            }
            //Shieldwall
            var alliesAroundDefender = Q.BattleGrid.removeEnemies(Q.BattleGrid.getObjectsWithin(props.defender.p.loc,1),props.defender.p.team);
            //Check if any of the allies have shieldwall
            for(var i=0;i<alliesAroundDefender.length;i++){
                var ally = alliesAroundDefender[i];
                if(ally.p.talents.includes("Shieldwall")){
                    //Check if the attack is coming from this character's direction
                    var defDir = this.compareDirection(props.attacker,ally);
                    if(defDir==="front"){
                        props.defenderDefensiveAbility+=Q.charGen.getEquipmentProp("block",ally.p.equipment.righthand)+Q.charGen.getEquipmentProp("block",ally.p.equipment.lefthand);
                    }
                }
            }
            //Deflecting Whirlwind
            if(props.defender.p.talents.includes("Deflecting Whirlwind")){
                if(Q.BattleGrid.getTileDistance(props.attacker.p.loc,props.defender.p.loc)>1){
                    props.attackerAtkAccuracy-=props.defender.p.combatStats.skill;
                };
            }
            //Illusionary Attack
            if(props.attacker.p.talents.includes("Illusionary Attack")){
                props.defenderDefensiveAbility-=Math.floor(props.attacker.p.combatStats.tp/10);
            }
            if(props.defender.p.talents.includes("Illusionary Defense")){
                props.defenderDefensiveAbility+=Math.floor(props.attacker.p.combatStats.tp/10);
            }
            if(props.defenderFainted){
                attackResult.hit = true;
            } else if(props.attackNum<props.attackerCritChance){
                attackResult.crit = true;
            } else if(props.attackNum<props.attackerAtkAccuracy){
                attackResult.hit = true;
            } else {
                attackResult.miss = true;
            }
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
            return {atkResult:attackResult,defResult:defenseResult,finalResult:result,dir:dir,attackingAgain:props.attackNum<props.attackerAtkSpeed};
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
            if(props.dir==="front"){
                if(props.defender.p.talents.includes("Defensive Formation")){
                    var arr = Q.getDirArray(props.defender.p.dir);
                    var ally1 = Q.BattleGrid.getObject([props.defender.p.loc[0]+arr[1],props.defender.p.loc[1]+arr[0]]);
                    if(ally1&&ally1.p.dir===props.defender.p.dir){
                        props.defenderDamageReduction+=5;
                    }
                    var ally2 = Q.BattleGrid.getObject([props.defender.p.loc[0]-arr[1],props.defender.p.loc[1]-arr[0]]);
                    if(ally2&&ally2.p.dir===props.defender.p.dir){
                        props.defenderDamageReduction+=5;
                    }
                }
            }
            if(props.attacker.p.talents.includes("Illusionary Attack")){
                props.defenderDefensiveAbility-=Math.floor(props.attacker.p.combatStats.tp/10);
            }
            if(props.defender.p.talents.includes("Illusionary Defense")){
                props.defenderDefensiveAbility+=Math.floor(props.attacker.p.combatStats.tp/10);
            }
            switch(props.result){
                case "Critical":
                    damage = this.criticalBlow(props.attackerAtkSpeed,props.attackerMaxAtkDmg,props.defenderHP,props.attacker,props.defender,props.skill)*props.finalMultiplier;
                    if(props.attacker.p.talents.includes("Critical Mastery")) damage+=props.attacker.p.combatStats.skill+props.attacker.p.level;
                    sound = "critical_hit.mp3";
                    break;
                case "Solid":
                    damage = this.solidBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDamageReduction)*props.finalMultiplier;
                    break;
                case "Glancing":
                case "Miss":
                    damage = this.glancingBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDefensiveAbility)*props.finalMultiplier;
                    sound = "glancing_blow.mp3";
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
            props.damage = Math.floor(damage);
            if(props.attacker.p.talents.includes("Fire Strike")&&damage>0) props.damage+=props.attacker.p.combatStats.skill;
            props.sound = sound;
            props.time = 100;
            return props;
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
                    newText = this.entity.skillFuncs["addStatus"]("initiativeDown",1,"debuff",defender,attacker,{name:"initiative",amount:-(attacker.p.combatStats.skill*2)});
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
            var time;
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
                defender:defender,
                
                finalMultiplier:1
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
                    atkProps.attackerMinAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMinSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    break;
                case "Bleeding Strike":
                    atkProps.attackerMinAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMinSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps).finalResult;
                    props = this.processResult(atkProps);
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("painToleranceDown",100,"debuff",defender,attacker,{name:"painTolerance",amount:-Math.floor(props.damage/2)}));
                    }
                    break;
                case "Weakening Strike":
                    atkProps.attackerMinAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMinSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps).finalResult;
                    props = this.processResult(atkProps);
                    if(props.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("strengthDown",2,"debuff",defender,attacker,{name:"strength",amount:-Math.floor(props.damage/10)}));
                    }
                    break;
                case "Nerve Strike":
                    atkProps.attackerMinAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMinSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps).finalResult;
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
                    atkProps.attackerMinAtkDmg = Math.floor(attacker.p.combatStats.minAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxAtkDmg = Math.floor(attacker.p.combatStats.maxAtkDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMinSecondaryDmg = Math.floor(attacker.p.combatStats.minSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.attackerMaxSecondaryDmg = Math.floor(attacker.p.combatStats.maxSecondaryDmg/2+attacker.p.combatStats.skill);
                    atkProps.result = this.getBlow(atkProps).finalResult;
                    result = this.processResult(atkProps);
                    if(result.damage>0){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("poisoned",2,"debuff",defender,attacker));
                        defender.p.buffs.poisonDamage = Math.floor(result.damage/4);
                    }
                    break;
                case "Coordinated Attack":
                    //Attack like normal
                    atkProps.result = this.getBlow(atkProps).finalResult;
                    props = this.processResult(atkProps);
                    //If we get a second attack, all allies within the zone attack as well. (For now, always do it)
                    if(!this.attackedAgain){
                        var dir = attacker.p.dir;
                        var radius = 1;
                        //Gets the array multiplier for the direction
                        var arr = Q.getDirArray(Q.getRotatedDir(dir));
                        var loc = attacker.p.loc;
                        for(var i=-radius;i<radius+1;i++){
                            if(i===0) i++;
                            var spot = [i*arr[0]+loc[0]+arr[1],i*arr[1]+loc[1]-arr[0]];
                            var target = Q.BattleGrid.getObject(spot);
                            if(target&&!target.p.fainted&&target.p.combatStats.hp&&target.p.team===attacker.p.team){
                                target.p.tempHp = target.p.combatStats.hp;
                                if(defender.p.tempHp-props.damage>0){
                                    var t = this;
                                    props.afterAttack = function(){
                                        t.text.push({func:"doAttackAnim",obj:target,props:[defender,"Attack","slashing",false]});
                                        t.calcAttack(target,defender);
                                    }
                                    
                                }
                            }
                        }
                    }
                    this.attackedAgain = true;
                    break;
                case "Stone":
                    props = {
                        damage:Math.ceil(Math.random()*10)+10+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
                case "Flamethrower":
                    var tileDist = Q.BattleGrid.getTileDistance(attacker.p.loc,defender.p.loc);
                    if(tileDist===1){
                        this.closeTileOccupied = true;
                    }
                    atkProps.attackerMinAtkDmg = 50+attacker.p.combatStats.skill;
                    atkProps.attackerMaxAtkDmg = 80+attacker.p.combatStats.skill;
                    atkProps.result = "Solid";
                    if(this.closeTileOccupied){
                        //This is the close tile
                        if(tileDist===1){
                            atkProps.defenderDamageReduction = 0;
                        } else {
                            atkProps.finalMultiplier = 0.5;
                        }
                        sound = "fireball.mp3";
                    }
                    time = 50;
                    break;
                case "Fireball":
                    if(defender.p.loc[0]===Q.pointer.p.loc[0]&&defender.p.loc[1]===Q.pointer.p.loc[1]){
                        atkProps.defenderDamageReduction = 0;
                    }
                    atkProps.attackerMinAtkDmg = 50+attacker.p.combatStats.skill;
                    atkProps.attackerMaxAtkDmg = 80+attacker.p.combatStats.skill;
                    atkProps.result = "Solid";
                    sound = "fireball.mp3";
                    break;
                case "Frost Ray":
                    var blow = this.getBlow(atkProps);
                    if(blow.defResult.fail){
                        this.text = this.text.concat(this.entity.skillFuncs["addStatus"]("frozen",2,"debuff",defender,attacker));
                    }
                    props = {
                        damage:Math.ceil(Math.random()*40)+10+attacker.p.combatStats.skill,
                        sound:""
                    };
                    break;
                case "Choke":
                    atkProps.defenderDamageReduction = 0;
                    props = {
                        damage:Math.ceil(Math.random()*100)+100+attacker.p.combatStats.skill,
                        sound:"hit1.mp3"
                    };
                    break;
            }
            if(!result&&!atkProps.result){
                atkProps.result = this.getBlow(atkProps).finalResult;
            }
            if(!props){
                props = this.processResult(atkProps);
            }
            props.sound = sound || props.sound;
            props.time = time || props.time;
            return props;
        },
        useGroundSkill:function(targetLoc,user,skill){
            switch(skill.name){
                case "Hypnotic Mirage":
                    this.text.push({func:"createMirage",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
                case "Stability Field":
                    this.text.push({func:"createStabilityField",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
                case "Caltrops":
                    this.text.push({func:"createCaltrops",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
                case "Lightning Storm":
                    //Hit 3 locations
                    this.text.push({func:"spawnLightning",obj:this.entity.skillFuncs,props:[targetLoc,user]});
                    break;
            }
        },
        useItem:function(user,target,item){
            var newText;
            switch(item.name){
                case "Potion":
                    newText = this.entity.skillFuncs["healHp"](20,target,user);
                    break;
                case "Gummy":
                    newText = this.entity.skillFuncs["healHp"](10,target,user);
                    break;
                case "Hard Candy":
                    newText = this.entity.skillFuncs["healHp"](11,target,user);
                    break;
            }
            this.text.push(newText[0]);
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
        calcAttack:function(attacker,defender,skill,extraAttack){
            if(attacker.p.tempHp<=0||defender.p.tempHp<=0) return;
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
                    case "Item":
                        var bag = Q.state.get("Bag");
                        bag.decreaseItem(skill.kind,{gear:skill.name});
                        this.useItem(attacker,defender,skill);
                        return;
                    case "Support":
                        this.useSupportSkill(attacker,defender,skill);
                        return;
                    case "Debilitate":
                        this.useDebilitateSkill(attacker,defender,skill);
                        break;
                    case "Damage":
                        var props = this.useDamageSkill(attacker,defender,skill);
                        damage = Math.max(0,props.damage);
                        sound = props.sound;
                        time = props.time || time;
                        break;
                }
            } 
            //Regular attack
            else {
                var blow = this.getBlow({
                    attackNum:Math.ceil(Math.random()*100),
                    defendNum:Math.ceil(Math.random()*100),
                    attackerCritChance:attacker.p.combatStats.critChance+(extraAttack&&attacker.p.talents.includes("Critical Flurry"))?20:0,
                    attackerAtkAccuracy:attacker.p.combatStats.atkAccuracy,
                    attackerAtkSpeed:attacker.p.combatStats.atkSpeed,
                    defenderCounterChance:defender.p.combatStats.counterChance,
                    defenderReflexes:defender.p.combatStats.reflexes,
                    defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                    defenderFainted:defender.p.fainted,
                    attacker:attacker,
                    defender:defender
                });
                var props = this.processResult({
                    attackingAgain:blow.attackingAgain,
                    result:blow.finalResult,
                    dir:blow.dir,
                    attackerFainted:attacker.p.fainted,
                    attackerAtkSpeed:attacker.p.combatStats.atkSpeed,
                    attackerMaxAtkDmg:attacker.p.combatStats.maxAtkDmg,
                    attackerMinAtkDmg:attacker.p.combatStats.minAtkDmg,
                    defenderHP:defender.p.combatStats.hp,
                    defenderDamageReduction:defender.p.combatStats.damageReduction,
                    defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                    defenderAtkRange:defender.p.combatStats.atkRange,
                    attacker:attacker,
                    defender:defender,
                    finalMultiplier:1
                });
                damage = props.damage;
                sound = props.sound;
            }
            //After the damage has been calculated, come up with the text to show the user
            if(damage>0){
                this.text.push({func:"takeDamage",obj:defender,props:[damage,attacker]});
                this.text.push({func:"showDamage",obj:defender,props:[damage,sound]});
                if(props.result==="Critical"&&attacker.p.talents.includes("Bloodlust")){
                    this.text.push(this.entity.skillFuncs.healTp(Math.floor(damage/2),attacker)[0]);
                }
                defender.p.tempHp = defender.p.tempHp-damage;
                if(defender.p.tempHp<=0){
                    props.attackingAgain = false;
                } else if(damage>defender.p.combatStats.painTolerance){
                    defender.p.fainted = true;
                    this.text.push({func:"showFainted",obj:defender,props:[attacker]});
                }
                if(props.attackingAgain){
                    this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,"Attack","slashing",false]});
                    this.calcAttack(attacker,defender,skill,true);
                } else if(props.afterAttack){
                    props.afterAttack();
                }
            } 
            //Miss
            else if(damage===0){
                this.text.push({func:"showMiss",obj:defender,props:[attacker]});
            } 
            //Counter chance
            else if(damage===-1){
                this.previousDamage = 0;
                if(skill){
                    this.text.push({func:"showMiss",obj:defender,props:[attacker]});
                } else {
                    this.text.push({func:"showCounter",obj:defender,props:[attacker]});
                    this.calcAttack(defender,attacker);
                }
            }
        },
        //After the attack has happened, do this
        processAdditionalEffects:function(attacker,target,skill){
            switch(skill.name){
                //Make all spaces touched icy.
                case "Frost Ray":
                    if(!Q.BattleGrid.icy){
                        var tiles = Q.BattleGrid.emptyGrid();
                        Q.BattleGrid.icy = Q.stage(0).insert(new Q.TileLayer({
                            tileW:Q.tileW,
                            tileH:Q.tileH,
                            sheet:"ground",
                            tiles:tiles,
                            type:Q.SPRITE_NONE
                        }));
                        Q.BattleGrid.icyStatus = [];
                    }
                    var radius = Math.floor(attacker.p.combatStats.skill/10);
                    var dir = attacker.p.dir;
                    //Gets the array multiplier for the direction
                    var arr = Q.getDirArray(dir);
                    var locs = [];
                    for(var i=1;i<radius+1;i++){
                        locs.push([i*arr[0]+attacker.p.loc[0],i*arr[1]+attacker.p.loc[1]]);
                    }
                    Q.BattleGrid.icyStatus.push({locs:locs,turns:2});
                    //Wait for as long as the animation plays
                    this.text.splice(1,0,{func:"makeIcy",obj:this.entity.skillFuncs,props:[locs]});
                    break;
                case "Flamethrower":
                    this.closeTileOccupied = false;
                    break
                case "Coordinated Attack":
                    this.attackedAgain = false;
                    break;
            }
        },
        getTechniqueCost:function(cost,efficiency){
            return Math.max(1,cost - efficiency);
        },
        doAttack:function(attacker,targets,skill){
            console.log(attacker,targets,skill)
            this.text = [];
            var anim = "Attack";
            var sound = "slashing";
            var dir;
            attacker.p.didAction = true;
            attacker.p.tempHp = attacker.p.combatStats.hp;
            if(skill){
                if(skill.type!=="Item"&&skill.cost) {
                    attacker.p.combatStats.tp-=this.getTechniqueCost(skill.cost,attacker.p.combatStats.efficiency);
                }
                if(skill.anim) anim = skill.anim;
                if(skill.sound) sound = skill.sound;
                if(skill.dir==="Forward") dir=attacker.p.dir;
            }
            this.text.push({func:"doAttackAnim",obj:attacker,props:[targets[0],anim,sound,dir]});
            //If we have targetted the ground.
            if(!targets.length){
                this.useGroundSkill(Q.pointer.p.loc,attacker,skill);
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                targets[i].p.tempHp = targets[i].p.combatStats.hp;
                this.calcAttack(attacker,targets[i],skill);
                this.previousDamage = 0;
            }
            if(skill){
                this.processAdditionalEffects(attacker,targets,skill);
            }
            this.processText(this.text);
        },
        processText:function(text){
            var obj = this;
            if(!text) text = this.text;
            //If the process is over, finish the end the turn
            if(!text.length) return obj.entity.attackFuncs.finishAttack();
            //Get the first function
            var t = text.shift();
            if(!t||!t.props) console.log(text,this.text,t);
            //Push this function as a callback so everything is timed well.
            t.props.push(function(){obj.processText(text);});
            //Do the function
            t.obj[t.func].apply(t.obj,t.props);
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
                else if(true||active.p.team!=="Enemy"){
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
                if(true||active.p.team!=="Enemy"){
                    Q.stage(2).ActionMenu.show();
                    Q.stage(2).ActionMenu.menuControls.turnOnInputs();
                    Q.stage(2).ActionMenu.displayMenu(0,0);
                } else {
                    //Do whatever the AI does after attacking and can still move
                }
            }
        },
        waitTime:function(time,callback){
            setTimeout(function(){
                callback();
            },time);
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
            //While icy and no obj on it, go further.
            var getIcyRange = function(tileTo,arr){
                if(Q.BattleGrid.icy.p.tiles[tileTo[1]][tileTo[0]]&&Q.getWalkableOn(tileTo[0]+arr[0],tileTo[1]+arr[1],target.p.canMoveOn)<=1000){
                    return getIcyRange([tileTo[0]+arr[0],tileTo[1]+arr[1]],arr);
                } else {
                    return tileTo;
                }
            };
            var text = [];
            var tileTo = [];
            //Pushing in the y direction
            var dir = Q.compareLocsForDirection(user.p.loc,target.p.loc);
            var arr = Q.getDirArray(dir);
            tileTo = [target.p.loc[0]+(arr[0]*tiles),target.p.loc[1]+(arr[1]*tiles)];
            tileTo = Q.BattleGrid.icy && Q.BattleGrid.icy.p.tiles[tileTo[1]][tileTo[0]] ? getIcyRange(tileTo,arr) : tileTo;
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
            return text;
        },
        removeDebuff:function(name,target,user,callback){
            if(name==="all"){
                return {func:"removeAllBadStatus",obj:target,props:[]};
            } else {
                return {func:"removeStatus",obj:target,props:[name]};
            }
            //callback();
        },
        healTp:function(amount,target,user,callback){
            if(target.p.combatStats.tp+amount>target.p.combatStats.maxTp) amount=target.p.combatStats.maxTp-target.p.combatStats.tp;
            target.p.combatStats.tp+=amount;
            return {func:"showHealed",obj:target,props:[amount]}
            //callback();
        },
        healHp:function(amount,target,user,callback){
            if(target.p.combatStats.hp+amount>target.p.combatStats.maxHp) amount=target.p.combatStats.maxHp-target.p.combatStats.hp;
            target.p.combatStats.hp+=amount;
            return [{func:"showHealed",obj:target,props:[amount]}];
           // callback();
        },
        
        changeCombatStat:function(amount,stat,target,user,callback){
            target.p.combatStats[stat]+=amount;
            return {func:"showStatUp",obj:target,props:[amount,stat]};
            //Q.BatCon.attackFuncs.text.unshift({func:"showStatUp",obj:target,props:[amount,stat]});
            //callback();
        },
        createMirage:function(loc,user,callback){
            if(user.p.mirage) user.p.mirage.dispellMirage();
            user.p.mirage = user.stage.insert(new Q.Mirage({loc:loc,user:user}));
            callback();
        },
        createStabilityField:function(loc,user,callback){
            if(user.p.stabilityField) user.p.stabilityField.destroy();
            var tiles = Q.BattleGrid.emptyGrid();
            var field = user.p.stabilityField = user.stage.insert(new Q.TileLayer({
                tileW:Q.tileW,
                tileH:Q.tileH,
                sheet:"ground",
                tiles:tiles,
                type:Q.SPRITE_NONE,
                loc:loc,
                turns:3
            }));
            field.animateTo = function(frame){
                var loc = field.p.loc;
                var tiles = field.p.tiles;
                var radius = Q.state.get("allSkills")["Stability Field"].aoe[0];
                for(var i=0;i<radius*2+1;i++){
                    for(var j=0;j<radius*2+1;j++){
                        var tileType = Q.BatCon.getTileType([j-radius+loc[0],i-radius+loc[1]]);
                        if(tileType!=="impassable"&&tileType!=="water"){
                            tiles[i-radius+loc[1]][j-radius+loc[0]] = 0;
                            if(Math.abs(radius-i)+Math.abs(radius-j)<=radius){
                                field.setTile(j-radius+loc[0],i-radius+loc[1],frame);
                            }
                            //tiles[i-radius+loc[1]][j-radius+loc[0]] = frame;
                        }
                    }
                }
                
            };
            field.add("tween");
            var flash = function(obj){
                obj.animate({opacity:0.5},2, Q.Easing.Quadratic.InOut).chain({opacity:1},1, Q.Easing.Quadratic.InOut,{callback:function(){flash(obj);}});
            };
            field.animateTo(1);
            flash(field);
            callback();
            field.add("stability");
        },
        createCaltrops:function(loc,user,callback){
            if(!Q.BattleGrid.caltrops){
                var tiles = Q.BattleGrid.emptyGrid();
                Q.BattleGrid.caltrops = user.stage.insert(new Q.TileLayer({
                    tileW:Q.tileW,
                    tileH:Q.tileH,
                    sheet:"ground",
                    tiles:tiles,
                    type:Q.SPRITE_NONE
                }));
            }
            var tiles = Q.BattleGrid.caltrops.p.tiles;
            var radius = Q.state.get("allSkills")["Caltrops"].aoe[0];
            for(var i=0;i<radius*2+1;i++){
                for(var j=0;j<radius*2+1;j++){
                    var tileType = Q.BatCon.getTileType([j-radius+loc[0],i-radius+loc[1]]);
                    if(tileType!=="impassable"&&tileType!=="water"){
                        tiles[i-radius+loc[1]][j-radius+loc[0]] = 0;
                        if(Math.abs(radius-i)+Math.abs(radius-j)<=radius){
                            Q.BattleGrid.caltrops.setTile(j-radius+loc[0],i-radius+loc[1],4);
                        }
                    }
                }
            }
            callback();
        },
        makeIcy:function(locs,callback){
            var dirAngles = {
                right:0,
                down:90,
                left:180,
                up:270
            };
            var angle = dirAngles[Q.compareLocsForDirection(locs[0],locs[1])];
            var anims = [];
            //Move on to the next anim, or finish
            var num = 0;
            var makeIce = function(){
                var loc = locs[num];
                var pos = Q.BatCon.getXY(loc);
                var iceAnim = Q.stage(0).insert(new Q.Sprite({
                    x:pos.x,
                    y:pos.y,
                    loc:loc,
                    angle:angle,
                    sprite:"FrostRay",
                    sheet:"FrostRay",
                    type:Q.SPRITE_NONE,
                    z:-1
                }));
                iceAnim.add("animation");
                iceAnim.on("doneOut",function(){
                    num++;
                    if(num!==locs.length){
                        makeIce();
                    } else {
                        var call = false;
                        anims.forEach(function(a){
                            a.on("finished",function(){
                                a.destroy();
                                if(!call){
                                    callback();
                                    call=true;
                                }
                            });
                            a.play("frostExploding");
                            var tileType = Q.BatCon.getTileType(a.p.loc);
                            if(tileType!=="impassable"){
                                Q.BattleGrid.icy.setTile(a.p.loc[0],a.p.loc[1],6);
                            }
                        });
                        Q.audioController.playSound("confirm.mp3");
                    }
                });
                iceAnim.play("frostGoingOut");
                Q.audioController.playSound("frosty.mp3");
                anims.push(iceAnim);
            };    
            makeIce();
        },
        //Spawns one of the three random locations
        spawnLightning:function(loc,user){
            //Get three random locations within the storm and do a 1 aoe + at each location for damage
            var radius = Q.state.get("allSkills")["Lightning Storm"].aoe[0];
            var x = loc[0]-radius;
            var y = loc[1]-radius;
            var range = radius*2+1;
            for(var i=0;i<3;i++){
                var xRand = Math.floor(Math.random()*range)+x;
                var yRand = Math.floor(Math.random()*range)+y;
                var tLoc = [xRand,yRand];
                var pos = Q.BatCon.getXY(tLoc);
                var lightning = Q.stage(0).insert(new Q.Sprite({
                    x:pos.x,
                    y:pos.y,
                    loc:tLoc,
                    sprite:"SonicBoom",
                    sheet:"SonicBoom",
                    type:Q.SPRITE_NONE,
                    z:-1
                }));
                lightning.add("animation");
                lightning.play("booming");
                if(i===0){
                    Q.audioController.playSound("fireball.mp3");
                }
                var obj = this;
                obj.entity.attackFuncs.text.push({func:"waitTime",obj:this.entity.attackFuncs,props:[300]});
                lightning.on("doneAttack",function(){
                    var target = Q.BattleGrid.getObject(this.p.loc);
                    if(target){
                        var damage = Math.floor(Math.random()*50)+150+user.p.combatStats.skill;
                        obj.entity.attackFuncs.text.push({func:"waitTime",obj:obj.entity.attackFuncs,props:[300]});
                        obj.entity.attackFuncs.text.push({func:"takeDamage",obj:target,props:[damage,user]});
                        obj.entity.attackFuncs.text.push({func:"showDamage",obj:target,props:[damage,"hit1.mp3"]});
                    }
                    var locs = [[this.p.loc[0]-1,this.p.loc[1]],[this.p.loc[0],this.p.loc[1]-1],[this.p.loc[0]+1,this.p.loc[1]],[this.p.loc[0],this.p.loc[1]+1]];
                    for(var j=0;j<locs.length;j++){
                        var pos = Q.BatCon.getXY(locs[j]);
                        var chainLightning = Q.stage(0).insert(new Q.Sprite({
                            x:pos.x,
                            y:pos.y,
                            loc:locs[j],
                            sprite:"Whirlwind",
                            sheet:"Whirlwind",
                            type:Q.SPRITE_NONE,
                            z:-1
                        }));
                        chainLightning.add("animation");
                        chainLightning.play("winding");
                        
                        chainLightning.on("doneAttack",function(){
                            var target = Q.BattleGrid.getObject(this.p.loc);
                            if(target){
                                var damage = Math.floor(Math.random()*25)+25+user.p.combatStats.skill;
                                obj.entity.attackFuncs.text.push({func:"waitTime",obj:obj.entity.attackFuncs,props:[300]});
                                obj.entity.attackFuncs.text.push({func:"takeDamage",obj:target,props:[damage,user]});
                                obj.entity.attackFuncs.text.push({func:"showDamage",obj:target,props:[damage,"hit1.mp3"]});
                            }
                            this.destroy();
                        });
                        if(j===locs.length-1){
                            Q.audioController.playSound("fireball.mp3");
                            obj.entity.attackFuncs.text.push({func:"waitTime",obj:obj.entity.attackFuncs,props:[300]});
                            chainLightning.on("doneAttack",obj.entity.attackFuncs,"processText");
                        }
                    }
                    this.destroy();
                });
            }
        }
    });
    //Used for searching by
    Q.component("stability",{});
};
