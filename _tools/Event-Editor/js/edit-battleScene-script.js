window.addEventListener("load", function() {    
    $(document).scrollTop(0);
$( ".sortable" ).sortable({
    axis: "y"
});
$( ".sortable" ).disableSelection();
var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio, Music")
        .setup({development: true, width:$(document).width()/2,height:$(document).height()-40})
        .touch().controls(true)
        .enableSound();
$("#new-item-box").css({left:$(document).width()/2});
Q.options.imagePath = "../.././images/";
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
var creatingScriptItem = false;

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
    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("Character", {
        standingleft:{ frames: [1,2], rate:standRate},
        walkingleft:{ frames: [1,2,3], rate:walkRate},
        attackingleft:{ frames: [1,2,3,3,2,1], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedleft:{frames:[8,8,8],rate:standRate,loop:false,trigger:"playStand"},
        counteringleft:{frames:[8,8,8],rate:standRate,loop:false,trigger:"doneCounter"},
        liftleft:{frames:[8,8,8],rate:standRate},
        liftedleft:{frames:[50],rate:standRate},
        hurtleft:{frames:[48],rate:standRate},
        dyingleft:{frames:[48,50],rate:standRate,loop:false,trigger:"doneDying"},
        deadleft:{frames:[50],rate:standRate},
        
        standingright:{ frames: [5,6], rate:standRate},
        walkingright:{ frames: [5,6,7], rate:walkRate},
        attackingright:{ frames: [5,6,7,7,6,5], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedright:{frames:[9,9,9],rate:standRate,loop:false,trigger:"playStand"},
        counteringright:{frames:[9,9,9],rate:standRate,loop:false,trigger:"doneCounter"},
        liftright:{frames:[9,9,9],rate:standRate},
        liftedright:{frames:[51],rate:standRate},
        hurtright:{frames:[49],rate:standRate},
        dyingright:{frames:[49,51],rate:standRate,loop:false,trigger:"doneDying"},
        deadright:{frames:[51],rate:standRate},
        
        standingup:{ frames: [5,6], rate:standRate},
        walkingup:{ frames: [5,6,7], rate:walkRate},
        attackingup:{ frames: [5,6,7,7,6,5], rate:walkRate, loop:false,trigger:"doneAttack"},
        missedup:{frames:[9,9,9],rate:standRate,loop:false,trigger:"playStand"},
        counteringup:{frames:[9,9,9],rate:standRate,loop:false,trigger:"doneCounter"},
        liftup:{frames:[9,9,9],rate:standRate},
        liftedup:{frames:[51],rate:standRate},
        hurtup:{frames:[49],rate:standRate},
        dyingup:{frames:[49,51],rate:standRate,loop:false,trigger:"doneDying"},
        deadup:{frames:[51],rate:standRate},
        
        standingdown:{ frames: [1,2], rate:standRate},
        walkingdown:{ frames: [1,2,3], rate:walkRate},
        attackingdown:{ frames: [1,2,3,3,2,1], rate:walkRate, loop:false,trigger:"doneAttack"},
        misseddown:{frames:[8,8,8],rate:standRate,loop:false,trigger:"playStand"},
        counteringdown:{frames:[8,8,8],rate:standRate,loop:false,trigger:"doneCounter"},
        liftdown:{frames:[8,8,8],rate:standRate},
        lifteddown:{frames:[50],rate:standRate},
        hurtdown:{frames:[48],rate:standRate},
        dyingdown:{frames:[48,50],rate:standRate,loop:false,trigger:"doneDying"},
        deaddown:{frames:[50],rate:standRate},
        
        levelingUp:{frames:[12,12],rate:standRate,loop:false,trigger:"playStand"}
    });
    //Load the json data
    Q.load("../../data/json/data/character-generation.json",function(){
        Q.loadTMX(map,function(){
            Q.load("sfx/cannot_do.mp3",function(){
                Q.stageScene("map",0,{map:map});
                DC.init();    
            });
        });
    });
});
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
Q.Sprite.extend("CharacterSprite",{
    init:function(p){
        this._super(p,{
            type:Q.SPRITE_CHARACTER,
            frame:0,
            sprite:"Character"
        });
        var pos = Q.getXY(this.p.loc);
        this.p.x = pos.x;
        this.p.y = pos.y;
        this.p.z = pos.y;
        DC.grid[this.p.loc[1]][this.p.loc[0]] = this;
        this.add("animation");
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
            //TEMP
            this.p.flip = false;
        } else if(Q.inputs['right']){
            this.p.dir = 'right';
            //TEMP
            this.p.flip = 'x';
        } else if(Q.inputs['down']){
            this.p.dir = 'down';
            //TEMP
            this.p.flip = 'x';
        } else if(Q.inputs['up']){
            this.p.dir = 'up';
            //TEMP
            this.p.flip = false;
        }
        this.play("standing"+this.p.dir);
    },
    removeFromExistence:function(){
        if(DC.p.selectedChars[0]===this&&Q.locSelectedBox) Q.locSelectedBox.destroy();
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
    },
    unconfirmPlacement:function(){
        DC.grid[this.p.loc[1]][this.p.loc[0]] = false;
    },
    confirmPlacement:function(){
        if(isNaN(this.p.loc[0])||isNaN(this.p.loc[1])) this.p.loc = [0,0];
        if(this.p.loc[0]<0||this.p.loc[0]>Q.stage(0).mapWidth||this.p.loc[1]<0||this.p.loc[1]>Q.stage(0).mapHeight) return;
        if(!DC.grid[this.p.loc[1]][this.p.loc[0]]){
            this.off("step",this,"stickToCursor");
            DC.grid[this.p.loc[1]][this.p.loc[0]] = this;
            allowSpriteSelecting = true;
            var pos = Q.getXY(this.p.loc);
            this.p.x = pos.x;
            this.p.y = pos.y;
            this.p.z = pos.y;
            this.p.selectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:this.p.x,y:this.p.y,loc:this.p.loc,fill:"white"}));
            this.p.lastLoc = false;
        } else {
            Q.playSound("cannot_do.mp3");
        }
    }
});

//Dynamic content controller
var DC = {
    init:function(){
        //Set up the impassableGrid
        this.grid = [];
        var tilesX = Q.stage(0).mapWidth;
        var tilesY = Q.stage(0).mapHeight;
        for(var i=0;i<tilesY;i++){
            this.grid[i]=[];
            for(var j=0;j<tilesX;j++){
                this.grid[i][j]=false;
            }
        }
        
        //Show the list of character files
        var fileNames = Object.keys(this.p.characters);
        var cont = $("#files");
        for(var i=0;i<fileNames.length;i++){
            var groups = Object.keys(this.p.characters[fileNames[i]]);
            $(cont).append('<div class="file-groups"><div class="minimize-icon">-</div><div class="title-text minimizable">'+fileNames[i]+'</div><div class="groups minimize"></div></div>');
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(this.p.characters[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><div class="minimize-icon">-</div><div class="title-text minimizable">'+groups[j]+'</div><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = this.p.characters[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }
        $('.draggable').draggable({helper: "clone"});
        $('.droppable').droppable({
            accept:".file-character",
            //Create a character element
            drop:function(event,ui){
                var alreadySelected = DC.p.selectedChars[0];
                if(alreadySelected&&alreadySelected.p.lastLoc){
                    alreadySelected.p.loc = DC.getNextEmpty([alreadySelected.p.lastLoc[0],alreadySelected.p.lastLoc[1]]);
                    alreadySelected.confirmPlacement();
                }
                var char = JSON.parse($(ui.draggable).attr("data"));
                var data = {
                    file:char.file,
                    uniqueId:DC.genUniqueId(char.handle),
                    handle:char.handle,
                    group:char.group
                };
                DC.addCharacterToList(data);
                //Double click the last character for placement
                $(".char-btn").last().trigger("click");
                $(".char-btn").last().trigger("click");
            }
        });
        
        //Add the characters that are in the event
        for(var i=0;i<this.p.eventData.characters.length;i++){
            this.addCharacterToList(this.p.eventData.characters[i]);
        }
        $(".char-btn").first().trigger("click");
        
        //Set up the script functions box
        var funcs = Object.keys(this.setUpFuncs);
        var cont = ("#script-item-box");
        $(cont).append('<div class="script-item-div"><p class="info-text script-instruction">Select a Function</p><select id="script-select-func"></select></div>');
        $("#script-select-func").append("<option></option>");
        for(var i=0;i<funcs.length;i++){
            $("#script-select-func").append('<option value="'+funcs[i]+'">'+funcs[i]+'</option>');
        }
        
        var script = this.p.eventData.script;
        //Set some default script items (music, viewport, etc...)
        if(!script.length){
            //Create a new group
            $("#menu-create-group").trigger("click");
            //Name the group 'Initial'
            $(".script-list-group").children(".script-group-title").children(".nameable").last().val("Initial");
            $(".script-list-group").children(".script-group-title").children(".nameable").last().trigger("focusout");
            //Create the options
            var group = this.getScriptItemGroup("Initial");
            $(group).children(".script-items").append("<div class='script-item func' func='centerView' props='"+JSON.stringify([[Math.floor(Q.stage(0).mapWidth/2),Math.floor(Q.stage(0).mapHeight/2)]])+"'><div class='script-item-name'>centerView</div><div class='btn btn-group remove-script-item remove-choice'>x</div></div>");
            $(group).children(".script-items").append("<div class='script-item func' func='changeMusic' props='"+JSON.stringify(["demo.mp3"])+"'><div class='script-item-name'>changeMusic</div><div class='btn btn-group remove-script-item remove-choice'>x</div></div>");
            
            $(group).children(".script-items").children(".script-item").first().trigger("click");
        } 
        //Show the groups and select the top item
        else {
            //For each of the groups.
            for(var i=0;i<script.length;i++){
                //Create a group
                $("#menu-create-group").trigger("click");
                //Name the group
                $(".script-list-group").children(".script-group-title").children(".nameable").last().val(script[i][0]);
                $(".script-list-group").children(".script-group-title").children(".nameable").last().trigger("focusout");
                
                var group = this.getScriptItemGroup(script[i][0]);
                //For each of the script items in each group
                //Start at 1 because 0 is the group name.
                for(var j=1;j<script[i].length;j++){
                    var itm = script[i][j];
                    //The script item is text
                    if(itm.text){
                        var text = itm.text[0].slice(0,20);
                        $(group).children(".script-items").append('<div class="script-item text" props='+JSON.stringify({text:itm.text,asset1:itm.asset1,asset2:itm.asset2,pos:itm.pos,autoCycle:itm.autoCycle,noCycle:itm.noCycle})+'><div class="script-item-name">'+text+'</div><div class="btn btn-group remove-script-item remove-choice">x</div></div>');
                    } 
                    //Otherwise it is a func
                    else if(itm.func){
                        $(group).children(".script-items").append("<div class='script-item func' func='"+itm.func+"' props='"+JSON.stringify(itm.props)+"'><div class='script-item-name'>"+itm.func+"</div><div class='btn btn-group remove-script-item remove-choice'>x</div></div>");
                    }
                }
            }
            $(group).children(".script-items").children(".script-item").first().trigger("click");
        }
                $(".minimize-icon").trigger("click");
    },
    genUniqueId:function(handle){
        var id = 0;
        var sameHandle = this.p.saveCharacters.filter(function(obj){
            return obj.handle===handle;
        });
        if(sameHandle.length){
            //Match the unique ids
            do {
                var found = false;
                //Check if the ids match
                for(var i=0;i<sameHandle.length;i++){
                    if(sameHandle[i].uniqueId===id){
                        id++;
                        found=true;
                    }
                }
            } while(found);
        }
        return id;
    },
    addCharacterToList:function(data){
        $("#characters-list").append("<li class='event-character' data='"+JSON.stringify(data)+"'><div class='char-btn'>"+data.handle+" "+data.uniqueId+"</div><div class='btn btn-group center char-remove remove-choice'>x</div></li>");
        var charClass = DC.p.characters[data.file][data.group][data.handle].charClass;
        var loc = data.loc?data.loc:this.getNextEmpty([0,0]);
        var dir = data.dir?data.dir:"down";
        this.p.saveCharacters.push(data);
        return Q.stage(0).insert(new Q.CharacterSprite({sheet:charClass.toLowerCase(),file:data.file,handle:data.handle,uniqueId:data.uniqueId,loc:loc,dir:dir}));
    },
    getNextEmpty:function(loc){
        var occupied = true;
        while(occupied){
            if(Q.getSpriteAt(loc)){
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
    getCharacter:function(handle,id){
        return Q.stage(0).lists["CharacterSprite"].filter(function(obj){
            return obj.p.handle===handle&&obj.p.uniqueId===id;
        })[0];
    },
    getSaveCharacter:function(handle,id){
        return this.p.saveCharacters.filter(function(obj){
            return obj.uniqueId===id&&obj.handle===handle;
        })[0];
    },
    //Accepts a character sprite
    getCharButton:function(char){
        var button;
        $(".event-character").each(function(idx){
            var data = JSON.parse($(this).attr("data"));
            if(char.p.uniqueId===data.uniqueId&&char.p.handle===data.handle){
                button = $(this).children(".char-btn");
            };
        }); 
        return button;
    },
    //Uses the group name to return the group
    getScriptItemGroup:function(name){
        return $(".script-list-group").children(".script-group-title").children(".script-group-name:contains("+name+")").parent().parent();
    },
    appendTextOptions:function(obj){
        //Set the text of the instruction
        $("#script-item-box").children(".script-item-div").children(".info-text").text("Set the Text");
        //Make sure the function select is hidden
        $("#script-item-box").children(".script-item-div").children("#script-select-func").hide();
        $("#script-item-box").children(".script-item-div").children("#script-select-func").nextAll().remove();
        
        var cont = $("#script-item-box").children(".script-item-div");
        var data = obj?obj:{text:[""],asset1:"story/empty.png",asset2:"story/empty.png",pos:"Left",autoCycle:"0",noCycle:"No"};
        $(cont).append('<button id="add-new-text">Add New Text</button><ul class="text-sortable"></ul>');
        for(var i=0;i<data.text.length;i++){
            $(cont).children("ul").append('<li class="script-text-dragger"><textarea class="script-text new-script-item">'+data.text[i]+'</textarea><div class="btn btn-group center remove-choice">x</div></li>');
        }
        $(cont).append("<div id='asset-spacer'></div>");
        $(cont).children("#asset-spacer").append('<select id="script-asset1" class="script-asset1 new-script-item"></select><select id="script-asset2" class="script-asset2 new-script-item"></select><div class="img-spacer"><img class="new-script-img"></div><div class="img-spacer"><img class="new-script-img"></div>');
        $(cont).append('<div id="scroll-from" class="script-instruction">Scroll From</div><button id="script-pos" class="script-pos new-script-item">'+data.pos+'</button>');
        $(cont).append('<div id="auto-cycle-after" class="script-instruction">Auto Cycle (ms)</div><input id="script-autoCycle" class="script-autoCycle new-script-item" value="'+data.autoCycle+'" type="number">');
        $(cont).append('<div id="disable-cycle" class="script-instruction">Disable Cycle</div><button id="script-noCycle" class="script-noCycle new-script-item">'+data.noCycle+'</button>');
        for(var i=0;i<imageAssets.length;i++){
            $("#script-asset1").append('<option value="'+imageAssets[i]+'">'+imageAssets[i]+'</option>');
            $("#script-asset2").append('<option value="'+imageAssets[i]+'">'+imageAssets[i]+'</option>');
        }
        $("#script-asset1").val(data.asset1);
        $("#script-asset2").val(data.asset2);

        $("#script-asset1").change(function(e){
            if(!$(this).val()){
                $(this).parent().children(".img-spacer").children("img").first().css("display","none");
            } else {
                $(this).parent().children(".img-spacer").children("img").first().attr("src","../../images/"+$(this).val());
            }
            DC.saveTextScriptItem();
        });
        $("#script-asset2").change(function(e){
            if(!$(this).val()){
                $(this).parent().children(".img-spacer").children("img").last().css("display","none");
            } else {
                $(this).parent().children(".img-spacer").children("img").last().attr("src","../../images/"+$(this).val());
            }
            DC.saveTextScriptItem();
        });
        
        $("#script-asset1").trigger("change");
        $("#script-asset2").trigger("change");
        $("#script-autoCycle").change(function(){
            DC.saveTextScriptItem();
        });
        
        $(cont).children("li").children("select").on("change",function(){
            DC.saveTextScriptItem();
        });
        var lastIdx;
        $( ".text-sortable" ).sortable({
            axis: "y",
            //Save the last index so we can check if the top has changed
            start: function( event, ui ) {
                lastIdx = $(ui.item[0]).index();
            },
            stop:function(event,ui){
                //Check if the position of the top element has changed
                if(lastIdx===0||$(ui.item[0]).index()===0){
                    $(".script-text").first().trigger("focusout");
                }
            }
        });
        $( ".text-sortable" ).disableSelection();
        
    },
    appendFuncOptions:function(obj){
        //Set the text of the instruction
        $("#script-item-box").children(".script-item-div").children(".info-text").text("Select a Function");
        //Make sure the function select is shown
        $("#script-item-box").children(".script-item-div").children("#script-select-func").show();
        $("#script-item-box").children(".script-item-div").children("#script-select-func").nextAll().remove();
        if(obj){
            $("#script-select-func").val(obj.func);
            DC.setUpFuncs[obj.func][0](obj.props);
        } else {
            $("#script-select-func").val("");
            $("#script-select-func").trigger("change");
        }
    },
    saveTextScriptItem:function(){
        $(".selected-script-item").attr("props",JSON.stringify(DC.getTextProps()));
    },
    getTextProps:function(){
        //text, asset1, asset2, pos, autoCycle, noCycle
        var props = {
            text:[]
        };
        $(".new-script-item").each(function(idx,itm){
            var prop = $(this).attr("class").split(" ")[0].split("-")[1];
            if(prop==="text"){
                props[prop].push($(this).val());
            } else {
                props[prop] = $(this).val()?$(this).val():$(this).text();
            }
        });
        props.autoCycle = parseInt(props.autoCycle);
        return props;
    },
    saveFuncScriptItem:function(){
        $(".selected-script-item").attr("props",JSON.stringify(DC.getFuncProps()));
    },
    getFuncProps:function(){
        var props = [];
        $(".script-func").each(function(i,itm){
            var value = $(this).attr("val");
            if(!value) value = $(this).val();
            if(!value){
                props.push(value);
                return;
            }
            var dataType = $(this).attr("dataType");
            if(dataType==="float") value = parseFloat(value);
            else if(dataType==="integer") value=parseInt(value);
            else if(dataType==="array") value=JSON.parse(value);
            else if(dataType==="boolean"){ 
                if(value==='true') value = true;
                else value = false;
            }
            props.push(value);
        });
        return props;
    },
    
    selectChar:function(char){
        this.p.selectedChars.push(char);
        if(char.p.selectedBox) char.p.selectedBox.destroy();
        char.p.selectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:char.p.x,y:char.p.y,loc:char.p.loc,fill:"white"}));
        char.on("step",char,"setDir");
    },
    deselectChar:function(char){
        //If the character is already selected, deselect it
        if(char){
            char.off("step",char,"setDir");
            char.p.selectedBox.destroy();
            //Match the character and then remove it
            this.p.selectedChars.forEach(function(obj,i){
                if(DC.matchChars(obj,char)){ 
                    DC.p.selectedChars.splice(i,1);
                }
            });
        } 
        //If there's no passed in char, empty the array
        else {
            this.p.selectedChars.forEach(function(obj){
                obj.off("step",obj,"setDir");
                if(obj.p.lastLoc){
                    obj.p.loc = [obj.p.lastLoc[0],obj.p.lastLoc[1]];
                    var pos = Q.getXY(obj.p.loc);
                    obj.p.x = pos.x;
                    obj.p.y = pos.y;
                    obj.p.z = pos.y;
                    obj.confirmPlacement();
                }
                obj.p.selectedBox.destroy();
            });
            this.p.selectedChars = [];
        }
    },
    matchChars:function(a,b){
        if(!a||!b) return false;
        return a.p.handle===b.p.handle&&a.p.uniqueId===b.p.uniqueId;
    },
    matches:function(a,b){
        return a===b;
    },
    p:{
        characters:JSON.parse($("#all-characters").text()),
        sceneTypes:JSON.parse($("#all-scene-types").text()),
        sceneNames:JSON.parse($("#all-scene-names").text()),
        eventNames:JSON.parse($("#all-event-names").text()),
        musicNames:JSON.parse($("#all-music-names").text()),
        soundNames:JSON.parse($("#all-sound-names").text()),
        
        eventMap:$("#event-map").text(),
        eventData:JSON.parse($("#event-data").text()),
        
        saveCharacters:[],
        grid:[],
        
        selectedChars:[]
    }
};
//Keep track if we have dragged. This makes it so we don't click while dragging.
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
        dragged = false;
    });
    stage.mapWidth = stage.lists.TileLayer[0].p.tiles[0].length;
    stage.mapHeight = stage.lists.TileLayer[0].p.tiles.length;
    stage.follow(obj,{x:true,y:true});
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

Q.getSpriteAt = function(loc){
    return Q.stage(0).locate(loc[0]*Q.tileW+Q.tileW/2,loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_CHARACTER);
};
//Run to allow for character selection
Q.toCharSelection = function(){
    selectedGroup = false;
    //When a character is clicked on the map
    Q.stage(0).on("selectedCharacter",function(obj){
        var selectedCharacter = DC.p.selectedChars[0];
        //If the character is already selected
        if(selectedCharacter&&selectedCharacter===obj){
            selectedCharacter.p.selectedBox.destroy();
            selectedCharacter.unconfirmPlacement();
            selectedCharacter.allowPlacement();
        } 
        //If the character is not already selected, select it.
        else {
            $(DC.getCharButton(obj)).trigger("click");
        }
    });
    $("#event-script-box").removeClass("selected-background");
    $("#script-item-box").removeClass("selected-background");
    //Add the darker theme to the character boxes
    $("#event-characters-box").addClass("selected-background");
    $("#all-characters-box").addClass("selected-background");
};


Q.scene("map",function(stage){
    stage.finished = function(){};
    Q.stageTMX(stage.options.map, stage);
    Q.addViewport(stage);
    
    //Turn on clicking sprites/ground
    Q.el.addEventListener("click",function(e){
        //If we've dragged, don't click
        if(dragged){
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
            DC.p.selectedChars[0].confirmPlacement();
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
        $("#canvas-coordinates").attr("locX",locX);
        $("#canvas-coordinates").attr("locY",locY);
    });
    Q.toCharSelection();
    Q.stage(0).lists.TileLayer[0].p.z = 0;
    Q.stage(0).lists.TileLayer[1].p.z = 1;
},{sort:true});

$(document).on("click",".char-btn",function(){
    //Make sure to remove the selected from the previous script item
    $(".selected-script-item").removeClass("selected-script-item");
    $(".selected-group").removeClass("selected-group");
    $(".script-item-div").hide();
    var data = JSON.parse($(this).parent().attr("data"));
    var handle = data.handle;
    var id = data.uniqueId;
    var newChar = DC.getCharacter(handle,id);
    $(".char-btn").removeClass("selected-button");
    $(this).addClass("selected-button");
    if(creatingScriptItem){
        creatingScriptItem = false;
        Q.stage(0).finished();
        DC.deselectChar();
    }
    //Old selectedChar
    var selectedCharacter = DC.p.selectedChars[0];
    //If we're selecting that character that is already selected, allow moving it.
    if(DC.matchChars(newChar,selectedCharacter)){
        if(allowSpriteSelecting){
            selectedCharacter.p.selectedBox.destroy();
            selectedCharacter.unconfirmPlacement();
            selectedCharacter.allowPlacement();
        }
    } else {
        DC.deselectChar();
        DC.selectChar(newChar);
    }
    Q.stage(0).off("selectedCharacter");
    Q.toCharSelection();
});

$(document).on("click",".char-remove",function(){
    var dataToRemove = JSON.parse($(this).parent().attr("data"));
    var characterSprite = DC.getCharacter(dataToRemove.handle,dataToRemove.uniqueId);
    var saveCharacter = DC.getSaveCharacter(dataToRemove.handle,dataToRemove.uniqueId);
    characterSprite.removeFromExistence();
    var funcs = $(".script-items").children(".func");
    $(funcs).each(function(){
        //Check all of the functions that can include a character
        var func = $(this).attr("func");
        var props = JSON.parse($(this).attr("props"));
        switch(func){
            case "setView":
            case "centerView":
            case "moveAlong":
            case "fadeChar":
            case "changeMoveSpeed":
            case "playAnim":
                //This contains a reference to this character
                if(saveCharacter.handle===props[0][0]&&saveCharacter.uniqueId===props[0][1]){
                    $(this).children(".remove-choice").trigger("click");
                }
                break;
        }
    });
    
});

var selectedGroup;
var groupCounter = 0;
$(document).on("click","#menu-create-group",function(e){
    $("#script-list").append("<div class='script-list-group'><div class='script-group-title'><div class='minimize-icon-deep'>-</div><input class='nameable' placeholder='New Group "+groupCounter+"' value=''><div class='btn btn-group center remove-nameable remove-choice'>x</div></div><div class='script-items minimize sortable'></div></div>");
    
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $(".nameable").on("focusout",function(){
        var name = $(this).val();
        var group = $(this).parent();
        if(name.length){
            $(this).replaceWith("<div class='script-group-name minimizable'>"+name+"</div>");
        }
        $(group).children(".script-group-name").trigger("click");
    });
    groupCounter++;
});

$(document).on("click","#menu-add-text-item",function(e){
    if(!selectedGroup) return;
    var group = DC.getScriptItemGroup($(".selected-group").text());
    $(group).children(".script-items").append("<div class='script-item text'><div class='script-item-name'></div><div class='btn btn-group remove-script-item remove-choice'>x</div></div>");

    $(group).children(".script-items").children(".script-item").last().trigger("click");
});

$(document).on("click","#menu-add-func-item",function(e){
    if(!selectedGroup) return;
    //Add a new func to the script
    var group = DC.getScriptItemGroup($(".selected-group").text());
    $(group).children(".script-items").append("<div class='script-item func'><div class='script-item-name'></div><div class='btn btn-group remove-script-item remove-choice'>x</div></div>");

    $(group).children(".script-items").children(".script-item").last().trigger("click");
});

$(document).on("change keyup paste",".script-text",function(){
    //If the script text is at the top, change the name that appears in the script
    if($(".script-text").index(this)===0){
        $(".selected-script-item").children(".script-item-name").text($(this).val().slice(0,20));
    }
    DC.saveTextScriptItem();
});

$(document).on("click",".minimize-icon",function(){
    var content = $(this).parent().children(".minimize");
    if($(content).css("display")==="none"){
        $(content).show();
        $(this).parent().children(".minimize-icon").text("-");
    } else {
        $(content).hide();
        $(this).parent().children(".minimize-icon").text("+");
    }
});
$(document).on("click",".minimize-icon-deep",function(){
    var content = $(this).parent().parent().children(".minimize");
    if($(content).css("display")==="none"){
        $(content).show();
        $(this).parent().children(".minimize-icon-deep").text("-");
    } else {
        $(content).hide();
        $(this).parent().children(".minimize-icon-deep").text("+");
    }
});


$(document).on("click",".script-item",function(e){
    //If this script item is already selected, return
    if($(this).hasClass("selected-script-item")) return;
    
    //Make sure the group is selected
    if($(this).parent().parent().children(".script-group-title").children(".script-group-name").text()!==$(selectedGroup).text()){
        $(this).parent().parent().children(".script-group-title").children(".script-group-name").trigger("click");
    }
    //Clear any selected squares
    Q("SelectedSquare",0).items.forEach(function(square){
        square.destroy();
    });
    DC.deselectChar();
    if(Q.locSelectedBox) Q.locSelectedBox.destroy();
    $(".char-btn").removeClass("selected-button");
    
    creatingScriptItem = true;
    Q.stage(0).off("selectedCharacter");
    Q.stage(0).off("selectedLocation");
    
    $(".script-item").removeClass("selected-script-item");
    $(this).addClass("selected-script-item");
    var type = $(this).attr("class").split(" ")[1];
    if(type==="text"){
        var props = $(this).attr("props");
        var args;
        if(props){
            props = JSON.parse(props);
            args = {text:props.text,asset1:props.asset1,asset2:props.asset2,pos:props.pos,autoCycle:props.autoCycle,noCycle:props.noCycle};
        } else {
            props = null;
            args = false;
        }
        DC.appendTextOptions(args);
    } else if(type==="func"){
        var props = $(this).attr("props");
        var args;
        if(props){ 
            props = JSON.parse(props);
            args = {func:$(this).attr("func"),props:props};
        } else {
            props = null;
            args = false;
        }
        DC.appendFuncOptions(args);
    }
    
    $("#event-script-box").addClass("selected-background");
    $("#script-item-box").addClass("selected-background");
    $(".script-item-div").show();
    //Add the darker theme to the character boxes
    $("#event-characters-box").removeClass("selected-background");
    $("#all-characters-box").removeClass("selected-background");
});

$(document).on("click",".script-group-name",function(){
    //Allow for renaming the group
    if(selectedGroup===this){
        $(this).parent().attr("oldName",$(this).text());
        $(this).replaceWith("<input class='new-group-name' placeholder='"+$(this).parent().attr("oldName")+"' value=''>");
        $(".new-group-name").last().focus();
        groupCounter++;
        $(".new-group-name").on("focusout",function(){
            var name = $(this).val();
            var group = $(this).parent();
            if(name.length){
                $(this).replaceWith("<div class='script-group-name minimizable'>"+name+"</div>");
            } else {
                $(this).replaceWith("<div class='script-group-name minimizable'>"+$(this).parent().attr("oldName")+"</div>");
            }
            $(group).children(".script-group-name").trigger("click");
        });
    } 
    //Otherwise, select the group.
    else {
        selectedGroup = this;
        $(".script-group-name").removeClass("selected-group");
        $(this).addClass("selected-group");
        //Select the first item
        $(this).parent().parent().children(".script-items").children(".script-item").first().trigger("click");
    }
});

//When changing the function of a func item
$(document).on("change","#script-select-func",function(e){
    //Deselect any characters
    DC.deselectChar();
    //Remove loc selected box if it exists
    if(Q.locSelectedBox) Q.locSelectedBox.destroy();
    
    //Turn off triggers
    Q.stage(0).off("selectedCharacter");
    Q.stage(0).off("selectedLocation");
    
    
    //If the functions are different, reset the props and set the new function
    if($(".selected-script-item").attr("func")!==$(this).val()){
        //Forget any properties that have been set
        $(".selected-script-item").attr("props",null);
        $(".selected-script-item").attr("func",$(this).val());
        $(".selected-script-item").children(".script-item-name").text($(this).val());
    }
    //Clear whatever's there
    $("#script-item-box").children(".script-item-div").children("#script-select-func").nextAll().remove();
    
    //If we've selected nothing, return
    if($(this).val()==="") return;
    //Set up the new function form
    DC.setUpFuncs[$(this).val()][0]();
});





Q.getXY = function(loc){
    return {x:loc[0]*Q.tileW+Q.tileW/2,y:loc[1]*Q.tileH+Q.tileH/2};
};


DC.setUpFuncs = {
    setView:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a character in the stage or from the list to set the view to</p><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                Q.locSelectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:obj.p.x,y:obj.p.y,loc:obj.p.loc,fill:"white"}));
                
                $("#view-character-selected").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#view-character-selected").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#view-character-selected").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.stage(0).trigger("selectedCharacter",sprite);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
            }
            Q.stage(0).finished = function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).finished = function(){};
                $(".script-item").removeClass("selected-script-item");
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.toCharSelection();
            };
        }
    ],
    centerView:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a location in the stage to tween the view to. Selecting a character (on the stage or from the list) will set the view to it upon arrival.</p><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                Q.locSelectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:obj.p.x,y:obj.p.y,loc:obj.p.loc,fill:"white"}));
                
                $("#view-character-selected").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#view-character-selected").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#view-character-selected").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            Q.stage(0).on("selectedLocation",function(loc){
                //show the selected box on the location
                var pos = Q.getXY(loc);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                Q.locSelectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:pos.x,y:pos.y,loc:loc}));
                //If there is a character selected, deselect it.
                DC.deselectChar();

                $("#view-character-selected").text("Location: "+loc[0]+","+loc[1]);
                $("#view-character-selected").attr("val",JSON.stringify(loc));
                $("#view-character-selected").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                if(Q._isNumber(val[0][0])){
                    var loc = [val[0][0],val[0][1]];
                    Q.stage(0).trigger("selectedLocation",loc);
                    Q.viewObj.p.x = loc[0]*Q.tileW+Q.tileW/2;
                    Q.viewObj.p.y = loc[1]*Q.tileH+Q.tileH/2;
                } else {
                    var sprite = DC.getCharacter(val[0][0],val[0][1]);
                    Q.stage(0).trigger("selectedCharacter",sprite);
                    Q.viewObj.p.x = sprite.p.x;
                    Q.viewObj.p.y = sprite.p.y;
                }
                //if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                //Q.locSelectedBox = Q.stage(0).insert(new Q.SelectedSquare({x:Q.viewObj.p.x,y:Q.viewObj.p.y}));
            }
            Q.stage(0).finished = function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("selectedLocation");
                $(".script-item").removeClass("selected-script-item");
                Q.stage(0).finished = function(){};
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.toCharSelection();
            };
        }
    ],
    moveAlong:[
        //Select the character
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a character to move.</p><div id='view-character-selected' class='script-func'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                DC.selectChar(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#view-character-selected").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    DC.setUpFuncs.moveAlong[1](val);
                }
                $("#view-character-selected").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#view-character-selected").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#view-character-selected").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
                Q.stage(0).trigger("selectedCharacter",sprite);
            }
            Q.stage(0).finished = function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("selectedLocation");
                $(".script-item").removeClass("selected-script-item");
                Q.stage(0).finished = function(){};
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.toCharSelection();
            };
        },
        //Select the path
        function(val){
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
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select one or more locations to show the movement path.</p><div id='move-locations' class='script-func sortable' dataType='array'></div>");
            $( "#move-locations" ).sortable({
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
                        DC.saveFuncScriptItem();
                    }
                }
            });
            $( ".sortable" ).disableSelection();
            Q.stage(0).on("selectedLocation",function(loc){
                //If the loc is already in the array, remove it.
                for(var i=0;i<selectedLocs.length;i++){
                    if(selectedLocs[i].p.loc[0]===loc[0]&&selectedLocs[i].p.loc[1]===loc[1]){
                        $("#move-locations").children("div:nth-child("+(i+1)+")").remove();
                        
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
                $("#move-locations").append("<div class='loc-display' locX='"+loc[0]+"' locY='"+loc[1]+"'>"+loc[0]+","+loc[1]+"</div>");
                $(".loc-li").on("click",function(){
                    Q.viewObj.p.x = $(this).attr("locX")*Q.tileW+Q.tileW/2;
                    Q.viewObj.p.y = $(this).attr("locY")*Q.tileH+Q.tileH/2;
                });
                saveLocs();
            });
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select the direction on arrival.</p><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select></div><div id='cycle-text-on-arrival' class='menu-button btn btn-default script-func' val='true' dataType='boolean'>Cycle Text On Arrival</div>");
            
            $("#dir-on-arrival").val("up");
            $("#dir-on-arrival").on("change",function(){
                DC.saveFuncScriptItem();
            });
            var changeCycle = function(){
                if($("#cycle-text-on-arrival").attr("val")==="true"){
                    $("#cycle-text-on-arrival").text("Cycle Text Instantly");
                    $("#cycle-text-on-arrival").attr("val","false");
                } else {
                    $("#cycle-text-on-arrival").text("Cycle Text On Arrival");
                    $("#cycle-text-on-arrival").attr("val","true");
                }
            };
            $("#cycle-text-on-arrival").on("click",function(){
                changeCycle();
                DC.saveFuncScriptItem();
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
            }
            //Turn on saving for placing individual locations
            Q.stage(0).on("selectedLocation",function(){
                DC.saveFuncScriptItem();
            });
            Q.stage(0).finished = function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("selectedLocation");
                $(".script-item").removeClass("selected-script-item");
                Q.stage(0).finished = function(){};
                Q("SelectedSquare",0).items.forEach(function(square){
                    square.destroy();
                });
                Q.toCharSelection();
            };
        }
    ],
    changeDir:[
        //Select a character
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a Character.</p><div id='change-dir-char' class='script-func sortable' dataType='array'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                DC.selectChar(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#change-dir-char").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    DC.setUpFuncs.changeDir[1](val);
                }
                $("#change-dir-char").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#change-dir-char").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#change-dir-char").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
                Q.stage(0).trigger("selectedCharacter",sprite);
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Select a direction
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select the Direction of the Character.</p><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select>");
            $("#dir-on-arrival").val("up");
            $("#dir-on-arrival").on("change",function(){
                DC.saveFuncScriptItem();
            });
            if(val){
                $("#dir-on-arrival").val(val[1]);
            }
        }
    ],
    modDialogueBox:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Hide/Show the Dialogue Box.</p><select id='mod-dialogue-box' class='script-func'><option>hide</option><option>show</option></select>");
            
            $("#mod-dialogue-box").on("change",function(){
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#mod-dialogue-box").val(val[0]);
            } else {
                $("#mod-dialogue-box").val("hide");
            }
            DC.saveFuncScriptItem();
        }
    ],
    waitTime:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Wait time (in milliseconds)</p><input type='number' min='1' id='waiting-time' class='script-func' value='1000'>");
            
            $("#waiting-time").on("change",function(){
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#waiting-time").val(parseInt(val[0]));
            } else {
                $("#waiting-time").val(0);
            }
            DC.saveFuncScriptItem();
        }
    ],
    fadeChar:[
        //Select a character
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Target Character: </p><div id='fade-char' class='script-func'></div>");
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                DC.selectChar(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#fade-char").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    DC.setUpFuncs.fadeChar[1](val);
                }
                $("#fade-char").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#fade-char").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#fade-char").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
                Q.stage(0).trigger("selectedCharacter",sprite);
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Get if it should fade in or out.
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Fade in or out.</p><select id='fade-inout' class='script-func'><option>out</option><option>in</option></select>");
            
            $("#fade-inout").on("change",function(){
                DC.saveFuncScriptItem();
            });
            $("#fade-inout").val("out");
            if(val){
                $("#fade-inout").val(val[1]);
            }
        }
    ],
    changeMusic:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Choose a music file to play.</p><select id='play-music' class='script-func'></select><audio controls id='music-preview'><source type='audio/mp3' src=''>Sorry, your browser does not support HTML5 audio.</audio>");
            
            $.each(DC.p.musicNames, function(key, value) {
                $('#play-music')
                    .append($('<option>', { value : value })
                    .text(value)); 
            });
            $("#play-music").change(function(){
                $("#music-preview").attr("src","../../audio/bgm/"+$("#play-music").val());
                    DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#play-music").val(val[0]);
                $("#play-music").trigger("change");
            } else {
                $("#play-music").val($("#play-music option:first").val());
                $("#play-music").trigger("change");
            }
        }
    ],
    playSound:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Choose a sound file to play.</p><select id='play-sound' class='script-func'></select><audio controls id='sound-preview'><source type='audio/mp3' src=''>Sorry, your browser does not support HTML5 audio.</audio>");
            
            $.each(DC.p.soundNames, function(key, value) {
                $('#play-sound')
                    .append($('<option>', { value : value })
                    .text(value)); 
            });
            $("#play-sound").change(function(){
                $("#sound-preview").attr("src","../../audio/sfx/"+$("#play-sound").val());
                    DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#play-sound").val(val[0]);
                $("#play-sound").trigger("change");
            } else {
                $("#play-sound").val($("#play-sound option:first").val());
                $("#play-sound").trigger("change");
            }
        }
    ],
    changeMoveSpeed:[
        //Select a character
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Target Character: </p><div id='change-move-speed' class='script-func'></div>");
            
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                DC.selectChar(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#change-move-speed").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    DC.setUpFuncs.changeMoveSpeed[1](val);
                }
                $("#change-move-speed").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#change-move-speed").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#change-move-speed").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
                Q.stage(0).trigger("selectedCharacter",sprite);
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        //Type a movement speed
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Movement Speed: </p><input type='number' step='0.01' min='0.01' id='move-speed' class='script-func' value='0.30' dataType='float'>");
            
            $("#move-speed").on("change",function(){
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#move-speed").val(parseFloat(val[1]).toFixed(2));
            }
        }
    ],
    playAnim:[
        function(val){
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Target Character: </p><div id='play-anim-char' class='script-func'></div>");
            
            allowSpriteSelecting = true;
            Q.stage(0).on("selectedCharacter",function(obj){
                DC.selectChar(obj);
                if(Q.locSelectedBox) Q.locSelectedBox.destroy();
                if($("#play-anim-char").text()===""){
                    Q.stage(0).off("selectedCharacter");
                    DC.setUpFuncs.playAnim[1](val);
                }
                $("#play-anim-char").text("Selected: "+obj.p.handle+" "+obj.p.uniqueId);
                $("#play-anim-char").attr("val",JSON.stringify([obj.p.handle,obj.p.uniqueId]));
                $("#play-anim-char").attr("dataType","array");
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                var sprite = DC.getCharacter(val[0][0],val[0][1]);
                Q.viewObj.p.x = sprite.p.x;
                Q.viewObj.p.y = sprite.p.y;
                Q.stage(0).trigger("selectedCharacter",sprite);
            }
            Q.stage(0).on("finished",function(){
                Q.stage(0).off("selectedCharacter");
                Q.stage(0).off("finished");
            });
        },
        function(val){
            var anims = ["Stand","Walk","Attack","Counter","Miss","Lift","Lifted","Hurt","Dying","LevelUp","SonicBoom","Whirlwind","Piercing"];
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Play Animation </p><select id='anims' class='script-func'></select>");
            
            $.each(anims, function(key, value) {
                $('#anims')
                    .append($('<option>', { value : value })
                    .text(value)); 
            });
            
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select the direction of the character.</p><select id='dir-on-arrival' class='script-func'><option>up</option><option>right</option><option>down</option><option>left</option></select>");
            
            $("#dir-on-arrival").val("up");
            
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Choose a sound file to play.</p><select id='play-sound' class='script-func'></select><audio controls id='sound-preview'><source type='audio/mp3' src=''>Sorry, your browser does not support HTML5 audio.</audio>");
            
            $.each(DC.p.soundNames, function(key, value) {
                $('#play-sound')
                    .append($('<option>', { value : value })
                    .text(value)); 
            });
            $("#anims").on("change",function(){
                DC.saveFuncScriptItem();
            });
            $("#dir-on-arrival").on("change",function(){
                DC.saveFuncScriptItem();
            });
            $("#play-sound").change(function(){
                $("#sound-preview").attr("src","../../audio/sfx/"+$("#play-sound").val());
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#anims").val(val[1]);
                
                $("#dir-on-arrival").val(val[2]);
                
                $("#play-sound").val(val[3]);
            }
            $("#play-sound").trigger("change");
        }
    ],
    changeEvent:[
        //Select an event from the list of events/scenes
        function(val){
            var sceneTypes = ["Character","Officer","Other","Story"];
            var scenes = JSON.parse($("#all-scene-names").text());
            var events = JSON.parse($("#all-event-names").text());
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a Type.</p><select id='scene-types' class='script-func'></select>");
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select a Scene.</p><select id='scene-names' class='script-func'></select>");
            $("#script-item-box").children(".script-item-div").append("<p class='script-instruction'>Select an Event.</p><select id='event-names' class='script-func'></select>");
            
            $.each(sceneTypes, function(key, value) {
                $('#scene-types')
                    .append($('<option>', { value : value })
                    .text(value));
            });
            $("#scene-types").on("change",function(key,value){
                $("#scene-names").empty();
                $("#event-names").empty();
                var scene = scenes[$(this).prop("selectedIndex")];
                $.each(scene, function(key, value) {
                    $('#scene-names')
                        .append($('<option>', { value :value})
                        .text(value)); 
                });
                $("#scene-names").val($("#scene-names option:first").val());
                
            });
            
            //Fill the events select
            $("#scene-names").on("change",function(){
                $("#event-names").empty();
                var event = events[$(this).val()];
                $.each(event, function(key, value) {
                    $('#event-names')
                        .append($('<option>', { value :value})
                        .text(value)); 
                });
                $("#event-names").val($("#event-names option:first").val());
                DC.saveFuncScriptItem();
            });
            $("#event-names").on("change",function(){
                DC.saveFuncScriptItem();
            });
            if(val!==undefined){
                $("#scene-types").val(val[0]);
                $("#scene-types").trigger("change");
                $("#scene-names").val(val[1]);
                $("#scene-names").trigger("change");
                $("#event-names").val(val[2]);
            } else {
                $("#scene-types").val($("#scene-types option:first").val());
                $("#scene-names").trigger("change");
                $("#scene-names").val($("#scene-names option:first").val());
                $("#scene-names").trigger("change");
                $("#event-names").val($("#scene-names option:first").val());
            }
            DC.saveFuncScriptItem();
        }
    ]
};


$(document).on("click","#script-pos",function(e){
    if($(this).text()==="Left"){
        $(this).text("Right");
    } else {
        $(this).text("Left");
    }
    DC.saveTextScriptItem();
});
$(document).on("click","#script-noCycle",function(e){
    if($(this).text()==="No"){
        $(this).text("Yes");
    } else {
        $(this).text("No");
    }
    DC.saveTextScriptItem();
});
$(document).on("click",".remove-choice",function(e){
    $(this).parent().remove();
    $(".script-item").removeClass("selected-fill");
    
});

$(document).on("click","#add-new-text",function(e){
    $(this).parent().children("ul").append('<li class="script-text-dragger"><textarea class="script-text new-script-item"></textarea><div class="btn btn-group center remove-choice">x</div></li>');
});

var createSaveForm = function(form){
    var data = {
        scriptData:[],
        characters:[]
    };
    //Get the script
    var groups = $(".script-list-group");
    $(groups).each(function(i,itm){
        var items = $(itm).children(".script-items").children(".script-item");
        //Start off with the name in the array
        var group = [$(itm).children(".script-group-title").children(".script-group-name").text()];
        $(items).each(function(j,itm2){
            var type = $(itm2).attr("class").split(" ")[1];
            if(type==="text"){
                var props = JSON.parse($(itm2).attr("props"));
                group.push({
                    text:props.text,
                    asset1:props.asset1,
                    asset2:props.asset2,
                    pos:props.pos,
                    autoCycle:props.autoCycle,
                    noCycle:props.noCycle
                });
            } else if(type==="func"){
                group.push({func:$(itm2).attr("func"),props:JSON.parse($(itm2).attr("props"))});
            }
        });
        data.scriptData.push(group);
    });
    //Get the characters
    $(".event-character").each(function(){
        var props = JSON.parse($(this).attr("data"));
        //Get the character sprite
        var sprite = DC.getCharacter(props.handle,props.uniqueId);
        data.characters.push({
            file:props.file,
            group:props.group,
            handle:props.handle,
            uniqueId:props.uniqueId,
            loc:sprite.p.loc,
            dir:sprite.p.dir
        });
    });
    var json = JSON.stringify(data);
    
    form.append("<input type='text' name='data' value="+json+">");
    return form;
};
$(document).on("click","#menu-save-file",function(e){
    var form = $('<form action="save-battleScene-script.php" method="post"></form>');
    form = createSaveForm(form);
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
    $("body").append(form);
    form.submit();
});
$(document).on("click","#menu-test-event",function(e){
    var form = $('<form action="save-battleScene-script.php" method="post"></form>');
    form = createSaveForm(form);
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
    form.append('<input type="text" name="testing" value="true">');
    $("body").append(form);
    form.submit();
});
$(document).on("click","#menu-go-back",function(e){
    var sure = confirm("Are you sure you want to go back without saving?");
    if(sure){
        var form = $('<form action="load.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
        form.append('<input type="text" name="map" value="'+$("#event-map").text()+'">');
        $("body").append(form);
        form.submit();
    }
});



});