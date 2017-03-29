window.addEventListener("load", function() {

$( ".sortable" ).sortable({
    axis: "y"
});
$( ".sortable" ).disableSelection();

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({development: true, width:800, height:800})
        .touch().controls(true)
        .enableSound();
Q.options.imagePath = "../.././images/";
Q.options.audioPath = "../.././audio/";
Q.options.dataPath = ".././data/";

Q.tileW = 32;
Q.tileH = 32;
Q.SPRITE_CHARACTER  = 8;

var selectedCharacter;
var selectedGroup;
var allowSpriteSelecting;
var selected;
var selectedFunc;
var cont = $(".menu");

Q.showMap = function(map){
    Q.stageScene("map",0,{map:map});
};

var map = "../../data/"+$("#event-map").text();
var imageAssets = [];
$("#images-holder").children("option").each(function(i,itm){
    imageAssets.push($(this).val());
});
//Load all of the character sprites
Q.load("sprites/archer.png,sprites/assassin.png,sprites/berserker.png,sprites/elementalist.png,sprites/healer.png,sprites/illusionist.png,sprites/legionnaire.png,sprites/skirmisher.png,sprites/vanguard.png",function(){
    //Sprites
    var toSheet= [
        ['archer','archer.png',24,48,6,6,288,338],
        ['assassin','assassin.png',24,48,6,6,288,338],
        ['berserker','berserker.png',24,48,6,6,288,338],
        ['elementalist','elementalist.png',24,48,6,6,288,338],
        ['healer','healer.png',24,48,6,6,288,338],
        ['illusionist','illusionist.png',24,48,6,6,288,338],
        ['legionnaire','legionnaire.png',24,48,6,14,288,338],
        ['skirmisher','skirmisher.png',24,48,6,6,288,338],
        ['vanguard','vanguard.png',24,48,6,6,288,338]
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
    //Load the json data
    Q.load("../../data/json/data/character-generation.json",function(){
        Q.state.set("ng",Q.assets["../../data/json/data/character-generation.json"]);
        Q.loadTMX(map,function(){
            Q.stageScene("map",0,{map:map});
            
            //Loop through all of the characters and add them
            var characters = JSON.parse($("#characters").text());
            characters.forEach(function(char){
                var cl = char.charClass.toLowerCase();
                if(char.charClass==="") cl = Q.state.get("ng").classNames[Math.floor(Math.random()*Q.state.get("ng").classNames.length)].toLowerCase();
                var c = Q.stage(0).insert(new Q.CharacterSprite({x:char.loc[0]*Q.tileW+Q.tileW/2,y:char.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:char.loc,storyId:char.storyId}));
                if(char.hidden==="hide") c.p.opacity = 0.5;
            });
            
            $(".minimize").trigger("click");
        });
    });
});
Q.Sprite.extend("CharacterSprite",{
    init:function(p){
        this._super(p,{
            type:Q.SPRITE_CHARACTER
        });
        this.p.z = this.p.y;
        this.on("destroy",function(){
            if(this.p.selectionBox){
                this.p.selectionBox.destroy();
            }
        });
    },
    createSelectedBox:function(){
        this.p.selectionBox = this.stage.insert(new Q.SelectedSquare({x:this.p.x,y:this.p.y,loc:this.p.loc,fill:"white"}));
    },
    removeSelectedBox:function(){
        this.p.selectionBox.destroy();
    }
});

Q.addViewport = function(stage){
    stage.add("viewport");
    var obj = Q.viewObj = stage.insert(new Q.UI.Container({w:Q.width,h:Q.height,type:Q.SPRITE_UI}));
    obj.p.x = obj.p.w/2;
    obj.p.y = obj.p.h/2;
    obj.drag = function(touch){
        this.p.x = touch.origX - touch.dx;
        this.p.y = touch.origY - touch.dy;
        /*if(this.p.x<this.p.w/2){this.p.x=this.p.w/2;}
        else if(this.p.x>(stage.mapWidth*Q.tileW)-this.p.w/2){this.p.x=(stage.mapWidth*Q.tileW)-this.p.w/2;};
        if(this.p.y<this.p.h/2){this.p.y=this.p.h/2;}
        else if(this.p.y>(stage.mapHeight*Q.tileH)-this.p.h/2){this.p.y=(stage.mapHeight*Q.tileH)-this.p.h/2;};*/
    };
    obj.on("drag");
    stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
    stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
    var minX=0;
    var maxX=(stage.mapWidth*Q.tileW);
    var minY=0;
    var maxY=(stage.mapHeight*Q.tileH);
    stage.follow(obj,{x:true,y:true}/*,{minX: minX, maxX: maxX, minY: minY,maxY:maxY}*/);
};
function moveSelection(e) {
    var x = e.offsetX || e.layerX,
        y = e.offsetY || e.layerY,
        stage = Q.stage();

    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);
    Q.selectionBox.p.x = Math.floor(stageX-stageX%Q.tileW);
    Q.selectionBox.p.y = Math.floor(stageY-stageY%Q.tileH);
}
function clickSelection(e){
    var x = e.offsetX || e.layerX,
        y = e.offsetY || e.layerY,
        stage = Q.stage();
    var stageX = Q.canvasToStageX(x, stage),
        stageY = Q.canvasToStageY(y, stage);
    var tileX = Math.floor(stageX/Q.tileW);
    var tileY = Math.floor(stageY/Q.tileH);
    
}
Q.addSelectionBox = function(stage,func){
    placing = true;
    Q.selectionBox = stage.insert(new Q.UI.Container({w:Q.tileW,h:Q.tileH,fill:"black",opacity:0.5,cx:0,cy:0,func:func,x:-Q.tileW,y:-Q.tileH}));
    Q.el.addEventListener('mousemove',moveSelection);
    Q.el.addEventListener('click',clickSelection);
};
Q.removeSelectionBox = function(){
    placing = false;
    Q.selectionBox.destroy();
    Q.el.removeEventListener('mousemove',moveSelection);
    Q.el.removeEventListener('click',clickSelection);
};
Q.scene("map",function(stage){
    Q.stageTMX(stage.options.map, stage);
    Q.addViewport(stage);
    
    //Turn on clicking sprites
    Q.el.addEventListener("click",function(e){
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
            }
            Q.stage(0).trigger("selectedLocation",[locX,locY]);
        }
    });
    Q.el.addEventListener("mousemove",function(e) {
        var x = e.offsetX || e.layerX,
            y = e.offsetY || e.layerY,
            stage = Q.stage();

        var stageX = Q.canvasToStageX(x, stage),
            stageY = Q.canvasToStageY(y, stage);
        var locX = Math.floor(stageX/Q.tileW);
        var locY = Math.floor(stageY/Q.tileH);
        $("#canvas-coordinates").text(locX+","+locY);
    });
},{sort:true});

var removeOptions = function(){
    cont.empty();
};
var appendMainOptions = function(){
    $(cont).append('<li><a id="create-group"><div class="menu-button btn btn-default">Create Group</div></a></li>');
    $(cont).append('<li><a id="create-script-item"><div class="menu-button btn btn-default">Create Script Item</div></a></li>');
    $(cont).append('<li><a id="test-scene"><div class="menu-button btn btn-default">Test Scene</div></a></li>');
    $(cont).append('<li><a id="save-scene"><div class="menu-button btn btn-default">Save Scene</div></a></li>');
    $(cont).append('<li><a id="return-to-character-placement"><div class="menu-button btn btn-default">Return to Character Placement</div></a></li>');
};
var appendScriptItemOptions = function(){
    $(cont).append('<li><a id="add-function"><div class="menu-button btn btn-default">Add Function</div></a></li>');
    $(cont).append('<li><a id="add-text"><div class="menu-button btn btn-default">Add Text</div></a></li>');
    $(cont).append('<li><a id="back-to-main"><div class="menu-button btn btn-default">Go Back</div></a></li>');
};
Q.getXY = function(loc){
    return {x:loc[0]*Q.tileW+Q.tileW/2,y:loc[1]*Q.tileH+Q.tileH/2};
};
Q.UI.Container.extend("SelectedSquare",{
    init:function(p){
        this._super(p,{
            w:Q.tileW,
            h:Q.tileH,
            border:1,
            z:2,
            opacity:0.8,
            fill:"black"
        });
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

var setUpFuncs = {
    setView:[
        function(val){
            $("#back-to-func-selection").before("<span>Select a character in the stage or from the list to set the view to</span><div id='view-character-selected' class='script-func'>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if($("#view-character-selected").text()===""){
                    $("#back-to-func-selection").before("<a id='add-func-to-script' value='setView'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
                saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = Q.getSpriteByStoryId(parseInt(val));
                Q.stage(0).trigger("selectedCharacter",Q.getSpriteByStoryId(parseInt(val)));
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
            });
        }
    ],
    centerView:[
        function(val){
            $("#back-to-func-selection").before("<span>Select a location in the stage to tween the view to. Selecting a character (on the stage or from the list) will set the view to it upon arrival.</span><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            var selectedChar = false;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                selectedChar = true;
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#view-character-selected").text()===""){
                    $("#back-to-func-selection").before("<a id='add-func-to-script' value='centerView'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
                saveFuncScriptItem();
            });
            //Will be disabled if a character is selected
            Q.stage(0).on("selectedLocation",function(loc){
                if(!selectedChar){
                    //show the selected box on the location
                    var pos = Q.getXY(loc);
                    if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                    Q.locSelectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:pos.x,y:pos.y,loc:loc}));
                    deselectSprite();
                    if($("#view-character-selected").text()===""){
                        $("#back-to-func-selection").before("<a id='add-func-to-script' value='centerView'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                    }
                    $("#view-character-selected").text("Location: "+loc[0]+","+loc[1]);
                    $("#view-character-selected").attr("val",JSON.stringify(loc));
                    $("#view-character-selected").attr("dataType","array");
                    saveFuncScriptItem();
                } else {
                    selectedChar = false;
                }
            });
            if(val!==undefined){
                if(Q._isArray(val[0])){
                    var loc = [val[0][0],val[0][1]];
                    Q.stage(0).trigger("selectedLocation",loc);
                    Q.viewObj.p.x = loc[0]*Q.tileW+Q.tileW/2;
                    Q.viewObj.p.y = loc[1]*Q.tileH+Q.tileH/2;
                } else {
                    console.log(val)
                    var sprite = Q.getSpriteByStoryId(val[0]);
                    Q.stage(0).trigger("selectedCharacter",sprite);
                    Q.viewObj.p.x = sprite.p.x;
                    Q.viewObj.p.y = sprite.p.y;
                }
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("selectedLocation");
                Q.stage(0).off("finished");
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
            });
        }
    ],
    moveAlong:[
        //Select the character
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Target Character: </span><div id='view-character-selected' class='script-func'></div></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#view-character-selected").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    setUpFuncs.moveAlong[1](val);
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
            });
            if(val!==undefined){
                Q.stage(0).trigger("selectedCharacter",Q.getSpriteByStoryId(val[0]));
            }
        },
        //Select the path
        function(val){
            //First time don't trigger the selectedLocation
            var initial = true;
            //The locations that have been selected for the path
            var selectedLocs = [];
            //The initial index of the dragged item
            var initialIdx;
            var saveLocs = function(){
                var locs = [];
                for(var i=0;i<selectedLocs.length;i++){
                    locs.push(selectedLocs[i].p.loc);
                }
                $("#move-locations").attr("val",JSON.stringify(locs));
            };
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select one or more locations to show the movement path.</span><ul id='move-locations' class='script-func sortable' dataType='array'></ul></div>");
            $( "#move-locations" ).sortable({
                axis: "y",
                start: function( event, ui ) {
                    initialIdx = $(ui.item[0]).index();
                },
                stop:function(event,ui){
                    if(initialIdx!==$(ui.item[0]).index()){
                        //Move the position of the item
                        var itm = selectedLocs[initialIdx];
                        selectedLocs.splice(initialIdx,1);
                        selectedLocs.splice($(ui.item[0]).index(),0,itm);
                        //Change any of the next selectedLocs's labels
                        for(var j=0;j<selectedLocs.length;j++){
                            selectedLocs[j].p.number.p.label = ""+(j+1);
                        }
                        saveLocs();
                        saveFuncScriptItem();
                    }
                }
            });
            $( ".sortable" ).disableSelection();
            Q.stage(0).on("selectedLocation",function(loc){
                if(initial){ 
                    initial = false; 
                    return;
                };
                //If the loc is already in the array, remove it.
                for(var i=0;i<selectedLocs.length;i++){
                    if(selectedLocs[i].p.loc[0]===loc[0]&&selectedLocs[i].p.loc[1]===loc[1]){
                        $("#move-locations").children("li:nth-child("+(i+1)+")").remove();
                        
                        selectedLocs[i].destroy();
                        selectedLocs.splice(i,1);
                        //Change any of the next selectedLocs's labels
                        for(var j=i;j<selectedLocs.length;j++){
                            selectedLocs[j].p.number.p.label = ""+(j+1);
                        }
                        saveLocs();
                        //Don't do the selectedLocs placement code
                        return;
                    }
                }
                //show the selected box on the location
                var pos = Q.getXY(loc);
                selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({x:pos.x,y:pos.y,loc:loc,num:selectedLocs.length+1})));
                $("#move-locations").append("<li class='loc-li' locX='"+loc[0]+"' locY='"+loc[1]+"'><div class='btn btn-default'>"+loc[0]+","+loc[1]+"</div></li>");
                $(".loc-li").on("click",function(){
                    Q.viewObj.p.x = $(this).attr("locX")*Q.tileW+Q.tileW/2;
                    Q.viewObj.p.y = $(this).attr("locY")*Q.tileH+Q.tileH/2;
                });
                saveLocs();
            });
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select the direction on arrival.</span><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select></div><div class='editor-item'><a id='cycle-text-on-arrival'><div class='menu-button btn btn-default script-func' val='true'>Cycle Text On Arrival</div></a></div>");
            $("#dir-on-arrival").val("up");
            $("#dir-on-arrival").on("change",function(){
                saveFuncScriptItem();
            });
            var changeCycle = function(){
                if($("#cycle-text-on-arrival").children(".menu-button").attr("val")==="true"){
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text Instantly");
                    $("#cycle-text-on-arrival").children(".menu-button").attr("val","false");
                } else {
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text On Arrival");
                    $("#cycle-text-on-arrival").children(".menu-button").attr("val","true");
                }
            };
            $("#cycle-text-on-arrival").on("click",function(){
                changeCycle();
                saveFuncScriptItem();
            });
            if(val!==undefined){
                initial = false;
                for(var i=0;i<val[1].length;i++){
                    Q.stage(0).trigger("selectedLocation",val[1][i]);
                }
                $("#dir-on-arrival").val(val[2]);
                $("#cycle-text-on-arrival").children(".menu-button").attr("val",val[3]);
                if(val[3]==="true"){
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text On Arrival");
                } else {
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text Instantly");
                }
                //Turn on saving for placing individual locations
                Q.stage(0).on("selectedLocation",function(){
                    saveFuncScriptItem();
                });
                
            } else {
                $("#back-to-func-selection").before("<a id='add-func-to-script' value='moveAlong'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedLocation");
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.stage(0).off("finished");
            });
        }
    ],
    changeDir:[
        //Select a character
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Target Character: </span><div id='change-dir-char' class='script-func'></div></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if($("#change-dir-char").text()===""){
                    setUpFuncs.changeDir[1](val);
                }
                $("#change-dir-char").text("Story Id: "+selectedCharacter.p.storyId);
                $("#change-dir-char").attr("val",selectedCharacter.p.storyId);
                $("#change-dir-char").attr("dataType","integer");
                Q.stage(0).off("selectedCharacter");
            });
            if(val!==undefined){
                var sprite = Q.getSpriteByStoryId(val[0]);
                Q.stage(0).trigger("selectedCharacter",sprite);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Select a direction
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select the direction of the character.</span><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select></div>");
            $("#dir-on-arrival").val("up");
            if(val){
                $("#dir-on-arrival").val(val[1]);
                $("#dir-on-arrival").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='changeDir'><div class='menu-button btn btn-default'>Add to Script</div></a>");
            
        }
    ],
    modDialogueBox:[
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Hide the dialogue box</span><select id='mod-dialogue-box' class='script-func'><option>hide</option><option>show</option></select></div>");
            if(val!==undefined){
                $("#mod-dialogue-box").val(val[0]);
                $("#mod-dialogue-box").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='modDialogueBox'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],/*
    setCharacterAs:[
        function(){}
    ],*/
    waitTime:[
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Wait time (in milliseconds) </span><input type='number' min='1' id='waiting-time' class='script-func' value='1000'></div>");
            if(val!==undefined){
                $("#waiting-time").val(parseInt(val[0]));
                $("#waiting-time").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='waitTime'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],
    fadeChar:[
        //Select a character
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Target Character: </span><div id='fade-char' class='script-func'></div></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if($("#fade-char").text()===""){
                    setUpFuncs.fadeChar[1](val);
                }
                $("#fade-char").text("Story Id: "+selectedCharacter.p.storyId);
                $("#fade-char").attr("val",selectedCharacter.p.storyId);
                $("#fade-char").attr("dataType","integer");
                Q.stage(0).off("selectedCharacter");
            });
            if(val!==undefined){
                var sprite = Q.getSpriteByStoryId(val[0]);
                Q.stage(0).trigger("selectedCharacter",sprite);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Get if it should fade in or out.
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Fade in or out.</span><select id='fade-inout' class='script-func'><option>out</option><option>in</option></select></div>");
            $("#fade-inout").val("out");
            if(val){
                $("#fade-inout").val(val[1]);
                $("#fade-inout").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='fadeChar'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],
    changeMusic:[
        function(val){
            var music = ["battle","demo","homeland","prebattle","the_usual"];
            $("#back-to-func-selection").before("<div class='editor-item'><span>Play music</span><select id='play-music' class='script-func'></select></div>");
            music.forEach(function(mus){
                $("#play-music").append("<option>"+mus+"</option>");
            });
            if(val!==undefined){
                $("#play-music").val(val[0]);
                $("#play-music").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='changeMusic'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],
    changeMoveSpeed:[
        //Select a character
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Target Character: </span><div id='change-move-speed' class='script-func'></div></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if($("#change-move-speed").text()===""){
                    setUpFuncs.changeMoveSpeed[1](val);
                }
                $("#change-move-speed").text("Story Id: "+selectedCharacter.p.storyId);
                $("#change-move-speed").attr("val",selectedCharacter.p.storyId);
                $("#change-move-speed").attr("dataType","integer");
                Q.stage(0).off("selectedCharacter");
            });
            if(val!==undefined){
                var sprite = Q.getSpriteByStoryId(val[0]);
                Q.stage(0).trigger("selectedCharacter",sprite);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Type a movement speed
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Movement Speed </span><input type='number' step='0.01' min='0.01' id='move-speed' class='script-func' value='0.30'></div>");
            if(val!==undefined){
                console.log(val[1])
                $("#move-speed").val(parseFloat(val[1]).toFixed(2));
                $("#move-speed").attr("dataType","float");
                $("#move-speed").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='changeMoveSpeed'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],
    playAnim:[
        function(val){
            $("#back-to-func-selection").before("<div class='editor-item'><span>Target Character: </span><div id='play-anim-char' class='script-func'></div></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                selectCharacter(obj);
                if($("#play-anim-char").text()===""){
                    setUpFuncs.playAnim[1](val);
                }
                $("#play-anim-char").text("Story Id: "+selectedCharacter.p.storyId);
                $("#play-anim-char").attr("val",selectedCharacter.p.storyId);
                $("#play-anim-char").attr("dataType","integer");
                Q.stage(0).off("selectedCharacter");
            });
            if(val!==undefined){
                var sprite = Q.getSpriteByStoryId(val[0]);
                Q.stage(0).trigger("selectedCharacter",sprite);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        function(val){
            var anims = ["Stand","Walk","Attack","Counter","Miss","Lift","Lifted","Hurt","Dying","LevelUp","SonicBoom","Whirlwind","Piercing"];
            $("#back-to-func-selection").before("<div class='editor-item'><span>Play animation</span><select id='anims' class='script-func'></select></div>");
            anims.forEach(function(anim){
                $("#anims").append("<option>"+anim+"</option>");
            });
            
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select the direction of the character.</span><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select></div>");
            $("#dir-on-arrival").val("up");
            
            var sounds = ["cannot_do","coin","confirm","critical_hit","dying","explosion","glancing_blow","hit1","inflict_status","shooting","slashing","text_stream","whirlwind"];
            $("#back-to-func-selection").before("<div class='editor-item'><span>Play sound</span><select id='sounds' class='script-func'></select></div>");
            sounds.forEach(function(sound){
                $("#sounds").append("<option>"+sound+"</option>");
            });
            if(val!==undefined){
                $("#anims").val(val[1]);
                $("#anims").on("change",function(){
                    saveFuncScriptItem();
                });
                
                $("#dir-on-arrival").val(val[2]);
                $("#dir-on-arrival").on("change",function(){
                    saveFuncScriptItem();
                });
                
                $("#sounds").val(val[3]);
                $("#sounds").on("change",function(){
                    saveFuncScriptItem();
                });
            }
            
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='playAnim'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ],
    changeEvent:[
        //Select an event from the list of events/scenes
        function(val){
            var scenes = JSON.parse($("#all-scene-names").text());
            var events = JSON.parse($("#all-event-names").text());
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select a scene</span><select id='scene-names' class='script-func'></select></div>");
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select an event</span><select id='event-names' class='script-func'></select></div>");
            scenes.forEach(function(scene){
                $("#scene-names").append("<option>"+scene+"</option>");
            });
            //Fill the events select
            $("#scene-names").on("change",function(){
                $("#event-names").empty();
                var event = events[$(this).prop("selectedIndex")];
                event.forEach(function(ev){
                    $("#event-names").append("<option>"+ev.substring(0, ev.lastIndexOf("."))+"</option>");
                });
            });
            if(val!==undefined){
                $("#scene-names").val(val[0]);
                var event = events[$("#scene-names").prop("selectedIndex")];
                event.forEach(function(ev){
                    $("#event-names").append("<option>"+ev.substring(0, ev.lastIndexOf("."))+"</option>");
                });
                $("#event-names").val(val[1]);
                $("#event-names").on("change",function(){
                    saveFuncScriptItem();
                });
            } else {
                $("#scene-names").val($("#scene-name").text());
                $("#scene-names").trigger("change");
            }
            $("#back-to-func-selection").before("<a id='add-func-to-script' value='changeEvent'><div class='menu-button btn btn-default'>Add to Script</div></a>");
        }
    ]
};
var funcs = Object.keys(setUpFuncs);
var appendFunctionOptions = function(obj){
    //var data = obj?obj:{text:[""],asset:["",""],pos:"Left",autoCycle:"0",noCycle:"No"};
    $(cont).append('<li><span>Select a Function</span><select id="script-select-func" class="new-script-item"></select></li>');
    $(cont).append('<li><a id="back-to-script-items"><div class="menu-button btn btn-default">Go Back</div></a></li>');
    $("#script-select-func").append("<option></option>");
    for(var i=0;i<funcs.length;i++){
        $("#script-select-func").append('<option value="'+funcs[i]+'">'+funcs[i]+'</option>');
    }
    if(obj){
        $("#script-select-func").val(obj.func);
        $("#script-select-func").attr("props",JSON.stringify(obj.props));
        $("#script-select-func").trigger("change");
    }
};
$(document).on("change","#script-select-func",function(e){
    removeOptions();
    $(cont).append('<li class="script-options-func-li"><a id="back-to-func-selection"><div class="menu-button btn btn-default">Go Back</div></a></li>');
    var props = $(this).attr("props");
    if(props){
        var p = JSON.parse(props);
        /*
        for(var idx=0;idx<p.length;idx++){
            console.log(p)
            setUpFuncs[$(this).val()][idx](p.split(','));
        }*/
        setUpFuncs[$(this).val()][0](p);
    } else {
        setUpFuncs[$(this).val()][0]();
    }
});
var getFuncProps = function(){
    var props = [];
    $(".script-func").each(function(i,itm){
        var value = $(this).attr("val");
        if(!value) value = $(this).val();
        var dataType = $(this).attr("dataType");
        if(dataType==="float") value = parseFloat(value);
        else if(dataType==="integer") value=parseInt(value);
        else if(dataType==="array") value=JSON.parse(value);
        props.push(value);
    });
    return props;
};
$(document).on("click","#add-func-to-script",function(e){
    allowSpriteSelecting = false;
    deselectSprite();
    var funcName = $(this).attr("value");
    var scCont = selectedGroup;
    $(scCont).append("<li func='"+funcName+"' props='"+JSON.stringify(getFuncProps())+"'><div class='text-or-func'>Func</div><a class='script-item func btn btn-default'>"+funcName+"</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>");
    $("#back-to-func-selection").trigger("click");
});
var appendTextOptions = function(obj){
    var data = obj?obj:{text:[""],asset:["story/empty.png","story/empty.png"],pos:"Left",autoCycle:"0",noCycle:"No"};
    $(cont).append('<li><span>Text</span><br><button id="add-new-text">Add New Text</button><ul class="sortable"></ul></li>');
    for(var i=0;i<data.text.length;i++){
        $(cont).children("li").children("ul").append('<li><textarea class="script-text new-script-item">'+data.text[i]+'</textarea><a class="remove-choice"><div class="btn btn-default">x</div></a></li>');
    }
    $(cont).append('<li><span>Left Asset</span><select id="script-asset1" class="new-script-item"></select><img class="new-script-img"></li>');
    $(cont).append('<li><span>Right Asset</span><select id="script-asset2" class="new-script-item"></select><img class="new-script-img"></li>');
    $(cont).append('<li><span>Scroll From: </span><button id="script-pos" class="new-script-item">'+data.pos+'</button></li>');
    $(cont).append('<li><span>Auto Cycle After Number of Frames</span><input id="script-autoCycle" class="new-script-item" value="'+data.autoCycle+'" type="number"></li>');
    $(cont).append('<li><span>Disable Cycle: </span><button id="script-noCycle" class="new-script-item">'+data.noCycle+'</button></li>');
    $(cont).append('<li><a id="add-to-script" class="menu-button btn btn-default">Add to Script</a></li>');
    $(cont).append('<li><a id="clear-values" class="menu-button btn btn-default">Clear Values</a></li>');
    $(cont).append('<li><a id="back-to-script-items"><div class="menu-button btn btn-default">Go Back</div></a></li>');
    for(var i=0;i<imageAssets.length;i++){
        $("#script-asset1").append('<option value="'+imageAssets[i]+'">'+imageAssets[i]+'</option>');
        $("#script-asset2").append('<option value="'+imageAssets[i]+'">'+imageAssets[i]+'</option>');
    }
    $("#script-asset1").val(data.asset[0]);
    $("#script-asset2").val(data.asset[1]);
    
    $("#script-asset1").trigger("change");
    $("#script-asset2").trigger("change");
    
    $(cont).children("li").children("input").on("change",function(){
        saveScriptText();
    });
    $(cont).children("li").children("select").on("change",function(){
        saveScriptText();
    });
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $( ".sortable" ).disableSelection();
};

$(document).on("change","#script-asset1",function(e){
    if(!$(this).val()){
        $(this).parent().children("img").css("display","none");
    } else {
        $(this).parent().children("img").attr("src","../../images/"+$(this).val());
        $(this).parent().children("img").css("display","inline-block");
    }
});
$(document).on("change","#script-asset2",function(e){
    if(!$(this).val()){
        $(this).parent().children("img").css("display","none");
    } else {
        $(this).parent().children("img").attr("src","../../images/"+$(this).val());
        $(this).parent().children("img").css("display","inline-block");
    }
});

$(document).on("click","#script-pos",function(e){
    if($(this).text()==="Left"){
        $(this).text("Right");
    } else {
        $(this).text("Left");
    }
    saveScriptText();
});
$(document).on("click","#script-noCycle",function(e){
    if($(this).text()==="No"){
        $(this).text("Yes");
    } else {
        $(this).text("No");
    }
    saveScriptText();
});
$(document).on("click",".remove-choice",function(e){
    $(this).parent().remove();
    $(".script-item").removeClass("selected-fill");
    
    removeOptions();
    appendMainOptions();
});

$(document).on("click","#clear-values",function(e){
    removeOptions();
    appendTextOptions();
});
$(document).on("click","#add-new-text",function(e){
    $(this).parent().children("ul").append('<li><textarea class="script-text new-script-item"></textarea><a class="remove-choice"><div class="btn btn-default">x</div></a></li>');
    saveScriptText();
});
$(document).on("click","#add-to-script",function(e){
    if(!$(".script-text").length) return;
    var textArr = [];
    $(".script-text").each(function(i,t){
        textArr.push($(t).val());
    });
    var asset1 = $("#script-asset1").val();
    var asset2 = $("#script-asset2").val();
    var pos = $("#script-pos").text();
    var autoCycle = $("#script-autoCycle").val();
    var noCycle = $("#script-noCycle").text();
    var scCont = selectedGroup;
    var displayText = textArr[0].slice(0,19);
    $(scCont).append("<li text="+JSON.stringify(textArr)+" asset='"+JSON.stringify([asset1,asset2])+"' pos='"+pos+"' autoCycle='"+autoCycle+"' noCycle='"+noCycle+"'><div class='text-or-func'>Text</div><a class='script-item text btn btn-default'>"+displayText+"</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>");
});

var saveFuncScriptItem = function(){
    $(selectedFunc).parent().attr("props",JSON.stringify(getFuncProps()));
};
var saveScriptText = function(){
    if(!$(".script-text").length) return;
    var textArr = [];
    $(".script-text").each(function(i,t){
        textArr.push($(t).val());
    });
    if(textArr[0].length===0) textArr = ["no text"]
    var asset1 = $("#script-asset1").val();
    var asset2 = $("#script-asset2").val();
    var pos = $("#script-pos").text();
    var autoCycle = $("#script-autoCycle").val();
    var noCycle = $("#script-noCycle").text();
    var displayText = textArr[0].slice(0,19);
    $(selected).parent().after("<li text='"+JSON.stringify(textArr)+"' asset='"+JSON.stringify([asset1,asset2])+"' pos='"+pos+"' autoCycle='"+autoCycle+"' noCycle='"+noCycle+"'><div class='text-or-func'>Text</div><a class='script-item text btn btn-default selected-fill'>"+displayText+"</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>");
    $(selected).parent().remove();
    
};
$(document).on("click",".script-item",function(e){
    if(this==selected) return;
    selectedFunc = false;
    if(selected){
        if($(selected).attr("class").split(" ")[1]==="text"){
            saveScriptText();
        }
    }
    selected = this;
    $(".script-item").removeClass("selected-fill");
    $(this).addClass("selected-fill");
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    deselectSprite();
    var type = $(this).attr("class").split(" ")[1];
    removeOptions();
    var parent = $(this).parent();
    if(type==="text"){
        appendTextOptions({text:JSON.parse($(parent).attr("text")),asset:JSON.parse($(parent).attr("asset")),pos:$(parent).attr("pos"),autoCycle:$(parent).attr("autoCycle"),noCycle:$(parent).attr("noCycle")});
    } else if(type==="func"){
        selectedFunc = this;
        appendFunctionOptions({func:$(parent).attr("func"),props:JSON.parse($(parent).attr("props"))});
    }
});

var groupCounter = 0;
$(document).on("click","#create-group",function(e){
    $("#script-menu").append("<ul class='sortable'><li><input class='nameable' value='"+groupCounter+"'></input></li></ul>");
    
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $(".nameable").on("focusout",function(){
        var name = $(this).val();
        $("#script-menu").children("ul").last().children("li").append("<div class='minimize'>"+name+"</div>");
        //$("#script-menu").children("ul").last().children("li").last().remove();
        $(this).remove();
        $(this).parent().eq()
    });
    groupCounter++;
});
$(document).on("click","#create-script-item",function(e){
    removeOptions();
    appendScriptItemOptions();
});
var createSaveForm = function(form){
    //Get the script
    var scriptData = [];
    var script = $("#script-menu").children("li");
    $(script).each(function(i,itm){
        var type = $(itm).children(".script-item").attr("class").split(" ")[1];
        if(type==="text"){
            scriptData.push({
                text:JSON.parse($(itm).attr("text")),
                asset:JSON.parse($(itm).attr("asset")),
                pos:$(itm).attr("pos"),
                autoCycle:parseInt($(itm).attr("autoCycle")),
                noCycle:$(itm).attr("noCycle")
            });
        } else if(type==="func"){
            scriptData.push({func:$(itm).attr("func"),props:JSON.parse($(itm).attr("props"))});
        }
    });
    var json = JSON.stringify(scriptData);
    form.append("<input type='text' name='battleScene' value="+json+">");
    return form;
};
$(document).on("click","#save-scene",function(e){
    var form = $('<form action="save-battleScene-script.php" method="post"></form>');
    form = createSaveForm(form);
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    $("body").append(form);
    form.submit();
});
$(document).on("click","#test-scene",function(e){
    var form = $('<form action="save-battleScene-script.php" method="post"></form>');
    form = createSaveForm(form);
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="testing" value="true">');
    $("body").append(form);
    form.submit();
});
$(document).on("click","#return-to-character-placement",function(e){
    var sure = confirm("Are you sure you want to go back without saving?");
    if(sure){
        var form = $('<form action="edit-battleScene-event.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="map" value="'+$("#event-map").text()+'">');
        $("body").append(form);
        form.submit();
    }
});

$(document).on("click","#add-function",function(e){
    removeOptions();
    appendFunctionOptions();
});
$(document).on("click","#add-text",function(e){
    removeOptions();
    appendTextOptions();
});
$(document).on("click","#back-to-func-selection",function(e){
    $(".script-item").removeClass("selected-fill");
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    selectedFunc = false;
    deselectSprite();
    removeOptions();
    appendFunctionOptions();
});
$(document).on("click","#back-to-main",function(e){
    $(".script-item").removeClass("selected-fill");
    selectedFunc = false;
    removeOptions();
    appendMainOptions();
});
$(document).on("click","#back-to-script-items",function(e){
    $(".script-item").removeClass("selected-fill");
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    deselectSprite();
    removeOptions();
    appendScriptItemOptions();
});

$(document).on("click",".minimize",function(){
    $(".minimize").parent().parent().children("li:not(:first-child)").css("display","none");
    $(this).parent().parent().children("li:not(:first-child)").css("display","block");
    removeOptions();
    appendMainOptions();
    selectedGroup = $(this).parent().parent();
    $(selectedGroup).children().eq(1).children(".script-item").trigger("click");
});


Q.getSpriteAt = function(loc){
    return Q.stage(0).locate(loc[0]*Q.tileW+Q.tileW/2,loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_CHARACTER);
};
Q.getSpriteByStoryId = function(id){
    return Q("CharacterSprite").items.filter(function(char){
        return char.p.storyId === id;
    })[0];
};

var selectCharacter = function(objAt){
    if(selectedCharacter){
        selectedCharacter.removeSelectedBox();
    }
    selectedCharacter = objAt;
    objAt.createSelectedBox();
};

var deselectSprite = function(){
    if(selectedCharacter){
        selectedCharacter.removeSelectedBox();
    }
    selectedCharacter = false;
};
appendMainOptions();
});