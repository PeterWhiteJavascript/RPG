window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({development: true, width:1000, height:800})
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
            var characters = JSON.parse($("#characters").text());
            characters.forEach(function(char){
                saveData.push(char);
                var cl = char.charClass.toLowerCase();
                if(char.charClass==="") cl = Q.state.get("ng").classNames[Math.floor(Math.random()*Q.state.get("ng").classNames.length)].toLowerCase();
                Q.stage(0).insert(new Q.CharacterSprite({x:char.loc[0]*Q.tileW+Q.tileW/2,y:char.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:char.loc}));
                
                //The highest id (used for unique id)
                largestId = Math.max.apply(Math,saveData.map(function(o){return o.storyId;}));
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
    },
    createSelectedBox:function(){
        this.p.selectionBox = this.stage.insert(new Q.UI.Container({x:this.p.x,y:this.p.y,w:Q.tileW,h:Q.tileH,border:1,z:1}));
    },
    removeSelectedBox:function(){
        this.p.selectionBox.destroy();
    },
    move:function(){
        this.p.x = this.p.loc[0]*Q.tileW+Q.tileW/2;
        this.p.y = this.p.loc[1]*Q.tileH+Q.tileH/2;
        this.p.selectionBox.p.x = this.p.x;
        this.p.selectionBox.p.y = this.p.y;
    },
    checkMove:function(){
        if(Q.inputs['left']){
            if(this.p.loc[0]>0){
                this.p.loc[0]--;
            }
            Q.inputs['left'] = false;
        } else if(Q.inputs['right']){
            if(this.p.loc[0]<Q.stage(0).mapWidth){
                this.p.loc[0]++;
            }
            Q.inputs['right'] = false;
        }
        if(Q.inputs['up']){
            if(this.p.loc[1]>0){
                this.p.loc[1]--;
            }
            Q.inputs['up'] = false;
        } else if(Q.inputs['down']){
            if(this.p.loc[1]<Q.stage(0).mapHeight){
                this.p.loc[1]++;
            }
            Q.inputs['down'] = false;
        }
        this.move();
    }
});
var saveData = [
    
];
var objFuncs = {
    placeCharacter:function(x,y){
        if(Q.getObjAt(x,y)) {
            
        } else {
            //Go through each of the keys and randomly generate the ones that are not filled out
            var charData = $(".menu").children("li").children(".new-character");
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
            saveData.push(currentCharacter);
            var cl = currentCharacter.charClass.toLowerCase();
            if(currentCharacter.charClass==="") cl = Q.state.get("ng").classNames[Math.floor(Math.random()*Q.state.get("ng").classNames.length)].toLowerCase();
            Q.stage(0).insert(new Q.CharacterSprite({x:currentCharacter.loc[0]*Q.tileW+Q.tileW/2,y:currentCharacter.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:[x,y]}));
            $("#go-back-to-character").trigger("click");
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
    objFuncs[Q.selectionBox.p.func](tileX,tileY);
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
},{sort:true});
var removeOptions = function(){
    var cont = $(".menu");
    cont.empty();
};

var appendMainOptions = function(){
    var cont = $(".menu");
    $(cont).append('<li><a id="create-character"><div class="menu-button btn btn-default">Create Characters</div></a></li>');
    $(cont).append('<li><a id="set-up-scene-script"><div class="menu-button btn btn-default">Set up Scene Script</div></a></li>');
    $(cont).append('<li><a id="return-to-map-selection"><div class="menu-button btn btn-default">Return to Map Selection</div></a></li>');
};
var appendCharacterOptions = function(){
    var cont = $(".menu");
    $(cont).append('<li><a id="place-character"><div class="menu-button btn btn-default">Place Character</div></a></li>');
    $(cont).append('<li><a id="save-character"><div class="menu-button btn btn-default">Save Character</div></a></li>');
    $(cont).append('<li><a id="remove-character"><div class="menu-button btn btn-default">Remove Character</div></a></li>');
    $(cont).append('<li><a id="back-to-main"><div class="menu-button btn btn-default">Go Back</div></a></li>');
};
var appendCreateCharacterOptions = function(char){
    var data = Q.state.get("ng");
    var cont = $(".menu");
    $(cont).append('<li>Name<input id="name" class="new-character" value=""></li>');
    $(cont).append('<li>Level<input id="level" class="new-character" value=""></li>');
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
    appendCharacterOptions();
    if(char){
        fillCharacterOptions(char);
    }
};
var fillCharacterOptions = function(char){
    var cont = $(".menu");
    $(cont).children("li").children("#name").val(char.name);
    $(cont).children("li").children("#level").val(char.level);
    $(cont).children("li").children("#nationality").val(char.nationality);
    $(cont).children("li").children("#charClass").val(char.charClass);
    $(cont).children("li").children("#gender").val(char.gender);
    $(cont).children("li").children("#value").val(char.value);
    $(cont).children("li").children("#methodology").val(char.methodology);
    $(cont).children("li").children("#personality").val(char.personality);
    $(cont).children("li").children("#team").val(char.team);
};
//MAIN MENU OPTIONS START
$(document).on("click","#create-character",function(e){
    removeOptions();
    appendCreateCharacterOptions();
});
$(document).on("click","#set-up-scene-script",function(e){
    var form = $('<form action="edit-battleScene-script.php" method="post"></form>');
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
    var cont = $(".menu");
    $(cont).children("li").children("#place-character").parent().replaceWith('<li><a id="go-back-to-character"><div class="menu-button btn btn-default">Cancel</div></a></li>');
});
$(document).on("click","#remove-character",function(e){
    if(selectedCharacter){
        objFuncs.removeCharacter(selectedCharacter);
    }
});
$(document).on("click","#save-character",function(e){
    if(selectedCharacter){
        var obj = Q.getObjAt(selectedCharacter.p.loc[0],selectedCharacter.p.loc[1]);
        var charData = $(".menu").children("li").children(".new-character");
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
        var sp = Q.getSpriteAt(obj);
        var cl = obj.charClass;
        if(obj.charClass==="") cl = "vanguard";
        sp.p.sheet = cl.toLowerCase();
    }
});

$(document).on("click","#go-back-to-character",function(e){
    Q.removeSelectionBox();
    var cont = $(".menu");
    $(cont).children("li").children("#go-back-to-character").parent().remove();
    $(cont).children("li").children("#back-to-main").parent().remove();
    $(cont).children("li").children("#remove-character").parent().remove();
    $(cont).children("li").children("#save-character").parent().remove();
    appendCharacterOptions();
});

$(document).on("click","#back-to-main",function(e){
    removeOptions();
    appendMainOptions();
});
Q.getObjAt = function(locX,locY){
    return saveData.filter(function(d){
        return d.loc[0]===locX&&d.loc[1]===locY;
    })[0];
};
Q.getSpriteAt = function(objAt){
    return Q.stage(0).locate(objAt.loc[0]*Q.tileW+Q.tileW/2,objAt.loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_CHARACTER);
};

var selectCharacter = function(objAt){
    if(selectedCharacter){
        selectedCharacter.removeSelectedBox();
        selectedCharacter.off("step",selectedCharacter,"checkMove");
    }
    var obj = Q.getSpriteAt(objAt);
    selectedCharacter = obj;
    selectedCharacter.on("step",selectedCharacter,"checkMove");
    obj.createSelectedBox();
    removeOptions();
    appendCreateCharacterOptions(objAt);
};
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
appendMainOptions();
});