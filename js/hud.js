Quintus.HUD=function(Q){
    Q.UI.Container.extend("TerrainHUD",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:250,h:95,
                type:Q.SPRITE_NONE,
                fill:"#DDD",
                opacity:0.5,
                radius:0
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
                w:300,h:0,
                type:Q.SPRITE_NONE,
                fill:"#DDD",
                opacity:0.5
            });
            this.p.x=Q.width-this.p.w;
            this.on("inserted");
        },
        inserted:function(){
            var info = ["Class","Name","Level","HP","TP","Move"];
            this.p.stats = [];
            for(var i=0;i<info.length;i++){
                this.insert(new Q.HUDText({label:info[i],x:10,y:10+i*25}));
                this.p.stats.push(this.insert(new Q.HUDText({x:this.p.w-10,y:10+i*25,align:"right"})));
            }
            this.p.h = info.length*25+20;
            Q.pointer.on("onTarget",this,"displayTarget");
            Q.pointer.on("offTarget",this,"hideHUD");
            this.hide();
        },
        displayTarget:function(obj){
            if(obj.isA("Mirage")) return;
            this.show();
            if(obj.p.team==="Ally") this.p.fill = "blue";
            if(obj.p.team==="Enemy") this.p.fill = "crimson";
            var objStats = obj.p.combatStats;
            var stats = this.p.stats;
            var labels = [
                ""+obj.p.charClass,
                ""+obj.p.name,
                ""+obj.p.level,
                ""+objStats.hp+"/"+objStats.maxHp,
                ""+objStats.tp+"/"+objStats.maxTp,
                ""+objStats.moveSpeed
            ];
            for(var i=0;i<stats.length;i++){
                stats[i].p.label = labels[i];
            }
        },
        hideHUD:function(){
            this.hide();
        }
    });
    
    Q.GameObject.extend("Menus",{
        init:function(type){
            switch(type){
                case "battle":
                    this.actionsMenu = this.staticMenu("actions-menu");
                    this.actionsMenu.disable();
                    this.terrainMenu = this.staticMenu("terrain-menu");
                    this.charSummaryMenu = this.staticMenu("char-summary-menu");
                    $("#main-container").append(this.actionsMenu.menu,this.terrainMenu.menu,this.charSummaryMenu.menu);
                    break;
            }
        },
        staticMenu:function(name){
            var menu = $("<div id='"+name+"' class='menu menu-style5'></div>");
            var obj = {
                menu:menu,
                disable:function(){
                    this.disabled = true;
                    this.menu.hide();
                },
                enable:function(){
                    this.disabled = false;
                    this.menu.show();
                    this.onOption();
                },
                empty:function(){
                    this.menu.empty();
                },
                remove:function(){
                    this.menu.remove();
                },
                confirm:function(){},
                back:function(){},
                onOption:function(){}
                
            };
            switch(name){
                case "actions-menu":
                    obj.selected = -1;
                    obj.disabled = false;
                    obj.selectedClass = "menu-option-cont-selected";
                    break;
                case "terrain-menu":
                    var name = $("<div class='terrain-name'><span></span></div>");
                    var move = $("<div class='terrain-move'><span></span></div>");
                    var buff = $("<div class='terrain-buff'><span></span></div>");
                    menu.append(name, move, buff);
                    Q.pointer.on("onTerrain",function(terrain){
                        var data = Q.state.get("tileTypes")[terrain];
                        if(!data) return;
                        name.children("span").text(data.name);
                        move.children("span").text(data.move);
                        buff.children("span").text(data.buff);
                    });
                    break;
                case "char-summary-menu":
                    var name = $("<div class='char-name'><span></span></div>");
                    var chcl = $("<div class='char-class'><span></span></div>");
                    var levl = $("<div class='char-level'><span></span></div>");
                    menu.append(name, chcl, levl);
                    Q.pointer.on("onTarget",function(target){
                        name.children("span").text(target.p.name);
                        chcl.children("span").text(target.p.charClass);
                        levl.children("span").text(target.p.level);
                    });
                    Q.pointer.on("offTarget",function(){
                        name.children("span").text("");
                        chcl.children("span").text("");
                        levl.children("span").text("");
                    });
                    break;
            }
            return obj;
        },
        checkOptSelected:function(){
            var menu = this.actionsMenu;
            var selected = menu.selected;
            var max = menu.options.length - 1;
            //The last option is always back
            if(selected === max){
                this.goBack();
            } else {
                switch(menu.name){
                    case "characterSelection":
                        this.trigger("removeControls");
                        menu.placingCharacter.add("directionControls");
                        function done(){
                            menu.placingCharacter.directionControls.removeControls();
                            Q.stage().off("pressedConfirm");
                            Q.stage().off("pressedBack");
                            Q.stage().off("pressedOffMenu");
                            Q.stage().off("clickedStage", Q.stage().viewSprite, "placement");
                        }
                        function goBack(){
                            done();
                            Q.BattleMenusController.displayActions("characterSelection");
                        }
                        function pressedConfirm(){
                            done();
                            Q.BatCon.battlePlacement.confirmPlacement(menu.placingCharacter);
                            menu.placingCharacter = false;
                        }
                        Q.stage().on("pressedConfirm", pressedConfirm);
                        Q.stage().on("pressedBack", goBack);
                        Q.stage().on("pressedOffMenu", goBack);
                        //Figure out if we've clicked a direction to set a character's direction when placing
                        Q.stage().on("clickedStage", Q.stage().viewSprite, "placement");
                        
                        break;
                    case "turnActions":
                        var option = menu.options[selected];
                        var currentCharacter = Q.BatCon.turnOrder[0];
                        switch(option){
                            case "Move":
                                Q.rangeController.setTiles(1, currentCharacter.p.loc, currentCharacter.p.combatStats.moveSpeed, [], currentCharacter.p.walkMatrix);
                                this.trigger("removeControls");
                                currentCharacter.p.canSetDir = currentCharacter.canSetDir();
                                Q.pointer.add("pointerControls, pointerMovementControls");
                                break;
                            case "Attack":
                                Q.rangeController.setTiles(2,currentCharacter.p.loc,currentCharacter.p.combatStats.atkRange,[],currentCharacter.p.attackMatrix);
                                this.trigger("removeControls");
                                Q.pointer.add("pointerControls, pointerAttackControls");
                                break;
                            case "Technique":
                                this.trigger("removeControls");
                                this.displayActions("techniques");
                                break;
                            case "Item":
                                this.trigger("removeControls");
                                this.displayActions("items");
                                break;
                            case "Carry":
                                
                                break;
                            case "Status":
                                
                                break;
                            case "End Turn":
                                this.trigger("removeControls");
                                currentCharacter.p.canSetDir = currentCharacter.canSetDir();
                                Q.BatCon.showEndTurnDirection(currentCharacter);
                                break;
                        }
                        break;
                    case "characterStatus":

                        break;
                    case "techniques":
                        var option = menu.options[selected];
                        var currentCharacter = Q.BatCon.turnOrder[0];
                        var technique = currentCharacter.p.techniques.active.find(function(tech){return option === tech.name;});
                        console.log(technique);
                        //TODO: load technique range and aoe
                        break;
                    case "items":
                        var option = menu.options[selected];
                        var item = Q.partyManager.bag.items.Consumables.find(function(itm){return option === itm.namel});
                        console.log(item)
                        //TODO: load item range
                        break;
                }
            }
        },
        goBack:function(){
            var menu = this.actionsMenu;
            switch(menu.name){
                case "characterSelection":
                    this.removePlacingCharacter();
                    this.trigger("removeControls");
                    Q.pointer.trigger("offTarget");
                    Q.pointer.add("pointerControls, pointerPlacementRoaming");
                    break;
                case "turnActions":
                    this.trigger("removeControls");
                    Q.pointer.add("pointerControls, pointerRoamingControls");
                    break;
                case "characterStatus":
                    this.trigger("removeControls");
                    Q.pointer.add("pointerControls, pointerRoamingControls");
                    break;
                case "techniques":
                    this.trigger("removeControls");
                    this.displayActions("turnActions");
                    break;
                case "items":
                    this.trigger("removeControls");
                    this.displayActions("turnActions");
                    break;
            }
        },
        overOption:function(){
            var menu = this.actionsMenu;
            switch(menu.name){
                case "characterSelection":
                    this.removePlacingCharacter();
                    var idx = Math.max(0, menu.selected);
                    if(idx !== menu.options.length - 1){
                        var char = Q.BatCon.battlePlacement.placeableAllies[idx];
                        char.loc = Q.pointer.p.loc;
                        menu.placingCharacter = Q.stage(0).insert(new Q.Character(char));
                        Q.pointer.trigger("onTarget", menu.placingCharacter);
                    } else {
                        this.placingCharacter = false;
                    }
                    break;
                case "turnActions":
                    
                    break;
                case "characterStatus":
                    
                    break;
                case "techniques":
                    
                    break;
                case "items":
                    
                    break;
            }
        },
        removePlacingCharacter:function(){
            var menu = this.actionsMenu;
            if(menu.placingCharacter){
                if(menu.placingCharacter.has("directionControls")) menu.placingCharacter.directionControls.removeControls();
                Q.BattleGrid.removeObjectFromBattle(menu.placingCharacter);
                menu.placingCharacter.destroy();
            }
        },
        displayActions:function(name){
            //Adds a list of the options
            function addOptions(options, menu){
                for(var i=0;i<options.length;i++){
                    menu.append("<div class='menu-option-cont'><div class='menu-text'>"+options[i]+"</div></div>");
                }
            };
            var start = 0;
            var menu = this.actionsMenu;
            menu.name = name;
            menu.selected = -1;
            menu.empty();
            switch(name){
                case "characterSelection":
                    Q.stage().viewSprite.centerOn(Q.pointer.p.loc);
                    function getPlaceableAlliesOpts(chars){
                        var opts = [];
                        for(var i=0;i<chars.length;i++){
                            opts.push(chars[i].name);
                        }
                        return opts;
                    }
                    function addPlaceableAlliesOptions(actionsMenu){
                        var opts = getPlaceableAlliesOpts(Q.BatCon.battlePlacement.placeableAllies);
                        opts.push("Back");
                        addOptions(opts, actionsMenu.menu);
                        actionsMenu.options = opts;
                    }
                    addPlaceableAlliesOptions(menu);
                    break;
                case "turnActions":
                    menu.options = ["Move", "Attack", "Technique", "Item", "Carry", "Status", "End Turn", "Exit"];
                    addOptions(menu.options, menu.menu);
                    var char = Q.BatCon.turnOrder[0];
                    if(char.p.didMove){
                        menu.menu.children(".menu-option-cont:eq(0)").addClass("menu-option-disabled");
                        start = 1;
                    } else if(char.p.didAction){
                        menu.menu.children(".menu-option-cont:eq(1)").addClass("menu-option-disabled");
                        menu.menu.children(".menu-option-cont:eq(2)").addClass("menu-option-disabled");
                        menu.menu.children(".menu-option-cont:eq(3)").addClass("menu-option-disabled");
                    }
                    //console.log("Turn code", menu.options, menu)
                    break;
                //For the non-active character
                case "characterStatus":
                    var menu = this.actionsMenu;
                    menu.options = ["Status","Exit"];
                    addOptions(menu.options, menu.menu);
                    break;
                    
                case "techniques":
                    var character = Q.BatCon.turnOrder[0];
                    var techniques = character.p.techniques.active;
                    menu.options = techniques.map(function(tech){return tech.name;});
                    menu.options.push("Back");
                    addOptions(menu.options, menu.menu);
                    break;
                case "items":
                    var items = Q.partyManager.bag.items.Consumables;
                    menu.options = items.map(function(item){return item.name;});
                    menu.options.push("Back");
                    addOptions(menu.options, menu.menu);
                    break;
            } 
            this.controls(start);
        },
        checkBounds:function(obj, dir){
            var bound = this.getBound(obj, dir);
            if(dir === "up"){
                return obj.selected <= bound ? obj.options.length - 1 : obj.selected - 1;
            } else {
                return obj.selected >= bound ? 0 : obj.selected + 1;
            }
        },
        getBound:function(obj, dir){
            if(dir === "up") return 0;
            if(dir === "down") return obj.options.length-1;
        },
        cycle:function(dir){
            var obj = this.actionsMenu;
            var to;
            if(typeof dir === "string"){
                obj.menu.children(".menu-option-cont:eq("+obj.selected+")").removeClass(obj.selectedClass);
                var to = dir === "up" ? obj.selected - 1 : obj.selected + 1;
                if(to === obj.selected) return; //Don't allow selecting same option (hover same option multiple times)
                if(dir){
                    //Skip disabled options
                    do {
                        to = this.checkBounds(obj,dir);
                        obj.selected = to;
                    } while(obj.menu.children(".menu-option-cont:eq("+to+")").hasClass("menu-option-disabled"));
                }
                if(obj.options.length === 1) return; //Don't run the function since there's only one option
                Q.inputs[dir] = false;
            } else {
                if(obj.menu.children(".menu-option-cont:eq("+dir+")").hasClass("menu-option-disabled")) return;
                obj.menu.children(".menu-option-cont:eq("+obj.selected+")").removeClass(obj.selectedClass);
                to = dir;
            }
            //Don't allow hovering disabled options
            obj.selected = to;
            obj.menu.children(".menu-option-cont:eq("+to+")").addClass(obj.selectedClass);
            this.trigger("overOption");
        },
        removeControls:function(){
            Q.stage().off("pressedUp", this, "cycle");
            Q.stage().off("pressedDown", this, "cycle");
            Q.stage().off("pressedConfirm", this, "checkOptSelected");
            Q.stage().off("pressedBack", this, "goBack");
            Q.stage().off("pressedOffMenu", this, "goBack");
            Q.stage().off("clickedStage", Q.stage().viewSprite, "placement");
            this.off("removeControls", this,"removeControls");
            this.off("overOption", this, "overOption");
            this.actionsMenu.disable();
        },
        controls:function(start){
            Q.stage().on("pressedUp", this, "cycle");
            Q.stage().on("pressedDown", this, "cycle");
            Q.stage().on("pressedConfirm", this, "checkOptSelected");
            Q.stage().on("pressedBack", this, "goBack");
            Q.stage().on("pressedOffMenu", this, "goBack");
            //Delay setting this up otherwise it is instantly triggered when setting this up from clicking a placement square
            setTimeout(function(){
                Q.stage().on("clickedStage", Q.stage().viewSprite, "placement");
            });
            
            
            this.on("removeControls", this, "removeControls");
            this.on("overOption", this, "overOption");
            this.actionsMenu.enable();
            
            var controller = this;
            var menuObj = this.actionsMenu;
            //Touch controls
            menuObj.menu.children(".menu-option-cont").each(function(){
                $(this).on("mouseenter",function(e){
                    controller.cycle($(this).index());
                });
                $(this).on("click",function(e){
                    controller.checkOptSelected();
                });
            });
            this.cycle(start);
        }
    });
    
    //The menu that loads in battle that allows the user to do things with a character
    //TODO: Make the visuals for the menu in Jquery and make it better.
    Q.UI.Container.extend("ActionMenu",{
        init: function(p) {
            this._super(p, {
                w:200,h:350,
                cx:0,cy:0,
                fill:"#DDD",
                opacity:0.5,
                titles:["ACTIONS","ACTIONS","TECHNIQUES","ITEMS"],
                options:[["Move","Attack","Technique","Carry","Item","Status","Wait"],["Status","Exit Menu"],[]],
                funcs:[["loadMove","loadAttack","loadTechniquesMenu","loadLift","loadItemsMenu","loadStatus","loadEndTurn"],["loadStatus","loadExitMenu"],[]],
                conts:[],
                radius:0,
                menuNum
            });
            this.p.x = Q.width-this.p.w;
            this.p.y = Q.height-this.p.h;
            //Display the initial menu on inserted to the stage
            this.on("inserted");
            
            //TODO: use jquery menu controls (ui-objects.js line 1624)
            //Add the inputs for the menu
            //this.add("menuControls");
            //If this is the active character, set up the skills options and check for lifted
            if(this.p.active){
                this.menuNum = 0;
                this.setActionOptions();
                this.checkLifting();
            } else this.menuNum = 1;
        },
        inserted:function(){
            //Check if the target has done move or action and gray out the proper container
            this.on("checkGray");
            //When the user presses back
            this.on("pressBack");
            //When the user presses confirm
            this.on("pressConfirm");
            //Turn on the inputs
            this.menuControls.turnOnInputs();
            //Display the menu options
            this.displayMenu(this.menuNum,0);
        },
        pressConfirm:function(selected){
            this[this.p.conts[selected].p.func]();
        },
        pressBack:function(menuNum){
            //If we're in the skills menu or items menu
            if(menuNum===2||menuNum===3){
                //Send us back to the main menu
                this.displayMenu(0,0);
            } 
            //We're in the main menu
            else {
                //Reset the move
                if(this.p.target.p.didMove&&!this.p.target.p.cannotRecallMove){
                    this.p.target.resetMove();
                    Q.pointer.snapTo(this.p.target);
                    this.displayMenu(0,0);
                } else {
                    Q.pointer.del("pointerMoveControls");
                    Q.pointer.add("pointerRoamingControls");
                    //Make sure the characterMenu is gone
                    this.hide();
                    this.menuControls.turnOffInputs();
                }
            }
        },
        setActionOptions:function(){
            var target = this.p.target;
            var opts = [];
            var funcs = [];
            var techniques = [];
            //Set possible techniques
            for(var i=0;i<target.p.techniques.active.length;i++){
                opts.push(target.p.techniques.active[i].name);
                funcs.push("loadTechnique");
                techniques.push(target.p.techniques.active[i]);
            }
            this.p.options[2]=opts;
            this.p.funcs[2]=funcs;
            this.p.techniques=techniques;
            //Set items
            var opts = [];
            var funcs = [];
            var itms = [];
            var items = Q.partyManager.bag.items.Consumables;
            //If there are items in the bag
            if(items.length){
                items.forEach(function(item){
                    opts.push(item.name);
                    funcs.push("loadItem");
                    itms.push(item);
                });
            } else {
                opts.push("No Items");
                funcs.push("noItems");
            }
            this.p.options[3]=opts;
            this.p.funcs[3]=funcs;
            this.p.items=itms;
        },
        checkLifting:function(){
            var lifting = this.p.target.p.lifting;
            if(lifting){
                this.p.options[0][3] = "Drop";
                this.p.funcs[0][3] = "loadDrop";
            }
        },
        //Checks if some containers should be gray
        checkGray:function(menuNum){
            if(menuNum===0){
                if(this.p.target.p.didMove){this.p.conts[0].p.fill="gray";};
                if(this.p.target.p.didAction){
                    this.p.conts[1].p.fill="gray";
                    this.p.conts[2].p.fill="gray";
                    this.p.conts[3].p.fill="gray";
                    this.p.conts[4].p.fill="gray";
                };
            }
        },
        //Displays new menu items within this menu
        displayMenu:function(menuNum,selected){
            this.menuNum = menuNum;
            if(this.p.title) this.p.title.destroy();
            if(this.p.conts.length) this.menuControls.destroyConts();
            this.p.title = this.insert(new Q.UI.Text({x:this.p.w/2,y:15,label:this.p.titles[menuNum],size:20}));
            var options = this.p.options[menuNum];
            var funcs = this.p.funcs[menuNum];
            if(this.p.target.p.didMove&&menuNum===0) selected++;
            this.p.conts = [];
            for(var i=0;i<options.length;i++){
                var cont = this.insert(new Q.UI.Container({x:10,y:50+i*40,w:this.p.w-20,h:40,cx:0,cy:0,fill:"#BBB",radius:0,func:funcs[i]}));
                var name = cont.insert(new Q.UI.Text({x:cont.p.w/2,y:12,label:options[i],cx:0,size:16}));
                //Skills menu
                if(menuNum===2){
                    name.p.x = 4;
                    name.p.align="left";
                    cont.insert(new Q.UI.Text({x:cont.p.w-4,y:12,label:""+this.p.techniques[i].tpCost,cx:0,align:"right",size:16}));
                }
                this.p.conts.push(cont);
            }
            this.menuControls.selected = 0;
            this.menuControls.cycle(selected);
            Q.pointer.checkTarget();
            this.trigger("checkGray",menuNum);
        },
        changeToPointer:function(controls){
            Q.rangeController.target = this.p.target;
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.p.user = this.p.target;
            Q.pointer.add(controls);
        },
        //Shows the move grid and zoc
        loadMove:function(){
            Q.rangeController.setTiles(1,this.p.target.p.loc,this.p.target.p.combatStats.moveSpeed,[],this.p.target.p.walkMatrix);
            this.changeToPointer("pointerMoveControls");
        },
        //Shows the attack grid
        loadAttack:function(){
            //For spears, maybe make the range type straight?? TODO add to array
            Q.rangeController.setTiles(2,this.p.target.p.loc,this.p.target.p.combatStats.atkRange,[],this.p.target.p.attackMatrix);
            this.changeToPointer("pointerAttackControls");
        },
        //Show the range for lifting (4 squares around the user)
        loadLift:function(){
            Q.rangeController.setTiles(2,this.p.target.p.loc,1,[],this.p.target.p.attackMatrix);
            this.changeToPointer("pointerLiftControls");
        },
        //Shows the range for dropping
        loadDrop:function(){
            Q.rangeController.setTiles(2,this.p.target.p.loc,1,[],this.p.target.p.attackMatrix);
            this.changeToPointer("pointerDropControls");
        },
        //Loads the special skills menu
        loadTechniquesMenu:function(){
            this.displayMenu(2,0);
        },
        //Show the attack grid for the skill
        loadTechnique:function(){
            var technique = this.p.techniques[this.menuControls.selected];
            if(!technique) return this.loadItem();
            var cost = Q.BatCon.attackFuncs.getTechniqueCost(technique.tpCost,this.p.target.p.combatStats.efficiency);
            if(this.p.target.p.combatStats.tp - cost < 0){
                alert("Not Enough TP!");
                return;
            }
            Q.pointer.p.technique = technique;
            Q.pointer.snapTo(this.p.target);
            this.changeToPointer("pointerAttackControls");
            
            var center = [this.p.target.p.loc[0],this.p.target.p.loc[1]];
            //TODO: if range is weapon range/custom
            var range = technique.range;
            if(!technique.rangeProps.includes("MaxRangeFixed")){
                Q.rangeController.setTiles(2,this.p.target.p.loc,range,technique.rangeProps,this.p.target.p.attackMatrix);
                if(technique.rangeProps.includes("TargetSelf")){
                    Q.rangeController.setSpecificTile(2,this.p.target.p.loc);
                }
            }
            Q.aoeController.setTiles(3,center,this.p.target.p.dir,technique.aoe,technique.aoeType,technique.aoeProps,technique.rangeProps,range);
        },
        noItems:function(){
            Q.audioController.playSound("cannot_do.mp3");
        },
        //When the user selects an item, ask to use it and show what it does
        loadItem:function(){
            alert("TODO");
            /*
            var item = this.p.items[this.menuControls.selected];
            //Load the range grid
            Q.RangeGridObj = this.p.target.stage.insert(new Q.RangeGrid({user:this.p.target,kind:"skill",item:item}));
            //Hide this options box. Once the user confirms if the item should be used, destroy this. If he presses 'back' the selection num should be the same
            this.menuControls.turnOffInputs();
            this.hide();
            //Must set it as a skill so it works for the aoe guide aoe
            Q.pointer.p.skill = item;
            Q.pointer.p.user = this.p.target;
            Q.pointer.snapTo(this.p.target);
            //Create the AOEGuide which shows which squares will be affected by the skill
            Q.pointer.add("AOEGuide");
            Q.pointer.add("pointerAttackControls");*/
        },
        //Loads the items menu
        loadItemsMenu:function(){
            this.displayMenu(3,0);
        },
        //Loads the large menu that displays all stats for this character
        loadStatus:function(){
            //Hide this menu as it will be needed when the user exits the status menu.
            //this.hide();
            //Turn off inputs for this menu as the new menu will take inputs
            this.menuControls.turnOffInputs();
            //Insert the status menu
            this.p.bigStatusBox = this.stage.insert(new Q.BigStatusBox({target:this.p.target}));
            this.p.bigStatusBox.on("pressedBack",function(){
                Q.stage(2).ActionMenu.menuControls.turnOnInputs();
            });
                
        },
        //Loads the directional arrows so the user can decide which direction to face
        loadEndTurn:function(){
            Q.clearStage(2);
            Q.BatCon.showEndTurnDirection(Q.BatCon.turnOrder[0]);
            this.menuControls.turnOffInputs();
            this.hide();
            Q.pointer.hide();
        },
        loadExitMenu:function(){
            Q.pointer.addControls();
            Q.pointer.on("checkConfirm");
            //Make sure the characterMenu is gone
            Q.clearStage(2);
        }
    });
    
    
    Q.UI.Container.extend("BigStatusBox",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                w:Q.width/1.5,
                h:Q.height/2,
                fill:"blue",
                opacity:0.5,
                border:2
            });
            this.p.x = Q.width/1.5-this.p.w/2-100;
            this.p.y = Q.height/2-this.p.h/2;
            this.on("inserted");
        },
        step:function(){
            if(Q.inputs['back']||Q.inputs['esc']){
                this.destroyInfo();
                this.destroy();
                this.trigger("pressedBack");
                Q.inputs['back'] = false;
                Q.inputs['esc'] = false;
            }
        },
        //Insert all of the parts of this menu
        inserted:function(){
            //Holds the information that is show to the user depending on which option is hovered.
            this.p.infoCont = this.insert(new Q.BigInfoCont({h:this.p.h,w:this.p.w}));
            this.showOverview();
        },
        destroyInfo:function(){
            for(var i=0;i<this.p.infoCont.children.length;i++){
                this.p.infoCont.children[i].destroy();
            }
        },
        showOverview:function(){
            var cont = this.p.infoCont;
            var width = cont.p.w;
            var spacing = 10;
            //Create the leftmost box that contains the name, lv, charClass, nationality, portrait, and equipment names.
            cont.insert(new Q.BigOverviewBox1({target:this.p.target,x:spacing,w:width/5-spacing,h:this.p.h-spacing*2,y:spacing}));
            //Create the top middle box which contains the base stats
            cont.insert(new Q.BigOverviewBox2({target:this.p.target,x:width/5+spacing/2,w:width/5-spacing,h:this.p.h/5-spacing,y:spacing}));
            //Create the middle middle box which contains skills
            cont.insert(new Q.BigOverviewBox3({target:this.p.target,x:width/5+spacing/2,w:width/5-spacing,h:this.p.h/5*2-spacing/2,y:this.p.h/5+spacing/2}));
            //Create the bottom middle bow which contains status effects
            cont.insert(new Q.BigOverviewBox6({target:this.p.target,x:width/5+spacing/2,w:width/5-spacing,h:this.p.h/5*2-spacing*1.5,y:this.p.h/5*3+spacing/2}));
            //Create the right top box that contains derived stats
            cont.insert(new Q.BigOverviewBox4({target:this.p.target,x:width/5*2,w:width/5*3-spacing,h:this.p.h/5*4-spacing/2,y:spacing}));
            //Create the right bottom box that contains talents
            cont.insert(new Q.BigOverviewBox5({target:this.p.target,x:width/5*2,w:width/5*3-spacing,h:this.p.h/5-spacing*2,y:this.p.h/5*4+spacing}));
        }
    });
    Q.UI.Container.extend("BigOverviewBox1",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target.p;
            var top = [target.name,"Lv. "+target.level, target.nationality+" "+target.charClass];
            for(var i=0;i<top.length;i++){
                this.insert(new Q.UI.Text({label:""+top[i],align:"center",x:this.p.w/2,y:20+35*i,size:16}));
            }
            var portraitCont = this.insert(new Q.UI.Container({cx:0,cy:0,x:this.p.w/6,y:this.p.h/3,w:this.p.w/1.5,h:this.p.h/4,fill:"red",radius:45}));
            var portrait = portraitCont.insert(new Q.Sprite({sheet:target.charClass.toLowerCase(),sprite:"Character",x:portraitCont.p.w/2,y:portraitCont.p.h/2+10,scale:2}));
            portrait.add("animation");
            portrait.play("standingdown");
            var eq = target.equipment;
            var keys = Object.keys(eq);
            var eqTextSize = 12;
            for(var i=0;i<keys.length;i++){
                //If the target has equipment here
                if(eq[keys[i]]&&eq[keys[i]].name){
                    var label = eq[keys[i]].quality ? eq[keys[i]].quality+" "+eq[keys[i]].material+" "+eq[keys[i]].name : eq[keys[i]].name;
                    var text = this.insert(new Q.UI.Text({label:label,cx:0,cy:0,x:this.p.w/2,y:this.p.h/3+this.p.h/4+i*(eqTextSize*2),size:eqTextSize,family:"Consolas"}));
                } else {
                    this.insert(new Q.UI.Text({label:"-",cx:0,cy:0,x:this.p.w/2,y:this.p.h/3+this.p.h/4+i*(eqTextSize*2),size:eqTextSize,family:"Consolas"}));
                }
            }
            
        }
    });
    Q.UI.Container.extend("BigOverviewBox2",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target.p;
            var labels = ["STR","END","DEX","WSK","RFL","INI","ENR","SKL","EFF"];
            var stats = [target.baseStats.str,target.baseStats.end,target.baseStats.dex,target.baseStats.wsk,target.baseStats.rfl,target.baseStats.ini,target.baseStats.enr,target.baseStats.skl,target.baseStats.eff];
            var cols = 3;
            var rows = 3;
            var num = 0;
            for(var i=0;i<rows;i++){
                for(var j=0;j<cols;j++){
                    this.insert(new Q.UI.Text({label:labels[num]+":"+stats[num],x:5+(j*45),y:16+i*16,size:10,cx:0,cy:0,align:"left",family:"Consolas"}));
                    num++;
                }
            }
            
        }
    });
    Q.UI.Container.extend("BigOverviewBox3",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var skills = target.p.techniques;
            for(var i=0;i<skills.length;i++){
                this.insert(new Q.UI.Text({label:skills[i].name,x:5,y:5+i*28,size:16,cx:0,cy:0,align:"left",family:"Consolas"}));
                var color = skills[i].cost-target.p.combatStats.efficiency<=target.p.combatStats.tp?"green":"red";
                this.insert(new Q.UI.Text({label:""+Math.max(1,skills[i].cost-target.p.combatStats.efficiency),x:5,y:17.5+i*28,align:"left",size:16,cx:0,cy:0,family:"Consolas",color:color}));
            }
        }
    });
    Q.UI.Container.extend("BigOverviewBox6",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var status = target.p.status || {};
            var keys = Object.keys(status);
            for(var i=0;i<keys.length;i++){
                this.insert(new Q.UI.Text({label:status[keys[i]].name,x:5,y:5+i*28,size:16,cx:0,cy:0,align:"left",family:"Consolas"}));
                this.insert(new Q.UI.Text({label:""+status[keys[i]].turns,x:this.p.w-5,y:5+i*28,align:"right",size:16,cx:0,cy:0,family:"Consolas"}));
            }
        }
    });
    Q.UI.Container.extend("BigOverviewBox4",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var target = this.p.target;
            var stats = target.p.combatStats;
            var hpText = "HP: "+stats.hp+"/"+stats.maxHp;
            if(stats.hp === 0) hpText = "HP: "+stats.hp+"/"+stats.maxHp+ "(wounded for "+target.p.wounded+" turn/s)";
            this.insert(new Q.UI.Text({label:hpText,x:5+this.p.w/4,y:5,size:20,cx:0,cy:0,family:"Consolas"}));
            this.insert(new Q.UI.Text({label:"TP: "+stats.tp+"/"+stats.maxTp,x:5+this.p.w/4+this.p.w/2,y:5,size:20,cx:0,cy:0,family:"Consolas"}));
            var leftCont = this.insert(new Q.UI.Container({h:this.p.h-50,w:this.p.w/2-7.5,x:5,y:45,fill:"green",cx:0,cy:0}));
            var leftStats = [stats.maxAtkDmg,stats.minAtkDmg,stats.maxSecondaryDmg,stats.minSecondaryDmg,stats.critChance,stats.atkSpeed,stats.atkRange,stats.atkAccuracy,stats.moveSpeed];
            var leftLabels = ["Maximum Attack Damage","Minimum Attack Damage","Maximum Secondary Damage","Minimum Secondary Damage","Critical Chance","Attack Speed","Attack Range","Attack Accuracy","Move Speed"];
            for(var i=0;i<leftStats.length;i++){
                leftCont.insert(new Q.UI.Text({label:leftLabels[i],x:5,y:5+i*26,size:16,cx:0,cy:0,align:"left",family:"Consolas"}));
                leftCont.insert(new Q.UI.Text({label:""+leftStats[i],x:leftCont.p.w-5,y:5+i*26,align:"right",size:16,cx:0,cy:0,family:"Consolas"}));
            }
            var rightCont = this.insert(new Q.UI.Container({h:this.p.h-50,w:this.p.w/2-7.5,x:2.5+this.p.w/2,y:45,fill:"green",cx:0,cy:0}));
            var rightStats = [stats.damageReduction,stats.defensiveAbility,stats.counterChance,stats.totalWeight,stats.encumbranceThreshold,stats.encumbrancePenalty,stats.painTolerance,stats.physicalResistance,stats.magicalResistance,stats.mentalResistance];
            var rightLabels = ["Damage Reduction","Defensive Ability","Counter Chance","Total Weight","Encumbrance Threshold","Encumbrance Penalty","Pain Tolerance","Physical Resistance","Magical Resistance","Mental Resistance"];
            for(var i=0;i<rightStats.length;i++){
                rightCont.insert(new Q.UI.Text({label:rightLabels[i],x:5,y:5+i*26,size:16,cx:0,cy:0,align:"left",family:"Consolas"}));
                rightCont.insert(new Q.UI.Text({label:""+rightStats[i],x:rightCont.p.w-5,y:5+i*26,align:"right",size:16,cx:0,cy:0,family:"Consolas"}));
            }
        }
    });
    Q.UI.Container.extend("BigOverviewBox5",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0,
                fill:"cyan",
                border:2,
                stroke:"yellow"
            });
            this.on("inserted");
        },
        inserted:function(){
            var talents = this.p.target.p.talents;
            var prevHeight = 0;
            for(var i=0;i<talents.length;i++){
                var text = this.insert(new Q.UI.Text({label:talents[i],x:5,y:5+i*prevHeight,size:12,cx:0,cy:0,align:"left",family:"Consolas"}));
                text.calcSize();
                prevHeight = text.p.h;
            }
        }
    });
    
    Q.UI.Container.extend("BigInfoCont",{
        init:function(p){
            this._super(p,{
                cx:0,cy:0
            });
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
    /*
    "Icy":{frame:5,invalid:["impassable"]},
    "Burning":{frame:4,invalid:["impassable"]},
    "Stable":{frame:6,invalid:["impassable"]},
    "Caltrops":{frame:7,invalid:["impassable"]},
    "Mirage":{frame:8,invalid:["impassable"]}
     */
    Q.GameObject.extend("ModifiedTilesController",{
        tiles:[],
        //TODO: make sure mirage does not get removed
        setTiles:function(tiles,callback){
            for(var i=0;i<tiles.length;i++){
                Q.ModifiedGroundTileLayer.setTile(tiles[i].x,tiles[i].y,tiles[i].frame);
                this.tiles.push(tiles[i]);
            }
            if(callback) callback();
        },
        getTile:function(x,y){
            return Q.ModifiedGroundTileLayer.getTile(x,y);
        },
        reduceTurn:function(){
            for(var j=this.tiles.length-1;j>=0;j--){
                this.tiles[j].turns --;
                if(this.tiles[j].turns <= 0){
                    this.revertTile(this.tiles[j].x,this.tiles[j].y);
                    this.tiles.splice(j,1);
                }
            }
        },
        revertTile:function(x,y){
            Q.ModifiedGroundTileLayer.setTile(x,y,0);
        },
        revertAllTiles:function(){
            for(var i=0;i<this.tiles.length;i++){
                this.revertTile(this.tiles[i].x,this.tiles[i].y);
            };
        }
    });
    Q.GameObject.extend("AOEController",{
        pulse:function(){
            Q.AOETileLayer.animate({opacity:0.7} ,1.2, Q.Easing.Linear).chain({opacity:0.3} , 1, Q.Easing.Linear, {callback:function(){Q.aoeController.pulse();}});
        },
        getTiles:function(loc,dir,aoe,type,aoeProps,rangeProps,range){
            var radius = aoe;//Actually not always the radius. For VLine, it is the length of the line
            var area = type;
            aoeProps = aoeProps || [];
            rangeProps = rangeProps || [];
            var tiles = [];
            var bounds = Q.BattleGrid.getBounds(loc,radius);
            var arr = Q.getDirArray(dir);
            var rot = Q.getDirArray(Q.getRotatedDir(dir));
            var excludeCenter = aoeProps.includes("ExcludeCenter");
            //If we're doing max range, move technique forward (max range fixed is mainly used for techs like fire breath, which would come out of the user)
            if(rangeProps.includes("MaxRangeFixed")){
                //'T' shape is always at range 1. The range property is used for how long the parallel line is (aoe is used for the perpendicular)
                if(type === "T" || type === "Cone"){
                    loc[0] += arr[0];
                    loc[1] += arr[1];
                } else {
                    loc[0] += arr[0]*range;
                    loc[1] += arr[1]*range;
                }
            }
            
            switch(area){
                //Diamond shape
                case "Normal":
                    for(var i=-radius;i<radius+1;i++){
                        for(var j=0;j<((radius*2+1)-Math.abs(i*2));j++){
                            var spot = [loc[0]+i,loc[1]+j-(radius-Math.abs(i))];
                            tiles.push(spot);
                        }
                    }
                    break;
                    //Line shape
                case "VLine":
                    for(var i=0;i<radius;i++){
                        if(excludeCenter&&i===(radius-1)/2) i++;
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        tiles.push(spot);
                    }
                    break;
                //Horizontal line
                case "HLine":
                    
                    for(var i=-radius;i<radius+1;i++){
                        if(excludeCenter&&i===0) i++;
                        var spot = [i*rot[0]+loc[0],i*rot[1]+loc[1]];
                        tiles.push(spot);
                    }
                    break;
                case "T":
                    for(var i=0;i<range;i++){
                        var spot = [i*arr[0]+loc[0],i*arr[1]+loc[1]];
                        tiles.push(spot);
                    }
                    //The end line part
                    for(var i=-radius;i<radius+1;i++){
                        //Multiply by range to make the line move forward
                        var spot = [i*rot[0]+loc[0]+(rot[1]*range),i*rot[1]+loc[1]-(rot[0]*range)];
                        tiles.push(spot);
                    }
                    break;
                case "Cone":
                    for(var i=0;i<range+1;i++){
                        for(var j=-radius*i;j<radius*i+1;j++){
                            var spot = [j*rot[0]+loc[0] + i*arr[0],j*rot[1]+loc[1] + i*ar[1]];
                            tiles.push(spot);
                        }
                    }
                    break;
                    //X shape
                case "X":
                    var spot = loc;
                    if(!excludeCenter) tiles.push(spot);
                    for(var j=1;j<radius+1;j++){
                        //Put a tile in all 4 corners
                        var tleft = [spot[0]-j,spot[1]-j];
                        var tright = [spot[0]+j,spot[1]-j];
                        var bright = [spot[0]+j,spot[1]+j];
                        var bleft = [spot[0]-j,spot[1]+j];
                        tiles.push(tleft,tright,bright,bleft);
                    }
                    break;
                    //Square shape
                case "Box":
                    for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                        for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                            if(excludeCenter && i === loc[0] && j === loc[1]) continue;
                            var spot = [i,j];
                            tiles.push(spot);
                        }
                    }
                    break;
                case "Custom":
                    
                    break;
            }
            return tiles;
        },
        setTiles:function(tile,loc,dir,aoe,type,aoeProps,rangeProps,range){
            Q.AOETileLayer.stop();
            this.tiles = this.getTiles(loc,dir,aoe,type,aoeProps,rangeProps,range);
            
            for(var i=0;i<this.tiles.length;i++){
                Q.AOETileLayer.setTile(this.tiles[i][0],this.tiles[i][1],tile);
            }
            this.pulse();
        },
        getCustomAOE:function(loc,technique,dir){
            switch(technique.name){
                case "Phalanx":
                    var upDown = Q.getDirArray(dir);
                    var sideSide = Q.getDirArray(Q.getRotatedDir(dir));
                    var diagBehind = Q.getBehindDirArray(dir);
                    var locs = [];
                    for(var i=-1;i<2;i++){
                        if(i===0) i++;
                        locs.push([i*upDown[0]+loc[0],i*upDown[1]+loc[1]]);
                        locs.push([i*sideSide[0]+loc[0],i*sideSide[1]+loc[1]]);
                        if(dir==="up"||dir==="down"){
                            locs.push([i*diagBehind[0]+loc[0],Math.abs(i)*diagBehind[1]+loc[1]]);
                        } else {
                            locs.push([Math.abs(i)*diagBehind[0]+loc[0],i*diagBehind[1]+loc[1]]);
                        }
                    }
                    return locs;
                    break;
            }
        },
        resetGrid:function(){
            this.tiles.forEach(function(tile){
                Q.AOETileLayer.setTile(tile[0],tile[1],0);
            });
            this.tiles = [];
        }
    });
    
    //Make it again. This time, it doesn't get destroyed. Include options for aoe
    Q.GameObject.extend("RangeController",{
        pulse:function(){
            Q.RangeTileLayer.stop();
            this.animatePulse();
        },
        animatePulse:function(){
            Q.RangeTileLayer.animate({opacity:0.7} ,1.2, Q.Easing.Linear).chain({opacity:0.3} , 1, Q.Easing.Linear, {callback:function(){Q.rangeController.animatePulse();}});
        },
        setTiles:function(tile,loc,range,rangeProps,matrix){
            Q.RangeTileLayer.stop();
            var bounds = Q.BattleGrid.getBounds(loc,range);
            var rangeTileLayer = Q.RangeTileLayer;
            var tiles = [];
            //Get all possible move locations that are within the bounds
            for(var i=bounds.tileStartX;i<bounds.tileStartX+bounds.cols;i++){
                for(var j=bounds.tileStartY;j<bounds.tileStartY+bounds.rows;j++){
                    if(matrix.grid[i][j].weight<10000){
                        tiles.push(matrix.grid[i][j]);
                    }
                }
            }
            this.tiles = [];
            //If there is at least one tile
            if(tiles.length){
                //Loop through the possible tiles
                var straight = rangeProps.includes("Straight");
                for(var i=tiles.length-1;i>=0;i--){
                    if(straight){
                        if(tiles[i].x!==loc[0]&&tiles[i].y!==loc[1]){
                            continue;
                        }
                    }
                    //Get the path and then slice it if it goes across caltrops
                    var path = Q.getPath(loc,[tiles[i].x,tiles[i].y],matrix,range+1000);
                    var pathCost = 0;
                    for(var j=0;j<path.length;j++){
                        pathCost+=path[j].weight;
                    }
                    if(path.length>0&&path.length<=range&&pathCost<=range+1000){
                        //If the path is normal
                        if(pathCost<=range){
                            rangeTileLayer.setTile(tiles[i].x,tiles[i].y,tile);
                            this.tiles.push(tiles[i]);  
                        } 
                        //If the path includes a single caltrops tile
                        else if(pathCost>=1000) {
                            //Only include this path if the last tile is the ZOC tile
                            if(path[path.length-1].weight===1000){
                                rangeTileLayer.setTile(tiles[i].x,tiles[i].y,tile);
                                this.tiles.push(tiles[i]);  
                            }
                        }
                    }
                }
            //If there's nowhere to move
            } else {
                
            }
            this.pulse();
        },
        setSpecificTile:function(tile,loc){
            this.tiles = this.tiles || [];
            Q.RangeTileLayer.setTile(loc[0],loc[1],tile);
            this.tiles.push({x:loc[0],y:loc[1]});
            this.pulse();
        },
        resetGrid:function(){
            if(!this.tiles) return;
            this.tiles.forEach(function(tile){
                Q.RangeTileLayer.setTile(tile.x,tile.y,0);
            });
            this.tiles = [];
        },
        checkConfirmMove:function(user, loc){
            if(this.checkValidPointerLoc(Q.RangeTileLayer, loc, 1)){
                if(!Q.BattleGrid.getObject(loc)){
                    //Follow the mover
                    Q.viewFollow(user, Q.stage());
                    //Make the character move to the spot
                    user.moveAlong(Q.getPath(user.p.loc, loc, user.p.walkMatrix));
                    //Destroy this range grid
                    this.resetGrid();
                    return true;
                } else {this.cannotDo();}
            } else {this.cannotDo();}
        },
        validateTechnique:function(technique, loc, user){
            var maxRangeFixed = technique.rangeProps.includes("MaxRangeFixed");
            //If the technique is not even on a range tile, it's not valid (unless it's MaxRangeFixed)
            if(!maxRangeFixed && !this.checkValidPointerLoc(Q.RangeTileLayer,Q.pointer.p.loc,2)) return this.cannotDo();
            var mustTargetGround = technique.rangeProps.includes("MustTargetGround");
            var objOnTargetLoc = Q.BattleGrid.getObject(loc);
            if(mustTargetGround && objOnTargetLoc) return this.cannotDo();
            
            var canTargetGround = technique.rangeProps.includes("CanTargetGround");
            var targets =  Q.BattleGrid.getObjectsAround(Q.aoeController.tiles);
            if(!targets.length && (!canTargetGround && !mustTargetGround)) return this.cannotDo();
            
            var targetDead = technique.rangeProps.includes("TargetDead");
            if(!targetDead){
                targets = Q.BattleGrid.removeDead(targets);
            }
            var excludeAllies = technique.rangeProps.includes("ExludeAllies");
            //Remove any characters that are not affected.
            if(excludeAllies) Q.BatCon.removeTeamObjects(targets,Q.BatCon.getOtherTeam(user.p.team));
            
            var enemyFacingUser = technique.rangeProps.includes("EnemyFacingUser");
            if(enemyFacingUser) Q.BatCon.removeNotFacing(targets,user);
            
            canTargetGround = technique.rangeProps.includes("CanTargetGround") && Q.BattleGrid.getTileDistance(loc,user.p.loc) <= technique.range;
            
            var validMovement = true;
            //If the technique has at least one movement arg
            if(technique.hasMovement){
                //Need to check that all args are valid
                for(var i=0;i<technique.args.length;i++){
                    var arg = technique.args[i];
                    if(arg.func === "Move Character"){
                        var thisValid;
                        //Always do the technique if there is damage, even if no targets move.
                        if(technique.type1 === "Damage"){
                            thisValid = {tiles:[true]};
                        } else {
                            switch(arg.target){
                                case "All":
                                    if(targets.length){
                                        for(var j=0;j<targets.length;j++){
                                            thisValid = Q.BatCon.techniqueFuncs.validateMovedTo(user, targets[i], arg.numTiles, arg.movementType);
                                            if(thisValid && thisValid.tiles.length) break;
                                        }
                                    }
                                    if(!thisValid || !thisValid.tiles.length){
                                        thisValid = Q.BatCon.techniqueFuncs.validateMovedTo(user, user, arg.numTiles, arg.movementType);
                                    }
                                    break;
                                case "User":
                                    thisValid = Q.BatCon.techniqueFuncs.validateMovedTo(user, user, arg.numTiles, arg.movementType);
                                    break;
                                case "Target":
                                    thisValid = Q.BatCon.techniqueFuncs.validateMovedTo(user, targets[0], arg.numTiles, arg.movementType);
                                    break;
                            }
                        }
                        if(!thisValid || !thisValid.tiles.length) validMovement = false;
                    }
                }
                
            }
            if(((targets.length || canTargetGround) || (!targets.length && mustTargetGround)) && validMovement){
                Q.BatCon.previewDoTechnique(user,loc,technique,targets,Q.aoeController.tiles.slice(0));
                this.resetGrid();
                Q.pointer.pointerAttackControls.remove();
            } else {this.cannotDo();}
        },
        validateAttack:function(user, loc){
            var obj = Q.BattleGrid.getObject(loc);
            //Make sure the target hasn't died (due to extra attacks)
            if(obj && Q.BattleGrid.removeDead([obj]).length){
                Q.BatCon.previewAttackTarget(user, loc);
                //Destroy this range grid
                this.resetGrid();
                return true;
            } else {this.cannotDo();}
        },
        checkConfirmAttack:function(){
            if(Q.pointer.p.technique){
                this.validateTechnique(Q.pointer.p.technique,Q.pointer.p.loc,this.target);
            } else {
                if(this.checkValidPointerLoc(Q.RangeTileLayer,Q.pointer.p.loc,2)){
                    this.validateAttack(this.target);
                }
            }
        },
        refresh:function(){
            this.cannotDo --;
            if(this.cannotDo < 0){
                this.cannotDo = 0;
                this.off("step",this,"refresh");
            }
        },
        cannotDo:function(){
            if(this.cannotDo) return;
            Q.audioController.playSound("cannot_do.mp3");
            this.cannotDo = 100;
            this.on("step",this,"refresh");
        },
        //Checks if we've selected a tile
        checkValidPointerLoc:function(tileLayer, loc, validTile){
            return tileLayer.getTile(loc[0], loc[1]) === validTile;
        },
        getPossibleTargets:function(tiles){
            var targets = [];
            for(var i=0;i<tiles.length;i++){
                var target = Q.BattleGrid.getObject([tiles[i].x,tiles[i].y]);
                if(target) targets.push(target);
            }
            return targets;
        }
    });/*
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
                    this.getTileRange(user.p.loc,user.p.combatStats.moveSpeed,user.p["walkMatrix"]);
                    break;
                case "attack":
                    this.getTileRange(user.p.loc,user.p.combatStats.atkRange,user.p["attackMatrix"]);
                    break;
                case "skill":
                    var skill = this.p.skill?this.p.skill:this.p.item;
                    var range = this.getRange(skill.range[0],skill);
                    switch(skill.range[1]){
                        case "self":
                            //Self skills can target the tile that the user is on
                            this.p.moveGuide.push(this.insert(new Q.RangeTile({loc:[user.p.loc[0],user.p.loc[1]]})));
                            //If there is range, then the skill can target self, or other squares (using potion, etc...)
                            if(range>0){
                                this.getTileRange(user.p.loc,range,user.p["attackMatrix"]);
                            }
                            break;
                        case "normal":
                            this.getTileRange(user.p.loc,range,user.p["attackMatrix"]);
                            break;
                            //No diagonal attack
                        case "straight":
                            this.getTileRange(user.p.loc,range,user.p["attackMatrix"],skill.range[1]);
                            break;
                    }
                    break;
                //Shows the tiles that the user can lift
                case "lift":
                    this.getTileRange(user.p.loc,1,user.p["attackMatrix"]);
                    break;
                //Shows the tiles that an object can be dropped on
                case "drop":
                    this.getTileRange(user.p.loc,1,user.p["attackMatrix"]);
                    break;
            }
        },
        getCustomRange:function(skill,user){
            var range = 0;
            var name = skill.name;
            switch(name){
                case "Long Shot":
                    var rh = user.p.equipment.righthand || {range:0};
                    var lh = user.p.equipment.lefthand || {range:0};
                    range = rh.range>lh.range?rh.range:lh.range;
                    range+=Math.floor(user.p.baseStats.skl/10);
                    break;
                case "Stability Field":
                    range = Math.ceil(user.p.combatStats.skill/5);
                    break;
                case "Heal":
                    range = Math.ceil(user.p.combatStats.skill/20);
                    break;
                case "Cure":
                    range = Math.ceil(user.p.combatStats.skill/25);
                    break;
                case "Energize":
                    range = Math.ceil(user.p.combatStats.skill/20);
                    break;
                    
            }
            return range;
        },
        getRange:function(range,skill){
            if(Q._isNumber(range)) return range;
            var user = this.p.user;
            switch(range){
                case "custom":
                    range = this.getCustomRange(skill,user);
                    break;
                case "weapon":
                    var lh = user.p.equipment[1];
                    if(lh) range = lh.range;
                    var rh = user.p.equipment[0];
                    if(rh) range = rh.range;
                    break;
                case "rangedWeapon":
                    var rh = user.p.equipment[0] || {range:0};
                    var lh = user.p.equipment[0] || {range:0};
                    range = rh.range>lh.range?rh.range:lh.range;
                    break;
                case "meleeWeapon":
                    var lh = user.p.equipment[1];
                    if(lh.range===1||lh.range===2) range = lh.range;
                    var rh = user.p.equipment[0];
                    if(rh.range===1||rh.range===2) range = rh.range;
                    break;
            }
            return range;
        },
        */
    
    //Definitely need to remake this.
    //It could include attack prediction (accuracy/damage)
    //Use Jquery to display text container.
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
                var technique = this.p.technique;
                var tiles = this.p.areaAffected;
                Q.BatCon.attackFuncs.doAttack(attacker,targets,technique,tiles);
                this.off("step",this,"checkInputs");
                this.destroy();
                Q.inputs['confirm']=false;
            } else if(Q.inputs['esc']||Q.inputs['back']){
                this.destroy();
                Q.inputs['esc']=false;
                Q.inputs['back']=false;
                if(this.p.technique){
                    if(this.p.technique.kind==="consumable"){
                        this.stage.ActionMenu.loadItem();
                    } else {
                        this.stage.ActionMenu.loadTechnique();
                    }
                }
                else {
                    this.stage.ActionMenu.loadAttack();
                }
            }
        },
        inserted:function(){
            //targetting the ground
            if(!this.p.targets.length) return;
            var text = "Press enter to DO IT.";
            var teamObjs = Q.BatCon.filterByTeam(this.p.targets,Q.BatCon.turnOrder[0].p.team);
            if(teamObjs.length){
                text += " This attack will hit a teammate!";
            };
            this.insert(new Q.UI.Text({x:10+this.p.w/2,y:this.p.h/2,label:text,size:12,cx:0,cy:0,align:"center"}));
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
                w:32,h:32
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
            this.p.x+=Q.tileW/2;
            this.p.y-=Q.tileH/2;
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