$(function(){
    
    var dataP = {
        mapFileNames:mapFileNames,
        mapFileGroups:Object.keys(mapFileNames),
        musicFileNames:musicFileNames,
        charFiles:characterFiles,
        sceneTypes:["Story","Flavour"],
        condFuncs:["rounds"],
        effectFuncs:["setVar","spawnEnemy"],
        scopes:["Global","Scene","Event"],
        conditionals:["==","!=",">=","<="],
        operators:["=","+=","-="],
        directions:["down","left","up","right"]
    };
    console.log(dataP)
    var numOfFiles = 1 + dataFiles.length;
    var setJSONData = function(url,name){
        $.getJSON(url)
            .done(function(data){
                dataP[name] = data;
                numOfFiles--;
                if(numOfFiles<=0){
                    start();
                }
            }
        );
    };
    
    var formatScenes = function(){
        var story = dataP["scenes-list.json"];
        var flavour = dataP["flavour-events-list.json"];
        var newScenes = {
            Story:[],
            Flavour:[]
        };
        for(var i=0;i<story.Story.length;i++){
            newScenes["Story"].push(story.Story[i].name);
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newScenes["Flavour"].push(groups[i]);
        }
        
        return newScenes;
    };
    var formatEvents = function(){
        var story = dataP["scenes-list.json"];
        var flavour = dataP["flavour-events-list.json"];
        var newEvents = {
            Story:{},
            Flavour:{}
        };
        for(var i=0;i<story.Story.length;i++){
            newEvents.Story[story.Story[i].name] = story.Story[i].events.map(function(itm){return itm.name;});
        }
        var groups = Object.keys(flavour.groups);
        for(var i=0;i<groups.length;i++){
            newEvents.Flavour[groups[i]] = flavour.groups[groups[i]][2];
        }
        return newEvents;
    };
    
    //Set the event
    setJSONData("../../data/json/story/events/"+sceneType+"/"+sceneName+"/"+eventName+".json","event");

    $.getJSON("../../data/json/story/global-vars.json",function(data){
        dataP["global-vars.json"] = data;
        //Set all of the data files
        dataFiles.forEach( function(f){ setJSONData("../../data/json/data/"+f,f); });
    });
    
    var start = function(){
        dataP.scenes = formatScenes();
        dataP.events = formatEvents();
        dataP.scene = dataP["scenes-list.json"].Story.find(function(sc){return sc.name===sceneName;});
        dataP.vrs = {Global:Object.keys(dataP["global-vars.json"].vrs),Scene:Object.keys(dataP.scene.vrs)};
        var DC = {
            getCondGroup:function(){
                return '<div class="cond-group">\n\
                    <div class="cond-group-top">\n\
                        <span class="minimize-icon-deep group-text">-</span>\
                        <span class="add-new-condition group-text">Add Condition</span>\n\
                        <span class="add-new-effect group-text">Add Effect</span>\n\
                        <span class="remove-choice-deep group-text">x</span>\n\
                    </div>\n\
                    <div class="conditions minimize">\n\
                        <div class="cond-group-top">\n\
                            <span class="minimize-icon-deep group-text">-</span>\n\
                            <span class="editor-descriptor-title medium-gradient group-text minimizable-deep">Conditions</span>\n\
                        </div>\n\
                        <span class="editor-descriptor-title medium-gradient half-width">All Required</span><select class="required"><option value="true">true</option><option value="false">false</option></select>\n\
                        <div class="cond-cont minimize"></div>\n\
                    </div>\n\
                    <div class="effects minimize">\n\
                        <div class="cond-group-top">\n\
                            <span class="minimize-icon-deep group-text">-</span>\n\
                            <span class="editor-descriptor-title medium-gradient group-text minimizable-deep">Effects</span>\n\
                        </div>\n\
                        <div class="effect-cont minimize"></div>\n\
                    </div>\n\
                </div>';
            },
            groupCondTop:function(func){
                return "<span class='half-width'>Func</span><select class='func half-width' initial-value='"+func+"'>"+DC.getOptString(dataP.condFuncs)+"</select>";
            },
            groupEffectTop:function(func){
                return "<span class='half-width'>Func</span><select class='func half-width' initial-value='"+func+"'>"+DC.getOptString(dataP.effectFuncs)+"</select>";
            },
            groupRemove:function(){
                return "<span class='remove-choice group-text unobtrusive'>x</span>";
            },
            groupInput:function(text,val,type,min){
                return "<span class='half-width'>"+text+"</span><input class='prop half-width' value='"+val+"' type='"+type+"' min='"+min+"'>";
            },
            groupSelect:function(text,opts,value){
                return "<span class='half-width'>"+text+"</span><select class='prop half-width' initial-value='"+value+"'>"+DC.getOptString(opts)+"</select>";
            },
            getCondFunc:function(name){
                name = name || "rounds";
                var content = $("<div class='cond'></div>");
                content.append(DC.groupRemove());
                content.append(DC.groupCondTop(name));
                return content;
            },
            getCond:function(content,name,props){
                name = name || "rounds";
                props = props || [1,0];
                switch(name){
                    case "rounds":
                        content.append(this.groupInput("Rounds",props[0],"number",1));
                        content.append(this.groupInput("Repeat",props[1],"number",0));
                        break;
                }
                return content;
            },
            getEffectFunc:function(name){
                name = name || "setVar";
                var content = $("<div class='effect'></div>");
                content.append(DC.groupRemove());
                $(content).append(DC.groupEffectTop(name));
                return content;
            },
            getEffect:function(content,name,props){
                name = name || "setVar";
                switch(name){
                    case "setVar":
                        props = props || ["Global","money","+=",1000];
                        content.append(this.groupSelect("Scope",dataP.scopes,props[0]));
                        content.append(this.groupSelect("Name",dataP.vrs[props[0]],props[1]));
                        DC.linkSelects($(content).children(".prop")[0],$(content).children(".prop")[1],dataP.vrs);
                        content.append(this.groupSelect("Operator",dataP.operators,decodeURIComponent(props[2])));
                        content.append(this.groupInput("Value",props[3],"text"));
                        
                        break;
                    case "spawnEnemy":
                        props = props || ["Officers.json","Officers","Alex",[3,0],"down"];
                        var files = Object.keys(dataP.charFiles);
                        var groups = Object.keys(dataP.charFiles[props[0]]);
                        var chars = Object.keys(dataP.charFiles[props[0]][props[1]]);
                        content.append(this.groupSelect("File",files,props[0]));
                        content.append(this.groupSelect("Group",groups,props[1]));
                        DC.linkSelects($(content).children(".prop")[0],$(content).children(".prop")[1],dataP.charFiles);
                        content.append(this.groupSelect("Char",chars,props[2]));
                        DC.linkSelects($(content).children(".prop")[1],$(content).children(".prop")[2],dataP.charFiles,[$(content).children(".prop")[0]]);
                        content.append(this.groupInput("X Loc",props[3][0],"number",0));
                        content.append(this.groupInput("Y Loc",props[3][1],"number",0));
                        content.append(this.groupSelect("Direction",dataP.directions,props[4]));
                        break;
                }
                return content;
            },
            newCharacter:function(char){
                return "<div class='character-cont'><span class='character "+char.handle+"' uniqueId='"+char.uniqueId+"' dir='"+char.dir+"' locX='"+char.loc[0]+"' locY='"+char.loc[1]+"' file='"+char.file+"' group='"+char.group+"'>"+char.handle+" ("+char.uniqueId+")"+"</span><span class='remove-choice group-text'>x</span></div>";
            },
            //When sel1 changes, change all of the options of sel2 from the passed in object.
            //obj must be in this format: {myName:[itm1, itm2, ..]}
            //myName would be equal to the sel1's value.
            //deepArray allows multiple selects to 'chain' changes
            linkSelects:function(sel1,sel2,obj,deepArray){
                $(sel1).on("change",function(){
                    $(sel2).empty();
                    if(deepArray){
                        var props = [];
                        $(deepArray).each(function(){props.push($(this).val());});
                        props.push($(this).val());
                        $(sel2).append(DC.getOptString(DC.getDeepValue(obj,props.join("&"))));
                    } else {
                        $(sel2).append(DC.getOptString(obj[$(this).val()]));
                    }
                    $(sel2).trigger("change");
                });
            },
            genUniqueId:function(handle){
                var id = 0;
                var sameHandle = $("."+handle);
                if(sameHandle.length){
                    //Match the unique ids
                    do {
                        var found = false;
                        //Check if the ids match
                        for(var i=0;i<sameHandle.length;i++){
                            if($(sameHandle[i]).attr("uniqueId")==id){
                                id++;
                                found=true;
                            }
                        }
                    } while(found);
                }
                return id;
            },
            getDeepValue:function(obj, path){
                for (var i=0, path=path.split('&'), len=path.length; i<len; i++){
                    obj = obj[path[i]];
                };
                return obj;
            },
            getOptString:function(arr,prop){
                var opts = '';
                //If an object is passed in
                if(!$.isArray(arr)) arr = Object.keys(arr);
                arr.forEach(function(itm){
                    if(prop){
                        opts += '<option value="' + itm[prop] + '">' + itm[prop] + '</option>';
                    } else {
                        opts += '<option value="'+itm+'">'+itm+'</option>';
                    }
                });
                return opts;
            },
            selectInitialValue:function(cont){
                $(cont).children("select").each(function(){
                    $(this).val($(this).attr("initial-value"));
                });
            }
        };
        var FileSaver = {
            processValue:function(value){
                var val = parseInt(value);
                if(isNaN(val)) val = encodeURIComponent(value);
                if(!val && isNaN(val)) val = (value === 'true');
                return val;
            },
            getGroups:function(cont){
                var groups = [];
                $(cont).children(".cond-group").each(function(){
                    var group = {
                        conds:[],
                        effects:[],
                        required:FileSaver.processValue($(this).children(".conditions").children(".required").val())
                    };
                    $(this).children(".conditions").children(".cond-cont").children(".cond").each(function(){
                        var func = $(this).children(".func").val();
                        var props = [];
                        $(this).children(".prop").each(function(){
                            props.push(FileSaver.processValue($(this).val()));
                        });
                        group.conds.push([func,props]);
                    });
                    $(this).children(".effects").children(".effect-cont").children(".effect").each(function(){
                        var func = $(this).children(".func").val();
                        var props = [];
                        $(this).children(".prop").each(function(){
                            props.push(FileSaver.processValue($(this).val()));
                        });
                        group.effects.push([func,props]);
                    });
                    groups.push(group);
                });
                return groups;
            },
            getCharacters:function(){
                var chars = [];
                $(".character").each(function(){
                    var char = $(this);
                    chars.push({
                        file:char.attr("file"),
                        group:char.attr("group"),
                        handle:char.attr("class").split(" ")[1],
                        uniqueId:FileSaver.processValue(char.attr("uniqueId")),
                        loc:[FileSaver.processValue(char.attr("locX")),FileSaver.processValue(char.attr("locY"))],
                        dir:char.attr("dir")
                    });
                });
                return chars;
            }
        };

        $(document).on("change",".music-select",function(){
            $(this).parent().children(".music-preview").attr("src","../../audio/bgm/"+$(this).val());
        });
        /* start initial props code */

        //Fill the char-files container with the files. This only needs to be done once at runtime as it will not change until the page is refreshed after a new character file has been created.
        var fileNames = Object.keys(dataP.charFiles);
        var cont = $("#char-files");
        for(var i=0;i<fileNames.length;i++){
            var groups = Object.keys(dataP.charFiles[fileNames[i]]);
            $(cont).append('<div class="file-groups"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+fileNames[i]+'</span><div class="groups minimize"></div></div>');
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(dataP.charFiles[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><span class="minimize-icon group-text">-</span><span class="title-text medium-gradient minimizable group-text">'+groups[j]+'</span><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = dataP.charFiles[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }

        
        
        $(document).on("click",".add-group",function(){
            $(this).parent().siblings(".cond-groups").append(DC.getCondGroup());
            $(this).parent().siblings(".cond-groups").last().children(".cond-group").children(".cond-group-top").children(".add-new-condition").on("click",function(){
                var cont = $(this).parent().parent().children(".conditions").children(".cond-cont");
                $(cont).append(DC.getCondFunc());
                DC.getCond($(cont).children(".cond").last());
                DC.selectInitialValue($(cont).children(".cond").last());
                $(cont).children(".cond").last().children(".func").on("change",function(){
                    $(this).nextAll().remove();
                    DC.getCond($(this).parent(),$(this).parent().children(".func").val());
                });
            });
            $(this).parent().siblings(".cond-groups").last().children(".cond-group").children(".cond-group-top").children(".add-new-effect").on("click",function(){
                var cont = $(this).parent().parent().children(".effects").children(".effect-cont");
                $(cont).append(DC.getEffectFunc());
                DC.getEffect($(cont).children(".effect").last());
                DC.selectInitialValue($(cont).children(".effect").last());
                $(cont).children(".effect").last().children(".func").on("change",function(){
                    $(this).nextAll().remove();
                    DC.getEffect($(this).parent(),$(this).parent().children(".func").val());
                });
            });
        });

        
        DC.linkSelects($("#map-select-group"),$("#map-select-place"),dataP.mapFileNames);
        $("#map-select-group").append(DC.getOptString(dataP.mapFileGroups));
        $("#map-select-group").trigger("change");
        $(".music-select").append(DC.getOptString(dataP.musicFileNames));
        
        $("#placement-squares-button").on("click",function(){
            $(this).toggleClass("selected");
        });
        DC.linkSelects($("#prop-victory").children(".scene-type"),$("#prop-victory").children(".scene-name"),dataP.scenes);
        $("#prop-victory").children(".scene-type").append(DC.getOptString(dataP.sceneTypes));
        DC.linkSelects($("#prop-victory").children(".scene-name"),$("#prop-victory").children(".event-name"),dataP.events,[$("#prop-victory").children(".scene-type")]);
        $("#prop-victory").children(".scene-type").trigger("change");
        $("#prop-victory").children(".scene-name").trigger("change");
        
        DC.linkSelects($("#prop-defeat").children(".scene-type"),$("#prop-defeat").children(".scene-name"),dataP.scenes);
        $("#prop-defeat").children(".scene-type").append(DC.getOptString(dataP.sceneTypes));
        DC.linkSelects($("#prop-defeat").children(".scene-name"),$("#prop-defeat").children(".event-name"),dataP.events,[$("#prop-defeat").children(".scene-type")]);
        $("#prop-defeat").children(".scene-type").trigger("change");
        $("#prop-defeat").children(".scene-name").trigger("change");
        /* end initial props code */


        $(".music-select").trigger("change");
        $(".file-groups").children(".minimize-icon").trigger("click");
        
        
        $('.file-character').draggable({
            cursorAt: { top: 10, left: 20 },
            helper: "clone",
            appendTo: "body"
        });
        $('#event-chars-cont').droppable({
            accept:".file-character",
            //Create a character element
            drop:function(event,ui){
                var char = JSON.parse($(ui.draggable).attr("data"));
                char.uniqueId = DC.genUniqueId(char.handle);
                char.loc = [0,0];
                char.dir = "down";
                $(this).append(DC.newCharacter(char));
                //Double click the last character for placement
                $(".char-btn").last().trigger("click");
                $(".char-btn").last().trigger("click");
            }
        });
        
        $("#save-file").click(function(){
            var newFile = JSON.stringify({
                name:dataP.event.name,
                kind:"battle",
                map:$("#map-select-group").val()+"/"+$("#map-select-place").val(),
                music:$("#prop-music .music-select").val(),
                placementSquares:[],
                maxAllies:FileSaver.processValue($("#prop-maxAllies input").val()),
                victory:{
                    events:FileSaver.getGroups($("#prop-victory").children(".cond-groups")),
                    next:[$("#prop-victory .scene-type").val(),$("#prop-victory .scene-name").val(),$("#prop-victory .event-name").val()]
                },
                defeat:{
                    events:FileSaver.getGroups($("#prop-defeat").children(".cond-groups")),
                    next:[$("#prop-defeat .scene-type").val(),$("#prop-defeat .scene-name").val(),$("#prop-defeat .event-name").val()]
                },
                events:FileSaver.getGroups($("#cond-groups-cont").children(".cond-groups")),
                characters:FileSaver.getCharacters()
            });
            console.log(newFile);
            $.ajax({
                type:'POST',
                url:'save-battle.php',
                data:{data:newFile,name:eventName,scene:sceneName,type:sceneType},
                dataType:'json'
            })
            .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
            .fail(function(data){console.log(data)});
        });
        
        //Using the file data, set up the page
        console.log(dataP.event)
        var event = dataP.event;
        var map = event.map.split("/");
        $("#map-select-group").val(map[0]).trigger("change");
        $("#map-select-place").val(map[1]).trigger("change");
        $("#prop-music .music-select").val(event.music).trigger("change");
        $("#prop-maxAllies input").val(event.maxAllies);
        function setUpEndBattle(which){
            $("#prop-"+which+" .scene-type").val(event[which].next[0]).trigger("change");
            $("#prop-"+which+" .scene-name").val(event[which].next[1]).trigger("change");
            $("#prop-"+which+" .event-name").val(event[which].next[2]);
            for(var i=0;i<event[which].events.length;i++){
                $("#prop-"+which+" .cond-group-title-bar span").trigger("click");
                for(var j=0;j<event[which].events[i].conds.length;j++){
                    var condsCont = $("#prop-"+which+" .cond-groups .cond-group").last();
                    var func = event[which].events[i].conds[j][0];
                    var props = event[which].events[i].conds[j][1];
                    var required = event[which].events[i].required.toString();
                    var cont = $(condsCont).children(".conditions").children(".cond-cont").append(DC.getCondFunc(func));
                    DC.getCond(cont.children(".cond").last(),func,props);
                    $(condsCont).children(".conditions").children(".required").val(required);
                    DC.selectInitialValue($(cont).children(".cond").last());
                }
                for(var j=0;j<event[which].events[i].effects.length;j++){
                    var condsCont = $("#prop-"+which+" .cond-groups .cond-group").last();
                    var func = event[which].events[i].effects[j][0];
                    var props = event[which].events[i].effects[j][1];
                    var cont = $(condsCont).children(".effects").children(".effect-cont").append(DC.getEffectFunc(func));
                    DC.getEffect(cont.children(".effect").last(),func,props);
                    DC.selectInitialValue($(cont).children(".effect").last());
                }
            }
        }
        //TODO PLACEMENTSQUARES
        setUpEndBattle("victory");
        setUpEndBattle("defeat");
        for(var i=0;i<event.characters.length;i++){
            $('#event-chars-cont').append(DC.newCharacter(event.characters[i]));
        }
    };
    
    
    $(document).on("click",".minimize-icon, .minimizable",function(){
        var content = $(this).parent().children(".minimize");
        if($(content).css("display")==="none"){
            $(content).show();
            $(this).parent().children(".minimize-icon").text("-");
        } else {
            $(content).hide();
            $(this).parent().children(".minimize-icon").text("+");
        }
    });
    $(document).on("click",".minimize-icon-deep, .minimizable-deep",function(){
        var content = $(this).parent().parent().children(".minimize");
        if($(content).css("display")==="none"){
            $(content).show();
            $(this).parent().children(".minimize-icon-deep").text("-");
        } else {
            $(content).hide();
            $(this).parent().children(".minimize-icon-deep").text("+");
        }
    });
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    $(document).on("click",".remove-choice-deep",function(e){
        $(this).parent().parent().remove();
    });
});
    