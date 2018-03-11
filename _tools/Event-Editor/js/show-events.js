var changed = false;
var globalVars;
var scene = GDATA.eventPointer.scene;
$(function(){
    $("#scene-title").append("<div>"+scene+"</div>");
    var eventsInScene;
    var sceneData;
    var file;
    var uic = new UIC({});
    function confirmFlowchartPosition(){
        if(changed&&confirm("Save flowchart position?")){
            saveEvents();
        }
    };
    function adjustConnection(div){
        if(!$(div).length) return;
        var obj1 = $("#"+$(div).attr("class").split(" ")[1]);
        var obj2 = $("#"+$(div).attr("class").split(" ")[2]);

        var obj1pos = obj1.position();
        var obj2pos = obj2.position();
        if(!obj2pos) return;
        var obj1center = obj1.outerWidth()/2;
        var obj2center = obj2.outerWidth()/2;
        var distFromCenter = Math.abs((obj1pos.left - obj2pos.left) + (obj1center - obj2center));
        $(div).children(".end-arrow").attr("class","end-arrow");
        //If it's on top or bottom
        if(distFromCenter<obj2center){
            if(obj1pos.top<obj2pos.top){
                $(div).children(".end-arrow").addClass("bottom-end");
            } else {
                $(div).children(".end-arrow").addClass("top-end");
            }
        } 
        //If it's on left or right
        else {
            var obj1sideCenter = obj1.outerHeight(true)/2;
            var obj2sideCenter = obj2.outerHeight(true)/2;
            var distFromSideCenter = Math.abs((obj1pos.top - obj2pos.top) + (obj1sideCenter - obj2sideCenter));
            if(distFromSideCenter<obj2sideCenter){
                if(obj1pos.left<obj2pos.left){
                    $(div).children(".end-arrow").addClass("right-end");
                } else {
                    $(div).children(".end-arrow").addClass("left-end");
                }
            } else {
                if(obj2pos.top<obj1pos.top){
                    if(obj1pos.left<obj2pos.left){
                        $(div).children(".end-arrow").addClass("right-end-bend-up");
                    } else {
                        $(div).children(".end-arrow").addClass("left-end-bend-up");
                    }
                } else {
                    if(obj1pos.left<obj2pos.left){
                        $(div).children(".end-arrow").addClass("right-end-bend-down");
                    } else {
                        $(div).children(".end-arrow").addClass("left-end-bend-down");
                    }
                }
            }
        }
    };

    function showFlowchart(){
        var flowchart = $('#flowchart');
        $(flowchart).css("width",$(flowchart).parent().width()); 
        $(flowchart).css("height",$(flowchart).parent().height());
        for(var i=0;i<eventsInScene.length;i++){
            var event = eventsInScene[i];
            $(flowchart).append(newEventButton(event.name,event.type));
            $(".event-button").last().addClass("absolute-event-button");
            $(".event-button").last().css({"top":event.top,"left":event.left});
            
        }
        $('*').disableSelection();
        $.repeat().add('connection').each($).connections('update').wait(0);

        $(".event-button").draggable({
            containment:$("#events-flowchart-cont"),
            drag:function(){
                $("."+$(this).attr("id")).each(function(){
                    adjustConnection($(this));
                });
                changed = true;
            }
        });
        //Wrap in setTimeout to have elements properly added to the DOM. This is because DOM update is asynchronous
        setTimeout(function(){
            //Connect everything
            for(var i=0;i<eventsInScene.length;i++){
                var event = eventsInScene[i];
                for(var j=0;j<event.events.length;j++){
                    $("#"+event.name).connections({to:"#"+event.events[j][2],class:'connection '+event.name+' '+event.events[j][2]+'',id:event.name+"-TO-"+event.events[j][2]});
                    var elm = $("#"+event.name+"-TO-"+event.events[j][2]);
                    if(elm.length){
                        elm.append("<div class='end-arrow'></div>");
                        adjustConnection("#"+event.name+"-TO-"+event.events[j][2]);
                    } else {
                        $("#"+event.name).addClass("invalid-event-pointer");
                    }
                }
            };
            $(".event-button").last().trigger("click");
        });
    };
    function newEventButton(text,type){
        return "<div id='"+text+"' type='"+type+"' class='event-button'>"+text+"</div>";
    };
    file = scenes;
    sceneData = file["Story"].find(function(itm){return itm.name===scene;});
    eventsInScene = sceneData.events;
    $("#events-flowchart-cont").prepend("<div id='flowchart'></div>")
    if(eventsInScene.length){
        showFlowchart();
    } else {
        $("#events-flowchart").append("<div class='no-events'>There are no events yet! Click new event to get started!</div>");
    }
    
    function finishNewEvent(){
        $("#new-event-cont").remove();
        $(".full-screen-hider").hide();
        $(".full-screen-hider").off();
    }
    function loadEventEditing(data){
        var buttonText = data ? "Copy Event" : "Create Event";
        var cont = $('<div id="new-event-cont" class="UIC-group-item-props"><span id="new-event-confirm" class="UIC-button ninety-width">'+buttonText+'</span><div class="remove-choice"><span>x</span></div></div>');
        cont.append(uic.Input("Name","","text"));
        var type = data ? data.kind : "Story";
        cont.append($(uic.Select("Type",["Story","Location","Battle Scene","Battle"],type)));
        uic.selectInitialValue(cont);
        $(cont).children("select:eq(0)").on("change",function(){
            $(this).nextAll().remove();
            var type = $(this).val();
            var parent = $(this).parent();
            switch(type){
                case "Story":
                    var props = data ? [data.music,data.bg,data.startPage] : [GDATA.sceneDefaults[GDATA.eventPointer.scene]["Story"].music,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Story"].bg,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Story"].startPage];
                    parent.append(uic.Select("Music",GDATA.musicFileNames,props[0]));
                    parent.append(uic.Select("BG",GDATA.bgFiles,props[1]));
                    parent.append(uic.Input("S Page",props[2],"text"));
                    break;
                case "Location":
                    var props = data ? [data.music,data.bg,data.startPage] : [GDATA.sceneDefaults[GDATA.eventPointer.scene]["Story"].music,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Story"].bg];
                    parent.append(uic.Select("Music",GDATA.musicFileNames,props[0]));
                    parent.append(uic.Select("BG",GDATA.bgFiles,props[1]));
                    
                    break;
                case "Battle Scene":
                    var props = data ? [data.map,data.music] : [GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle Scene"].map,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle Scene"].music];
                    var map = props[0].split("/");
                    parent.append(uic.Select("Music",GDATA.musicFileNames,props[1]));
                    parent.append(uic.Select("Area",GDATA.mapFileNames,map[0]));
                    parent.append(uic.Select("Map",GDATA.mapFileNames[map[0]],map[1]));
                    uic.linkSelects(parent.children("select:eq(2)"),parent.children("select:eq(3)"),GDATA.mapFileNames);
                    
                    break;
                case "Battle":
                    var props = data ? [data.map,data.music,data.defaultDir,data.maxAllies] : [GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle Scene"].map,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle Scene"].music,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle"].defaultDirection,GDATA.sceneDefaults[GDATA.eventPointer.scene]["Battle"].maxAllies];
                    var map = props[0].split("/");
                    parent.append(uic.Select("Music",GDATA.musicFileNames,props[1]));
                    parent.append(uic.Select("Area",GDATA.mapFileNames,map[0]));
                    parent.append(uic.Select("Map",GDATA.mapFileNames[map[0]],map[1]));
                    uic.linkSelects(parent.children("select:eq(2)"),parent.children("select:eq(3)"),GDATA.mapFileNames);
                    parent.append(uic.Select("Dir",["up","right","down","left"],props[2]));
                    parent.append(uic.Input("M Allies",props[3],"number"));
                    
                    break;
            }
            uic.selectInitialValue(parent);
            //little fix since selectInitialValue sets the type select as well.
            $(this).val(type);
        });
        $(cont).children("select:eq(0)").trigger("change");
        if(data){
            cont.children("select:eq(0)").attr("disabled",true);
        }
        $("#main-content").append(cont);
    }
    function saveEvent(data){
        var cont = $("#new-event-cont");
        var newName = cont.children("input:eq(0)").val().replace(/\s+/g, '-');
        if(data && newName === data.name){
            alert("Please choose a different name.");
            return;
        }
        if(/^[a-zA-Z0-9- ]*$/.test(newName) == false) {
            alert("Please only use letters and numbers (spaces will be converted to '-').");
            return;
        }
        if(eventsInScene.filter(function(event){return event.name === newName;}).length){
            alert("This scene already contains an event with this name. Please rename it.");
            return;
        }
        if(!newName){
            alert("Please set a name");
            return;
        }
        
        var newType = cont.children("select:eq(0)").val();
        $("#flowchart").append(newEventButton(newName,newType));
        $(".event-button").last().addClass("absolute-event-button");
        $(".event-button").last().draggable({
            containment:$("#events-flowchart-cont"),
            drag:function(){
                $("."+$(this).attr("id")).each(function(){
                    adjustConnection($(this));
                });
                changed = true;
            }
        });
         //Create the event in story
        var newEvent = {
            events:[],
            sceneVars:[],
            globalVars:[],
            name:newName,
            type:newType,
            left:"100px",
            top:"100px"
        };
        //Copy over the references
        if(data){
            var copying = $(".selected.event-button").text();
            var refData = eventsInScene.find(function(elm){return elm.name===copying;});
            newEvent.events = refData.events;
            newEvent.sceneVars = refData.sceneVars;
            newEvent.globalVars = refData.globalVars;
        }
        eventsInScene.push(newEvent);
        sceneData.events.push(newEvent);
        finishNewEvent();
        $(".event-button").last().trigger("click");
        
        
        var newFile = data ? data : {};
        newFile.name = newName;
        newFile.kind = newType;
        switch(newType){
            case "Story":
                if(!data){
                    newFile.pages = [];
                    newFile.vrs = {};
                }
                newFile.music = cont.children("select:eq(1)").val();
                newFile.bg = cont.children("select:eq(2)").val();
                newFile.startPage = cont.children("input:eq(1)").val();
                break;
            case "Location":
                if(!data){
                    newFile.pages = [];
                    newFile.vrs = {};
                }
                newFile.music = cont.children("select:eq(1)").val();
                newFile.bg = cont.children("select:eq(2)").val();
                break;
            case "Battle Scene":
                newFile.music = cont.children("select:eq(1)").val();
                newFile.map = cont.children("select:eq(2)").val()+"/"+cont.children("select:eq(3)").val();
                if(!data){
                    newFile.script = [];
                    newFile.characters = [];
                    newFile.finished = ["Story",scene,newName];
                    newFile.vrs = {};
                    newFile.viewLoc = [0,0];
                }
                break;
            case "Battle":
                newFile.music = cont.children("select:eq(1)").val();
                newFile.map = cont.children("select:eq(2)").val()+"/"+cont.children("select:eq(3)").val();
                newFile.maxAllies = cont.children("input:eq(1)").val();
                newFile.defaultDirection = cont.children("select:eq(3)").val();
                newFile.turnBonus = [16,12,8,4];
                if(!data){
                    newFile.placementSquares = [];
                    newFile.events = [];
                    newFile.characters = [];
                    newFile.victory = {
                        next:["Story",scene,newName],
                        events:[]
                    };
                    newFile.defeat = {
                        next:["Story",scene,newName],
                        events:[]
                    };
                    newFile.vrs = {};
                }
                break;
        }
        saveStoryJsonToFile('Story', scene, newFile.name, newFile);
        setTimeout(function(){
            saveEvents();
        });
    }
    //Load a box in the center that allows the user to input type and name. On confirm, create the file.
    $("#new-event").click(function(){
        if(!$(".event-group").length){
            $("#new-group").trigger("click");
            $(".event-group").last().trigger("click");
        }
        $(".full-screen-hider").show();
        loadEventEditing();
        
        $("#new-event-confirm").click(function(){
            saveEvent();
        });
        $("#new-event-cont").children(".remove-choice").click(function(){finishNewEvent();});
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
        if(!$(".selected.event-button").attr("id")) return alert("There is no event to edit!");
        confirmFlowchartPosition();
        window.location.href = 'edit-event.php?' + $.param({'scene':scene, 'event':$(".selected.event-button").attr("id"), 'type':"Story"});
    });
    $("#copy-event").click(function(){
        var event = $(".selected.event-button");
        var eventName = $(event).text();
        if(!eventName) return alert("There is no event to copy!");
        $(".full-screen-hider").show();
        //Get the event's data
        var path = "../../data/json/story/events/Story/"+scene+"/"+eventName+".json";
        $.getJSON(path,function(data){
            loadEventEditing(data);
            $("#new-event-confirm").click(function(){
                saveEvent(data);
            });
            $("#new-event-cont").children(".remove-choice").click(function(){finishNewEvent();});
            $(".full-screen-hider").click(function(){finishNewEvent();});
        });
    });
    $("#edit-vars").click(function(){
        confirmFlowchartPosition();
        window.location.href = "edit-vars.php?scene="+scene;
    });
    $("#delete-event").click(function(){
        var event = $(".selected.event-button");
        var eventName = $(event).text();
        if(!eventName) return alert("There is no event to delete!");
        if(confirm("Are you sure you want to delete "+eventName+"?")){
            var cons = $("."+eventName);
            cons.each(function(){
                if($(this).attr("class").split(" ")[2]===eventName){
                    $("#"+$(this).attr("class").split(" ")[1]).addClass("invalid-event-pointer");
                }
            });
            //Remove the event file
            saveStoryJsonToFile('Story', scene, eventName, {});
            $(event).remove();
            saveEvents();
            $(".event-button").last().trigger("click");
        }
    });
    $("#delete-group").click(function(){
        $(".selected.event-group").remove();
    });
    function saveEvents(){
        var events = $(".event-button");
        var savedEvents = [];
        events.each(function(){
            var name = $(this).text();
            var event = eventsInScene.find(function(elm){return elm.name===name;});
            event.top = $(this).css("top");
            event.left = $(this).css("left");
            savedEvents.push(event);
        });
        file["Story"].find(function(itm){return itm.name===scene;}).events = savedEvents;
        saveJsonToFile('data', 'scenes-list', file);
    }
    $("#save-flowchart").click(function(){
        saveEvents();
        alert("Saved!");
    });
    $("#test-event").click(function(){
        if(!$(".selected.event-button").text()) return alert("There is no event to test!");
        window.location.href = '../../index.php?' + $.param({'scene':scene, 'event':$(".selected.event-button").text(), 'type':"Story", testing:true});
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
        $("#scene-type-display").text($(this).attr("type"));
    });
    $(document).on("click",".add-cond",function(){
        $(this).parent().children(".conds-cont").append(newCond("character","name","==",""));
    });
});