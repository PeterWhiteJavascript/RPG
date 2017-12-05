function UIC(p){
    var uic = this;
    Object.assign(uic,p);
    //When sel1 changes, change the value of sel2 based on the value of sel1. If we need other select's value, that's included in deep array.
    this.linkSelects = function(sel1,sel2,obj,deepArray){
        $(sel1).on("change",function(){
            $(sel2).empty();
            if(deepArray){
                var props = [];
                $(deepArray).each(function(){props.push($(this).val());});
                props.push($(sel1).val());
                $(sel2).append(uic.getOptions(uic.getDeepValue(obj,props.join("&"))));
            } else {
                $(sel2).append(uic.getOptions(obj[$(sel1).val()]));
            }
            $(sel2).trigger("change");
        });
    };
    //When the select's value changes, change the srcObj's src to the value of select.
    this.linkSelectToSrc = function(select,srcObj,path){
        $(select).on("change",function(){
            $(srcObj).attr("src",path+$(select).val());
        });
    };
    //When the valObj's val changes, change some text (valObj is input or textarea and text is a title div or something)
    this.linkValueToText = function(valObj,textObj,limit){
        $(valObj).on("change",function(){
            var text = $(this).val();
            $(textObj).text(text.substring(0,limit || text.length));
        });
    };
    
    this.linkSelectedCharToSelect = function(select){
        Q.stage(0).on("selectedCharacter",function(char){
            if(Q.selectedCharacter){
                Q.selectedCharacter.destroySelectedBox();
            }
            Q.selectedCharacter = char;
            Q.selectedCharacter.createSelectedBox();
            $(select).val(char.p.handle+" "+char.p.uniqueId);
        });
        Q.stage(0).trigger("selectedCharacter",Q.getSpriteByName($(select).val()));
    };
    this.linkSelectedLocToInputs = function(locX,locY){
        Q.stage(0).on("selectedLocation",function(loc){
            if(Q.selectedLocs.length) Q.selectedLocs[0].destroy();
            Q.selectedLocs = [];
            Q.selectedLocs.push(Q.stage(0).insert(new Q.SelectedSquare({loc:loc,num:Q.selectedLocs.length+1})));
            $(locX).val(loc[0]);
            $(locY).val(loc[1]);
        });
        Q.stage(0).trigger("selectedLocation",[$(locX).val(),$(locY).val()]);
    };
    //Get a value deep within an object (a.b.c.d)
    this.getDeepValue = function(obj, path){
        for (var i=0, path=path.split('&'), len=path.length; i<len; i++){
            obj = obj[path[i]];
        };
        return obj;
    };
    
    //Get a string of options that is added to a select
    this.getOptions = function(arr,prop){
        var opts = '';
        //If an object is passed in, we can look at the keys
        if(!$.isArray(arr)) arr = Object.keys(arr);
        arr.forEach(function(itm){
            if(prop){
                opts += '<option value="' + itm[prop] + '">' + itm[prop] + '</option>';
            } else {
                opts += '<option value="'+itm+'">'+itm+'</option>';
            }
        });
        return opts;
    };
    //Select the initial-value property of all selects in a cont
    this.selectInitialValue = function(cont){
        $(cont).children("select").each(function(){
            $(this).val($(this).attr("initial-value"));
        });
    };
    
    this.Input = function(text,val,type,min,max){
        return "<span class='quarter-width'>"+text+"</span><input class='UIC-prop three-quarter-width' value='"+val+"' type='"+type+"' min='"+min+"' max='"+max+"'>";
    };
    this.Checkbox = function(text,val){
        var box = $("<span class='quarter-width'>"+text+"</span><input class='UIC-prop quarter-width' type='checkbox'><div class='half-width'></div>");
        $(box).prop("checked",val);
        return box;
    };
    this.TextArea = function(text,val){
        return "<span class='full-width'>"+text+"</span><textarea class='UIC-prop full-width group-text-area'>"+val+"</textarea>";
    };
    this.Container = function(text,data){
        return "<div class='UIC-prop full-width UIC-container' data="+JSON.stringify(data)+"><span class='full-width'>"+text+"</span></div>";
    };
    this.Select = function(text,opts,value,cl){
        return "<span class='quarter-width'>"+text+"</span><select class='UIC-prop three-quarter-width "+(cl?cl:'')+"' initial-value='"+value+"'>"+this.getOptions(opts)+"</select>";
    };
    
    this.processValue = function(value){
        var val = parseInt(value);
        if(isNaN(val)) val = value;
        if(value == 'true') val = true;
        if(value == 'false') val = false;
        return val;
    };
    this.removeDeepItem = function(){
        $(this).parent().parent().remove();
    };
    this.removeItem = function(){
        $(this).parent().remove();
    };
    this.getGroupItem = function(funcs,funcProps,func,props,includeX){
        var group = $("<div class='UIC-group-item'></div>");
        var cont = $("<div class='UIC-group-item-top'></div>");
        cont.append("<div><span>Func</span></div><div class='UIC-func-cont'><select class='UIC-func' initial-value='"+func+"'>"+uic.getOptions(funcs)+"</select></div>");
        if(includeX){
            cont.append("<div class='remove-choice-deep tenth-width'><span>x</span></div>");
            cont.children(".remove-choice-deep").click(uic.removeDeepItem);
            $(cont).children("div").first().addClass("quarter-width");
            $(cont).children("div:nth-child(2)").addClass("sixty-five-width");
        } else {
            $(cont).children("div").first().addClass("quarter-width");
            $(cont).children("div:nth-child(2)").addClass("three-quarter-width");
        }
        group.append(cont);
        group.append(uic[funcProps](func,props));
        $(group).children(".UIC-group-item-top").children("div").children(".UIC-func").change(function(){
            $(this).parent().parent().parent().children(".UIC-group-item-props").remove();
            $(this).parent().parent().parent().append(uic[funcProps]($(this).val()));
        });
        this.selectInitialValue(cont.children(".UIC-func-cont"));
        return group;
    };
    this.minimizeScript = function(){
        var text = $(this).text();
        if(text==="-"){
            $(this).parent().siblings().hide();
            $(this).children("span").text("+");
        } else {
            $(this).parent().siblings().show();
           $(this).children("span").text("-");
        }
    };
    this.minimizeGroup = function(){
        var text = $(this).children(".UIC-group-minimize").text();
        if(text==="-"){
            $(this).siblings().hide();
            $(this).children(".UIC-group-minimize").text("+");
        } else {
            $(this).siblings().show();
           $(this).children(".UIC-group-minimize").text("-");
        }
    };
    this.minimizeChoice = function(){
        var text = $(this).children(".UIC-group-minimize").text();
        if(text==="-"){
            $(this).parent().siblings().hide();
            $(this).children(".UIC-group-minimize").text("+");
        } else {
            $(this).parent().siblings().show();
           $(this).children(".UIC-group-minimize").text("-");
        }
    };
    this.TopBarItem = function(text){
        return $("<div class='top-bar-itm'><div class='bar-button'>"+text+"</div></div>");
    };
    this.createTopMenu = function(cont){
        var bar = $("<div id='top-bar'></div>");
        var options = Object.keys(this.topBarProps);
        for(var i=0;i<options.length;i++){
            var itm = this.TopBarItem(options[i]);
            bar.append(itm);
            itm.on("click",this.topBarProps[options[i]]);
        }
        cont.append(bar);
    };
    this.createScriptGroup = function(cont, p){
        p = p || [];
        var group = $(
        "<div class='UIC-group'>\n\
            <div class='UIC-script-hud'>\n\
                <div class='UIC-group-minimize'><span>-</span></div>\n\
                <div class='add-new-script-item'>Add Item</div>\n\
                <div class='remove-choice-deep'><span>x</span></div>\n\
            </div>\n\
        </div>");
        $(group).children(".UIC-script-hud").children(".UIC-group-minimize").click(this.minimizeScript);
        $(group).children(".UIC-script-hud").children(".remove-choice-deep").click(this.removeDeepItem);
        function createScriptItem(props){
            var scriptItemsCont = $("<div class='UIC-script-items'></div>");
            var top = $(
            "<div class='UIC-choice-hud'>\n\
                <div class='UIC-choice-title-cont'>\n\
                    <div class='UIC-group-minimize'><span>-</span></div>\n\
                    <div class='UIC-choice-title'><span>"+props[0]+"</span></div>\n\
                </div>\n\
                <div class='remove-choice-deep'><span>x</span></div>\n\
            </div>");
            $(top).children(".UIC-choice-title-cont").click(uic.minimizeChoice);
            $(top).children(".remove-choice-deep").click(uic.removeDeepItem);
            scriptItemsCont.append(top);
            var items = uic.getGroupItem(uic.scriptFuncs,"scriptProps",props[0],props[1],false);
            scriptItemsCont.append(items);
            uic.linkValueToText($(items).children(".UIC-group-item-top").children(".UIC-func-cont").children(".UIC-func"),$(top).children(".UIC-choice-title-cont").children(".UIC-choice-title"),40);
            return scriptItemsCont;
        }
        $(group).children(".UIC-script-hud").children(".add-new-script-item").click(function(){
            $(this).parent().parent().children(".UIC-cont").append(createScriptItem([uic.scriptFuncs[3]]));
        });
        var groupItemsCont = $("<div class='UIC-cont'></div>");
        for(var i=0;i<p.length;i++){
            groupItemsCont.append(createScriptItem(p[i]));
        }
        group.append(groupItemsCont);
        $(groupItemsCont).sortable({
            axis: "y"
        });
        $(groupItemsCont).disableSelection();
        cont.append(group);
    };
    this.createChoiceGroup = function(cont,p){
        p = p || ["New Choice",false];
        var func = p[2] || this.choiceFuncs[0];
        var props = p[3] || false;
        var group = $(
        '<div class="UIC-choice UIC-group-cont">\n\
            <div class="UIC-choice-hud">\n\
                <div class="UIC-choice-title-cont">\n\
                    <div class="UIC-group-minimize"><span>-</span></div>\n\
                    <div class="UIC-choice-title"><span>'+p[0].substr(0,40)+'</span></div>\n\
                </div>\n\
                <div class="remove-choice-deep"><span>x</span></div>\n\
            </div>\n\
        </div>');
        $(group).children(".UIC-choice-hud").children(".UIC-choice-title-cont").click(this.minimizeChoice);
        $(group).children(".UIC-choice-hud").children(".remove-choice-deep").click(this.removeDeepItem);
        
        var choiceCont = $("<div class='UIC-cont'></div>");
        var top = $("<div class='UIC-choice-item-top'></div>");
        top.append(this.Input("Text",p[0],"text"));
        top.append(this.Checkbox("Disabled",p[1]));
        choiceCont.append(top);
        choiceCont.append(this.getGroupItem(this.choiceFuncs,"choiceProps",func,props,false));
        this.linkValueToText($(choiceCont).children(".UIC-choice-item-top").children("input")[0],$(group).children(".UIC-choice-hud").children(".UIC-choice-title-cont").children(".UIC-choice-title"),40);
        group.append(choiceCont);
        $(cont).append(group);
    };
    this.createModuleGroup = function(cont,props){
        props = props || ["","",[]];
        var group = $(
        '<div class="UIC-group">\n\
            <div class="UIC-choice-hud">\n\
                <div class="UIC-choice-title-cont">\n\
                    <div class="UIC-group-minimize"><span>-</span></div>\n\
                    <div class="UIC-choice-title"><span>'+props[0].substr(0,40)+'</span></div>\n\
                </div>\n\
                <div class="remove-choice-deep"><span>x</span></div>\n\
            </div>\n\
            <div class="UIC-text-handle">'+this.Input("Handle",props[0])+'</div>\n\
            <div class="UIC-text">'+this.TextArea("",props[1])+'</div>\n\
            <div class="UIC-copy-to-clipboard">Copy to Clipboard</div>\n\
            <div class="UIC-hud">\n\
                <div class="minimize-choice"><span>-</span></div>\n\
                <div class="add-new-text"><span>Add Text</span></div>\n\
                <div class="remove-choice-deep"><span>x</span></div>\n\
            </div>\n\
            <div class="UIC-text-groups">\n\
            </div>\n\
        </div>');
        cont.append(group);
        $(group).children(".UIC-choice-hud").children(".UIC-choice-title-cont").click(this.minimizeChoice);
        $(group).children(".UIC-choice-hud").children(".remove-choice-deep").click(this.removeDeepItem);
        $(group).children(".UIC-copy-to-clipboard").click(function(){
            //https://stackoverflow.com/questions/36233134/how-to-create-copy-to-clipboard-button-in-html-javascript
            var aux = document.createElement("input");
            aux.setAttribute("value","{"+$(group).children(".UIC-text-handle").children("input").val()+"}");
            document.body.appendChild(aux);
            aux.select();
            document.execCommand("copy");
            document.body.removeChild(aux);
        });
        uic.linkValueToText($(group).children(".UIC-text-handle").children("input"),$(group).children(".UIC-choice-hud").children(".UIC-choice-title-cont").children(".UIC-choice-title"),40);
        function createModularTextItem(props){
            props = props || ["",false];
            var cont = $("<div class='UIC-modular-texts'></div>");
            cont.append(
            '<div class="UIC-hud">\n\
                <div class="minimize-choice"><span>-</span></div>\n\
                <div class="add-new-module-cond"><span>Add Cond</span></div>\n\
                <div class="remove-choice-deep"><span>x</span></div>\n\
            </div>\n\
            <div class="UIC-conditions">\n\
                <div class="UIC-group-hud">\n\
                    <div class="UIC-group-minimize"><span>-</span></div>\n\
                    <div class="UIC-title"><span>Conditions</span></div>\n\
                </div>\n\
                <div class="UIC-cont"></div>\n\
            </div>\n\
            <div class="UIC-modular-text">'+uic.TextArea("Text",props[0])+'</div>');
            $(cont).children(".UIC-conditions").children(".UIC-group-hud").click(uic.minimizeGroup);
            
            $(cont).children(".UIC-hud").children(".minimize-choice").click(function(){
                var text = $(this).text();
                if(text==="-"){
                    $(this).parent().siblings().hide();
                    $(this).text("+");
                } else {
                    $(this).parent().siblings().show();
                    $(this).text("-");
                }
            });
            $(cont).children(".UIC-hud").children(".add-new-module-cond").click(function(){
                $(this).parent().siblings(".UIC-conditions").children(".UIC-cont").append(uic.getGroupItem(uic.condsFuncs,"condProps",uic.condsFuncs[0],false,true));
            });
            $(cont).children(".UIC-hud").children(".remove-choice-deep").click(function(){
                $(this).parent().siblings(".UIC-conditions").children(".UIC-cont").empty();
            });
            for(var i=0;i<props[1].length;i++){
                $(cont).children(".UIC-conditions").children(".UIC-cont").append(uic.getGroupItem(uic.condsFuncs,"condProps",uic.condsFuncs[0],props[i],true));
            }
            return cont;
        };
        $(group).children(".UIC-hud").children(".add-new-text").click(function(){
            $(this).parent().siblings(".UIC-text-groups").append(createModularTextItem());
        });
        $(group).children(".UIC-hud").children(".minimize-choice").click(function(){
            var text = $(this).text();
            if(text==="-"){
                $(this).parent().siblings(".UIC-text-groups").hide();
                $(this).text("+");
            } else {
                $(this).parent().siblings(".UIC-text-groups").show();
                $(this).text("-");
            }
        });
        $(group).children(".UIC-hud").children(".remove-choice-deep").click(function(){
            $(this).parent().siblings(".UIC-text-groups").empty();
        });
        for(var i=0;i<props[2].length;i++){
            $(group).children(".UIC-text-groups").append(createModularTextItem(props[2][i]));
        }
    };
    this.createCondEffectsGroup = function(cont,props){
        props = props || {conds:[],effects:[]};
        var group = $(
        '<div class="UIC-group">\n\
            <div class="UIC-hud">\n\
                <div class="minimize-choice"><span>-</span></div>\n\
                <div class="add-new-condition"><span>Add Condition</span></div>\n\
                <div class="add-new-effect"><span>Add Effect</span></div>\n\
                <div class="remove-choice-deep"><span>x</span></div>\n\
            </div>\n\
            <div class="UIC-conds-req UIC-group-item">'+this.Select("Conds Req",["All","Some","One"],"All")+'</div>\n\
            <div class="UIC-conditions UIC-group-cont">\n\
                <div class="UIC-group-hud">\n\
                    <div class="UIC-group-minimize"><span>-</span></div>\n\
                    <div class="UIC-title"><span>Conditions</span></div>\n\
                </div>\n\
                <div class="UIC-cont"></div>\n\
            </div>\n\
            <div class="UIC-effects UIC-group-cont">\n\
                <div class="UIC-group-hud">\n\
                    <div class="UIC-group-minimize"><span>-</span></div>\n\
                    <div class="UIC-title"><span>Effects</span></div>\n\
                </div>\n\
                <div class="UIC-cont"></div>\n\
            </div>\n\
        </div>');
        cont.append(group);
        $(group).children(".UIC-hud").children(".add-new-condition").click(function(){
            $(this).parent().siblings(".UIC-conditions").children(".UIC-cont").append(uic.getGroupItem(uic.condsFuncs,"condProps",uic.condsFuncs[0],false,true));
        });
        $(group).children(".UIC-hud").children(".add-new-effect").click(function(){
            $(this).parent().siblings(".UIC-effects").children(".UIC-cont").append(uic.getGroupItem(uic.effectsFuncs,"effectProps",uic.effectsFuncs[0],false,true));
        });
        $(group).children(".UIC-hud").children(".minimize-choice").click(function(){
            var text = $(this).text();
            if(text==="-"){
                $(this).parent().siblings().hide();
                $(this).text("+");
            } else {
                $(this).parent().siblings().show();
                $(this).text("-");
            }
        });
        $(group).children(".UIC-hud").children(".remove-choice-deep").click(this.removeDeepItem);
        $(group).children(".UIC-group-cont").children(".UIC-group-hud").click(this.minimizeGroup);
        
        for(var i=0;i<props.conds.length;i++){
            $(group).children(".UIC-hud").siblings(".UIC-conditions").children(".UIC-cont").append(uic.getGroupItem(uic.condsFuncs,"condProps",props.conds[i][0],props.conds[i][1],true));
        }
        for(var i=0;i<props.effects.length;i++){
            $(group).children(".UIC-hud").siblings(".UIC-effects").children(".UIC-cont").append(uic.getGroupItem(uic.effectsFuncs,"effectProps",props.effects[i][0],props.effects[i][1],true));
        }
    };
    this.getGroupValues = function(group){
        var itms = [];
        group.each(function(){
            var func = $(this).children(".UIC-group-item-top").children(".UIC-func-cont").children(".UIC-func").val();
            var props = [];
            $(this).children(".UIC-group-item-props").children(".UIC-prop").each(function(){
                if($(this).is("div")){
                    props.push(JSON.parse($(this).attr("data")));
                }
                else if($(this).attr("type")==="checkbox"){
                    props.push($(this).prop("checked"));
                } 
                else {
                    props.push(uic.processValue($(this).val()));
                }
            });
            itms.push([func,props]);
        });
        return itms;
    };
    this.getSaveChoices = function(cont){
        var choices = [];
        $(cont).children(".UIC-choice").each(function(){
            var values = uic.getGroupValues($(this).children(".UIC-cont").children(".UIC-group-item"))[0];
            choices.push([
                $(this).children(".UIC-cont").children(".UIC-choice-item-top").children(".UIC-prop").first().val(),
                $(this).children(".UIC-cont").children(".UIC-choice-item-top").children(".UIC-prop").last().is(":checked"),
                values[0],
                values[1]
            ]);
        });
        return choices;
    };
    this.getSaveModules = function(cont){
        var modules = [];
        $(cont).children(".UIC-group").each(function(){
            var groups = [];
            $(this).children(".UIC-text-groups").children(".UIC-modular-texts").each(function(){
                groups.push([$(this).children(".UIC-modular-text").children("textarea").val(),uic.getGroupValues($(this).children(".UIC-conditions").children(".UIC-cont").children(".UIC-group-item"))]);
            });
            modules.push({
                handle:$(this).children(".UIC-text-handle").children("input").val(),
                text:$(this).children(".UIC-text").children("textarea").val(),
                groups:groups
            });
        });
        return modules;
    };
    this.getSaveGroups = function(cont){
        var groups = [];
        $(cont).children(".UIC-group").each(function(){
            groups.push({
                req:$(this).children(".UIC-conds-req").children(".UIC-prop").val(),
                conds:uic.getGroupValues($(this).children(".UIC-conditions").children(".UIC-cont").children(".UIC-group-item")),
                effects:uic.getGroupValues($(this).children(".UIC-effects").children(".UIC-cont").children(".UIC-group-item"))
            });
        });
        return groups;
    };
    this.getSaveScript = function(cont){
        var script = [];
        $(cont).children(".UIC-group").each(function(){
            script.push(uic.getGroupValues($(this).children(".UIC-cont").children(".UIC-script-items").children(".UIC-group-item")));
        });
        return script;
    };
    this.getSaveReferences = function(data){
        var eventRefs = [];
        var sceneVarRefs = [];
        var globalVarRefs = [];
        for(var i=0;i<data.length;i++){
            var func = data[i][0];
            var props = data[i][1];
            switch(func){
                case "checkVar":
                case "setVar":
                    switch(props[0]){
                        case "Scene":
                            sceneVarRefs.push(props);
                            break;
                        case "Global":
                            globalVarRefs.push(props);
                            break;
                    }
                    break;
                case "changeEvent":
                    eventRefs.push(props);
                    break;
            }
        }
        return {eventRefs:eventRefs,sceneVarRefs:sceneVarRefs,globalVarRefs:globalVarRefs};
    };
};
