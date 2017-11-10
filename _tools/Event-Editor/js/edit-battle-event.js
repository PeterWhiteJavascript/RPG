$(function(){
    
    var dataP = {
        mapFileNames:mapFileNames,
        mapFileGroups:Object.keys(mapFileNames),
        musicFileNames:musicFileNames,
        charFiles:characterFiles,
        sceneTypes:["Story","Flavour"]
    };
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
        var DC = {
            //When sel1 changes, change all of the options of sel2 from the passed in object.
            //obj must be in this format: {myName:[itm1, itm2, ..]}
            //myName would be equal to the sel1's value.
            linkSelects:function(sel1,sel2,obj,deepArr){
                $(sel1).on("change",function(){
                    $(sel2).empty();
                    if(deepArr){
                        var props = [];
                        $(deepArr).each(function(){props.push($(this).val());});
                        props.push($(this).val());
                        $(sel2).append(DC.getOptString(DC.getDeepValue(obj,props.join("."))));
                    } else {
                        $(sel2).append(DC.getOptString(obj[$(this).val()]));
                    }
                    $(sel2).trigger("change");
                });
            },
            getDeepValue:function(obj, path){
                for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
                    obj = obj[path[i]];
                };
                return obj;
            },
            getOptString:function(arr,prop){
                var opts = '';
                arr.forEach(function(itm){
                    if(prop){
                        opts += '<option value="' + itm[prop] + '">' + itm[prop] + '</option>';
                    } else {
                        opts += '<option value="'+itm+'">'+itm+'</option>';
                    }
                });
                return opts;
            }
        };
        var FileSaver = {

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
            $(cont).append('<div class="file-groups"><div class="minimize-icon">-</div><div class="title-text minimizable">'+fileNames[i]+'</div><div class="groups minimize"></div></div>');
            for(var j=0;j<groups.length;j++){
                var chars = Object.keys(dataP.charFiles[fileNames[i]][groups[j]]);
                $(cont).children(".file-groups").children(".groups").last().append('<div class="file-chars"><div class="minimize-icon">-</div><div class="title-text minimizable">'+groups[j]+'</div><div class="chars minimize"></div></div>');
                for(var k=0;k<chars.length;k++){
                    var char = dataP.charFiles[fileNames[i]][groups[j]][chars[k]];
                    char.file = fileNames[i];
                    char.group = groups[j];
                    $(cont).children(".file-groups").last().children(".groups").children(".file-chars").last().children(".chars").append("<div class='file-character draggable' data='"+JSON.stringify(char)+"'>"+char.handle+"</div>");
                }
            }
        }


        
        

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
        $(".minimize-icon").trigger("click");
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
    $(document).on("click",".minimize-icon-deep",function(){
        var content = $(this).parent().parent().children(".minimize");
        if($(content).css("display")==="none"){
            $(content).show();
            $(this).parent().children(".minimize-icon-deep").text("-");
        } else {
            $(content).hide();
            $(this).parent().children(".minimize-icon-deep").text("+");
        }
    });
});
    