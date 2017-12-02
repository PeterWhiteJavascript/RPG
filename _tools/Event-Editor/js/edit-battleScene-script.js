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
    Q.selectedLocs = [];
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
                    $("#event-chars-cont").empty();
                    Q.stageScene("map",0,{map:map,characters:characters});
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
            Q.toCharSelection();
            $(".character").last().trigger("click");
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
            $("#canvas-coordinates").first().text(locX+","+locY);
            $("#canvas-coordinates").first().attr("locX",locX);
            $("#canvas-coordinates").first().attr("locY",locY);
        });
        var dragged = false;
        Q.addViewport = function(stage){
            stage.add("viewport");
            var obj = Q.viewObj = stage.insert(new Q.UI.Container({w:Q.width,h:Q.height,type:Q.SPRITE_UI}));
            obj.p.x = obj.p.w/2;
            obj.p.y = obj.p.h/2;
            obj.drag = function(touch){
                if(this.p.x === touch.origX - touch.dx && this.p.y === touch.origY - touch.dy) return;
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
        
        Q.getSpriteByName = function(name){
            return Q("CharacterSprite").items.filter(function(char){ return char.p.handle+" "+char.p.uniqueId===name; })[0];
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
        Q.matchChars = function(a,b){
            if(!a||!b) return false;
            return a.p.handle===b.p.handle&&a.p.uniqueId===b.p.uniqueId;
        };
        Q.toCharSelection = function(){
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
                var pos = Q.getXY(this.p.loc);
                this.p.x = pos.x;
                this.p.y = pos.y;
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
                    if(this.p.loc[0]<0||this.p.loc[0]>Q.stage(0).mapWidth||this.p.loc[1]<0||this.p.loc[1]>Q.stage(0).mapHeight) [0,0];
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
                this.p.selectedBox = Q.stage(0).insert(new Q.SelectedSquare({loc:this.p.loc,fill:"white"}));
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
            Q.stageScene("map",0,{map:map,characters:event.characters});

            $("#prop-music .music-select").val(event.music).trigger("change");

            //Loop through script
            for(var i=0;i<event.script.length;i++){
                uic.createScriptGroup($("#script-groups"),event.script[i]);
            }
            $( ".sortable" ).sortable({
                axis: "y"
            });
            $( ".sortable" ).disableSelection();
            $(".UIC-choice-title-cont").children(".UIC-group-minimize").trigger("click");
        },{tmxImagePath:Q.options.imagePath.substring(3)});
    }
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
    function saveFile(){
        var data = FileSaver.getNewSaveFile();
            $.ajax({
                type:'POST',
                url:'save-battle.php',
                data:{data:JSON.stringify(data.file),name:uic.dataP.eventPointer.event,scene:uic.dataP.eventPointer.scene,type:uic.dataP.eventPointer.type},
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
            events:formatEvents(),
            scenes:formatScenes(),
            scopes:["Global","Scene"],
            vars:{
                Scene:GDATA.dataFiles["scenes-list.json"].Story.find(function(scene){return scene.name===GDATA.eventPointer.scene;}).vrs,
                Global:GDATA.dataFiles["global-vars.json"].vrs
            },
            officers:Object.keys(GDATA.dataFiles["officers.json"]),
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
                "Derived Stats":GDATA.dataFiles["character-generation.json"].derivedStats
            },
            sceneTypes:["Story","Flavour"],
            conditionalEquals:["==","!="],
            operators:["=","+=","-="],
            conditionals:["==","!=",">=","<="],
            eventPointer:GDATA.eventPointer,
            
            directions:["down","left","up","right"],
            speeds:["fast","medium","slow"],
            inOut:["out","in"],
            animations:["walking","attacking","countering","lift","lifted","hurt","dying","fainting","dead","levelingUp"]
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
                var cont = $("<div id='load-chars-from-cont'><span class='full-width'>Load From File</span></div>");
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
        scriptFuncs:["text","centerViewChar","centerViewLoc","moveAlong","changeDir","modDialogueBox","waitTime","fadeChar","changeMusic","playSound","playAnim"],
        scriptProps:function(func,props){
            var cont = $("<div class='UIC-group-item-props'></div>");
            func = func || "moveAlong";
            switch(func){
                case "text":
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
                case "centerViewChar":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],1000];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Input("Spd(ms)",props[1],"number",0));
                    break;
                case "centerViewLoc":
                    props = props || [0,0,1000];
                    cont.append(this.Input("LocX",props[0],"number",0));
                    cont.append(this.Input("LocY",props[1],"number",0));
                    cont.append(this.Input("Spd(ms)",props[2],"number",0));
                    break;
                case "moveAlong":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],uic.dataP.directions[0],true,"[]"];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Select("Dir",uic.dataP.directions,props[1]));
                    cont.append(this.Checkbox("On Arrival",props[2]));
                    var moveLocs = JSON.parse(props[3]);
                    var moveCont = $(this.Container("Move Path",moveLocs));
                    cont.append(moveCont);
                    for(var i=0;i<moveLocs.length;i++){
                        var loc = moveLocs[i];
                        $(moveCont).append("<div class='loc-display' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</div>");
                    }
                    break;
                case "changeDir":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],"down"];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Select("Dir",uic.dataP.directions,props[1]));
                    break;
                case "modDialogueBox":
                    props = props || [true];
                    cont.append(this.Checkbox("Show",props[0]));
                    break;
                case "waitTime":
                    props = props || [1000];
                    cont.append(this.Input("Wait(ms)",props[0],"number",0));
                    break;
                case "fadeChar":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],"out",1000];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Select("InOut",uic.dataP.inOut,props[1]));
                    cont.append(this.Input("Spd(ms)",props[2],"number"));
                    break;
                case "changeMusic":
                    props = props || [GDATA.musicFileNames[0]];
                    cont.append(this.Select("Music",GDATA.musicFileNames,props[0]));
                    cont.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/bgm/'+props[0]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                    this.linkSelectToSrc($(cont).children("select")[0],$(cont).children("audio")[0],"../../audio/bgm/");
                    break;
                case "playSound":
                    props = props || [GDATA.soundFileNames[0]];
                    cont.append(this.Select("Sound",GDATA.soundFileNames,props[0]));
                    cont.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/sfx/'+props[0]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                    this.linkSelectToSrc($(cont).children("select")[0],$(cont).children("audio")[0],"../../audio/sfx/");
                    break;
                case "changeMoveSpeed":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],300];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Input("Spd(ms)",props[1],"number",0));
                    break;
                case "playAnim":
                    var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                    props = props || [chars[0],"attacking","down",GDATA.soundFileNames[0]];
                    cont.append(this.Select("Char",chars,props[0],"char"));
                    cont.append(this.Select("Anim",uic.dataP.animations,props[1]));
                    cont.append("<div class='play-anim full-width'>Play Anim</div>");
                    cont.append(this.Select("Dir",uic.dataP.directions,props[2]));
                    cont.append(this.Select("Sound",GDATA.soundFileNames,props[3]));
                    cont.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/sfx/'+props[3]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                    this.linkSelectToSrc($(cont).children("select")[3],$(cont).children("audio")[0],"../../audio/sfx/");
                    $(cont).children(".play-anim").on("click",function(){
                        var char = Q.getSpriteByName($($(this).siblings("select")[0]).val());
                        var dir =  $($(this).siblings("select")[2]).val();
                        var anim = $($(this).siblings("select")[1]).val();
                        if(anim==="levelingUp"){
                            char.play("levelingUp");
                        } else {
                            char.play(anim+dir);
                        }
                        char.on("animLoop."+char.p.animation,function(){char.play("standing"+char.p.dir);char.off("animLoop."+char.p.animation);});
                        $(this).siblings("audio")[0].currentTime = 0;
                        $(this).siblings("audio")[0].play();
                    });
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
                return $("<div class='character-cont'><span class='character selectable "+char.handle+"' handle='"+char.handle+"' uniqueId='"+char.uniqueId+"' dir='"+char.dir+"' locX='"+char.loc[0]+"' locY='"+char.loc[1]+"' file='"+char.file+"' group='"+char.group+"'>"+char.handle+" ("+char.uniqueId+")"+"</span><span class='group-text char-remove'>x</span></div>");
            },
            checkSelectedLoc:function(loc){
                for(var i=0;i<Q.selectedLocs.length;i++){
                    if(Q.selectedLocs[i].p.loc[0]===loc[0]&&Q.selectedLocs[i].p.loc[1]===loc[1]){
                        var cont = Q.selectedLocs[0].p.cont;
                        $("#move-locations").children("div:nth-child("+(i+1)+")").remove();
                        $(Q.selectedLocs[i].p.cont).children(".loc-display").each(function(){
                            var locX = $(this).attr("locX");
                            var locY = $(this).attr("locY");
                            if(locX==loc[0]&&locY==loc[1]) $(this).remove();
                        });
                        Q.selectedLocs[i].destroy();
                        Q.selectedLocs.splice(i,1);
                        //Change any of the next Q.selectedLocs's labels
                        for(var j=i;j<Q.selectedLocs.length;j++){
                            Q.selectedLocs[j].p.number.p.label = ""+(j+1);
                        }

                        $(cont).attr("data",JSON.stringify(Q.selectedLocs.map(function(o){return [o.p.loc[0],o.p.loc[1]];})));
                        return true;
                    }
                }
            },
            updateCharSelects:function(){
                var chars = FileSaver.getCharacters().map(function(c){return c[2]+" "+c[3];});
                var opts = uic.getOptions(chars);
                $(".char").empty().append(opts); 
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
            getNewSaveFile:function(){
                var finished = [$("#prop-finished").children(".scene-type").val(),$("#prop-finished").children(".scene-name").val(),$("#prop-finished").children(".event-name").val()];
                return {
                    file:{
                        name:FileSaver.event.name,
                        kind:"battleScene",
                        map:$("#map-select-group").val()+"/"+$("#map-select-place").val(),
                        music:$("#prop-music .music-select").val(),
                        script:uic.getSaveScript($("#script-groups")),
                        characters:FileSaver.getCharacters(),
                        finished:finished,
                        viewLoc:[parseInt($("#prop-initial-view").children("input").first().val()),parseInt($("#prop-initial-view").children("input").last().val())]
                    },
                    eventRefs:[finished],
                    sceneVarRefs:[],
                    globalVarRefs:[]
                };
            }
        };
        
        uic.linkSelectToSrc($("#prop-music").children(".music-select"),$("#prop-music").children("audio"),"../../audio/bgm/");
        //Fill the char-files container with the files. This only needs to be done once at runtime as it will not change until the page is refreshed after a new character file has been created.
        var fileNames = Object.keys(uic.dataP.charFiles);
        var cont = $("#char-files");
        for(var i=0;i<fileNames.length;i++){
            var groups = Object.keys(uic.dataP.charFiles[fileNames[i]]);
            $(cont).append('<div class="file-groups"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+fileNames[i]+'</span><div class="groups minimize"></div></div>');
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(uic.dataP.charFiles[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+groups[j]+'</span><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = uic.dataP.charFiles[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }
        $(document).on("click","#add-group",function(){
            uic.createScriptGroup($("#script-groups"));
        });
        /* start initial props code */
        
        uic.linkSelects($("#map-select-group"),$("#map-select-place"),GDATA.mapFileNames);
        $("#map-select-group").append(uic.getOptions(Object.keys(GDATA.mapFileNames)));
        $("#map-select-group").trigger("change");
        
        $("#prop-initial-view").children("input").first().val(FileSaver.event.viewLoc[0]);
        $("#prop-initial-view").children("input").last().val(FileSaver.event.viewLoc[1]);
        
        $(".music-select").append(uic.getOptions(GDATA.musicFileNames));
        
        uic.linkSelects($("#prop-finished").children(".scene-type"),$("#prop-finished").children(".scene-name"),uic.dataP.scenes);
        $("#prop-finished").children(".scene-type").append(uic.getOptions(uic.dataP.sceneTypes));
        uic.linkSelects($("#prop-finished").children(".scene-name"),$("#prop-finished").children(".event-name"),uic.dataP.events,[$("#prop-finished").children(".scene-type")]);
        $("#prop-finished").children(".scene-type").val(FileSaver.event.finished[0]);
        $("#prop-finished").children(".scene-type").trigger("change");
        $("#prop-finished").children(".scene-name").val(FileSaver.event.finished[1]);
        $("#prop-finished").children(".scene-name").trigger("change");
        $("#prop-finished").children(".event-name").val(FileSaver.event.finished[2]);
        
        /* end initial props code */

        function toggleSelected(sel){
            if(Q.selectedLocs.length){
                var locs = [];
                for(var i=0;i<Q.selectedLocs.length;i++){
                    locs.push([Q.selectedLocs[i].p.loc[0],Q.selectedLocs[i].p.loc[1]]);
                }
                if(Q.selectedLocs[0].p.cont) $(Q.selectedLocs[0].p.cont).attr("data",JSON.stringify(locs));
                for(var i=Q.selectedLocs.length-1;i>=0;i--){
                    Q.selectedLocs[i].destroy();
                }
                Q.selectedLocs = [];
            }
            //Stop selecting that character
            if(Q.selectedCharacter){
                Q.selectedCharacter.destroySelectedBox();
                Q.selectedCharacter.off("step",Q.selectedCharacter,"setDir");
            }
            
            $(".selected").removeClass("selected");
            $(sel).toggleClass("selected");
            Q.stage(0).off("selectedCharacter");
            Q.stage(0).off("selectedLocation");
            
        };
        $(document).on("click",".character",function(){
            toggleSelected(this);
            Q.toCharSelection();
            Q.selectedCharacter = Q.getSpriteAt([parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))]);
            Q.selectedCharacter.createSelectedBox();
            Q.selectedCharacter.on("step",Q.selectedCharacter,"setDir");
            
        });
        $(document).on("click",".UIC-group-item",function(){
            toggleSelected(this);
            //Any funcs that use selectedCharacter or selectedLocation
            var func = $(this).children(".UIC-group-item-top").children(".UIC-func-cont").children(".UIC-func").val();
            switch(func){
                case "centerViewLoc":
                    uic.linkSelectedLocToInputs($(this).children(".UIC-group-item-props").children(".UIC-prop")[0],$(this).children(".UIC-group-item-props").children(".UIC-prop")[1]);
                    break;
                case "changeMoveSpeed":
                case "playAnim":
                case "changeDir":
                case "fadeChar":
                case "centerViewChar":
                    uic.linkSelectedCharToSelect($(this).children(".UIC-group-item-props").children(".UIC-prop")[0]);
                    break;
                case "moveAlong":
                    uic.linkSelectedCharToSelect($(this).children(".UIC-group-item-props").children(".UIC-prop")[0]);
                    var locsCont = $(this).children(".UIC-group-item-props").children(".UIC-container");
                    Q.stage(0).on("selectedLocation",function(loc){
                        if(DC.checkSelectedLoc(loc)) return;
                        Q.selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:loc,num:Q.selectedLocs.length+1,cont:locsCont})));
                        $(locsCont).attr("data",JSON.stringify(Q.selectedLocs.map(function(o){return [o.p.loc[0],o.p.loc[1]];})));
                        $(locsCont).append("<div class='loc-display' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</div>");
                    });
                    var locs = JSON.parse($(locsCont).attr("data"));
                    for(var i=0;i<locs.length;i++){
                        Q.selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:locs[i],num:Q.selectedLocs.length+1,cont:locsCont})));
                    }
                    break;
            }
        });

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
                if(Q.selectedCharacter) Q.selectedCharacter.confirmPlacement();
                var char = JSON.parse($(ui.draggable).attr("data"));
                char.uniqueId = DC.genUniqueId(char.handle);
                char.loc = DC.getNextEmpty([0,0]);
                char.dir = "down";
                var charButton = DC.newCharacter(char);
                $(this).append(charButton);
                var data = uic.dataP.charFiles[char.file][char.group][char.handle];
                var character = Q.stage(0).insert(new Q.CharacterSprite({sheet:data.charClass.toLowerCase(),file:char.file,handle:char.handle,uniqueId:char.uniqueId,loc:char.loc,dir:char.dir,ref:$(charButton).children(".character")}));
                $(charButton).children(".character").trigger("click");
                Q.stage(0).trigger("selectedCharacter",character);
                
                DC.updateCharSelects();
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
    