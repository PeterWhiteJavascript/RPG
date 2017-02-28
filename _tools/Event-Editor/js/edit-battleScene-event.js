window.addEventListener("load", function() {

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
//Set to true when placing a character
var placing = false;
//The largest ID in the saveData
var largestId = 0;

var characters = JSON.parse($("#characters").text());

//Gets the name to be added to the character list
var getCharListName = function(name){
    if(!name.length){
        name = "Unnamed";
    }
    return name;
};

Q.showMap = function(map){
    Q.stageScene("map",0,{map:map});
};
var map = "../../data/"+$("#event-map").text();
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
            characters.forEach(function(char){
                char.level = parseInt(char.level);
                saveData.push(char);
                var cl = char.charClass.toLowerCase();
                if(char.charClass==="") cl = Q.state.get("ng").classNames[Math.floor(Math.random()*Q.state.get("ng").classNames.length)].toLowerCase();
                var c = Q.stage(0).insert(new Q.CharacterSprite({x:char.loc[0]*Q.tileW+Q.tileW/2,y:char.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:char.loc,storyId:char.storyId}));
                if(char.hidden==="hide") c.p.opacity = 0.5;
                
                //The highest id (used for unique id)
                largestId = Math.max.apply(Math,saveData.map(function(o){return o.storyId;}));
                
                //Add the character (with id only)
                var name = getCharListName(char.name)
                $("#character-list").append("<li><div storyId='"+char.storyId+"' class='character btn btn-default'>"+name+"</div></li>");
            });
        });
    });
});
Q.Sprite.extend("CharacterSprite",{
    init:function(p){
        this._super(p,{
            type:Q.SPRITE_CHARACTER|Q.SPRITE_UI
        });
        this.p.z = this.p.y;
        this.on("destroyed",function(){
            if(this.p.selectionBox){
                this.p.selectionBox.destroy();
            }
        });
        this.on("move");
    },
    createSelectedBox:function(){
        this.p.selectionBox = this.stage.insert(new Q.UI.Container({x:this.p.x,y:this.p.y,w:Q.tileW,h:Q.tileH,border:1,z:this.p.y-Q.tileH}));
    },
    removeSelectedBox:function(){
        this.p.selectionBox.destroy();
    },
    move:function(){
        this.p.x = this.p.loc[0]*Q.tileW+Q.tileW/2;
        this.p.y = this.p.loc[1]*Q.tileH+Q.tileH/2;
        this.p.selectionBox.p.x = this.p.x;
        this.p.selectionBox.p.y = this.p.y;
        $("#locX").val(this.p.loc[0]);
        $("#locY").val(this.p.loc[1]);
    },
    checkMove:function(){
        if(Q.inputs['left']){
            if(this.p.loc[0]>0){
                this.p.loc[0]--;
                this.p.save.loc[0]--;
                this.trigger("move");
            }
            Q.inputs['left'] = false;
        } else if(Q.inputs['right']){
            if(this.p.loc[0]<Q.stage(0).mapWidth){
                this.p.loc[0]++;
                this.p.save.loc[0]++;
                this.trigger("move");
            }
            Q.inputs['right'] = false;
        }
        if(Q.inputs['up']){
            if(this.p.loc[1]>0){
                this.p.loc[1]--;
                this.p.save.loc[1]--;
                this.trigger("move");
            }
            Q.inputs['up'] = false;
        } else if(Q.inputs['down']){
            if(this.p.loc[1]<Q.stage(0).mapHeight){
                this.p.loc[1]++;
                this.p.save.loc[1]++;
                this.trigger("move");
            }
            Q.inputs['down'] = false;
        }
    }
});
var saveData = [
    
];
var objFuncs = {
    placeCharacter:function(x,y){
        if(Q.getObjAt(x,y)) {
            
        } else {
            //Go through each of the keys and randomly generate the ones that are not filled out
            var charData = $("#character-options").children("li").children(".new-character");
            var currentCharacter = {};
            $(charData).each(function(i,d){
                var val = $(d).val();
                var id =$(d).attr("id");
                if(val===""||!val){
                    currentCharacter[id] =  "";
                } else {
                    currentCharacter[id] = val;
                }
            });
            currentCharacter.loc = [x,y];
            largestId++;
            currentCharacter.storyId = largestId;
            currentCharacter.level = parseInt(currentCharacter.level);
            saveData.push(currentCharacter);
            var cl = currentCharacter.charClass.toLowerCase();
            if(currentCharacter.charClass==="") cl = Q.state.get("ng").classNames[Math.floor(Math.random()*Q.state.get("ng").classNames.length)].toLowerCase();
            
            characters.push(currentCharacter);
            var c = Q.stage(0).insert(new Q.CharacterSprite({x:currentCharacter.loc[0]*Q.tileW+Q.tileW/2,y:currentCharacter.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:[x,y],storyId:currentCharacter.storyId,save:currentCharacter}));
            if(currentCharacter.hidden==="hide") c.p.opacity = 0.5;
            $("#go-back-to-character").trigger("click");
            selectCharacter(currentCharacter);
            //Add the character (with id only)
            var name = getCharListName(currentCharacter.name);
            //Place the character in the list
            $("#character-list").append("<li><div storyId='"+currentCharacter.storyId+"' class='character btn btn-default'>"+name+"</div></li>");
        }
    },
    removeCharacter:function(obj){
        for(var i=0;i<saveData.length;i++){
            if(saveData[i].loc[0]===obj.p.loc[0]&&saveData[i].loc[1]===obj.p.loc[1]){
                saveData.splice(i,1);
            }
        }
        obj.destroy();
        selectedCharacter = null;
    }
};
Q.addViewport = function(stage){
    stage.add("viewport");
    var obj = Q.viewObj = stage.insert(new Q.UI.Container({w:Q.width,h:Q.height,type:Q.SPRITE_UI}));
    obj.p.x = obj.p.w/2;
    obj.p.y = obj.p.h/2;
    obj.drag = function(touch){
       this.p.x = touch.origX - touch.dx;
       this.p.y = touch.origY - touch.dy;/*
       if(this.p.x<this.p.w/2){this.p.x=this.p.w/2;}
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
    objFuncs[Q.selectionBox.p.func](tileX,tileY);
    Q.removeSelectionBox();
}
Q.addSelectionBox = function(stage,func){
    placing = true;
    Q.selectionBox = stage.insert(new Q.UI.Container({w:Q.tileW,h:Q.tileH,fill:"black",opacity:0.5,cx:0,cy:0,func:func,x:-Q.tileW,y:-Q.tileH,z:3}));
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
        if(!placing){
            var x = e.offsetX || e.layerX,
                y = e.offsetY || e.layerY,
                stage = Q.stage();

            var stageX = Q.canvasToStageX(x, stage),
                stageY = Q.canvasToStageY(y, stage);
            var locX = Math.floor(stageX/Q.tileW);
            var locY = Math.floor(stageY/Q.tileH);
            var objAt = Q.getObjAt(locX,locY);
            if(objAt){
                selectCharacter(objAt);
            }
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
    
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $( ".sortable" ).disableSelection();
},{sort:true});
var removeOptions = function(){
    var cont = $("#character-options");
    cont.empty();
};

var appendMainOptions = function(){
    var cont = $("#character-options");
    $(cont).append('<li><a id="create-character"><div class="menu-button btn btn-default">Create Character</div></a></li>');
    $(cont).append('<li><a id="set-up-scene-script"><div class="menu-button btn btn-default">Set up Scene Script</div></a></li>');
    $(cont).append('<li><a id="save-characters"><div class="menu-button btn btn-default">Save Characters</div></a></li>');
    $(cont).append('<li><a id="return-to-map-selection"><div class="menu-button btn btn-default">Return to Map Selection</div></a></li>');
};
var appendCharacterOptions = function(char){
    var cont = $("#character-options");
    if(char){
        $(cont).append('<li><a id="place-character"><div class="menu-button btn btn-default">Place Character</div></a></li>');
    }
    $(cont).append('<li><a id="remove-character"><div class="menu-button btn btn-default">Remove Character</div></a></li>');
    $(cont).append('<li><a id="back-to-main"><div class="menu-button btn btn-default">Go Back</div></a></li>');
};
var appendCreateCharacterOptions = function(char){
    var data = Q.state.get("ng");
    var cont = $("#character-options");
    
    $(cont).append('<li>Name<input id="name" class="new-character" value=""></li>');
    $(cont).append('<li>LocationX<input type="number" id="locX" class="new-character" value=0></li>');
    $(cont).append('<li>LocationY<input type="number" id="locY" class="new-character" value=0></li>');
    $("#locX").on("change",function(){
        if(!selectedCharacter){ 
            var loc = [$(this).val(),$("#locY").val()];
            objFuncs["placeCharacter"](loc[0],loc[1]);
        }
        selectedCharacter.p.loc = [$(this).val(),selectedCharacter.p.loc[1]];
        selectedCharacter.trigger("move");
        
        var ch = characters.filter(function(c){
            return c.storyId==selectedCharacter.p.storyId;
        })[0];
        ch.locX = selectedCharacter.p.loc[0];
        ch.locY = selectedCharacter.p.loc[1];
    });
    $("#locY").on("change",function(){
        if(!selectedCharacter){ 
            var loc = [$("#locX").val(),$(this).val()];
            objFuncs["placeCharacter"](loc[0],loc[1]);
        }
        selectedCharacter.p.loc = [selectedCharacter.p.loc[0],$(this).val()];
        selectedCharacter.trigger("move");
        var ch = characters.filter(function(c){
            return c.storyId==selectedCharacter.p.storyId;
        })[0];
        ch.locX = selectedCharacter.p.loc[0];
        ch.locY = selectedCharacter.p.loc[1];
    });
    $(cont).append('<li>Level<input type="number" min="0" id="level" class="new-character" value=0></li>');
    $(cont).append('<li>Nationality<select id="nationality" class="new-character"></select></li>');
    $(cont).append('<li>Character Class<select id="charClass" class="new-character"></select></li>');
    $(cont).append('<li>Gender<select id="gender" class="new-character"></select></li>');
    $(cont).append('<li>Value<select id="value" class="new-character"></select></li>');
    $(cont).append('<li>Method<select id="methodology" class="new-character"></select></li>');
    $(cont).append('<li>Personality<select id="personality" class="new-character"></select></li>');
    $(cont).append('<li>Team<select id="team" class="new-character"></select></li>');
    
    $(cont).children("li").children("select").append("<option></option>");
    data.nationalities.forEach(function(itm){
        $(cont).children("li").children("#nationality").append("<option>"+itm+"</option>");
    });
    data.classNames.forEach(function(itm){
        $(cont).children("li").children("#charClass").append("<option>"+itm+"</option>");
    });
    data.genders.forEach(function(itm){
        $(cont).children("li").children("#gender").append("<option>"+itm+"</option>");
    });
    data.values.forEach(function(itm){
        $(cont).children("li").children("#value").append("<option>"+itm+"</option>");
    });
    data.methodologies.forEach(function(itm){
        $(cont).children("li").children("#methodology").append("<option>"+itm+"</option>");
    });
    data.personalityNames.forEach(function(itm){
        $(cont).children("li").children("#personality").append("<option>"+itm+"</option>");
    });
    data.teams.forEach(function(itm){
        $(cont).children("li").children("#team").append("<option>"+itm+"</option>");
    });
    
    //Add direction
    $(cont).append('<li>Direction<select id="dir" class="new-character"></select></li>');
    ["up","right","down","left"].forEach(function(itm){
        $(cont).children("li").children("#dir").append("<option>"+itm+"</option>");
    });
    //Add hidden
    var id = "";
    if(char) id=char.storyId;
    $(cont).append('<li>Display<select id="hidden" class="new-character" storyId="'+id+'"></select></li>');
    ["show","hide"].forEach(function(itm){
        $(cont).children("li").children("#hidden").append("<option>"+itm+"</option>");
    });
    if(char){
        $("#hidden").on("change",function(){
            var obj = Q.getSpriteFromId($(this).attr("storyId"));
            if($(this).val()==="hide"){
                obj.p.opacity = 0.5;
            } else {
                obj.p.opacity = 1;
            }
        });
    }
    $(cont).children("li").children("input").on("change",function(){
        saveCharacter();
    });
    $(cont).children("li").children("select").on("change",function(){
        saveCharacter();
    });
    appendCharacterOptions(char);
    if(char){
        fillCharacterOptions(char);
    } else{
        Q.addSelectionBox(Q.stage(0),"placeCharacter");
    }
};
var fillCharacterOptions = function(char){
    var cont = $("#character-options");
    $(cont).children("li").children("#name").val(char.name);
    $(cont).children("li").children("#locX").val(char.loc[0]);
    $(cont).children("li").children("#locY").val(char.loc[1]);
    $(cont).children("li").children("#level").val(char.level);
    $(cont).children("li").children("#nationality").val(char.nationality);
    $(cont).children("li").children("#charClass").val(char.charClass);
    $(cont).children("li").children("#gender").val(char.gender);
    $(cont).children("li").children("#value").val(char.value);
    $(cont).children("li").children("#methodology").val(char.methodology);
    $(cont).children("li").children("#personality").val(char.personality);
    $(cont).children("li").children("#team").val(char.team);
    $(cont).children("li").children("#dir").val(char.dir);
    $(cont).children("li").children("#hidden").val(char.hidden);
};
//MAIN MENU OPTIONS START
$(document).on("click","#create-character",function(e){
    removeOptions();
    appendCreateCharacterOptions();
});
var sortSaveData = function(data){
    //Sort the characters in their order
    var order = [];
    $("#character-list").children("li").each(function(i,li){
        order.push($(li).children().first().attr("storyId"));
    });
    var sorted = [];
    for(var i=0;i<order.length;i++){
        sorted.push(data.filter(function(d){
            return d.storyId==order[i];
        })[0]);
    }
    return sorted;
};
//Save this and come back to this page
$(document).on("click","#save-characters",function(e){
    var form = $('<form action="save-battleScene-characters.php" method="post"></form>');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="saving" value="true">');
    form.append("<input type='text' name='characters' value='"+JSON.stringify(sortSaveData(saveData))+"'>");
    $("body").append(form);
    form.submit();
});
$(document).on("click","#set-up-scene-script",function(e){
    var form = $('<form action="save-battleScene-characters.php" method="post"></form>');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append("<input type='text' name='characters' value='"+JSON.stringify(saveData)+"'>");
    $("body").append(form);
    
    form.submit();
});
$(document).on("click","#return-to-map-selection",function(e){
    var sure = confirm("Are you sure you want to go back without saving?");
    if(sure){
        var form = $('<form action="select-map.php" method="post"></form>');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="kind" value="battleScene">');
        form.append('<input type="text" name="map" value="'+$("#event-map").text()+'">');
        $("body").append(form);
        form.submit();
    }
});
//MAIN MENU OPTIONS END

$(document).on("click","#place-character",function(e){
    Q.addSelectionBox(Q.stage(0),"placeCharacter");
    var cont = $("#character-options");
    $(cont).children("li").children("#place-character").parent().replaceWith('<li><a id="go-back-to-character"><div class="menu-button btn btn-default">Cancel</div></a></li>');
});
$(document).on("click","#remove-character",function(e){
    if(selectedCharacter){
        $(".character[storyId='"+selectedCharacter.p.storyId+"']").parent().remove();
        objFuncs.removeCharacter(selectedCharacter);
    }
});
var saveCharacter = function(){
    if(selectedCharacter){
        var obj = Q.getObjFromId(selectedCharacter.p.storyId);
        var charData = $("#character-options").children("li").children(".new-character");
        $(charData).each(function(i,d){
            var val = $(d).val();
            var id =$(d).attr("id");
            if(val===""||!val){
                obj[id] =  "";
            } else {
                obj[id] = val;
            }
        });
        //Change the sprite sheet
        var sp = Q.getSpriteFromId(obj.storyId);
        var cl = obj.charClass;
        if(obj.charClass==="") cl = "vanguard";
        sp.p.sheet = cl.toLowerCase();
        //Change the name in the character list
        var name = getCharListName(obj.name);
        $(".character[storyId='"+obj.storyId+"']").text(name);
        
    }
};
$(document).on("click","#go-back-to-character",function(e){
    Q.removeSelectionBox();
    var cont = $("#character-options");
    $(cont).children("li").children("#go-back-to-character").parent().remove();
    $(cont).children("li").children("#back-to-main").parent().remove();
    $(cont).children("li").children("#remove-character").parent().remove();
    appendCharacterOptions();
});

$(document).on("click","#back-to-main",function(e){
    removeOptions();
    appendMainOptions();
    
    //Deselect the character
    if(selectedCharacter){
        selectedCharacter.removeSelectedBox();
        selectedCharacter.off("step",selectedCharacter,"checkMove");
    }
});


$(document).on("click",".character",function(e){
    var id = $(this).attr("storyId");
    //Get this character's data
    var char = characters.filter(function(c){
        return c.storyId==id;//Leave as two equals signs (string compared to int)
    })[0];
    selectCharacter(char);
    if(char.loc){
        Q.viewObj.p.x = char.loc[0]*Q.tileW+Q.tileW/2;
        Q.viewObj.p.y = char.loc[1]*Q.tileH+Q.tileH/2;
    }
});

Q.getObjAt = function(locX,locY){
    return saveData.filter(function(d){
        return d.loc[0]===locX&&d.loc[1]===locY;
    })[0];
};
Q.getObjFromId = function(id){
    return saveData.filter(function(char){
        return char.storyId==id;
    })[0];
};
Q.getSpriteFromId = function(id){
    return Q.stage(0).lists["CharacterSprite"].filter(function(char){
        return char.p.storyId==id;
    })[0];
};

var selectCharacter = function(objAt){
    if(selectedCharacter){
        selectedCharacter.removeSelectedBox();
        selectedCharacter.off("step",selectedCharacter,"checkMove");
    }
    var obj = Q.getSpriteFromId(objAt.storyId);
    selectedCharacter = obj;
    selectedCharacter.on("step",selectedCharacter,"checkMove");
    obj.createSelectedBox();
    removeOptions();
    appendCreateCharacterOptions(objAt);
    
    $(".character").removeClass("selected-fill");
    $(".character[storyId='"+selectedCharacter.p.storyId+"']").addClass("selected-fill");
};
appendMainOptions();
});