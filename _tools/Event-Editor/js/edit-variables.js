var fileData;
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
        //Get the references
        fileData.events.forEach(function(event){
            if(event.sceneVars.find(function(obj){return obj===val;})){
                refs.push(event);
            }
        });
        refs.forEach(function(ref){
            $("#ref-cont").append("<div class='reference'>"+ref.name+"</div>");
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
    if(type==="variable"){
        $("#menu-cont").empty();
        $("#menu-cont").append(button("add-var","Add New Var"));
        $("#menu-cont").append(button("remove-var","Remove Var"));
        $("#menu-cont").append(button("save-vars","Save"));
        $("#menu-cont").append(button("show-story-events","Story Events"));
        $("#menu-cont").append(button("show-flavour-events","Flavour Events"));
        $("#menu-cont").append(button("back","To Scenes"));
    } else if(type==="reference"){
        $("#menu-cont").empty();
        $("#menu-cont").append(button("add-var","Add New Var"));
        $("#menu-cont").append(button("remove-var","Remove Var"));
        $("#menu-cont").append(button("save-vars","Save"));
        $("#menu-cont").append(button("show-story-events","Story Events"));
        $("#menu-cont").append(button("show-flavour-events","Flavour Events"));
        $("#menu-cont").append(button("back","To Scenes"));
        $("#menu-cont").append(button("go-to-event","Go To Event"));
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
        $.redirect('edit-event.php', {'scene':scene, 'event':$(".reference.selected").text(), 'type':'Story'});
    });
    $("#show-story-events").click(function(){
        if(changed&&confirm("Save vars before leaving?")){
            $("#save-vars").trigger("click");
        }
        $.redirect('show-events.php', {'scene':scene, type:"Story"});
    });
    $("#show-flavour-events").click(function(){
        if(changed&&confirm("Save vars before leaving?")){
            $("#save-vars").trigger("click");
        }
        $.redirect('show-events.php', {'scene':scene, type:"Flavour"});
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
    if(scene){
        $("#scene-title").append("<div>"+scene+"</div>");
        $.getJSON("../../data/json/data/scenes-list.json",function(data){
            fileData = data["Story"].find(function(elm){return elm.name===scene});
            var keys = Object.keys(fileData.vrs);
            keys.forEach(function(key){
                showVar(key,fileData.vrs[key]);
            });
            if(!keys.length) showVar();
            $(".variable").first().trigger("click");
        });
        
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