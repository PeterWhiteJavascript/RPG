$(function(){
    var DC = {};
    var FileSaver = {};
    var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Music, Animations")
        .setup({development: true, width:$(document).width()/2,height:$(document).height()-60})
        .touch().controls(true)
        .enableSound();
    Q.options.imagePath = "../../images/";
    Q.options.audioPath = "../.././audio/";
    Q.options.dataPath = ".././data/";

    Q.tileW = 32;
    Q.tileH = 32;
    Q.SPRITE_CHARACTER  = 8;
    
    Q.UI.Text.prototype.wrapLabel = function(label,maxWidth){
        var ctx = Q.ctx;
        var split = label.split(' ');
        var newLabel = '';
        var tempLabel = '';
        var spaceWidth = ctx.measureText(" ").width;
        var spaces = 0;
        //Loop through the array of the split label
        for(var i=0;i<split.length;i++){
            //Run regex to get rid of extra line breaks (Optimally, the logic could be improved to not need this)
            //This is only needed for the streaming text for Dialogue. Maybe the label for that should be saved before this modification or something
            split[i] = split[i].replace(/(\r\n|\n|\r)/gm,"");
            //The upcoming width for this word
            var nextWidth = split[i]?ctx.measureText(split[i]).width:0;
            for(var j=0;j<split[i].length;j++){
                var measured = ctx.measureText(tempLabel);
                //Move to a new line
                if(measured.width+nextWidth+spaceWidth*spaces>=maxWidth){
                    newLabel+="\n";
                    tempLabel = '';
                    spaces = 0;
                } else {
                    tempLabel+=split[i][j];
                }
            }
            newLabel+=split[i];
            if(i!==split.length-1){
                newLabel+=" ";
            }
            spaces++;
        }
        return newLabel;
    };
    
    Q.allowSpriteSelecting = true;
    Q.selectedCharacter = false;
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
                var charData = characters[i];
                var char = {file:charData[0],group:charData[1],handle:charData[2],uniqueId:charData[3],loc:[charData[4][0],charData[4][1]],dir:charData[5]};
                var charButton = DC.newCharacter(char);
                $('#event-chars-cont').append(charButton);
                var data = uic.dataP.charFiles[char.file][char.group][char.handle];
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
            if(Q.allowSpriteSelecting){
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
                Q.selectedCharacter.confirmPlacement();
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
            if(Q.matchChars(Q.selectedCharacter,char)){
                Q.selectedCharacter.destroySelectedBox();
                Q.selectedCharacter.off("step",Q.selectedCharacter,"setDir");
            }
            char.removeFromExistence();
            $(this).parent().remove();
            DC.updateCharSelects();
        });
        $(document).on("click",".character",function(){
            $(".character.selected").removeClass("selected");
            $(this).addClass("selected");
            if(Q.selectedCharacter){
                Q.selectedCharacter.destroySelectedBox();
                Q.selectedCharacter.off("step",Q.selectedCharacter,"setDir");
            }
            Q.selectedCharacter = Q.getSpriteAt([parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))]);
            Q.selectedCharacter.createSelectedBox();
            Q.selectedCharacter.on("step",Q.selectedCharacter,"setDir");
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
                if(Q.selectedCharacter&&Q.matchChars(Q.selectedCharacter,obj)){
                    Q.selectedCharacter.destroySelectedBox();
                    Q.selectedCharacter.unconfirmPlacement();
                    Q.selectedCharacter.allowPlacement();
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
                    Q.allowSpriteSelecting = true;
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
                if(Q.selectedCharacter===this&&Q.locSelectedBox) Q.locSelectedBox.destroy();
                if(!isNaN(this.p.loc[0])&&!isNaN(this.p.loc[1])) this.unconfirmPlacement();
                this.destroy();
            },
            allowPlacement:function(){
                Q.allowSpriteSelecting = false;
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
            var event = FileSaver.event;
            Q.stageScene("map",0,{map:map,characters:event.characters,placementSquares:event.placementSquares});

            $("#prop-music .music-select").val(event.music).trigger("change");
            $("#prop-maxAllies input").val(event.maxAllies);
            function setUpEndBattle(which){
                $("#prop-"+which+" .scene-type").val(event[which] ? event[which].next[0] : GDATA.eventPointer.type).trigger("change");
                $("#prop-"+which+" .scene-name").val(event[which] ? event[which].next[1] : GDATA.eventPointer.scene).trigger("change");
                $("#prop-"+which+" .event-name").val(event[which] ? event[which].next[2] : GDATA.eventPointer.event);
                for(var i=0;i<event[which].events.length;i++){
                    uic.createCondEffectsGroup($("#prop-"+which).children(".cond-groups"),event[which].events[i]);
                }
            }
            setUpEndBattle("victory");
            setUpEndBattle("defeat");
            for(var i=0;i<event.events.length;i++){
                uic.createCondEffectsGroup($("#cond-groups-cont").children(".cond-groups"),event.events[i]);
            }
        },{tmxImagePath:Q.options.imagePath.substring(3)});
    }
    function saveFile(){
        var data = FileSaver.getSaveFile();
        $.ajax({
            type:'POST',
            url:'save-battleScene-script.php',
            data:{file:JSON.stringify(data.file),name:uic.dataP.eventPointer.event,scene:uic.dataP.eventPointer.scene,type:uic.dataP.eventPointer.type},
            dataType:'json'
        })
        .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
        .fail(function(data){console.log(data)});

        if(uic.dataP.eventPointer.type==="Story"){
            $.ajax({
                type:'POST',
                url:'save-event-references.php',
                data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:uic.dataP.eventPointer.event,scene:uic.dataP.eventPointer.scene},
                dataType:'json'
            })
            .done(function(data){console.log(data)})
            .fail(function(data){console.log(data)});
        }
    };
    
    var uic = new UIC({
        dataP:{
            events:GDATA.events,
            scenes:GDATA.scenes,
            scopes:["Global","Scene"],
            vars:{
                Scene:GDATA.dataFiles["scenes-list.json"].Story.find(function(scene){return scene.name===GDATA.eventPointer.scene;}).vrs,
                Global:GDATA.dataFiles["global-vars.json"].vrs
            },
            officers:Object.keys(GDATA.characterFiles["Officers.json"]["Officers"]),
            charFiles:GDATA.characterFiles,
            charPropTypes:["nationality","charClass","value","methodology","personality","gender"],
            charPropValues:{
                nationality:GDATA.dataFiles["character-generation.json"].nationalities,
                charClass:GDATA.dataFiles["character-generation.json"].classNames,
                value:GDATA.dataFiles["character-generation.json"].values,
                methodology:GDATA.dataFiles["character-generation.json"].methodologies,
                personality:GDATA.dataFiles["character-generation.json"].personalityNames,
                gender:GDATA.dataFiles["character-generation.json"].genders
            },
            charStatProps:["Base Stats","Derived Stats"],
            charStatValues:{
                "Base Stats":GDATA.dataFiles["character-generation.json"].statNames,
                "Derived Stats":GDATA.dataFiles["character-generation.json"].combatStats
            },
            sceneTypes:["Story","Flavour"],
            conditionalEquals:["==","!="],
            operators:["=","+=","-="],
            conditionals:["==","!=",">=","<="],
            eventPointer:GDATA.eventPointer,
            
            directions:["down","left","up","right"],
            speeds:["fast","medium","slow"],
            inOut:["out","in"],
            animations:["walking","attacking","countering","lift","lifted","hurt","dying","fainting","dead","levelingUp"],
            charHealth:["deadOrFainted","dead","fainted","fullHealth","takenDamage","belowHalfHealth"]
        },
        topBarProps:{
            "0,0":function(){
                //Doesn't do anything since it's here just to show the location that the mouse is at on the canvas.
            },
            Save:function(){
                saveFile();
            },
            Test:function(){
                window.onbeforeunload = null;
                saveFile();
                $.redirect('../../index.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type, testing:true});
            },
            "Load Chars":function(){
                if($("#load-chars-from-cont").length) return;
                $("#full-screen-hider").show();
                var cont = $("<div id='load-chars-from-cont'><span class='full-width load-chars-title'>Load From File</span></div>");
                var scType = uic.Select("Type",uic.dataP.sceneTypes,uic.dataP.eventPointer.type);
                var scName = uic.Select("Scene",uic.dataP.scenes[uic.dataP.eventPointer.type],uic.dataP.eventPointer.scene);
                var evName = uic.Select("Event",uic.dataP.events[uic.dataP.eventPointer.type][uic.dataP.eventPointer.scene],uic.dataP.eventPointer.event);
                $(cont).append(scType);
                $(cont).append(scName);
                $(cont).append(evName);
                uic.selectInitialValue(cont);
                uic.linkSelects($(cont).children(".UIC-prop")[0],$(cont).children(".UIC-prop")[1],uic.dataP.scenes);
                uic.linkSelects($(cont).children(".UIC-prop")[1],$(cont).children(".UIC-prop")[2],uic.dataP.events,[$(cont).children(".UIC-prop")[0]]);

                $(cont).append("<div id='load-chars-buttons'><span id='load-chars'>LOAD</span><span id='chars-cancel'>CANCEL</span></div>");
                $("#editor-content").append(cont);
                $("#load-chars").click(function(){
                    var url = "../../data/json/story/events/"+$($("#load-chars-from-cont").children(".UIC-prop")[0]).val()+"/"+$($("#load-chars-from-cont").children(".UIC-prop")[1]).val()+"/"+$($("#load-chars-from-cont").children(".UIC-prop")[2]).val()+".json";;
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
                                var charData = d.characters[i];
                                var char = {file:charData[0],group:charData[1],handle:charData[2],uniqueId:charData[3],loc:[charData[4][0],charData[4][1]],dir:charData[5]};
                                char.loc = DC.getNextEmpty(char.loc);
                                var charButton = DC.newCharacter(char);
                                $('#event-chars-cont').append(charButton);
                                var data = uic.dataP.charFiles[char.file][char.group][char.handle];
                                Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:char.loc,dir:char.dir,ref:$(charButton).children(".character")}));
                            }
                            $(".character").last().trigger("click");
                        }
                    );
                });
                $("#chars-cancel").click(function(){
                    $("#full-screen-hider").trigger("click");
                });
            },
            Back:function(){
                if(confirm("Are you sure you want to go back without saving?")){
                    var to = "show-events.php";
                    if(uic.dataP.eventPointer.type==="Flavour"){
                        to = "show-flavour.php";
                    }
                    $.redirect(to,  {'scene':uic.dataP.eventPointer.scene, 'event':uic.dataP.eventPointer.event, 'type':uic.dataP.eventPointer.type});
                }
            }
        },
        conditionsFuncs:["rounds","charHealth"],
        conditionProps:function(func,props){
            var cont = $("<div class='UIC-group-item-props'></div>");
            var dataP = this.dataP;
            func = func || "rounds";
            switch(func){
                case "rounds":
                    props = props || ["==",1,0];
                    cont.append(this.Select("Cond",dataP.conditionals,props[0]));
                    cont.append(this.Input("Round",props[1],"number",1));
                    cont.append(this.Input("Repeat",props[2],"number",0));
                    break;
                case "charHealth":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],dataP.charHealth[0]];
                    cont.append(this.Select("Char",chars,props[0]));
                    console.log(chars,props[0])
                    cont.append(this.Select("Prop",dataP.charHealth,props[1]));
                    break;
            }
            this.selectInitialValue(cont);
            return cont;
        },
        effectsFuncs:["setVar","spawnCharacter","showText","changeMusic"],
        effectProps:function(func,props){
            var cont = $("<div class='UIC-group-item-props'></div>");
            var dataP = this.dataP;
            func = func || "setVar";
            switch(func){
                case "setVar":
                    props = props || ["Global","money","+=",1000];
                    cont.append(this.Select("Scope",uic.dataP.scopes,props[0],"var-scope"));
                    cont.append(this.Select("Name",uic.dataP.vars[props[0]],props[1],"var-handle"));
                    uic.linkSelects($(cont).children(".prop")[0],$(cont).children(".prop")[1],dataP.vars);
                    cont.append(this.Select("Opr",uic.dataP.operators,decodeURIComponent(props[2])));
                    cont.append(this.Input("Value",props[3],"text"));

                    break;
                case "spawnCharacter":
                    props = props || ["Officers.json","Officers","Alex",3,0,"down"];
                    var files = Object.keys(uic.dataP.charFiles);
                    var groups = Object.keys(uic.dataP.charFiles[props[0]]);
                    var chars = Object.keys(uic.dataP.charFiles[props[0]][props[1]]);
                    cont.append(this.Select("File",files,props[0]));
                    cont.append(this.Select("Group",groups,props[1]));
                    uic.linkSelects($(cont).children(".prop")[0],$(cont).children(".prop")[1],uic.dataP.charFiles);
                    cont.append(this.Select("Char",chars,props[2]));
                    uic.linkSelects($(cont).children(".prop")[1],$(cont).children(".prop")[2],uic.dataP.charFiles,[$(cont).children(".prop")[0]]);
                    cont.append(this.Input("X Loc",props[3],"number",0));
                    cont.append(this.Input("Y Loc",props[4],"number",0));
                    cont.append(this.Select("Dir",uic.dataP.directions,props[5]));
                    break;
                case "showText":
                    props = props || ["empty.png","empty.png","",false,0,false];

                    cont.append(this.Select("<-Img",GDATA.imageAssets,props[0]));
                    cont.append("<div class='img-div'><img src='../../images/story/"+props[0]+"'></div>");
                    this.linkSelectToSrc($(cont).children("select")[0],$(cont).children("div").first().children("img")[0],"../../images/story/");
                    cont.append("<div class='img-div'><img src='../../images/story/"+props[1]+"'></div>");
                    cont.append(this.Select("Img->",GDATA.imageAssets,props[1]));
                    this.linkSelectToSrc($(cont).children("select")[1],$(cont).children("div").last().children("img")[0],"../../images/story/");

                    cont.append(this.TextArea("Text",props[2]));

                    cont.append(this.Checkbox("Invert Text",props[3]));
                    cont.append(this.Input("Cyc(ms)",props[4],"number",0));
                    cont.append(this.Checkbox("NoCycle",props[5]));
                    break;
                case "changeMusic":
                    props = props || ["battle.mp3"];
                    cont.append(this.Select("Music",GDATA.musicFileNames,props[0]));
                    cont.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/bgm/'+props[0]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                    this.linkSelectToSrc($(cont).children("select")[0],$(cont).children("audio")[0],"../../audio/bgm/");
                    break;
            }
            this.selectInitialValue(cont);
            return cont;
        }
    });
    var start = function(){
        uic.createTopMenu($("#editor-content"));
        $(".bar-button").first().attr("id","canvas-coordinates");
        DC = {
            newCharacter:function(char){
                return $("<div class='character-cont'><span class='character selectable "+char.handle+"' uniqueId='"+char.uniqueId+"' dir='"+char.dir+"' locX='"+char.loc[0]+"' locY='"+char.loc[1]+"' file='"+char.file+"' group='"+char.group+"' handle='"+char.handle+"'>"+char.handle+" ("+char.uniqueId+")"+"</span><span class='remove-choice group-text char-remove'>x</span></div>");
            },
            
            updateCharSelects:function(){
                var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                var opts = uic.getOptions(chars);
                $(".char").empty().append(opts); 
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
            }
        };
        FileSaver = {
            event:GDATA.event,
            getCharacters:function(){
                var chars = [];
                $(".character").each(function(){
                    var char = $(this);
                    chars.push([
                        char.attr("file"),
                        char.attr("group"),
                        char.attr("handle"),
                        uic.processValue(char.attr("uniqueId")),
                        [uic.processValue(char.attr("locX")),uic.processValue(char.attr("locY"))],
                        char.attr("dir")
                    ]);
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
            getSaveFile:function(){
                var varRefs = FileSaver.getVarRefs();
                return {
                    file:{
                        name:FileSaver.event.name,
                        kind:"battle",
                        map:$("#map-select-group").val()+"/"+$("#map-select-place").val(),
                        music:$("#prop-music .music-select").val(),
                        defaultDir:$("#dir-select").val(),
                        placementSquares:FileSaver.getPlacementSquares(),
                        maxAllies:uic.processValue($("#prop-maxAllies input").val()),
                        victory:{
                            events:uic.getSaveGroups($("#prop-victory").children(".cond-groups")),
                            next:[$("#prop-victory .scene-type").val(),$("#prop-victory .scene-name").val(),$("#prop-victory .event-name").val()]
                        },
                        defeat:{
                            events:uic.getSaveGroups($("#prop-defeat").children(".cond-groups")),
                            next:[$("#prop-defeat .scene-type").val(),$("#prop-defeat .scene-name").val(),$("#prop-defeat .event-name").val()]
                        },
                        events:uic.getSaveGroups($("#cond-groups-cont").children(".cond-groups")),
                        characters:FileSaver.getCharacters()
                    },
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
        var fileNames = Object.keys(uic.dataP.charFiles);
        var cont = $("#char-files");
        for(var i=0;i<fileNames.length;i++){
            var groups = Object.keys(uic.dataP.charFiles[fileNames[i]]);
            $(cont).append('<div class="file-groups"><div class="file-group-title-cont"><span class="minimize-icon group-text">-</span><span class="title-text minimizable group-text">'+fileNames[i]+'</span></div><div class="groups minimize"></div></div>');
            
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(uic.dataP.charFiles[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><div class="file-group-title-cont"><span class="minimize-icon group-text">-</span><span class="title-text minimizable group-text">'+groups[j]+'</span></div><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = uic.dataP.charFiles[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }
        
        $(document).on("click",".file-group-title-cont",function(){
            var text = $(this).children(".minimize-icon").text();
            if(text==="-"){
                $(this).parent().children(".minimize").hide();
                $(this).children(".minimize-icon").text("+");
            } else {
                $(this).parent().children(".minimize").show();
                $(this).children(".minimize-icon").text("-");
            }
        });
        $("#char-files").children(".file-groups").children(".file-group-title-cont").trigger("click");
        $(document).on("click",".add-group",function(){
            uic.createCondEffectsGroup($(this).parent().siblings(".cond-groups")); 
        });

        
        uic.linkSelects($("#map-select-group"),$("#map-select-place"),GDATA.mapFileNames);
        $("#map-select-group").append(uic.getOptions(Object.keys(GDATA.mapFileNames)));
        $("#map-select-group").trigger("change");
        $(".music-select").append(uic.getOptions(GDATA.musicFileNames));
        
        $("#dir-select").append(uic.getOptions(["up","right","down","left"]));
        
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
        uic.linkSelects($("#prop-victory").children(".scene-type"),$("#prop-victory").children(".scene-name"),uic.dataP.scenes);
        $("#prop-victory").children(".scene-type").append(uic.getOptions(uic.dataP.sceneTypes));
        uic.linkSelects($("#prop-victory").children(".scene-name"),$("#prop-victory").children(".event-name"),uic.dataP.events,[$("#prop-victory").children(".scene-type")]);
        $("#prop-victory").children(".scene-type").trigger("change");
        $("#prop-victory").children(".scene-name").trigger("change");
        
        uic.linkSelects($("#prop-defeat").children(".scene-type"),$("#prop-defeat").children(".scene-name"),uic.dataP.scenes);
        $("#prop-defeat").children(".scene-type").append(uic.getOptions(uic.dataP.sceneTypes));
        uic.linkSelects($("#prop-defeat").children(".scene-name"),$("#prop-defeat").children(".event-name"),uic.dataP.events,[$("#prop-defeat").children(".scene-type")]);
        $("#prop-defeat").children(".scene-type").trigger("change");
        $("#prop-defeat").children(".scene-name").trigger("change");
        /* end initial props code */


        $(".music-select").trigger("change");
        $(".file-groups").children(".minimize-icon").trigger("click");
        
        
        $('.file-character').draggable({
            cursorAt: { top: 10, left: -10 },
            helper: "clone",
            appendTo: "body"
        });
        function dropChar(ui, loc){
            if(Q.selectedCharacter) Q.selectedCharacter.confirmPlacement();
            var char = JSON.parse($(ui.draggable).attr("data"));
            char.uniqueId = DC.genUniqueId(char.handle);
            char.loc = loc ? DC.getNextEmpty(loc) : DC.getNextEmpty([0,0]);
            char.dir = "down";
            var charButton = DC.newCharacter(char);
            $('#event-chars-cont').append(charButton);
            var data = uic.dataP.charFiles[char.file][char.group][char.handle];
            var character = Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:char.loc,dir:char.dir,ref:$(charButton).children(".character")}));
            if(!loc){
                $(charButton).children(".character").trigger("click");
            }
            Q.stage(0).trigger("selectedCharacter",character);
        };
        $("#quintus_container").droppable({
            accept:".file-character",
            drop:function(event,ui){
                var loc = [parseInt($("#canvas-coordinates").attr("locx")),parseInt($("#canvas-coordinates").attr("locy"))];
                dropChar(ui, loc);
            }
        });
        $('#event-chars-cont').droppable({
            accept:".file-character",
            //Create a character element
            drop:function(event,ui){
                dropChar(ui);
            }
        });
        $("#full-screen-hider").click(function(){
            $(this).hide();
            $("#load-chars-from-cont").remove();
        });
        
        var event = FileSaver.event;
        var map = event.map.split("/");
        $("#map-select-group").val(map[0]).trigger("change");
        $("#map-select-place").val(map[1]).trigger("change");
        startQuintusCanvas();
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
});
    