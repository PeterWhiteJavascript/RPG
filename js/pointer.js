Quintus.Pointer = function(Q){
    Q.UI.Container.extend("ViewSprite",{
        init: function(p) {
            this._super(p, {
                w:Q.width,
                h:Q.height,
                type:Q.SPRITE_UI, 
                x:Q.pointer.p.x, 
                y:Q.pointer.p.y, 
                dragged:false
            });
            this.add("tween");
            this.on("touch");
            this.on("drag");
        },
        animateTo:function(to, speed, callback){
            if(this.p.obj){
                this.p.obj = false;
                this.off("step","follow");
            }
            if(!speed){
                this.p.x = to.x;
                this.p.y = to.y;
                if(callback){
                    callback();
                }
            } else {
                this.animate({x:to.x,y:to.y},speed,Q.Easing.Quadratic.InOut,{callback:callback || function(){} });
            }
        },
        unfollowObj:function(){
            this.p.obj = false;
        },
        followObj:function(obj){
            this.p.obj = obj;
            this.on("step","follow");
        },
        follow:function(){
            var obj = this.p.obj;
            if(obj){
                this.p.x = obj.p.x;
                this.p.y = obj.p.y;
            } else {
                this.off("step","follow");
            }
        },
        //If we're not following the viewSprite, follow it
        touch:function(){
            if(this.stage.viewport.following !== this){
                Q.viewFollow(this, this.stage);
            }
        },
        //On mouseup, figure out if we've clicked a direction
        placement:function(coords){
            if(this.p.disabled) return;
            var obj = this.stage.locate(coords.stageX, coords.stageY, Q.SPRITE_DIRECTION);
            if(!obj){
                //We clicked without dragging
                if(!Q.pointer.p.disabled && !this.stage.dragged){
                    Q.pointer.setLoc(Q.getLoc(coords.stageX, coords.stageY));
                    Q.BatCon.setXY(Q.pointer);
                    Q.stage().trigger("pressedConfirm", "confirm");
                } else {
                    Q.stage().trigger("pressedOffMenu", "offMenu");
                }
            } else {
                //We've clicked a directional arrow
                Q.stage().trigger("pressedConfirm");
            }
            this.stage.dragged = false;
        },
        drag:function(touch){
            this.p.x = touch.origX - touch.dx / this.stage.viewport.scale;
            this.p.y = touch.origY - touch.dy / this.stage.viewport.scale;
            this.stage.dragged = true;
        },
        centerOn:function(loc){
            var pos = Q.getXY(loc);
            this.p.x = pos.x;
            this.p.y = pos.y;
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
                stepDelay:Q.optionsController.options.pointerSpeed === "Fast" ? 0.1 : Q.optionsController.options.pointerSpeed === "Medium" ? 0.2 : Q.optionsController.options.pointerSpeed === "Slow" ? 0.3 : 0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[],
                disabled:true
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
            this.p.diffX = 0;
            this.p.diffY = 0;
            this.p.stepping=false;
            this.setLoc(obj.p.loc);
            Q.BatCon.setXY(this);
        },
        getTerrain:function(){
            var type = Q.BatCon.getTileType(this.p.loc);
            this.trigger("onTerrain",type);
        },
        //Check to see if we're now hovering an interactable object
        checkTarget:function(){
            var p = this.p;
            p.target = Q.BattleGrid.getObject(p.loc);
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
        checkAnimateTo:function(){
            var stage = Q.stage();
            //If the user dragged the screen, tween back to the pointer (or snap)
            if(stage.viewport.following !== this){
                var pointer = this;
                stage.viewSprite.centerOn(this.p.loc);
                Q.viewFollow(pointer, stage);
                //stage.viewSprite.animate({x:pointer.p.x, y:pointer.p.y}, 0.1,{callback:function(){Q.viewFollow(pointer, stage);}});
            } else {
                stage.viewSprite.centerOn(this.p.loc);
            }
        },
        setLoc:function(newLoc){
            this.p.loc = newLoc;
            this.getTerrain();
            this.checkTarget();
        },/*
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
            } else if(Q.inputs['ctrl']){
                this.trigger("pressedCtrl",this);
                Q.inputs['ctrl'] = false;
            }
        },*/
        //Do the logic for the directional inputs that were pressed
        checkInputs:function(){
            var p = this.p;
            if(p.stepping) return;
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
                this.setLoc(newLoc);
                //Put next line in listener in character (on at start of turn maybe)
                //if(p.user) p.user.playStand(Q.compareLocsForDirection(p.user.p.loc,p.loc,p.user.p.dir));
                this.trigger("inputMoved", this.p.loc);
                //this.checkAnimateTo();
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //If we are rotating a sprite
        checkStraightInputs:function(){
            var p = this.p;
            if(p.stepping) return;
            var input = Q.inputs;
            var newLoc = [Q.BatCon.turnOrder[0].p.loc[0], Q.BatCon.turnOrder[0].p.loc[1]];
            var dir;
            if(input['up']){
                newLoc[1] -= 1;
                dir = "up";
            } else if(input['down']){
                newLoc[1] += 1;
                dir = "down";
            } else if(input['right']){
                newLoc[0] += 1;
                dir = "right";
            } else if(input['left']){
                newLoc[0] -= 1;
                dir = "left";
            }
            input['up'] = false;
            input['down'] = false;
            input['right'] = false;
            input['left'] = false;
            var validLoc = this.checkValidLoc(newLoc);
            //If there's a dir, loc, and the loc is valid
            if(dir && validLoc){
                p.diffX = (newLoc[0] - p.loc[0]) * p.stepDistanceX;
                p.diffY = (newLoc[1] - p.loc[1]) * p.stepDistanceY;
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x+p.diffX;
                p.destY = p.y+p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                this.setLoc(newLoc);
                Q.BatCon.turnOrder[0].playStand(Q.compareLocsForDirection(Q.BatCon.turnOrder[0].p.loc, newLoc, Q.BatCon.turnOrder[0].p.dir));
                this.trigger("inputMoved", [Q.BatCon.turnOrder[0].p.loc[0], Q.BatCon.turnOrder[0].p.loc[1]]);
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
            
            this.trigger("atDest",[(coords.x-Q.tileW/2)/Q.tileW,(coords.y-Q.tileH/2)/Q.tileH]);//TEMP
            Q.pointer.snapTo(Q.BatCon.turnOrder[0]);//TEMP - the animation looks nicer.
            Q.stage().viewSprite.p.x = coords.x;
            Q.stage().viewSprite.p.y = coords.y;
            return;//TEMP
            var dist = Q.BattleGrid.getTileDistance(loc,this.p.loc);
            //Set lower to go faster
            var baseSpeed = Q.optionsController.options.cursorSpeed === "Fast" ? 25 : Q.optionsController.options.cursorSpeed === "Medium" ? 50 : Q.optionsController.options.cursorSpeed === "Slow" ? 75 : 100;
            var speed = (baseSpeed*dist)/1000;
            this.animate({x:coords.x,y:coords.y},speed,Q.Easing.Quadratic.Out,{callback:function(){this.trigger("atDest",[(coords.x-Q.tileW/2)/Q.tileW,(coords.y-Q.tileH/2)/Q.tileH]);}});
            this.p.loc = [loc[0],loc[1]];
        },
        step:function(dt){
            var p = this.p;
            p.z = p.y + Q.tileH / 2;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
                Q.stage().viewSprite.p.x = p.x;
                Q.stage().viewSprite.p.y = p.y;
            }
            if(p.stepWait > 0) { return;}
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
            }
            p.stepping = false;
            p.diffX = 0;
            p.diffY = 0;
        }
    });
    //Added to the pointer when it should be able to move around.
    Q.component("pointerControls",{
        added:function(){
            this.entity.show();
            if(this.entity.techMaxRangeFixed){
                Q.stage().on("pressedUp", this.entity, "checkStraightInputs");
                Q.stage().on("pressedRight", this.entity, "checkStraightInputs");
                Q.stage().on("pressedDown", this.entity, "checkStraightInputs");
                Q.stage().on("pressedLeft", this.entity, "checkStraightInputs");
                this.entity.hide();
                var dir = Q.BatCon.turnOrder[0].p.dir;
                Q.inputs[dir] = true;
            } else {
                Q.stage().on("pressedUp", this.entity, "checkInputs");
                Q.stage().on("pressedRight", this.entity, "checkInputs");
                Q.stage().on("pressedDown", this.entity, "checkInputs");
                Q.stage().on("pressedLeft", this.entity, "checkInputs");
                //Allow for moving the pointer by clicking
                Q.stage().on("selectedLocation", this, "centerOnLocation");  
                Q.stage().on("selectedCharacter", this, "centerOnCharacter");  
            }
            //Force the focus to the canvas
            $("#quintus").focus();
        },
        centerOnCharacter:function(objAt){
            this.entity.setLoc(objAt.p.loc);
            Q.BatCon.setXY(this.entity);
        },
        centerOnLocation:function(loc){
            this.entity.setLoc(loc);
            Q.BatCon.setXY(this.entity);
        },
        remove:function(){
            this.entity.hide();
            if(this.entity.techMaxRangeFixed){
                Q.stage().off("pressedUp", this.entity, "checkStraightInputs");
                Q.stage().off("pressedRight", this.entity, "checkStraightInputs");
                Q.stage().off("pressedDown", this.entity, "checkStraightInputs");
                Q.stage().off("pressedLeft", this.entity, "checkStraightInputs");
            } else {
                Q.stage().off("pressedUp", this.entity, "checkInputs");
                Q.stage().off("pressedRight", this.entity, "checkInputs");
                Q.stage().off("pressedDown", this.entity, "checkInputs");
                Q.stage().off("pressedLeft", this.entity, "checkInputs");
                Q.stage().off("selectedLocation", this, "centerOnLocation");  
                Q.stage().off("selectedCharacter", this, "centerOnCharacter");
            }
            this.entity.del("pointerControls");
        }
    });
    Q.component("pointerPlacementRoaming",{
        added:function(){
            Q.stage().on("pressedConfirm", this, "pressedConfirm");
            Q.stage().on("selectedLocation", this, "pressedConfirm");
            Q.stage().on("selectedCharacter", this, "pressedConfirm");
        },
        pressedConfirm:function(){
            var remove = Q.BatCon.battlePlacement.checkPlacement(this.entity.p.loc);
            if(remove){
                this.entity.pointerControls.remove();
                this.remove();
                Q.BattleMenusController.displayActions("characterSelection");
            }
        },
        remove:function(){
            Q.stage().off("pressedConfirm", this, "pressedConfirm");
            Q.stage().off("selectedLocation", this, "pressedConfirm");
            Q.stage().off("selectedCharacter", this, "pressedConfirm");
            this.entity.del("pointerPlacementRoaming");
        }
    });
    Q.component("pointerRoamingControls",{
        added:function(){
            Q.stage().on("pressedConfirm", this, "selectCharacter");
            Q.stage().on("pressedBack", this, "centerOnChar");
            Q.stage().on("selectedCharacter", this, "selectCharacter");
            Q.stage().viewSprite.unfollowObj();
        },
        centerOnChar:function(){
            var sp = Q.stage(0).viewSprite;
            var char = Q.BatCon.turnOrder[0];
            if(sp.p.x === char.p.x && sp.p.y === char.p.y){
                if(char.p.didMove){
                    char.resetMove();
                    this.centerOnChar();
                } else {
                    this.entity.pointerControls.remove();
                    this.remove();
                    Q.BattleMenusController.displayActions("turnActions");
                }
            } else {
                this.entity.snapTo(char);
                sp.animateTo(Q.BatCon.getXY(char.p.loc));
            }
        },
        selectCharacter:function(obj){
            obj = obj.p ? obj : Q.getSpriteAt([this.entity.p.loc[0], this.entity.p.loc[1]]);
            if(!obj) return;
            //If the obj selected is the current turn character
            if(obj === Q.BatCon.turnOrder[0]){
                this.entity.pointerControls.remove();
                this.remove();
                Q.BattleMenusController.displayActions("turnActions");
            } else {
                this.entity.pointerControls.remove();
                this.remove();
                Q.BattleMenusController.displayActions("characterStatus");
            }
        },
        remove:function(){
            Q.stage().off("pressedConfirm", this, "selectCharacter");
            Q.stage().off("pressedBack", this, "centerOnChar");
            Q.stage().off("selectedCharacter", this, "selectCharacter");
            this.entity.del("pointerRoamingControls");
        }
    });
    Q.Sprite.extend("HelperTile",{
       init:function(p){
           this._super(p, {
               w:Q.tileW,
               h:Q.tileH,
               color: "green",
               type:Q.SPRITE_NONE
           });
       },
       draw:function(ctx){
            ctx.fillStyle = this.p.color;
            ctx.fillRect(-this.p.w / 2, -this.p.h / 2, this.p.w, this.p.h);
       }
    });
    Q.component("pointerMovementControls",{
        added:function(){
            Q.stage().on("pressedBack", this, "snapBackToChar");
            Q.stage().on("pressedConfirm", this, "detectMovementTile");
            Q.stage().on("clickedStage", this, "detectMovementTile");
            Q.stage().on("mouseAt", this, "showHelperTile");
            Q.pointer.on("inputMoved", this, "moveHelperTile");
            this.helperTile = Q.stage().insert(new Q.HelperTile({color:"purple"}));
            this.prevLoc = [-1, -1];
            Q.stage().viewSprite.unfollowObj();
        },
        showHelperTile:function(e){
            if(e.dragged) return;
            var loc = Q.getLoc(e.stageX, e.stageY);
            if(loc[0] === this.prevLoc[0] && loc[1] === this.prevLoc[1]) return;
            this.moveHelperTile(loc);
            this.prevLoc = loc;
        },
        moveHelperTile:function(loc){
            var pos = Q.getXY(loc);
            this.helperTile.p.x = pos.x;
            this.helperTile.p.y = pos.y;
        },
        snapBackToChar:function(){
            this.entity.pointerControls.centerOnCharacter(Q.BatCon.turnOrder[0]);
            this.entity.pointerControls.remove();
            this.remove();
            Q.rangeController.resetGrid();
            Q.BattleMenusController.displayActions("turnActions");
        },
        detectMovementTile:function(loc){
            loc = loc.stageX ? Q.getLoc(loc.stageX, loc.stageY) : Q.pointer.p.loc;
            //Returns true if the character can move to the selected tile
            if(Q.rangeController.checkConfirmMove(Q.BatCon.turnOrder[0], loc)){
                //Remove controls now. Once the character reaches destination, then show menu again
                this.entity.pointerControls.remove();
                this.remove();
            } else {
                this.snapBackToChar();
            }
        },
        remove:function(){
            Q.stage().off("pressedBack", this, "snapBackToChar");
            Q.stage().off("pressedConfirm", this, "detectMovementTile");
            Q.stage().off("clickedStage", this, "detectMovementTile");
            Q.stage().off("mouseAt", this, "showHelperTile");
            this.helperTile.destroy();
            this.entity.del("pointerMovementControls");
        }
    });
    Q.component("pointerAttackControls",{
        added:function(){
            Q.stage().on("pressedBack", this, "snapBackToChar");
            Q.stage().on("pressedConfirm", this, "detectAttackTile");
            Q.stage().on("clickedStage", this, "detectAttackTile");
            this.prevLoc = [-1, -1];
            if(this.entity.technique){
                this.techRange = this.getRange(this.entity.technique, Q.BatCon.turnOrder[0]);
                Q.stage().on("mouseAt", this, "moveMouseAOE");
                Q.pointer.on("inputMoved", this, "moveAOE");
                this.moveAOE(this.entity.p.loc.slice(0));
            } else {
                this.helperTile = Q.stage().insert(new Q.HelperTile({color:"green"}));
                Q.stage().on("mouseAt", this, "showHelperTile");
                Q.pointer.on("inputMoved", this, "moveHelperTile");
            }
            Q.stage().viewSprite.unfollowObj();
        },
        getRange:function(technique, currentCharacter){
            var range = technique.range;
            //Don't display a range for maxRangeFixed
            if(!this.entity.techMaxRangeFixed){
                Q.rangeController.setTiles(2, currentCharacter.p.loc, range, technique.rangeProps, currentCharacter.p.attackMatrix);
                if(technique.rangeProps.includes("TargetSelf")){
                    Q.rangeController.setSpecificTile(2, currentCharacter.p.loc);
                }
            }
            return range;
        },
        moveAOE:function(loc){
            Q.aoeController.resetGrid();
            var char = Q.BatCon.turnOrder[0];
            var tech = this.entity.technique;
            Q.aoeController.setTiles(3, loc, char.p.dir, tech.aoe, tech.aoeType, tech.aoeProps, tech.rangeProps, this.techRange);
            this.prevLoc = loc;
        },
        moveMouseAOE:function(e){
            if(e.dragged) return;
            var loc = Q.getLoc(e.stageX, e.stageY);
            if(loc[0] === this.prevLoc[0] && loc[1] === this.prevLoc[1] || Q.BattleGrid.outOfBounds(loc)) return;
            if(!this.entity.techMaxRangeFixed){
                this.moveAOE(loc);
            } else {
                var char = Q.BatCon.turnOrder[0];
                char.p.dir = Q.getStraightDirection(loc, char.p.loc, char.p.dir);
                Q.inputs[char.p.dir] = true;
            }
        },
        moveHelperTile:function(loc){
            var pos = Q.getXY(loc);
            this.helperTile.p.x = pos.x;
            this.helperTile.p.y = pos.y;
        },
        showHelperTile:function(e){
            var loc = Q.getLoc(e.stageX, e.stageY);
            if(loc[0] === this.prevLoc[0] && loc[1] === this.prevLoc[1]) return;
            this.moveHelperTile(loc);
            this.prevLoc = loc;
        },
        snapBackToChar:function(){
            this.entity.pointerControls.centerOnCharacter(Q.BatCon.turnOrder[0]);
            this.entity.pointerControls.remove();
            this.remove();
            Q.rangeController.resetGrid();
            Q.BattleMenusController.displayActions(this.previousMenu);
        },
        detectAttackTile:function(loc){
            loc = loc.stageX ? Q.getLoc(loc.stageX, loc.stageY) : Q.pointer.p.loc;
            if(this.entity.technique){
                if(Q.rangeController.validateTechnique(this.entity.technique, loc, Q.BatCon.turnOrder[0])){
                    this.entity.pointerControls.remove();
                    this.remove();
                } else {
                    this.snapBackToChar();
                }
            } else {
                if(Q.rangeController.checkValidPointerLoc(Q.RangeTileLayer, loc, 2)){
                    if(Q.rangeController.validateAttack(Q.BatCon.turnOrder[0], loc)){
                        this.entity.pointerControls.remove();
                        this.remove();
                    };
                } else {
                    this.snapBackToChar();
                }
            }
        },
        remove:function(){
            Q.stage().off("pressedBack", this, "snapBackToChar");
            Q.stage().off("pressedConfirm", this, "detectAttackTile");
            Q.stage().off("clickedStage", this, "detectAttackTile");
            if(this.entity.technique){
                Q.stage().off("mouseAt", this, "moveMouseAOE");
                Q.pointer.off("inputMoved", this, "moveAOE");
                Q.aoeController.resetGrid();
                this.entity.technique = false;
                this.entity.techMaxRangeFixed = false;
            } else {
                this.helperTile.destroy();
                Q.stage().off("mouseAt", this, "showHelperTile");
                Q.pointer.off("inputMoved", this, "moveHelperTile");
            }
            this.entity.del("pointerAttackControls");
        }
    });
};