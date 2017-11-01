var changed = false;
var globalVars;
var convertValue = function(value){console.log(value)
    if(value.toLowerCase()==="false") return false;
    if(value.toLowerCase()==="true") return true;
    if(Number.isInteger(parseInt(value))) return parseInt(value);
    return value;
};
$(function(){
    $("#scene-title").append("<div>"+scene+"</div>");
    var eventsInScene;
    var sceneData;
    var file;
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
            $(flowchart).append(newEventButton(event.name));
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
                    $("#"+event.name).connections({to:"#"+event.events[j],class:'connection '+event.name+' '+event.events[j]+'',id:event.name+"-TO-"+event.events[j]});
                    var elm = $("#"+event.name+"-TO-"+event.events[j]);
                    if(elm.length){
                        elm.append("<div class='end-arrow'></div>");
                        adjustConnection("#"+event.name+"-TO-"+event.events[j]);
                    } else {
                        $("#"+event.name).addClass("invalid-event-pointer");
                    }
                }
            };
            $(".event-button").last().trigger("click");
        });
    };
    function newEventButton(text){
        return "<div id='"+text+"' class='event-button'>"+text+"</div>";
    };
    file = scenes;
    $("#events-flowchart-cont").prepend("<div id='flowchart'></div>")

    sceneData = file["Story"].find(function(itm){return itm.name===scene;});
    eventsInScene = sceneData.events;
    console.log(eventsInScene)
    if(eventsInScene.length){
        showFlowchart();
    } else {
        $("#events-flowchart").append("<div class='no-events'>There are no events yet! Click new event to get started!</div>");
    }
    
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
                $("#flowchart").append(newEventButton(newName));
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
                
            }
            //Create the event in story
            var newEvent = {
                events:[],
                sceneVars:[],
                globalVars:[],
                name:newName,
                left:"100px",
                top:"100px"
            };
            eventsInScene.push(newEvent);
            sceneData.events.push(newEvent);
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
                    newFile.map = "maps/Venoria/Venoria-Castle-Outside.tmx";
                    newFile.script = [];
                    newFile.characters = [];
                    newFile.vrs = {};
                    break;
                case "battle":
                    newFile.map = "maps/Venoria/Venoria-Castle-Outside.tmx";
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
                data:{scene:scene,type:"Story",data:JSON.stringify(newFile)},
                dataType:'json'
            })
            .done(function(data){console.log(data);changed=false;})
            .fail(function(data){console.log(data)});
            setTimeout(function(){
                saveEvents();
            });
            
            
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
        $.redirect('edit-event.php', {'scene':scene, 'event':$(".selected.event-button").text(), 'type':"Story"});
    });
    $("#edit-vars").click(function(){
        confirmFlowchartPosition();
        $.redirect("edit-vars.php",{scene:scene});
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
            var path = "../../data/json/story/events/Story/"+scene+"/"+eventName+".json";
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
        $.ajax({
            type:'POST',
            url:'save-flowchart.php',
            data:{file:JSON.stringify(file)},
            dataType:'json'
        })
        .done(function(data){console.log(data);changed=false;})
        .fail(function(data){console.log(data)});
        
    }
    $("#save-flowchart").click(function(){
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
        $(this).parent().children(".conds-cont").append(newCond("character","name","==",""));
    });
});