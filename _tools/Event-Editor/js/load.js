var buttons = ["Act-1-1","Act-1-2","Act-1-3","Act-1-4","Act-2-1","Act-2-2","Act-2-3","Act-2-4","Act-3-1","Act-3-2","Act-3-3","Act-3-4","Act-4-1","Act-4-2","Act-4-3","Act-4-4","All"];
$(function(){
    for(var i=0;i<buttons.length;i++){
        //Create new row after 4
        if(i%4===0){
            $("#scenes-cont").append("<div class='scene-row'></div>");
        }
        $(".scene-row").last().append('<div class="scene-button"><div>'+buttons[i]+'</div></div>');
    }
    $(".scene-button").on("click",function(){
        $(".scene-button").removeClass("selected");
        $(this).addClass("selected");
        if($(this).text()==="All"){
            $("#story").addClass("crossed");
        } else {
            $("#story").removeClass("crossed");
        }
    });
    $(".scene-button").first().trigger("click");
    
    
    $("#story").on("click",function(){
        if(!$(this).hasClass("crossed")){
            $.redirect('show-events.php', {scene:$(".selected").text(), type:"Story"});
        }
    });
    $("#vars").on("click",function(){
        $.redirect('edit-vars.php', {scene:$(".selected").text()});
    });
    $("#flavour").on("click",function(){
        $.redirect("show-events.php",{scene:$(".selected").text(), type:"Flavour"});
    });
    $("#back").on("click",function(){
        $.redirect("index.php");
    });
    
});