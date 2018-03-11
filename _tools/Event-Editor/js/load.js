var buttons = ["Act-1-1","Act-1-2","Act-1-3","Act-1-4","Act-2-1","Act-2-2","Act-2-3","Act-2-4","Act-3-1","Act-3-2","Act-3-3","Act-3-4","FinalAct"];
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
    });
    $(".scene-button").first().trigger("click");
    
    
    $("#story").on("click",function(){
        window.location.href = "show-events.php?" + $.param({scene:$(".selected").text(), type:"Story"});
    });
    $("#vars").on("click",function(){
        window.location.href = 'edit-vars.php?scene=' + $(".selected").text();
    });
    $("#defaults").on("click",function(){
        window.location.href = "edit-scene-defaults.php?" + $.param({scene:$(".selected").text()});
    });
    $("#back").on("click",function(){
        window.location.href = "index.php";
    });
    
});