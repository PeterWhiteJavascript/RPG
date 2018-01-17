$(function(){
var uniquePages = 1;
function saveEvent(){
    FileSaver.savePage($(".page.selected").attr("id"));
    var refs = FileSaver.getSaveReferences();
    $.ajax({
        type:'POST',
        url:'save-file.php',
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
        page.choices = uic.getSaveChoices($("#choices-cont"));
        page.modules = uic.getSaveModules($("#modules-cont"));
    },
    getSaveReferences:function(){
        var dataToCheck = [];
        function add(itm){
            itm.choices.forEach(function(o){
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
var createMaterialsObj = function(){
    var obj = {};
    function add(data,keys){
        keys.forEach(function(key){
            var gears = Object.keys(data[key]);
            gears.forEach(function(gear){
                obj[gear] = data[key][gear].materials || ["None"];
            });
        });
    }
    add(GDATA.dataFiles["equipment.json"],["Weapons","Shields","Armour","Footwear","Accessories"])
    Object.keys(GDATA.dataFiles["items.json"]).forEach(function(i){
        obj[i] = ["None"];
    });
    return obj;
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
        charPropTypes:["Nationality","Character Class","Character Group","Value","Methodology","Loyalty","Morale","Gender"],
        charPropValues:{
            Nationality:GDATA.dataFiles["character-generation.json"].nationalities,
            "Character Class":GDATA.dataFiles["character-generation.json"].classNames,
            "Character Group":GDATA.dataFiles["character-generation.json"].classGroups,
            Value:GDATA.dataFiles["character-generation.json"].values,
            Methodology:GDATA.dataFiles["character-generation.json"].methodologies,
            Loyalty:["Traitorous","Disloyal","Average","Loyal","Admiring","Idolizing"],
            Morale:["Quit","Unhappy","Content","Inspired","Ecstatic"],
            Gender:GDATA.dataFiles["character-generation.json"].genders
        },
        charPersonalityTypes:GDATA.dataFiles["character-generation.json"].personalityNames,
        charPersonalityMuch:["All"].concat(GDATA.dataFiles["character-generation.json"].personalities.muchValues),
        charPersonalityPossesion:["Has","Lacks"],
        charStatProps:["Base Stats","Derived Stats"],
        charStatValues:{
            "Base Stats":GDATA.dataFiles["character-generation.json"].statNames,
            "Derived Stats":GDATA.dataFiles["character-generation.json"].combatStats
        },
        keywords:["partySize","rosterSize"],
        sceneTypes:["Story","Flavour"],
        equipmentGear:{
            Weapons:Object.keys(GDATA.dataFiles["equipment.json"].Weapons),
            Shields:Object.keys(GDATA.dataFiles["equipment.json"].Shields),
            Armour:Object.keys(GDATA.dataFiles["equipment.json"].Armour),
            Footwear:Object.keys(GDATA.dataFiles["equipment.json"].Footwear),
            Accessories:Object.keys(GDATA.dataFiles["equipment.json"].Accessories),
            Consumables:Object.keys(GDATA.dataFiles["items.json"])
        },
        materials:createMaterialsObj(),
        conditionalEquals:["==","!="],
        operators:["=","+=","-="],
        relations:["Reputation","Stability"],
        places:["Venoriae","Dardoine","Aljudramil","Talumpatua","Nomads"],
        influence:["Pragmatic","Kind","Intuitive","Egoist","Altruist","Nepotist"],
        loyaltyOptions:["Current"],
        quality:Object.keys(GDATA.dataFiles["equipment.json"].Quality),
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
    effectsFuncs:["setVar","changePage","changeEvent","enableChoice","disableChoice","goToAnchorEvent","recruitChar","changeInfluence","changeRelation","obtainItem","useItem"],
    effectProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "setVar";
        switch(func){
            case "setVar":
                props = props || ["Global","money","+=",1];
                cont.append(this.Select("Scope",dataP.scopes,props[0]));
                cont.append(this.Select("Var",dataP.vars[props[0]],props[1]));
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.vars);
                cont.append(this.Select("Operator",dataP.operators,props[2]));
                cont.append(this.Input("Value",props[3],"text"));
                break;
            case "changePage":
                var pageNames = FileSaver.event.pages.map(function(page){return page.name;});
                $(".action-button").each(function(){pageNames.push($(this).text());});
                props = props || [pageNames[0],""];
                cont.append(this.Select("Page",pageNames,props[0]));
                break;
            case "changeEvent":
                props = props || [dataP.eventPointer.type,dataP.eventPointer.scene,dataP.eventPointer.event];
                cont.append(this.Select("Type",dataP.sceneTypes,props[0],"scene-type"));
                cont.append(this.Select("Scene",dataP.scenes[props[0]],props[1],"scene-name"));
                cont.append(this.Select("Event",dataP.events[props[0]][props[1]],props[2],"event-name"));$($(cont).children("select")[0]).trigger("change");
                this.linkSelects($(cont).children("select")[0],$(cont).children("select")[1],dataP.scenes);
                this.linkSelects($(cont).children("select")[1],$(cont).children("select")[2],dataP.events,[$(cont).children("select")[0]]);
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
    },
    impactProps:function(props){
        props = props || ["All"];
        var group = uic.createGroup(
            [
                this.getPremadeGroup("ImpactConditions",props[1]),
                this.getPremadeGroup("ImpactEffects",props[2])
            ],
            [
                uic.Select("Conds Req",["All","Some","One"],[props[0]])
            ]
        );
        return group;
    },
    impactConditionsProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "Name";
        switch(func){
            case "Name":
                props = props || [dataP.conditionalEquals[0],"Officers"];
                cont.append(this.Select("Operator",dataP.conditionalEquals,props[0]));
                cont.append(this.Select("Character",dataP.officers.concat("Current","Officers"),props[1]));
                break;
            case "Personality":
                props = props || [dataP.charPersonalityMuch[0],dataP.charPersonalityTypes[0],dataP.charPersonalityPossesion[0]];
                cont.append(this.Select("How Much",dataP.charPersonalityMuch,props[0]));
                cont.append(this.Select("Personality",dataP.charPersonalityTypes,props[1]));
                cont.append(this.Select("Possesion",dataP.charPersonalityPossesion,props[2]));
                break;
            case "Nationality":
                props = props || [dataP.conditionalEquals[0],dataP.charPropValues["Nationality"][0]];
                cont.append(this.Select("Operator",dataP.conditionalEquals,props[0]));
                cont.append(this.Select("Nationality",dataP.charPropValues["Nationality"],props[1]));
                break;
            case "Character Group":
                props = props || [dataP.conditionalEquals[0],dataP.charPropValues["Character Group"][0]];
                cont.append(this.Select("Operator",dataP.conditionalEquals,props[0]));
                cont.append(this.Select("Char Group",dataP.charPropValues["Character Group"],props[1]));
                break;
            case "Character Class":
                props = props || [dataP.conditionalEquals[0],dataP.charPropValues["Character Class"][0]];
                cont.append(this.Select("Operator",dataP.conditionalEquals,props[0]));
                cont.append(this.Select("Char Class",dataP.charPropValues["Character Class"],props[1]));
                break;
            case "Value":
                props = props || [dataP.conditionals[0],dataP.charPropValues["Value"][0]];
                cont.append(this.Select("Operator",dataP.conditionals,props[0]));
                cont.append(this.Select("Value",dataP.charPropValues["Value"],props[1]));
                break;
            case "Methodology":
                props = props || [dataP.conditionals[0],dataP.charPropValues["Methodology"][0]];
                cont.append(this.Select("Operator",dataP.conditionals,props[0]));
                cont.append(this.Select("Methodology",dataP.charPropValues["Methodology"],props[1]));
                break;
            case "Loyalty":
                props = props || [dataP.conditionals[0],dataP.charPropValues["Loyalty"][0]];
                cont.append(this.Select("Operator",dataP.conditionals,props[0]));
                cont.append(this.Select("Loyalty",dataP.charPropValues["Loyalty"],props[1]));
                break;
            case "Morale":
                props = props || [dataP.conditionals[0],dataP.charPropValues["Morale"][0]];
                cont.append(this.Select("Operator",dataP.conditionals,props[1]));
                cont.append(this.Select("Morale",dataP.charPropValues["Morale"],props[0]));
                break
            case "Gender":
                props = props || [dataP.conditionalEquals[0],dataP.charPropValues["Gender"][0]];
                cont.append(this.Select("Operator",dataP.conditionalEquals,props[0]));
                cont.append(this.Select("Gender",dataP.charPropValues["Gender"],props[1]));
                break;
        }
        this.selectInitialValue(cont);
        return cont;
    },
    impactEffectsProps:function(func,props){
        var cont = $("<div class='UIC-group-item-props'></div>");
        var dataP = this.dataP;
        func = func || "Morale";
        switch(func){
            case "Morale":
                props = props || ["+=",10];
                cont.append(this.Select("Oper",dataP.operators,props[0]));
                cont.append(this.Input("Value",props[1],"number",0));
                break;
            case "Loyalty":
                props = props || ["+=",5];
                cont.append(this.Select("Oper",dataP.operators,props[0]));
                cont.append(this.Input("Value",props[1],"number",0));
                break;
            case "Stat":
                props = props || [dataP.charStatValues["Base Stats"][0],dataP.operators[1],5,3];
                cont.append(this.Select("Stat",dataP.charStatValues["Base Stats"],props[0]));
                cont.append(this.Select("Oper",dataP.operators,props[1]));
                cont.append(this.Input("Value",props[2],"number",0));
                cont.append(this.Input("Turns",props[3],"number",0));
                break;
        }
        this.selectInitialValue(cont);
        return cont;
    }
});

uic.impactConditionsFuncs = ["Name","Personality"].concat(uic.dataP.charPropTypes);
uic.impactEffectsFuncs = ["Morale","Loyalty","Stat"];
uic.dataP.charPropConditionals = {
    Nationality:uic.dataP.conditionalEquals,
    "Character Class":uic.dataP.conditionalEquals,
    "Character Group":uic.dataP.conditionalEquals,
    Value:uic.dataP.conditionals,
    Methodology:uic.dataP.conditionals,
    Loyalty:uic.dataP.conditionals,
    Morale:uic.dataP.conditionals,
    Gender:uic.dataP.conditionalEquals
};
var start = function(){
    uic.createTopMenu($("#editor-content"));
    //In charge of dynamic content
    var DC = {
        //Initialize this object with the vrs and pages from the save data. vrs and pages are the only properties that get saved on this page
        init:function(){
            var pages = FileSaver.event.pages;
            var vrs = FileSaver.event.vrs;

            //Create the vrs
            var keys = Object.keys(vrs);
            for(var i=0;i<keys.length;i++){
                this.addVar(keys[i],vrs[keys[i]]);
            }
            //Create the pages
            for(var i=0;i<pages.length;i++){
                var p = pages[i];
                this.addPage($("#pages-cont"),p.name);
            }
            //Create a page if there is not one
            if(!pages.length) $("#add-page").click();
            this.selectPage(pages[0].name);
        },
        //Adds a var to the list
        addVar:function(name,val){
            if(name){
                $("#variables-cont").append("<div class='var-button'><div class='var-name'>"+name+"</div><div class='remove-choice'><span>x</span></div><input class='var-value' value="+val+"></div>");
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
        //Adds a page to the list
        addPage:function(cont,name){
            $(cont).append("<div id='"+name+"' class='page'><div class='page-button list-item'>"+name+"</div><div class='remove-choice'><span>x</span></div></div>");
            $("[id='"+name+"']").children(".remove-choice").click(function(){
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
            uniquePages++;
        },
        selectPage:function(name){
            $(".page.selected").removeClass("selected");
            $("[id='"+name+"'").addClass("selected");
            this.displayPage(name);
        },
        //Using the page data, fill the edit page menu
        displayPage:function(name){
            var data = FileSaver.getPage(name);
            $("#music-select select").val(data.music);
            $("#music-select select").trigger("change");
            $("#bg-select select").val(data.bg);
            $("#bg-select select").trigger("change");
            $("#text-select textarea").val(data.text);
            //Create choices early as we need the enableChoice options
            for(var i=0;i<data.choices.length;i++){
                uic.createChoiceGroup($("#choices-cont"),data.choices[i]);
            }
            for(var i=0;i<data.onload.length;i++){
                uic.createCondEffectsGroup($("#onload-cont"),data.onload[i]); 
            }
            for(var i=0;i<data.modules.length;i++){
                uic.createModuleGroup($("#modules-cont"),data.modules[i]);
            }
        },
        finishEditPageName:function(){
            var spObj = DC.getSelectedPage();
            var name = $(spObj).find(':first-child').val();
            var orig = $(spObj).find(':first-child').attr("origValue");
            if(!name.length){
                name = orig;
            }
            $(spObj).find(':first-child').remove();
            $(spObj).append('<div class="page-button menu-button btn btn-default selected-color">'+name+'</div>');
            $(".pages-to option").each(function(){
                if($(this).text()===orig){
                    $(this).text(name);
                }
            });
        },

        //Gets the vars from the list
        getVars:function(){
            var scope = "Event";
            var vars = {};
            //Get the current event's vars
            $("#variables-cont").children(".var-button").each(function(idx,itm){
                var name = $(itm).children(".var-name").val();
                if(!name) name = $(itm).children(".var-name").text();
                var val = parseInt($(itm).children(".var-value").val());
                if(isNaN(val)) val = $(itm).children(".var-value").val();
                vars[name] = val;
            });
            if(!Object.keys(vars).length){
                scope = "Scene";
                vars = this.p.sceneVars;
                if(!vars.length){
                    scope = "Global";
                    vars = this.p.globalVars;
                }
            }
            return {scope:scope,vars:vars};
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
    

    //When a page button is clicked from the scene
    $(document).on("click",".page-button",function(e){
        $(".page.selected").children("input").trigger("focusout");
        var id = $(this).parent().attr("id");
        if($(".page.selected").attr("id")===id){
            if($(this).parent().attr("id")==="start") return;
            var input = $("<input class='list-item' value='"+id+"'>");
            $(this).replaceWith(input);
            $(input).on("focusout",function(){ 
                if($(this).val()!==id){
                    var oldID = $(this).parent().attr("id");
                    $(this).parent().attr("id",$(this).val());
                    
                    FileSaver.getPage(oldID).name = $(this).parent().attr("id");
                }
                $(this).replaceWith("<div class='page-button list-item'>"+$(this).val()+"</div>");
            });
            $(input).focus();
            return;
        }
        FileSaver.savePage($(".page.selected").attr("id"));
        $("#onload-cont").empty();
        $("#choices-cont").empty();
        $("#modules-cont").empty();
        var name = $(this).parent().attr("id");
        DC.selectPage(name);
    });
    //Start editor-content buttons
    $("#add-var").click(function(){
        DC.addVar();
    });
    $("#add-page").click(function(){
        var newPage = {
            name: "Page "+uniquePages,
            music: $("#music-select").children(".music-select").val(),
            bg:$("#bg-select").children(".bg-select").val(),
            text: "",
            choices: [],
            onload: [],
            modules: []
        };
        FileSaver.event.pages.push(newPage);
        DC.addPage($("#pages-cont"),newPage.name);
    });

    $("#add-new-onload-group").click(function(){
        uic.createCondEffectsGroup($("#onload-cont"));
    });
    $("#add-new-choice").click(function(){
        uic.createChoiceGroup($("#choices-cont"));
    });
    $("#add-new-module").click(function(){
        uic.createModuleGroup($("#modules-cont"));
    });
    
    //End editor-content buttons
    $("#pages-cont").disableSelection();
    
    $("#pages-cont").sortable({
        axis: "y",
        start: function(event, ui){
            $(ui.helper).css('width', `${ $(event.target).width() }px`);
         }
    });
    $("#onload-cont").sortable({
        axis: "y",
        start: function(event, ui){
            $(ui.helper).css('width', `${ $(event.target).width() }px`);
         }
    });
    $("#onload-cont").disableSelection();
    
    $("#choices-cont").sortable({
        axis: "y",
        start: function(event, ui){
            $(ui.helper).css('width', `${ $(event.target).width() }px`);
         }
    });
    $("#choices-cont").disableSelection();
    
    $("#modules-cont").sortable({
        axis: "y",
        start: function(event, ui){
            $(ui.helper).css('width', `${ $(event.target).width() }px`);
         }
    });
    $("#modules-cont").disableSelection();
    DC.init();
};
start();
});