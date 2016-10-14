Quintus.HUD=function(Q){
    Q.UI.Container.extend("TerrainHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:200,h:100,
                type:Q.SPRITE_NONE,
                fill:"green"
            });
        }
    });
    Q.UI.Container.extend("StatsHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:300,h:100,
                type:Q.SPRITE_NONE,
                fill:"green"
            });
            this.p.x=Q.width-this.p.w;
        }
    });
    //Work in Progress (Copied from my other project)
    Q.Sprite.extend("Pointer",{
        init: function(p) {
            this._super(p, {
                sheet:"objects",
                frame:4,
                type:Q.SPRITE_NONE,
                w:Q.tileH,h:Q.tileH,
                
                guide:[],
                movTiles:[],
                
                stepDistance:Q.tileH,
                stepDelay:0.2,
                stepWait:0,
                
                flashObjs:[],
                viewNotSet:true,
                
                locsTo:[]
            });
        },
        initialize:function(){
            var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
            this.p.x = pos[0];
            this.p.y = pos[1];
            this.p.z=this.p.y+Q.tileH/2;
            this.p.destX = this.p.x;
            this.p.destY = this.p.y;
            this.p.diffX=0;
            this.p.diffY=0;
            this.moveGuide(0,0);
            this.on("unflash",this,"unFlashObjs");
            this.on("finished");
            this.showName(this.p.name);
        },
        showName:function(name){
            this.p.username = Q.stage(1).insert(new Q.UI.Container({x:this.p.x,y:this.p.y-this.p.h,z:100000}));
            this.p.username.insert(new Q.UI.Text({label:name,z:100000,size:20}));
            this.p.username.fit(2,2);
        },
        //This function displays the attack area and moves with the pointer
        createAttackArea:function(areas){
            this.p.attackAreas=areas;
            for(i=0;i<areas.length;i++){
                this.p.guide.push(Q.stage(1).insert(new Q.PathBox({loc:[this.p.loc[0]+areas[i][0],this.p.loc[1]+areas[i][1]]})));
            }
        },
        //Clears the guide that shows where you can place a player at the start of the scene
        clearStartGuide:function(){
            if(this.p.startGuide.length>0){
                for(i=0;i<this.p.startGuide.length;i++){
                    this.p.startGuide[i].destroy();
                }
            }
        },
        validPointerLoc:function(){
            var guide = this.p.player.p.guide;
            var valid = false;
            for(i=0;i<guide.length;i++){
                if(guide[i].p.loc[0]===this.p.loc[0]&&guide.p.loc[1]===this.p.loc[1]){
                    valid = true;
                }
            }
            return valid;
        },
        clearGuide:function(){
            var p = this.p;
            if(p.guide&&p.guide.length>0){
                for(i=0;i<p.guide.length;i++){
                    p.guide[i].destroy();
                }
            }
            this.p.guide=[];
        },
        finished:function(){
            this.trigger("unflash");
            if(this.p.user.p.player){
                this.p.user.p.player.clearGuide();
            }
            this.clearGuide();
            Q.clearStage(3);
            this.stage.remove(this);
            this.stage.remove(this.p.username);
        },
        flashObjs:function(guide){
            var obj = Q.getTarget(guide.p.x,guide.p.y);
            if(obj&&this.p.user.p.player.checkValidTarget(obj,this.p.attack)&&this.p.user.p.player.checkValidAttackTarget(obj)){
                obj.flash();
                this.p.flashObjs.push(obj);
            }
        },
        unFlashObjs:function(){
            if(this.p.flashObjs.length>0){
                for(i=0;i<this.p.flashObjs.length;i++){
                    this.p.flashObjs[i].stopFlash();
                }
            }
        },
        moveGuide:function(dir,sd){
            var guide = this.p.guide;
            this.unFlashObjs();
            this.p.flashObjs=[];
            if(guide.length>0){
                for(var i=0;i<guide.length;i++){
                    guide[i].p[dir]+=sd;
                    this.flashObjs(guide[i]);
                }
            }
        },
        //Checks to see if we're going off the map and stop it.
        checkValidLoc:function(loc){
            if(loc[0]<0||loc[1]<0||loc[0]>=Q.state.get("mapWidth")||loc[1]>=Q.state.get("mapHeight")){
                return false;
            }
            return loc;
        },
        compareLocs:function(loc){
            //Compare the locs and determine the movement
            var inputs = {};
            var pLoc = this.p.loc;
            switch(true){
                case pLoc[0]>loc[0]:
                    inputs.left=true;
                    break;
                case pLoc[0]<loc[0]:
                    inputs.right=true;
                    break;
            }
            switch(true){
                case pLoc[1]>loc[1]:
                    inputs.up=true;
                    break;
                case pLoc[1]<loc[1]:
                    inputs.down=true;
                    break;
            }
            return inputs;
        },
        move:function(loc){
            if(!this.p.stepping){
                var inputs = this.compareLocs(loc);
                this.checkInputs(inputs);
            } else {
                this.p.locsTo.push(loc);
            }
        },
        //Do the logic for the directional inputs that were pressed
        checkInputs:function(input){
            var p = this.p;
            var loc;
            var newLoc = [p.loc[0],p.loc[1]];
            if(input['up']){
                p.diffY = -p.stepDistance;
                this.moveGuide('y',p.diffY);
                newLoc[1]--;
            } else if(input['down']){
                p.diffY = p.stepDistance;
                this.moveGuide('y',p.diffY);
                newLoc[1]++;
            }
            if(input['right']){
                p.diffX = p.stepDistance;
                this.moveGuide('x',p.diffX);
                newLoc[0]++;
            } else if(input['left']){
                p.diffX = -p.stepDistance;
                this.moveGuide('x',p.diffX);
                newLoc[0]--;
            }
            var loc = this.checkValidLoc(newLoc);
            //If there's a loc and the loc was changed
            if(loc&&(newLoc[0]!==p.loc[0]||newLoc[1]!==p.loc[1])){
                p.stepping = true;
                p.origX = p.x;
                p.origY = p.y;
                p.destX = p.x + p.diffX;
                p.destY = p.y + p.diffY;
                p.stepWait = p.stepDelay;
                //Set the loc right away and not when the pointer gets to the location
                p.loc = newLoc;
                p.target=Q.getTargetAt(p.loc[0],p.loc[1]);
                if(p.target){
                    if(Q.state.get("watchingTurn")||p.user.controlled()){
                        p.target.showCard();
                    }
                } else {
                    if(Q.state.get("watchingTurn")||p.user.controlled()){
                        p.user.checkClearStage(3);
                    }
                }
            } else {
                p.diffX = 0;
                p.diffY = 0;
            }
        },
        //Figure out if we're interacting of pressing back before checking the movement
        processInputs:function(input){
            var p = this.p;
            //Don't process the inputs while moving
            if(!p.stepping&&!this.p.noInteract&&!this.p.noBack){
                if(input['interact']){
                    if(p.target){
                        //If we're attacking
                        if(p.attack&&p.user.p.player.checkValidTarget(p.target,p.attack)){
                            //p.user.loadAttackPrediction(p.attack,p.target);
                        } 
                        //If we're not attacking, load the full menu of the target
                        else if(!p.user.p.player.checkValidTarget(p.target,p.user.p.player.attack)){
                            //p.user.loadFullMenu(p.target);
                        }
                        Q.inputs['interact']=false;
                    } else {
                        this.trigger("inputsInteract");
                    }
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{interact:true,time:input.time}});
                    this.p.noInteract = true;
                    setTimeout(function(){
                        p.noInteract=false;
                    },100);
                    Q.inputs['interact']=false;
                    return;
                } else if(input['back']){
                    this.trigger("inputsBack");
                    Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:{back:true,time:input.time}});
                    this.p.noBack = true;
                    setTimeout(function(){
                        p.noBack=false;
                    },100);
                    Q.inputs['back']=false;
                    return;
                }
                this.checkInputs(input);
                Q.state.get("playerConnection").socket.emit("playerInputs",{playerId:this.p.user.p.playerId,inputs:input});
                //console.log(this.p.loc)
            }
        },
        step:function(dt){
            this.p.z=this.p.y+Q.tileH/2;
            var p = this.p,
                moved = false;
            p.stepWait -= dt;
            if(p.stepping) {
                p.x += p.diffX * dt / p.stepDelay;
                p.y += p.diffY * dt / p.stepDelay;
                p.username.p.x = p.x;
                p.username.p.y = p.y-p.h;
            }
            if(p.stepWait > 0) { return;}
            if(p.stepping) {
                p.x = p.destX;
                p.y = p.destY;
                p.username.p.x = p.x;
                p.username.p.y = p.y-p.h;
            }
            p.stepping = false;
            p.diffX = 0;
            p.diffY = 0;
            if(p.locsTo.length){
                this.move(p.locsTo[0]);
                p.locsTo.splice(0,1);
            }
        }
    });
    
     Q.Sprite.extend("PathBox",{
        init: function(p){
            this._super(p,{
                sheet:"objects",
                frame:5,
                w:Q.tileH,h:Q.tileH,
                opacity:0.3,
                radius:0,
                type:Q.SPRITE_INTERACTABLE
            });
            if(!this.p.x||!this.p.y){
                var pos = Q.setXY(this.p.loc[0],this.p.loc[1]);
                this.p.x = pos[0];
                this.p.y = pos[1];
            }
            this.p.z=this.p.y-Q.tileH/2;
            if(!this.p.loc){
                this.p.loc = Q.getLoc(this.p.x,this.p.y);
            }
            this.on("step",this,function(){this.p.z=this.p.y-Q.tileH/2;});
        }
    });
    
    Q.UI.Text.extend("NameText",{
        init: function(p){
            this._super(p,{
                color:"white",
                size:30,
                outlineWidth:3,
                type:Q.SPRITE_NONE,
                label:"Aipom"
            });
            this.p.x-=this.p.w/2;
            this.setLabel();
            Q.state.on("change.currentTilesLeft",this,"setLabel");
        },
        changeCurChar:function(){
            this.p.curChar=Q.state.get("turnOrder")[Q.state.get("currentCharacterTurn")];
            this.setLabel();
        },
        setLabel:function(){
            this.p.label="Moves left: "+this.p.curChar.p.myTurnTiles;
        }
    });
};