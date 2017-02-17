window.addEventListener("load", function() {

$( ".sortable" ).sortable({
    axis: "y"
});
$( ".sortable" ).disableSelection();

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
var allowSpriteSelecting;
Q.showMap = function(map){
    Q.stageScene("map",0,{map:map});
};

var map = $("#event-map").text();
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
                if(char.charClass==="rand") cl = Q.state.get("ng").charClasses[Math.floor(Math.random()*Q.state.get("ng").charClasses.length)];
                Q.stage(0).insert(new Q.CharacterSprite({x:char.loc[0]*Q.tileW+Q.tileW/2,y:char.loc[1]*Q.tileH+Q.tileH/2,sheet:cl,frame:1,loc:char.loc}));
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
        this.p.selectionBox = this.stage.insert(new Q.UI.Container({x:this.p.x,y:this.p.y,w:Q.tileW,h:Q.tileH,border:1,z:1}));
    },
    removeSelectedBox:function(){
        this.p.selectionBox.destroy();
    }
});

Q.addViewport = function(stage){
    stage.add("viewport");
    stage.viewport.scale = 2;
    var obj = stage.insert(new Q.UI.Container({w:Q.width/2,h:Q.height/2,type:Q.SPRITE_UI}));
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
    var maxX=(stage.mapWidth*Q.tileW)*stage.viewport.scale;
    var minY=0;
    var maxY=(stage.mapHeight*Q.tileH)*stage.viewport.scale;
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
},{sort:true});

var removeOptions = function(){
    var cont = $(".menu");
    cont.empty();
};

var appendMainOptions = function(){
    var cont = $(".menu");
    $(cont).append('<li><a id="create-script-item"><div class="menu-button btn btn-default">Create Script Item</div></a></li>');
    $(cont).append('<li><a id="test-scene"><div class="menu-button btn btn-default">Test Scene</div></a></li>');
    $(cont).append('<li><a id="return-to-character-placement"><div class="menu-button btn btn-default">Return to Character Placement</div></a></li>');
};
var appendScriptItemOptions = function(){
    var cont = $(".menu");
    $(cont).append('<li><a id="add-function"><div class="menu-button btn btn-default">Add Function</div></a></li>');
    $(cont).append('<li><a id="add-text"><div class="menu-button btn btn-default">Add Text</div></a></li>');
    $(cont).append('<li><a id="back-to-main"><div class="menu-button btn btn-default">Go Back</div></a></li>');
};
var appendFunctionOptions = function(){
    
};
var appendTextOptions = function(){
    
};  

$(document).on("click","#create-script-item",function(e){
    removeOptions();
    appendScriptItemOptions();
});
$(document).on("click","#test-scene",function(e){
    /*
    var form = createSaveForm();
    form.append('<input type="text" name="testing" value="true">');
    $("body").append(form);
    form.submit();*/
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
    }
    var obj = Q.getSpriteAt(objAt);
    selectedCharacter = obj;
    obj.createSelectedBox();
    removeOptions();
    appendCreateCharacterOptions(objAt);
};
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
        var objAt = Q.getObjAt(locX,locY);
        if(objAt){
            selectCharacter(objAt);
        }
    }
});
appendMainOptions();
});