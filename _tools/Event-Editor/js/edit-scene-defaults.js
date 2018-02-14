$(function(){
    function saveFile(){
        var props = $(".UIC-prop");
        function getActions(){
            var actions = $("#location-actions").children(".action");
            var data = [];
            actions.each(function(){
                data.push({
                    text:$(this).children("input:eq(0)").val(),
                    func:$(this).children("select:eq(0)").val()
                });
            });
            return data;
        }
        var data = {
            "Story":{
                "music":$(props[0]).val(),
                "bg":$(props[1]).val(),
                "startPage":$(props[2]).val()
            },
            "Location":{
                "music":$(props[3]).val(),
                "bg":$(props[4]).val(),
                "defaultActions":getActions()
            },
            "Battle Scene":{
                "music":$(props[5]).val(),
                "map":$(props[6]).val()+"/"+$(props[7]).val()
            },
            "Battle":{
                "music":$(props[8]).val(),
                "map":$(props[9]).val()+"/"+$(props[10]).val(),
                "maxAllies":$(props[11]).val(),
                "defaultDirection":$(props[12]).val()
            }
        };
        
        $.ajax({
            type:'POST',
            url:'save-scene-defaults.php',
            data:{data:JSON.stringify(data),scene:scene},
            dataType:'json'
        })
        .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
        .fail(function(data){console.log(data)});
    };
    var uic = new UIC({
        fileData:fileData,
        topBarProps:{
            Save:function(){
                saveFile();
            },
            Back:function(){
                if(confirm("Are you sure you want to go back without saving?")){
                    $.redirect("load.php");
                }
            }
        }
    });
    uic.createTopMenu($("#editor-content"));
    
    var data = uic.fileData;
    //Fill the selects
    $("#story-props").children("select:eq(0)").append(uic.getOptions(GDATA.musicFileNames));
    $("#story-props").children("select:eq(0)").val(data["Story"].music);
    $("#story-props").children("select:eq(1)").append(uic.getOptions(GDATA.bgFiles));
    $("#story-props").children("select:eq(1)").val(data["Story"].bg);
    
    $("#location-props").children("select:eq(0)").append(uic.getOptions(GDATA.musicFileNames));
    $("#location-props").children("select:eq(0)").val(data["Location"].music);
    $("#location-props").children("select:eq(1)").append(uic.getOptions(GDATA.bgFiles));
    $("#location-props").children("select:eq(1)").val(data["Location"].bg);
    function addAction(props){
        props = props || {text:"Page 0",func:"createGatherInfoMenu"};
        $("#location-actions").append("<div class='action'><span class='quarter-width'>Title</span><input class='sixty-five-width' value='"+props.text+"' type='text'><span class='remove-choice'>x</span><span class='quarter-width'>Action</span><select class='three-quarter-width'>"+uic.getOptions(["changeEvent","changePage","createRecruitMenu","displayBuyItemsList","displaySellItemsList","createGatherInfoMenu","createHuntMenu"])+"</select></div>");
        $(".action").last().children("select").val(props.func);
        $(".remove-choice").last().click(function(){
            $(this).parent().remove();
        });
    }
    for(var i=0;i<data["Location"].defaultActions.length;i++){
        addAction(data["Location"].defaultActions[i]);
    }
    $("#location-props").children(".UIC-button").click(function(){
        addAction();
    });
    
    
    $("#battle-scene-props").children("select:eq(0)").append(uic.getOptions(GDATA.musicFileNames));
    $("#battle-scene-props").children("select:eq(0)").val(data["Battle Scene"].music);
    $("#battle-scene-props").children("select:eq(1)").append(uic.getOptions(GDATA.mapFileNames));
    var map = data["Battle Scene"].map.split("/");
    $("#battle-scene-props").children("select:eq(1)").val(map[0]);
    $("#battle-scene-props").children("select:eq(2)").append(uic.getOptions(Object.keys(GDATA.mapFileNames)));
    $("#battle-scene-props").children("select:eq(2)").val(map[1]);
    uic.linkSelects($("#battle-scene-props").children("select:eq(1)"),$("#battle-scene-props").children("select:eq(2)"),GDATA.mapFileNames);
    $("#battle-scene-props").children("select:eq(1)").trigger("change");
    
    
    
    $("#battle-props").children("select:eq(0)").append(uic.getOptions(GDATA.musicFileNames));
    $("#battle-props").children("select:eq(0)").val(data["Battle"].music);
    $("#battle-props").children("select:eq(1)").append(uic.getOptions(GDATA.mapFileNames));
    var map = data["Battle"].map.split("/");
    $("#battle-props").children("select:eq(1)").val(map[0]);
    $("#battle-props").children("select:eq(2)").append(uic.getOptions(Object.keys(GDATA.mapFileNames)));
    $("#battle-props").children("select:eq(2)").val(map[1]);
    uic.linkSelects($("#battle-props").children("select:eq(1)"),$("#battle-props").children("select:eq(2)"),GDATA.mapFileNames);
    $("#battle-props").children("select:eq(1)").trigger("change");
    $("#battle-props").children("input:eq(0)").val(data["Battle"].maxAllies);
    $("#battle-props").children("select:eq(3)").append(uic.getOptions(["up","right","down","left"]));
    $("#battle-props").children("select:eq(3)").val(data["Battle"].defaultDirection);
    
    
});