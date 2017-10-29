var changed = false;
var convertValue = function(value){console.log(value)
    if(value.toLowerCase()==="false") return false;
    if(value.toLowerCase()==="true") return true;
    if(Number.isInteger(parseInt(value))) return parseInt(value);
    return value;
};
$(function(){
    function confirmFlowchartPosition(){
        if(changed&&confirm("Save?")){
            $("#save").trigger("click");
        }
    };
    function newEventButton(text){
        return "<div id='"+text+"' class='event-button'>"+text+"</div>";
    };
    var condTypes = {
        "Act":["Act-1-1","Act-1-2","Act-1-3","Act-1-4","Act-2-1","Act-2-2","Act-2-3","Act-2-4","Act-3-1","Act-3-2","Act-3-3","Act-3-4","FinalAct"],
        "Officer":["Astraea","Lysandra","Gaios","Imamu","Rutendo","Nala","Sjrna","Eko","Nicodemus"],
        "Character Class":["Legionnaire","Berserker","Vanguard","Assassin","Skirmisher","Archer","Illusionist","Elementalist","Healer"],
        "Nationality":["Venorian","Dardoian","Aliudramilan","Talumpatuan","Nomadic"],
        "Value":["Egoist","Nepotist","Altruist"],
        "Methodology":["Pragmatic","Intuitive","Kind"],
        "Personality":["Sensitive","Impassive","Unmotivated","Curious","Clingy","Nonpartisan","Charismatic","Awkward","Violent","Pacifistic","Hedonistic","Ascetic","Extraverted","Shy"],
        "Gender":["Male","Female"],
        "Base Stats":["str","end","dex","wsk","rfl","ini","enr","skl","eff"],
        "Derived Stats":["Max Hit Points","Max Technique Points","Pain Tolerance","Damage Reduction","Physical Resistance","Mental Resistance","Magical Resistance","Attack Range","Max Attack Damage","Encumbrance Threshold","Total Weight","Encumbrance Penalty","Defensive Ability","Attack Accuracy","Critical Chance","Counter Chance","Attack Speed","Move Speed"],
        "Awards":["Enemies Defeated","Assisted","Battles Participated","Damage Dealt","Damage Taken","Self Healed","Target Healed","Times Wounded","Visited","Feasted","Guest of Honour","Mentored","Times Hunted"],
        "Vars":["Scene","Global"]
    };
    function createOptions(arr){
        var st = "";
        arr.forEach(function(itm){
            st += "<option value='"+itm+"'>"+itm+"</option>";
        });
        return st;
    }
    function getSceneVars(act){
        return Object.keys(scenes.Story.find(function(s){return s.name===act}).vrs);
    }
    function getGlobalVars(){
        return Object.keys(globalVars.vrs);
    }
    function newCond(cond){
        var groupsString = createOptions(["Act","Officer","Character Class","Nationality","Value","Methodology","Personality","Gender","Base Stats","Derived Stats","Awards","Vars"]);            
        var opString = createOptions(["==","!=","<",">","<=",">="]);   
        var condType = cond[1] || condTypes[cond[0]][0];
        var condOp = cond[2] || "==";
        var condVal = cond[3] || "";
        //Figure out which kind of group we have
        switch(cond[0]){
            //Only need name and value
            case "Act":
            case "Officer":
            case "Character Class":
            case "Nationality":
            case "Value":
            case "Methodology":
            case "Personality":
            case "Gender":
                return "<div class='event-cond'><span class='cond-remove remove'>X</span><select class='cond-groups cond-groups-long' initial-value='"+cond[0]+"'>"+groupsString+"</select><select class='cond-types cond-types-long' initial-value='"+condType+"'>"+createOptions(condTypes[cond[0]])+"</select></div>";
                break;
            case "Base Stats":
            case "Derived Stats":
            case "Awards":
                return "<div class='event-cond'><span class='cond-remove remove'>X</span><select class='cond-groups' initial-value='"+cond[0]+"'>"+groupsString+"</select><select class='cond-types' initial-value='"+condType+"'>"+createOptions(condTypes[cond[0]])+"</select><select class='cond-operator' initial-value='"+condOp+"'>"+opString+"</select><input class='cond-value' value='"+condVal+"'></div>";
                break;
            case "Vars":
                switch(condType){
                    case "Scene":
                        var act = cond[2] || "Act-1-1";
                        var sceneVars = getSceneVars(act);
                        var sceneVar = cond[3] || sceneVars[0];
                        var condOp = cond[4] || "==";
                        var condVal = cond[5] || "";
                        return "<div class='event-cond'><span class='cond-remove remove'>X</span><select class='cond-groups' initial-value='"+cond[0]+"'>"+groupsString+"</select><select class='cond-types cond-scene-types' initial-value='"+condType+"'>"+createOptions(condTypes[cond[0]])+"</select><select class='cond-act' initial-value='"+act+"'>"+createOptions(condTypes["Act"])+"</select><select class='cond-scene-var' initial-value='"+sceneVar+"'>"+createOptions(sceneVars)+"</select><select class='cond-operator' initial-value='"+condOp+"'>"+opString+"</select><input class='cond-var-value' value='"+condVal+"'></div>";
                        break;
                    case "Global":
                        var globalVars = getGlobalVars();
                        var globalVar = cond[2] || globalVars[0];
                        var condOp = cond[3] || "==";
                        var condVal = cond[4] || "";
                        return "<div class='event-cond'><span class='cond-remove remove'>X</span><select class='cond-groups' initial-value='"+cond[0]+"'>"+groupsString+"</select><select class='cond-types cond-global-types' initial-value='"+condType+"'>"+createOptions(condTypes[cond[0]])+"</select><select class='cond-global-var' initial-value='"+globalVar+"'>"+createOptions(globalVars)+"</select><select class='cond-operator' initial-value='"+condOp+"'>"+opString+"</select><input class='cond-var-value' value='"+condVal+"'></div>";
                        break;
                }
                break;

        }
    };
    function newEventGroup(priority,recur){
        return "<div class='event-group'><div class='add-cond'>Add Cond</div><div class='conds-cont'></div><div class='event-cont'></div><div class='event-options'><span class='priority-desc'>Priority: </span><input type='number' min='0' value="+priority+"><span class='recur-desc'>Recur: </span><select initial-value='"+recur+"'><option value='One'>One</option><option value='false'>false</option><option value='true'>true</option></select></div>";
    };
    function displayEvents(){
        var data = flavour.groups;
        $("#events-cont").append("<div id='group-cont'></div>");
        for(var i=0;i<data.length;i++){
            $("#group-cont").append(newEventGroup(data[i][1],data[i][3]));
            for(var k=0;k<data[i][0].length;k++){
                $(".event-group").last().children(".conds-cont").append(newCond(data[i][0][k]));
            }
            for(var j=0;j<data[i][2].length;j++){
                $(".event-group").last().children(".event-cont").append(newEventButton(data[i][2][j]));
            }
        }
        $(".event-button").off().on("click",function(){
            $(".event-button").removeClass("selected");
            $(this).addClass("selected"); 
        });
        $(".event-button").trigger("click");
    };
    displayEvents();
    
    $(document).on("change",".cond-scene-types, .cond-global-types",function(){
        var newCondition = $(newCond(["Vars",$(this).val()]));
        $(this).parent().replaceWith(newCondition);
        $(newCondition).children("select").each(function(){
            var val = $(this).attr("initial-value");
            $(this).children('option[value="' + val + '"]').prop('selected', true);
        });
    });
    $(document).on("change",".cond-groups",function(){
        var newCondition = $(newCond([$(this).val()]));
        $(this).parent().replaceWith(newCondition);
        $(newCondition).children("select").each(function(){
            var val = $(this).attr("initial-value");
            $(this).children('option[value="' + val + '"]').prop('selected', true);
        });
    });

    $(".event-cont").sortable({
        connectWith: ".event-cont",
        start:function(event, ui){
            $(ui.item).trigger("click");
        }
    }).disableSelection();
    $("select[initial-value]").each(function(){
        var val = $(this).attr("initial-value");
        $(this).children('option[value="' + val + '"]').prop('selected', true);
    });
    $(".event-group").last().trigger("click");
    $(".event-group").last().children(".event-button").last().trigger("click");
    
    function finishNewEvent(){
        $(".new-event-cont").remove();
        $(".full-screen-hider").hide();
        $(".full-screen-hider").off();
    }
    //Load a box in the center that allows the user to input type and name. On confirm, create the file.
    $("#new-event").click(function(){
        if(!$(".event-group").length){
            $("#new-group").trigger("click");
            $(".event-group").last().trigger("click");
        }
        $(".full-screen-hider").show();
        $("#main-content").append('<div class="new-event-cont"><div class="new-event-title">NEW EVENT</div><div class="new-event-name"><input value="" placeholder="Name"></div><div class="new-event-type"><select><option>story</option><option>location</option><option>battleScene</option><option>battle</option></select></div><div class="new-event-buttons"><span class="new-event-confirm">Confirm</span><span class="new-event-cancel">Cancel</span></div></div>');
        $(".new-event-cancel").click(function(){finishNewEvent();});
        $(".new-event-confirm").click(function(){
            var newName = $(".new-event-name input").val().replace(/\s+/g, '-');
            var newType = $(".new-event-type select").val();
            if(!newName){
                alert("Please set a name");
                return;
            } else {
                var button = $(newEventButton(newName)).appendTo($(".event-group.selected").children(".event-cont"));
                button.off().on("click",function(){
                    $(".event-button").removeClass("selected");
                    $(this).addClass("selected"); 
                });
                button.trigger("click");
            }
            //Create the event in story
            sceneData.events.push({
                events:[],
                sceneVars:[],
                globalVars:[],
                name:newName,
                left:"100px",
                top:"100px"
            });
            //Create the event file
            finishNewEvent();
            var newFile = {};
            newFile.name = newName;
            newFile.kind = newType;
            newFile.music = "demo.mp3";
            switch(newType){
                case "story":
                    newFile.pages = [];
                    newFile.vrs = {};
                    break;
                case "location":
                    newFile.bg = "";
                    newFile.disabledChoices = [];
                    newFile.pageList = ["start"];
                    newFile.onload = [];
                    newFile.actions = [];
                    newFile.vrs = {};
                    break;
                case "battleScene":
                    newFile.map = "";
                    newFile.script = [];
                    newFile.characters = [];
                    newFile.vrs = {};
                    break;
                case "battle":
                    newFile.map = "";
                    newFile.placementSquares = [];
                    newFile.maxAllies = 6;
                    newFile.events = [];
                    newFile.characters = [];
                    newFile.victory = {};
                    newFile.defeat = {};
                    newFile.vrs = {};
                    break;
            }
            $.ajax({
                type:'POST',
                url:'create-event.php',
                data:{scene:scene,sceneType:type,data:JSON.stringify(newFile)},
                dataType:'json'
            })
            .done(function(data){console.log(data);changed=false;})
            .fail(function(data){console.log(data)});
            $("#save").trigger("click");
            
        });
        $(".full-screen-hider").click(function(){finishNewEvent();});
    });
    
    $("#new-group").click(function(){
        $("#group-cont").append(newEventGroup(1,"true"));
        $(".event-group").last().children(".event-options").children("select").each(function(){
            var val = $(this).attr("initial-value");
            $(this).children('option[value="' + val + '"]').prop('selected', true);
        });
    });
    $("#edit-event").click(function(){
        confirmFlowchartPosition();
        $.redirect('edit-event.php', {'scene':scene, 'event':$(".selected.event-button").text(), 'type':type});
    });
    $("#delete-event").click(function(){
        var event = $(".selected.event-button");
        var eventName = $(event).text();
        if(confirm("Are you sure you want to delete "+eventName+"?")){
            var cons = $("."+eventName);
            cons.each(function(){
                if($(this).attr("class").split(" ")[2]===eventName){
                    $("#"+$(this).attr("class").split(" ")[1]).addClass("invalid-event-pointer");
                }
            });
            //Remove the event file
            var path = "../../data/json/story/events/"+type+"/"+scene+"/"+eventName+".json";
            $.ajax({
                type:'POST',
                url:'delete-file.php',
                data:{path:path},
                dataType:'json'
            })
            .done(function(data){console.log(data);alert(eventName+" was removed successfully.");})
            .fail(function(data){console.log(data);});
            $(event).remove();
            saveEvents();
        }
    });
    $("#delete-group").click(function(){
        $(".selected.event-group").remove();
    });
    function saveEvents(){
        var groups = $(".event-group");
        var savedGroups = [];
        groups.each(function(){
            var conds = $(this).children(".conds-cont").children(".event-cond");
            var saveConds = [];
            conds.each(function(){
                saveConds.push([
                    $(this).children(".cond-groups").val(),
                    $(this).children(".cond-types").val(),
                    $(this).children(".cond-operator").val(),
                    convertValue($(this).children(".cond-value").val())
                ]);
            });
            var events = $(this).children(".event-cont").children(".event-button");
            var saveEvents = [];
            events.each(function(){
                saveEvents.push($(this).text());
            });
            var priority = $(this).children(".event-options").children("input").val();
            var recur = $(this).children(".event-options").children("select").val();
            savedGroups.push([
                saveConds,
                convertValue(priority),
                saveEvents,
                convertValue(recur)
            ]);
        });
        return;
        file[scene][$(".category.selected").text()] = savedGroups;
        $.ajax({
            type:'POST',
            url:'save-flavour-groups.php',
            data:{file:JSON.stringify(file)},
            dataType:'json'
        })
        .done(function(data){console.log(data);changed=false;})
        .fail(function(data){console.log(data);});
    }
    $("#save").click(function(){
        saveEvents();
        alert("Saved!");
    });
    $("#test-event").click(function(){
        $.redirect('../../index.php', {'scene':scene, 'event':$(".selected.event-button").text(), 'type':type, testing:true});
    });

    $("#back").click(function(){
        confirmFlowchartPosition();
        window.location = "load.php";
    });
    $("#back-to-main").click(function(){
        confirmFlowchartPosition();
        window.location = "index.php";
    });
    $(document).on("click",".remove",function(e){
        $(this).parent().remove();
    });
    
    $(document).on("click",".event-button",function(){
        $(".event-button").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on("click",".event-group",function(){
        $(".event-group").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on("click",".add-cond",function(){
        $(this).parent().children(".conds-cont").append(newCond(["Act","Act-1-1"]));
    });
    $("#triggers-select-all").click(function(){
        $(".trigger select").multiselect("selectAll",false);
        $(".trigger select").multiselect('updateButtonText')
    });
    $("#triggers-select-none").click(function(){
        $(".trigger select").multiselect("deselectAll",false);
        $(".trigger select").multiselect('updateButtonText')
    });
    
    
    $('.trigger select').multiselect({
        includeSelectAllOption: true,
        enableClickableOptGroups: true,
        enableCollapsibleOptGroups: true,
        buttonWidth:"100%",
        buttonText: function(options, select) {
            if (options.length === 0) {
                return $(select).attr("title");
            }
            else if(($(select).children("option").length+$(select).children("optgroup").children("option").length===options.length)){
                return $(select).attr("title")+" (All)";
            }
            else if (options.length > 3) {
                return $(select).attr("title")+ " ("+options.length+")" ;
            }
            else {
                var labels = [];
                options.each(function() {
                    if ($(this).attr('label') !== undefined) {
                        labels.push($(this).attr('label'));
                    }
                    else {
                        labels.push($(this).html());
                    }
                });
                return labels.join(', ') + '';
            }
        },
        selectAllNumber: true
    });
});