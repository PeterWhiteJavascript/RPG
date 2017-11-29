$(function(){
//Start the action after all data is loaded.
var start = function(){
    var dataP = {
        mapFileNames:GDATA.mapFileNames,
        mapFileGroups:Object.keys(GDATA.mapFileNames),
        soundFileNames:GDATA.soundFileNames,
        musicFileNames:GDATA.musicFileNames,
        charFiles:GDATA.characterFiles,
        imageAssets:GDATA.imageAssets,
        event:GDATA.event,
        uniqueActions:1,
        
        vars:{
            Event:GDATA.event.vrs,
            Scene:GDATA.dataFiles["scenes-list.json"].Story.find(function(scene){return scene.name===GDATA.eventPointer.scene;}).vrs,
            Global:GDATA.dataFiles["global-vars.json"].vrs
        },
        
        sceneTypes:["Story","Flavour"],
        scopes:["Event","Scene","Global"],
        equipmentTypes:["Weapons","Shields","Armour","Footwear","Accessories","Consumables"],
        keywords:["partySize","rosterSize"],
        actionFuncs:["changeEvent","changePage","createRecruitMenu","displayBuyItemsList","displaySellItemsList","createGatherInfoMenu","createHuntMenu"],
        conditionsFuncs:["checkVar","checkCharProp","checkCharStat","checkKeyword"],
        effectsFuncs:["setVar","changePage","changeEvent","addToRoster","enableChoice"],
        conditionals:["==","!=",">=","<="],
        conditionalEquals:["==","!="],
        operators:["=","+=","-="],
        officers:Object.keys(GDATA.dataFiles["officers.json"]),
        charPropTypes:["nationality","charClass","value","methodology","personality","gender"],
        charPropValues:{
            nationality:GDATA.dataFiles["character-generation.json"].nationalities,
            charClass:GDATA.dataFiles["character-generation.json"].classNames,
            value:GDATA.dataFiles["character-generation.json"].values,
            methodology:GDATA.dataFiles["character-generation.json"].methodologies,
            personality:GDATA.dataFiles["character-generation.json"].personalityNames,
            gender:GDATA.dataFiles["character-generation.json"].genders
        },
        charStatProps:["Base Stats","Derived Stats"],
        charStatValues:{
            "Base Stats":GDATA.dataFiles["character-generation.json"].statNames,
            "Derived Stats":GDATA.dataFiles["character-generation.json"].derivedStats
        }
    };
    var formatScenes = function(){
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
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
        var story = GDATA.dataFiles["scenes-list.json"];
        var flavour = GDATA.dataFiles["flavour-events-list.json"];
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
    dataP.scenes = formatScenes();
    dataP.events = formatEvents();
    var DC = {
        init:function(){
            var event = GDATA.event;
            var vrs = event.vrs;
            //Create the vrs
            var keys = Object.keys(vrs);
            for(var i=0;i<keys.length;i++){
                this.addVar(keys[i],decodeURIComponent(vrs[keys[i]]));
            }
            var pageList = event.pageList;
            if(!pageList.length) pageList = ["start"];
            for(var i=0;i<pageList.length;i++){
                this.addAction($("#actions-cont"),pageList[i]);
            }
            
            this.selectAction(pageList[0]);
        },
        getAction:function(name){
            if(name==="start"){
                return GDATA.event;
            } else {
                return GDATA.event[name];
            }
        },
        addChoice:function(data){
            var text = data[0];
            var disabled = data[1];
            var func = data[2];
            var props = data[3];
            var choice = $("<div class='choice'></div>");
            var top = $('<div class="choice-group-top">\n\
                        <div class="minimize-choice"><span>-</span></div>\n\
                        <div class="display-text-descriptor editor-descriptor medium-gradient">'+text.substring(0,20)+'</div>\n\
                        <div class="remove-choice-deep"><span>x</span></div>\n\
                        </div>');
            choice.append(top);
            var choiceCont = $("<div class='choice-cont'></div>");
            choiceCont.append(DC.groupInput("Text",text,"text"));
            DC.linkValueToText($(choiceCont).children("input")[0],$(top).children(".display-text-descriptor"),20);
            choiceCont.append(DC.groupCheckbox("Disabled",disabled));
            choiceCont.append(DC.groupSelect("Func",dataP.actionFuncs,func,"choices-select"));
            
            choiceCont.append(DC.getChoiceProps($("<div class='choice-props'></div>"),func,props));
            
            choice.append(choiceCont);
            $("#choices-cont").append(choice);
            DC.selectInitialValue(choiceCont);
            
        },
        //Adds a var to the list
        addVar:function(name,val){
            if(name){
                $("#variables-cont").append("<div class='var-button'><div class='var-remove remove-choice'><span>x</span></div><div class='var-name'>"+name+"</div><input class='var-value' value="+(val?val:0)+"></div>");
            } else {
                $("#variables-cont").append("<div class='var-button'><div class='var-remove remove-choice'><span>x</span></div><input class='var-name' placeholder='VARNAME'><input class='var-value' value='false'></div>");
            }
        },
        //Changes the value of a vr
        editVar:function(vr,val){
            this.vars[vr] = val;
        },
        //Adds a action to the list
        addAction:function(cont,name){
            $(cont).append("<div id='"+name+"' class='action'><div class='action-button list-item'>"+name+"</div><div class='remove-choice'>x</div></div>");
            dataP.uniqueActions++;
        },
        selectAction:function(name){
            $(".action.selected").removeClass("selected");
            $("[id='"+name+"'").addClass("selected");
            //Display the action with all values filled out with this action's props
            this.displayAction(name);
        },
        displayAction:function(name){
            var data = this.getAction(name);
            $("#music-select select").val(data.music);
            $("#music-select select").trigger("change");
            $("#bg-select select").val(data.bg);
            $("#bg-select select").trigger("change");
            //Show all of the onload groups
            for(var i=0;i<data.actions.length;i++){
                this.addChoice(data.actions[i]);
            }
            for(var i=0;i<data.onload.length;i++){
               this.addOnloadGroup($("#onload-cont"),data.onload[i]); 
            }
        },
        addOnloadGroup:function(to,group){
            var groupCont = $(
                '<div class="cond-group">\n\
                    <div class="cond-group-top">\n\
                        <div class="minimize-choice"><span>-</span></div>\n\
                        <div class="add-new-condition"><span>Add Condition</span></div>\n\
                        <div class="add-new-effect"><span>Add Effect</span></div>\n\
                        <div class="remove-choice-deep"><span>x</span></div>\n\
                    </div>\n\
                    <div class="conditions">\n\
                        <div class="editor-descriptor-title medium-gradient">Conditions</div>\n\
                    </div>\n\
                    <div class="effects">\n\
                        <div class="editor-descriptor-title medium-gradient">Effects</div>\n\
                    </div>\n\
                </div>'
            );
            for(var k=0;k<group.conds.length;k++){
                $(groupCont).children(".conditions").append(DC.getCondition(group.conds[k]));
            }
            for(var k=0;k<group.effects.length;k++){
                $(groupCont).children(".effects").append(DC.getEffect(group.effects[k]));
            }
            $(to).append(groupCont);
            
        },
        groupInput:function(text,val,type,min,max){
            return "<span class='quarter-width'>"+text+"</span><input class='prop three-quarter-width' value='"+val+"' type='"+type+"' min='"+min+"' max='"+max+"'>";
        },
        groupCheckbox:function(text,val){
            var box = $("<span class='quarter-width'>"+text+"</span><input class='prop quarter-width' type='checkbox'><div class='half-width'></div>");
            $(box).prop("checked",val);
            return box;
        },
        groupTextArea:function(text,val){
            return "<span class='full-width'>"+text+"</span><textarea class='prop full-width group-text-area'>"+val+"</textarea>";
        },
        groupContainer:function(text,data){
            return "<span class='full-width'>"+text+"</span><div class='prop full-width' data="+JSON.stringify(data)+"></div>";
        },
        groupSelect:function(text,opts,value,cl){
            return "<span class='quarter-width'>"+text+"</span><select class='prop three-quarter-width "+(cl?cl:'')+"' initial-value='"+value+"'>"+DC.getOptString(opts)+"</select>";
        },
        getCondition:function(data){
            data = data || ["checkVar"];
            var cont = $("<div class='condition'></div>");
            cont.append(DC.getCondTop(data[0]));
            cont.append(DC.getCondProps($("<div class='cond-props'></div>"),data[0],data[1]));
            return cont;
        },
        //Display the select that allows the user to select a condition
        getCondTop:function(cond){
            var content = $('<div class="cond-top">\n\
                    <div class="editor-descriptor-half light-gradient">Condition</div>\n\
                    <select class="conditions-select inline-select" initial-value="'+cond+'">'+DC.getOptString(dataP.conditionsFuncs)+'</select>\n\
                    <div class="remove-choice-deep"><span>x</span></div>\n\
                </div>');
            DC.selectInitialValue(content);
            return content;
        },
        //Creates a choice condition
        getCondProps:function(content,name,props){
            switch(name){
                case "checkVar":
                    props = props || ["Global","money","==",1000];
                    content.append(this.groupSelect("Scope",dataP.scopes,props[0]));
                    content.append(this.groupSelect("Var",dataP.vars[props[0]],props[1]));
                    DC.linkSelects($(content).children("select")[0],$(content).children("select")[1],dataP.vars);
                    content.append(this.groupSelect("Operator",dataP.conditionals,props[2]));
                    content.append(this.groupInput("Value",props[3],"text"));
                    break;
                case "checkCharProp":
                    props = props || [dataP.officers[0],dataP.charPropTypes[0],dataP.conditionalEquals[0],dataP.charPropValues[dataP.charPropTypes[0]][0]];
                    content.append(this.groupSelect("Char",dataP.officers,props[0]));
                    content.append(this.groupSelect("Prop",dataP.charPropTypes,props[1]));
                    content.append(this.groupSelect("Oper",dataP.conditionalEquals,props[2]));
                    content.append(this.groupSelect("Value",dataP.charPropValues[props[1]],props[3]));
                    DC.linkSelects($(content).children("select")[1],$(content).children("select")[3],dataP.charPropValues);
                    break;
                case "checkCharStat":
                    props = props || [dataP.officers[0],dataP.charStatProps[0],dataP.charStatValues[dataP.charStatProps[0]][0],dataP.conditionals[0],0];
                    content.append(this.groupSelect("Char",dataP.officers,props[0]));
                    content.append(this.groupSelect("Prop",dataP.charStatProps,props[1]));
                    content.append(this.groupSelect("Stat",dataP.charStatValues[props[1]],props[2]));
                    content.append(this.groupSelect("Oper",dataP.conditionals,props[3]));
                    content.append(this.groupInput("Value",props[4],"number",0));
                    DC.linkSelects($(content).children("select")[1],$(content).children("select")[2],dataP.charStatValues);
                    break;
                case "checkKeyword":
                    props = props || [dataP.keywords[0],dataP.conditionals[0],1];
                    content.append(this.groupSelect("Keyword",dataP.keywords,props[0]));
                    content.append(this.groupSelect("Oper",dataP.conditionals,props[1]));
                    content.append(this.groupInput("Value",props[2],"number",0));
                    break;
            }
            DC.selectInitialValue(content);
            return content;
        },
        getEffect:function(data){
            data = data || ["setVar"];
            var cont = $("<div class='effect'></div>");
            cont.append(DC.getEffectTop(data[0]));
            cont.append(DC.getEffectProps($("<div class='effect-props'></div>"),data[0],data[1]));
            return cont;
        },
        getEffectTop:function(effect){
            var content = $('<div class="effect-top">\n\
                    <div class="editor-descriptor-half light-gradient">Effect</div>\n\
                    <select class="effects-select inline-select" initial-value="'+effect+'">'+DC.getOptString(dataP.effectsFuncs)+'</select>\n\
                    <div class="remove-choice-deep"><span>x</span></div>\n\
                </div>');
            DC.selectInitialValue(content);
            return content;
        },
        getEffectProps:function(content,name,props){
            switch(name){
                case "setVar":
                    props = props || ["Global","money","+=",1000];
                    content.append(this.groupSelect("Scope",dataP.scopes,props[0]));
                    content.append(this.groupSelect("Var",dataP.vars[props[0]],props[1]));
                    DC.linkSelects($(content).children("select")[0],$(content).children("select")[1],dataP.vars);
                    content.append(this.groupSelect("Operator",dataP.operators,props[2]));
                    content.append(this.groupInput("Value",props[3],"text"));
                    break;
                case "changePage":
                    var pageNames = [];
                    $(".action-button").each(function(){pageNames.push($(this).text());});
                    props = props || [pageNames[0],""];
                    content.append(this.groupSelect("Page",pageNames,props[0],"page"));
                    break;
                case "changeEvent":
                    props = props || [GDATA.eventPointer.type,GDATA.eventPointer.scene,GDATA.eventPointer.event];
                    content.append(this.groupSelect("ScType",dataP.sceneTypes,props[0],"scene-type"));
                    content.append(this.groupSelect("ScName",dataP.scenes[props[0]],props[1],"scene-name"));
                    content.append(this.groupSelect("EvName",dataP.events[props[0]][props[1]],props[2],"event-name"));$($(content).children("select")[0]).trigger("change");
                    
                    DC.linkSelects($(content).children("select")[0],$(content).children("select")[1],dataP.scenes);
                    DC.linkSelects($(content).children("select")[1],$(content).children("select")[2],dataP.events,[$(content).children("select")[0]]);
                    break;
                case "addToRoster":
                    var files = Object.keys(GDATA.characterFiles);
                    var groups = Object.keys(GDATA.characterFiles[files[0]]);
                    var handles = Object.keys(GDATA.characterFiles[files[0]][groups[0]]);
                    props = props || [files[0],groups[0],handles[0]];
                    content.append(this.groupSelect("File",Object.keys(GDATA.characterFiles),props[0]));
                    content.append(this.groupSelect("Group",Object.keys(GDATA.characterFiles[files[0]]),props[1]));
                    content.append(this.groupSelect("Handle",Object.keys(GDATA.characterFiles[files[0]][groups[0]]),props[2]));
                    $($(content).children("select")[0]).trigger("change");
                    $($(content).children("select")[1]).trigger("change");
                    DC.linkSelects($(content).children("select")[0],$(content).children("select")[1],GDATA.characterFiles);
                    DC.linkSelects($(content).children("select")[1],$(content).children("select")[2],GDATA.characterFiles,[$(content).children("select")[0]]);
                    break;
                case "enableChoice":
                    var choiceNames = [];
                    $(".display-text-descriptor").each(function(){choiceNames.push($(this).text());});
                    props = props || [choiceNames[0]];
                    content.append(this.groupSelect("Choice",choiceNames,props[0],"page"));
                    break;
            }
            DC.selectInitialValue(content);
            return content;
        },
        getChoiceProps:function(content,name,props){
            name = name || "changeEvent";
            switch(name){
                case "changeEvent":
                case "changePage":
                    DC.getEffectProps(content,name,props);
                    break;
                case "createRecruitMenu":
                case "createGatherInfoMenu":
                case "createHuntMenu":
                    //No extra props
                    break;
                case "displayBuyItemsList":
                    //TODO
                    break;
                case "displaySellItemsList":
                    //TODO
                    break;
            }
            return content;
        },
        linkSelects:function(sel1,sel2,obj,deepArray){
            $(sel1).on("change",function(){
                $(sel2).empty();
                if(deepArray){
                    var props = [];
                    $(deepArray).each(function(){props.push($(this).val());});
                    props.push($(sel1).val());
                    $(sel2).append(DC.getOptString(DC.getDeepValue(obj,props.join("&"))));
                } else {
                    $(sel2).append(DC.getOptString(obj[$(sel1).val()]));
                }
                $(sel2).trigger("change");
            });
        },
        linkSelectToSrc:function(select,srcObj,path){
            $(select).on("change",function(){
                $(srcObj).attr("src",path+$(select).val());
            });
        },
        linkValueToText:function(valObj,textObj,limit){
            $(valObj).on("change",function(){
                var text = $(this).val();
                $(textObj).text(text.substring(0,limit || text.length));
            });
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
            if(isNaN(val)) val = value;
            if(value === 'true') val = true;
            if(value == 'false') val = false;
            return val;
        },
        saveAction:function(name){
            var music = $("#music-select select").val();
            var bg = $("#bg-select select").val();
            var actions = [];
            $(".choice-cont").each(function(){
                var props = [];
                $(this).children(".choice-props").children(".prop").each(function(){
                    props.push(FileSaver.processValue($(this).val()));
                });
                var choice = [
                    $($(this).children(".prop")[0]).val(),
                    $($(this).children(".prop")[1]).is(":checked"),
                    $($(this).children(".prop")[2]).val(),
                    props
                ];
                actions.push(choice);
            });
            var groups = [];
            $(".cond-group").each(function(){
                var group = {
                    conds:[],
                    effects:[]
                };
                $(this).children(".conditions").children(".condition").each(function(){
                    var func = $(this).children(".cond-top").children(".conditions-select").val();
                    var props = [];
                    $(this).children(".cond-props").children(".prop").each(function(){
                        props.push(FileSaver.processValue($(this).val()));
                    });
                    group.conds.push([func,props]);
                });
                $(this).children(".effects").children(".effect").each(function(){
                    var func = $(this).children(".effect-top").children(".effects-select").val();
                    var props = [];
                    $(this).children(".effect-props").children(".prop").each(function(){
                        props.push(FileSaver.processValue($(this).val()));
                    });
                    group.effects.push([func,props]);
                });
                groups.push(group);
            });
            if(name==="start"){
                GDATA.event["music"] = music;
                GDATA.event["bg"] = bg;
                GDATA.event["actions"] = actions;
                GDATA.event["onload"] = groups;
            } else {
                GDATA.event[name]["music"] = music;
                GDATA.event[name]["bg"] = bg;
                GDATA.event[name]["actions"] = actions;
                GDATA.event[name]["onload"] = groups;
            }
        },
        //Sets all of the actions and vrs for saving
        getSaveData:function(){
            var eventRefs = [];
            var sceneVarRefs = [];
            var globalVarRefs = [];
            function setRefs(data){
                var groups = data.onload;
                for(var a=0;a<groups.length;a++){
                    var conds = groups[a].conds;
                    for(var i=0;i<conds.length;i++){
                        if(conds[i][0]==="checkVar"){
                            if(conds[i][1][0]==="Scene"){
                                sceneVarRefs.push(conds[i][1][1]);
                            } else if(conds[i][1][0]==="Global"){
                                globalVarRefs.push(conds[i][1][1]);
                            }
                        }
                    }
                    var effects = groups[a].effects;
                    for(var i=0;i<effects.length;i++){
                        if(effects[i][0]==="setVar"){
                            if(effects[i][1][0]==="Scene"){
                                sceneVarRefs.push(effects[i][1][1]);
                            } else if(effects[i][1][0]==="Global"){
                                globalVarRefs.push(effects[i][1][1]);
                            }
                        } else if(effects[i][0]==="changeEvent"){
                            eventRefs.push([effects[i][1]]);
                        }
                    }
                    
                }
                var choices = data.actions;
                for(var i=0;i<choices.length;i++){
                    if(choices[i][2]==="changeEvent"){
                        eventRefs.push(choices[i][3]);
                    }
                }
            }
            var event = GDATA.event;
            setRefs(event);
            for(var i=1;i<event.pageList.length;i++){
                setRefs(event[event.pageList[i]]);
            }
            var refs = {
                eventRefs:eventRefs,
                sceneVarRefs:sceneVarRefs,
                glbalVarRefs:globalVarRefs
            };
            
            return {file:JSON.stringify(GDATA.event),refs:refs};
        }
    };
    
    //BG and Music selects start
    $("#music-select select").append(DC.getOptString(GDATA.musicFileNames));
    DC.linkSelectToSrc($("#music-select select"),$("#music-select audio"),"../../audio/bgm/");
    $("#music-select select").on("change",function(){
        $("#music-select audio").attr("src","../../audio/bgm/"+$(this).val());
    });
    
    $("#bg-select select").append(DC.getOptString(GDATA.bgFiles));
    DC.linkSelectToSrc($("#bg-select select"),$("#bg-select img"),"../../images/bg/");
    
    //BG and Music selects end
    
    //Start editor-content buttons
    $("#add-var").click(function(){
        DC.addVar();
    });
    $("#add-action").click(function(){
        var name = "Action "+dataP.uniqueActions;
        DC.addAction($("#actions-cont"),name);
        GDATA.event[name] = {
            music:GDATA.musicFileNames[0],
            bg:GDATA.bgFiles[0],
            actions:[],
            onload:[]
        };
        GDATA.event.pageList.push(name);
    });
    
    $("#add-new-module").click(function(){
        DC.addModule([{text:""}],"");
    });
    $("#add-new-module-var").click(function(){
        DC.addModuleVar([{text:""}],"");
    });
    function saveEvent(){
        FileSaver.saveAction($(".action.selected").attr("id"));
        var data = FileSaver.getSaveData();
        $.ajax({
            type:'POST',
            url:'save-location.php',
            data:{file:data.file,type:GDATA.eventPointer.type,scene:GDATA.eventPointer.scene,event:GDATA.eventPointer.event},
            dataType:'json'
        })
        .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
        .fail(function(data){console.log(data)});

        
        if(GDATA.eventPointer.type==="Story"){
            $.ajax({
                type:'POST',
                url:'save-event-references.php',
                data:{eventRefs:data.refs.eventRefs,sceneVarRefs:data.refs.sceneVarRefs,globalVarRefs:data.refs.globalVarRefs,name:GDATA.eventPointer.event,scene:GDATA.eventPointer.scene},
                dataType:'json'
            })
            .done(function(data){console.log(data)})
            .fail(function(data){console.log(data)});
        }
    };
    $("#save-file").click(function(){
        saveEvent();
    });
    $("#test-file").click(function(){
        saveEvent();
        $.redirect('../../index.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type, testing:true});
    });
    
    $("#to-vars").click(function(){
        if(confirm("Save file?")){
            saveEvent();
        }
        $.redirect('edit-vars.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type});
    });
    
    $('#go-back').click( function(e) {
        //TODO UPDATE
        if(confirm("Are you sure you want to go back without saving?")){
            var to = "show-events.php";
            if(GDATA.eventPointer.type==="Flavour"){
                to = "show-flavour.php";
            }
            $.redirect(to, {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type});
        }
    });
    //End editor-content buttons
    
    $(document).on("click","#add-new-onload-group",function(){
        DC.addOnloadGroup($("#onload-cont"),{conds:[],effects:[]});
    });
    $(document).on("click","#add-new-choice",function(){
        DC.addChoice(["choice","changeEvent"]);
    });
    $(document).on("click",".add-new-condition",function(){
        $(this).parent().parent().children(".conditions").append(DC.getCondition());
    });
    $(document).on("click",".add-new-effect",function(){
        $(this).parent().parent().children(".effects").append(DC.getEffect());
    });
    
    $(document).on("change",".conditions-select",function(){
        $(this).parent().parent().children(".cond-props").remove();
        $(this).parent().parent().append(DC.getCondProps($("<div class='cond-props'></div>"),$(this).val()));
    });
    $(document).on("change",".effects-select",function(){
        $(this).parent().parent().children(".effect-props").remove();
        $(this).parent().parent().append(DC.getEffectProps($("<div class='effect-props'></div>"),$(this).val()));
    });
    $(document).on("change",".choices-select",function(){
        $(this).parent().children(".choice-props").remove();
        $(this).parent().append(DC.getChoiceProps($("<div class='choice-props'></div>"),$(this).val()));
    });
    
    //Removes the parent element
    $(document).on("click",".remove-choice",function(e){
        if($(this).parent().attr("id")==="start") return;
        $(this).parent().remove();
        if($(this).parent(".selected").length){
            DC.selectAction("start");
        }
        
    });
    $(document).on("click",".remove-choice-deep",function(e){
        $(this).parent().parent().remove();
    });
    
    $(document).on("click",".minimize-choice",function(e){
        var text = $(this).text();
        if(text==="-"){
            $(this).parent().siblings().hide();
            $(this).text("+");
        } else {
            $(this).parent().siblings().show();
            $(this).text("-");
        }
    });
    /*
    //Conditions selects on change
    $(document).on("change",".scope",function(){
        $(this).parent().children(".vr").empty();
        $(this).parent().children(".vr").append(DC.varOptions($(this).val()));
        if(!$(this).parent().children(".vr").children().length){
            $(this).parent().children(".vr").hide();
            $(this).parent().children(".vl").hide();
        } else {
            $(this).parent().children(".vr").show();
            $(this).parent().children(".vl").show();
        }
    });
    $(document).on("change",".type",function(){
        $(this).parent().children(".scene").empty();
        var type = $(this).val();
        $(this).parent().children(".scene").append(DC.getOptString(DC.p.scenes[type],"name"));
        $(this).parent().children(".scene").trigger("change");
    });
    
    $(document).on("change",".scene",function(){
        $(this).parent().children(".event").empty();
        $(this).parent().children(".event").append(DC.getOptString(DC.p.events[$(this).val()]));
    });
    
    $(document).on("change",".eqType",function(){
        $(this).parent().children(".gear").empty();
        var type = $(this).val();
        $(this).parent().children(".gear").append(DC.getOptString(Object.keys(DC.p.equipment[type])));
        $(".gear").trigger("change");
    });
    $(document).on("change",".gear",function(){
        $(this).parent().children(".material").empty();
        var type = $(this).parent().children(".eqType").val();
        var gear = $(this).val();
        $(this).parent().children(".material").append(DC.getOptString(DC.p.equipment[type][decodeURIComponent(gear)].materials));
    });
    
    $(document).on("change",".file",function(){
        $(this).parent().children(".group").empty();
        var file = $(this).parent().children(".file").val();
        $(this).parent().children(".group").append(DC.getOptString(Object.keys(DC.p.allCharacters[file])));
        $(this).parent().children(".group").trigger("change");
    });
    $(document).on("change",".group",function(){
        $(this).parent().children(".handle").empty();
        var file = $(this).parent().children(".file").val();
        var group = $(this).parent().children(".group").val();
        $(this).parent().children(".handle").append(DC.getOptString(Object.keys(DC.p.allCharacters[file][group])));
    });*/
    
    //Change the props
    $(document).on("change",".check-char-types",function(e){
        DC.changeCharTypeOptions($(this).parent());
        $(this).parent().children(".unique-stat-fields").remove();
        if($(this).parent().children(".propType").val()==="Stat"){
            //Add another field
            $(this).parent().append('\n\
            <p class="editor-descriptor-half light-gradient unique-stat-fields">Operator</p><select class="cond-prop operator inline-select unique-stat-fields"><option>==</option><option><</option><option>></option><option><=</option><option>>=</option></select>\n\
            <p class="editor-descriptor light-gradient unique-stat-fields">Value</p><input class="cond-prop value thirty-height unique-stat-fields" type="number">\n\
            ');
        }
    });
    $(document).on("click",".action-button",function(e){
        $(".action.selected").children("input").trigger("focusout");
        var id = $(this).parent().attr("id");
        if($(".action.selected").attr("id")===id){
            if($(this).parent().attr("id")==="start") return;
            var input = $("<input class='list-item' value='"+id+"'>");
            $(this).replaceWith(input);
            $(input).on("focusout",function(){ 
                if($(this).val()!==id){
                    var oldID = $(this).parent().attr("id");
                    $(this).parent().attr("id",$(this).val());
                    GDATA.event[$(this).parent().attr("id")] = GDATA.event[oldID];
                    delete (GDATA.event[oldID]);
                    GDATA.event.pageList.splice(GDATA.event.pageList.indexOf(oldID),1,$(this).parent().attr("id"));
                }
                $(this).replaceWith("<div class='action-button list-item'>"+$(this).val()+"</div>");
            });
            $(input).focus();
            return;
        }
        FileSaver.saveAction($(".action.selected").attr("id"));
        $("#onload-cont").empty();
        $("#choices-cont").empty();
        var name = $(this).parent().attr("id");
        DC.selectAction(name);
    });
    
    //Add item to buy list
    $(document).on("click",".add-item-button",function(e){
        //Sets initial values but does not use them.
        $(this).parent().append(DC.createItemInList(["Weapons","Short Sword","Shoddy","Brass"]));
    });
    //Change props in buy list
    $(document).on("change",".item-type",function(e){
        //Repopulate gear and materials
        //If type is consumable or accessory, delete material and quality fields
        //Create the fields if they are missing and needed
        var type = $(this).val();
        if(type==="Consumables"){
            $(this).parent().children(".item-gear").empty();
            $(this).parent().children(".item-gear").append(DC.getOptString(Object.keys(DC.p.items)));
            $(this).parent().children(".item-material").remove();
            $(this).parent().children(".item-quality").remove();
        } else if(type==="Accessories"){
            $(this).parent().children(".item-gear").empty();
            $(this).parent().children(".item-gear").append(DC.getOptString(Object.keys(DC.p.equipment[type])));
            $(this).parent().children(".item-material").remove();
            $(this).parent().children(".item-quality").remove();
        } else {
            $(this).parent().children(".item-gear").empty();
            $(this).parent().children(".item-gear").append(DC.getOptString(Object.keys(DC.p.equipment[type])));
            if(!$(this).parent().children(".item-material").length){
                $(this).parent().append("<select class='arr-prop item-quality' initial-value='Shoddy'>"+DC.getOptString(Object.keys(DC.p.equipment.Quality))+"</select><select class='arr-prop item-material' initial-value=''>'"+DC.getOptString(DC.p.equipment[type][Object.keys(DC.p.equipment[type])[0]].materials)+"'</select>");
            }
        }
        $(this).parent().children(".item-gear").trigger("change");
    });
    $(document).on("change",".item-gear",function(e){
        var type = $(this).parent().children(".item-type").val();
        if(type==="Consumables"||type==="Accessories") return;
        var gear = $(this).val();
        $(this).parent().children(".item-material").empty();
        $(this).parent().children(".item-material").append(DC.getOptString(DC.p.equipment[type][gear].materials));
    });
    
    $(document).on("click",".var-remove",function(){
        var name = $(this).siblings(".var-name").text();
        delete GDATA.event.vrs[name];
    });
    $(document).on("change",".var-name",function(){
        var name = $(this).val();
        if(name.length){
            var matched = false;
            $(".var-name").each(function(){
                if(name===$(this).text()) matched = true;
            });
            if(!matched){
                GDATA.event.vrs[name] = FileSaver.processValue($(this).siblings(".var-value").val());
                $(this).replaceWith("<div class='var-name'>"+name+"</div>");
            }
        }
    });
    $(document).on("change",".var-value",function(){
        if(!$(this).val().length||$(this).siblings(".var-name").is("input")) return;
        GDATA.event.vrs[$(this).siblings(".var-name").text()] = FileSaver.processValue($(this).val());
    });
    
    //Change the type of the check
    $(document).on("change",".check-types",function(e){
        DC.moduleChangeType($(this).parent());
    });
    $(document).on("change",".module-var-scope",function(e){
        DC.moduleVarChangeScope($(this).parent().parent());
    });
    $("#onload-cont").sortable({
        axis: "y"
    });
    $("#onload-cont").disableSelection();
    
    $("#actions-cont").sortable({
        axis: "y"
    });
    $("#actions-cont").disableSelection();
    
    $("#choices-cont").sortable({
        axis: "y"
    });
    $("#choices-cont").disableSelection();
    DC.init();
};
start();
});