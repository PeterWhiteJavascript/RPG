Quintus.HUD=function(Q){
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
        moveStraightTiles:function(dir){
            var tiles = this.aoeTiles;
            var arr = Q.getDirArray(dir);
            //Loop backwards so the closer enemy is targeted
            for(var i=tiles.length-1;i>=0;i--){
                var tile = tiles[i];
                var loc = tile.p.center;
                tile.p.loc = [(i+1)*arr[0]+loc[0],(i+1)*arr[1]+loc[1]];
                Q.BatCon.setXY(tile);
                var objOn = Q.BattleGrid.getObject(tile.p.loc);
                if(objOn){
                    Q.pointer.trigger("onTarget",objOn);
                }
            }
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
                    //Line shape
                case "straight":
                    var dir = this.entity.p.user.p.dir;
                    //Gets the array multiplier for the direction
                    var arr = Q.getDirArray(dir);
                    for(var i=0;i<radius;i++){
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        aoeTiles.push(this.entity.stage.insert(new Q.AOETile({loc:spot,center:loc})));
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
            if(to>this.p.options[this.p.menuNum].length-1){
                to=0;
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
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"walk"}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            Q.pointer.addControls();
            Q.pointer.snapTo(this.p.target);
        },
        //Shows the attack grid
        loadAttack:function(){
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"attack"}));
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
            if(this.p.target.p.sp-skill.cost<0){
                alert("Not Enough SP!");
                return;
            }
            this.p.target.stage.RangeGrid = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"skill",skill:skill}));
            //Hide this options box. Once the user confirms where he wants to go, destroy this. If he presses 'back' the selection num should be the same
            this.off("step",this,"checkInputs");
            this.hide();
            
            if(!skill.aoe){
                skill.aoe = ["normal",0];
            }
            Q.pointer.p.skill = skill;
            Q.pointer.p.user = this.p.target;
            Q.pointer.snapTo(this.p.target);
            Q.pointer.addControls(skill);
            //Create the AOEGuide which shows which squares will be affected by the skill
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
            var user = this.p.user;
            //Insert all of the squares
            switch(this.p.kind){
                case "walk":
                    //Loop through the user's move the get the move range
                    this.getTileRange(user.p.loc,user.p.move,user.p["walkMatrix"]);
                    break;
                case "attack":
                    this.getTileRange(user.p.loc,user.p.range,user.p["attackMatrix"]);
                    break;
                //Used for skills that have a weird range (eg 'T' shape)
                case "skill":
                    var skill = this.p.skill;
                    switch(skill.range[0]){
                        case "self":
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[user.p.loc[0],user.p.loc[1]]})));
                            break;
                        case "normal":
                            this.getTileRange(user.p.loc,skill.range[1],user.p["attackMatrix"]);
                            break;
                        //No diagonal attack
                        case "straight":
                            this.getTileRange(user.p.loc,skill.range[1],user.p["attackMatrix"],skill.range[0]);
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
            //Run this when pressing confirm on a range tile
            if(Q.inputs['confirm']){
                //Make sure the pointer is on a valid tile
                if(this.checkValidPointerLoc()){
                    var user = this.p.user;
                    switch(this.p.kind){
                        case "walk":
                            if(Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                return;                            
                            }
                            //Hide the zoc
                            Q.BattleGrid.hideZOC(user.p.team==="enemy"?"ally":"enemy");
                            //Make the character move to the spot
                            user.moveAlong(this.getPath(user.p.loc,Q.pointer.p.loc,user.p[this.p.kind+"Matrix"]));
                            break;
                        case "attack":
                            //Make sure there's a user there
                            if(Q.BattleGrid.getObject(Q.pointer.p.loc)){
                                Q.BatCon.previewAttackTarget(user,Q.pointer.p.loc);
                                Q.pointer.off("checkInputs");
                                Q.pointer.off("checkConfirm");
                            } else {return;}
                            break;
                        case "skill":
                            //Use the skill's aoe, else it's a normal single user
                            var aoe = this.p.skill.aoe?this.p.skill.aoe:["normal",0];
                            //Make sure there's a user 
                            if(Q.BattleGrid.getObjectsAround(Q.pointer.p.loc,aoe,user).length){
                                Q.BatCon.previewDoSkill(user,Q.pointer.p.loc,this.p.skill);
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
                Q.BattleGrid.hideZOC(this.p.user.p.team==="enemy"?"ally":"enemy");
                Q.stage(2).ActionMenu.show();
                Q.stage(2).ActionMenu.on("step","checkInputs");
                Q.pointer.show();
                Q.pointer.snapTo(this.p.user);
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
            if(this.p.textIndex>=this.p.text.length){
                this.destroy();
                this.p.dialogueArea.destroy();
                this.p.callback();
                return;
            };
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
                status:[],
                statusNum:0,
                time:0,
                timeCycle:60,
                sheet:"ui_blind",
                frame:0
            });
            this.setPos();
            this.p.z = this.p.char.p.z+Q.tileH;
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
                fill:"white"
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
    Q.Sprite.extend("DynamicAnim", {
        init:function(p){
            this._super(p, {
                type:Q.SPRITE_NONE,
                collisionMask:Q.SPRITE_NONE
            });
            Q.BatCon.setXY(this);
            this.add("animation");
        }
    });
};