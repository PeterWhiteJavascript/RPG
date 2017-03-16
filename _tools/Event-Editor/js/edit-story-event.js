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
                this.addPage(p.name,p.music,p.bg,p.text,p.choices,p.onload);
            }
            //Create a page if there is not one
            if(!pages.length) this.addPage("Page "+DC.p.uniquePages,$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),"",[],[]);
            this.selectPage(0);
        },
        //Store properties here that track the current page, choice, etc...
        //Also store list parent objects
        p:{
            scenes:JSON.parse($("#scenes").attr("value")),
            
            varsCont:$("#editor-variables").children("ul").first(),
            pagesCont:$("#editor-pages").children("ul").first(),
            musicSelect:$("#music-select").children("select").first(),
            musicPreview:$("#music-preview"),
            
            bgSelect:$("#bg-select").children("select").first(),
            bgPreview:("#bg-preview"),
            descText:$("#text-select").children("textarea").first(),
            onloadCont:$("#onload").children("ul").first(),
            choicesCont:$("#choices").children("ul").first(),
            
            uniquePages:1,
            globalVars:JSON.parse($("#global-vars").attr("value")),
            sceneVars:JSON.parse($("#scene-vars").attr("value"))
                    
        },
        //Adds a var to the list
        addVar:function(name,val,fromSave){
            if(fromSave){
                $(this.p.varsCont).append("<li class='vr'><a class='remove-choice'><div class='btn btn-default'>x</div></a><div class='var-button menu-button'><div class='var-name'>"+name+"</div><textarea class='var-value'>"+(val?val:0)+"</textarea></div></li>");
            } else {
                $(this.p.varsCont).append("<li class='vr'><a class='remove-choice'><div class='btn btn-default'>x</div></a><div class='var-button menu-button'><input class='var-name' value='"+name+"'><textarea class='var-value'>"+(val?val:0)+"</textarea></div></li>");
            }
        },
        //Changes the value of a vr
        editVar:function(vr,val){
            this.vars[vr] = val;
        },
        //Adds a page to the list
        addPage:function(name,music,bg,text,choices,onload){
            $(this.p.pagesCont).append("<li class='page' music='"+(music)+"' bg='"+(bg)+"' text='"+text.replace(/'/g, "&#39;")+"' choices='"+JSON.stringify(choices).replace(/'/g, "&#39;")+"' onload='"+JSON.stringify(onload).replace(/'/g, "&#39;")+"'><div class='page-button menu-button btn btn-default'>"+name+"</div></li>");
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
            this.addPage($(page).text()+" Copy "+DC.p.uniquePages,$(page).attr("music"),$(page).attr("bg"),$(page).attr("text"),JSON.parse($(page).attr("choices")),JSON.parse($(page).attr("onload")));
        },
        savePage:function(){
            var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
            page.attr("text",$(this.p.descText).val());
            page.attr("music",$(this.p.musicSelect).val());
            page.attr("bg",$(this.p.bgSelect).val());
            var choices = [];
            $(".choice-li").each(function(index,item){
                choices.push({
                    displayText:$(item).children("div").children(".display-text").val(),
                    desc:$(item).children("div").children(".desc-text").val(),
                    page:$(item).children("div").children(".pages-to").val(),
                    disabled:$(item).children("div").children(".disable").text(),
                    groups:DC.getSaveChoices(item)
                });
            });
            page.attr("choices",JSON.stringify(choices));
            page.attr("onload",JSON.stringify(this.getSaveChoices($(".onload-li"))));
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
            $(this.p.onloadCont).children(".onload-li").children(".cond-group").remove();
            $(this.p.choicesCont).empty();
            
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
               this.addOnloadGroup($(this.p.onloadCont).children(".onload-li").last(),onload[i]); 
            }
            var choices = JSON.parse($(page).attr("choices"));
            for(var i=0;i<choices.length;i++){
                var ch = choices[i];
                this.addChoice(ch.displayText.replace("%20"," "),ch.desc.replace("%20"," "),ch.page.replace("%20"," "),ch.disabled,ch.groups);
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
                    <a class="remove-choice"><div class="btn btn-default">x</div></a>\n\
                    <div><p class="editor-descriptor">Display Text: </p><input class="display-text" value="'+text+'"></div>\n\
                    <div><p class="editor-descriptor">Enabled: </p><div class="btn btn-default disable">'+disabled+'</div></div>\n\
                    <div><p class="editor-descriptor">On selected text displayed: </p><textarea class="desc-text">'+desc+'</textarea></div>\n\
                    <div><p class="editor-descriptor">To Page: </p><select class="pages-to" initial-value="'+page+'">'+this.pageOptions()+'</select></div>\n\
                    <p class="editor-descriptor">Condition/Effect Groups: </p>\n\
                    <a class="add-new-group"><div class="btn btn-default">Add Group</div></a>\n\
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
                    <a class="add-new-condition"><div class="btn btn-default">Add Condition</div></a>\n\
                    <a class="add-new-effect"><div class="btn btn-default">Add Effect</div></a>\n\
                    <a class="remove-choice"><div class="btn btn-default">x</div></a>\n\
                    <div class="conditions">\n\
                        <p class="editor-descriptor">Conditions: </p>\n\
                    </div>\n\
                    <div class="effects">\n\
                        <p class="editor-descriptor">Effects: </p>\n\
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
            return '<div class="condition"><a class="remove-choice"><div class="btn btn-default">x</div></a>Select a condition<select class="conditions-select" initial-value="'+cond+'">'+this.conditionsOptions()+'</select><br><br><div class="cond-props"></div></div>';
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
                    var scope = 'Select a scope<select class="cond-prop scope" initial-value="'+props.scope+'">'+this.scopeOptions()+'</select><br>';
                    var vr = 'Select a variable<select class="cond-prop vr" initial-value="'+props.vr+'">'+this.varOptions(props.scope)+'</select><br>';
                    var vl = 'Check if var is:<br><input class="cond-prop vl" value="'+props.vl+'">';
                    content = scope+vr+vl;
                    break;
            }
            return content;
        },
        getEffectChoices:function(effect){
            return '<div class="effect"><a class="remove-choice"><div class="btn btn-default">x</div></a>Select an effect<select class="effects-select" initial-value="'+effect+'">'+this.effectsOptions()+'</select><br><br><div class="effect-props"></div></div>';
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
                    var scope = 'Select a scope<select class="effect-prop scope" initial-value="'+props.scope+'">'+this.scopeOptions()+'</select><br>';
                    var vr = 'Select a variable<select class="effect-prop vr" initial-value="'+props.vr+'">'+this.varOptions(props.scope)+'</select><br>';
                    var vl = 'Set the variable to:<br><input class="effect-prop vl" value="'+props.vl+'">';
                    content = scope+vr+vl;
                    break;
                case "changePage":
                    if(!props){props = {};
                        var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
                        props.page = $(page).text();
                        props.desc = "";
                    }
                    var page = 'Select a page<select class="effect-prop page" initial-value="'+props.page+'">'+this.pageOptions()+'</select><br>';
                    var desc = 'Description<textarea class="effect-prop desc">'+props.desc+'</textarea>';
                    content = page+desc;
                    break;
                case "enableChoice":
                    if(!props){props = {};
                        var page = $(this.p.pagesCont).children(".page:eq("+this.p.selectedPage+")");
                        var choice = JSON.parse($(page).attr("choices"))[0];
                        if(choice) props.choice = choice.displayText;
                        
                    }
                    var choice = 'Enable a choice on this page<select class="effect-prop choice" initial-value="'+props.choice+'">'+this.choiceOptions()+'</select>'; 
                    content = choice;
                    break;
                case "changeEvent":
                    if(!props){props = {};
                        props.scene = Object.keys(this.p.scenes)[0];
                        props.event = this.p.scenes[props.scene][0];
                    }
                    var scene = 'Select a scene<select class="effect-prop scene" initial-value="'+props.scene+'">'+this.sceneOptions()+'</select><br>'; 
                    var event = 'Select an event<select class="effect-prop event" initial-value="'+props.event+'">'+this.eventOptions(props.scene)+'</select>';
                    content = scene+event;
                    break;
            }
            return content;
        },
        
        addOnloadGroup:function(to,group){
            $(to).append('\n\
                <div class="cond-group">\n\
                    <a class="add-new-condition"><div class="btn btn-default">Add Condition</div></a>\n\
                    <a class="add-new-effect"><div class="btn btn-default">Add Effect</div></a>\n\
                    <a class="remove-choice"><div class="btn btn-default">x</div></a>\n\
                    <div class="conditions">\n\
                        <p class="editor-descriptor">Conditions: </p>\n\
                    </div>\n\
                    <div class="effects">\n\
                        <p class="editor-descriptor">Effects: </p>\n\
                    </div>\n\
                </div>\n\
            ');
            for(var k=0;k<group.conds.length;k++){
                $(this.p.onloadCont).children(".onload-li").last().children(".cond-group").last().children(".conditions").last().append(this.getCondChoices(group.conds[k][0]));
                $(this.p.onloadCont).children(".onload-li").last().children(".cond-group").last().children(".conditions").last().children(".condition").last().children(".cond-props").last().append(this.getCond(group.conds[k]));
            }
            for(var k=0;k<group.effects.length;k++){
                $(this.p.onloadCont).children(".onload-li").last().children(".cond-group").last().children(".effects").last().append(this.getEffectChoices(group.effects[k][0]));
                $(this.p.onloadCont).children(".onload-li").last().children(".cond-group").last().children(".effects").children(".effect").last().children(".effect-props").last().append(this.getEffect(group.effects[k]));
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
                    onload:JSON.parse($(itm).attr("onload"))
                });
            });
            var json = JSON.stringify(pages).trim().replace(/ /g, '%20');
            form.append("<input type='text' name='pages' value="+json+">");
            form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
            form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
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
            var conds = ["checkVar"];
            conds.forEach(function(c){
                opts+='<option value="'+c+'">'+c+'</option>';
            });
            return opts;
        },
        effectsOptions:function(){
            var opts = '';
            var effects = ["setVar","changePage","enableChoice","changeEvent"];
            effects.forEach(function(e){
                opts+='<option value="'+e+'">'+e+'</option>';
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
            return opts;
        },
        eventOptions:function(scene){
            var opts = '';
            var events = this.p.scenes[scene];
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
        DC.addPage("Page "+DC.p.uniquePages,$(DC.p.musicSelect).val(),$(DC.p.bgSelect).val(),"",[],[]);
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
            $("body").append(form);
            form.submit();
        }
    });
    //End editor-content buttons
    
    $(document).on("click",".add-new-group",function(){
        var cl = $(this).parent().attr("class");
        if(cl==="choice-li"){
            DC.addChoiceGroup($(this).parent(),{conds:[],effects:[]});
        } else {
            DC.addOnloadGroup($(this).parent(),{conds:[],effects:[]});
        }
    });
    $(document).on("click",".add-new-condition",function(){
        $(this).parent().children(".conditions").append(DC.getCondChoices());
        $(this).parent().children(".conditions").last().children(".condition").last().children(".conditions-select").trigger("change");
    });
    $(document).on("click",".add-new-effect",function(){
        $(this).parent().children(".effects").append(DC.getEffectChoices());
        $(this).parent().children(".effects").last().children(".effect").last().children(".effects-select").last().trigger("change");
    });
    
    //Removes the parent element
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
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
});

