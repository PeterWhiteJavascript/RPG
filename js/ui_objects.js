Quintus.UIObjects=function(Q){
    $(function(){
        //When clicking a choice
        $('body').on('click', '.choice-div', function() {
            Q.storyController.p.choice = Q.storyController.getChoice(Q.storyController.p.pages[Q.storyController.p.pageNum],$(this).text());
            //Check if something happens before doing the default change page
            //Will be true if all conditions are met
            //Loop through each group
            var len = Q.storyController.p.choice.groups.length;
            for(var i=0;i<len;i++){
                if(Q.storyController.checkConds(Q.storyController.p.choice.groups[i].conds)){
                    Q.storyController.executeEffects(Q.storyController.p.choice.groups[i].effects);
                }
            }
            var choice = Q.storyController.p.choice;
            var page = choice.page;
            var desc = choice.desc;
            Q.storyController.insertChoiceDesc(desc);
            setTimeout(function(){
                Q.storyController.changePage(page);
            },desc.length*25);
        });
    });
    Q.component("time",{
        added:function(){
            this.entity.on("cycleWeek",this,"cycleWeek");
        },
        checkWeek:function(week){
            //Check the story events first as they are the most important.
            //Story events (important ones)
            var storyEvents = Q.state.get("storyEvents");
            if(storyEvents[week]){
                return storyEvents[week];
            }
            //Get the list of all events that could be played
            var potentialEvents = Q.state.get("potentialEvents");
            //[char,scene,event]
            var data = potentialEvents[Math.floor(Math.random()*potentialEvents.length)];
            if(data){
                var scene = data[1];
                var event = data[2];
                Q.markEventCompleted(data[0],data[1]);
                var idx = potentialEvents.indexOf(data);
                potentialEvents.splice(idx,1);
                return {scene:scene,event:event,char:data[0]};
            }
            return false;
        },
        cycleWeek:function(){
            Q.state.get("saveData").week++;
            var event = this.checkWeek(Q.state.get("saveData").week);
            if(event){
                //The third prop might include more than one character for some events
                Q.startScene(event.scene,event.event,[event.char]);
                Q.locationController.hideAll();
            }
        }
    });
    //Using CSS/Jquery, create the locations controller
    //This is used when the player goes to a location and selects from different menu options.
    Q.UI.Container.extend("LocationController",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width/2,
                h:Q.height-100
            });
            this.p.x+=10;
            this.p.y+=10;
            this.on("inserted");
            this.add("time");
            
        },
        inserted:function(){
            this.p.menuCont = this.createCont("main-menu");
            this.p.midCont = this.createCont("mid-cont");
            this.p.leftCont = this.createCont("left-cont");
            $(this.p.leftCont).hide();
            this.createMainMenu();
            //this.createRecruitMenu();
        },
        hideAll:function(){
            this.emptyConts();
            $(this.p.menuCont).hide();
            $(this.p.leftCont).hide();
            $(this.p.midCont).hide();
        },
        emptyConts:function(){
            this.p.menuCont.empty();
            this.p.midCont.empty();
            this.p.leftCont.empty();
            this.p.leftCont.hide();
            if(this.p.characterMenu) this.p.characterMenu.destroy();
        },
        createCont:function(cl){
            var cont = $('<div class='+cl+'></div>');
            $(document.body).append(cont);
            return cont;
        },
        createMainMenu:function(){
            this.emptyConts();
            var cont = this.p.menuCont;
            cont.append(
                '<ul id="main-menu-ul">\n\
                    <li id="lc-entourage" class="btn btn-default" func="createEntourageMenu">Entourage</li>\n\
                    <li id="lc-briony" class="btn btn-default" func="createBrionyMenu">Briony</li>\n\
                    <li id="lc-select-action" class="btn btn-default" func="createActionsMenu">Actions</li>\n\
                    <li id="lc-log" class="btn btn-default" func="createLogMenu">Log</li>\n\
                    <li id="lc-options" class="btn btn-default" func="createOptionsMenu">Options</li>\n\
                </ul>'
            );
            $("#main-menu-ul li").click(function(){
                Q.locationController[$(this).attr("func")]();
            });
        },
        createEntourageMenu:function(){
            this.emptyConts();
            var cont = this.p.menuCont;
            cont.append(
                '<ul id="entourage-menu-ul">\n\
                    <li id="en-taskforce" class="btn btn-default" func="createTaskforceMenu">Taskforce</li>\n\
                    <li id="en-cash-bonus" class="btn btn-default" func="createCashBonusMenu">Cash Bonus</li>\n\
                    <li id="en-distribute-gear" class="btn btn-default" func="createDistributeGearMenu">Equip</li>\n\
                    <li id="en-back" class="btn btn-default" func="createMainMenu">Back</li>\n\
                </ul>'
            );
            $("#entourage-menu-ul li").click(function(){
                Q.locationController[$(this).attr("func")]();
            });
            
        },
        createTaskforceMenu:function(){
            
        },
        createCashBonusMenu:function(){
            
        },
        createDistributeGearMenu:function(){
            
        },
        
        createBrionyMenu:function(){
            
        },
        createActionsMenu:function(){
            this.emptyConts();
            var actions = this.p.location.actions;
            var cont = this.p.menuCont;
            cont.append('<ul id="actions-menu-ul"></ul>');
            for(var i=0;i<actions.length;i++){
                $("#actions-menu-ul").append('<li id="ac-'+actions[i]+'" class="btn btn-default" func="create'+actions[i]+'Menu">'+actions[i]+'</li>');
            }
            $("#actions-menu-ul").append('<li id="ac-back" class="btn btn-default" func="createMainMenu">Back</li>');
            $("#actions-menu-ul li").click(function(){
                Q.locationController[$(this).attr("func")]();
            });
        },
        createFundraiseMenu:function(){
            
        },
        createCampaignMenu:function(){
            
        },
        recruitCharacter:function(){
            var money = Q.state.get("saveData").money;
            if(money>=100){
                Q.state.get("saveData").money-=100;
                var character = Q.state.get("saveData").applicationsRoster.filter(function(a){
                    return a.name===$(".character.selected-color").attr("id");
                })[0];
                Q.state.get("allies").push(character);
                Q.state.get("saveData").applicationsRoster.splice(Q.state.get("saveData").applicationsRoster.indexOf(character),1);
                this.createRecruitMenu();
                this.trigger("cycleWeek");
            }
        },
        showRecruitCharacterCard:function(obj,target){
            var pro = Q.textModules.processModule;
            obj.p.midCont.empty();
            obj.p.midCont.append(
                '<ul class="recruit-card mid-box">\n\
                    <div class="char-skills"><b>Skills</b></div>\n\
                    <div class="char-equipment"><b>Equipment</b></div>\n\
                </ul>'
            );
            var skillKeys = Object.keys(target.skills);
            for(var i=0;i<skillKeys.length;i++){
                $(obj.p.midCont).children(".recruit-card").children(".char-skills").append('<div><i>'+skillKeys[i]+'</i></div>');
                for(var j=0;j<target.skills[skillKeys[i]].length;j++){
                    if(target.skills[skillKeys[i]][j]){
                        $(obj.p.midCont).children(".recruit-card").children(".char-skills").append('<div>'+target.skills[skillKeys[i]][j].name+'</div>');
                    }
                }
            }
            var equipmentKeys = Object.keys(target.equipment);
            for(var i=0;i<equipmentKeys.length;i++){
                if(target.equipment[equipmentKeys[i]].name){
                    $(obj.p.midCont).children(".recruit-card").children(".char-equipment").append('<div>'+equipmentKeys[i]+': '+target.equipment[equipmentKeys[i]].name+'</div>');
                } else {
                    $(obj.p.midCont).children(".recruit-card").children(".char-equipment").append('<div>'+equipmentKeys[i]+': none</div>');
                }
            }
        },
        createRecruitMenu:function(){
            this.emptyConts();
            $(this.p.leftCont).show();
            var available = Q.state.get("saveData").applicationsRoster;
            var cont = this.p.leftCont;
            cont.append('<ul id="left-menu-ul"></ul>');
            for(var i=0;i<available.length;i++){
                $("#left-menu-ul").append('<li id="'+available[i].name+'" class="character btn btn-default" func="createCharacterMenu">'+available[i].name+'</li>');
            }
            var t = this;
            $(".character").on("click",function(){
                $('.character').removeClass("selected-color");
                $(this).addClass("selected-color");
                var name = $(this).attr("id");
                var target = Q.state.get("saveData").applicationsRoster.filter(function(a){
                    return a.name===name;
                })[0];
                t.showRecruitCharacterCard(t,target);
            });
            $(".character").first().trigger("click");
            
            this.p.menuCont.append(
                '<ul id="confirm-recruit-menu-ul">\n\
                    <li id="co-recruit" class="btn btn-default" func="recruitCharacter">Recruit</li>\n\
                    <li id="co-back" class="btn btn-default" func="createActionsMenu">Back</li>\n\
                </ul>'
            );
            $("#confirm-recruit-menu-ul li").click(function(){
                Q.locationController[$(this).attr("func")]();
            });
        },
        throwFeast:function(amount,guestOfHonour){
            if(Q.state.get("saveData").money>=amount){
                Q.state.get("saveData").money-=amount;
                var boost = 0;
                switch(amount){
                    case 100:
                        boost = 5;
                        break;
                    case 500:
                        boost = 10;
                        break;
                    case 1500:
                        boost = 15;
                        break;
                }
                Q.state.get("allies").forEach(function(ally){
                    ally.morale+=boost;
                    ally.awards.feasted++;
                });
                guestOfHonour.awards.guestOfHonour++;
                var event = guestOfHonour.checkEvents("feasted");
                if(event) Q.state.get("potentialEvents").push(event);
                this.trigger("cycleWeek");
            }
            this.createMainMenu();
            
        },
        createFeastMenu:function(){
            this.emptyConts();
            this.p.leftCont.show();
            this.p.leftCont.append(
                '<ul>\n\
                    <li class="money btn btn-default" value="100">$100</li>\n\
                    <li class="money btn btn-default" value="500">$500</li>\n\
                    <li class="money btn btn-default" value="1500">$1500</li>\n\
                </ul>'
            );
            $(".money").on("click",function(){
                $('.money').removeClass("selected-color");
                $(this).addClass("selected-color");
                switch($(".money.selected-color").attr("value")){
                    case "100":
                        $(".mid-box").text("Increase morale of entire entourage by 5.");
                        break;
                    case "500":
                        $(".mid-box").text("Increase morale of entire entourage by 10.");
                        break;
                    case "1500":
                        $(".mid-box").text("Increase morale of entire entourage by 15.");
                        break;
                }
                
            });
            this.p.midCont.append(
                '<div class="mid-box"></div>'
            );
            $(".money").first().trigger("click");
            
            this.p.menuCont.append(
                '<ul id="feast-menu">\n\
                    <li id="co-feast" class="btn btn-default" func="confirmAmount">Confirm Amount</li>\n\
                    <li id="co-back" class="btn btn-default" func="createActionsMenu">Back</li>\n\
                </ul>'
            );
            $("#feast-menu li").click(function(){
                Q.locationController[$(this).attr("func")](parseInt($(".money.selected-color").attr("value")));
            });
        },
        confirmAmount:function(money){
            this.emptyConts();
            this.p.leftCont.show();
            var allies = Q.state.get("allies");
            this.p.leftCont.append('<ul></ul>');
            for(var i=1;i<allies.length;i++){
                $(this.p.leftCont).children('ul').first().append('\n\
                    <li class="char btn btn-default" value="'+i+'">'+allies[i].name+'</li>\n\
                ');
            }
            $(".char").on("click",function(){
                $('.char').removeClass("selected-color");
                $(this).addClass("selected-color");
                $(".mid-box").text("Select "+allies[$(this).attr("value")].name+" as the Guest of Honour?");
            });
            this.p.midCont.append(
                '<div class="mid-box"></div>'
            );
            $(".char").first().trigger("click");
            this.p.menuCont.append(
                '<ul id="confirm-feast-amount-menu">\n\
                    <li id="co-feast" class="btn btn-default" func="throwFeast">Throw Feast</li>\n\
                    <li id="co-back" class="btn btn-default" func="createFeastMenu">Back</li>\n\
                </ul>'
            );
            $("#confirm-feast-amount-menu li").click(function(){
                Q.locationController[$(this).attr("func")](money,allies[$(".char.selected-color").attr("value")]);
            });
        },
        createMentorMenu:function(){
            
        },
        createInfirmaryMenu:function(){
            
        },
        createMarketMenu:function(){
            
        },
        createHuntMenu:function(){
            
        },
        
        //Shows all characters and allows displaying their stats
        createLogMenu:function(){
            this.emptyConts();
            var chars = Q.state.get("allies");
            var cont = this.p.menuCont;
            cont.append('<ul id="actions-menu-ul"></ul>');
            for(var i=0;i<chars.length;i++){
                $("#actions-menu-ul").append('<li id="'+chars[i].name+'" class="btn btn-default" func="createCharacterMenu">'+chars[i].name+'</li>');
            }
            $("#actions-menu-ul").append('<li id="ac-back" class="btn btn-default" func="removeCharacterMenu">Back</li>');
            $("#actions-menu-ul li").click(function(){
                $("#actions-menu-ul li").removeClass("selected-color");
                $(this).addClass("selected-color");
                Q.locationController[$(this).attr("func")]($(this).attr("id"));
            });
            $("#actions-menu-ul li").first().trigger("click");
        },
        createCharacterMenu:function(name){
            if(this.p.characterMenu) this.p.characterMenu.destroy();
            var char = Q.state.get("allies").filter(function(obj){
                return name == obj.name;
            })[0];
            this.p.characterMenu = this.stage.insert(new Q.BigStatusBox({target:char}));
        },
        removeCharacterMenu:function(){
            this.p.characterMenu.destroy();
            this.createMainMenu();
        },
        createOptionsMenu:function(){
            
        }
    });
    
    Q.GameObject.extend("TextModules",{
        getObjPathFromString:function(obj,i){
            //If the i needs an index of an array
            var arrProp = i.indexOf("[");
            if(arrProp>=0){
                var i2 = i.slice(0,arrProp);
                var end = i.indexOf("]");
                var num = i.slice(arrProp+1,end);
                return obj[i2][num];
            }
            return obj[i];
        },
        processVarModule:function(prop){
            var module = Q.storyController.p.pages[Q.storyController.p.pageNum].modulesVars[prop];
            var text = module[0].text;
            for(var i=1;i<module.length;i++){
                //Evaluate all of the checks
                var checks = module[i].checks;
                var success = true;
                for(var j=0;j<checks.length;j++){
                    var varValue;
                    switch(checks[j][0]){
                        case "event":
                            varValue = Q.storyController.p.vrs[checks[j][1]];
                            break;
                        case "scene":
                            varValue = Q.state.get("sceneVars")[checks[j][1]];
                            break;
                        case "global":
                            varValue = Q.state.get("globalVars")[checks[j][1]];
                            break;
                    }
                    switch(checks[j][2]){
                        case "==":
                            if(varValue==checks[j][3]) success = true;
                            else success = false;
                            break;
                        case ">":
                            if(varValue>checks[j][3]) success = true;
                            else success = false;
                            break;
                        case "<":
                            if(varValue<checks[j][3]) success = true;
                            else success = false;
                            break;
                        case ">=":
                            if(varValue>=checks[j][3]) success = true;
                            else success = false;
                            break;
                        case "<=":
                            if(varValue<=checks[j][3]) success = true;
                            else success = false;
                            break
                    }
                }
                if(success){
                    text = module[i].text;
                }
            }
            return text;
        },
        processModule:function(char,propAffected,prop){
            var affectedCategory;
            switch(propAffected){
                case "c":
                    affectedCategory = char.charClass;
                    break;
                case "p":
                    affectedCategory = char.personality;
                    break;
                case "t":
                    affectedCategory = char.methodology;
                    break;
                case "v":
                    affectedCategory = char.value;
                    break;
                case "g":
                    affectedCategory = char.gender;
                    break;
            }
            var varText;
            if(prop&&affectedCategory){
                //If the module doesn't exist, use the default
                if(!Q.state.get("modules")[propAffected][affectedCategory]){
                    affectedCategory = "Default";
                }
                varText = prop.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("modules")[propAffected][affectedCategory]);
            } else {
                varText = propAffected.split('.').reduce(Q.textModules.getObjPathFromString,char);
            }
            var newText = Q.textModules.replaceVar(varText,char);
            //If there's more, do it again.
            while(newText.indexOf("{")>=0){
                newText = Q.textModules.replaceVar(newText,char);    
            }
            return newText;
        },
        //Returns the text
        addTextPoints:function(char,texts){
            //Default is 0;
            var idx = 0;
            //The previous max points
            var maxValue = 0;
            //Skip first as it is default
            for(var i=1;i<texts.length;i++){
                var value = 0;
                var checks = texts[i].checks;
                var keys = Object.keys(checks);
                keys.forEach(function(key){
                    switch(key){
                        //Personality
                        case "p":
                            var personality = char.personality;
                            //Loop through this character's personalities
                            personality.forEach(function(per){
                                var found = checks[key].find(function(elm){return elm[0]===per;});
                                if(found){
                                    value+=found[1];
                                }
                            });
                            break;
                        //Character Class
                        case "c":
                            var found = checks[key].find(function(elm){return elm[0]===char.charClass;});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Value
                        case "v":
                            var found = checks[key].find(function(elm){return elm[0]===char.value;});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Methodology
                        case "t":
                            var found = checks[key].find(function(elm){return elm[0]===char.methodology;});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Nationality
                        case "n":
                            var found = checks[key].find(function(elm){return elm[0]===char.nationality;});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Loyalty
                        case "l":
                            var found = checks[key].find(function(elm){return elm[0]===Q.getLoyaltyString(char.loyalty);});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Morale
                        case "m":
                            var found = checks[key].find(function(elm){return elm[0]===Q.getMoraleString(char.morale);});
                            if(found){
                                value+=found[1];
                            }
                            break;
                        //Gender
                        case "g":
                            var found = checks[key].find(function(elm){return elm[0]===char.gender;});
                            if(found){
                                value+=found[1];
                            }
                            break
                    }
                });
                if(value>maxValue){
                    idx = i;
                    maxValue = value;
                }
            }
            return texts[idx].text;
        },
        getModularText:function(char,prop){
            var aff = prop.split('.');
            //Getting a module
            if(aff[0]==="m"){
                aff.shift();
                var texts = Q.storyController.p.pages[Q.storyController.p.pageNum].modules[aff[0]];//aff.reduce(Q.textModules.getObjPathFromString,Q.state.get("modules"));
                return Q.textModules.addTextPoints(char,texts);
            } 
            //Accessing the character's properties directly
            else {
                return prop.split('.').reduce(Q.textModules.getObjPathFromString,char);
            }
        },
        replaceVar:function(text,c){
            return text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                return Q.textModules.processTextVarInstance(p1,c);
            });
        },
        processTextVarInstance:function(text,character){
            var affected = text.slice(0,text.indexOf("@"));
            var aff = affected.split('.');
            var prop = text.slice(text.indexOf("@")+1,text.length);
            var varText = "";
            switch(aff[0]){
                //Event var
                case "e":
                    return Q.storyController.p.vrs[prop];
                //Scene var
                case "s":
                    return Q.state.get("sceneVars")[prop];
                //Global var
                case "g":
                    return Q.state.get("globalVars")[prop];
                //The save data (in the game state)
                case "d":
                    return prop.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("saveData"));
                break;
                case "o":
                    //If it is a module
                    if(aff[1]){
                        var intAffected = parseInt(aff[1]);
                        //We're affecting a passed in character
                        if(intAffected>=0){
                            return Q.textModules.processModule(Q.storyController.p.characters[intAffected],affected,prop);
                        } 
                        //We're affecting a specific officer's modules
                        else {
                            var newText;
                            //If there's a third property
                            if(aff[2]){
                                switch(aff[2]){
                                    case "g":
                                        var gender = Q.state.get("allies").filter(function(char){return char.name===aff[1];})[0].gender;
                                        newText = prop.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("modules").g[gender]);
                                        break;
                                }
                            } else {
                                var char = Q.state.get("allies").filter(function(char){return char.name===aff[1];})[0];
                                newText = Q.textModules.getModularText(char,prop)//prop.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("modules").o[aff[1]]);
                            }
                            //If there's more, do it again.
                            while(newText.indexOf("{")>=0){
                                newText = Q.textModules.replaceVar(newText,Q.state.get("allies").filter(function(char){return char.name===aff[1];})[0]);    
                            }
                            return newText;
                        }
                    }  
                    //If it is a char property
                    else {
                        var propAffected = prop.split('.')[0];
                        return Q.textModules.processModule(Q.state.get("allies").filter(function(char){return char.name===aff[1];})[0],propAffected,prop);
                    }
                break;
                //Modules from within modules
                case "m":
                    var propAffected = aff[1];
                    return Q.textModules.processModule(character,propAffected,prop);
                break;
                //Variable modules don't have any passed in object
                case "":
                    return Q.textModules.processVarModule(prop);
                break;
                //Affected is not one of the above. It is a character
                default:
                    var intAffected = parseInt(aff[0]);
                    var newText;
                    //Rand character that is passed in
                    if(intAffected>=0){
                        var char = Q.storyController.p.characters[intAffected];
                        //If there's more than one part to the obj
                        if(aff[1]){
                            var propAffected = aff[1];
                            return Q.textModules.processModule(char,propAffected,prop);
                        } else {
                            newText = Q.textModules.getModularText(char,prop);
                        }
                    } 
                    //Name of officer
                    else {
                        //If the character is passed in (like: {@name})
                        if(character){
                            newText = prop.split('.').reduce(Q.textModules.getObjPathFromString,character);
                        } 
                        //If the name is passed in (like: {Alex@name})
                        else {
                            newText = prop.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("allies").filter(function(char){return char.name===aff[0];})[0]);
                        }
                    }
                    return newText;
            }
            return varText;
        },
        //Finds a var
        matchVar:function(text){
            //Find any variables and replace the string with the values
            var replacedText = text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                return Q.textModules.processTextVarInstance(p1);
            });
            //If there are any vars
            if (replacedText!==text) {
                return replacedText;
            }
            return false;
        },
        processTextVars:function(text){
            var newText = text;
            //Match each of the variables one by one
            do {
                var textMatched = Q.textModules.matchVar(newText);
                if(textMatched) newText = textMatched;
            } while(textMatched);
            return newText;
        }
    }); 
    
    //Using CSS/Jquery, create the story dialogue with options
    Q.UI.Container.extend("StoryController",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width/2,
                h:Q.height-100
            });
            this.p.x+=10;
            this.p.y+=10;
            this.p.container = $('<div id="text-container"></div>');
            this.p.textContent = $('<div id="text-content"></div>');
            $(this.p.container).append(this.p.textContent);
            $(document.body).append(this.p.container);
        },
        insertPage:function(num){
            var page = this.p.pages[num];
            
            //Do the onload conditions/effects
            for(var i=0;i<page.onload.length;i++){
                var on = page.onload[i];
                if(this.checkConds(on.conds)){
                    this.executeEffects(on.effects);
                };
            }
            //Make the background correct
            this.p.bgImage.p.asset = page.bg;
            
            //Play the music for the page
            Q.playMusic(page.music);
            var text = $('<pre>'+Q.textModules.processTextVars(page.text)+'</pre>');
            var contentBox = this.p.textContent;
            $(contentBox).append(text);
            //Show the choices
            page.choices.forEach(function(choice){
                if(choice.disabled==="Enabled"){
                    $(contentBox).append('<div class="btn btn-default choice-div"><a class="choice"><div>'+choice.displayText+'</div></a></div>');
                }
            });
        },
        insertChoiceDesc:function(desc){
            this.removePage();
            var contentBox = this.p.textContent;
            $(contentBox).append('<pre>'+desc+'</pre>');
            
        },
        removeChoices:function(){
            $(".choice-div").remove();
        },
        removePage:function(){
            $(this.p.textContent).empty();
        },
        getPageNum:function(pageName){
            for(var i=0;i<this.p.pages.length;i++){
                if(this.p.pages[i].name===pageName){
                    return i;
                }
            }
        },
        changePage:function(pageName){
            var lastPage = this.p.pages[this.p.pageNum];
            var pageNum = this.p.pageNum = this.getPageNum(pageName);
            this.removePage();
            this.insertPage(pageNum);
        },
        checkConds:function(cond){
            var condsMet = true;
            if(cond){
                //Loop through each condition
                for(var i=0;i<cond.length;i++){
                    //Run the condition's function (idx 0) with properties (idx 1)
                    condsMet = this["condFuncs"][cond[i][0]](this,cond[i][1]);
                    if(!condsMet) return condsMet;
                }
            }
            return condsMet;
        },
        executeEffects:function(effects){
            //Loop through each effect and run their functions
            for(var i=0;i<effects.length;i++){
                //Run the effects's function (idx 0) with properties (idx 1)
                this["effectFuncs"][effects[i][0]](this,effects[i][1]);
            }
        },
        getChoice:function(page,choice){
            return page.choices.filter(function(ch){
                return ch.displayText===choice;
            })[0];
        },
        condFuncs:{
            checkChar:function(t,obj){
                var char;
                //First, get the character that we're checking
                if(obj.char==="Current"){
                    char = t.p.characters[0];
                } else {
                    char = Q.state.get("characters")[obj.char];
                }
                var value;
                switch(obj.propType){
                    case "Personality":
                        //Loop through the character's personalities
                        for(var i=0;i<char.personality.length;i++){
                            var p = char.personality[i][1];
                            if(p===obj.prop) return true;
                        }
                        return false;
                        break;
                    case "Character Class":
                        value = char.charClass;//Q.state.get("charGeneration").classNames[char.charClass];
                        break;
                    case "Value":
                        value = char.value;//Q.state.get("charGeneration").values[char.value];
                        break;
                    case "Methodology":
                        value = char.methodology;//Q.state.get("charGeneration").methodologies[char.methodologies];
                        break;
                    case "Nationality":
                        value = char.nationality;//Q.state.get("charGeneration").nationalities[char.nationalities];
                        break;
                    case "Loyalty":
                        value = Q.getLoyaltyString(char.loyalty);
                        break;
                    case "Morale":
                        value = Q.getMoraleString(char.morale);
                        break;
                    case "Gender":
                        value = char.gender;//Q.state.get("charGeneration").genders[char.gender];
                        break;
                    //Special case where we're checking a number with different operators
                    case "Stat":
                        var stat = char.combatStats[obj.prop];
                        switch(obj.operator){
                            case "==":
                                if(stat==obj.value) return true;
                                break;
                            case ">":
                                if(stat>obj.value) return true;
                                break;
                            case "<":
                                if(stat<obj.value) return true;
                                break;
                            case ">=":
                                if(stat>=obj.value) return true;
                                break;
                            case "<=":
                                if(stat<=obj.value) return true;
                                break;
                        }
                        break;
                }
                //Once a value is found, check it against the passed in prop. Personality is check within the switch as there are multiple personality traits sometimes.
                if(value===obj.prop){
                    return true;
                } else {
                    return false;
                }
            },
            checkVar:function(t,obj){
                var vars;
                switch(obj.scope){
                    case "event":
                        vars = t.p.vrs;
                        break;
                    case "scene":
                        vars = Q.state.get("sceneVars");
                        break;
                    case "global":
                        vars = Q.state.get("globalVars");
                        break;
                }
                var keys = Object.keys(vars);
                for(var i=0;i<keys.length;i++){
                    if(keys[i]===obj.vr){
                        if(vars[keys[i]]===obj.vl){
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            }
        },
        effectFuncs:{
            setVar:function(t,obj){
                var vars;
                switch(obj.scope){
                    case "event":
                        vars = t.p.vrs;
                        break;
                    case "scene":
                        vars = Q.state.get("sceneVars");
                        break;
                    case "global":
                        vars = Q.state.get("globalVars");
                        break;
                }
                vars[obj.vr] = obj.vl;
            },
            changePage:function(t,obj){
                t.p.choice = obj;//t.p.pages[t.getPageNum(obj.page)];
            },
            enableChoice:function(t,obj){
                //Find the page choice and enable or disable it.
                t.getChoice(t.p.pages[t.p.pageNum],obj.choice).disabled = obj.toggle;
            },
            changeEvent:function(t,obj){
                Q.startScene(obj.scene,obj.event);
                $("#text-container").remove();
            },
            recruitChar:function(t,obj){
                var data = Q.state.get("characters")[obj.name];
                var char = Q.charGen.generateCharacter(data);
                char.events = data.events?data.events:{};
                char.completedEvents = {};
                char.officer = data.officer;
                Q.state.get("allies").push(char);
            },
            changeStat:function(t,obj){
                obj.val = parseInt(obj.val);
                switch(obj.stat){
                    case "Pragmatic":
                    case "Kind":
                    case "Intuitive":
                    case "Egoist":
                    case "Altruist":
                    case "Nepotist":
                        var influence = Q.state.get("saveData").influence;
                        influence[obj.stat]+=obj.val;
                        break;
                    case "Money":
                        Q.state.get("saveData").money+=obj.val;
                        break;
                    case "Morale":
                        Q.changeMorale(obj.val);
                        break;
                    default:
                        var props = obj.stat.split("-");
                        if(props[0]==="Reputation"){
                            Q.state.get("saveData").relations[props[1]][0]+=obj.val;
                        } else if(props[1]==="Stability"){
                            Q.state.get("saveData").relations[props[1]][1]+=obj.val;
                        }
                        break;
                }
            }
        }
    });
    Q.UI.Container.extend("DialogueController",{
        init:function(p){
            this._super(p,{
                x:0,y:Q.height,
                cx:0,cy:0,
                w:Q.width,
                h:200,
                //Which text are we on (array of text)
                textNum:0,
                //Start on the first entry
                groupNum:0,
                scriptNum:1,
                
                //Which character we're on for the text
                textIndex:0,
                
                cantCycle:false,
                noCycle:false,
                autoCycle:false,
                
                //The number of frames between inputs
                inputsTime:15
            });
            this.p.y-=this.p.h;
            this.p.container = $('<div id="dialogue-cont"></div>');
            this.p.leftImage = $('<img id="left-asset"></img>');
            this.p.rightImage = $('<img id="right-asset"></img>');
            this.p.textBox = $('<div id="dialogue-text"></div>');
            $(this.p.container).append(this.p.leftImage);
            $(this.p.container).append(this.p.rightImage);
            $(this.p.container).append(this.p.textBox);
            $(document.body).append(this.p.container);
            
            $(this.p.leftImage).on("error",function(){$(this).attr("src","images/story/empty.png");});
            $(this.p.rightImage).on("error",function(){$(this).attr("src","images/story/empty.png");});
            
            this.on("step",this,"checkInputs");
            //this.on("activateAutoCycle");
            this.next();
        },
        activateAutoCycle:function(){
            this.off("inputsTimerComplete",this,"activateAutoCycle");
            this.p.scriptNum++;
            this.next();
        },
        cycleText:function(){
            if(this.p.textIndex>this.p.script[this.p.groupNum][this.p.scriptNum].text[this.p.textNum].length-1){
                this.p.nextTextTri = this.stage.insert(new Q.NextTextTri({x:this.p.x+this.p.w/2,y:this.p.y+this.p.h}));
                this.off("step",this,"cycleText");
                return;
            }
            //Q.playSound("text_stream.mp3");
            $(this.p.textBox).text($(this.p.textBox).text()+this.p.script[this.p.groupNum][this.p.scriptNum].text[this.p.textNum][this.p.textIndex]);
            this.p.textIndex++;
        },
        next:function(){
            if(this.p.scriptNum>=this.p.script[this.p.groupNum].length){
                this.p.groupNum++;
                this.p.scriptNum = 1;
            }
            var data = this.p.script[this.p.groupNum][this.p.scriptNum];
            //If it's text
            if(data.text){
                this.p.textNum = 0;
                this.p.textIndex = 0;
                $(this.p.leftImage).attr("src","images/"+data.asset1);
                $(this.p.rightImage).attr("src","images/"+data.asset2);
                $(this.p.textBox).text("");
                
                if(data.autoCycle>0){
                    this.off("step",this,"checkInputs");
                    this.p.inputsTimer = data.autoCycle;
                    this.on("step",this,"waitForInputsTimer");
                    this.on("inputsTimerComplete",this,"activateAutoCycle");
                } else {
                    this.on("step",this,"cycleText");
                }
                if("noCycle"==="Yes") this.p.noCycle = true;
            } 
            //If it's a function
            else {
                //Do the function
                if(this[data.func].apply(this,data.props)){return;};
                //Go to the next script entry
                this.p.scriptNum++;
                this.next();
            }
        },
        //Runs the next text in the array of text
        nextText:function(){
            this.p.textNum++;
            //If we're at the end of the text array
            if(this.p.textNum>=this.p.script[this.p.groupNum][this.p.scriptNum].text.length){
                this.p.scriptNum++;
                this.next();
            } else {
                this.p.textIndex = 0;
                $(this.p.textBox).text("");
                this.on("step",this,"cycleText");
            }
        },
        waitForInputsTimer:function(){
            this.p.inputsTimer--;
            if(this.p.inputsTimer<=0){
                this.on("step",this,"checkInputs");
                this.off("step",this,"waitForInputsTimer");
                this.trigger("inputsTimerComplete");
            }
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(!this.p.cantCycle&&!this.p.noCycle){
                    //Check if the text is complete
                    if($(this.p.textBox).text().length===this.p.script[this.p.groupNum][this.p.scriptNum].text[this.p.textNum].length){
                        if(this.p.nextTextTri) this.p.nextTextTri.destroy();
                        this.nextText();
                    } else {
                        $(this.p.textBox).text(this.p.script[this.p.groupNum][this.p.scriptNum].text[this.p.textNum]);
                        this.p.textIndex = this.p.script[this.p.groupNum][this.p.scriptNum].text[this.p.textNum].length;
                    }
                    /*this.p.inputsTimer=this.p.inputsTime;
                    this.off("step",this,"checkInputs");
                    this.on("step",this,"waitForInputsTimer");*/
                    Q.inputs['confirm']=false;
                };
            }
        },
        //SCRIPT FUNCTIONS BELOW
        changeEvent:function(type,scene,event){
            //Remove everything related to this scene
            $(this.p.container).remove();
            Q.startScene(type,scene,event);
            return true;
        },
        //Enable cycling and cycle to the next text
        forceCycle:function(){
            this.p.cantCycle = false;
            this.p.noCycle = false;
            this.p.scriptNum++;
            this.next();
        },
        //Run to stop autocycling
        finishAutoCycle:function(){
            if(!this.p.noCycle){
                this.off("step",this,"autoCycle");
                this.p.cantCycle = false;
                this.p.dialogueText.p.autoCycle = 0;
            }
        },
        //Automatically cycles to the next text after a certain number of frames.
        autoCycle:function(){
            if(this.p.dialogueText.p.autoCycle<=0){
                this.finishAutoCycle();
                this.nextText();
                return;
            }
            this.p.dialogueText.p.autoCycle--;
        },
        getProp:function(prop){
            return this.p[prop];
        },
        //Battle Scene Below
        changeMusic:function(music){
            var t = this;
            Q.playMusic(music+".mp3",function(){t.forceCycle();});
            return true;
        },
        checkAddCharacter:function(name){
            //For now, just add the character to the party 100% of the time
            Q.state.get("allies").push(Q.state.get("characters")[name]);
        },
        getStoryCharacter:function(handle,id){
            //Gets a story character by their id
            if(Q._isNumber(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p.handle===handle&&char.p.uniqueId===id;
                })[0];
            } 
            //Gets a story character by a property
            else if(Q._isString(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p[id];
                })[0];
            }
        },
        //Get all characters on a certain team
        getStoryTeamCharacters:function(team){
            return Q.stage(0).lists.StoryCharacter.filter(function(char){
               return char.p.team===team; 
            });
        },
        waitTime:function(time){
            var t = this;
            setTimeout(function(){
                t.forceCycle();
            },time);
            this.p.noCycle = true;
            //Don't cycle until the time is up
            return true;
        },
        //Modifies the dialogue box from a set of options
        modDialogueBox:function(display){
            if(display==="hide"){
                $(this.p.container).css("display","none");
            } else if(display==="show"){
                $(this.p.container).css("display","block");
            }
        },
        showDialogueBox:function(){
            $(this.p.container).css("display","block");
        },
        //Sets the viewport at a location or object
        setView:function(obj,flash){
            var spr = Q.stage(0).viewSprite;
            //Follow object
            if(Q._isString(obj[0])){
                spr.followObj(this.getStoryCharacter(obj[0],obj[1]));
            }
            //Go to location
            else {
                spr.p.loc = obj;
                Q.BatCon.setXY(spr);
            }
            if(flash){
                Q.stageScene("fader",11);
            }
        },
        //Tweens the viewport to the location
        centerView:function(obj,speed){
            this.p.cantCycle = true;
            this.p.noCycle = true;
            
            //Set the viewsprite to the current object that the viewport is following
            var spr = Q.stage(0).viewSprite;
            spr.p.obj = false;
            var t = this;
            //Follow object
            if(Q._isString(obj[0])){
                var to = this.getStoryCharacter(obj[0],obj[1]);
                spr.animate({x:to.p.x,y:to.p.y},speed?speed:1,Q.Easing.Quadratic.InOut,{callback:function(){
                    spr.followObj(to);
                    t.forceCycle();
                    t.showDialogueBox();
                }});
            } 
            //Go to location
            else {
                var pos = Q.BatCon.getXY(obj);
                spr.animate({x:pos.x,y:pos.y},1,Q.Easing.Quadratic.InOut,{callback:function(){
                    t.forceCycle();
                }});
            }
            return true;
            
        },
        //Changes the direction of a story character
        changeDir:function(id,dir){
            var obj = this.getStoryCharacter(id[0],id[1]);
            obj.playStand(dir);
        },
        playAnim:function(id,anim,dir,sound){
            Q.playSound(sound+".mp3");
            this.getStoryCharacter(id[0],id[1])["play"+anim](dir);
        },
        changeMoveSpeed:function(id,speed){
            var obj = this.getStoryCharacter(id[0],id[1]);
            obj.p.stepDelay = speed;
        },
        //Moves a character along a path
        moveAlong:function(id,path,dir,allowCycle){
            var obj = this.getStoryCharacter(id[0],id[1]);
            //If the is a function that should be played once the object reaches its destination
            obj.on("doneAutoMove",obj,function(){
                //If we have a new path, do it!
                this.playStand(dir);
                //If we're cycling on arrival
                if(allowCycle){
                    Q.dialogueController.p.scriptNum++;
                    Q.dialogueController.next();
                    //Allow cycling to the next script item
                    Q.dialogueController.p.noCycle = false;
                }
            });
            obj.moveAlongPath(path);
            this.p.noCycle = true;
            //If we're waiting on arrival
            return allowCycle;
        },
        //Fades a character in or out
        fadeChar:function(id,inout){
            var obj = this.getStoryCharacter(id[0],id[1]);
            if(inout==="in"){
                obj.animate({opacity:1},1,Q.Easing.Linear);
                obj.show();
            } else if(inout==="out"){
                obj.animate({opacity:0},1,Q.Easing.Linear);
            }
        },
        /*
        setCharacterAs:function(setTo,amount,prop,team,filter){
            var objs = this.getStoryTeamCharacters(team);
            var obj = this[filter][amount](objs,prop);
            obj.p[setTo] = true;
        },
        propertyFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]>b.p[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p[prop]<b.p[prop];
                })[0];
            }
        },
        awardFilter:{
            lowest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]>b.p.awards[prop];
                })[0];
            },
            highest:function(objs,prop){
                return objs.sort(function(a,b){
                    return a.p.awards[prop]<b.p.awards[prop];
                })[0];
            }
        }*/
    });
    
    
    
    //The background image user in dialogue and menus
    Q.Sprite.extend("BackgroundImage",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                w:Q.width,h:Q.height
            });
            Q._generatePoints(this,true);
        },
        draw:function(ctx){
            ctx.drawImage(this.asset(), 0, 0, this.asset().width,    this.asset().height,     // source rectangle
                   0, 0, Q.width, Q.height); // destination rectangle
        }
    });
    //The person who is talking in the story
    Q.Sprite.extend("StoryImage",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                w:200,
                h:300,
                type:Q.SPRITE_NONE
            });
        }
    });
    Q.Sprite.extend("NextTextTri",{
        init: function(p) {
            this._super(p, {
                w:Q.tileW,h:Q.tileH,
                type:Q.SPRITE_NONE,
                blinkNum:0,
                blinkTime:15
            });
            //Triangle points
            this.p.p1=[-this.p.w/2,-this.p.h/2];
            this.p.p2=[0,0];
            this.p.p3=[this.p.w/2,-this.p.h/2];
            this.p.z = 100000;
            this.on("step","trackBlink");
        },
        trackBlink:function(){
            if(this.p.blinkNum<=0){
                this.blink();
                this.p.blinkNum = this.p.blinkTime;
            }
            this.p.blinkNum--;
        },
        blink:function(){
            if(this.p.opacity) this.p.opacity = 0;
            else this.p.opacity = 1;
        },
        draw:function(ctx){
            ctx.beginPath();
            ctx.lineWidth="6";
            ctx.fillStyle="red";
            ctx.moveTo(this.p.p1[0],this.p.p1[1]);
            ctx.lineTo(this.p.p2[0],this.p.p2[1]);
            ctx.lineTo(this.p.p3[0],this.p.p3[1]);
            ctx.closePath();
            ctx.fill();
        }
    });
    //The invisible sprite that follows characters
    Q.Sprite.extend("ViewSprite",{
        init:function(p){
            this._super(p,{
                w:Q.tileW,
                h:Q.tileH,
                type:Q.SPRITE_NONE,
                x:0,
                y:0
            });
            this.add("animation, tween");
        },
        followObj:function(obj){
            this.p.obj = obj;
            this.on("step","follow");
        },
        follow:function(){
            var obj = this.p.obj;
            if(obj){
                this.p.x = obj.p.x;
                this.p.y = obj.p.y;
            } else {
                this.off("step","follow");
            }
        }
    });
    Q.UI.Container.extend("Fader",{
        init:function(p){
            this._super(p,{
                x:Q.width/2,
                y:Q.height/2,
                w:Q.width,h:Q.height,
                fill:"#FFF",
                time:1,
                z:1000000
            });
            this.add("tween");
            this.animate({opacity:0},this.p.time,Q.Easing.Quadratic.In,{callback:function(){Q.clearStage(11);}});

        }
    });
    Q.UI.Container.extend("PlacementSquare",{
        init:function(p){
            this._super(p,{
                w:32,h:32,fill:"blue"
            });
            this.p.z = this.p.y;
        }
    });
};

