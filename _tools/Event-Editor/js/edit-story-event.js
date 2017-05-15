$(function(){
    //In charge of dynamic content
    var DC = {
        //Initialize this object with the vrs and pages from the save data. vrs and pages are the only properties that get saved on this page
        init:function(){
            //TO DO: pull the pages and vrs from the html
            var pages = JSON.parse($("#pages-data").text());
            var vrs = JSON.parse($("#variables-data").text());
            //Create the vrs
            var keys = Object.keys(vrs);
            for(var i=0;i<keys.length;i++){
                this.addVar(keys[i],vrs[keys[i]],true);
            }
            //Create the pages
            for(var i=0;i<pages.length;i++){
                var p = pages[i];
                this.addPage(p.name,p.music,p.bg,p.text,p.choices,p.onload,p.modules,p.modulesVars);
            }
            //Create a page if there is not one
            if(!pages.length) this.addPage("Page "+DC.p.uniquePages,$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),"",[],[],{},{});
            this.selectPage(0);
        },
        //Store properties here that track the current page, choice, etc...
        //Also store list parent objects
        p:{
            scenes:JSON.parse($("#scenes").attr("value")),
            
            varsCont:$("#editor-variables").children("ul").first(),
            pagesCont:$("#editor-pages").children("ul").first(),
            modulesCont:$("#modules").children("ul").first(),
            musicSelect:$("#music-select").children("select").first(),
            musicPreview:$("#music-preview"),
            
            bgSelect:$("#bg-select").children("select").first(),
            bgPreview:("#bg-preview"),
            descText:$("#text-select").children("textarea").first(),
            onloadCont:$("#onload"),
            choicesCont:$("#choices").children("ul").first(),
            
            
            uniquePages:1,
            globalVars:JSON.parse($("#global-vars").attr("value")),
            sceneVars:JSON.parse($("#scene-vars").attr("value")),
            
            locationEvents:JSON.parse($("#location-events").attr("value")),
            characters:JSON.parse($("#characters").attr("value"))
                    
        },
        //Adds a var to the list
        addVar:function(name,val,fromSave){
            if(fromSave){
                $(this.p.varsCont).append("<li class='vr'><div class='var-button menu-button'><div class='btn btn-group center var-remove remove-choice'>x</div><div class='var-name'>"+name+"</div><textarea class='var-value'>"+(val?val:0)+"</textarea></div></li>");
            } else {
                $(this.p.varsCont).append("<li class='vr'><div class='var-button menu-button'><div class='btn btn-group center var-remove remove-choice'>x</div><input class='var-name' value='"+name+"'><textarea class='var-value'>"+(val?val:0)+"</textarea></div></li>");
            }
        },
        //Changes the value of a vr
        editVar:function(vr,val){
            this.vars[vr] = val;
        },
        //Adds a page to the list
        addPage:function(name,music,bg,text,choices,onload,modules,modulesVars){
            $(this.p.pagesCont).append("<li class='page' music='"+(music)+"' bg='"+(bg)+"' text='"+text.replace(/'/g, "&#39;")+"' choices='"+JSON.stringify(choices).replace(/'/g, "&#39;")+"' onload='"+JSON.stringify(onload).replace(/'/g, "&#39;")+"' modules='"+JSON.stringify(modules).replace(/'/g, "&#39;")+"' modulesVars='"+JSON.stringify(modulesVars).replace(/'/g, "&#39;")+"'><div class='page-button menu-button btn btn-default'>"+name+"</div></li>");
            this.p.uniquePages++;
        },
        //Removes a page from the list
        removePage:function(){
            if($(this.p.pagesCont).children(".page").length){
                $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")").remove();
                this.selectPage(0);
            }
        },
        //Copies the currently selected page and adds it to the end
        copyPage:function(){
            //Save the current page
            this.savePage();
            //Get the page
            var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
            //Copy the page
            this.addPage($(page).text()+" Copy "+DC.p.uniquePages,$(page).attr("music"),$(page).attr("bg"),$(page).attr("text"),JSON.parse($(page).attr("choices")),JSON.parse($(page).attr("onload")),JSON.parse($(page).attr("modules"),JSON.parse($(page).attr("modulesVars"))));
        },
        savePage:function(){
            var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
            page.attr("text",$(this.p.descText).val());
            page.attr("music",$(this.p.musicSelect).val());
            page.attr("bg",$(this.p.bgSelect).val());
            var choices = [];
            $(".choice-li").each(function(index,item){
                choices.push({
                    displayText:$(item).children(".display-text").val(),
                    desc:$(item).children(".desc-text").val(),
                    page:$(item).children(".pages-to").val(),
                    disabled:$(item).children(".disable").text(),
                    groups:DC.getSaveChoices(item)
                });
            });
            page.attr("choices",JSON.stringify(choices));
            page.attr("onload",JSON.stringify(this.getSaveChoices($("#onload"))));
            var m = this.getSaveModules($(".module-li"));
            page.attr("modules",JSON.stringify(m.modules));
            page.attr("modulesVars",JSON.stringify(m.modulesVars));
        },
        addModule:function(module,name){
            $(this.p.modulesCont).append('\n\
                <li class="module-li" moduleType="modules">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="editor-descriptor thirty-height light-blue-gradient">Handle (For Character)</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <input placeholder="New Module Name" class="module-name full-line" value='+name+'>\n\
                    <p class="editor-descriptor light-gradient">Default Display Text</p>\n\
                    <textarea placeholder="Display Text" class="module-display-text">'+decodeURIComponent(module[0].text)+'</textarea>\n\
                    <div class="btn btn-default module-add-new-text">Add New Text</div>\n\
                </li>\n\
            ');
            for(var j=1;j<module.length;j++){
                this.moduleAddNewText($(this.p.modulesCont).children(".module-li").last(),decodeURIComponent(module[j].text),module[j].checks);
            }
        },
        addModuleVar:function(module,name){
            $(this.p.modulesCont).append('\n\
                <li class="module-li" moduleType="modulesVars">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="editor-descriptor thirty-height light-blue-gradient">Handle (For Variable)</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <input placeholder="New Module Name" class="module-name full-line" value='+name+'>\n\
                    <p class="editor-descriptor light-gradient">Default Display Text</p>\n\
                    <textarea placeholder="Display Text" class="module-display-text">'+decodeURIComponent(module[0].text)+'</textarea>\n\
                    <div class="btn btn-default module-var-add-new-text">Add New Text</div>\n\
                </li>\n\
            ');
            for(var j=1;j<module.length;j++){
                this.moduleVarAddNewText($(this.p.modulesCont).children(".module-li").last(),decodeURIComponent(module[j].text),module[j].checks);
            }
        },
        moduleAddNewText:function(cont,text,checks){
            $(cont).append('\n\
                <div class="text-module">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="editor-descriptor thirty-height light-gradient">Text</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <textarea placeholder="Modular Text" class="module-modular-text">'+text+'</textarea>\n\
                    <div class="half-top">\n\
                        <p class="editor-descriptor-half light-gradient">Checks</p>\n\
                        <div class="btn btn-group module-add-new-check fifty-width">Add New Check</div>\n\
                    </div>\n\
                    <div class="module-checks"></div>\n\
                </div>\n\
            ');
            var keys = Object.keys(checks);
            for(var k=0;k<keys.length;k++){
                DC.moduleAddNewCheck($(cont).children(".text-module").children(".module-checks").last(),checks[keys[k]],keys[k]);
            }
        },
        moduleVarAddNewText:function(cont,text,checks){
            $(cont).append('\n\
                <div class="text-module">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="editor-descriptor thirty-height light-gradient">Text</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <textarea placeholder="Modular Text" class="module-modular-text">'+text+'</textarea>\n\
                    <div class="half-top">\n\
                        <p class="editor-descriptor-half light-gradient">Checks</p>\n\
                        <div class="btn btn-group module-var-add-new-check fifty-width">Add New Check</div>\n\
                    </div>\n\
                    <div class="module-checks"></div>\n\
                </div>\n\
            ');
            for(var k=0;k<checks.length;k++){
                DC.moduleVarAddNewCheck($(cont).children(".text-module").children(".module-checks").last(),checks[k]);
            }
        },
        moduleAddNewCheck:function(cont,check,name){
            var p = "Personality";
            switch(name){
                case "p":
                    p = "Personality";
                    break;
                case "c":
                    p = "Character Class";
                    break;
                case "v":
                    p = "Value";
                    break;
                case "t":
                    p = "Methodology";
                    break;
                case "n":
                    p = "Nationality";
                    break;
                case "l":
                    p = "Loyalty";
                    break;
                case "m":
                    p = "Morale";
                    break;
                case "g":
                    p = "Gender";
                    break;
            }
            $(cont).append('\n\
                <div class="module-check">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="editor-descriptor thirty-height light-gradient">Type</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <select class="check-types inline-select" initial-value="'+p+'"><option>Personality</option><option>Character Class</option><option>Value</option><option>Methodology</option><option>Nationality</option><option>Loyalty</option><option>Morale</option><option>Gender</option></select>\n\
                    <div class="module-conds">\n\
                        <div class="half-top">\n\
                            <p class="editor-descriptor-half light-gradient">Conds</p>\n\
                            <div class="btn btn-group module-add-new-cond fifty-width">Add New Cond</div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            ');
            //If it's a new cond
            if(!name){
                $(cont).children(".module-check").last().children(".check-types").trigger("change");
            }
            $(cont).children(".module-check").last().children(".check-types").each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
                $(this).val(val);
            });
            for(var l=0;l<check.length;l++){
                this.moduleAddNewCond($(cont).children(".module-check").last().children(".module-conds"),p,check[l][0],check[l][1]);
            }
        },
        moduleVarAddNewCheck:function(cont,check){
            var s = check.length?check[0]:"event";
            $(cont).append('\n\
                <div class="module-check">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <select class="module-var-scope inline-select" initial-value="'+s+'"><option>event</option><option>scene</option><option>global</option></select>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <div class="var-props"></div>\n\
                </div>\n\
            ');
            //If it's a new cond
            if(!check.length){
                $(cont).children(".module-check").last().children(".choice-group-top").children(".module-var-scope").trigger("change");
            } else {
                $(cont).children(".module-check").last().children(".var-props").last().append('\n\
                    <select class="name" initial-value="'+check[1]+'">'+DC.varOptions(s)+'</select>\n\
                    <select class="operator" initial-value="'+decodeURIComponent(check[2])+'"><option>==</option><option>!=</option><option>></option><option><</option><option>>=</option><option><=</option></select>\n\
                    <input class="value" initial-value="'+check[3]+'">\n\
                ');
            }
            $(cont).children(".module-check").last().children(".choice-group-top").children(".module-var-scope").each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
                $(this).val(val);
            });
            $(cont).children(".module-check").last().children(".var-props").last().children().each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
                $(this).val(val);
            });
        },
        moduleVarChangeScope:function(cont){
            $(cont).children(".var-props").empty();
            $(cont).children(".var-props").append('\n\
                <select class="name" initial-value="'+Object.keys(DC.getVars($(cont).children(".choice-group-top").children(".module-var-scope").val()).vars)[0]+'">'+DC.varOptions($(cont).children(".choice-group-top").children(".module-var-scope").val())+'</select>\n\
                <select class="operator" initial-value="=="><option>==</option><option>!=</option><option>></option><option><</option><option>>=</option><option><=</option></select>\n\
                <input class="value" initial-value="0">\n\
            ');
        },
        changeCharTypeOptions:function(cont){
            $(cont).children(".prop")
                    .find("option")
                    .remove()
                    .end()
                    .append(DC.getCharCondOptions($(cont).children(".propType").val()).options);
            
        },
        moduleChangeType:function(cont){
            
            $(cont).children(".module-conds").remove();
            $(cont).append('<div class="module-conds"><div class="half-top"><p class="editor-descriptor-half light-gradient">Conds</p><div class="btn btn-group module-add-new-cond fifty-width">Add New Cond</div></div></div>');
            DC.moduleAddNewCond($(cont).children(".module-conds"));
        },
        moduleRemoveConds:function(cont){
            cont.remove();
        },
        getCharCondOptions:function(condType,type){
            var options = '';
            switch(condType){
                case "Personality":
                    JSON.parse($("#char-gen").attr("value")).personalityNames.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Character Class":
                    JSON.parse($("#char-gen").attr("value")).classNames.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Value":
                    JSON.parse($("#char-gen").attr("value")).values.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Methodology":
                    JSON.parse($("#char-gen").attr("value")).methodologies.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Nationality":
                    JSON.parse($("#char-gen").attr("value")).nationalities.forEach(function(prop,i){
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
                    JSON.parse($("#char-gen").attr("value")).genders.forEach(function(prop,i){
                        if(!type&&i===0) type = prop;
                        options+='<option value="'+prop+'">'+prop+'</option>';
                    });
                    break;
                case "Stat":
                    ["accuracy","attackSpeed","criticalChance","defense","encPenalty","encThreshold","hp","maxAtk","maxHp","maxTp","minAtk","move","moveSpeed","painTolerance","range","totalWeight","tp","zoc"].forEach(function(prop,i){
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
        getSaveModules:function(cont){
            if(cont.length){
                var obj = {modules:{},modulesVars:{}};
                $(cont).each(function(idx,itm){
                    var name = $(itm).children(".module-name").val();
                    var type = $(itm).attr("moduleType");
                    obj[type][name] = [{text:$(itm).children(".module-display-text").val().replace(/ /g, '%20')}];
                    if(type==="modules"){
                        $(itm).children(".text-module").each(function(i,mod){
                            obj[type][name].push({
                                text:$(mod).children(".module-modular-text").val().replace(/ /g, '%20'),
                                checks:{}
                            });
                            $(mod).children(".module-checks").children(".module-check").each(function(j,che){
                                var checkType = $(che).children(".check-types").val();
                                checkType = DC.convertModuleType(checkType);
                                obj[type][name][obj[type][name].length-1].checks[checkType] = [];
                                $(che).children(".module-conds").children(".module-cond").each(function(k,con){
                                    obj[type][name][obj[type][name].length-1].checks[checkType].push([$(con).children(".module-cond-select").val(),parseInt($(con).children(".module-cond-value").val())]);
                                });
                            });
                        });
                    } else if(type==="modulesVars"){
                        $(itm).children(".text-module").each(function(i,mod){
                            obj[type][name].push({
                                text:$(mod).children(".module-modular-text").val().replace(/ /g, '%20'),
                                checks:[]
                            });
                            $(mod).children(".module-checks").children(".module-check").each(function(j,che){
                                var scope = $(che).children(".choice-group-top").children(".module-var-scope").val();
                                var varName = $(che).children(".var-props").children(".name").val();
                                var operator = encodeURIComponent($(che).children(".var-props").children(".operator").val());
                                var integer = parseInt($(che).children(".var-props").children(".value").val()); 
                                var value = integer?integer:$(che).children(".var-props").children(".value").val();
                                obj[type][name][obj[type][name].length-1].checks.push([scope,varName,operator,value]);
                            });
                        });
                    }
                });
                return obj;
            } else {
                return {modules:{},modulesVars:{}};
            }
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
                        if(isNaN(val)) val = $(o).val();
                        if(!val) val = $(o).text();
                        if(!val) val = 0;
                        props[$(o).attr("class").split(" ")[1]] = val;
                    });
                    gr.effects.push([$(itm).children(".effects-select").val(),props]);
                });
                save.push(gr);
            }
            return save;
        },
        //The user clicked on a page from the list
        selectPage:function(num){
            //Remove the border from all page buttons
            $(".page-button").removeClass("selected-color");
            this.p.selectedPage = num;
            //Add the red border to the page
            $(this.p.pagesCont).children(".page:eq("+num+")").children(".page-button").addClass("selected-color");
            //Remove onload and choices
            $(this.p.onloadCont).children(".cond-group").remove();
            $(this.p.choicesCont).empty();
            //Remove modules
            $(this.p.modulesCont).empty();
            
            //Display the page with all values filled out with this page's props
            this.displayPage();
        },
        //Using the page data, fill the edit page menu
        displayPage:function(){
            var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
            $(this.p.musicSelect).val($(page).attr("music"));
            $(this.p.bgSelect).val($(page).attr("bg"));
            $(this.p.descText).val($(page).attr("text"));
            //Show all of the onload groups
            var onload = JSON.parse($(page).attr("onload"));
            for(var i=0;i<onload.length;i++){
               this.addOnloadGroup($(this.p.onloadCont),onload[i]); 
            }
            var choices = JSON.parse($(page).attr("choices"));
            for(var i=0;i<choices.length;i++){
                var ch = choices[i];
                this.addChoice(ch.displayText.replace("%20"," "),ch.desc.replace("%20"," "),ch.page.replace("%20"," "),ch.disabled,ch.groups);
            }
            var modules = JSON.parse($(page).attr("modules"));
            var keys = Object.keys(modules);
            for(var i=0;i<keys.length;i++){
                var mo = modules[keys[i]];
                this.addModule(mo,keys[i]);
            }
            var modulesVars = JSON.parse($(page).attr("modulesVars"));
            var keys = Object.keys(modulesVars);
            for(var i=0;i<keys.length;i++){
                var mo = modulesVars[keys[i]];
                this.addModuleVar(mo,keys[i]);
            }
            //Set all of the initial values of the selects
            $("select[initial-value]").each(function(){
                var val = $(this).attr("initial-value");
                $(this).children('option[value="' + val + '"]').prop('selected', true);
            });
        },
        getSelectedPage:function(){
            return $(this.p.pagesCont).children("ul li:eq("+this.p.selectedPage+")");
        },
        
        //Adds a choice to the page
        addChoice:function(text,desc,page,disabled,groups){
            $(this.p.choicesCont).append(
                '<li class="choice-li">\n\
                    <div class="choice-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <p class="display-text-descriptor editor-descriptor thirty-height light-blue-gradient">Display Text</p>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <input class="display-text full-line" value="'+text+'">\n\
                    <p class="editor-descriptor light-gradient">Feedback</p>\n\
                    <textarea class="desc-text">'+desc+'</textarea>\n\
                    <p class="editor-descriptor-half enable light-gradient">Enable</p>\n\
                    <div class="btn btn-quarter fifty-width disable">'+disabled+'</div>\n\
                    <p class="editor-descriptor-half to-page light-gradient">To Page</p>\n\
                    <select class="pages-to fifty-width" initial-value="'+page+'">'+this.pageOptions()+'</select>\n\
                    <div class="btn btn-default add-new-group">Add Group</div>\n\
                </li>'
            );
            for(var j=0;j<groups.length;j++){
                this.addChoiceGroup($(this.p.choicesCont).children(".choice-li").last(),groups[j]);
            }
        },
        //Adds a group of effect/conditions to the choice
        addChoiceGroup:function(to,group){
            $(to).append('\n\
                <div class="cond-group">\n\
                    <div class="cond-group-top">\n\
                        <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                        <div class="btn btn-group add-new-condition">Add Condition</div>\n\
                        <div class="btn btn-group add-new-effect">Add Effect</div>\n\
                        <div class="btn btn-group center remove-choice-deep thirty-height">x</div>\n\
                    </div>\n\
                    <div class="conditions">\n\
                        <div class="cond-group-top">\n\
                            <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                            <p class="editor-descriptor-title medium-gradient">Conditions</p>\n\
                        </div>\n\
                    </div>\n\
                    <div class="effects">\n\
                        <div class="cond-group-top">\n\
                            <div class="btn btn-group center minimize-choice thirty-height">-</div>\n\
                            <p class="editor-descriptor-title medium-gradient">Effects</p>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            ');
            for(var k=0;k<group.conds.length;k++){
                $(this.p.choicesCont).children(".choice-li").last().children(".cond-group").last().children(".conditions").last().append(this.getCondChoices(group.conds[k][0]));
                $(this.p.choicesCont).children(".choice-li").last().children(".cond-group").last().children(".conditions").last().children(".condition").last().children(".cond-props").last().append(this.getCond(group.conds[k]));
            }
            for(var k=0;k<group.effects.length;k++){
                $(this.p.choicesCont).children(".choice-li").last().children(".cond-group").last().children(".effects").last().append(this.getEffectChoices(group.effects[k][0]));
                $(this.p.choicesCont).children(".choice-li").last().children(".cond-group").last().children(".effects").children(".effect").last().children(".effect-props").last().append(this.getEffect(group.effects[k]));
            }
        },
        //Display the select that allows the user to select a condition
        getCondChoices:function(cond){
            return '<div class="condition"><p class="editor-descriptor-half light-gradient">Condition</p><select class="conditions-select inline-select" initial-value="'+cond+'">'+this.conditionsOptions()+'</select><div class="btn btn-group center remove-choice thirty-height">x</div><div class="cond-props"></div></div>';
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
                        var firstVar = Object.keys(varProps.vars)[0];
                        props.vr = firstVar;
                        props.vl = varProps.vars[firstVar];
                    }
                    var scope = '<p class="editor-descriptor-half light-gradient">Scope</p><select class="cond-prop scope inline-select" initial-value="'+props.scope+'">'+this.scopeOptions()+'</select>';
                    var vr = '<p class="editor-descriptor-half light-gradient">Variable</p><select class="cond-prop vr inline-select" initial-value="'+props.vr+'">'+this.varOptions(props.scope)+'</select>';
                    var vl = '<p class="editor-descriptor light-gradient">Variable Value</p><input class="cond-prop vl full-line" value="'+props.vl+'">';
                    content = scope+vr+vl;
                    break;
                case "checkChar":
                    if(!props){props = {};
                        props.char = "Current";
                        props.propType = "Personality";
                        props.prop = "Sensitive";
                    }
                    var chars = '<p class="editor-descriptor-half light-gradient">Character</p><select class="cond-prop char inline-select" initial-value="'+props.char+'">'+this.charOptions()+'</select>';
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
            }
            return content;
        },
        getEffectChoices:function(effect){
            return '<div class="effect"><p class="editor-descriptor-half light-gradient">Effect</p><select class="effects-select inline-select" initial-value="'+effect+'">'+this.effectsOptions()+'</select><div class="btn btn-group center remove-choice thirty-height">x</div><div class="effect-props"></div></div>';
        },
        //Creates an effect
        getEffect:function(effect){
            var content;
            var props = effect[1];
            switch(effect[0]){
                case "setVar":
                    if(!props){props = {};
                        props.scope = "event";
                        var varProps = this.getVars();
                        props.scope = varProps.scope;
                        var firstVar = Object.keys(varProps.vars)[0];
                        props.vr = firstVar;
                        props.vl = varProps.vars[firstVar];
                    }
                    var scope = '<p class="editor-descriptor-half light-gradient">Scope</p><select class="effect-prop scope inline-select" initial-value="'+props.scope+'">'+this.scopeOptions()+'</select>';
                    var vr = '<p class="editor-descriptor-half light-gradient">Variable</p><select class="effect-prop vr inline-select" initial-value="'+props.vr+'">'+this.varOptions(props.scope)+'</select>';
                    var vl = '<p class="editor-descriptor light-gradient">Set Variable To</p><input class="effect-prop vl full-line" value="'+props.vl+'">';
                    content = scope+vr+vl;
                    break;
                case "changePage":
                    if(!props){props = {};
                        var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
                        props.page = $(page).text();
                        props.desc = "";
                    }
                    var page = '<p class="editor-descriptor-half light-gradient">Select a Page</p><select class="effect-prop page inline-select" initial-value="'+props.page+'">'+this.pageOptions()+'</select>';
                    var desc = '<p class="editor-descriptor light-gradient">Feedback</p><textarea class="effect-prop desc">'+props.desc+'</textarea>';
                    content = page+desc;
                    break;
                case "enableChoice":
                    if(!props){props = {};
                        var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
                        var choice = JSON.parse($(page).attr("choices"))[0];
                        if(choice) props.choice = choice.displayText;
                        props.toggle = "Enabled";
                    }
                    var choice = '<p class="editor-descriptor-half light-gradient">Toggle Choice</p><div class="effect-prop toggle btn btn-quarter fifty-width disable">'+props.toggle+'</div><select class="effect-prop choice inline-select full-line" initial-value="'+props.choice+'">'+this.choiceOptions()+'</select>'; 
                    content = choice;
                    break;
                case "changeEvent":
                    if(!props){props = {};
                        props.scene = Object.keys(this.p.scenes)[0];
                        props.event = this.p.scenes[props.scene][0];
                    }
                    var scene = '<p class="editor-descriptor-half light-gradient">Select a Scene</p><select class="effect-prop scene inline-select" initial-value="'+props.scene+'">'+this.sceneOptions()+'</select>'; 
                    var event = '<p class="editor-descriptor-half light-gradient">Select an Event</p><select class="effect-prop event inline-select" initial-value="'+props.event+'">'+this.eventOptions(props.scene)+'</select>';
                    content = scene+event;
                    break;
                case "recruitChar":
                    var chars = Object.keys(this.p.characters).splice(1,Object.keys(this.p.characters).length);
                    if(!props){props = {};
                        props.name = chars[0];
                    }
                    var char = '<p class="editor-descriptor-half light-gradient">Recruit</p><select class="effect-prop name inline-select" initial-value="'+props.name+'">';
                    chars.forEach(function(c){
                        char+='<option>'+c+'</option>';
                    });
                    char+='</select>';
                    content = char;
                    break;
                case "changeStat":
                    var stats = ["Morale","Pragmatic","Kind","Intuitive","Egoist","Altruist","Nepotist","Money","Reputation-Venoriae","Reputation-Dardoine","Reputation-Aljudramil","Reputation-Talumpatua","Reputation-Nomad","Stability-Venoriae","Stability-Dardoine","Stability-Aljudramil","Stability-Talumpatua","Stability-Nomad"];
                    if(!props){props = {};
                        props.stat = stats[0];
                        props.val = 0;
                    }
                    content = '<p class="editor-descriptor-half light-gradient">Stat</p><select class="effect-prop stat inline-select" initial-value="'+props.stat+'">';
                    stats.forEach(function(s){
                        if(s===props.stat) content+='<option selected>'+s+'</option>';
                        else content+='<option>'+s+'</option>';
                    });
                    content +='</select>';
                    content +='<input type="number" value='+props.val+' class="effect-prop val full-line">';
                    break;
            }
            return content;
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
        //Sets all of the pages and vrs for saving
        setSaveData:function(form){
            //Get all of the variables
            var v = this.getVars();
            var vrs = "{}";
            if(v.scope==="event"){
                vrs = JSON.stringify(v.vars).trim().replace(/ /g, '%20');
            }
            form.append("<input type='text' name='vrs' value="+vrs+">");
            //Get all of the pages
            var pages = [];
            $(this.p.pagesCont).children(".page").each(function(idx,itm){
                pages.push({
                    name:$(itm).text(),
                    music:$(itm).attr("music"),
                    bg:$(itm).attr("bg"),
                    text:$(itm).attr("text"),
                    choices:JSON.parse($(itm).attr("choices")),
                    onload:JSON.parse($(itm).attr("onload")),
                    modules:JSON.parse($(itm).attr("modules")),
                    modulesVars:JSON.parse($(itm).attr("modulesVars"))
                });
            });
            var json = JSON.stringify(pages).trim().replace(/ /g, '%20');
            form.append("<input type='text' name='pages' value="+json+">");
            form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
            form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
            form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
            return form;
        },
        //The user is asked if they would like to go back without saving.
        //If they say yes, the user is taken back to the show-events.php
        goBack:function(){

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
            var scope = "event";
            var vars = {};
            //Get the current event's vars
            $(this.p.varsCont).children(".vr").each(function(idx,itm){
                var name = $(itm).children(".var-button").children(".var-name").val();
                if(!name) name = $(itm).children(".var-button").children(".var-name").text();
                var val = parseInt($(itm).children(".var-button").children(".var-value").val());
                if(isNaN(val)) val = $(itm).children(".var-button").children(".var-value").val();
                vars[name] = val;
            });
            if(!Object.keys(vars).length){
                scope = "scene";
                vars = this.p.sceneVars;
                if(!vars.length){
                    scope = "global";
                    vars = this.p.globalVars;
                }
            }
            return {scope:scope,vars:vars};
        },
        
        //Return options for selects
        conditionsOptions:function(){
            var opts = '';
            var conds = ["checkChar","checkVar"];
            conds.forEach(function(c){
                opts+='<option value="'+c+'">'+c+'</option>';
            });
            return opts;
        },
        effectsOptions:function(){
            var opts = '';
            var effects = ["setVar","changePage","enableChoice","changeEvent","recruitChar","changeStat"];
            effects.forEach(function(e){
                opts+='<option value="'+e+'">'+e+'</option>';
            });
            return opts;
        },
        charOptions:function(){
            var keys = Object.keys(this.p.characters);
            var opts = '<option value="Current">Current</option>';
            keys.forEach(function(key){
                opts+='<option value="'+key+'">'+key+'</option>';
            });
            return opts;
        },
        scopeOptions:function(){
            return '<option value="event">Event</option><option value="scene">Scene</option><option value="global">Global</option>';
        },
        pageOptions:function(){
            var opts = '';
            var pages = $(this.p.pagesCont).children(".page");
            $(pages).each(function(idx,itm){
                opts+='<option value="'+$(itm).text()+'">'+$(itm).text()+'</option>';
            });
            return opts;
        },
        choiceOptions:function(){
            var opts = '';
            var page = $(this.p.pagesCont).children(".page:eq("+DC.p.selectedPage+")");
            var choices = JSON.parse($(page).attr("choices"));
            for(var i=0;i<choices.length;i++){
                opts+='<option value="'+choices[i].displayText+'">'+choices[i].displayText+'</option>';
            }
            return opts;
        },
        varOptions:function(scope){
            var vars;
            switch(scope){
                case "event":
                    vars = this.getVars().vars;
                    break;
                case "scene":
                    vars = this.p.sceneVars;
                    break;
                case "global":
                    vars = this.p.globalVars;
                    break;
            }
            var opts = '';
            var keys = Object.keys(vars);
            for(var i=0;i<keys.length;i++){
                opts+='<option value="'+keys[i]+'">'+keys[i]+'</option>';
            }
            return opts;
        },
        sceneOptions:function(){
            var opts = '';
            var keys = Object.keys(this.p.scenes);
            for(var i=0;i<keys.length;i++){
                opts+='<option value="'+keys[i]+'">'+keys[i]+'</option>';
            }
            opts+='<option value="locations">locations</option>';
            return opts;
        },
        eventOptions:function(scene){
            var opts = '';
            var events;
            if(scene==="locations"){
                events = this.p.locationEvents;
            } else {
                events = this.p.scenes[scene];
            }
            
            for(var i=0;i<events.length;i++){
                opts+='<option value="'+events[i]+'">'+events[i]+'</option>';
            }
            return opts;
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
    });
    //Conditions and Effects select end
    
    $(document).on("click",".disable",function(){
        if($(this).text()==="Enabled"){
            $(this).text("Disabled");
        } else {
            $(this).text("Enabled");
        }
    });
    
    //When a page button is clicked from the scene
    $(document).on("click",".page-button",function(e){
        var clickedIdx = $(this).parent().index();
        //If the user clicks the page that is already selected, they are trying to rename it
        if(clickedIdx===DC.p.selectedPage){
            var spObj = DC.getSelectedPage();
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
            DC.savePage();
            var spObj = DC.getSelectedPage();
            $(spObj).find(':first-child').trigger("change");
            DC.selectPage(clickedIdx);
            $("#music-select select").trigger("change");
            $("#bg-select select").trigger("change");
        }
    });
    
    
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $( ".sortable" ).disableSelection();
    
    //Start editor-content buttons
    $("#add-new-variable").click(function(){
        DC.addVar("Var "+$(DC.p.varsCont).children(".vr").length);
    });
    $("#add-new-page").click(function(){
        DC.savePage();
        DC.addPage("Page "+DC.p.uniquePages,$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),"",[],[],{},{});
        DC.selectPage($(DC.p.pagesCont).children(".page").length-1);
    });
    
    $("#remove-page").click(function(){
        DC.removePage();
    });
    
    $("#copy-page").click(function(){
        DC.copyPage();
    });
    
    $("#add-new-choice").click(function(){
        var page = $(DC.p.pagesCont).children(".page:eq("+DC.p.selectedPage+")");
        DC.addChoice("","",page.name,"Enabled",[]);
    });
    $("#add-new-module").click(function(){
        DC.addModule([{text:""}],"");
    });
    $("#add-new-module-var").click(function(){
        DC.addModuleVar([{text:""}],"");
    });
    $("#save-event").click(function(){
        //Save the current page
        DC.savePage();
        //Create the save form
        var form = $('<form action="save-story-pages.php" method="post"></form>');
        form = DC.setSaveData(form);
        $("body").append(form);
        form.submit();
    });
    $("#test-event").click(function(){
        
        //Save the current page
        DC.savePage();
        //Create the save form
        var form = $('<form action="save-story-pages.php" method="post"></form>');
        form.append('<input type="text" name="testing" value="true">');
        form = DC.setSaveData(form);
        $("body").append(form);
        form.submit();
    });
    
    $('#back').click( function(e) {
        var sure = confirm("Are you sure you want to go back without saving?");
        if(sure){
            var form = $('<form action="show-events.php" method="post"></form>');
            form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
            form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
            form.append('<input type="text" name="type" value="'+$("#scene-type").text()+'">');
            $("body").append(form);
            form.submit();
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
    
    $(document).on("change",".scene",function(){
        $(this).parent().children(".event").empty();
        var scene = $(this).val();
        $(this).parent().children(".event").append(DC.eventOptions(scene));
    });
    
    //Creates a new text inside a module
    $(document).on("click",".module-add-new-text",function(e){
        DC.moduleAddNewText($(this).parent(),"",{});
    });
    $(document).on("click",".module-var-add-new-text",function(e){
        DC.moduleVarAddNewText($(this).parent(),"",{});
    });
    //Adds a new check inside the text module
    $(document).on("click",".module-add-new-check",function(e){
        DC.moduleAddNewCheck($(this).parent().parent().children(".module-checks"),{});
    });
    $(document).on("click",".module-var-add-new-check",function(e){
        DC.moduleVarAddNewCheck($(this).parent().parent().children(".module-checks"),[]);
    });
    //Adds a new cond inside the check
    $(document).on("click",".module-add-new-cond",function(e){
        DC.moduleAddNewCond($(this).parent().parent());
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
    
    $(".module-name").trigger("change");
    $(".display-text").trigger("change");
});

