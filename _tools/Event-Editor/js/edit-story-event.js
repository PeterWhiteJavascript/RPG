$(function(){
    $( ".sortable" ).sortable({
        axis: "y"
    });
    $( ".sortable" ).disableSelection();
    //Store the page that has been clicked on
    var selectedPage;
    //Store the variable that is selected
    var selectedVar;
    //Store the group that is selected
    var selectedGroup;

    var uniqueVars = $("#editor-variables ul li").length;
    //Increment every time a new page is added (so we don't have duplicate page names if a page was deleted)
    var uniquePages = $("#pages ul li").length;
    
    //CONDITIONS AND EFFECTS CODE IS IN ui_objects.js
    //The possible conditions
    var conditions = [
        "checkVar"
    ];
    //The possible effects
    var effects = [
        "setVar",
        "changePage",
        "enableChoice"
    ];
    function appendConditions(to){
        for(var i=0;i<conditions.length;i++){
            $(to).append('<option value="'+conditions[i]+'">'+conditions[i]+'</option>');
        }
    }
    function appendEffects(to){
        for(var i=0;i<effects.length;i++){
            $(to).append('<option value="'+effects[i]+'">'+effects[i]+'</option>');
        }
    }
    //Show all of the types of variables (global, scene, event)
    function appendVarTypes(to){
        var types = ["Event","Scene","Global"];
        for(var i=0;i<types.length;i++){
            $(to).append('<option value="'+types[i]+'">'+types[i]+'</option>');
        }
    };
    function getPageId(page){console.log(page)
        return $(page).attr("class").split(' ')[1];
    }
    //Append all choices on the current page
    function appendPageChoices(to,pageId){console.log(pageId)
        $(".choice-"+pageId).each(function(){
            $(to).append('<option value="'+$(this).children("div").first().children(".display-text").val()+'">'+$(this).children("div").first().children(".display-text").val()+'</option>');
        });
    };
    
    var varFuncs = {
        appendEventVars:function(to){
            var vars = $("#editor-variables .var-name");
            for(var i=0;i<vars.length;i++){
                var name = $(vars[i]).val();
                $(to).append('<option value="'+name+'">'+name+'</option>');
            }
        }
    };
    
    //When editing a name, set to true
    var editingName = false;
    function renamePageOption(from,to){
        $(".pages-to option").each(function(){
            if($(this).text()===from){
                $(this).text(to);
            }
        });
    }
    function appendNewPageOption(){
        $(".pages-to").each(function(){
            var text = $("#pages ul li:nth-child("+($("#pages ul li").length)+") a div").html();
            $(this).append('<option value="'+text+'">'+text+'</option>');
        });
    }
    function appendPagesOptions(to){
        for(var i=1;i<$("#pages ul li").length+1;i++){
            var text = $("#pages ul li:nth-child("+i+") a div").html();
            if($(to).attr("initialValue")===text){
                to.append('<option value="'+text+'" selected>'+text+'</option>');
            } else {
                to.append('<option value="'+text+'">'+text+'</option>');
            }
            
        }
    }
    function getSavableCondition(cond){
        //Get which condition we are checking and find the proper data
        var selectValue = $(cond).children(".conditions-select").val();
        switch(selectValue){
            case "checkVar":
                var cont = $(cond).children(".cond-cont").children("li");
                return [selectValue,{scope:$(cont).children(".cond-var-type").val(),vr:$(cont).children(".cond").children(".cond-vars").val(),vl:$(cont).children(".cond").children(".cond-vals").val()}];
                break;
        }
    }
    function getSavableEffect(eff){
        //Get which condition we are checking and find the proper data
        var selectValue = $(eff).children(".effects-select").val();
        switch(selectValue){
            case "setVar":
                var cont = $(eff).children(".effect-cont").children("li");
                return [selectValue,{scope:$(cont).children(".eff-var-type").val(),vr:$(cont).children(".eff-vars").val(),vl:$(cont).children(".eff-vals").val()}];
                break;
            case "changePage":
                var cont = $(eff).children(".effect-cont").children("li");
                return [selectValue,{page:$(cont).children(".eff-pages").val(),desc:$(cont).children(".effect-page-to-desc").val()}];
                break;
            case "enableChoice":
                var cont = $(eff).children(".effect-cont").children("li");
                return [selectValue,{choice:$(cont).children(".page-choices").val()}];
                break;
        }
    }
    function createSaveForm(){
        $(selectedPage).parent().attr("text",$("#text-select textarea").val()); 
        var form = $('<form action="save-story-pages.php" method="post"></form>');
        form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
        form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
        var ids = [];
        var onloads = [];
        $("#editor-variables ul li").each(function(i,li){
            form.append('<input type="text" name="varnames[]" value="'+$(li).children(".menu-button").children(".var-name").val()+'">');
            form.append('<input type="text" name="varvalues[]" value="'+$(li).children(".menu-button").children(".var-value").val()+'">');
        });
        $("#pages ul li").each(function(i,li){
            form.append('<input type="text" name="pagesid[]" value="'+$(li).attr("id")+'">');
            form.append('<input type="text" name="pagesname[]" value="'+$(li).first().text()+'">');
            form.append('<input type="text" name="music[]" value="'+$(li).attr("music")+'">');
            form.append('<input type="text" name="bg[]" value="'+$(li).attr("bg")+'">');
            form.append('<input type="text" name="text[]" value="'+$(li).attr("text")+'">');
            ids.push($(li).attr("id"));
            //Check if there's an onload
            if($(".onload-"+i)){
                //var json = 
                var groups = [];
                $(".onload-"+i).children(".cond-group").each(function(x,g){
                    groups[x] = {cond:[],effect:[]};
                    //Get conditions
                    $(g).children(".conditions").children(".condition").each(function(){
                        groups[x].cond.push(getSavableCondition(this));
                    });
                    //Get effects
                    $(g).children(".effects").children(".effect").each(function(){
                        groups[x].effect.push(getSavableEffect(this));
                    });
                });
                onloads.push(groups);
            } else{
                onloads.push([]);
            }
        });
        var json = JSON.stringify(onloads, null, 2);
        //Send the choices as a JSON string
        form.append("<input type='text' name='onloads' value='"+json+"'>");
        var choices = {};
        //Loop through each page's id. All pages are looped
        for(var i=0;i<ids.length;i++){
            var id = ids[i];
            choices[id] = [];
            //Loop through the choices in each id
            for(var j=0;j<$(".choice-"+id).length;j++){
                var choice = {};
                choice.displayText = $(".choice-"+id+" .display-text")[j].value;
                choice.desc = $(".choice-"+id+" .desc-text")[j].value;
                choice.page = $(".choice-"+id+" .pages-to")[j].value;
                choice.disabled = $(".choice-"+id+" .disable")[j].innerHTML;
                choice.group = [];
                //Loop through the conditions and effects
                var groups = $(".choice-"+id+":nth-child("+(j+1)+")").children(".cond-group");
                if(groups.length){
                    $(groups).each(function(idx,gr){
                        choice.group[idx] = {cond:[],effect:[]};
                        //Get conditions
                        $(gr).children(".conditions").children(".condition").each(function(){
                            choice.group[idx].cond.push(getSavableCondition(this));
                        });
                        //Get effects
                        $(gr).children(".effects").children(".effect").each(function(){
                            choice.group[idx].effect.push(getSavableEffect(this));
                        });
                    });
                }
                choices[id].push(choice);
            }
        }
        var json = JSON.stringify(choices, null, 2);
        //Send the choices as a JSON string
        form.append("<input type='text' name='choices' value='"+json+"'>");
        return form;
    }
    //START MAIN OPTIONS BUTTONS
    
    $('#add-new-variable').click( function(e) {
        uniqueVars++;
        $("#editor-variables ul").append('<li><div class="menu-button var-button"><input class="var-name" value="Var'+uniqueVars+'" placeholder="varname"><input class="var-value" value="0" placeholder="value"></div></li>');

    });
    
    $('#remove-variable').click( function(e) {
        if(selectedVar){
            if($('#editor-variables ul li').length>1){
                $(selectedVar).parent().remove();
                selectedVar = false;
            }
        }
    });
    
    //Create a new page
    $('#add-new-page').click( function(e) {
        uniquePages++;
        var music = $("#pages ul li:last-child").attr("music")?$("#pages ul li:last-child").attr("music"):$("#music-select option").first().val();
        var bg = $("#pages ul li:last-child").attr("bg")?$("#pages ul li:last-child").attr("bg"):$("#bg-select option").first().val();
        $("#pages ul").append('<li id="'+new Date().getUTCMilliseconds()+'" music="'+music+'" bg="'+bg+'" text=""><a class="scene-button"><div class="menu-button btn btn-default">Page '+uniquePages+'</div></a></li>');
        appendNewPageOption();
        $(".scene-button").last().trigger("click");
    });
    $('#remove-page').click( function(e) {
        if($('#pages ul li').length>1){
            $(selectedPage).parent().remove();
            $(".scene-button").last().trigger("click");
        }
    });
    //Copies the page, but give a new unique id
    $('#copy-page').click( function(e) {
        uniquePages++;
        var id = new Date().getUTCMilliseconds();
        $("#pages ul").append('<li id="'+id+'" music="'+$(selectedPage).parent().attr("music")+'" bg="'+$(selectedPage).parent().attr("bg")+'" text="'+$(selectedPage).parent().attr("text")+'"><a class="scene-button"><div class="menu-button btn btn-default">Page '+uniquePages+'</div></a></li>');
        var clone = $('.choice-'+$(selectedPage).parent().attr("id")).clone();
        clone.attr("class","choice-"+id+" choice-li");
        $("#choices ul").append(clone);
        appendNewPageOption();
        $(".choice-"+$(selectedPage).parent().attr("id")+" select").each(function(i) {
            var select = this;
            $(".choice-"+id).find("select").eq(i).val($(select).val());
        });
        $(".scene-button").last().trigger("click");
    });
    $('#add-new-choice').click( function(e) {
        $("#choices ul").first().append('<li class="choice-'+$(selectedPage).parent().attr("id")+' choice-li"><a class="remove-choice"><div class="btn btn-default">x</div></a><div><p class="editor-descriptor">Display Text: </p><input class="display-text" placeholder="Choice"><div><p class="editor-descriptor">Enabled: </p><div class="btn btn-default disable">Enabled</div></div></div><div><p class="editor-descriptor">On selected text displayed: </p><textarea class="desc-text" placeholder="Desc"></textarea></div><div><p class="editor-descriptor">To Page: </p><select class="pages-to"></select><p class="editor-descriptor">Condition/Effect Groups: </p><a class="add-new-group"><div class="btn btn-default">Add Group</div></a> <a class="add-new-condition"><div class="btn btn-default">Add Condition</div></a> <a class="add-new-effect"><div class="btn btn-default">Add Effect</div></a></li>');
        //Loop through the pages and put them in the select
        appendPagesOptions($(".pages-to").last());
    });
    
    
    $(document).on("click",".add-new-group",function(){
        if($(this).parent().attr("id")==="onload"){
            var pageId = $(selectedPage).parent().attr("id");
            $(this).parent().children("ul").append('<li class="onload-'+pageId+' '+pageId+' onload-li"><a class="remove-choice"><div class="btn btn-default">x</div></a></li>');
            $(this).parent().children("ul").children("li").last().append('<div class="cond-group"><div class="conditions"><p class="editor-descriptor">Conditions: </p></div><div class="effects"><p class="editor-descriptor">Effect: </p></div></div>');
            $(this).parent().children("ul").children("li").last().children(".cond-group").trigger("click");
        } else {
            $(this).parent().append('<div class="cond-group"><a class="remove-choice"><div class="btn btn-default">x</div></a><div class="conditions"><p class="editor-descriptor">Conditions: </p></div><div class="effects"><p class="editor-descriptor">Effect: </p></div></div>');
            $(this).parent().children(".cond-group").last().trigger("click");
        }
    });
    $(document).on("click",".add-new-condition",function(){
        if(selectedGroup){
            $(selectedGroup).children(".conditions").append('<div class="condition"><a class="remove-choice"><div class="btn btn-default">x</div></a><select class="conditions-select"></select></div>');
            appendConditions($(selectedGroup).children(".conditions").children(".condition").children("select").last());
            $(selectedGroup).children(".conditions").children(".condition").children(".conditions-select").last().trigger("change");
        }
    });
    
    $(document).on("click",".add-new-effect",function(){
        if(selectedGroup){
            $(selectedGroup).children(".effects").append('<div class="effect"><a class="remove-choice"><div class="btn btn-default">x</div></a><select class="effects-select"></select></div>');
            appendEffects($(selectedGroup).children(".effects").children(".effect").children("select").last());
            $(selectedGroup).children(".effects").children(".effect").children(".effects-select").last().trigger("change");
        }
    });
    
    //Test the event in the same conditions as in game!
    $('#test-event').click( function(e) {
        var form = createSaveForm();
        form.append('<input type="text" name="testing" value="true">');
        $("body").append(form);
        form.submit();
    });
    
    $('#back').click( function(e) {
        var sure = confirm("Are you sure you want to go back without saving?");
        if(sure){
            var form = $('<form action="create-event.php" method="post"></form>');
            form.append('<input type="text" name="scene" value="'+$("#scene-name").text()+'">');
            form.append('<input type="text" name="name" value="'+$("#editor-title").text()+'">');
            $("body").append(form);
            form.submit();
        }
    });
    $('#save-event').click( function(e) {
        var form = createSaveForm();
        $("body").append(form);
        form.submit();
    });
    //END MAIN OPTIONS BUTTONS
    $(document).on('change', '#music-select select', function() {
        $(selectedPage).parent().attr("music",$(this).val());
        $("audio").first().attr("src","../../audio/bgm/"+$(this).val());
    });
    $(document).on('change', '#bg-select select', function() {
        $(selectedPage).parent().attr("bg",$(this).val());
        $("#bg-preview").attr("src","../../images/"+$(this).val());
    });
    
    $(document).on('change', '.conditions-select', function() {
        $(this).parent().children(".cond-cont").remove();
        var val = $(this).val();
        switch(val){
            case "checkVar":
                $(this).parent().append('<ul class="cond-cont"><li><select class="cond-var-type"></select></li></ul>');
                appendVarTypes($(this).parent().children(".cond-cont").children("li").children(".cond-var-type").last());
                $(this).parent().children(".cond-cont").children("li").children(".cond-var-type").trigger("change");
                break;
        }
    });
    $(document).on('change', '.cond-var-type', function() {
        //Remove whatever vars are there
        $(this).parent().children(".cond").remove();
        var val = $(this).val();
        switch(val){
            case "Event":
                $(this).parent().append('<div class="cond"><select class="cond-vars"></select><input class="cond-vals" placeholder="value"></div>');
                varFuncs.appendEventVars($(this).parent().children(".cond").children(".cond-vars").last());
                break;
            case "Scene":
                //TODO
                break;
            case "Global":
                //TODO
                break;
        }
    });
    
    $(document).on('change', '.effects-select', function() {
        $(this).parent().children(".effect-cont").remove();
        var val = $(this).val();
        switch(val){
            case "setVar":
                $(this).parent().append('<ul class="effect-cont"><li><select class="effect-var-type"></select></li><li><select class="eff-vars"></select><input class="eff-vals"></li></ul>');
                appendVarTypes($(this).parent().children(".effect-cont").children("li").children(".effect-var-type").last());
                varFuncs["appendEventVars"]($(this).parent().children(".effect-cont").children("li").children(".eff-vars").last());
                break;
            case "changePage":
                $(this).parent().append('<ul class="effect-cont"><li><select class="effect-pages"></select></li><li><textarea class="effect-page-to-desc" placeholder="display text"></textarea></li></ul>');
                appendPagesOptions($(this).parent().children(".effect-cont").children("li").children(".effect-pages"));
                break;
            case "enableChoice":
                var id=getPageId($(this).parent().parent().parent().parent());
                $(this).parent().append('<ul class="effect-cont"><li><select class="page-choices '+id+'"></select></li></ul>');
                appendPageChoices($(this).parent().children(".effect-cont").children("li").children(".page-choices"),id);
                break;
        }
    });
    $(document).on('change', '.effect-var-type', function() {
        //Remove whatever vars are there
        $(this).parent().children(".eff").remove();
        var val = $(this).val();
        switch(val){
            case "Event":
                $(this).parent().append('<div class="eff"><select class="eff-vars"></select><input class="eff-vals"></div>');
                varFuncs.appendEventVars($(this).parent().children(".eff").children(".eff-vars").last());
                break;
            case "Scene":
                //TODO
                break;
            case "Global":
                //TODO
                break;
        }
    });
    
    function finishEditPageName(){
        var name = $(selectedPage).find(':first-child').val();
        var orig = $(selectedPage).find(':first-child').attr("origValue");
        if(!name.length){
            name = orig;
        }
        $(selectedPage).find(':first-child').remove();
        $(selectedPage).append('<div class="menu-button btn btn-default active">'+name+'</div>');
        renamePageOption(orig,name);
        editingName=false;
    }
    $(document).on("click",".var-button",function(e){
        $(selectedVar).removeClass("selected-color");
        selectedVar = this;
        $(selectedVar).addClass("selected-color");
    });
    $(document).on("click",".cond-group",function(e){
        $(selectedGroup).removeClass("selected-color");
        selectedGroup = this;
        $(selectedGroup).addClass("selected-color");
    });
    //When an individual page is clicked
    $(document).on("click",".scene-button",function(e){
        //If the user clicks the page that is already selected, they are trying to rename it
        if(this === $(selectedPage).get(0)){
            //Don't do this if we're already editing it
            if($(selectedPage).find(':first-child').is("div")){
                var name = $(selectedPage).find(':first-child').text();
                $(selectedPage).find(':first-child').remove();
                $(selectedPage).append('<input class="rename-page" origValue="'+name+'" value="'+name+'">');
                $(selectedPage).find(':first-child').select();
                $(selectedPage).find(':first-child').focusout(finishEditPageName);
                $(selectedPage).find(':first-child').change(finishEditPageName);
                editingName=true;
            }
        } else {
            //Hide the onloads from the last page
            $(".onload-"+$(selectedPage).parent().attr("id")).hide();
            //Show the onloads for the current page
            $(".onload-"+$(this).parent().attr("id")).show();
            
            //Hide the choices from the last page
            $(".choice-"+$(selectedPage).parent().attr("id")).hide();
            //Show the choices for the current page
            $(".choice-"+$(this).parent().attr("id")).show();
            //Save the text
            $(selectedPage).parent().attr("text",$("#text-select textarea").val()); 
            //Make sure to always finish editing if a new element is selected
            if(editingName){
                finishEditPageName();
            }
            selectedPage = this;
            $(".menu-button.active").removeClass("active");
            $(this).children(":first").addClass('active');
            //Remove description that is there
            $("#text-select textarea").remove();
            $("#music-select select").val($(selectedPage).parent().attr("music"));
            $("#bg-select select").val($(selectedPage).parent().attr("bg"));
            //Show the description for the scene
            var desc = $(this).parent().attr("text");
            $("#text-select").append('<textarea class="desc-text">'+desc+'</textarea>');
            //Change the audio and bg src
            $("audio").first().attr("src","../../audio/bgm/"+$("#music-select select").val());
            $("#bg-preview").attr("src","../../images/"+$("#bg-select select").val());
        }
    });
    $(document).on("click",".remove-choice",function(e){
        $(this).parent().remove();
    });
    $(document).on("click",".disable",function(e){
        if($(this).html()==="Disabled"){
            $(this).html("Enabled");       
        } else {
            $(this).html("Disabled");
        }
    });
    
    $("audio").first().attr("src","../../audio/bgm/"+$("#music-select select").val());
    $("#bg-preview").attr("src","../../images/"+$("#bg-select select").val());
    //Fill the pages-to selects
    $(".pages-to").each(function(){
        appendPagesOptions($(this));
    });
    //Fill the conditions selects
    appendVarTypes($(".cond-var-type"));
    appendConditions($(".conditions-select"));
    varFuncs["appendEventVars"]($(".cond-vars"));
    
    //Fill the effects selects
    appendVarTypes($(".effect-var-type"));
    appendEffects($(".effects-select"));
    varFuncs["appendEventVars"]($(".eff-vars"));
    appendPagesOptions($(".effect-pages"));
    $(".page-choices").each(function(i,page){
        appendPageChoices(page,getPageId(page));
    });
    //Hide all onloads
    $(".onload-li").hide();
    //Hide all choices
    $(".choice-li").hide();
    //If there are no pages, create one
    if($("#pages ul li").length===0){
        $('#add-new-page').trigger("click");
    } else {
        $(".scene-button").first().trigger("click");
        if($(".choice-li").length>0){
            $(".choice-li").first().trigger("click");
        }
    }
    //Set all of the initial values of the selects
    $("select[initialValue]").each(function(){
        var val = $(this).attr("initialValue");
        $(this).children('option[value="' + val + '"]').prop('selected', true);
    });
    
});

