$(function(){
var uniqueActions = 1;

function saveEvent(){
    FileSaver.savePage($(".action.selected").attr("id"));
    var refs = FileSaver.getSaveReferences();
    $.ajax({
        type:'POST',
        url:'save-location.php',
        data:{file:JSON.stringify(FileSaver.event),type:uic.dataP.eventPointer.type,scene:uic.dataP.eventPointer.scene,event:uic.dataP.eventPointer.event},
        dataType:'json'
    })
    .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
    .fail(function(data){console.log(data)});

    if(uic.dataP.eventPointer.type==="Story"){
        $.ajax({
            type:'POST',
            url:'save-event-references.php',
            data:{eventRefs:refs.eventRefs,sceneVarRefs:refs.sceneVarRefs,globalVarRefs:refs.globalVarRefs,name:uic.dataP.eventPointer.event,scene:uic.dataP.eventPointer.scene},
            dataType:'json'
        })
        .done(function(data){console.log(data)})
        .fail(function(data){console.log(data)});
    }
};
var FileSaver = {
    event:GDATA.event,
    getPage:function(name){
        return this.event.pages.find(function(page){return page.name === name; });
    },
    savePage:function(name){
        var page = this.getPage(name);
        page.bg = $("#bg-select select").val();
        page.music = $("#music-select select").val();
        page.text = $("#text-select textarea").val();
        page.onload = uic.getSaveGroups($("#onload-cont"));
        page.options = uic.getSaveChoices($("#options-cont"));
    },
    getSaveReferences:function(){
        var dataToCheck = [];
        function add(itm){
            itm.options.forEach(function(o){
                o[2].forEach(function(c){
                    dataToCheck.push(c);
                });
            });
            itm.onload.forEach(function(o){
                o[1].forEach(function(c){
                    dataToCheck.push(c);
                });
                o[2].forEach(function(e){
                    dataToCheck.push(e);
                });
            });
        }
        for(var i=0;i<this.event.pages.length;i++){
            var page = this.event.pages[i];
            add(page);
        }
        return uic.getSaveReferences(dataToCheck);
    }
};
var uic = new UIC({
    dataP:{
        events:GDATA.events,
        scenes:GDATA.scenes,
        scopes:["Event","Scene","Global"],
        vars:{
            Event:GDATA.event.vrs,
            Scene:GDATA.dataFiles["scenes-list.json"].Story.find(function(scene){return scene.name===GDATA.eventPointer.scene;}).vrs,
            Global:GDATA.dataFiles["global-vars.json"].vrs
        },
        conditionals:["==","!=",">=","<="],
        officers:Object.keys(GDATA.characterFiles["Officers.json"]["Officers"]),
        charFiles:GDATA.characterFiles,
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
            "Derived Stats":GDATA.dataFiles["character-generation.json"].combatStats
        },
        keywords:["partySize","rosterSize"],
        sceneTypes:["Story","Flavour"],
        equipmentTypes:["Weapons","Shields","Armour","Footwear","Accessories","Consumables"],
        conditionalEquals:["==","!="],
        operators:["=","+=","-="],
        eventPointer:GDATA.eventPointer
    },
    topBarProps:{
        Save:function(){
            saveEvent();
        },
        Test:function(){
            saveEvent();
            $.redirect('../../index.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type, testing:true});
        },
        "To Scene Vars":function(){
            if(confirm("Save file?")){
                saveEvent();
            }
            $.redirect('edit-vars.php', {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type});
        },
        Back:function(){
            if(confirm("Are you sure you want to go back without saving?")){
                var to = "show-events.php";
                if(GDATA.eventPointer.type==="Flavour"){
                    to = "show-flavour.php";
                }
                $.redirect(to, {'scene':GDATA.eventPointer.scene, 'event':GDATA.eventPointer.event, 'type':GDATA.eventPointer.type});
            }
        }
    },
    optionsFuncs:["changeEvent","changePage","createRecruitMenu","displayBuyItemsList","displaySellItemsList","createGatherInfoMenu","createHuntMenu"],
    optionProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "changeEvent";
        switch(func){
            case "changeEvent":
                props = props || [dataP.eventPointer.type,dataP.eventPointer.scene,dataP.eventPointer.event];
                cont.append(this.Select("Type",dataP.sceneTypes,props[0],"scene-type"));
                cont.append(this.Select("Scene",dataP.scenes[props[0]],props[1],"scene-name"));
                cont.append(this.Select("Event",dataP.events[props[0]][props[1]],props[2],"event-name"));$($(cont).children("select")[0]).trigger("change");
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.scenes);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.events,[$(cont).children("select")[0]]);
                break;
            case "changePage":
                var pageNames = [];
                $(".action-button").each(function(){pageNames.push($(this).text());});
                props = props || [pageNames[0],""];
                cont.append(this.Select("Page",pageNames,props[0],"page"));
                break;
            case "displaySellItemsList":
            case "createRecruitMenu":
            case "createGatherInfoMenu":
            case "createHuntMenu":
                //No extra props
                break;
            case "displayBuyItemsList":
                props = props || [[]];
                var items = this.Container("Items",props[0],false,false,true);
                //When an item is changed, save the item
                function saveItem(idx){
                    var data = JSON.parse(items.attr("data"));
                    var group = $(items).children(".UIC-cont-props").children(".UIC-group-item:eq("+idx+")");
                    data[idx][0] = group.children("select:eq(0)").val(); 
                    data[idx][1] = group.children("select:eq(1)").val();
                    data[idx][2] = group.children("select:eq(2)").val();
                    data[idx][3] = group.children("select:eq(3)").val();
                    items.attr("data",JSON.stringify(data));
                }
                function removeItem(idx){
                    var data = JSON.parse(items.attr("data"));
                    data.splice(idx,1);
                    items.attr("data",JSON.stringify(data));
                }
                function addShopItem(p){
                    p = Array.isArray(p) ? p : ["Weapons","Short Sword","Brass","Shoddy"];
                    var item = $("<div class='UIC-group-item'></div>");
                    item.append("<select class='quarter-width'>"+uic.getOptions(dataP.equipmentTypes)+"</select>");
                    item.children("select:eq(0)").val(p[0]);
                    item.append("<select class='quarter-width'>"+uic.getOptions(GDATA.dataFiles["equipment.json"][p[0]])+"</select>");
                    item.children("select:eq(1)").val(p[1]);
                    item.append("<select class='quarter-width'>"+uic.getOptions(GDATA.dataFiles["equipment.json"][p[0]][p[1]].materials)+"</select>");
                    item.children("select:eq(2)").val(p[2]);
                    item.append("<select class='fifteen-width'>"+uic.getOptions(GDATA.dataFiles["equipment.json"].Quality)+"</select>");
                    item.children("select:eq(3)").val(p[3]);
                    item.append("<div class='tenth-width remove-choice'><span>x</span></div>");
                    uic.linkSelects(item.children("select:eq(0)"),item.children("select:eq(1)"),GDATA.dataFiles["equipment.json"]);
                    uic.linkSelects(item.children("select:eq(1)"),item.children("select:eq(2)"),GDATA.dataFiles["equipment.json"],item.children("select:eq(0)"),"materials");
                    items.children(".UIC-cont-props").append(item);
                    $(item).children(".remove-choice").click(function(){
                        removeItem($(this).parent().index());
                        $(this).parent().remove();
                    });
                    //This is pretty inefficient but w/e
                    item.children("select").change(function(){
                        saveItem($(this).parent().index());
                    });
                    
                };
                var button = $("<span class='full-width UIC-button'>Add Item</div>");
                button.on("click",function(){
                    addShopItem();
                    var last = items.children(".UIC-cont-props").children(".UIC-group-item").last();
                    var data = JSON.parse(items.attr("data"));
                    data.push([last.children("select:eq(0)").val(),last.children("select:eq(1)").val(),last.children("select:eq(2)").val(),last.children("select:eq(3)").val()])
                    items.attr("data",JSON.stringify(data));
                });
                cont.append(button);
                cont.append(items);
                
                for(var i=0;i<props[0].length;i++){
                    addShopItem(props[0][i]);
                }
                break;
        }
        this.selectInitialValue(cont);
        return cont;
    },
    conditionsFuncs:["checkVar","checkCharProp","checkCharPersonality","checkCharStat","checkKeyword","hasItemInBag"],
    conditionProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "checkVar";
        switch(func){
            case "checkVar":
                props = props || ["Global","money","==",1000];
                cont.append(this.Select("Scope",dataP.scopes,props[0]));
                cont.append(this.Select("Var",dataP.vars[props[0]],props[1]));
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.vars);
                cont.append(this.Select("Operator",dataP.conditionals,props[2]));
                cont.append(this.Input("Value",props[3],"text"));
                break;
            case "checkCharProp":
                props = props || [dataP.officers[0],dataP.charPropTypes[0],dataP.conditionalEquals[0],dataP.charPropValues[dataP.charPropTypes[0]][0]];
                cont.append(this.Select("Char",dataP.officers.concat("Current"),props[0]));
                cont.append(this.Select("Prop",dataP.charPropTypes,props[1]));
                cont.append(this.Select("Oper",dataP.charPropConditionals[props[1]],props[2]));
                cont.append(this.Select("Value",dataP.charPropValues[props[1]],props[3]));
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.charPropConditionals);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[3],dataP.charPropValues);
                break;
            case "checkCharPersonality":
                props = props || [dataP.officers[0],dataP.charPersonalityMuch[0],dataP.charPersonalityTypes[0],dataP.charPersonalityPossesion[0]];
                cont.append(this.Select("Char",dataP.officers.concat("Current"),props[0]));
                cont.append(this.Select("How Much",dataP.charPersonalityMuch,props[1]));
                cont.append(this.Select("Personality",dataP.charPersonalityTypes,props[2]));
                cont.append(this.Select("Possesion",dataP.charPersonalityPossesion,props[3]));
                break;
            case "checkCharStat":
                props = props || [dataP.officers[0],dataP.charStatProps[0],dataP.charStatValues[dataP.charStatProps[0]][0],dataP.conditionals[0],0];
                cont.append(this.Select("Char",dataP.officers.concat("Current"),props[0]));
                cont.append(this.Select("Prop",dataP.charStatProps,props[1]));
                cont.append(this.Select("Stat",dataP.charStatValues[props[1]],props[2]));
                cont.append(this.Select("Oper",dataP.conditionals,props[3]));
                cont.append(this.Input("Value",props[4],"number",0));
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.charStatValues);
                break;
            case "checkKeyword":
                props = props || [dataP.keywords[0],dataP.conditionals[0],1];
                cont.append(this.Select("Keyword",dataP.keywords,props[0]));
                cont.append(this.Select("Oper",dataP.conditionals,props[1]));
                cont.append(this.Input("Value",props[2],"number",0));
                break;
            case "hasItemInBag":
                props = props || ["Weapons","Short Sword","Bronze","Average",1];
                cont.append(this.Select("Eq Type",dataP.equipmentGear,props[0]));
                cont.append(this.Select("Gear",dataP.equipmentGear[props[0]],props[1]));
                cont.append(this.Select("Materials",dataP.materials[props[1]],props[2]));
                cont.append(this.Select("Quality",dataP.quality,props[3]));
                cont.append(this.Input("How Many",props[4],"number"));
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.equipmentGear);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.materials);
                break;
        }
        this.selectInitialValue(cont);
        return cont;
    },
    effectsFuncs:["setVar","changePage","changeEvent","addToRoster","enableChoice","disableChoice","goToAnchorEvent","recruitChar","changeInfluence","changeRelation","obtainItem","useItem"],
    effectProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "setVar";
        switch(func){
            case "setVar":
                props = props || ["Global","money","+=",1000];
                cont.append(this.Select("Scope",dataP.scopes,props[0]));
                cont.append(this.Select("Var",dataP.vars[props[0]],props[1]));
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.vars);
                cont.append(this.Select("Operator",dataP.operators,props[2]));
                cont.append(this.Input("Value",props[3],"text"));
                break;
            case "changePage":
                var pageNames = [];
                $(".action-button").each(function(){pageNames.push($(this).text());});
                props = props || [pageNames[0],""];
                cont.append(this.Select("Page",pageNames,props[0],"page"));
                break;
            case "changeEvent":
                props = props || [dataP.eventPointer.type,dataP.eventPointer.scene,dataP.eventPointer.event];
                cont.append(this.Select("Type",dataP.sceneTypes,props[0],"scene-type"));
                cont.append(this.Select("Scene",dataP.scenes[props[0]],props[1],"scene-name"));
                cont.append(this.Select("Event",dataP.events[props[0]][props[1]],props[2],"event-name"));$($(cont).children("select")[0]).trigger("change");
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.scenes);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.events,[$(cont).children("select")[0]]);
                break;
            case "addToRoster":
                var files = Object.keys(dataP.charFiles);
                var groups = Object.keys(dataP.charFiles[files[0]]);
                var handles = Object.keys(dataP.charFiles[files[0]][groups[0]]);
                props = props || [files[0],groups[0],handles[0]];
                cont.append(this.Select("File",Object.keys(dataP.charFiles),props[0]));
                cont.append(this.Select("Group",Object.keys(dataP.charFiles[files[0]]),props[1]));
                cont.append(this.Select("Handle",Object.keys(dataP.charFiles[files[0]][groups[0]]),props[2]));
                $($(cont).children("select")[0]).trigger("change");
                $($(cont).children("select")[1]).trigger("change");
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.charFiles);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.charFiles,[$(cont).children("select")[0]]);
                break;
            case "enableChoice":
                var choiceNames = [];
                if(!props){
                    $(".UIC-choice").children(".UIC-choice-hud").children(".UIC-choice-title-cont").children(".UIC-choice-title").each(function(){choiceNames.push($(this).text());});
                } else {
                    choiceNames = FileSaver.getPage($(".page.selected").attr("id")).choices.map(function(choice){return choice[0];});
                }
                props = props || [choiceNames[0]];
                cont.append(this.Select("Choice",choiceNames,props[0]));
                break;
            case "disableChoice":
                var choiceNames = [];
                if(!props){
                    $(".UIC-choice").children(".UIC-choice-hud").children(".UIC-choice-title-cont").children(".UIC-choice-title").each(function(){choiceNames.push($(this).text());});
                } else {
                    choiceNames = FileSaver.getPage($(".page.selected").attr("id")).choices.map(function(choice){return choice[0];});
                }
                props = props || [choiceNames[0]];
                cont.append(this.Select("Choice",choiceNames,props[0]));
                break;
            case "goToAnchorEvent":
                
                break;
            case "recruitChar":
                var files = Object.keys(dataP.charFiles);
                var groups = Object.keys(dataP.charFiles[files[0]]);
                var handles = Object.keys(dataP.charFiles[files[0]][groups[0]]);
                props = props || [files[0],groups[0],handles[0]];
                cont.append(this.Select("File",Object.keys(dataP.charFiles),props[0]));
                cont.append(this.Select("Group",Object.keys(dataP.charFiles[files[0]]),props[1]));
                cont.append(this.Select("Handle",Object.keys(dataP.charFiles[files[0]][groups[0]]),props[2]));
                $($(cont).children("select")[0]).trigger("change");
                $($(cont).children("select")[1]).trigger("change");
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.charFiles);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.charFiles,[$(cont).children("select")[0]]);
                break;
            case "changeInfluence":
                props = props || [dataP.influence[0],dataP.operators[1],10];
                cont.append(this.Select("Stat",dataP.influence,props[0]));
                cont.append(this.Select("Oper",dataP.operators,props[1]));
                cont.append(this.Input("Value",props[2],"number",0));
                break;
            case "changeRelation":
                props = props || [dataP.places[0],dataP.relations[0],dataP.operators[1],10];
                cont.append(this.Select("Place",dataP.places,props[0]));
                cont.append(this.Select("Type",dataP.relations,props[1]));
                cont.append(this.Select("Oper",dataP.operators,props[2]));
                cont.append(this.Input("Value",props[3],"number",0));
                break;
            case "obtainItem":
            case "useItem":
                props = props || ["Weapons","Short Sword","Bronze","Average",1];
                cont.append(this.Select("Eq Type",dataP.equipmentGear,props[0]));
                cont.append(this.Select("Gear",dataP.equipmentGear[props[0]],props[1]));
                cont.append(this.Select("Materials",dataP.materials[props[1]],props[2]));
                cont.append(this.Select("Quality",dataP.quality,props[3]));
                cont.append(this.Input("How Many",props[4],"number"));
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.equipmentGear);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.materials);
                break;
        }
        this.selectInitialValue(cont);
        return cont;
    }
});
//Start the action after all data is loaded.
var start = function(){
    uic.createTopMenu($("#editor-content"));
    var DC = {
        init:function(){
            var pages = FileSaver.event.pages;
            var event = FileSaver.event;
            var vrs = event.vrs;
            //Create the vrs
            var keys = Object.keys(vrs);
            for(var i=0;i<keys.length;i++){
                this.addVar(keys[i],decodeURIComponent(vrs[keys[i]]));
            }
            for(var i=0;i<pages.length;i++){
                var p = pages[i];
                this.addAction($("#actions-cont"),p.name);
            }
            //Create a page if there is not one
            if(!pages.length) createNewAction(FileSaver.event);
            this.selectAction(pages[0].name);
        },
        //Adds a var to the list
        addVar:function(name,val){
            if(name){
                $("#variables-cont").append("<div class='var-button'><div class='var-name'>"+name+"</div><div class='remove-choice'><span>x</span></div><input class='var-value' value="+(val?val:0)+"></div>");
            } else {
                $("#variables-cont").append("<div class='var-button'><input class='var-name' placeholder='VARNAME'><div class='remove-choice'><span>x</span></div><input class='var-value' value='false'></div>");
                $("#variables-cont").children(".var-button").last().children(".var-name").on("change",function(){
                    var name = $(this).val();
                    if(name.length){
                        var matched = false;
                        $(".var-name").each(function(){
                            if(name===$(this).text()) matched = true;
                        });
                        if(!matched){
                            FileSaver.event.vrs[name] = uic.processValue($(this).siblings(".var-value").val());
                            $(this).replaceWith("<div class='var-name'>"+name+"</div>");
                        }
                    }
                });
            }
            $("#variables-cont").children(".var-button").last().children(".var-value").on("change",function(){
                if(!$(this).val().length||$(this).siblings(".var-name").is("input")) return;
                FileSaver.event.vrs[$(this).siblings(".var-name").text()] = uic.processValue($(this).val());
            });
            $("#variables-cont").children(".var-button").children(".remove-choice").click(function(){
                if(!$(this).siblings(".var-name").is("input")){
                    var name = $(this).siblings(".var-name").text();
                    delete FileSaver.event.vrs[name];
                }
                $(this).parent().remove();
            });
        },
        //Changes the value of a vr
        editVar:function(vr,val){
            this.vars[vr] = val;
        },
        //Adds a action to the list
        addAction:function(cont,name){
            $(cont).append("<div id='"+name+"' class='action'><div class='action-button list-item'>"+name+"</div><div class='remove-choice'><span>x</span></div></div>");
            $(cont).children(".action").last().children(".remove-choice").click(function(){
                if(FileSaver.event.pages.length === 1) return;
                for(var i=0;i<FileSaver.event.pages.length;i++){
                    if(FileSaver.event.pages[i].name === name){
                        FileSaver.event.pages.splice(i,1);
                        break;
                    }
                }
                if($(this).parent().hasClass("selected")){
                    DC.selectPage($(".page").first().attr("id"));
                }
                $(this).parent().remove();
            });
            uniqueActions++;
        },
        selectAction:function(name){
            $(".action.selected").removeClass("selected");
            $("[id='"+name+"'").addClass("selected");
            this.displayAction(name);
        },
        displayAction:function(name){
            var data = FileSaver.getPage(name);
            $("#music-select select").val(data.music);
            $("#music-select select").trigger("change");
            $("#bg-select select").val(data.bg);
            $("#bg-select select").trigger("change");
            for(var i=0;i<data.options.length;i++){
                uic.createOptionsGroup($("#options-cont"),data.options[i]);
            }
            for(var i=0;i<data.onload.length;i++){
                uic.createCondEffectsGroup($("#onload-cont"),data.onload[i]); 
            }
        }
    };
    
    
    //BG and Music selects start
    $("#music-select select").append(uic.getOptions(GDATA.musicFileNames));
    uic.linkSelectToSrc($("#music-select select"),$("#music-select audio"),"../../audio/bgm/");
    $("#music-select select").on("change",function(){
        $("#music-select audio").attr("src","../../audio/bgm/"+$(this).val());
    });
    
    $("#bg-select select").append(uic.getOptions(GDATA.bgFiles));
    uic.linkSelectToSrc($("#bg-select select"),$("#bg-select img"),"../../images/bg/");
    
    //BG and Music selects end
    
    //Start editor-content buttons
    $("#add-var").click(function(){
        DC.addVar();
    });
    function createNewAction(start){
        var name = "Action "+uniqueActions;
        var music = start ? start.music : $("#music-select").children(".music-select").val();
        var bg = start ? start.bg : $("#bg-select").children(".bg-select").val();
        DC.addAction($("#actions-cont"),name);
        FileSaver.event.pages.push({
            name:name,
            music: music,
            bg:bg,
            options:[],
            onload:[]
        });
    }
    $("#add-action").click(function(){
        createNewAction();
    });
    //End editor-content buttons
    
    $(document).on("click","#add-new-onload-group",function(){
        uic.createCondEffectsGroup($("#onload-cont"));
    });
    $(document).on("click","#add-new-option",function(){
        uic.createOptionsGroup($("#options-cont"));
    });
    $(document).on("click",".action-button",function(e){
        $(".action.selected").children("input").trigger("focusout");
        var id = $(this).parent().attr("id");
        if($(".action.selected").attr("id")===id){
            var input = $("<input class='list-item' value='"+id+"'>");
            $(this).replaceWith(input);
            $(input).on("focusout",function(){ 
                if($(this).val()!==id){
                    var oldID = $(this).parent().attr("id");
                    $(this).parent().attr("id",$(this).val());
                    FileSaver.event[$(this).parent().attr("id")] = FileSaver.event[oldID];
                    delete (FileSaver.event[oldID]);
                    FileSaver.event.pageList.splice(FileSaver.event.pageList.indexOf(oldID),1,$(this).parent().attr("id"));
                }
                $(this).replaceWith("<div class='action-button list-item'>"+$(this).val()+"</div>");
            });
            $(input).focus();
            return;
        }
        FileSaver.savePage($(".action.selected").attr("id"));
        $("#onload-cont").empty();
        $("#options-cont").empty();
        var name = $(this).parent().attr("id");
        DC.selectAction(name);
    });
    /*
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
    });*/
    
    $("#onload-cont").sortable({
        axis: "y"
    });
    $("#onload-cont").disableSelection();
    
    $("#options-cont").sortable({
        axis: "y"
    });
    $("#options-cont").disableSelection();
    DC.init();
};
start();
});