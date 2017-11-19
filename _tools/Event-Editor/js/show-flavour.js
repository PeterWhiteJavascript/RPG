var changed = false;
//Any hidden events are included in the list
//When an event is shown, remove the event from all arrays it is a part of.
var groupsList = {};
var convertValue = function(value){
    if(value.toLowerCase()==="false") return false;
    if(value.toLowerCase()==="true") return true;
    if(Number.isInteger(parseInt(value))) return parseInt(value);
    return value;
};
$(function(){
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
    function generateGroupsList(){
        var condKeys = Object.keys(condTypes);
        for(var i=0;i<condKeys.length;i++){
            groupsList[condKeys[i]] = {};
            for(var j=0;j<condTypes[condKeys[i]].length;j++){
                groupsList[condKeys[i]][condTypes[condKeys[i]][j]] = [];
            }
        }
    };
    generateGroupsList();
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
    function newEventGroup(name,priority,recur){
        var groupName = "<div class='group-name'>"+name+"</div>";
        if(!name.length){
            groupName = "<input class='group-name-input' placeholder='Please input a name'>";
        }
        return "<div class='event-group'>"+groupName+"<div class='add-group'>Add Group</div><div class='conds-cont'></div><div class='event-cont'></div><div class='event-options'><span class='priority-desc'>Priority: </span><input type='number' min='0' value="+priority+"><span class='recur-desc'>Recur: </span><select initial-value='"+recur+"'><option value='One'>One</option><option value='false'>false</option><option value='true'>true</option></select></div>";
    };
    function newCondGroup(data){
        return "<div class='cond-group'><span class='group-remove remove'>X</span><select class='cond-group-cond-type' initial-value='"+data+"'><option value='true'>All</option><option value='false'>Some</option></select><div class='add-cond'>Add Cond</div></div>";
    };
    function displayCond(data){
        $(".cond-group").last().append(newCond(data));
    };
    function displayEvent(data){
        $(".event-group").last().children(".event-cont").append(newEventButton(data));
    }
    function displayEventGroup(name,data){
        $("#group-cont").append(newEventGroup(name,data[1],data[3]));
        for(var k=0;k<data[0].length;k++){
            $(".conds-cont").last().append(newCondGroup(data[0][k][0]));
            //Start at 1 as 0 is reserved for "all" or "at least 1"
            for(var l=1;l<data[0][k].length;l++){
                displayCond(data[0][k][l]);
            }
        }
        for(var j=0;j<data[2].length;j++){
            displayEvent(data[2][j]);
        }
    };
    function hideGroup(group){
        var groupName = $(group).children(".group-name").text();
        $(group).children(".conds-cont").children(".cond-group").children(".event-cond").each(function(){
            groupsList[$(this).children(".cond-groups").val()][$(this).children(".cond-types").val()].push(groupName);
        });
        $(group).hide();
    };
    function displayEvents(){
        var data = flavour.groups;
        var keys = Object.keys(data);
        $("#events-cont").append("<div id='group-cont'></div>");
        for(var i=0;i<keys.length;i++){
            displayEventGroup(keys[i],data[keys[i]]);
        }
        $(".event-button").off().on("click",function(){
            $(".event-button").removeClass("selected");
            $(this).addClass("selected"); 
        });
        setTimeout(function(){
            $(".event-group").last().trigger("click");
            $(".event-button").first().trigger("click");
            $("#triggers-select-all").trigger("click");
        });
        
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

    $("#group-cont").sortable({
        stop:function(){saveEvents();}
    }).disableSelection();
    $("select[initial-value]").each(function(){
        var val = $(this).attr("initial-value");
        $(this).children('option[value="' + val + '"]').prop('selected', true);
    });
    $(".event-group").last().trigger("click");
    $(".event-group").last().children(".event-button").last().trigger("click");
    function makeEventContSortable(obj){
        $(obj).sortable({
            connectWith: ".event-cont",
            start:function(event, ui){
                $(ui.item).trigger("click");
            },
            stop:function(event,ui){
                if($(this).parent().children(".group-name").text()!==$(ui.item).parent().parent().children(".group-name").text()){
                    $(ui.item).parent().parent().trigger("click");
                    $.ajax({
                        type:'POST',
                        url:'move-flavour-event.php',
                        data:{filename:$(ui.item).text(),to:$(ui.item).parent().parent().children(".group-name").text(),from:$(this).parent().children(".group-name").text()},
                        dataType:'json'
                    });
                    saveEvents();
                }
            }
        }).disableSelection();
    }
    makeEventContSortable($(".event-cont"));
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
                    newFile.bg = "bg/castle-room.jpg";
                    newFile.disabledChoices = [];
                    newFile.pageList = ["start"];
                    newFile.onload = [];
                    newFile.actions = [];
                    newFile.vrs = {};
                    break;
                case "battleScene":
                    newFile.map = "Venoria/Venoria-Castle-Outside.tmx";
                    newFile.script = [];
                    newFile.characters = [];
                    newFile.vrs = {};
                    break;
                case "battle":
                    newFile.map = "Venoria/Venoria-Castle-Outside.tmx";
                    newFile.placementSquares = [];
                    newFile.maxAllies = 6;
                    newFile.events = [];
                    newFile.characters = [];
                    newFile.victory = {
                        next:[],
                        events:[]
                    };
                    newFile.defeat = {
                        next:[],
                        events:[]
                    };
                    newFile.vrs = {};
                    break;
            }
            $.ajax({
                type:'POST',
                url:'create-event.php',
                data:{type:"Flavour",data:JSON.stringify(newFile),scene:$(".event-group.selected").children(".group-name").text()},
                dataType:'json'
            })
            .done(function(data){console.log(data);changed=false;})
            .fail(function(data){console.log(data)});
            saveEvents();
            
        });
        $(".full-screen-hider").click(function(){finishNewEvent();});
    });
    
    $("#new-group").click(function(){
        displayEventGroup("",[[],0,[],"One"]);
        $(".event-group").last().children(".event-options").children("select").each(function(){
            var val = $(this).attr("initial-value");
            $(this).children('option[value="' + val + '"]').prop('selected', true);
        });
    });
    $("#edit-event").click(function(){
        saveEvents();
        $.redirect('edit-event.php', {'scene':$(".selected.event-button").parent().parent().children(".group-name").text(), 'event':$(".selected.event-button").text(), 'type':"Flavour"});
    });
    $("#delete-event").click(function(){
        var event = $(".selected.event-button");
        var eventName = $(event).text();
        var eventGroup = $(event).parent().parent().children(".group-name").text();
        if(confirm("Are you sure you want to delete "+eventName+"?")){
            //Remove the event file
            var path = "../../data/json/story/events/Flavour/"+eventGroup+"/"+eventName+".json";
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
        var text = $(".selected.event-group").children(".group-name").text();
        if(confirm("Are you sure you want to delete "+text+"?")){
            $(".selected.event-group").remove();
            $.ajax({
                type:'POST',
                url:'delete-flavour-group.php',
                data:{name:text},
                dataType:'json'
            });
        };
        
    });
    function saveEvents(){
        var groups = $(".event-group");
        var savedGroups = {};
        groups.each(function(){
            var condGroups = $(this).children(".conds-cont").children(".cond-group");
            var saveConds = [];
            condGroups.each(function(){
                var conds = $(this).children(".event-cond");
                var saveCondGroup = [convertValue($(this).children(".cond-group-cond-type").val())];
                conds.each(function(){
                    switch($(this).children(".cond-groups").val()){
                        case "Act":
                        case "Officer":
                        case "Character Class":
                        case "Nationality":
                        case "Value":
                        case "Methodology":
                        case "Personality":
                        case "Gender":
                            saveCondGroup.push([
                                $(this).children(".cond-groups").val(),
                                $(this).children(".cond-types").val()
                            ]);
                            break;
                        case "Base Stats":
                        case "Derived Stats":
                        case "Awards":
                            saveCondGroup.push([
                                $(this).children(".cond-groups").val(),
                                $(this).children(".cond-types").val(),
                                $(this).children(".cond-operator").val(),
                                convertValue($(this).children(".cond-value").val())
                            ]);
                            break;
                        case "Vars":
                            switch($(this).children(".cond-types").val()){
                                case "Scene":
                                    saveCondGroup.push([
                                        $(this).children(".cond-groups").val(),
                                        $(this).children(".cond-types").val(),
                                        $(this).children(".cond-act").val(),
                                        $(this).children(".cond-scene-var").val(),
                                        $(this).children(".cond-operator").val(),
                                        convertValue($(this).children(".cond-var-value").val())
                                    ]);
                                    break;
                                case "Global":
                                    saveCondGroup.push([
                                        $(this).children(".cond-groups").val(),
                                        $(this).children(".cond-types").val(),
                                        $(this).children(".cond-global-var").val(),
                                        $(this).children(".cond-operator").val(),
                                        convertValue($(this).children(".cond-var-value").val())
                                    ]);
                                    break;
                            }
                            break;

                    }
                });
                saveConds.push(saveCondGroup);
            });
            var events = $(this).children(".event-cont").children(".event-button");
            var saveEvents = [];
            events.each(function(){
                saveEvents.push($(this).text());
            });
            var priority = $(this).children(".event-options").children("input").val();
            var recur = $(this).children(".event-options").children("select").val();
            var name = $(this).children(".group-name").text();
            savedGroups[name] = [
                saveConds,
                convertValue(priority),
                saveEvents,
                convertValue(recur)
            ];
        });
        flavour.groups = savedGroups;
        
        $.ajax({
            type:'POST',
            url:'save-flavour-groups.php',
            data:{file:JSON.stringify(flavour)},
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
        $.redirect('../../index.php', {'scene':$(".selected.event-button").parent().parent().children(".group-name").text(), 'event':$(".selected.event-button").text(), 'type':"Flavour", testing:true});
    });

    $("#back").click(function(){
        saveEvents();
        window.location = "load.php";
    });
    $("#back-to-main").click(function(){
        saveEvents();
        window.location = "index.php";
    });
    $(document).on("click",".remove",function(e){
        $(this).parent().remove();
    });
    $(document).on("change",".group-name-input",function(){
        if($(this).val().length>0){
            var name = $(this).val().replace(/\s+/g, '-');
            var t = this;
            $.ajax({
                type:'POST',
                url:'new-flavour-group.php',
                data:{name:name}
            })
            .done(function(data){
                if(!data.length){
                    alert("Group name already in use!");
                } else {
                    makeEventContSortable($(t).parent().children(".event-cont"));
                    $(t).replaceWith("<div class='group-name'>"+name+"</div>");
                    saveEvents();
                }
            });
            
            
        }
    });
    $(document).on("click",".event-button",function(){
        $(".event-button").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on("click",".event-group",function(){
        $(".event-group").removeClass("selected");
        $(this).addClass("selected");
    });
    $(document).on("click",".add-group",function(){
        $(this).parent().children(".conds-cont").append(newCondGroup(true));
    });
    $(document).on("click",".add-cond",function(){
        $(this).parent().append(newCond(["Act","Act-1-1"]));
    });
    $("#triggers-select-all").click(function(){
        $(".trigger select").multiselect("selectAll",false);
        $(".trigger select").multiselect('updateButtonText');
        $(".event-group").show();
        generateGroupsList();
    });
    $("#triggers-select-none").click(function(){
        $(".trigger select").multiselect("deselectAll",false);
        $(".trigger select").multiselect('updateButtonText');
        $(".event-group").each(function(){
            hideGroup($(this));
        });
    });
    $(document).on("change",".event-options input",function(){
        saveEvents();
    });
    $(document).on("change",".event-options select",function(){
        saveEvents();
    });
    $(document).on("change",".event-cond input",function(){
        saveEvents();
    });
    $(document).on("change",".event-cond select",function(){
        saveEvents();
    });
    
    
    function showGroups(name,val){
        var toShow = groupsList[name][val];
        for(var i=0;i<toShow.length;i++){
            var groupName = toShow[i];
            var groupConds = flavour.groups[groupName][0];
            //Remove other references to this group
            for(var j=0;j<groupConds.length;j++){
                var conds = groupConds[j];
                for(var k=1;k<conds.length;k++){
                    var cond = conds[k];
                    groupsList[cond[0]][cond[1]].splice(groupsList[cond[0]][cond[1]].indexOf(groupName),1);
                }
                
            }
            $(".group-name").each(function(){
                if($(this).text()===groupName) $(this).parent().show();
            });
        }
    };
    function hideGroups(name,val){
        $(".conds-cont").each(function(){
            var found = false;
            $(this).children(".cond-group").children(".event-cond").each(function(){
                if($(this).children(".cond-groups").val()===name&&$(this).children(".cond-types").val()===val){
                    found = true;
                }
            });
            //Loop through each of the conds to see if everything is diabled
            if(found){
                var noneSelected = true;
                $(this).children(".cond-group").children(".event-cond").each(function(){
                    var triggerName = $(this).children(".cond-groups").val();
                    var triggerVal = $(this).children(".cond-types").val();
                    var select = $(".trigger").children("span").children("select[name='"+triggerName+"']");
                    var selected = false;
                    if($(select).children("optgroup").length){
                        $(select).children("optgroup").children("option:selected").each(function(){
                            if($(this).val()===triggerVal) selected = true;
                        });
                    } else {
                        $(select).children("option:selected").each(function(){
                            if($(this).val()===triggerVal) selected = true;
                        });
                    }
                    if(selected&&noneSelected){
                        noneSelected = false;
                    }
                });
                if(noneSelected){
                    hideGroup($(this).parent());
                }
            }
        });
    };
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
        selectAllNumber: true,
        onChange:function(option, checked){
            function change(opt){
                var elm = $(opt);
                if($(elm).parent().is("optgroup")){
                    elm = $(opt).parent();
                }
                if(checked){
                    showGroups($(elm).parent().attr("name"),$(opt).val());
                } else {
                    hideGroups($(elm).parent().attr("name"),$(opt).val());
                }
            }
            if($.isArray(option)){
                $(option).each(function(){
                    change(this);
                });
            } else {
                change(option);
            }
        },
        onSelectAll:function(){
            var name = $($(this)[0]["$select"][0]).attr("name");
            if($($(this)[0]["$select"][0]).children("optgroup").length){
                $($(this)[0]["$select"][0]).children("optgroup").children("option").each(function(){
                    showGroups(name,$(this).val());
                });
            } else {
                $($(this)[0]["$select"][0]).children("option").each(function(){
                    showGroups(name,$(this).val());
                });
            }
        },
        onDeselectAll:function(){
            var name = $($(this)[0]["$select"][0]).attr("name");
            if($($(this)[0]["$select"][0]).children("optgroup").length){
                $($(this)[0]["$select"][0]).children("optgroup").children("option").each(function(){
                    hideGroups(name,$(this).val());
                });
            } else {
                $($(this)[0]["$select"][0]).children("option").each(function(){
                    hideGroups(name,$(this).val());
                });
            }
        }
    });
});