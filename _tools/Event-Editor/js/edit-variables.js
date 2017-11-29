var fileData = {};
var scenesList;
var changed = false;
function showVar(key,value){
    if(key===undefined){
        key = "";
        value = "";
    }
    $("#vars-list").append("<div class='variable'><input value='"+key+"' placeholder='Name'><input value='"+value+"' placeholder='Value'></div>");
    $(".variable").off().on("click",function(){
        $("#ref-cont").children(".reference").remove();
        $(".variable").removeClass("selected");
        $(this).addClass("selected");
        updateMenuOptions("variable");
        var refs = [];
        var val = $(this).children("input").first().val();
        if(fileData.events){
            //Get the references
            fileData.events.forEach(function(event){
                if(event.sceneVars.find(function(obj){return obj===val;})){
                    refs.push({event:event,scene:""});
                }
            });
        } else {
            for(var i=0;i<scenesList.Story.length;i++){
                var scene = scenesList.Story[i];
                for(var j=0;j<scene.events.length;j++){
                    var event = scene.events[j];
                    if(event.globalVars.find(function(obj){return obj===val;})){
                        refs.push({event:event,scene:scene.name+" -> "});
                    }
                }
            }
        }
        refs.forEach(function(ref){
            $("#ref-cont").append("<div class='reference'><span>"+ref.scene+ref.event.name+"</span></div>");
        });
        $(".reference").off().on("click",function(){
            $(".reference").removeClass("selected");
            $(this).addClass("selected");
            updateMenuOptions("reference");
        });
    });
};
function updateMenuOptions(type){
    function button(c,t){
        return "<div id='"+c+"' class='menu-button'>"+t+"</div>";
    }
    if(fileData.events){
        if(type==="variable"){
            $("#menu-cont").empty();
            $("#menu-cont").append(button("add-var","Add New Var"));
            $("#menu-cont").append(button("remove-var","Remove Var"));
            $("#menu-cont").append(button("save-vars","Save"));
            $("#menu-cont").append(button("show-story-events","Story Events"));
            $("#menu-cont").append(button("back","To Scenes"));
        } else if(type==="reference"){
            $("#menu-cont").empty();
            $("#menu-cont").append(button("add-var","Add New Var"));
            $("#menu-cont").append(button("remove-var","Remove Var"));
            $("#menu-cont").append(button("save-vars","Save"));
            $("#menu-cont").append(button("show-story-events","Story Events"));
            $("#menu-cont").append(button("back","To Scenes"));
            $("#menu-cont").append(button("go-to-event","Go To Event"));
        }
    } else {
        if(type==="variable"){
            $("#menu-cont").empty();
            $("#menu-cont").append(button("add-var","Add New Var"));
            $("#menu-cont").append(button("remove-var","Remove Var"));
            $("#menu-cont").append(button("save-vars","Save"));
            $("#menu-cont").append(button("back","Back"));
        } else if(type==="reference"){
            $("#menu-cont").empty();
            $("#menu-cont").append(button("add-var","Add New Var"));
            $("#menu-cont").append(button("remove-var","Remove Var"));
            $("#menu-cont").append(button("save-vars","Save"));
            $("#menu-cont").append(button("back","Back"));
            $("#menu-cont").append(button("go-to-event","Go To Event"));
        }
    }
    $("#add-var").click(function(){
        showVar();
        $(".variable").last().trigger("click");
        changed = true;
    });
    $("#remove-var").click(function(){
        function removeVar(){
            $(".selected.variable").remove();
            $(".variable").last().trigger("click");
            if(!$(".variable").length) $("#add-var").trigger("click");
        }
        if($(".reference").length){
            if(confirm("Warning, this variable is referenced somewhere. Still remove?")){
                removeVar();
            }
        } else {
            removeVar();
        }
        changed = true;
    });
    $("#save-vars").click(function(){
        var convertValue = function(value){
            if(value.toLowerCase()==="false") return false;
            if(value.toLowerCase()==="true") return true;
            if(Number.isInteger(parseInt(value))) return parseInt(value);
            return value;
        };
        var save = {};
        $(".variable").each(function(){
            var key = $(this).children("input").first().val();
            if(!key||!key.length) return;
            var value = $(this).children("input").last().val();
            save[key] = convertValue(value);
        });

        $.ajax({
            type:'POST',
            url:'save-vars.php',
            data:{vrs:JSON.stringify(save),scene:scene},
            dataType:'json'
        })
        .done(function(data){console.log(data)})
        .fail(function(data){console.log(data)});
    });
    $("#go-to-event").click(function(){
        if(changed&&confirm("Save vars before leaving?")){
            $("#save-vars").trigger("click");
        }
        var text = $(".reference.selected").text().split(" -> ");
        var event = text[1] || text[0];
        var scene = fileData.name || text[0];
        $.redirect('edit-event.php', {'scene':scene, 'event':event, 'type':'Story'});
    });
    $("#show-story-events").click(function(){
        if(changed&&confirm("Save vars before leaving?")){
            $("#save-vars").trigger("click");
        }
        $.redirect('show-events.php', {'scene':scene, type:"Story"});
    });
    $("#back").click(function(){
        if(changed&&confirm("Save vars before leaving?")){
            $("#save-vars").trigger("click");
        }
        window.location.href = 'load.php';
    });
    $(document).on("change","input",function(){
        changed = true;
    });
};

$(function(){
    $.getJSON("../../data/json/data/scenes-list.json",function(data){
        scenesList = data;
        if(scene){
            $("#scene-title").append("<div>"+scene+"</div>");
                fileData = data["Story"].find(function(elm){return elm.name===scene});
                var keys = Object.keys(fileData.vrs);
                keys.forEach(function(key){
                    showVar(key,fileData.vrs[key]);
                });
                if(!keys.length) showVar();
                $(".variable").first().trigger("click");

        } else {
            $("#scene-title").append("<div>Global</div>");
            $.getJSON("../../data/json/story/global-vars.json",function(data){
                fileData = data;
                var keys = Object.keys(data.vrs);
                keys.forEach(function(key){
                    showVar(key,data.vrs[key]);
                });
                if(!keys.length) showVar();
                $(".variable").first().trigger("click");
            });
        }
    });
    
});