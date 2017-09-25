window.addEventListener("load", function() {

var Q = window.Q = Quintus({audioSupported: ['mp3','ogg','wav']}) 
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        .setup({development: true, width:1000, height:800})
        .touch().controls(true)
        .enableSound();
Q.options.imagePath = "../../images/";
Q.options.audioPath = "../.././audio/";
Q.options.dataPath = "../.././data/";

Q.tileW = 32;
Q.tileH = 32;

//All of the tmx files
var tmxs = JSON.parse($("#maps").attr("value"));
var select = $("#maps-select");
tmxs.forEach(function(tmx,i){
    tmxs[i] = "maps/"+tmx;
    $(select).append("<option value='"+tmxs[i]+"'>"+tmxs[i]+"</option>");
});
$(document).on("change","#maps-select",function(e){
    Q.showMap($(this).val());
});
//Set all of the initial values of the selects
$("select[initialValue]").each(function(){
    var val = $(this).attr("initialValue");
    $(this).children('option[value="' + val + '"]').prop('selected', true);
});
Q.showMap = function(map){
    Q.stageScene("map",0,{map:map});
};
Q.loadTMX(tmxs,function(){
    Q.stageScene("map",0,{map:$("#maps-select").val()});
},{tmxImagePath:Q.options.imagePath.substring(3)});
Q.addViewport = function(stage){
    stage.add("viewport");
    var obj = stage.insert(new Q.UI.Container({w:Q.width,h:Q.height,type:Q.SPRITE_UI}));
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
Q.scene("map",function(stage){
    Q.stageTMX(stage.options.map, stage);
    Q.addViewport(stage);
});
$('#footer a').click( function(e) {
    var form = $('<form action="show-events.php" method="post"></form>');
    form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
    form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
    form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
    $("body").append(form);
    form.submit();
});
$('#go-to-scene').click( function(e) {
    var kind = $("#scene-kind").text();
    if(kind==="battle"){
        var form = $('<form action="edit-battle-event.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
        $("body").append(form);
        form.submit();
    } 
    //Kind is battle scene
    else {
        var form = $('<form action="edit-battleScene-script.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
        var map = $("#maps-select").val();
        form.append('<input type="text" name="map" value="'+map+'">');
        $("body").append(form);
        form.submit();
    }
});
});