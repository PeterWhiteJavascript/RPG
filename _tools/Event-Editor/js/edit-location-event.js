$(function(){
var numOfFiles = 1 + dataFiles.length;
var GDATA = {};

var setJSONData = function(url,name){
    $.getJSON(url)
        .done(function(data){
            GDATA[name] = data;
            numOfFiles--;
            if(numOfFiles<=0){
                start();
            }
        }
    );
};
//Set the event
setJSONData("../../data/json/story/events/"+sceneType+"/"+sceneName+"/"+eventName+".json","event");

$.getJSON("../../data/json/story/global-vars.json",function(data){
    GDATA["global-vars.json"] = data;
    //Set all of the data files
    dataFiles.forEach( function(f){ setJSONData("../../data/json/data/"+f,f); });
});
//Start the action after all data is loaded.
var start = function(){
    var DC = {
        p:{
            varsCont:$("#editor-variables"),
            actionsCont:$("#editor-actions").children("ul").first(),
            modulesCont:$("#modules").children("ul").first(),
            musicSelect:$("#music-select").children("select").first(),
            musicPreview:$("#music-preview"),
            
            bgSelect:$("#bg-select").children("select").first(),
            bgPreview:("#bg-preview"),
            descText:$("#text-select").children("textarea").first(),
            onloadCont:$("#onload"),
            choicesCont:$("#choices").children("ul").first(),
            
            uniqueActions:1,
            
            scopes:["Event","Scene","Global"],
            equipmentTypes:["Weapons","Shields","Armour","Footwear","Accessories","Consumables"],
            keywords:["partySize","rosterSize"],
            actionFuncs:["changeEvent","changePage","createRecruitMenu","displayBuyItemsList","displaySellItemsList","createGatherInfoMenu","createHuntMenu"],
            conditionsFuncs:["checkChar","checkVar","checkKeyword"],
            effectsFuncs:["setVar","changePage","changeEvent","addToRoster","enableChoice"]
        },
        init:function(){
            this.p.scenes = GDATA['scenes-list.json'];
            this.p.events = this.getEventsList(this.p.scenes);
            this.p.globalVars = GDATA['global-vars.json'].vrs;
            this.p.sceneVars = this.getSceneVars(this.p.scenes,sceneName,sceneType);
            this.p.characters = GDATA['officers.json'];
            this.p.equipment = GDATA['equipment.json'];
            this.p.items = GDATA['items.json'];
            this.p.charGen = GDATA['character-generation.json'];
            this.p.allCharacters = JSON.parse($("#all-characters").text());
            var event = GDATA.event;
            var vrs = event.vrs;
            //Create the vrs
            var keys = Object.keys(vrs);
            for(var i=0;i<keys.length;i++){
                this.addVar(keys[i],vrs[keys[i]],true);
            }
            var pageList = event.pageList;
            if(pageList.length){
                this.addAction(pageList[0],event.music,event.bg,event.actions,event.onload,event.disabledChoices);
                //Create the actions
                for(var i=1;i<pageList.length;i++){
                    var p = event[pageList[i]];
                    this.addAction(pageList[i],p.music,p.bg,p.actions,p.onload,p.disabledChoices);
                }
            } else {
                this.addAction("start",$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),{},{},[]);
            }
            this.selectAction(0);
            
        },
        getSelectedAction:function(){
            return $(this.p.actionsCont).children("ul li:eq("+this.p.selectedAction+")");
        },
        addChoice:function(displayText,func,props,disabled){
            $(this.p.choicesCont).append(
                '<li class="choice-li">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="display-text-descriptor editor-descriptor thirty-height light-blue-gradient">'+displayText.substring(0,20)+'</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <input class="display-text full-line" value="'+displayText+'">\n\
                    <select class="actions-select full-line" initial-value="'+func+'">'+this.getOptString(this.p.actionFuncs)+'</select>\n\
                    <div class="btn btn-quarter full-line disable">'+(disabled?"Disabled":"Enabled")+'</div>\n\
                    <div class="effect-props">\n\
                        '+this.getEffect([func,props])+'\n\
                    </div>\n\
                    \n\
                </li>'
            );
            
        },
        //Adds a var to the list
        addVar:function(name,val,fromSave){
            if(fromSave){
                $(this.p.varsCont).append("<div class='var-button menu-button'><div class='btn btn-group center var-remove remove-choice'>x</div><div class='var-name'>"+name+"</div><textarea class='var-value'>"+(val?val:0)+"</textarea></div>");
            } else {
                $(this.p.varsCont).append("<div class='var-button menu-button'><div class='btn btn-group center var-remove remove-choice'>x</div><input class='var-name' value='"+name+"'><textarea class='var-value'>"+(val?val:0)+"</textarea></div>");
            }
        },
        
        getSceneVars:function(scenes,scene,type){
            if(type==="Flavour") return {};
            return scenes[type].filter(function(s){return s.name===scene;})[0].vrs;
        },
        getEventsList:function(data){
            var list = {};
            for(var i=0;i<this.p.scenes.Story.length;i++){
                var sc = this.p.scenes.Story[i];
                list[sc.name] = sc.events.map(function(s){return s.name;});
            }
            return list;
        },
        //Changes the value of a vr
        editVar:function(vr,val){
            this.vars[vr] = val;
        },
        //Adds a action to the list
        addAction:function(name,music,bg,actions,onload,disabled){
            $(this.p.actionsCont).append("<li class='action' music='"+(music)+"' bg='"+(bg)+"' actions='"+JSON.stringify(actions).replace(/'/g, "&#39;")+"' onload='"+JSON.stringify(onload).replace(/'/g, "&#39;")+"' disabledChoices='"+JSON.stringify(disabled)+"'><div class='action-button menu-button btn btn-default'>"+name+"</div></li>");
            this.p.uniqueActions++;
        },
        
        
        finishEditPageName:function(){
            var spObj = DC.getSelectedAction();
            var name = $(spObj).find(':first-child').val();
            var orig = $(spObj).find(':first-child').attr("origValue");
            if(!name.length){
                name = orig;
            }
            $(spObj).find(':first-child').remove();
            $(spObj).append('<div class="action-button menu-button btn btn-default selected-color">'+name+'</div>');
            $(".actions-to option").each(function(){
                if($(this).text()===orig){
                    $(this).text(name);
                }
            });
        },
        getSaveProps:function(itm){
            var p = {};
            $(itm).children(".effect-props").children(".effect-prop").each(function(i,o){
                var val;
                //We're creating an array
                if($(o).children(".effect-prop-arr").length){
                    val = [];
                    $(o).children(".effect-prop-arr").each(function(j,k){
                        var itm = [];
                        $(k).children(".arr-prop").each(function(a,b){
                            itm.push($(b).val());
                        });
                        val.push(itm);
                    });
                } else {
                    val = parseInt($(o).val());
                    if(isNaN(val)) val = encodeURIComponent($(o).val());
                    if(!val) val = $(o).text();
                    if(!val) val = 0;
                }
                p[$(o).attr("class").split(" ")[1]] = val;
            });
            var props = {
                displayText:$(itm).children(".display-text").val(),
                func:$(itm).children(".actions-select").val(),
                props:p
            };
            return props;
        },
        //Gets all of the filled out data from the choices li or onload li
        getSaveChoices:function(cont){
            var groups = $(cont).children(".cond-group");
            var save = [];
            for(var i=0;i<groups.length;i++){
                var gr = {conds:[],effects:[]};
                var group = groups[i];
                $(group).children(".conditions").children(".condition").each(function(idx,itm){
                    var props = {};
                    $(itm).children(".cond-props").children(".cond-prop").each(function(i,o){
                        var val = parseInt($(o).val());
                        if(isNaN(val)) val = $(o).val();
                        props[$(o).attr("class").split(" ")[1]] = val;
                    });
                    gr.conds.push([$(itm).children(".conditions-select").val(),props]);
                });
                $(group).children(".effects").children(".effect").each(function(idx,itm){
                    var props = {};
                    $(itm).children(".effect-props").children(".effect-prop").each(function(i,o){
                        var val = parseInt($(o).val());
                        if(isNaN(val)) val = encodeURIComponent($(o).val());
                        if(!val&&val!==0) val = $(o).text();
                        if(!val&&val!==0) val = 0;
                        props[$(o).attr("class").split(" ")[1]] = val;
                    });
                    gr.effects.push([$(itm).children(".effects-select").val(),props]);
                });
                save.push(gr);
            }
            return save;
        },
        selectAction:function(num){
            //Remove the border from all action buttons
            $(".action-button").removeClass("selected-color");
            this.p.selectedAction = num;
            //Add the red border to the action
            $(this.p.actionsCont).children(".action:eq("+num+")").children(".action-button").addClass("selected-color");
            //Remove onload and choices
            $(this.p.onloadCont).children(".cond-group").remove();
            $(this.p.choicesCont).empty();
            //Remove modules
            $(this.p.modulesCont).empty();
            
            //Display the action with all values filled out with this action's props
            this.displayAction();
        },
        displayAction:function(){
            var action = $(this.p.actionsCont).children(".action:eq("+this.p.selectedAction+")");
            $(this.p.musicSelect).val($(action).attr("music"));
            $(this.p.bgSelect).val($(action).attr("bg"));
            //Show all of the onload groups
            var onload = JSON.parse($(action).attr("onload"));
            for(var i=0;i<onload.length;i++){
               this.addOnloadGroup($(this.p.onloadCont),onload[i]); 
            }
            var actions = JSON.parse($(action).attr("actions"));
            var disable = JSON.parse($(action).attr("disabledChoices"));
            for(var i=0;i<actions.length;i++){
                var ch = actions[i];
                this.addChoice(ch[0].replace("%20"," "),ch[1].replace("%20"," "),ch[2],disable.indexOf(i)>=0?true:false);
            }
            //Set all of the initial values of the selects
            $("select[initial-value]").each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
            });
        },
        addOnloadGroup:function(to,group){
            $(to).append('\n\
                <div class="cond-group">\n\
                    <div class="cond-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <div class="btn btn-group add-new-condition">Add Condition</div>\n\
                        <div class="btn btn-group add-new-effect">Add Effect</div>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <div class="conditions">\n\
                        <p class="editor-descriptor-title medium-gradient">Conditions</p>\n\
                    </div>\n\
                    <div class="effects">\n\
                        <p class="editor-descriptor-title medium-gradient">Effects</p>\n\
                    </div>\n\
                </div>\n\
            ');
            for(var k=0;k<group.conds.length;k++){
                $(this.p.onloadCont).children(".cond-group").last().children(".conditions").last().append(this.getCondChoices(group.conds[k][0]));
                $(this.p.onloadCont).children(".cond-group").last().children(".conditions").last().children(".condition").last().children(".cond-props").last().append(this.getCond(group.conds[k]));
            }
            for(var k=0;k<group.effects.length;k++){
                $(this.p.onloadCont).children(".cond-group").last().children(".effects").last().append(this.getEffectChoices(group.effects[k][0]));
                $(this.p.onloadCont).children(".cond-group").last().children(".effects").children(".effect").last().children(".effect-props").last().append(this.getEffect(group.effects[k]));
            }
        },
        
        getCharCondOptions:function(condType,type){
            var options = '';
            switch(condType){
                case "Personality":
                    this.p.charGen.personalityNames.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Character Class":
                    this.p.charGen.classNames.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Value":
                    this.p.charGen.values.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Methodology":
                    this.p.charGen.methodologies.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Nationality":
                    this.p.charGen.nationalities.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Loyalty":
                    ["Traitorous","Disloyal","Average","Loyal","Admiring","Idolizing"].forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Morale":
                    ["Quit","Unhappy","Content","Inspired","Ecstatic"].forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Gender":
                    this.p.charGen.genders.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Stat":
                    ["maxHp","painTolerance","damageReduction","physicalResistance","mentalResistance","magicalResistance","atkRange","maxAtkDmg","minAtkDmg","maxSecondaryDmg","minSecondaryDmg","maxTp","encumbranceThreshold","totalWeight","encumbrancePenalty","defensiveAbility","atkAccuracy","critChance","counterChance","atkSpeed","moveSpeed"].forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
            }
            return {options:options,type:type};
        },
        moduleAddNewCond:function(cont,p,type,val){
            var condType = p?p:$(cont).parent().children(".check-types").val();
            var obj = this.getCharCondOptions(condType,type);
            var options = obj.options;
            type = obj.type;
            var value = val?val:1;
            $(cont).append('\n\
                <div class="module-cond">\n\
                    <select class="module-cond-select" initial-value="'+type+'">'+options+'</select>\n\
                    <input type="number" value='+value+' class="module-cond-value">\n\
                    <div class="btn btn-group center thirty-height remove-choice">x</div>\n\
                </div>\n\
            ');
            $(cont).children(".module-cond").last().children(".module-cond-select").each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
                $(this).val(val);
            });
        },
        convertModuleType:function(t){
            switch(t){
                case "Personality":
                    return "p";
                case "Character Class":
                    return "c";
                case "Value":
                    return "v";
                case "Methodology":
                    return "t";
                case "Nationality":
                    return "n";
                case "Loyalty":
                    return "l";
                case "Morale":
                    return "m";
                case "Gender":
                    return "g";
            }
        },
        //Display the select that allows the user to select a condition
        getCondChoices:function(cond){
            return '<div class="condition"><p class="editor-descriptor-half light-gradient">Condition</p><select class="conditions-select inline-select" initial-value="'+cond+'">'+this.getOptString(this.p.conditionsFuncs)+'</select><div class="btn btn-group center remove-choice thirty-height">x</div><div class="cond-props"></div></div>';
        },
        //Creates a choice condition
        getCond:function(cond){
            var content;
            var props = cond[1];
            switch(cond[0]){
                case "checkVar":
                    if(!props){props = {};
                        var varProps = this.getVars();
                        props.scope = varProps.scope;
                        props.operator = "=";
                        var firstVar = Object.keys(varProps.vars)[0];
                        props.vr = firstVar;
                        props.vl = varProps.vars[firstVar];
                    }
                    var scope = '<p class="editor-descriptor-half light-gradient">Scope</p><select class="cond-prop scope inline-select" initial-value="'+props.scope+'">'+this.getOptString(this.p.scopes)+'</select>';
                    var vr = '<p class="editor-descriptor-half light-gradient">Variable</p><select class="cond-prop vr inline-select" initial-value="'+props.vr+'">'+this.varOptions(props.scope)+'</select>';
                    var operator = '<p class="editor-descriptor-half light-gradient unique-stat-fields">Operator</p><select class="cond-prop operator inline-select unique-stat-fields" initial-value="'+props.operator+'"><option value="==">==</option><option value="<"><</option><option value=">">></option><option value="<="><=</option><option value=">=">>=</option></select>';
                    var vl = '<p class="editor-descriptor light-gradient">Variable Value</p><input class="cond-prop vl full-line" value="'+props.vl+'">';
                    content = scope+vr+operator+vl;
                    break;
                case "checkChar":
                    if(!props){props = {};
                        props.char = "Current";
                        props.propType = "Personality";
                        props.prop = "Sensitive";
                    }
                    var chars = '<p class="editor-descriptor-half light-gradient">Character</p><select class="cond-prop char inline-select" initial-value="'+props.char+'">'+this.getOptString(["Current"].concat(Object.keys(this.p.characters)))+'</select>';
                    var charTypes = '<p class="editor-descriptor-half light-gradient">Type</p><select class="cond-prop propType check-char-types inline-select" initial-value='+props.propType+'><option value="Personality">Personality</option><option value="Character Class">Character Class</option><option value="Value">Value</option><option value="Methodology">Methodology</option><option value="Nationality">Nationality</option><option value="Loyalty">Loyalty</option><option value="Morale">Morale</option><option value="Gender">Gender</option><option>Stat</option></select>';
                    var charProps = '<p class="editor-descriptor-half light-gradient">Prop</p><select class="cond-prop prop inline-select" initial-value="'+props.prop+'">'+this.getCharCondOptions(props.propType,props.prop).options+'</select>';
                    content = chars+charTypes+charProps;
                    if(props.propType==="Stat"){
                        var operator = '<p class="editor-descriptor-half light-gradient unique-stat-fields">Operator</p><select class="cond-prop operator inline-select unique-stat-fields" value="'+props.operator+'"><option>==</option><option><</option><option>></option><option><=</option><option>>=</option></select>';
                        var val = '<p class="editor-descriptor light-gradient unique-stat-fields">Value</p><input class="cond-prop value thirty-height unique-stat-fields" type="number" value="'+props.value+'">';
                        content+=operator;
                        content+=val;
                    }
                    break;
                case "checkKeyword":
                    if(!props){props = {};
                        props.operator = "=";
                        var firstVar = this.p.keywords[0];
                        props.vr = firstVar;
                        props.vl = 0;
                    }
                    var vr = '<p class="editor-descriptor-half light-gradient">Variable</p><select class="cond-prop vr inline-select" initial-value="'+props.vr+'">'+this.getOptString(this.p.keywords)+'</select>';
                    var operator = '<p class="editor-descriptor-half light-gradient unique-stat-fields">Operator</p><select class="cond-prop operator inline-select unique-stat-fields" initial-value="'+props.operator+'"><option value="==">==</option><option value="<"><</option><option value=">">></option><option value="<="><=</option><option value=">=">>=</option></select>';
                    var vl = '<p class="editor-descriptor light-gradient">Variable Value</p><input class="cond-prop vl full-line" value="'+props.vl+'">';
                    content = vr+operator+vl;
                    break;
            }
            return content;
        },
        getEffectChoices:function(effect){
            return '<div class="effect"><p class="editor-descriptor-half light-gradient">Effect</p><select class="effects-select inline-select" initial-value="'+effect+'">'+this.getOptString(this.p.effectsFuncs)+'</select><div class="btn btn-group center remove-choice thirty-height">x</div><div class="effect-props"></div></div>';
        },
        //Creates an effect
        getEffect:function(effect){
            var content = '';
            var props = effect[1];
            switch(effect[0]){
                case "setVar":
                    if(!props){props = {};
                        var varProps = this.getVars();
                        props.scope = varProps.scope;
                        var firstVar = Object.keys(varProps.vars)[0];
                        props.vr = firstVar;
                        props.operator = "=";
                        props.vl = varProps.vars[firstVar];
                    }
                    content = this.setUpEffectProp("select","Scope","scope",{opts:this.getOptString(this.p.scopes),scope:props.scope});
                    content += this.setUpEffectProp("select","Variable","vr",{opts:this.varOptions(props.scope),vr:props.vr});
                    content += this.setUpEffectProp("select","Operator","operator",{opts:["=","+","-"],operator:props.operator});
                    content += this.setUpEffectProp("input","Amount","vl",{vl:props.vl});
                    break;
                case "changePage":
                    if(!props){props = {};
                        var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedAction+")");
                        props.page = $(page).text();
                        props.desc = "";
                    }
                    content = this.setUpEffectProp("select","Select a Page","page",{opts:this.pageOptions(),page:props.page});
                    break;
                case "changeEvent":
                    if(!props){props = {};
                        props.type = "Story";
                        props.scene = sceneName;
                        props.event = this.p.events[props.scene][0];
                    }
                    content = this.setUpEffectProp("select","Select a Type","type",{opts:this.getOptString(Object.keys(this.p.scenes)),type:props.type});
                    content += this.setUpEffectProp("select","Select a Scene","scene",{opts:this.getOptString(this.p.scenes[props.type],"name"),scene:props.scene});
                    content += this.setUpEffectProp("select","Select an Event","event",{opts:this.getOptString(this.p.events[props.scene]),event:props.event});
                    break;
                case "addToRoster":
                    if(!props){props = {};
                        props.file = Object.keys(this.p.allCharacters)[0];
                        props.group = Object.keys(this.p.allCharacters[props.file])[0];
                        props.handle = Object.keys(this.p.allCharacters[props.file][props.group])[0];
                    }
                    props.group = decodeURIComponent(props.group);
                    content = this.setUpEffectProp("select","Select a File","file",{opts:this.getOptString(Object.keys(this.p.allCharacters)),file:props.file});
                    content += this.setUpEffectProp("select","Select Group","group",{opts:this.getOptString(Object.keys(this.p.allCharacters[props.file])),group:props.group});
                    content += this.setUpEffectProp("select","Select Handle","handle",{opts:this.getOptString(Object.keys(this.p.allCharacters[props.file][props.group])),handle:props.handle});
                    break;
                case "enableChoice":
                    if(!props){props = {};
                        props.choice = 0;
                    }
                    content = this.setUpEffectProp("select","Enable Choice #","choice",{opts:this.enableChoiceOptions(),choice:props.choice});
                    break;
                case "displayBuyItemsList":
                    if(!props){props = {};
                        props.list = [];
                    }
                    content = "<div class='effect-prop list'><div class='editor-descriptor-title medium-gradient'>Item List</div><div class='btn btn-default add-item-button'>Add Item</div>";
                    content += this.setUpBuyList(props.list);
                    content += "</div>";
                    break;
                case "displaySellItemsList":
                    if(!props){props = {};
                        props.allow = "all";
                    }
                    content = this.setUpEffectProp("select","Sell Type","allow",{opts:'<option value="All">All</option><option value="Weapons">Weapons</option><option value="Consumables">Consumables</option>',allow:props.allow});
                    break;
            }
            return content;
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
        },
        createItemInList:function(item){
            var type = item[0];
            var gear = item[1];
            var content = "";
            switch(type){
                case "Consumables":
                    content = "<div class='buy-item-cont effect-prop-arr'><select class='arr-prop item-type' initial-value='"+type+"'>"+this.getOptString(this.p.equipmentTypes)+"</select><select class='arr-prop item-gear' initial-value='"+gear+"'>'"+this.getOptString(Object.keys(this.p.items))+"'</select><div class='btn btn-group center remove-choice'>x</div></div>";
                    break;
                case "Accessories":
                    content = "<div class='buy-item-cont effect-prop-arr'><select class='arr-prop item-type' initial-value='"+type+"'>"+this.getOptString(this.p.equipmentTypes)+"</select><select class='arr-prop item-gear' initial-value='"+gear+"'>'"+this.getOptString(Object.keys(this.p.equipment[type]))+"'</select><div class='btn btn-group center remove-choice'>x</div></div>";
                    break;
                default:
                    var quality = item[2];
                    var material = item[3];
                    content = "<div class='buy-item-cont effect-prop-arr'><select class='arr-prop item-type' initial-value='"+type+"'>"+this.getOptString(this.p.equipmentTypes)+"</select><select class='arr-prop item-gear' initial-value='"+gear+"'>'"+this.getOptString(Object.keys(this.p.equipment[type]))+"'</select><select class='arr-prop item-quality' initial-value='"+quality+"'>"+this.getOptString(Object.keys(this.p.equipment.Quality))+"</select><select class='arr-prop item-material' initial-value='"+material+"'>'"+this.getOptString(this.p.equipment[type][decodeURIComponent(gear)].materials)+"'</select><div class='btn btn-group center remove-choice'>x</div></div>";
                    break;
            }
            return content;
        },
        setUpBuyList:function(list){
            var opts = "";
            for(var i=0;i<list.length;i++){
                opts += this.createItemInList(list[i]);
            }
            return opts;
        },
        enableChoiceOptions:function(){
            var opts = '';
            var actions = 10;//$(this.p.choicesCont).children(".choice-li").length;
            for(var i=0;i<actions;i++){
                opts+='<option value="'+i+'">'+i+'</option>';
            }
            return opts;
        },
        setUpEffectProp:function(type,descText,key,props){
            var content = '';
            switch(type){
                case "input":
                    content += '<p class="editor-descriptor light-gradient">'+descText+'</p>';
                    content += '<input type="'+props.inputType+'" min="'+props.min+'" value="'+props[key]+'" class="effect-prop '+key+'">';
                    break;
                case "select":
                    content += '<p class="editor-descriptor-half light-gradient">'+descText+'</p>';
                    content += '<select class="effect-prop '+key+' inline-select" initial-value="'+props[key]+'">';
                    if(props.opts){
                        if(typeof props.opts==="string"){
                            content += props.opts;
                        } else {
                            props.opts.forEach(function(o){
                                if(o===props[key]) content+='<option selected>'+o+'</option>';
                                else content += '<option>'+o+'</option>';
                            });
                        }
                    }
                    content += '</select>';
                    break;
                case "toggle":
                    content += '<p class="editor-descriptor-half light-gradient">'+descText+'</p>';
                    content += '<div class="effect-prop '+key+' btn btn-quarter fifty-width '+props.toggleHandle+'">'+props[key]+'</div>';
                    break;
                case "textarea":
                    content += '<p class="editor-descriptor light-gradient">'+descText+'</p>';
                    content += '<textarea class="effect-prop '+key+'">'+props[key]+'</textarea>';
                    break;
            }
            return content;
        },
         //Gets the vars from the list
        getVars:function(){
            var scope = "Event";
            var vars = {};
            //Get the current event's vars
            $(this.p.varsCont).children(".var-button").each(function(idx,itm){
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
        },
        
        changeCharTypeOptions:function(cont){
            $(cont).children(".prop")
                    .find("option")
                    .remove()
                    .end()
                    .append(DC.getCharCondOptions($(cont).children(".propType").val()).options);
            
        },
        pageOptions:function(){
            var opts = '';
            var pages = $(this.p.actionsCont).children(".action");
            $(pages).each(function(idx,itm){
                opts+='<option value="'+$(itm).text()+'">'+$(itm).text()+'</option>';
            });
            return opts;
        },
        varOptions:function(scope){
            var vars;
            switch(scope){
                case "Event":
                    vars = this.getVars().vars;
                    break;
                case "Scene":
                    vars = this.p.sceneVars;
                    break;
                case "Global":
                    vars = this.p.globalVars;
                    vars.money = 0;
                    break;
            }
            var opts = '';
            var keys = Object.keys(vars);
            for(var i=0;i<keys.length;i++){
                opts+='<option value="'+keys[i]+'">'+keys[i]+'</option>';
            }
            return opts;
        },
        saveAction:function(){
            var action = $(this.p.actionsCont).children(".action:eq("+this.p.selectedAction+")");
            action.attr("music",$(this.p.musicSelect).val());
            action.attr("bg",$(this.p.bgSelect).val());
            var choices = [];
            var disable = [];
            $(".choice-li").each(function(index,item){
                var props = DC.getSaveProps(item);
                $(item).children(".disable").text()==="Enabled"?false:disable.push(index);
                choices.push([props.displayText,props.func,props.props]);
            });
            action.attr("disabledChoices",JSON.stringify(disable));
            action.attr("actions",JSON.stringify(choices));
            action.attr("onload",JSON.stringify(DC.getSaveChoices($("#onload"))));
        },
        //Sets all of the actions and vrs for saving
        getSaveData:function(){
            var eventRefs = [];
            var sceneVarRefs = [];
            var globalVarRefs = [];
            function checkReference(opt){
                switch(opt[0]){
                    case "checkVar":
                    case "setVar":
                        if(opt[1].scope==="Scene"){
                            if(sceneVarRefs.indexOf(opt[1].vr)===-1){
                                sceneVarRefs.push(opt[1].vr);
                            }
                        } else if(opt[1].scope==="Global"){
                            if(globalVarRefs.indexOf(opt[1].vr)===-1){
                                globalVarRefs.push(opt[1].vr);
                            }
                        }
                        break;
                    case "changeEvent":
                        if(eventRefs.indexOf(opt[1].event) === -1){
                            eventRefs.push(opt[1].event);
                        }
                        break;
                }
            }
            var data = {};
            //Get all of the variables
            var v = this.getVars();
            if(v.scope==="Event"){
                data.vrs = v.vars;
            }
            data.vrs = data.vrs || {};
            //Get all of the actions
            var actions = [];
            var pageList = ["start"];
            $(this.p.actionsCont).children(".action").each(function(idx,itm){
                var name = $(itm).text()
                var music = $(itm).attr("music");
                var bg = $(itm).attr("bg");
                var actions = JSON.parse($(itm).attr("actions"));
                var onload = JSON.parse($(itm).attr("onload"));
                var disabledChoices = JSON.parse($(itm).attr("disabledChoices"));
                if(idx>0){
                    pageList.push($(itm).text());   
                    actions.push({
                        name:name,
                        music:music,
                        bg:bg,
                        actions:actions,
                        onload:onload,
                        disabledChoices:disabledChoices
                    });
                } else {
                    data.name = name;
                    data.music = music;
                    data.bg = bg;
                    data.actions = actions;
                    data.onload = onload;
                    data.disabledChoices = disabledChoices;
                }
                
                if(sceneType==="Story"){
                    for(var i=0;i<onload.length;i++){
                        for(var j=0;j<onload[i].conds.length;j++){
                            checkReference(onload[i].conds[j]);
                        }
                        for(var j=0;j<onload[i].effects.length;j++){
                            checkReference(onload[i].effects[j]);
                        }
                    }
                    for(var i=0;i<actions.length;i++){
                        checkReference([actions[i][1],actions[i][2]]);
                    }
                }
            });
            data.pageList = pageList;
            data.eventRefs = eventRefs;
            data.sceneVarRefs = sceneVarRefs;
            data.globalVarRefs = globalVarRefs;
            actions.forEach(function(act){
                data[act.name] = act;
                delete(act.name);
            });
            return data;
        }
    };
    DC.init();
    
    
    //BG and Music selects start
    $(document).on("change","#music-select select",function(){
        $(DC.p.musicPreview).attr("src","../../audio/bgm/"+$(this).val());
    });
    $(document).on("change","#bg-select select",function(){
        $(DC.p.bgPreview).attr("src","../../images/"+$(this).val());
    });
    $("#music-select select").trigger("change");
    $("#bg-select select").trigger("change");
    //BG and Music selects end
    
    //Conditions and Effects select start
    $(document).on("change",".conditions-select",function(){
        $(this).parent().children(".cond-props").empty();
        $(this).parent().children(".cond-props").append(DC.getCond([$(this).val(),false]));
    });
    $(document).on("change",".effects-select",function(){
        $(this).parent().children(".effect-props").empty();
        $(this).parent().children(".effect-props").append(DC.getEffect([$(this).val(),false]));
        $(this).parent().children(".effect-props").children("select").each(function(){
            var val = $(this).attr("initial-value");
            $(this).children('option[value="' + val + '"]').prop('selected', true);
            $(this).val(val);
        });
    });
    $(document).on("change",".actions-select",function(){
        $(this).parent().children(".effect-props").empty();
        $(this).parent().children(".effect-props").append(DC.getEffect([$(this).val(),false]));
    });
    
    //Start editor-content buttons
    $("#add-new-variable").click(function(){
        DC.addVar("Var"+$(DC.p.varsCont).children(".var-button").length);
    });
    $("#add-new-action").click(function(){
        DC.saveAction();
        DC.addAction("Action "+DC.p.uniqueActions,$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),{},{},[]);
        DC.selectAction($(DC.p.actionsCont).children(".action").length-1);
    });
    
    $("#remove-action").click(function(){
        DC.removeAction();
    });
    
    $("#copy-action").click(function(){
        DC.copyAction();
    });
    
    $("#add-new-choice").click(function(){
        var action = $(DC.p.actionsCont).children(".action:eq("+DC.p.selectedAction+")");
        DC.addChoice("","",action.name,"Enabled",[]);
    });
    $("#add-new-module").click(function(){
        DC.addModule([{text:""}],"");
    });
    $("#add-new-module-var").click(function(){
        DC.addModuleVar([{text:""}],"");
    });
    $("#save-event").click(function(){
        //Save the current action
        DC.saveAction();
        var data = DC.getSaveData();
        data.name = eventName;
        data.scene = sceneName;
        data.type = sceneType;
        $.ajax({
            type:'POST',
            url:'save-location.php',
            data:data,
            dataType:'json'
        })
        .done(function(data){alert("Saved successfully. Check the console to see the file.");console.log(data)})
        .fail(function(data){console.log(data)});

        
        if(sceneType==="Story"){
            $.ajax({
                type:'POST',
                url:'save-event-references.php',
                data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:eventName,scene:sceneName},
                dataType:'json'
            })
            .done(function(data){console.log(data)})
            .fail(function(data){console.log(data)});
        }
    });
    $("#test-event").click(function(){
        
        //Save the current action
        DC.saveAction();
        var data = DC.getSaveData();
        data.name = eventName;
        data.scene = sceneName;
        data.type = sceneType;
        $.ajax({
            type:'POST',
            url:'save-location.php',
            data:data,
            dataType:'json'
        })
        .done(function(data){console.log(data)})
        .fail(function(data){console.log(data)});

        if(sceneType==="Story"){
            $.ajax({
                type:'POST',
                url:'save-event-references.php',
                data:{eventRefs:data.eventRefs,sceneVarRefs:data.sceneVarRefs,globalVarRefs:data.globalVarRefs,name:eventName,scene:sceneName},
                dataType:'json'
            })
            .done(function(data){console.log(data)})
            .fail(function(data){console.log(data)});
        }
        $.redirect('../../index.php', {'scene':sceneName, 'event':eventName, 'type':sceneType, testing:true});
    });
    
    $("#to-vars").click(function(){
        if(confirm("Are you sure you want to go back without saving?")){
            $.redirect('edit-vars.php', {'scene':sceneName, 'event':eventName, 'type':sceneType});
        }
    });
    
    $('#to-events').click( function(e) {
        if(confirm("Are you sure you want to go back without saving?")){
            var to = "show-events.php";
            if(sceneType==="Flavour"){
                to = "show-flavour.php";
            }
            $.redirect(to, {'scene':sceneName, 'event':eventName, 'type':sceneType});
        }
    });
    //End editor-content buttons
    
    $(document).on("click","#add-new-onload-group",function(){
        DC.addOnloadGroup($(this).parent(),{conds:[],effects:[]});
    });
    $(document).on("click",".add-new-group",function(){
        DC.addChoiceGroup($(this).parent(),{conds:[],effects:[]});
    });
    $(document).on("click",".add-new-condition",function(){
        $(this).parent().parent().children(".conditions").append(DC.getCondChoices());
        $(this).parent().parent().children(".conditions").last().children(".condition").last().children(".conditions-select").trigger("change");
    });
    $(document).on("click",".add-new-effect",function(){
        $(this).parent().parent().children(".effects").append(DC.getEffectChoices());
        $(this).parent().parent().children(".effects").last().children(".effect").last().children(".effects-select").last().trigger("change");
    });
    
    //Removes the parent element
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
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
    });
    
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
        var clickedIdx = $(this).parent().index();
        //If the user clicks the page that is already selected, they are trying to rename it
        if(clickedIdx===DC.p.selectedAction){
            var spObj = DC.getSelectedAction();
            //Don't do this if we're already editing it
            if($(spObj).find(':first-child').is("div")){
                var name = $(spObj).find(':first-child').text();
                $(spObj).find(':first-child').remove();
                $(spObj).append('<input class="rename-page" origValue="'+name+'" value="'+name+'">');
                $(spObj).find(':first-child').select();
                $(spObj).find(':first-child').focusout(DC.finishEditPageName);
                $(spObj).find(':first-child').change(DC.finishEditPageName);
            }
        } 
        //If the user has clicked a different page from the one that was there
        else {
            DC.saveAction();
            var spObj = DC.getSelectedAction();
            $(spObj).find(':first-child').trigger("change");
            DC.selectAction(clickedIdx);
            $("#music-select select").trigger("change");
            $("#bg-select select").trigger("change");
        }
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
    
    
    //Change the type of the check
    $(document).on("change",".check-types",function(e){
        DC.moduleChangeType($(this).parent());
    });
    $(document).on("change",".module-var-scope",function(e){
        DC.moduleVarChangeScope($(this).parent().parent());
    });
    
    //Change the module title
    $(document).on("change",".module-name",function(e){
        $(this).parent().children(".choice-group-top").children(".editor-descriptor").text($(this).val());
    });
    
    $(document).on("change",".display-text",function(e){
        $(this).parent().children(".choice-group-top").children(".editor-descriptor").text($(this).val());
    });
    $(document).on("click",".disable",function(){
        if($(this).text()==="Enabled"){
            $(this).text("Disabled");
        } else {
            $(this).text("Enabled");
        }
    });
    
    
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $( ".sortable" ).disableSelection();
};
});