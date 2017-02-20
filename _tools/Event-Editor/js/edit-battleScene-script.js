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
var allowSpriteSelecting;
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
                Q.stage(0).insert(new Q.CharacterSprite({x:char.loc[0]*Q.tileW+Q.tileW/2,y:char.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:char.loc,storyId:char.storyId}));
            });
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
       if(this.p.x<this.p.w/2){this.p.x=this.p.w/2;}
       else if(this.p.x>(stage.mapWidth*Q.tileW)-this.p.w/2){this.p.x=(stage.mapWidth*Q.tileW)-this.p.w/2;};
       if(this.p.y<this.p.h/2){this.p.y=this.p.h/2;}
       else if(this.p.y>(stage.mapHeight*Q.tileH)-this.p.h/2){this.p.y=(stage.mapHeight*Q.tileH)-this.p.h/2;};
    };
    obj.on("drag");
    stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
    stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
    var minX=0;
    var maxX=(stage.mapWidth*Q.tileW);
    var minY=0;
    var maxY=(stage.mapHeight*Q.tileH);
    stage.follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
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
                selectCharacter(objAt);
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
var funcs = [
    "setView",
    "centerView",
    "moveAlong",
    "changeDir",
    "allowCycle",
    "hideDialogueBox",
    "setCharacterAs",
    
    "waitTime",
    "fadeChar",
    "changeMusic",
    "changeMoveSpeed",
    "playAnim",
    
    "changeEvent"
    
];
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
//Each function within the array is in charge of a single prop value
var setUpFuncs = {
    setView:[
        function(val){
            $("#back-to-func-selection").before("<span>Select a character in the stage to set the view to</span><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(){
                if($("#view-character-selected").text()===""){
                    $("#back-to-func-selection").before("<a id='add-func-to-script' value='setView'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
                Q.stage(0).off("selectedCharacter");
            });
            if(val!==undefined){
                $("#back-to-func-selection").before("<a id='save-func-script-item'><div class='menu-button btn btn-default'>Save Script Item</div></a>");
                selectCharacter(Q.getSpriteByStoryId(parseInt(val)));
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
            $("#back-to-func-selection").before("<span>Select a location in the stage to tween the view to. Selecting a character will set the view to it upon arrival.</span><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            var selectedChar = false;
            Q.stage(0).on("selectedCharacter",function(){
                selectedChar = true;
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#view-character-selected").text()===""){
                    $("#back-to-func-selection").before("<a id='add-func-to-script' value='centerView'><div class='menu-button btn btn-default'>Add to Script</div></a>");
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
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
                } else {
                    selectedChar = false;
                }
            });
            if(val!==undefined){
                $("#back-to-func-selection").before("<a id='save-func-script-item'><div class='menu-button btn btn-default'>Save Script Item</div></a>");
                if(Q._isArray(val[0])){
                    Q.stage(0).trigger("selectedLocation",[val[0][0],val[0][1]]);
                } else {
                    selectCharacter(Q.getSpriteByStoryId(val[0]));
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
            Q.stage(0).on("selectedCharacter",function(){
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#view-character-selected").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    setUpFuncs.moveAlong[1](val);
                }
                $("#view-character-selected").text("Story Id: "+selectedCharacter.p.storyId);
                $("#view-character-selected").attr("val",selectedCharacter.p.storyId);
                $("#view-character-selected").attr("dataType","integer");
            });
            if(val){
                selectCharacter(Q.getSpriteByStoryId(val[0]));
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
                $("#move-locations").append("<li class='loc-li'><div class='btn btn-default'>"+loc[0]+","+loc[1]+"</div></li>");
                saveLocs();
            });
            
            $("#back-to-func-selection").before("<div class='editor-item'><span>Select the direction on arrival.</span><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select></div><div class='editor-item'><a id='cycle-text-on-arrival'><div class='menu-button btn btn-default script-func' val='true'>Cycle Text On Arrival</div></a></div>");
            $("#dir-on-arrival").val("up");
            $("#cycle-text-on-arrival").on("click",function(){
                if($("#cycle-text-on-arrival").children(".menu-button").attr("val")==="true"){
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text Instantly");
                    $("#cycle-text-on-arrival").children(".menu-button").attr("val","false");
                } else {
                    $("#cycle-text-on-arrival").children(".menu-button").text("Cycle Text On Arrival");
                    $("#cycle-text-on-arrival").children(".menu-button").attr("val","true");
                }
            });
            if(val){
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
                
                $("#back-to-func-selection").before("<a id='save-func-script-item'><div class='menu-button btn btn-default'>Save Script Item</div></a>");
            } else {
                $("#back-to-func-selection").before("<a id='add-func-to-script' value='moveAlong'><div class='menu-button btn btn-default'>Add to Script</div></a>");
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("selectedLocation");
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.stage(0).off("finished");
            });
        }
    ],
    changeDir:[
        function(){}
    ],
    allowCycle:[
        function(){}
    ],
    hideDialogueBox:[
        function(){}
    ],
    setCharacterAs:[
        function(){}
    ],
    waitTime:[
        function(){}
    ],
    fadeChar:[
        function(){}
    ],
    changeMusic:[
        function(){}
    ],
    changeMoveSpeed:[
        function(){}
    ],
    playAnim:[
        function(){}
    ],
    changeEvent:[
        function(){}
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
        if($(this).attr("dataType")==="integer") value=parseInt(value);
        if($(this).attr("dataType")==="array") value=JSON.parse(value);
        props.push(value);
    });
    return props;
};
$(document).on("click","#save-func-script-item",function(e){
    $(selectedFunc).parent().attr("props",JSON.stringify(getFuncProps()));
    selectedFunc = false;
    $("#back-to-func-selection").trigger("click");
});
$(document).on("click","#add-func-to-script",function(e){
    allowSpriteSelecting = false;
    deselectSprite();
    var funcName = $(this).attr("value");
    var scCont = $("#script-menu");
    $(scCont).append("<li func='"+funcName+"' props='"+JSON.stringify(getFuncProps())+"'><a class='script-item func btn btn-default'>"+funcName+"</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>");
    $("#back-to-func-selection").trigger("click");
});
var appendTextOptions = function(obj){
    var data = obj?obj:{text:[""],asset:["",""],pos:"Left",autoCycle:"0",noCycle:"No"};
    $(cont).append('<li><span>Text</span><br><button id="add-new-text">Add New Text</button><ul class="sortable"></ul></li>');
    for(var i=0;i<data.text.length;i++){
        $(cont).children("li").children("ul").append('<li><textarea class="script-text new-script-item">'+data.text[i]+'</textarea><a class="remove-choice"><div class="btn btn-default">x</div></a></li>');
    }
    $(cont).append('<li><span>Left Asset</span><select id="script-asset1" class="new-script-item"></select><img class="new-script-img"></li>');
    $(cont).append('<li><span>Right Asset</span><select id="script-asset2" class="new-script-item"></select><img class="new-script-img"></li>');
    $(cont).append('<li><span>Scroll From: </span><button id="script-pos" class="new-script-item">'+data.pos+'</button></li>');
    $(cont).append('<li><span>Auto Cycle After Number of Frames</span><input id="script-autoCycle" class="new-script-item" value="'+data.autoCycle+'"></input></li>');
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
});
$(document).on("click","#script-noCycle",function(e){
    if($(this).text()==="No"){
        $(this).text("Yes");
    } else {
        $(this).text("No");
    }
});
$(document).on("click",".remove-choice",function(e){
    $(this).parent().remove();
});

$(document).on("click","#clear-values",function(e){
    removeOptions();
    appendTextOptions();
});
$(document).on("click","#add-new-text",function(e){
    $(this).parent().children("ul").append('<li><textarea class="script-text new-script-item"></textarea><a class="remove-choice"><div class="btn btn-default">x</div></a></li>');
    
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
    var scCont = $("#script-menu");
    var displayText = textArr[0].slice(0,19);
    $(scCont).append("<li text='"+JSON.stringify(textArr)+"' asset='"+JSON.stringify([asset1,asset2])+"' pos='"+pos+"' autoCycle='"+autoCycle+"' noCycle='"+noCycle+"'><a class='script-item text btn btn-default'>"+displayText+"</a><a class='remove-choice'><div class='btn btn-default'>x</div></a></li>");
});

$(document).on("click",".script-item",function(e){
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    deselectSprite();
    var type = $(this).attr("class").split(" ")[1];
    removeOptions();
    var parent = $(this).parent();
    if(type==="text"){
        appendTextOptions({text:JSON.parse($(parent).attr("text")),asset:JSON.parse($(parent).attr("asset")),pos:$(parent).attr("pos"),autoCycle:$(parent).attr("autoCycle"),noCycle:$(parent).attr("noCycle")});
    } else if(type==="func"){
        selectedFunc = $(this);
        appendFunctionOptions({func:$(parent).attr("func"),props:JSON.parse($(parent).attr("props"))});
    }
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
            scriptData.push({text:JSON.parse($(itm).attr("text")),asset:JSON.parse($(itm).attr("asset")),pos:$(itm).attr("pos"),autoCycle:parseInt($(itm).attr("autoCycle")),noCycle:$(itm).attr("noCycle")});
        } else if(type==="func"){
            scriptData.push({func:$(itm).attr("func"),props:JSON.parse($(itm).attr("props"))});
        }
    });
    var json = JSON.stringify(scriptData, null, 2);
    form.append("<input type='text' name='battleScene' value='"+json+"'></input>");
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
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    deselectSprite();
    removeOptions();
    appendFunctionOptions();
});
$(document).on("click","#back-to-main",function(e){
    removeOptions();
    appendMainOptions();
});
$(document).on("click","#back-to-script-items",function(e){
    Q.stage(0).trigger("finished");
    allowSpriteSelecting = false;
    deselectSprite();
    removeOptions();
    appendScriptItemOptions();
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
    Q.stage(0).trigger("selectedCharacter");
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