$(function(){
    var DC = {};
    var FileSaver = {};
    var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Music, Animations")
        .setup({development: true, width:$(document).width()/2-9,height:$(document).height()-60})
        .touch().controls(true)
        .enableSound();
    Q.options.imagePath = "../../images/";
    Q.options.audioPath = "../.././audio/";
    Q.options.dataPath = ".././data/";

    Q.tileW = 32;
    Q.tileH = 32;
    Q.SPRITE_CHARACTER  = 8;

    Q.state.set("options",{
        musicEnabled:true,
        soundEnabled:true
    });
    var allowSpriteSelecting = true;
    var selectedCharacter = false;
    function startQuintusCanvas(){
        Q.setUpAnimations("../../");
        Q.scene("map",function(stage){
            stage.finished = function(){};
            Q.stageTMX(stage.options.map, stage);
            Q.addViewport(stage);
            
            $("#map-select-place").on("change",function(){
                var map = "../../data/maps/"+$("#map-select-group").val()+"/"+$("#map-select-place").val();
                Q.loadTMX(map,function(){
                    var characters = FileSaver.getCharacters();
                    var placementSquares = FileSaver.getPlacementSquares();
                    $("#event-chars-cont").empty();
                    $("#placement-squares-cont").empty();
                    Q.stageScene("map",0,{map:map,characters:characters,placementSquares:placementSquares});
                },{tmxImagePath:Q.options.imagePath.substring(3)});
            });

            Q.Grid = [];
            var tilesX = stage.mapWidth;
            var tilesY = stage.mapHeight;
            for(var i=0;i<tilesY;i++){
                Q.Grid[i]=[];
                for(var j=0;j<tilesX;j++){
                    Q.Grid[i][j]=false;
                }
            }
            var characters = stage.options.characters;
            for(var i=0;i<characters.length;i++){
                var char = characters[i];
                var charButton = DC.newCharacter(char);
                $('#event-chars-cont').append(charButton);
                var data = dataP.charFiles[char.file][char.group][char.handle];
                Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:DC.getNextEmpty(char.loc),dir:char.dir,ref:$(charButton).children(".character")}));
            }
            $(".character").last().trigger("click");
            var placementSquares = stage.options.placementSquares;
            for(var i=0;i<placementSquares.length;i++){
                DC.addPlacementSquare(placementSquares[i]);
            }
            Q.toCharSelection();
            Q.stage(0).lists.TileLayer[0].p.z = 0;
            Q.stage(0).lists.TileLayer[1].p.z = 1;
        },{sort:true});
        //Turn on clicking sprites/ground
        Q.el.addEventListener("click",function(e){
            //If we've dragged, don't click
            if(dragged||!Q.stage()){
                dragged = false;
                return;
            }
            //Can't click sprite if placing one
            if(allowSpriteSelecting){
                var x = e.offsetX || e.layerX,
                    y = e.offsetY || e.layerY,
                    stage = Q.stage();

                var stageX = Q.canvasToStageX(x, stage),
                    stageY = Q.canvasToStageY(y, stage);
                var locX = Math.floor(stageX/Q.tileW);
                var locY = Math.floor(stageY/Q.tileH);
                var objAt = Q.getSpriteAt([locX,locY]);
                if(objAt){
                    Q.stage(0).trigger("selectedCharacter",objAt);
                } else {
                    Q.stage(0).trigger("selectedLocation",[locX,locY]);
                }
            } else {
                selectedCharacter.confirmPlacement();
            }
        });
        Q.el.addEventListener("mousemove",function(e) {
            if(!Q.stage()) return;
            var x = e.offsetX || e.layerX,
                y = e.offsetY || e.layerY,
                stage = Q.stage();

            var stageX = Q.canvasToStageX(x, stage),
                stageY = Q.canvasToStageY(y, stage);
            var locX = Math.floor(stageX/Q.tileW);
            var locY = Math.floor(stageY/Q.tileH);
            $("#canvas-coordinates").text(locX+","+locY);
            $("#canvas-coordinates").attr("locX",locX);
            $("#canvas-coordinates").attr("locY",locY);
        });
        var dragged = false;
        Q.addViewport = function(stage){
            stage.add("viewport");
            var obj = Q.viewObj = stage.insert(new Q.UI.Container({w:Q.width,h:Q.height,type:Q.SPRITE_UI}));
            obj.p.x = obj.p.w/2;
            obj.p.y = obj.p.h/2;
            obj.drag = function(touch){
                this.p.x = touch.origX - touch.dx;
                this.p.y = touch.origY - touch.dy;
                dragged = true;
            };
            obj.on("drag");
            obj.on("touchEnd",function(){
                setTimeout(function(){
                    dragged = false;
                });
            });
            obj.centerOn = function(loc){
                var pos = Q.getXY(loc);
                this.p.x = pos.x;
                this.p.y = pos.y;
            };
            stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
            stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
            stage.follow(obj,{x:true,y:true});
        };

        Q.getSpriteAt = function(loc){
            return Q.stage(0).locate(loc[0]*Q.tileW+Q.tileW/2,loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_CHARACTER);
        };
        Q.getXY = function(loc){
            return {x:loc[0]*Q.tileW+Q.tileW/2,y:loc[1]*Q.tileH+Q.tileH/2};
        };
        
        $(document).on("click",".char-remove",function(){
            var charButton = $(this).parent().children(".character");
            var char = Q.getSpriteAt([parseInt($(charButton).attr("locX")),parseInt($(charButton).attr("locY"))]);
            if(Q.matchChars(selectedCharacter,char)){
                selectedCharacter.destroySelectedBox();
                selectedCharacter.off("step",selectedCharacter,"setDir");
            }
            char.removeFromExistence();
        });
        $(document).on("click",".character",function(){
            $(".character.selected").removeClass("selected");
            $(this).addClass("selected");
            if(selectedCharacter){
                selectedCharacter.destroySelectedBox();
                selectedCharacter.off("step",selectedCharacter,"setDir");
            }
            selectedCharacter = Q.getSpriteAt([parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))]);
            selectedCharacter.createSelectedBox();
            selectedCharacter.on("step",selectedCharacter,"setDir");
        });
        Q.matchChars = function(a,b){
            if(!a||!b) return false;
            return a.p.handle===b.p.handle&&a.p.uniqueId===b.p.uniqueId;
        };
        Q.toCharSelection = function(){
            selectedGroup = false;
            //When a character is clicked on the map
            Q.stage(0).on("selectedCharacter",function(obj){
                //If the character is already selected
                if(selectedCharacter&&Q.matchChars(selectedCharacter,obj)){
                    selectedCharacter.destroySelectedBox();
                    selectedCharacter.unconfirmPlacement();
                    selectedCharacter.allowPlacement();
                } 
                //If the character is not already selected, select it.
                else {
                    $(obj.p.ref).trigger("click");
                }
            });
            $("#event-script-box").removeClass("selected-background");
            $("#script-item-box").removeClass("selected-background");
            //Add the darker theme to the character boxes
            $("#event-characters-box").addClass("selected-background");
            $("#all-characters-box").addClass("selected-background");
        };
        Q.UI.Container.extend("SelectedSquare",{
            init:function(p){
                this._super(p,{
                    w:Q.tileW,
                    h:Q.tileH,
                    border:1,
                    opacity:0.8,
                    fill:"black"
                });
                this.p.z = this.p.y-1;
                if(this.p.num){
                    this.on("inserted");
                }
            },
            inserted:function(){
                this.p.number = this.insert(new Q.Number({label:""+this.p.num,y:-this.p.h/2}));
            }
        });
        Q.UI.Text.extend("Number",{
            init:function(p){
                this._super(p,{
                    color:"white",
                    z:3
                });
            }
        });
      

        Q.component("inGrid",{
            added:function(){
                Q.Grid[this.entity.p.loc[1]][this.entity.p.loc[0]] = this.entity;
            },
            extend:{
                unconfirmPlacement:function(){
                    Q.Grid[this.p.loc[1]][this.p.loc[0]] = false;
                },
                confirmPlacement:function(){
                    if(isNaN(this.p.loc[0])||isNaN(this.p.loc[1])) this.p.loc = [0,0];
                    if(this.p.loc[0]<0||this.p.loc[0]>Q.stage(0).mapWidth||this.p.loc[1]<0||this.p.loc[1]>Q.stage(0).mapHeight) return;
                    if(Q.Grid[this.p.loc[1]][this.p.loc[0]]){
                        if(Q.Grid[this.p.loc[1]][this.p.loc[0]] !== this){
                            this.p.loc = DC.getNextEmpty(this.p.loc);
                        }
                    }
                    this.off("step",this,"stickToCursor");
                    Q.Grid[this.p.loc[1]][this.p.loc[0]] = this;
                    $(this.p.ref).attr("locX",this.p.loc[0]);
                    $(this.p.ref).attr("locY",this.p.loc[1]);
                    allowSpriteSelecting = true;
                    var pos = Q.getXY(this.p.loc);
                    this.p.x = pos.x;
                    this.p.y = pos.y;
                    this.p.z = pos.y;
                    this.createSelectedBox();
                    this.p.lastLoc = false;
                }
            }
        });
        Q.Sprite.extend("CharacterSprite",{
            init:function(p){
                if(p.sheet==="random") p.sheet = "legionnaire";
                this._super(p,{
                    type:Q.SPRITE_CHARACTER,
                    frame:0,
                    sprite:"Character"
                });
                var pos = Q.getXY(this.p.loc);
                this.p.x = pos.x;
                this.p.y = pos.y;
                this.p.z = pos.y;
                this.add("animation, inGrid");
                this.on("destroy",function(){
                    if(this.p.selectionBox){
                        this.p.selectionBox.destroy();
                    }
                });
                this.play("standing"+this.p.dir);
            },
            setDir:function(){
                var lastDir = this.p.dir;
                if(Q.inputs['left']){
                    this.p.dir = 'left';
                } else if(Q.inputs['right']){
                    this.p.dir = 'right';
                } else if(Q.inputs['down']){
                    this.p.dir = 'down';
                } else if(Q.inputs['up']){
                    this.p.dir = 'up';
                }
                if(lastDir!==this.p.dir){
                    this.play("standing"+this.p.dir);
                    $(this.p.ref).attr("dir",this.p.dir);
                }
            },
            destroySelectedBox:function(){
                if(this.p.selectedBox) this.p.selectedBox.destroy();
            },
            createSelectedBox:function(){
                this.destroySelectedBox();
                this.p.selectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:this.p.x,y:this.p.y,loc:this.p.loc,fill:"white"}));
            },
            removeFromExistence:function(){
                if(selectedCharacter===this&&Q.locSelectedBox) Q.locSelectedBox.destroy();
                if(!isNaN(this.p.loc[0])&&!isNaN(this.p.loc[1])) this.unconfirmPlacement();
                this.destroy();
            },
            allowPlacement:function(){
                allowSpriteSelecting = false;
                this.on("step",this,"stickToCursor");
                this.p.lastLoc = [this.p.loc[0],this.p.loc[1]];
            },
            stickToCursor:function(){
                this.p.x = parseInt($("#canvas-coordinates").attr("locX"))*Q.tileW+Q.tileW/2;
                this.p.y = parseInt($("#canvas-coordinates").attr("locY"))*Q.tileH+Q.tileH/2;
                this.p.loc = [parseInt($("#canvas-coordinates").attr("locX")),parseInt($("#canvas-coordinates").attr("locY"))];
                this.p.z = this.p.y;
            }
        });
        var map = "../../data/maps/"+$("#map-select-group").val()+"/"+$("#map-select-place").val();
        Q.loadTMX(map,function(){
            Q.stageScene("map",0,{map:map,characters:dataP.event.characters,placementSquares:dataP.event.placementSquares});

            //Using the file data, set up the page
            var event = dataP.event;
            $("#prop-music .music-select").val(event.music).trigger("change");
            $("#prop-maxAllies input").val(event.maxAllies);
            function showEventGroups(data,groupCont){
                $(groupCont).children(".cond-group-title-bar").children(".add-group").trigger("click");
                for(var j=0;j<data.conds.length;j++){
                    var condsCont = $(groupCont).children(".cond-groups").children(".cond-group").last();
                    var func = data.conds[j][0];
                    var props = data.conds[j][1];
                    var required = data.required.toString();
                    var cont = $(condsCont).children(".conditions").children(".cond-cont").append(DC.getCondFunc(func));
                    DC.getCond(cont.children(".cond").last(),func,props);
                    $(condsCont).children(".conditions").children(".required").val(required);
                    DC.selectInitialValue($(cont).children(".cond").last());
                    $(cont).children(".cond").last().children(".func").on("change",function(){
                        $(this).nextAll().remove();
                        DC.getCond($(this).parent(),$(this).parent().children(".func").val());
                    });
                }
                for(var j=0;j<data.effects.length;j++){
                    var condsCont = $(groupCont).children(".cond-groups").children(".cond-group").last();
                    var func = data.effects[j][0];
                    var props = data.effects[j][1];
                    var cont = $(condsCont).children(".effects").children(".effect-cont").append(DC.getEffectFunc(func));
                    DC.getEffect(cont.children(".effect").last(),func,props);
                    DC.selectInitialValue($(cont).children(".effect").last());
                    $(cont).children(".effect").last().children(".func").on("change",function(){
                        $(this).nextAll().remove();
                        DC.getEffect($(this).parent(),$(this).parent().children(".func").val());
                    });
                }
            };
            function setUpEndBattle(which){
                $("#prop-"+which+" .scene-type").val(event[which] ? event[which].next[0] : GDATA.eventPointer.type).trigger("change");
                $("#prop-"+which+" .scene-name").val(event[which] ? event[which].next[1] : GDATA.eventPointer.scene).trigger("change");
                $("#prop-"+which+" .event-name").val(event[which] ? event[which].next[2] : GDATA.eventPointer.event);
                for(var i=0;i<event[which].events.length;i++){
                    showEventGroups(event[which].events[i],$("#prop-"+which));
                }
            }
            setUpEndBattle("victory");
            setUpEndBattle("defeat");
            for(var i=0;i<event.events.length;i++){
                showEventGroups(event.events[i],$("#cond-groups-cont"));
            }
        },{tmxImagePath:Q.options.imagePath.substring(3)});
    }
    
    var dataP = {
        mapFileNames:GDATA.mapFileNames,
        mapFileGroups:Object.keys(GDATA.mapFileNames),
        soundFileNames:GDATA.soundFileNames,
        musicFileNames:GDATA.musicFileNames,
        charFiles:GDATA.characterFiles,
        imageAssets:GDATA.imageAssets,
        event:GDATA.event,
        sceneTypes:["Story","Flavour"],
        condFuncs:["rounds","charHealth"],
        effectFuncs:["setVar","spawnCharacter","showText","changeMusic"],
        scopes:["Global","Scene"],
        conditionals:["==","!=",">=","<="],
        operators:["=","+=","-="],
        directions:["down","left","up","right"],
        charHealth:["deadOrFainted","dead","fainted","fullHealth","takenDamage","belowHalfHealth"]
    };
    function addPath(arr,path){
        return arr.map(function(itm){
            return path+itm;
        });
    }
    var toLoad = addPath(GDATA.spritesImgs,"sprites/").concat(addPath(GDATA.imageAssets,"story/")).concat(addPath(GDATA.animsImgs,"animations/"));
    Q.load(toLoad,function(){
        start();
    });
    var formatScenes = function(){
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
        var newScenes = {
            Story:[],
            Flavour:[]
        };
        for(var i=0;i<story.Story.length;i++){
            newScenes["Story"].push(story.Story[i].name);
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newScenes["Flavour"].push(groups[i]);
        }
        
        return newScenes;
    };
    var formatEvents = function(){
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
        var newEvents = {
            Story:{},
            Flavour:{}
        };
        for(var i=0;i<story.Story.length;i++){
            newEvents.Story[story.Story[i].name] = story.Story[i].events.map(function(itm){return itm.name;});
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newEvents.Flavour[groups[i]] = flavour.groups[groups[i]][2];
        }
        return newEvents;
    };
    var start = function(){
        dataP.scenes = formatScenes();
        dataP.events = formatEvents();
        dataP.scene = GDATA.dataFiles["scenes-list.json"].Story.find(function(sc){return sc.name===GDATA.eventPointer.scene;});
        dataP.vrs = {Global:Object.keys(GDATA.dataFiles["global-vars.json"].vrs),Scene:Object.keys(dataP.scene.vrs)};
        DC = {
            getCondGroup:function(){
                return '<div class="cond-group">\n\
                    <div class="cond-group-top">\n\
                        <span class="minimize-icon-deep group-text">-</span>\
                        <span class="add-new-condition group-text">Add Condition</span>\n\
                        <span class="add-new-effect group-text">Add Effect</span>\n\
                        <span class="remove-choice-deep group-text">x</span>\n\
                    </div>\n\
                    <div class="conditions minimize">\n\
                        <div class="cond-group-top">\n\
                            <span class="minimize-icon-deep group-text">-</span>\n\
                            <span class="editor-descriptor-title medium-gradient group-text minimizable-deep">Conditions</span>\n\
                        </div>\n\
                        <span class="editor-descriptor-title medium-gradient half-width">All Required</span><select class="required"><option value="true">true</option><option value="false">false</option></select>\n\
                        <div class="cond-cont minimize"></div>\n\
                    </div>\n\
                    <div class="effects minimize">\n\
                        <div class="cond-group-top">\n\
                            <span class="minimize-icon-deep group-text">-</span>\n\
                            <span class="editor-descriptor-title medium-gradient group-text minimizable-deep">Effects</span>\n\
                        </div>\n\
                        <div class="effect-cont minimize"></div>\n\
                    </div>\n\
                </div>';
            },
            groupCondTop:function(func){
                return "<span class='half-width'>Func</span><select class='func half-width' initial-value='"+func+"'>"+DC.getOptString(dataP.condFuncs)+"</select>";
            },
            groupEffectTop:function(func){
                return "<span class='half-width'>Func</span><select class='func half-width' initial-value='"+func+"'>"+DC.getOptString(dataP.effectFuncs)+"</select>";
            },
            groupRemove:function(){
                return "<span class='remove-choice group-text unobtrusive'>x</span>";
            },
            groupInput:function(text,val,type,min){
                return "<span class='quarter-width'>"+text+"</span><input class='prop three-quarter-width' value='"+val+"' type='"+type+"' min='"+min+"'>";
            },
            groupTextArea:function(text,val){
                return "<span class='full-width'>"+text+"</span><textarea class='prop full-width group-text-area'>"+val+"</textarea>";
            },
            groupSelect:function(text,opts,value,cl){
                return "<span class='quarter-width'>"+text+"</span><select class='prop three-quarter-width "+(cl?cl:'')+"' initial-value='"+value+"'>"+DC.getOptString(opts)+"</select>";
            },
            getCondFunc:function(name){
                name = name || "rounds";
                var content = $("<div class='cond'></div>");
                content.append(DC.groupRemove());
                content.append(DC.groupCondTop(name));
                return content;
            },
            getCond:function(content,name,props){
                name = name || "rounds";
                switch(name){
                    case "rounds":
                        props = props || [1,0];
                        content.append(this.groupInput("Rounds",props[0],"number",1));
                        content.append(this.groupInput("Repeat",props[1],"number",0));
                        break;
                    case "charHealth":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],dataP.charHealth[0]];
                        content.append(this.groupSelect("Char",chars,props[0]));
                        content.append(this.groupSelect("Prop",dataP.charHealth,props[1]));
                        break;
                }
                return content;
            },
            getEffectFunc:function(name){
                name = name || "setVar";
                var content = $("<div class='effect'></div>");
                content.append(DC.groupRemove());
                $(content).append(DC.groupEffectTop(name));
                return content;
            },
            getEffect:function(content,name,props){
                name = name || "setVar";
                switch(name){
                    case "setVar":
                        props = props || ["Global","money","+=",1000];
                        content.append(this.groupSelect("Scope",dataP.scopes,props[0],"var-scope"));
                        content.append(this.groupSelect("Name",dataP.vrs[props[0]],props[1],"var-handle"));
                        DC.linkSelects($(content).children(".prop")[0],$(content).children(".prop")[1],dataP.vrs);
                        content.append(this.groupSelect("Opr",dataP.operators,decodeURIComponent(props[2])));
                        content.append(this.groupInput("Value",props[3],"text"));
                        
                        break;
                    case "spawnCharacter":
                        props = props || ["Officers.json","Officers","Alex",3,0,"down"];
                        var files = Object.keys(dataP.charFiles);
                        var groups = Object.keys(dataP.charFiles[props[0]]);
                        var chars = Object.keys(dataP.charFiles[props[0]][props[1]]);
                        content.append(this.groupSelect("File",files,props[0]));
                        content.append(this.groupSelect("Group",groups,props[1]));
                        DC.linkSelects($(content).children(".prop")[0],$(content).children(".prop")[1],dataP.charFiles);
                        content.append(this.groupSelect("Char",chars,props[2]));
                        DC.linkSelects($(content).children(".prop")[1],$(content).children(".prop")[2],dataP.charFiles,[$(content).children(".prop")[0]]);
                        content.append(this.groupInput("X Loc",props[3],"number",0));
                        content.append(this.groupInput("Y Loc",props[4],"number",0));
                        content.append(this.groupSelect("Dir",dataP.directions,props[5]));
                        break;
                    case "showText":
                        props = props || ["",dataP.imageAssets[0],dataP.imageAssets[0]];
                        content.append(this.groupTextArea("Text",props[0]));
                        content.append(this.groupSelect("Left",dataP.imageAssets,props[1]));
                        content.append(this.groupSelect("Right",dataP.imageAssets,props[2]));
                        break;
                    case "changeMusic":
                        props = props || ["battle.mp3"];
                        content.append(this.groupSelect("Music",dataP.musicFileNames,props[0]));
                        break;
                }
                return content;
            },
            newCharacter:function(char){
                return $("<div class='character-cont'><span class='character "+char.handle+"' uniqueId='"+char.uniqueId+"' dir='"+char.dir+"' locX='"+char.loc[0]+"' locY='"+char.loc[1]+"' file='"+char.file+"' group='"+char.group+"'>"+char.handle+" ("+char.uniqueId+")"+"</span><span class='remove-choice group-text char-remove'>x</span></div>");
            },
            addPlacementSquare:function(loc){
                var objAt = Q.Grid[loc[1]][loc[0]];
                if(!objAt){
                    var pos = Q.getXY(loc);
                    var square = Q.stage(0).insert(new Q.SelectedSquare({x:pos.x,y:pos.y,loc:loc,fill:"blue"}));
                    square.add("inGrid");
                    $("#placement-squares-cont").append("<span class='placement-square' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</span>");
                    $(".placement-square").last().on("click",function(){
                        var loc = [parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))];
                        Q.viewObj.centerOn(loc);
                    });
                } else {
                    $(".placement-square").each(function(){
                        if($(this).attr("locX")==loc[0]&&$(this).attr("locY")==loc[1]){
                            $(this).remove();
                        }
                    });
                    objAt.unconfirmPlacement();
                    objAt.destroy();
                }
            },
            //When sel1 changes, change all of the options of sel2 from the passed in object.
            //obj must be in this format: {myName:[itm1, itm2, ..]}
            //myName would be equal to the sel1's value.
            //deepArray allows multiple selects to 'chain' changes
            linkSelects:function(sel1,sel2,obj,deepArray){
                $(sel1).on("change",function(){
                    $(sel2).empty();
                    if(deepArray){
                        var props = [];
                        $(deepArray).each(function(){props.push($(this).val());});
                        props.push($(this).val());
                        $(sel2).append(DC.getOptString(DC.getDeepValue(obj,props.join("&"))));
                    } else {
                        $(sel2).append(DC.getOptString(obj[$(this).val()]));
                    }
                    $(sel2).trigger("change");
                });
            },
            genUniqueId:function(handle){
                var id = 0;
                var sameHandle = $("."+handle);
                if(sameHandle.length){
                    //Match the unique ids
                    do {
                        var found = false;
                        //Check if the ids match
                        for(var i=0;i<sameHandle.length;i++){
                            if($(sameHandle[i]).attr("uniqueId")==id){
                                id++;
                                found=true;
                            }
                        }
                    } while(found);
                }
                return id;
            },
    
            getNextEmpty:function(loc){
                var occupied = true;
                while(occupied){
                    if(Q.Grid[loc[1]][loc[0]]){
                        if(loc[0]>Q.stage(0).mapWidth){
                            loc[0] = 0;
                            loc[1]++;
                        } else {
                            loc[0]++;
                        }
                    } else {
                        occupied = false;
                    }
                }
                return loc;
            },
            getDeepValue:function(obj, path){
                for (var i=0, path=path.split('&'), len=path.length; i<len; i++){
                    obj = obj[path[i]];
                };
                return obj;
            },
            getOptString:function(arr,prop){
                var opts = '';
                //If an object is passed in
                if(!$.isArray(arr)) arr = Object.keys(arr);
                arr.forEach(function(itm){
                    if(prop){
                        opts += '<option value="' + itm[prop] + '">' + itm[prop] + '</option>';
                    } else {
                        opts += '<option value="'+itm+'">'+itm+'</option>';
                    }
                });
                return opts;
            },
            selectInitialValue:function(cont){
                $(cont).children("select").each(function(){
                    $(this).val($(this).attr("initial-value"));
                });
            }
        };
        FileSaver = {
            processValue:function(value){
                var val = parseInt(value);
                if(isNaN(val)) val = encodeURIComponent(value);
                if(!val && isNaN(val)) val = (value === 'true');
                return val;
            },
            getGroups:function(cont){
                var groups = [];
                $(cont).children(".cond-group").each(function(){
                    var group = {
                        conds:[],
                        effects:[],
                        required:FileSaver.processValue($(this).children(".conditions").children(".required").val())
                    };
                    $(this).children(".conditions").children(".cond-cont").children(".cond").each(function(){
                        var func = $(this).children(".func").val();
                        var props = [];
                        $(this).children(".prop").each(function(){
                            props.push(FileSaver.processValue($(this).val()));
                        });
                        group.conds.push([func,props]);
                    });
                    $(this).children(".effects").children(".effect-cont").children(".effect").each(function(){
                        var func = $(this).children(".func").val();
                        var props = [];
                        $(this).children(".prop").each(function(){
                            props.push(FileSaver.processValue($(this).val()));
                        });
                        group.effects.push([func,props]);
                    });
                    groups.push(group);
                });
                return groups;
            },
            getCharacters:function(){
                var chars = [];
                $(".character").each(function(){
                    var char = $(this);
                    chars.push({
                        file:char.attr("file"),
                        group:char.attr("group"),
                        handle:char.attr("class").split(" ")[1],
                        uniqueId:FileSaver.processValue(char.attr("uniqueId")),
                        loc:[FileSaver.processValue(char.attr("locX")),FileSaver.processValue(char.attr("locY"))],
                        dir:char.attr("dir")
                    });
                });
                return chars;
            },
            getPlacementSquares:function(){
                var squares = [];
                $(".placement-square").each(function(){
                    squares.push([parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))]);
                });
                return squares;
            },
            getEventRefs:function(){
                var refs = [];
                $(".event-name").each(function(){
                    refs.push([$(this).siblings(".scene-type").val(),$(this).siblings(".scene-name").val(),$(this).val()]);
                });
                return refs;
            },
            getVarRefs:function(){
                var refs = {sceneVarRefs:[],globalVarRefs:[]};
                $(".var-scope").each(function(){
                    var scope = $(this).val();
                    var name = $(this).siblings(".var-handle").val();
                    if(scope==="Global"){
                        refs.globalVarRefs.push(name);
                    } else if(scope==="Scene"){
                        refs.sceneVarRefs.push(name);
                    }
                });
                return refs;
            },
            getNewSaveFile:function(){
                var varRefs = FileSaver.getVarRefs();
                return {
                    file:JSON.stringify({
                        name:dataP.event.name,
                        kind:"battle",
                        map:$("#map-select-group").val()+"/"+$("#map-select-place").val(),
                        music:$("#prop-music .music-select").val(),
                        placementSquares:FileSaver.getPlacementSquares(),
                        maxAllies:FileSaver.processValue($("#prop-maxAllies input").val()),
                        victory:{
                            events:FileSaver.getGroups($("#prop-victory").children(".cond-groups")),
                            next:[$("#prop-victory .scene-type").val(),$("#prop-victory .scene-name").val(),$("#prop-victory .event-name").val()]
                        },
                        defeat:{
                            events:FileSaver.getGroups($("#prop-defeat").children(".cond-groups")),
                            next:[$("#prop-defeat .scene-type").val(),$("#prop-defeat .scene-name").val(),$("#prop-defeat .event-name").val()]
                        },
                        events:FileSaver.getGroups($("#cond-groups-cont").children(".cond-groups")),
                        characters:FileSaver.getCharacters()
                    }),
                    eventRefs:FileSaver.getEventRefs(),
                    sceneVarRefs:varRefs.sceneVarRefs,
                    globalVarRefs:varRefs.globalVarRefs
                };
            }
        };

        $(document).on("change",".music-select",function(){
            $(this).parent().children(".music-preview").attr("src","../../audio/bgm/"+$(this).val());
        });
        /* start initial props code */

        //Fill the char-files container with the files. This only needs to be done once at runtime as it will not change until the page is refreshed after a new character file has been created.
        var fileNames = Object.keys(dataP.charFiles);
        var cont = $("#char-files");
        for(var i=0;i<fileNames.length;i++){
            var groups = Object.keys(dataP.charFiles[fileNames[i]]);
            $(cont).append('<div class="file-groups"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+fileNames[i]+'</span><div class="groups minimize"></div></div>');
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(dataP.charFiles[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+groups[j]+'</span><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = dataP.charFiles[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }
        
        $(document).on("click",".add-group",function(){
            $(this).parent().siblings(".cond-groups").append(DC.getCondGroup());
            $(this).parent().siblings(".cond-groups").last().children(".cond-group").children(".cond-group-top").children(".add-new-condition").on("click",function(){
                var cont = $(this).parent().parent().children(".conditions").children(".cond-cont");
                $(cont).append(DC.getCondFunc());
                DC.getCond($(cont).children(".cond").last());
                DC.selectInitialValue($(cont).children(".cond").last());
                $(cont).children(".cond").last().children(".func").on("change",function(){
                    $(this).nextAll().remove();
                    DC.getCond($(this).parent(),$(this).parent().children(".func").val());
                });
            });
            $(this).parent().siblings(".cond-groups").last().children(".cond-group").children(".cond-group-top").children(".add-new-effect").on("click",function(){
                var cont = $(this).parent().parent().children(".effects").children(".effect-cont");
                $(cont).append(DC.getEffectFunc());
                DC.getEffect($(cont).children(".effect").last());
                DC.selectInitialValue($(cont).children(".effect").last());
                $(cont).children(".effect").last().children(".func").on("change",function(){
                    $(this).nextAll().remove();
                    DC.getEffect($(this).parent(),$(this).parent().children(".func").val());
                });
            });
        });

        
        DC.linkSelects($("#map-select-group"),$("#map-select-place"),dataP.mapFileNames);
        $("#map-select-group").append(DC.getOptString(dataP.mapFileGroups));
        $("#map-select-group").trigger("change");
        $(".music-select").append(DC.getOptString(dataP.musicFileNames));
        
        $("#placement-squares-button").on("click",function(){
            $(this).toggleClass("selected");
            if($(this).hasClass("selected")){
                Q.stage(0).on("selectedLocation",function(loc){
                    DC.addPlacementSquare(loc);
                });
            } else {
                Q.stage(0).off("selectedLocation");
            }
        });
        DC.linkSelects($("#prop-victory").children(".scene-type"),$("#prop-victory").children(".scene-name"),dataP.scenes);
        $("#prop-victory").children(".scene-type").append(DC.getOptString(dataP.sceneTypes));
        DC.linkSelects($("#prop-victory").children(".scene-name"),$("#prop-victory").children(".event-name"),dataP.events,[$("#prop-victory").children(".scene-type")]);
        $("#prop-victory").children(".scene-type").trigger("change");
        $("#prop-victory").children(".scene-name").trigger("change");
        
        DC.linkSelects($("#prop-defeat").children(".scene-type"),$("#prop-defeat").children(".scene-name"),dataP.scenes);
        $("#prop-defeat").children(".scene-type").append(DC.getOptString(dataP.sceneTypes));
        DC.linkSelects($("#prop-defeat").children(".scene-name"),$("#prop-defeat").children(".event-name"),dataP.events,[$("#prop-defeat").children(".scene-type")]);
        $("#prop-defeat").children(".scene-type").trigger("change");
        $("#prop-defeat").children(".scene-name").trigger("change");
        /* end initial props code */


        $(".music-select").trigger("change");
        $(".file-groups").children(".minimize-icon").trigger("click");
        
        
        $('.file-character').draggable({
            cursorAt: { top: 10, left: 20 },
            helper: "clone",
            appendTo: "body"
        });
        $('#event-chars-cont').droppable({
            accept:".file-character",
            //Create a character element
            drop:function(event,ui){
                if(selectedCharacter) selectedCharacter.confirmPlacement();
                var char = JSON.parse($(ui.draggable).attr("data"));
                char.uniqueId = DC.genUniqueId(char.handle);
                char.loc = DC.getNextEmpty([0,0]);
                char.dir = "down";
                var charButton = DC.newCharacter(char);
                $(this).append(charButton);
                var data = dataP.charFiles[char.file][char.group][char.handle];
                var character = Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:char.loc,dir:char.dir,ref:$(charButton).children(".character")}));
                $(charButton).children(".character").trigger("click");
                Q.stage(0).trigger("selectedCharacter",character);
            }
        });
        $("#go-back").click(function(e){
            if(confirm("Are you sure you want to go back without saving?")){
                var to = "show-events.php";
                if(GDATA.eventPointer.type==="Flavour"){
                    to = "show-flavour.php";
                }
                $.redirect(to,  {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type});
            }
        });
        $("#test-file").click(function(e){
            window.onbeforeunload = null;
            var data = FileSaver.getNewSaveFile();
            $.ajax({
                type:'POST',
                url:'save-battle.php',
                data:{data:data.file,name:GDATA.eventPointer.event,scene:GDATA.eventPointer.scene,type:GDATA.eventPointer.type},
                dataType:'json'
            })
            .done(function(data){$.redirect('../../index.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type, testing:true});})
            .fail(function(data){console.log(data)});
            
            if(GDATA.eventPointer.type==="Story"){
                $.ajax({
                    type:'POST',
                    url:'save-event-references.php',
                    data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:GDATA.eventPointer.event,scene:GDATA.eventPointer.scene},
                    dataType:'json'
                })
                .done(function(data){console.log(data)})
                .fail(function(data){console.log(data)});
            }
        });
        $("#save-file").click(function(){
            var data = FileSaver.getNewSaveFile();
            $.ajax({
                type:'POST',
                url:'save-battle.php',
                data:{data:data.file,name:GDATA.eventPointer.event,scene:GDATA.eventPointer.scene,type:GDATA.eventPointer.type},
                dataType:'json'
            })
            .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
            .fail(function(data){console.log(data)});
            
            if(GDATA.eventPointer.type==="Story"){
                $.ajax({
                    type:'POST',
                    url:'save-event-references.php',
                    data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:GDATA.eventPointer.event,scene:GDATA.eventPointer.scene},
                    dataType:'json'
                })
                .done(function(data){console.log(data)})
                .fail(function(data){console.log(data)});
            }
        });
        $("#load-characters").click(function(){
            if($("#load-chars-from-cont").length) return;
            $("#full-screen-hider").show();
            var cont = $("<div id='load-chars-from-cont'><span class='full-width'>Load From File</span></div>");
            var scType = DC.groupSelect("Type",dataP.GDATA.eventPointer.types,GDATA.eventPointer.type);
            var scName = DC.groupSelect("SCName",dataP.scenes[GDATA.eventPointer.type],GDATA.eventPointer.scene);
            var evName = DC.groupSelect("EVName",dataP.events[GDATA.eventPointer.type][GDATA.eventPointer.scene],GDATA.eventPointer.event);
            $(cont).append(scType);
            $(cont).append(scName);
            $(cont).append(evName);
            DC.selectInitialValue(cont);
            DC.linkSelects($(cont).children(".prop")[0],$(cont).children(".prop")[1],dataP.scenes);
            DC.linkSelects($(cont).children(".prop")[1],$(cont).children(".prop")[2],dataP.events,[$(cont).children(".prop")[0]]);
            
            $(cont).append("<div id='load-chars-buttons'><span id='load-chars'>LOAD</span><span id='chars-cancel'>CANCEL</span></div>");
            $("#editor-content").append(cont);
            $("#load-chars").click(function(){
                var url = "../../data/json/story/events/"+$($("#load-chars-from-cont").children(".prop")[0]).val()+"/"+$($("#load-chars-from-cont").children(".prop")[1]).val()+"/"+$($("#load-chars-from-cont").children(".prop")[2]).val()+".json";;
                $.getJSON(url)
                    .done(function(d){
                        if(!d.characters){
                            alert("This file is not a battle or battleScene!");
                            return;      
                        }
                        $("#full-screen-hider").trigger("click");
                        $("#event-chars-cont").empty();
                        Q("CharacterSprite").each(function(){
                            this.removeFromExistence();
                        });
                        for(var i=0;i<d.characters.length;i++){
                            var char = d.characters[i];
                            char.loc = DC.getNextEmpty(char.loc);
                            var charButton = DC.newCharacter(char);
                            $('#event-chars-cont').append(charButton);
                            var data = dataP.charFiles[char.file][char.group][char.handle];
                            Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:char.loc,dir:char.dir,ref:$(charButton).children(".character")}));
                        }
                        $(".character").last().trigger("click");
                    }
                );
            });
            $("#chars-cancel").click(function(){
                $("#full-screen-hider").trigger("click");
            });
        });
        $("#full-screen-hider").click(function(){
            $(this).hide();
            $("#load-chars-from-cont").remove();
        });
        
        var event = dataP.event;
        var map = event.map.split("/");
        $("#map-select-group").val(map[0]).trigger("change");
        $("#map-select-place").val(map[1]).trigger("change");
        startQuintusCanvas();
    };
    
    
    $(document).on("click",".minimize-icon, .minimizable",function(){
        var content = $(this).parent().children(".minimize");
        if($(content).css("display")==="none"){
            $(content).show();
            $(this).parent().children(".minimize-icon").text("-");
        } else {
            $(content).hide();
            $(this).parent().children(".minimize-icon").text("+");
        }
    });
    $(document).on("click",".minimize-icon-deep, .minimizable-deep",function(){
        var content = $(this).parent().parent().children(".minimize");
        if($(content).css("display")==="none"){
            $(content).show();
            $(this).parent().children(".minimize-icon-deep").text("-");
        } else {
            $(content).hide();
            $(this).parent().children(".minimize-icon-deep").text("+");
        }
    });
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    $(document).on("click",".remove-choice-deep",function(e){
        $(this).parent().parent().remove();
    });
});
    