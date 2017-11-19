$(function(){
    var DC = {};
    var FileSaver = {};
    var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Music")
        .setup({development: true, width:$(document).width()/2-9,height:$(document).height()-60})
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

    Q.state.set("options",{
        musicEnabled:true,
        soundEnabled:true
    });
    var allowSpriteSelecting = true;
    var selectedCharacter = false;
    var selectedLocs = [];
    function startQuintusCanvas(){
        //Sprites
        var toSheet= [
            ['archer','archer.png',24,24,0,0,192,72],
            ['assassin','assassin.png',24,24,0,0,192,72],
            ['berserker','berserker.png',24,24,0,0,192,72],
            ['elementalist','elementalist.png',24,24,0,0,192,72],
            ['healer','healer.png',24,24,0,0,192,72],
            ['illusionist','illusionist.png',24,24,0,0,192,72],
            ['legionnaire','legionnaire.png',24,24,0,0,192,72],
            ['skirmisher','skirmisher.png',24,24,0,0,192,72],
            ['vanguard','vanguard.png',24,24,0,0,192,72]
        ];
        for(j=0;j<toSheet.length;j++){
            Q.sheet(toSheet[j][0],
            "sprites/"+toSheet[j][1],
            {
               tilew:toSheet[j][2],
               tileh:toSheet[j][3],
               sx:toSheet[j][4],
               sy:toSheet[j][5],
               w:toSheet[j][6],
               h:toSheet[j][7]
            });
        };
        var standRate = 1/3;
        var walkRate = 1/6;
        var supafAst = 1/12;
        var tooFast = 1/24;
        Q.animations("Character", {
            standingup:{ frames: [0,1], rate:standRate},
            walkingup:{ frames: [0,1], rate:walkRate},
            attackingup:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
            missedup:{frames:[0,2,6,4],rate:supafAst,loop:false,trigger:"doneMissed"},
            counteringup:{frames:[0,2,6,4],rate:supafAst,loop:false,trigger:"doneCounter"},
            liftup:{frames:[0,0,0],rate:standRate},
            liftedup:{frames:[6],rate:standRate},
            hurtup:{frames:[1],rate:standRate},
            dyingup:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneDying"},
            faintingup:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneFainting"},
            deadup:{frames:[0],rate:standRate},

            standingright:{ frames: [2,3], rate:standRate},
            walkingright:{ frames: [2,3], rate:walkRate},
            attackingright:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
            missedright:{frames:[2,6,4,0],rate:supafAst,loop:false,trigger:"doneMissed"},
            counteringright:{frames:[2,6,4,0],rate:supafAst,loop:false,trigger:"doneCounter"},
            liftright:{frames:[2,2,2],rate:standRate},
            liftedright:{frames:[6],rate:standRate},
            hurtright:{frames:[3],rate:standRate},
            dyingright:{frames:[2,6,4,0],rate:walkRate,loop:false,trigger:"doneDying"},
            faintingright:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneFainting"},
            deadright:{frames:[2],rate:standRate},

            standingleft:{ frames: [4,5], rate:standRate},
            walkingleft:{ frames: [4,5], rate:walkRate},
            attackingleft:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
            missedleft:{frames:[6,4,0,2],rate:supafAst,loop:false,trigger:"doneMissed"},
            counteringleft:{frames:[6,4,0,2],rate:supafAst,loop:false,trigger:"doneCounter"},
            liftleft:{frames:[4,4,4],rate:standRate},
            liftedleft:{frames:[6],rate:standRate},
            hurtleft:{frames:[5],rate:standRate},
            dyingleft:{frames:[6,4,0,2],rate:walkRate,loop:false,trigger:"doneDying"},
            faintingleft:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneFainting"},
            deadleft:{frames:[4],rate:standRate},

            standingdown:{ frames: [6,7], rate:standRate},
            walkingdown:{ frames: [6,7], rate:walkRate},
            attackingdown:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
            misseddown:{frames:[4,0,2,6],rate:supafAst,loop:false,trigger:"doneMissed"},
            counteringdown:{frames:[4,0,2,6],rate:supafAst,loop:false,trigger:"doneCounter"},
            liftdown:{frames:[6,6,6],rate:standRate},
            lifteddown:{frames:[6],rate:standRate},
            hurtdown:{frames:[7],rate:standRate},
            dyingdown:{frames:[4,0,2,6],rate:walkRate,loop:false,trigger:"doneDying"},
            faintingdown:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneFainting"},
            deaddown:{frames:[6],rate:standRate},

            levelingUp:{frames:[4,0,2,6,4,0,2,6],rate:standRate,loop:false,trigger:"doneLevelingUp"}
        });

        Q.scene("map",function(stage){
            stage.finished = function(){};
            Q.stageTMX(stage.options.map, stage);
            Q.addViewport(stage);
            
            $("#map-select-place").on("change",function(){
                var map = "../../data/maps/"+$("#map-select-group").val()+"/"+$("#map-select-place").val();
                Q.loadTMX(map,function(){
                    Q.load("sfx/cannot_do.mp3",function(){
                        var characters = FileSaver.getCharacters();
                        $("#event-chars-cont").empty();
                        Q.stageScene("map",0,{map:map,characters:characters});
                    });
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
            if(Q.matchChars(selectedCharacter,char)){
                selectedCharacter.destroySelectedBox();
                selectedCharacter.off("step",selectedCharacter,"setDir");
            }
            char.removeFromExistence();
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
                if(Q.inputs['left']){
                    this.p.dir = 'left';
                } else if(Q.inputs['right']){
                    this.p.dir = 'right';
                } else if(Q.inputs['down']){
                    this.p.dir = 'down';
                } else if(Q.inputs['up']){
                    this.p.dir = 'up';
                }
                this.play("standing"+this.p.dir);
            },
            destroySelectedBox:function(){
                if(this.p.selectedBox) this.p.selectedBox.destroy();
            },
            createSelectedBox:function(){
                this.destroySelectedBox();
                this.p.selectedBox = Q.stage(0).insert(new Q.SelectedSquare({loc:this.p.loc,fill:"white"}));
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
            Q.load("sfx/cannot_do.mp3",function(){
                Q.stageScene("map",0,{map:map,characters:dataP.event.characters});
                
                //Using the file data, set up the page
                var event = dataP.event;
                $("#prop-music .music-select").val(event.music).trigger("change");
                
                //Loop through script
                for(var i=0;i<dataP.event.script.length;i++){
                    var group = dataP.event.script[i];
                    var groupCont = DC.getScriptItemGroup();
                    for(var j=0;j<group.length;j++){
                        var event = group[j];
                        var content = DC.getScriptItemFunc($("<div class='script-item-cont selectable'></div>"),event[0]);
                        content.append(DC.getScriptItem($("<div class='script-item minimize'></div>"),event[0],event[1]));
                        groupCont.children(".script-items-cont").append(content);
                        DC.selectInitialValue($(content));
                        DC.selectInitialValue($(content).children(".script-item"));
                        $(content).children(".func").on("change",function(){
                            $(this).next().nextAll().remove(); //After the 'x' remove all
                            $(this).siblings(".minimize-icon").text("-");
                            $(this).parent().append(DC.getScriptItem($("<div class='script-item minimize'></div>"),$(this).parent().children(".func").val()));
                        });
                    }
                    $("#script-item-box").children(".script-groups").append(groupCont);
                    $(groupCont).children(".script-item-group-top").children(".minimize-icon-deep").trigger("click");
                    $(groupCont).children(".script-items-cont").children(".script-item-cont").children(".minimize-icon").trigger("click");
                }
            });
        },{tmxImagePath:Q.options.imagePath.substring(3)});
    }
    
    var dataP = {
        mapFileNames:mapFileNames,
        mapFileGroups:Object.keys(mapFileNames),
        soundFileNames:soundFileNames,
        musicFileNames:musicFileNames,
        charFiles:characterFiles,
        imageAssets:imageAssets,
        sceneTypes:["Story","Flavour"],
        groupFuncs:["text","centerViewChar","centerViewLoc","moveAlong","changeDir","modDialogueBox","waitTime","fadeChar","changeMusic","playSound","changeMoveSpeed","playAnim","changeEvent"],
        scopes:["Global","Scene","Event"],
        conditionals:["==","!=",">=","<="],
        operators:["=","+=","-="],
        directions:["down","left","up","right"],
        speeds:["fast","medium","slow"],
        inOut:["out","in"],
        animations:["walking","attacking","countering","lift","lifted","hurt","dying","fainting","dead","levelup"]
        
    };
    var numOfFiles = 1 + dataFiles.length;
    var setJSONData = function(url,name){
        $.getJSON(url)
            .done(function(data){
                dataP[name] = data;
                numOfFiles--;
                if(numOfFiles<=0){
                    start();
                }
            }
        );
    };
    
    var formatScenes = function(){
        var story = dataP["scenes-list.json"];
        var flavour = dataP["flavour-events-list.json"];
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
        var story = dataP["scenes-list.json"];
        var flavour = dataP["flavour-events-list.json"];
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
    
    //Set the event
    setJSONData("../../data/json/story/events/"+sceneType+"/"+sceneName+"/"+eventName+".json","event");

    $.getJSON("../../data/json/story/global-vars.json",function(data){
        dataP["global-vars.json"] = data;
        //Set all of the data files
        dataFiles.forEach( function(f){ setJSONData("../../data/json/data/"+f,f); });
    });
    
    var start = function(){
        dataP.scenes = formatScenes();
        dataP.events = formatEvents();
        dataP.scene = dataP["scenes-list.json"].Story.find(function(sc){return sc.name===sceneName;});
        dataP.vrs = {Global:Object.keys(dataP["global-vars.json"].vrs),Scene:Object.keys(dataP.scene.vrs)};
        DC = {
            getScriptItemGroup:function(){
                return $(
                    '<div class="script-item-group">\n\
                        <div class="script-item-group-top">\n\
                            <span class="minimize-icon-deep group-text">-</span>\n\
                            <span class="add-script-item">Add Item</span>\n\
                            <span class="remove-choice-deep group-text">x</span>\n\
                        </div>\n\
                        <div class="script-items-cont minimize"></div>\n\
                    </div>');
            },
            groupMinimize:function(){
              return "<span class='minimize-icon group-text'>-</span>";  
            },
            groupTop:function(func){
                return "<select class='func eighty-width' initial-value='"+func+"'>"+DC.getOptString(dataP.groupFuncs)+"</select>";
            },
            groupRemove:function(){
                return "<span class='remove-choice group-text'>x</span>";
            },
            groupInput:function(text,val,type,min){
                return "<span class='quarter-width'>"+text+"</span><input class='prop three-quarter-width' value='"+val+"' type='"+type+"' min='"+min+"'>";
            },
            groupCheckbox:function(text,val){
                var box = $("<span class='three-quarter-width'>"+text+"</span><input class='prop quarter-width' type='checkbox'>");
                $(box).prop("checked",val);
                return box;
            },
            groupTextArea:function(text,val){
                return "<span class='full-width'>"+text+"</span><textarea class='prop full-width group-text-area'>"+val+"</textarea>";
            },
            groupContainer:function(text,data){
                return "<span class='full-width'>"+text+"</span><div class='prop full-width' data="+JSON.stringify(data)+"></div>";
            },
            groupSelect:function(text,opts,value,cl){
                return "<span class='quarter-width'>"+text+"</span><select class='prop three-quarter-width "+(cl?cl:'')+"' initial-value='"+value+"'>"+DC.getOptString(opts)+"</select>";
            },
            getScriptItemFunc:function(content,name){
                name = name || "text";
                content.append(DC.groupMinimize());
                content.append(DC.groupTop(name));
                content.append(DC.groupRemove());
                return content;
            },
            getScriptItem:function(content,name,props){
                name = name || "text";
                switch(name){
                    case "text":
                        props = props || ["","empty.png","empty.png",false,0,false];
                        content.append(this.groupTextArea("Text",props[0]));
                        content.append(this.groupSelect("<-Img",dataP.imageAssets,props[1]));
                        content.append("<div class='img-div'><img src='../../images/story/"+props[1]+"'></div>");
                        DC.linkSelectToSrc($(content).children("select")[0],$(content).children("div").first().children("img")[0],"../../images/story/");
                        content.append(this.groupSelect("Img->",dataP.imageAssets,props[2]));
                        content.append("<div class='img-div'><img src='../../images/story/"+props[2]+"'></div>");
                        DC.linkSelectToSrc($(content).children("select")[1],$(content).children("div").last().children("img")[0],"../../images/story/");
                        content.append(this.groupCheckbox("Inverted Text Cycle",props[3]));
                        content.append(this.groupInput("Cyc(ms)",props[4],"number",0));
                        content.append(this.groupCheckbox("NoCycle",props[5]));
                        
                    break;
                    case "centerViewChar":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],0];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupInput("Speed",props[1],"number",0));
                        break;
                    case "centerViewLoc":
                        props = props || [0,0];
                        content.append(this.groupInput("LocX",props[0],"number",0));
                        content.append(this.groupInput("LocY",props[1],"number",0));
                        break;
                    case "moveAlong":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],dataP.directions[0],true,[]];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupSelect("Dir",dataP.directions,props[1]));
                        content.append(this.groupCheckbox("Cycle Text On Arrival",props[2]));
                        content.append(this.groupContainer("Move Path",props[3]));
                        for(var i=0;i<props[3].length;i++){
                            var loc = props[3][i];
                            $(content).children("div").append("<div class='loc-display' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</div>");
                        }
                        break;
                    case "changeDir":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],"down"];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupSelect("Dir",dataP.directions,props[1]));
                        break;
                    case "modDialogueBox":
                        props = props || [true];
                        content.append(this.groupCheckbox("Show Dialogue Box",props[0]));
                        break;
                    case "waitTime":
                        props = props || [1000];
                        content.append(this.groupInput("Wait(ms)",props[0],"number",0));
                        break;
                    case "fadeChar":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],"out","fast"];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupSelect("InOut",dataP.inOut,props[1]));
                        content.append(this.groupSelect("Speed",dataP.speeds,props[2]));
                        break;
                    case "changeMusic":
                        props = props || [dataP.musicFileNames[0]];
                        content.append(this.groupSelect("Music",dataP.musicFileNames,props[0]));
                        content.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/bgm/'+props[0]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                        DC.linkSelectToSrc($(content).children("select")[0],$(content).children("audio")[0],"../../audio/bgm/");
                        break;
                    case "playSound":
                        props = props || [dataP.soundFileNames[0]];
                        content.append(this.groupSelect("Sound",dataP.soundFileNames,props[0]));
                        content.append('<audio controls class="full-width"><source type="audio/mp3" src="../../audio/sfx/'+props[0]+'">Sorry, your browser does not support HTML5 audio.</audio>');
                        DC.linkSelectToSrc($(content).children("select")[0],$(content).children("audio")[0],"../../audio/sfx/");
                        break;
                    case "changeMoveSpeed":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],300];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupInput("Spd(ms)",props[1],"number",0));
                        break;
                    case "playAnim":
                        var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                        props = props || [chars[0],"attacking","down"];
                        content.append(this.groupSelect("Char",chars,props[0],"char"));
                        content.append(this.groupSelect("Anim",dataP.animations,props[1]));
                        content.append(this.groupSelect("Dir",dataP.directions,props[2]));
                        break;
                    case "changeEvent":
                        props = props || [sceneType,sceneName,eventName];
                        content.append(this.groupSelect("ScType",dataP.sceneTypes,props[0],"scene-type"));
                        content.append(this.groupSelect("ScName",dataP.scenes[props[0]],props[1],"scene-name"));
                        content.append(this.groupSelect("EvName",dataP.events[props[0]][props[1]],props[2],"event-name"));
                        DC.linkSelects($(content).children("select")[0],$(content).children("select")[1],dataP.scenes);
                        DC.linkSelects($(content).children("select")[1],$(content).children("select")[2],dataP.events,[$(content).children("select")[0]]);
                        $($(content).children("select")[0]).trigger("change");
                        $($(content).children("select")[1]).trigger("change");
                        break;
                }
                return content;
            },
            newCharacter:function(char){
                return $("<div class='character-cont'><span class='character selectable "+char.handle+"' uniqueId='"+char.uniqueId+"' dir='"+char.dir+"' locX='"+char.loc[0]+"' locY='"+char.loc[1]+"' file='"+char.file+"' group='"+char.group+"'>"+char.handle+" ("+char.uniqueId+")"+"</span><span class='remove-choice group-text char-remove'>x</span></div>");
            },
            checkSelectedLoc:function(loc){
                for(var i=0;i<selectedLocs.length;i++){
                    if(selectedLocs[i].p.loc[0]===loc[0]&&selectedLocs[i].p.loc[1]===loc[1]){
                        $("#move-locations").children("div:nth-child("+(i+1)+")").remove();

                        $(selectedLocs[i].p.cont).children(".loc-display").each(function(){
                            var locX = $(this).attr("locX");
                            var locY = $(this).attr("locY");
                            if(locX==loc[0]&&locY==loc[1]) $(this).remove();
                        });
                        selectedLocs[i].destroy();
                        selectedLocs.splice(i,1);
                        //Change any of the next selectedLocs's labels
                        for(var j=i;j<selectedLocs.length;j++){
                            selectedLocs[j].p.number.p.label = ""+(j+1);
                        }
                        return true;
                    }
                }
            },
            updateCharSelects:function(){
                var chars = FileSaver.getCharacters().map(function(c){return c.handle+" "+c.uniqueId;});
                var opts = DC.getOptString(chars);
                $(".char").empty().append(opts); 
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
            linkSelectToSrc:function(select,srcObj,path){
                $(select).on("change",function(){
                    $(srcObj).attr("src",path+$(select).val());
                });
            },
            linkSelectedCharToSelect:function(select){
                Q.stage(0).on("selectedCharacter",function(char){
                    if(selectedCharacter){
                        selectedCharacter.destroySelectedBox();
                    }
                    selectedCharacter = char;
                    selectedCharacter.createSelectedBox();
                    $(select).val(char.p.handle+" "+char.p.uniqueId);
                });
                Q.stage(0).trigger("selectedCharacter",Q.getSpriteByName($(select).val()));
            },
            linkSelectedLocToInputs:function(locX,locY){
                Q.stage(0).on("selectedLocation",function(loc){
                    if(selectedLocs.length) selectedLocs[0].destroy();
                    selectedLocs = [];
                    selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:loc,num:selectedLocs.length+1})));
                    $(locX).val(loc[0]);
                    $(locY).val(loc[1]);
                });
                Q.stage(0).trigger("selectedLocation",[$(locX).val(),$(locY).val()]);
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
                if(isNaN(val)){
                    if(/[+=]/g.test(value) == true) {
                        val = encodeURIComponent(value);
                    } else {
                        val = value;
                    }
                }
                if(!val && isNaN(val)) val = (value === 'true');
                return val;
            },
            getGroups:function(cont){
                var groups = [];
                $(cont).children(".group-cont").each(function(){
                    var group = {};
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
                        handle:char.attr("class").split(" ")[2],
                        uniqueId:FileSaver.processValue(char.attr("uniqueId")),
                        loc:[FileSaver.processValue(char.attr("locX")),FileSaver.processValue(char.attr("locY"))],
                        dir:char.attr("dir")
                    });
                });
                return chars;
            },
            getFinishedEvent:function(){
                var cont = $("#prop-finished");
                return [$(cont).children(".scene-type").val(),$(cont).children(".scene-name").val(),$(cont).children(".event-name").val()]
            },
            getScript:function(){
                var script = [];
                $(".script-item-group").each(function(){
                    var group = [];
                    $(this).children(".script-items-cont").children(".script-item-cont").each(function(){
                        var func = $(this).children(".func").val();
                        var props = [];
                        $(this).children(".script-item").children(".prop").each(function(){
                            if($(this).is("div")){
                                props.push(JSON.parse($(this).attr("data")));
                            }
                            else if($(this).attr("type")==="checkbox"){
                                props.push(this.checked);
                            } else {
                                props.push(FileSaver.processValue($(this).val()));
                            }
                        });
                        group.push([func,props]);
                    });
                    script.push(group);
                });
                return script;
            },
            getEventRefs:function(){
                var refs = [];
                $(".event-name").each(function(){
                    var event = $(this).val(); 
                    if(refs.indexOf(event) === -1){
                        refs.push($(this).val());
                    }
                });
                return refs;
            },
            getNewSaveFile:function(){
                return {
                    file:JSON.stringify({
                        name:dataP.event.name,
                        kind:"battleScene",
                        map:$("#map-select-group").val()+"/"+$("#map-select-place").val(),
                        music:$("#prop-music .music-select").val(),
                        script:FileSaver.getScript(),
                        characters:FileSaver.getCharacters(),
                        finished:FileSaver.getFinishedEvent()
                    }),
                    eventRefs:FileSaver.getEventRefs(),
                    sceneVarRefs:[],
                    globalVarRefs:[]
                };
            }
        };
        
        DC.linkSelectToSrc($("#prop-music").children(".music-select"),$("#prop-music").children("audio"),"../../audio/bgm/");
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
            var cont = DC.getScriptItemGroup();
            $(this).parent().siblings(".script-groups").append(cont);
        });
        $(document).on("click",".add-script-item",function(){
            var content = DC.getScriptItemFunc($("<div class='script-item-cont selectable'></div>"));
            content.append(DC.getScriptItem($("<div class='script-item minimize'></div>")));
            $(this).parent().parent().children(".script-items-cont").append(content);
            DC.selectInitialValue($(content));
            $(content).children(".func").on("change",function(){
                $(this).next().nextAll().remove(); //After the 'x' remove all
                $(this).siblings(".minimize-icon").text("-");
                $(this).parent().append(DC.getScriptItem($("<div class='script-item minimize'></div>"),$(this).parent().children(".func").val()));
            });
        });
        /* start initial props code */
        
        
        DC.linkSelects($("#map-select-group"),$("#map-select-place"),dataP.mapFileNames);
        $("#map-select-group").append(DC.getOptString(dataP.mapFileGroups));
        $("#map-select-group").trigger("change");
        $(".music-select").append(DC.getOptString(dataP.musicFileNames));
        
        DC.linkSelects($("#prop-finished").children(".scene-type"),$("#prop-finished").children(".scene-name"),dataP.scenes);
        $("#prop-finished").children(".scene-type").append(DC.getOptString(dataP.sceneTypes));
        DC.linkSelects($("#prop-finished").children(".scene-name"),$("#prop-finished").children(".event-name"),dataP.events,[$("#prop-finished").children(".scene-type")]);
        $("#prop-finished").children(".scene-type").val(dataP.event.finished[0]);
        $("#prop-finished").children(".scene-type").trigger("change");
        $("#prop-finished").children(".scene-name").val(dataP.event.finished[1]);
        $("#prop-finished").children(".scene-name").trigger("change");
        $("#prop-finished").children(".event-name").val(dataP.event.finished[2]);
        
        /* end initial props code */

        function toggleSelected(sel){
            if(selectedLocs.length){
                var locs = [];
                for(var i=0;i<selectedLocs.length;i++){
                    locs.push([selectedLocs[i].p.loc[0],selectedLocs[i].p.loc[1]]);
                }
                if(selectedLocs[0].p.cont) $(selectedLocs[0].p.cont).attr("data",JSON.stringify(locs));
                for(var i=selectedLocs.length-1;i>=0;i--){
                    selectedLocs[i].destroy();
                }
                selectedLocs = [];
            }
            //Stop selecting that character
            if(selectedCharacter){
                selectedCharacter.destroySelectedBox();
                selectedCharacter.off("step",selectedCharacter,"setDir");
            }
            
            $(".selected").removeClass("selected");
            $(sel).toggleClass("selected");
            Q.stage(0).off("selectedCharacter");
            Q.stage(0).off("selectedLocation");
            
        };
        $(document).on("click",".character",function(){
            toggleSelected(this);
            Q.toCharSelection();
            selectedCharacter = Q.getSpriteAt([parseInt($(this).attr("locX")),parseInt($(this).attr("locY"))]);
            selectedCharacter.createSelectedBox();
            selectedCharacter.on("step",selectedCharacter,"setDir");
            
        });
        $(document).on("click",".script-item-cont",function(){
            toggleSelected(this);
            //Any funcs that use selectedCharacter or selectedLocation
            var func = $(this).children(".func").val();
            switch(func){
                case "centerViewLoc":
                    DC.linkSelectedLocToInputs($(this).children(".script-item").children("input")[0],$(this).children(".script-item").children("input")[1]);
                    break;
                case "changeMoveSpeed":
                case "playAnim":
                case "changeDir":
                case "fadeChar":
                case "centerViewChar":
                    DC.linkSelectedCharToSelect($(this).children(".script-item").children("select")[0]);
                    break;
                case "moveAlong":
                    DC.linkSelectedCharToSelect($(this).children(".script-item").children("select")[0]);
                    var locsCont = $(this).children(".script-item").children("div");
                    Q.stage(0).on("selectedLocation",function(loc){
                        if(DC.checkSelectedLoc(loc)) return;
                        selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:loc,num:selectedLocs.length+1,cont:locsCont})));
                        $(locsCont).append("<div class='loc-display' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</div>");
                    });
                    var locs = JSON.parse($(locsCont).attr("data"));
                    for(var i=0;i<locs.length;i++){
                        selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:locs[i],num:selectedLocs.length+1,cont:locsCont})));
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
                
                DC.updateCharSelects();
            }
        });
        $("#go-back").click(function(e){
            if(confirm("Are you sure you want to go back without saving?")){
                var to = "show-events.php";
                if(sceneType==="Flavour"){
                    to = "show-flavour.php";
                }
                $.redirect(to,  {'scene':sceneName, 'event':eventName, 'type':sceneType});
            }
        });
        $("#test-file").click(function(e){
            window.onbeforeunload = null;
            var data = FileSaver.getNewSaveFile();
            $.ajax({
                type:'POST',
                url:'save-battle.php',
                data:{data:data.file,name:eventName,scene:sceneName,type:sceneType},
                dataType:'json'
            })
            .done(function(data){$.redirect('../../index.php', {'scene':sceneName, 'event':eventName, 'type':sceneType, testing:true});})
            .fail(function(data){console.log(data)});
    
            if(sceneType==="Story"){
                $.ajax({
                    type:'POST',
                    url:'save-event-references.php',
                    data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:eventName,scene:sceneName},
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
                data:{data:data.file,name:eventName,scene:sceneName,type:sceneType},
                dataType:'json'
            })
            .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
            .fail(function(data){console.log(data)});
    
            if(sceneType==="Story"){
                $.ajax({
                    type:'POST',
                    url:'save-event-references.php',
                    data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:eventName,scene:sceneName},
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
            var scType = DC.groupSelect("Type",dataP.sceneTypes,sceneType);
            var scName = DC.groupSelect("SCName",dataP.scenes[sceneType],sceneName);
            var evName = DC.groupSelect("EVName",dataP.events[sceneType][sceneName],eventName);
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
        Q.load("sprites/archer.png,sprites/assassin.png,sprites/berserker.png,sprites/elementalist.png,sprites/healer.png,sprites/illusionist.png,sprites/legionnaire.png,sprites/skirmisher.png,sprites/vanguard.png",function(){
            startQuintusCanvas();
        });
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
    