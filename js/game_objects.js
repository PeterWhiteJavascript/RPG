Quintus.GameObjects=function(Q){
    /*
    Q.component("pointerDropControls",{
        added:function(){
            this.entity.show();
            this.entity.on("pressedConfirm",this,"checkValidToDrop");
            this.entity.on("pressedBack",this,"pressedBack");
            this.entity.on("checkConfirm");
            this.entity.on("checkInputs");
            this.entity.p.disabled = false;
            $("#quintus").focus();
        },
        
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",this,"checkValidToDrop");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerDropControls");
            this.entity.p.user = false;
            this.entity.p.disabled = true;
        },
        checkValidToDrop:function(){
            var user = Q.BatCon.turnOrder[0];
            var loc = this.entity.p.loc;
            var objAt = user.p.lifting;
            if(!Q.BattleGrid.getObject(loc)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(loc),objAt.p.canMoveOn)!=="impassable"){
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
            this.entity.p.disabled = false;
            $("#quintus").focus();
        },
        remove:function(){
            this.entity.hide();
            this.entity.off("pressedConfirm",this,"checkValidToCarry");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.off("checkInputs");
            this.entity.off("checkConfirm");
            this.entity.del("pointerLiftControls");
            this.entity.p.user = false;
            this.entity.p.disabled = true;
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
            if(this.entity.p.technique){
                var technique = this.entity.p.technique;
                if(technique.rangeType === "Weapon w Skill"){
                    var user = this.entity.p.user;
                    var weaponOfChoice = user.p.equipment[0];
                    if(user.p.equipment[0] && user.p.equipment[1]){
                        weaponOfChoice = user.p.equipment[0].range >= user.p.equipment[1].range ? user.p.equipment[0] : user.p.equipment[1];
                    }
                    technique.range = weaponOfChoice.range + Math.max(1,Math.floor(this.entity.p.user.p.combatStats.skill / technique.initialRange));
                console.log(technique.range,this.entity.p.user)
                }
                if(technique.rangeProps.includes("MaxRangeFixed") || technique.range === 0){
                    this.entity.on("checkInputs",this.entity,"checkStraightInputs");
                    this.entity.on("inputMoved",this,"moveTiles");
                    this.entity.hide();
                } else {
                    this.entity.on("checkInputs");
                    this.entity.on("inputMoved",this,"moveTiles");
                }
                
                //If we can rotate the aoe
                if(technique.aoeProps.includes("Rotatable")){
                    this.entity.on("pressedCtrl",this,"rotateTiles");
                    this.rotatedDir = this.entity.p.user.p.dir;
                    this.rotatedLoc = this.entity.p.user.p.loc;
                }
            } else {
                this.entity.on("checkInputs");
                this.entity.on("inputMoved",this,"inputMoved");
                var possibleTargets = Q.rangeController.getPossibleTargets(Q.rangeController.tiles);
                Q.BatCon.removeTeamObjects(possibleTargets,Q.BatCon.getOtherTeam(Q.BatCon.turnOrder[0].p.team));
                if(possibleTargets.length){
                    //Set the pointer on the first target
                    this.entity.snapTo(possibleTargets[0]);
                }
            }
            this.entity.p.disabled = false;
            $("#quintus").focus();
        },
        inputMoved:function(){},
        remove:function(){
            Q.rangeController.resetGrid();
            if(this.entity.p.technique){
                Q.aoeController.resetGrid();
                this.entity.off("checkInputs");
                this.entity.off("inputMoved",this,"moveTiles");
                if(this.entity.p.technique.aoeProps.includes("Rotatable")){
                    this.entity.off("pressedCtrl",this,"rotateTiles");
                    this.rotatedDir = false;
                    this.rotatedLoc = false;
                }
            } else {
                this.entity.off("checkInputs");
                this.entity.off("inputMoved",this,"inputMoved");
            }
            this.entity.p.technique = false;
            this.entity.p.target = false;
            this.entity.hide();
            this.entity.off("checkConfirm");
            this.entity.off("pressedConfirm",Q.rangeController,"checkConfirmAttack");
            this.entity.off("pressedBack",this,"pressedBack");
            this.entity.del("pointerAttackControls");
            this.entity.p.disabled = true;
        },
        adjustTiles:function(dir,center,technique){
            Q.aoeController.resetGrid();
            Q.aoeController.setTiles(3,center,dir,technique.aoe,technique.aoeType,technique.aoeProps,technique.rangeProps,technique.range);
        },
        moveTiles:function(){
            var center = [this.entity.p.loc[0],this.entity.p.loc[1]];
            var dir = this.entity.p.user.p.dir;
            if(this.entity.p.technique.aoeProps.includes("Rotatable")){
                dir = this.rotatedDir;
            }
            this.adjustTiles(dir,center,this.entity.p.technique);
        },
        rotateTiles:function(){
            Q.audioController.playSound("rotate_tech.mp3");
            this.rotatedDir = Q.getRotatedDir(this.rotatedDir);
            var technique = this.entity.p.technique;
            //Usually the aoe is the radius
            var half = technique.aoe-1;
            //But for VLine, it is the tile length
            if(technique.aoeType === "VLine"){
                half = half/2;
                if(half % 1 !== 0){
                    alert("This technique needs to be adjusted to have an odd number of aoe to be rotatable!");
                    return;
                }
            }
            var center = [Q.pointer.p.loc[0],Q.pointer.p.loc[1]];
            var newTiles = [];
            Q.aoeController.tiles.forEach(function(tile){
                var difX = center[0] - tile[0];
                var difY = center[1] - tile[1];
                newTiles.push([center[0] + difY * -1,center[1]  + difX * -1]);
            });
            Q.aoeController.resetGrid();
            for(var i=0;i<newTiles.length;i++){
                Q.AOETileLayer.setTile(newTiles[i][0],newTiles[i][1],3);
            }
            Q.aoeController.tiles = newTiles;
        },
        showMenu:function(){
            Q.stage(2).ActionMenu.show();
            Q.stage(2).ActionMenu.menuControls.turnOnInputs();
        },
        pressedBack:function(){
            this.entity.snapTo(Q.BatCon.turnOrder[0]);
            this.remove();
            this.showMenu();
        }
    });
    */
    
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
        //Not great wording, but this gets all objects that are on top of these tiles
        getObjectsAround:function(tiles){
            var objects = [];
            for(var i=0;i<tiles.length;i++){
                //var object = this.getObject(tiles[i].p.loc);
                var object = this.getObject(tiles[i]);
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
    //All code for controlling placement of allies at the start of a battle.
    Q.component("battlePlacement",{
        checkPlacement:function(loc){
            var canPlace = false;
            var tiles = this.entity.stage.options.data.placementSquares;
            //Check if we're on a placement square.
            tiles.forEach(function(tile){
                if(loc[0] === tile[0] && loc[1] === tile[1]){
                    //If there's a character already there, remove it and go back to menu
                    var obj = Q.getSpriteAt(loc);
                    if(obj){
                        //Find the character
                        var allies = Q.partyManager.allies;
                        for(var i=0; i < allies.length; i++){
                            if(obj.p.name === allies[i].name && obj.p.uniqueId === allies[i].uniqueId){
                                obj.destroy();
                                allies[i].placedOnMap = false;
                                Q.BatCon.battlePlacement.genPlaceableAllies();
                                Q.rangeController.setSpecificTile(2, loc);
                            }
                        }
                    }
                    canPlace = true;
                }
            });
            //If we're on a placement square, load the menu that shows all of the allies that the player can choose from for this battle.
            if(canPlace){
                return true;
            } else {
                //If we're on a character that is not user-controlled (or interactables; anything that loads a status menu)
                //TODO
                return false;
            }
        },
        showPlacementSquares:function(tiles){
            Q.rangeController.tiles = [];
            tiles.forEach(function(tile){
                Q.rangeController.setSpecificTile(2, tile);
                Q.rangeController.tiles.push({x:tile[0],y:tile[1]});
            });
        },
        removePlacementSquares:function(){
            Q.rangeController.resetGrid();
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
            
            return;
            
        },
        //Confirms when a character is placed after their direction is set
        confirmPlacement:function(char){
            //Find the character in placeable allies and set placedOnMap to true
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                var ally = allies[i];
                if(ally.name === char.p.name && ally.uniqueId === char.p.uniqueId){
                    ally.placedOnMap = true;
                    ally.loc = char.p.loc;
                    i = allies.length;
                    Q.RangeTileLayer.setTile(ally.loc[0], ally.loc[1], 0);
                }
            }
            this.genPlaceableAllies();
            //If all allies are placed, start the battle. Also goes if we reach the max allies limit.
            var numPlaced = allies.filter(function(c){return c.placedOnMap;}).length;
            if(!this.placeableAllies.length || numPlaced === this.entity.stage.options.data.maxAllies || numPlaced === this.entity.stage.options.data.placementSquares.length){
                this.removePlacementSquares();
                this.entity.startBattle();
            } else {
                Q.pointer.add("pointerControls, pointerPlacementRoaming");
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
                                if(hpRatio<=0 || char.hasStatus("Fainted")) return true;
                            case "dead":
                                if(hpRatio<=0) return true;
                            case "fainted":
                                if(char.hasStatus("Fainted")) return true;
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
            this.round = 1;
            this.add("battlePlacement, battleTriggers, attackFuncs, techniqueFuncs");
            this.allyExpContributions = [];
        },
        //Run once at the start of battle
        startBattle:function(){
            this.allies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="Ally"; 
            });
            for(var i=0;i<this.allies.length;i++){
                var ally = this.allies[i];
                this.allyExpContributions.push({
                    name:ally.p.name,
                    damageDealt:0,
                    damageTaken:0,
                    damageHealed:0,
                    statusCured:0,
                    statusApplied:0,
                    enemiesDefeated:0,
                    alliesRevived:0
                });
            }
            this.enemies = this.stage.lists[".interactable"].filter(function(char){
                return char.p.team==="Enemy"; 
            });
            this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            //Do start battle animation, and then start turn (TODO)
            this.startTurn();
        },
        getFinalContributions:function(data){
            return {
                topDamageDealt:data.sort(function(a,b){return b.damageDealt - a.damageDealt;}),
                topDamageTaken:data.sort(function(a,b){return b.damageTaken - a.damageTaken;}),
                topHealed:data.sort(function(a,b){return b.damageHealed - a.damageHealed;}),
                mvp:data.sort(function(a,b){return (b.enemiesDefeated + b.alliesRevived) - (a.enemiesDefeated + a.alliesRevived);}),
                statusCommander:data.sort(function(a,b){return (b.statusCured+b.statusApplied) - (a.statusCured+a.statusApplied);})
            };
        },
        finishBattle:function(props){
            Q.el.removeEventListener("click", Q.clickStage);
            Q.el.removeEventListener("mousemove", Q.mouseOverStage);
                
                
            Q.groupsProcessor.processGroups(props.events);
            console.log(props)
            //Figure out exp distribution
            var leaderboard = this.getFinalContributions(this.allyExpContributions);
            
            //Show Leaderboard
            console.log(this.allyExpContributions)
            console.log(leaderboard)
            //Idea : layer boards and cycle /hide them
            var cont = $("<div id='leaderboard'><div class='leaderboard-page'><div class='leaderboard-title'>Combat Summary</div><div class='leaderboard-cont'></div></div><div class='leaderboard-page'><div class='leaderboard-title'>EXP Distribution</div><div class='leaderboard-cont'></div></div><div id='leaderboard-next-button'>Done</div></div>");
            var combat = $(cont).children(".leaderboard-page:eq(0)").children(".leaderboard-cont");
            combat.append("<div class='leaderboard-cont-itm'><div>Top Damager</div><div>"+leaderboard.topDamageDealt[0].name+"</div><div>"+leaderboard.topDamageDealt[0].damageDealt+"</div></div>");
            combat.append("<div class='leaderboard-cont-itm'><div>Best Defender</div><div>"+leaderboard.topDamageTaken[0].name+"</div><div>"+leaderboard.topDamageTaken[0].damageTaken+"</div></div>");
            combat.append("<div class='leaderboard-cont-itm'><div>Most Healed</div><div>"+leaderboard.topHealed[0].name+"</div><div>"+leaderboard.topHealed[0].damageHealed+"</div></div>");
            combat.append("<div class='leaderboard-cont-itm'><div>Status Commander</div><div>"+leaderboard.statusCommander[0].name+"</div><div>"+(leaderboard.statusCommander[0].statusApplied+leaderboard.statusCommander[0].statusCured)+"</div></div>");
            combat.append("<div class='leaderboard-cont-itm'><div>MVP</div><div>"+leaderboard.mvp[0].name+"</div><div>"+(leaderboard.mvp[0].enemiesDefeated+leaderboard.mvp[0].alliesRevived)+"</div></div>");
            
            var exp = $(cont).children(".leaderboard-page:eq(1)").children(".leaderboard-cont");
            var defeatedEnemies = this.enemies.filter(function(enemy){return enemy.p.combatStats.hp <= 0;});
            //Max is 100 per enemy, then 75, 50, 25 based on bonus
            var potentialExp = defeatedEnemies.length * 100;
            var enemiesDefeatedRatio = defeatedEnemies.length / this.enemies.length;
            //All enemies defeated
            if(enemiesDefeatedRatio === 1){
                var base = 0.25;
                var numTurns = this.round;
                var bonuses = Q.state.get("currentEvent").data.turnBonus;
                var bonus = bonuses.filter(function(num){return numTurns <= num;});
                bonus = 1 + Math.max(0,bonuses.indexOf(bonus[bonus.length-1]));
                var bonusMultiplier = base * bonus;
                potentialExp *= bonusMultiplier;
            }
            var averageLevelOfEnemies = Math.ceil(defeatedEnemies.reduce(function(a,b){return a + b.p.level; }, 0) / defeatedEnemies.length);
            var averageLevelOfAllies = Math.ceil(this.allies.reduce(function(a,b){return a + b.p.level;}, 0) / this.allies.length);
            var completeContributions = {
                damage:this.allyExpContributions.reduce(function(a,b){return a + b.damageDealt;},0) + this.allyExpContributions.reduce(function(a,b){return a + b.damageTaken;},0) + this.allyExpContributions.reduce(function(a,b){return a + b.damageHealed;},0),
                status:this.allyExpContributions.reduce(function(a,b){return a + b.statusCured;},0) + this.allyExpContributions.reduce(function(a,b){return a + b.statusApplied;},0),
                life:this.allyExpContributions.reduce(function(a,b){return a + b.enemiesDefeated;},0) + this.allyExpContributions.reduce(function(a,b){return a + b.alliesRevived;},0)
            };
            var portionWeight = {
                damage:0.6,
                status: 0.2,
                life:0.2
            };
            if(completeContributions.damage === 0){
                portionWeight.status += portionWeight.damage/2;
                portionWeight.life += portionWeight.damage/2;
            }
            if(completeContributions.status === 0){
                portionWeight.damage += portionWeight.status;
            }
            if(completeContributions.life === 0){
                portionWeight.damage += portionWeight.life;
            }
            for(var i=0;i<this.allyExpContributions.length;i++){
                var allyCont = this.allyExpContributions[i];
                var ally = this.allies.find(function(a){return a.p.name === allyCont.name;});
                
                var damageRatio = (allyCont.damageDealt + allyCont.damageTaken + allyCont.damageHealed) / completeContributions.damage;
                var statusRatio = (allyCont.statusCured + allyCont.statusApplied) / completeContributions.status;
                var lifeRatio = (allyCont.enemiesDefeated + allyCont.alliesRevived) / completeContributions.life;
                
                var damagePortion = ((potentialExp * portionWeight.damage) * (damageRatio || 0)) / this.allyExpContributions.length;
                var statusPortion = ((potentialExp * portionWeight.status) * (statusRatio || 0)) / this.allyExpContributions.length;
                var lifePortion = ((potentialExp * portionWeight.life) * (lifeRatio || 0)) / this.allyExpContributions.length;
                var level = ally.p.level;
                //0.2+ per level
                var base = 0.2;
                var enemyLevelMultiplier = Math.max(base, 1 + ((averageLevelOfEnemies - level) * base));
                var expGain = Math.floor((damagePortion + statusPortion + lifePortion) * enemyLevelMultiplier);
                ally.p.expGain = expGain;
            }
            
            $(document.body).append(cont);
            
            //Save hp and tp from battle
            this.allies.forEach(function(ally){
                //Find the associated saved ally
                var char = Q.partyManager.allies.filter(function(c){
                    return c.name===ally.p.name&&c.uniqueId===ally.p.uniqueId;
                })[0];
                if(!char) return;
                char.exp += ally.p.expGain;
                var charCont = $("<div class='leaderboard-cont-itm'><div>"+ally.p.name+"</div><div>EXP+ "+ally.p.expGain+"</div></div>");
                exp.append(charCont);
                
                if(CharacterGenerator.checkLevelUp(char.exp)){
                    var props = CharacterGenerator.levelWithExp(char.exp,char.baseStats,char.primaryStat,char.primaryCoordinate,char.lean);
                    charCont.append("<div>Lv. Up! "+char.level+"->"+(char.level+props.levels)+"</div>");
                    char.baseStats = props.stats;
                    char.exp = props.newExp;
                    char.level += props.levels;
                    CharacterGenerator.getCombatStats(char);
                }
                //TEMP - IF ALEX, SET HP TO FULL AND NOT WOUNDED
                if(char.name==="Alex"){
                    char.combatStats.hp = char.combatStats.maxHp;
                    char.combatStats.tp = char.combatStats.maxTp;
                    return;
                }
                //TEMP for now set hp to 1 after battle if dead.
                char.combatStats.hp = ally.p.combatStats.hp || 1;
                char.combatStats.tp = ally.p.combatStats.tp;
                if(ally.hasStatus("Dead")){
                    char.wounded = 5;
                } else if(ally.hasStatus("Bleeding Out")){
                    char.wounded = 5-ally.hasStatus("Bleeding Out").turns+1;
                }
            });
            Q.partyManager.allies.forEach(function(char){
                char.placedOnMap = false;
            });
            
            function next(){
                Q.BattleMenusController.destroyAll();
                $("#leaderboard").remove();
                //TODO: checks
                //Cycle week happens in location
                //TODO: change event here
                //Q.timeController.cycleWeek(props);
                var events = props.events;
                //Reset contributions
                //TODO: save awards
                Q.BatCon.allyExpContributions = [];
                
                //TEMP - Start next scene. This might actually be what happens here, I dunno
                Q.startScene(props.next[0], props.next[1], props.next[2]);
            }
            Q.stage().on("pressedConfirm", next);
            $("#leaderboard-next-button").click(next);
            
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
            if(!obj.hasStatus("Dead")&&!obj.hasStatus("Bleeding Out")&&!obj.hasStatus("Fainted")&&!obj.p.lifted){
                return true;
            } else if(obj.hasStatus("Fainted")){ 
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
                        obj.addStatus("Dead",999,"debuff",obj);
                    }
                }
            }
        },
        applyExpContribution:function(obj,type,amount){
            if(obj && obj.p.team === "Ally") this.allyExpContributions.find(function(ally){return ally.name === obj.p.name;})[type] += amount;
        },
        advanceRound:function(){
            this.turnOrder = this.generateTurnOrder(this.stage.lists[".interactable"]);
            this.round ++;
            Q.modifiedTilesController.reduceTurn();
            this.battleTriggers.processTrigger("rounds",this.round);
        },
        //Starts the character that is first in turn order
        startTurn:function(){
            var obj = this.turnOrder[0];
            if(!obj) alert("Everything is dead... Need to come up with a case for last move killing all characters on field.");
            
            //Advance the character's status effects. (poison, etc..)
            obj.advanceStatus();
            //Advance the character's stat changes (atkUp, etc..)
            obj.advanceStatChanges();
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
                //Q.pointer.checkTarget();
                Q.pointer.on("atDest",function(){
                    this.p.loc = Q.BatCon.turnOrder[0].p.loc;
                    //this.checkTarget();
                    //Start the turn. Will return false if the character can't do anything this turn  for whatever reason (dead, ini under 0, etc...)
                    if(Q.BatCon.turnOrder[0].startTurn()){
                        //Display the menu on turn start
                        Q.BattleMenusController.displayActions("turnActions");
                        
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
        filterByTeam:function(arr,team){
            return arr.filter(function(char){
                return char.p.team === team;
            });
        },
        addToTeam:function(obj){
            var team = obj.p.team==="Ally" ? this.allies : this.enemies;
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
        validateTileTo:function(tileType,canMoveOn){
            var required = Q.state.get("tileTypes")[tileType].required;
            if(required){
                if(canMoveOn[required]){
                    return tileType;
                }
                return "impassable";
            }
            return tileType;
        },
        locsMatch:function(loc1,loc2){
            return loc1[0] === loc2[0] && loc1[1] === loc2[1];
        },
        getTileType:function(loc){
            //Could probably use this built in function...
            //tileLayer.getCollisionObject(loc[0],loc[1])
            
            //Prioritize the collision objects
            var tileLayer = this.stage.lists.TileLayer[1];
            if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                var type = tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type; 
                return type || "impassable";
            }
            //Next, check the modified tiles
            var tileLayer = Q.ModifiedGroundTileLayer;
            if(tileLayer){
                if(tileLayer.p.tiles[loc[1]]&&tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]]){
                    var type = tileLayer.tileCollisionObjects[tileLayer.p.tiles[loc[1]][loc[0]]].p.type;
                    return type || "impassable";
                }
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
        previewAttackTarget:function(user, loc){
            //TODO: show attack prediction where the user confirms attack after seeing % and damage, etc....
            
            //For now, just confirm the attack
            //Regular attacks never target more than one enemy, so find the enemy on the targeted tile.
            var target =  Q.BattleGrid.getObject(loc);
            //Set the user's dir to face the target
            user.p.dir = Q.compareLocsForDirection(user.p.loc, target.p.loc);
            Q.BatCon.attackFuncs.doAttack(user, [target], false, [loc]);
            
            
            //Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user,targets:[Q.BattleGrid.getObject(loc)]}));
        },
        //Previews a skill
        previewDoTechnique:function(user, loc, technique, targets, tiles){
            //TODO: show technique prediction
            
            user.p.dir = Q.compareLocsForDirection(user.p.loc, targets[0].p.loc, user.p.dir);
            Q.BatCon.attackFuncs.doAttack(user, targets, technique, tiles);
            //Q.stage(2).insert(new Q.AttackPreviewBox({attacker:user, targets:targets, technique:technique, areaAffected:tiles}));
        },
        showEndTurnDirection:function(obj){
            obj.add("directionControls");
            function done(){
                obj.directionControls.removeControls();
                Q.stage().off("pressedConfirm");
                Q.stage().off("clickedStage");
                Q.BatCon.endTurn();
            }
            Q.stage().on("pressedConfirm", done);
            Q.stage().on("clickedStage", done);
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
            if(aLoc[0]<dLoc[0]&&aLoc[1]>dLoc[1]) return {up: true, right:true};
            if(aLoc[0]<dLoc[0]&&aLoc[1]<dLoc[1]) return {down: true, right:true};
            if(aLoc[0]>dLoc[0]&&aLoc[1]>dLoc[1]) return {up: true, left:true};
            if(aLoc[0]>dLoc[0]&&aLoc[1]<dLoc[1]) return {down: true, left:true};
        },
        //Compares the first obj's dir to the second object's dir.
        compareDirection:function(attacker, defender){
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
            var userDir = getDirection(attacker.p.dir, dirs);
            //Get the number for the target dir
            var targetDir = getDirection(defender.p.dir, dirs);
            //An array of the values (also clockwise from 12 o'clock)
            //EX:
            //if both user and target are 'Up', they will both be 0 and that will give the back value (since they are both facing up, the user has attacked from behind).
            var values = [back, side, front, side];
            for(var j=0;j<values.length;j++){
                //Make sure we are in bounds, else loop around to the start of the array
                if(checkBounds(userDir + j) === targetDir){
                    //If the characters are diagonal to each other, we're attacking from the side.
                    //If this wasn't included, there would be inconsistencies because of diagonal direction.
                    if(Math.abs(attacker.p.loc[0]-defender.p.loc[0]) === Math.abs(attacker.p.loc[1]-defender.p.loc[1])){
                        attacker.p.canSetDir = this.getDiagDirs(attacker.p.loc,defender.p.loc);
                        return side;
                    } else {
                        attacker.p.canSetDir = false;
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
                props.defender.playStand(Q.compareLocsForDirection(props.defender.p.loc, props.attacker.p.loc, props.defender.p.dir));
            }
            var dir = this.compareDirection(props.attacker, props.defender);
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
            props.atkResult = attackResult;
            props.defenseResult = defenseResult;
            props.finalResult = result;
            props.dir = dir;
            props.attackingAgain = props.attackNum < props.attackerAtkSpeed;
            return props;
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
            switch(props.finalResult){
                case "Critical":
                    damage = this.criticalBlow(props.attackerAtkSpeed,props.attackerMaxAtkDmg,props.defenderHP,props.attacker,props.defender,props.skill)*props.finalMultiplier;
                    if(props.attacker.p.talents.includes("Critical Mastery")) damage+=props.attacker.p.combatStats.skill+props.attacker.p.level;
                    sound = "critical_hit.mp3";
                    break;
                case "Solid":
                    damage = this.solidBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDamageReduction)*props.finalMultiplier;
                    break;
                case "Glancing":
                    damage = this.glancingBlow(props.attackerMinAtkDmg,props.attackerMaxAtkDmg,props.defenderDefensiveAbility)*props.finalMultiplier;
                    sound = "glancing_blow.mp3";
                    break;
                case "Miss":
                    damage = 0;
                    sound = "cannot_do.mp3";
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
        accuracyCheck:function(randMax,check){
            return Math.floor(Math.random()*randMax) <= check;
        },
        //Checks against the defender's resistance of a certain technique type.
        checkResisted:function(attacker,defender,technique){
            //If the technique always hits allies and the target is an ally, it hit.
            if(attacker.p.team === defender.p.team && technique.rangeProps.includes("AllyNoMiss")) return false;
            if(technique.resistedBy.includes("Physical")){
                return this.accuracyCheck(100,defender.p.combatStats.physicalResistance);
            }
            if(technique.resistedBy.includes("Magical")){
                return this.accuracyCheck(100,defender.p.combatStats.magicalResistance);
            }
            if(technique.resistedBy.includes("Mental")){
                var res = defender.p.talents.include("Self Empowerment") ? 100 : defender.p.combatStats.mentalResistance;
                return this.accuracyCheck(100,res);
            }
            return false;
        },
        getAttackProps:function(attacker,defender,extraAttack){
            return {
                attackNum:Math.ceil(Math.random()*100),
                defendNum:Math.ceil(Math.random()*100),
                attackerCritChance:attacker.p.combatStats.critChance+((extraAttack&&attacker.p.talents.includes("Critical Flurry")) ? 20 : 0),
                attackerAtkAccuracy:attacker.p.combatStats.atkAccuracy,
                attackerAtkSpeed:attacker.p.combatStats.atkSpeed,
                attackerMaxAtkDmg:attacker.p.combatStats.maxAtkDmg,
                attackerMinAtkDmg:attacker.p.combatStats.minAtkDmg,
                defenderHP:defender.p.combatStats.hp,
                defenderDamageReduction:defender.p.combatStats.damageReduction,
                defenderDefensiveAbility:defender.p.combatStats.defensiveAbility,
                defenderAtkRange:defender.p.combatStats.atkRange,
                defenderCounterChance:defender.p.combatStats.counterChance,
                defenderReflexes:defender.p.combatStats.reflexes,
                attackerFainted:attacker.p.fainted,
                defenderFainted:defender.p.fainted,
                attacker:attacker,
                defender:defender,
                finalMultiplier:1,
                time:100
            };
        },
        regularAttack:function(attacker,defender,extraAttack){
            return this.processResult(this.getBlow(this.getAttackProps(attacker,defender,extraAttack)));
        },
        
        applyActiveStatArgs:function(attacker,defender,args,acceptedFunc){
            function evaluateOperator(num1,oper,num2){
                switch(oper){
                    case "+":
                        return num1 + num2;
                    case "-":
                        return num1 - num2;
                    case "*":
                        return num1 * num2;
                    case "/":
                        return num1 / num2;
                }
            };
            function getAmount(value,user,target){
                switch(value.type){
                    case "Number":
                        return value.amount;
                    case "User Base Stats":
                        return ~~evaluateOperator(user.p.combatStats[value.stat],value.oper,value.amount);
                    case "Target Base Stats":
                        return ~~evaluateOperator(target.p.combatStats[value.stat],value.oper,value.amount);
                    case "User Combat Stats":
                        return ~~evaluateOperator(user.p.combatStats[value.stat],value.oper,value.amount);
                    case "Target Combat Stats":
                        return ~~evaluateOperator(target.p.combatStats[value.stat],value.oper,value.amount);
                    case "Combat Result":
                        return ~~evaluateOperator(Q.BatCon.attackFuncs.combatResult[value.stat],value.oper,value.amount);
                        
                }
            }
            function changeStat(target,statType,stat,oper,value,turns,attacker){
                if(statType === "baseStats") statType = "combatStats";
                var newValue = Math.max(0,Math.floor(evaluateOperator(target.p[statType][stat],oper,getAmount(value,attacker,target))));
                var difference = target.p[statType][stat] - newValue;
                console.log(target,statType,stat,oper,value,turns,attacker)
                if(difference){
                    console.log(target.p.name+"'s "+stat+" has changed from "+target.p[statType][stat]+" to "+newValue+"!");
                    if(stat === "hp" || stat === "tp"){
                        var max = stat === "hp" ? target.p.combatStats.maxHp : target.p.combatStats.maxTp;
                        target.p[statType][stat] = Math.min(max,newValue);
                        Q.BatCon.attackFuncs.text.push({func:"showHealed",obj:target,props:[-difference]});
                    } else {
                        target.p[statType][stat] = newValue;
                        //Add to reverse effect when the turns is 0.
                        target.addStatChange({stat:stat,statType:statType,amount:difference,turns:turns});
                    }
                }
            }
            for(var i=0;i<args.length;i++){
                var arg = args[i];
                if(arg.func === acceptedFunc){
                    if(!this.accuracyCheck(100,arg.accuracy)) return;
                    var target = arg.affects === "User" ? attacker : defender;
                    var stat = arg.stat;
                    if(stat === "atkDmg"){
                        changeStat(target,arg.statType,"maxAtkDmg",arg.oper,arg.value,arg.turns,attacker);
                        changeStat(target,arg.statType,"minAtkDmg",arg.oper,arg.value,arg.turns,attacker);
                    } else {
                        changeStat(target,arg.statType,arg.stat,arg.oper,arg.value,arg.turns,attacker);
                    }
                }
            }
        },
        techniqueAttack:function(attacker,defender,technique){
            //Apply any stat boosts that happen
            this.applyActiveStatArgs(attacker,defender,technique.args,"Change Stat Active");
            
            var props = this.getAttackProps(attacker,defender);
            props.attackerAtkAccuracy = technique.accuracy;
            switch(technique.type1){
                case "Damage":
                    //Get the stat for damage
                    switch(technique.type2){
                        case "Physical":
                            props.attackerMaxAtkDmg += technique.damage;
                            props.attackerMinAtkDmg += technique.damage;
                            break;
                        case "Magical":
                            console.log(attacker)
                            props.attackerMaxAtkDmg = technique.damage + attacker.p.level*(attacker.p.combatStats.skill/8);
                            props.attackerMinAtkDmg = technique.damage + attacker.p.level*(attacker.p.combatStats.skill/10);
                            break;
                        case "Mental":
                            props.attackerMaxAtkDmg = technique.damage + attacker.p.level*(attacker.p.combatStats.skill/8);
                            props.attackerMinAtkDmg = technique.damage + attacker.p.level*(attacker.p.combatStats.skill/10);
                            break;
                    }
                    
                    if(technique.resistedBy.includes("RegAttack")){
                        var result = this.processResult(this.getBlow(props));
                        result.attackingAgain = false;
                        return result;
                    } else if(technique.resistedBy.includes("Dodge")){
                        //Dodge means no defense from armour
                        props.defenderDefensiveAbility = 0;
                        var result = this.processResult(this.getBlow(props));
                        result.attackingAgain = false;
                        return result;
                    } else {
                        //Check for accuracy
                        if(this.accuracyCheck(100,props.attackerAtkAccuracy)){
                            props.damage = this.getDamage(Math.floor(Math.random()*(props.attackerMaxAtkDmg-props.attackerMinAtkDmg)+props.attackerMinAtkDmg));
                        } else {
                            props.damage = 0;
                        }
                        return props;
                    }
                case "Support":
                    props.time = 100;
                    return props;
                case "Debilitate":
                    props.time = 100;
                    return props;
            }
        },
        calcAttack:function(attacker,defender,technique,extraAttack){
            if(attacker.p.tempHp<=0||defender.p.tempHp<=0) return;
            //The time it takes between defensive animations
            //This sometimes is different depending on the skill
            var time;
            var damage;
            var sound;
            if(technique){
                if(this.checkResisted(attacker,defender,technique)){
                    this.text.push({func:"showResisted",obj:defender,props:[attacker]});
                    return;
                }
                var props = this.techniqueAttack(attacker,defender,technique);
                time = props.time;
                damage = props.damage;
                console.log(technique)
                sound = props.sound;
                this.combatResult.Damage += damage;
            } 
            //Regular attack
            else {
                var props = this.regularAttack(attacker,defender,extraAttack);
                damage = props.damage;
                sound = props.sound;
                this.combatResult.Damage += damage;
            }
            //After the damage has been calculated, come up with the text to show the user
            if(damage>0){
                this.text.push({func:"takeDamage",obj:defender,props:[damage,attacker,technique]});
                this.text.push({func:"showDamage",obj:defender,props:[damage,sound,technique]});
                if(props.result==="Critical"&&attacker.p.talents.includes("Bloodlust")){
                    this.text.push(this.entity.techniqueFuncs.healTp(Math.floor(damage/2),attacker)[0]);
                }
                defender.p.tempHp = defender.p.tempHp-damage;
                if(defender.p.tempHp<=0){
                    props.attackingAgain = false;
                } else if(damage>defender.p.combatStats.painTolerance){
                    defender.p.fainted = true;
                    this.text.push({func:"showFainted",obj:defender,props:[attacker,technique]});
                }
                if(props.attackingAgain){
                    //TODO: come up with better sound/anim for attacking again
                    this.text.push({func:"doAttackAnim",obj:attacker,props:[defender,"Attack","slashing",false]});
                    //Can't attack again with technique anyways, so don't even pass it
                    this.calcAttack(attacker,defender,false,true);
                }
            } 
            //Miss
            else if(damage===0){
                this.text.push({func:"showMiss",obj:defender,props:[attacker]});
            } 
            //Counter chance
            else if(damage===-1){
                this.previousDamage = 0;
                if(technique){
                    this.text.push({func:"showMiss",obj:defender,props:[attacker]});
                } else {
                    this.text.push({func:"showCounter",obj:defender,props:[attacker]});
                    this.calcAttack(defender,attacker);
                }
            }
            if(technique){
                this.checkStatusEffects(attacker,defender,technique);
                this.applyActiveStatArgs(attacker,defender,technique.args,"Change Stat After Combat");
            }
        },
        checkMovement(attacker,targets,technique,tiles){
            for(var i=0;i<technique.args.length;i++){
                var arg = technique.args[i];
                if(arg.func === "Move Character"){
                    if(!this.accuracyCheck(100,arg.accuracy || 100)) continue;
                    //TODO: condense all of of these redundant for loops.
                    switch(arg.target){
                        case "All":
                            if(arg.direction === "Forward") { 
                                for(var j=targets.length-1;j>=0;j--){
                                    var target = targets[j];
                                    this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,target,arg,true]});
                                }
                                this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,attacker,arg,false]});
                            } else {
                                this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,attacker,arg,true]});
                                for(var j=0;j<targets.length;j++){
                                    var target = targets[j];
                                    this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,target,arg,j !== targets.length]});
                                }
                            }
                            break;
                        case "User":
                            this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,!targets ? tiles : attacker,arg,false]});
                            break;
                        case "Target":
                            if(arg.direction === "Forward") { 
                                for(var j=targets.length-1;j>=0;j--){
                                    var target = targets[j];
                                    this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,target,arg,j !== 0]});
                                }
                            } else {
                                for(var j=0;j<targets.length;j++){
                                    var target = targets[j];
                                    this.text.push({func:"moveCharacter",obj:Q.BatCon.techniqueFuncs,props:[attacker,target,arg,j !== targets.length]});
                                }
                            }
                            break;
                    }
                }
            }
        },
        checkStatusEffects:function(attacker,defender,technique){
            for(var i=0;i<technique.args.length;i++){
                var arg = technique.args[i];
                if(arg.func === "Apply Status Effect"){
                    if(!this.accuracyCheck(100,arg.accuracy || 100)) continue;
                    if(arg.affects === "Target"){
                        this.text.push({func:"addStatus",obj:defender,props:[arg.statusEffect,arg.turns,false,attacker]});
                    } else {
                        this.text.push({func:"addStatus",obj:attacker,props:[arg.statusEffect,arg.turns,false,attacker]});
                    }
                } else if(arg.func === "Remove Status Effect"){
                    if(!this.accuracyCheck(100,arg.accuracy || 100)) continue;
                    if(arg.affects === "Target"){
                        this.text.push({func:"removeStatus",obj:defender,props:[arg.statusEffect,arg.turns,false,attacker]});
                    } else {
                        this.text.push({func:"removeStatus",obj:attacker,props:[arg.statusEffect,arg.turns,false,attacker]});
                    }
                }
            }
        },
        //Do args that are not Change Stat Active/Passive
        checkChangeGround:function(technique,tiles){
            for(var i=0;i<technique.args.length;i++){
                var arg = technique.args[i];
                if(arg.func === "Change Ground"){
                    if(arg.target === "changeTile"){
                        //TO DO: Change the mirage data to have a sheet and other properties for animation.
                        //It should also not simply change the tile, but have its own Character object that gets added to the turn order and attracts characters on its turn.
                        //The code should already be mostly written (objects.js line 1000-ish)
                        //I definitely need to rework it a lot, however.
                        //This changeData could also be taken from the tileCollisionObjects of the modified tile layer
                        var changeData = {
                            "Icy":{frame:5,invalid:["impassable"]},
                            "Burning":{frame:4,invalid:["impassable"]},
                            "Stable":{frame:6,invalid:["impassable"]},
                            "Caltrops":{frame:7,invalid:["impassable"]},
                            "Mirage":{frame:8,invalid:["impassable"]}
                        };
                        var changeTiles = [];
                        for(var j=0;j<tiles.length;j++){
                            var tile = tiles[j];
                            if(!changeData[arg.tile].invalid.includes(Q.BatCon.getTileType(tile))){
                                if(this.accuracyCheck(100,arg.accuracy)){
                                    var turns = Math.floor(Math.random()*(arg.maxTurns-arg.minTurns))+arg.minTurns;
                                    changeTiles.push({x:tile[0],y:tile[1],frame:changeData[arg.tile].frame,turns:turns});
                                }
                            }
                        }
                        this.text.push({func:"setTiles",obj:Q['modifiedTilesController'],props:[changeTiles]});
                    }
                }
            }
        },
        getTechniqueCost:function(cost,efficiency){
            return Math.max(1,cost - efficiency);
        },
        doAttack:function(attacker,targets,technique,tiles){
            this.combatResult = {
                Damage:0
            };
            this.text = [];
            var anim = "Attack";
            var sound = "slashing";
            var dir;
            attacker.p.didAction = true;
            attacker.p.tempHp = attacker.p.combatStats.hp;
            if(technique){
                attacker.p.combatStats.tp-=this.getTechniqueCost(technique.tpCost,attacker.p.combatStats.efficiency);
                if(technique.animation) anim = technique.animation;
                if(technique.sound) sound = technique.sound;
            }
            this.text.push({func:"doAttackAnim",obj:attacker,props:[targets[0],anim,sound,dir]});
            if(technique){
                this.checkMovement(attacker,targets.length ? targets : false,technique,tiles[0]);
            }
            //Compute the attack
            for(var i=0;i<targets.length;i++){
                targets[i].p.tempHp = targets[i].p.combatStats.hp;
                this.calcAttack(attacker,targets[i],technique);
                this.previousDamage = 0;
            }
            if(technique){
                //Change Ground
                this.checkChangeGround(technique,tiles);
                //Check to see if we should remove any status at 0 turns (the only ones at 0 at this point should have been applied just for this attack)
                attacker.checkRemoveStatChange();
                targets.forEach(function(target){target.checkRemoveStatChange();});
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
            if(active.p.combatStats.hp<=0 || active.p.fainted){
                Q.BatCon.endTurn();
                return;
            }
            //Remove any characters that have been defeated
            //Q.BatCon.removeMarked();
            //If this character has now attacked and moved, end their turn.
            if(active.p.didMove){
                if(active.p.canSetDir){
                    Q.BatCon.showEndTurnDirection(active);
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
                if(true || active.p.team!=="Enemy"){
                    Q.BattleMenusController.displayActions("turnActions");
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
    Q.component("techniqueFuncs",{
        moveCharacter:function(user,target,arg,instantCallback,callback){
            switch(arg.direction){
                case "Forward":
                    this.moveCharacterTo(user,target,arg.numTiles,arg.movementType,instantCallback ? false : callback);
                    break;
                case "Backward":
                    this.moveCharacterTo(user,target,-arg.numTiles,arg.movementType,instantCallback ? false : callback);
                    break;
            }
            instantCallback ? callback() : false;
        },
        validateMovedTo:function(user,target,numTiles,moveType){
            var tiles = [];
            var type;
            //Jump over tiles that can be gone over with an ability (water, but not walls)
            var jumping = moveType === "JumpOver";
            //Pierce through the target/s (ally or enemy)
            var piercing = moveType === "Pierce";
            //Go until reaching an object or impassable tile
            var pushing = moveType === "Push";
            //Teleport to the destination with no regard for what is in between
            var teleport = moveType === "Teleport";
            var dir;
            var targetIsArray = Array.isArray(target);
            if(user === target){
                dir = user.p.dir;
            } else if(!targetIsArray){
                dir = Q.compareLocsForDirection(user.p.loc, target.p.loc);
            } else {
                dir = user.p.dir;
            }
            //Make a path of locs to move the character
            var path = [];
            if(numTiles < 0){
                dir = Q.getOppositeDir(dir);
                numTiles = -numTiles;
            }
            var arr = Q.getDirArray(dir);
            var targetIsArray = Array.isArray(target);
            var jumpingPrivilege = {"waterWalk":true};
            function tileClear(loc,next,final){
                var emptyNextTile = next ? (Q.BatCon.validateTileTo(Q.BatCon.getTileType(next), target.p.canMoveOn) !== "impassable" && Q.BattleGrid.getObject(next)) : false;
                
                var canMoveOn = jumping && !final && emptyNextTile ? jumpingPrivilege : !targetIsArray ? target.p.canMoveOn : false;
                
                var objOn =  final || pushing ? Q.BattleGrid.getObject(loc) : (!jumping && !piercing);
                var tileType = Q.BatCon.validateTileTo(Q.BatCon.getTileType(loc),canMoveOn);
                if(!objOn && tileType!=="impassable") return loc;
            };
            if(!teleport){
                var tLoc = targetIsArray ? user.p.loc : target.p.loc;
                if(targetIsArray){
                    numTiles = Q.BattleGrid.getTileDistance(user.p.loc,target);
                    target = user;
                }
                //Check each tile leading to the destination. Only push until the target bumps itno something it can't go through
                for(var i=1;i<numTiles+1;i++){
                    var loc = [tLoc[0]+arr[0]*i,tLoc[1]+arr[1]*i];
                    if(tileClear(loc, [loc[0]+arr[0]*(i+1),loc[1]+arr[1]*(i+1)] ,i === numTiles)){ 
                        path.push(loc);
                    } else {
                        if(!jumping){
                            break;
                        } else if(Q.BatCon.validateTileTo(Q.BatCon.getTileType(loc),jumpingPrivilege) === "impassable"){
                            break;
                        }
                    }
                }
                if(path.length){
                    var completePath = [];
                    //Check the tiles in reverse now to make sure that there is no target on the final tile.
                    for(var i=path.length-1;i>=0;i--){
                        var next = i>0 ? path[i-1] : false;
                        if(tileClear(path[i],next,i === path.length-1)){
                            completePath.push(path[i]);
                        };
                    }
                    if(completePath.length){
                        tiles = completePath[0];
                        type = "pushed";
                    }
                }
            } 
            //For teleport
            else {
                var dest;
                //Teleport to the location selected
                if(targetIsArray){
                    dest = target;
                } 
                //Teleport past the target character
                else {
                    var tLoc = target.p.loc;
                    dest = [tLoc[0]+arr[0]*numTiles,tLoc[1]+arr[1]*numTiles];
                }
                if(tileClear(dest,false,true)){
                    tiles = dest;
                    type = "teleported";
                }
            }
            return {tiles:tiles,type:type};
        },
        moveCharacterTo:function(user,target,numTiles,movementType,callback){
            var data = this.validateMovedTo(user,target,numTiles,movementType);
            if(data.tiles.length){
                if(Array.isArray(target)){
                    user.movedByTechnique(data.tiles,data.type,callback);
                } else {
                    target.movedByTechnique(data.tiles,data.type,callback);
                }
                //if(data.type === "walk") user.p.walkMatrix = new Q.Graph(Q.getMatrix("walk",user.p.team,user.p.canMoveOn,user));
            } else {
                if(callback) callback();
            }
        },
        
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
            if(!Q.BattleGrid.getObject(userTileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(userTileTo),user.p.canMoveOn)!=="impassable"){
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
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(tileTo),target.p.canMoveOn)!=="impassable"){
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
            if(!Q.BattleGrid.getObject(tileTo)&&Q.BatCon.validateTileTo(Q.BatCon.getTileType(tileTo),user.p.canMoveOn)!=="impassable"){
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
        removeStatus:function(status,target,user,props){
            var text = [];
            if(status === "All"){
                text.push({func:"removeAllBadStatus",obj:target,props:[user]});
            } else if(target.hasStatus(status)){
                text.push({func:"removeStatus",obj:target,props:[status,user]});
            }
            return text;
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
            target.p.combatStats[stat] += amount;
            console.log(target.p.name+"'s "+stat+" has increased by "+amount+"!");
            return {func:"showStatUp",obj:target,props:[amount,stat]};
            //Q.BatCon.attackFuncs.text.unshift({func:"showStatUp",obj:target,props:[amount,stat]});
            //callback();
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
