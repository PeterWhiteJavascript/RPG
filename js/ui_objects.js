Quintus.UIObjects=function(Q){
    
    Q.GameObject.extend("PartyManager",{
        allies:[],
        roster:[],
        init:function(){
            //Generate the HUD that has money and the current week on it.
            $("body").append("<div id='HUD-container'><div><span>Money: </span><span id='hud-money'></span></div><div><span>Week: </span><span id='hud-week'></span></div></div>");
        },
        adjustTempStatChange:function(char,props){
            char.tempStatChanges.push(props);
            char.baseStats[props[0]] = Q.variableProcessor.evaluateStringOperator(char.baseStats[props[0]],props[1],props[2]);
        },
        addToAllies:function(character){
            this.allies.push(character);
        },
        removeFromAllies:function(idx){
            this.allies.splice(idx,1);
        },
        
        addToRoster:function(character){
            this.roster.push(character);
        },
        removeFromRoster:function(idx){
            this.roster.splice(idx,1);
        },
        
        
        getAlly:function(name){
            if(name==="Current") return Q.state.get("currentEvent").character;
            return this.allies.find(function(ally){return name === ally.name;});
        },
        convertPropName:function(name){
            switch(name){
                case "Gender":
                    return "gender";
                case "Morale":
                    return "morale";
                case "Loyalty":
                    return "loyalty";
                case "Personality":
                    return "personality";
                case "Methodology":
                    return "methodology";
                case "Value":
                    return "value";
                case "Character Class":
                    return "charClass";
                case "Nationality":
                    return "nationality";
            }
            return name;
        },
        hasPersonality:function(character,much,value){
            if(!character.personality) return;
            for(var i=0;i<character.personality.length;i++){
                if(much === "All" || much === character.personality[i][0]){
                    if(character.personality === value) return true;
                }
            }
        },
        convertPresetString:function(obj,prop,value){
            //If we've passed in an operator, we're going to need either the min or max values.
            if(typeof obj === "string"){
                switch(prop){
                    case "morale":
                        return this.convertMorale(value,obj);
                    case "loyalty":
                        return this.convertLoyalty(value,obj);
                    case "value":
                        return this.convertValue(value,obj);
                    case "methodology":
                        return this.convertMethodology(value,obj);
                }
            } 
            //If the obj is a character, we want that character's prop
            else {
                switch(prop){
                    case "morale":
                        return this.convertMorale(obj[prop]);
                    case "loyalty":
                        return this.convertLoyalty(obj[prop]);
                    case "value":
                        return this.convertValue(obj[prop]);
                    case "methodology":
                        return this.convertMethodology(obj[prop]);
                }
                return obj[prop];
            }
        },
        adjustForOperator:function(min,max,operator){
            return !operator || operator === ">=" ? min : max;
        },
        convertMorale:function(morale,operator){
            if(typeof morale === "string"){
                if(morale==="Quit") return this.adjustForOperator(0,0,operator);
                if(morale==="Unhappy") return this.adjustForOperator(1,30,operator);
                if(morale==="Content") return this.adjustForOperator(31,70,operator);
                if(morale==="Inspired") return this.adjustForOperator(71,90,operator);
                return this.adjustForOperator(91,100,operator);
            }
            if(morale<1) return "Quit";
            if(morale<31) return "Unhappy";
            if(morale<71) return "Content";
            if(morale<91) return "Inspired";
            return "Ecstatic";
        },
        convertLoyalty:function(loyalty,operator){
            if(typeof loyalty === "string"){
                if(loyalty==="Traitorous") return this.adjustForOperator(0,0,operator);
                if(loyalty==="Disloyal") return this.adjustForOperator(1,30,operator);
                if(loyalty==="Average") return this.adjustForOperator(31,70,operator);
                if(loyalty==="Loyal") return this.adjustForOperator(71,90,operator);
                if(loyalty==="Admiring") return this.adjustForOperator(91,99,operator);
                return this.adjustForOperator(100,100,operator);
            }
            if(loyalty<1) return "Traitorous";
            if(loyalty<31) return "Disloyal";
            if(loyalty<71) return "Average";
            if(loyalty<91) return "Loyal";
            if(loyalty<100) return "Admiring";
            return "Idolizing";
        },
        convertValue:function(value,operator){
            if(typeof value === "string"){
                if(value==="Egoist") return this.adjustForOperator(0,32,operator);
                if(value==="Nepotist") return this.adjustForOperator(33,67,operator);
                return this.adjustForOperator(68,100);
            }
            if(value<33) return "Egoist";
            if(value<68) return "Nepotist";
            return "Altruist";
        },
        convertMethodology:function(value,operator){
            if(typeof value === "string"){
                if(value==="Intuitive") return this.adjustForOperator(0,32,operator);
                if(value==="Pragmatic") return this.adjustForOperator(33,67,operator);
                return this.adjustForOperator(68,100);
            }
            if(value<33) return "Intuitive";
            if(value<68) return "Pragmatic";
            return "Kind";
        },
    
        getRelations:function(value){
            //TODO
            if(value<1) return "Lowest";
            if(value<31) return "Low";
            if(value<71) return "Average";
            if(value<91) return "High";
            return "Superb";
        }
    });
    
    Q.GameObject.extend("VariableProcessor",{
        //Set the global and scene variables. Event vars are set when the scene is staged.
        init:function(){
            var obj = this;
            Object.assign(obj.vars.Global,GDATA.dataFiles['global-vars.json'].vrs);
            Q.state.get("scenesList").Story.forEach(function(sc){
                obj.vars.Scene[sc.name] = sc.vrs;
                obj.vars.Event[sc.name] = {};
            });
        },
        vars:{
            Global:{},
            Scene:{},
            Event:{}
        },
        changeMoney:function(amount){
            Q.state.get("saveData").money += amount;
            $("#hud-money").text(Q.state.get("saveData").money);
        },
        evaluateStringOperator:function(vr,op,vl,min,max){
            var value;
            switch(op){
                case "+=": value = vr + vl; break;
                case "-=": value = vr - vl; break;
                case "=": value = vl; break;
            }
            if(min) value = Math.max(value,min);
            if(max) value = Math.min(value,max);
            return value;
        },
        setVar:function(scope,vr,op,vl,scene,event){
            switch(scope){
                case "Global":
                    var newValue = Q.variableProcessor.evaluateStringOperator(this.vars[scope][vr],op,vl);
                    this.vars[scope][vr] = newValue;
                    if(vr === "money") this.changeMoney(newValue);
                    break;
                case "Scene":
                    this.vars[scope][scene][vr] = Q.variableProcessor.evaluateStringOperator(this.vars[scope][scene][vr],op,vl);
                    break;
                case "Event":
                    this.vars[scope][scene][event][vr] = Q.variableProcessor.evaluateStringOperator(this.vars[scope][scene][event][vr],op,vl);
                    break;
            }
        },
        getVar:function(scope,vr){
            switch(scope){
                case "Global":
                    return this.vars[scope][vr];
                case "Scene":
                    var scene = Q.state.get("currentEvent").scene;
                    return this.vars[scope][scene][vr];
                case "Event":
                    var scene = Q.state.get("currentEvent").scene;
                    var event = Q.state.get("currentEvent").event;
                    return this.vars[scope][scene][event][vr];
            }
        }
    });
    //Has functions for splitting strings.
    //Can return array from a string that has \n\
    //Can get variable values from {a@b}
    //Can process modules from {moduleName}
    Q.GameObject.extend("TextProcessor",{
        makeParagraphs:function(text){
            //Split up all of the text by paragraph into an array(at \n)
            var paragraphs = text.split("\n").filter(
            //Remove any \n that has no text in it
            function(itm){
                return itm.length;
            //Rework the items into paragraphs.
            }).map(function(itm){
                return "<p>"+Q.textProcessor.replaceText(itm)+"</p>";
            //Join the array back into a string
            }).join(" ");
            return paragraphs;
        },
        evaluateStringConditional:function(vr,op,vl){
            switch(op){
                case "==": return vr == vl;
                case "!=": return vr != vl;
                case ">": return vr > vl;
                case "<": return vr < vl;
                case ">=": return vr >= vl;
                case "<=": return vr <= vl;
                case "set": return vl ? vr : !vr;
            }
        },
        getDeepValue:function(obj, path){
            for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
                obj = obj[path[i]];
            };
            return obj;
        },
        //Sometimes you just want to add the number value of a variable. See if the text is a number.
        fixVarType:function(val){
            if(val === true || val === "true") return true;
            if(val === false || val === "false") return false;
            var int = Number(val);
            if(isNaN(int)){
                return val;
            } else {
                return int;
            }
        },
        //Takes a string and evaluates anything within {} and then returns a new string
        replaceText:function(text){
            //Loop through each {}
            while(typeof text === "string" && text.indexOf("{") !== -1){
                text = text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                    return Q.textProcessor.getVarValue(p1);
                });
            }
            return Q.textProcessor.fixVarType(text);
           
        },
        getVarValue:function(text){
            var newText;
            //The text is a module on the page.
            if(text.indexOf("@") === -1){
                var module = Q.storyController.currentPage.modules.find(function(itm){return itm[0] === text;});
                for(var i=0;i<module[2].length;i++){
                    if(Q.groupsProcessor.processConds(module[2][i][0],module[2][i][2])){
                        newText = Q.textProcessor.replaceText(module[2][i][1]);
                        
                        break;
                    }
                }
                if(newText === undefined) newText = Q.textProcessor.replaceText(module[1]);
            } 
            else {
                //Figure out what the category is
                var category = text[0];
                var prop = text.slice(text.indexOf("@")+1,text.length);
                switch(category){
                    //{@his}, {@hers}, etc... 
                    case "@":
                        newText = GDATA.dataFiles["modules.json"].gender[Q.partyManager.alex.gender][prop];
                        break;
                    //{g@myGlobalVar}
                    case "g":
                        newText = Q.variableProcessor.getVar("Global",prop);
                        break;
                    //{s@mySceneVar}
                    case "s":
                        newText = Q.variableProcessor.getVar("Scene",prop);
                        break;
                    //{e@myEventVar}
                    case "e":
                        newText = Q.variableProcessor.getVar("Event",prop);
                        break;
                    //{o.Alex@baseStats.str}
                    case "o":
                        var name = text.slice(0,text.indexOf("@")).split(".")[1];
                        var officer = Q.partyManager.getAlly(name);
                        newText = Q.textProcessor.getDeepValue(officer,prop);
                        break;
                }
            }
            return newText;
        }
    });
    Q.GameObject.extend("GroupsProcessor",{
        processGroups:function(groups,obj){
            for(var i=0;i<groups.length;i++){
                if(this.processConds(groups[i][0],groups[i][1])){
                    this.processEffects(groups[i][2],obj);
                }
            }
        },
        processConds:function(required,conds){
            var condsEvaluated = [];
            for(var i=0;i<conds.length;i++){
                var func = conds[i][0];
                var props = conds[i][1];
                switch(func){
                    case "checkVar":
                        var scope = props[0];
                        var vr = Q.variableProcessor.getVar(scope,props[1]);
                        var op = props[2];
                        var vl = Q.textProcessor.replaceText(props[3]);
                        condsEvaluated.push(Q.textProcessor.evaluateStringConditional(vr,op,vl));
                        break;
                    case "checkCharProp":
                        var character = Q.partyManager.getAlly(props[0]);
                        var propName = Q.partyManager.convertPropName(props[1]);
                        var oper = props[2];
                        var propValue = props[3];
                        if(propName === "loyalty" || propName === "morale"){
                            //Compare numbers for >= and <=; Compare string for == and !=;
                            if(oper === "==" || oper === "!="){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.partyManager.convertPresetString(character,propName),oper,propValue));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character[propName],oper,Q.partyManager.convertPresetString(oper,propName,propValue)));
                            }
                        } else {
                            condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character[propName],oper,propValue));
                        }
                        break;
                    case "checkCharPersonality":
                        var character = Q.partyManager.getAlly(props[0]);
                        var much = props[1];
                        var personality = props[2];
                        var possession = props[3];
                        var has = Q.partyManager.hasPersonality(character,much,personality);
                        condsEvaluated.push((possession === "Has" && has) || (possession === "Lacks" && !has));
                        break;
                    case "checkCharStat":
                        var character = Q.partyManager.getAlly(props[0]);
                        switch(props[1]){
                            case "Base Stats":
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character.baseStats[props[2]],props[3],props[4]));
                                break;
                            case "Derived Stats":
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(character.combatStats[props[2]],props[3],props[4]));
                                break;
                        }
                        break;
                    case "checkKeyword":
                        var keyword = props[0];
                        var value = false;
                        switch(keyword){
                            case "partySize":
                                value = Q.partyManager.allies.length;
                                break;
                            case "rosterSize":
                                value = Q.partyManager.roster.length;
                                break;
                        }
                        condsEvaluated.push(Q.textProcessor.evaluateStringConditional(value,props[1],props[2]));
                        break;
                    case "hasItemInBag":
                        var item = Q.partyManager.bag.getItem(props[0],{gear:props[1],material:props[2],quality:props[3]});
                        condsEvaluated.push(item && item.amount >= props[4]);
                        break;
                }
            }
            var evaluation = false;
            switch(required){
                case "All":
                    evaluation = condsEvaluated.every(function(itm){return itm;});
                    break;
                case "Some":
                    evaluation = condsEvaluated.some(function(itm){return itm;});
                    break;
                case "One":
                    evaluation = condsEvaluated.filter(function(itm){return itm;}).length === 1;
                    break;
            }
            return evaluation;
        },
        processEffects:function(effects,obj){
            for(var i=0;i<effects.length;i++){
                var props = effects[i][1];
                switch(effects[i][0]){
                    case "setVar":
                        Q.variableProcessor.setVar(props[0],props[1],props[2],Q.textProcessor.replaceText(props[3]),Q.state.get("currentEvent").scene,Q.state.get("currentEvent").event);
                        
                        break;
                    case "changePage":
                        obj.changePage(props[0]);
                        break;
                    case "changeEvent":
                        Q.clearStage(0);
                        obj.finishEvent();
                        Q.startScene(props[0],props[1],props[2]);
                        break;
                    case "enableChoice":
                        var target = obj.currentPage.options || obj.currentPage.choices;
                        target.find(function(choice){return props[0] === choice[0];})[1] = false;
                        break;
                    case "disableChoice":
                        var target = obj.currentPage.options || obj.currentPage.choices;
                        target.find(function(choice){return props[0] === choice[0];})[1] = true;
                        break;
                    //Flavour only. Sends back to event that happened before triggering the flavour event.
                    case "goToAnchorEvent":
                        
                        break;
                    case "recruitChar":
                        //Adds the character to the party
                        break;
                    case "changeInfluence":
                        Q.partyManager.influence[props[0]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.influence[props[0]],props[1],Q.textProcessor.replaceText(props[2]),0,100);
                        console.log(props,Q.partyManager.influence)
                        break;
                    case "changeRelation":
                        Q.partyManager.relations[props[0]][props[1]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.relations[props[0]][props[1]],props[2],Q.textProcessor.replaceText(props[3]),0,100);
                        console.log(props,Q.partyManager.relations)
                        break;
                    case "tempStatChange":
                        var character;
                        if(props[0]==="Current"){
                            character = Q.state.get("currentEvent").character;
                        } else {
                            character = Q.partyManager.allies.find(function(ally){return ally.name === props[0];});
                        }
                        character.tempStatChanges.push([props[1],props[2],props[3],props[4]]);
                        character.baseStats[props[1]] = Q.variableProcessor.evaluateStringOperator(character.baseStats[props[1]],props[2],props[3]);
                        console.log(character.name,props,character.baseStats)
                        break;
                    case "obtainItem":
                        Q.partyManager.bag.addItem(props[0],{gear:props[1],material:props[2],quality:props[3],amount:props[4]});
                        break;
                    case "useItem":
                        Q.partyManager.bag.decreaseItem(props[0],{gear:props[1],material:props[2],quality:props[3],amount:props[4]});
                        break;
                    //Locations-specific below
                    case "createRecruitMenu":
                        obj.createRecruitMenu();
                        break;
                    case "displayBuyItemsList":
                        obj.displayBuyItemsList(props);
                        break;
                    case "displaySellItemsList":
                        obj.displaySellItemsList(props);
                        break;
                    case "createGatherInfoMenu":
                        obj.createGatherInfoMenu();
                        break;
                    case "createHuntMenu":
                        obj.createHuntMenu();
                        break;
                    case "loadEntourageMenu":
                        obj.loadEntourageMenu();
                        break;
                    case "loadBrionyMenu":
                        obj.loadBrionyMenu();
                        break;
                    case "loadOptionsMenu":
                        obj.loadOptionsMenu();
                        break;
                    case "entourageEquipmentMenu":
                        obj.entourageEquipmentMenu();
                        break;
                    case "entourageRewardMenu":
                        obj.entourageRewardMenu();
                        break;
                    case "entourageTaskForcesMenu":
                        obj.entourageTaskForcesMenu();
                        break;
                    case "entourageStatusMenu":
                        obj.entourageStatusMenu();
                        break;
                }
            }
        },
        processImpact:function(groups,obj){
            for(var i=0;i<groups.length;i++){
                var characters = this.processImpactConds(groups[i][0],groups[i][1]);
                if(characters.length){
                    this.processImpactEffects(groups[i][2],characters);
                }
            }
        },
        //Gets all relevant characters
        processImpactConds:function(required,conds){
            var charactersAffected = [];
            var allies = Q.partyManager.allies;
            if(!conds) return allies;
            function checkAlly(ally,required,conds){
                var condsEvaluated = [];
                for(var i=0;i<conds.length;i++){
                    var check = conds[i][0];
                    var props = conds[i][1];
                    switch(check){
                        case "Gender":
                        case "Methodology":
                        case "Value":
                        case "Character Group":
                        case "Character Class":
                        case "Nationality":
                            var prop = Q.partyManager.convertPropName(check);
                            condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally[prop],check[0],check[1]));
                            break;
                        case "Morale":
                        case "Loyalty":
                            var prop = Q.partyManager.convertPropName(check);
                            //Compare numbers for >= and <=; Compare string for == and !=;
                            if(check[0] === "==" || check[0] === "!="){
                                    condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.partyManager.convertPresetString(ally,prop),check[0],check[1]));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally[prop],check[0],check[1]));
                            }
                            break;
                        case "Name":
                            if(props[1] === "Officers"){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally.officer,props[0],true));
                            } else if(props[1] === "Current"){
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(Q.state.get("currentEvent").character,props[0],ally));
                            } else {
                                condsEvaluated.push(Q.textProcessor.evaluateStringConditional(ally.name,props[0],props[1]));
                            }
                            break;
                        case "Personality":
                            var much = props[0];
                            var personality = props[1];
                            var possession = props[2];
                            var has = Q.partyManager.hasPersonality(ally,much,personality);
                            condsEvaluated.push((possession === "Has" && has) || (possession === "Lacks" && !has));
                            break;
                    }
                }
                var evaluation = false;
                switch(required){
                    case "All":
                        evaluation = condsEvaluated.every(function(itm){return itm;});
                        break;
                    case "Some":
                        evaluation = condsEvaluated.some(function(itm){return itm;});
                        break;
                    case "One":
                        evaluation = condsEvaluated.filter(function(itm){return itm;}).length === 1;
                        break;
                }
                return evaluation;
            }
            
            allies.forEach(function(ally){
                if(checkAlly(ally,required,conds)) charactersAffected.push(ally);
            });
            return charactersAffected;
        },
        processImpactEffects:function(effects,characters){
            for(var i=0;i<characters.length;i++){
                var char = characters[i];
                for(var j=0;j<effects.length;j++){
                    var name = effects[j][0];
                    var props = effects[j][1];
                    switch(name){
                        case "Loyalty":
                            char.loyalty = Q.variableProcessor.evaluateStringOperator(char.loyalty,props[0],props[1],0,100);
                            console.log(char.name,"Loyalty",char.loyalty)
                            break;
                        case "Morale":
                            char.morale = Q.variableProcessor.evaluateStringOperator(char.morale,props[0],props[1],0,100);
                            console.log(char.name,"Morale",char.morale)
                            break;
                        case "Stat":
                            Q.partyManager.adjustTempStatChange(char,[props[0],props[1],props[2],props[3]]);
                            console.log(char.name,props,char.baseStats)
                            break;
                    }
                }
            }
        }
    });

    Q.GameObject.extend("StoryController",{
        //When a story event starts, set data and show the container.
        startEvent:function(data){
            //Elements used for displaying text
            $("#main-container").append('<div id="text-content" class="fancy-border"></div>');
            $("#text-content").append('<div id="text-content-story"></div>');
            this.data = data;
            //Start should actually be party menu.
            
            this.displayPage(data.pages[0].name);
        },
        
        getPageData:function(name){
            return this.data.pages.filter(function(page){return page.name === name; })[0];
        },
        displayPage:function(name){
            this.currentPage = this.getPageData(name);
            $("#background-image").attr('src', 'images/bg/'+this.currentPage.bg);
            Q.groupsProcessor.processGroups(this.currentPage.onload,this);
            $("#text-content-story").append(this.newPage(this.currentPage));
        },
        changePage:function(name){
            //Wrap this in setTimeout because jquery append doesn't add to html instantly, which means that if there is a changePage in an onload, it will display two pages.
            setTimeout(function(){
                $("#text-content-story").children(".page").first().remove();
            });
            this.displayPage(name);
        },
        newPage:function(data){
            var cont = $("<div class='page'></div>");
            $(cont).append(this.getPageWallOfText(data.text));
            $(cont).append(this.getPageChoices(data.choices));
            return cont;
        },
        getPageWallOfText:function(text){
            return $("<div class='page-text'>"+Q.textProcessor.makeParagraphs(text)+"</div>");
        },
        getChoice:function(name){
            return this.currentPage.choices.find(function(choice){return choice[0] === name;});
        },
        selectChoice:function(choice){
            var data = Q.storyController.getChoice(choice);
            Q.groupsProcessor.processEffects(data[2],Q.storyController);
            Q.groupsProcessor.processImpact(data[3],Q.storyController);
        },
        getPageChoices:function(choices){
            var cont = $("<div class='page-choices'></div>");
            for(var i=0;i<choices.length;i++){
                if(!choices[i][1]){
                    //Use data prop as text may use variables
                    $(cont).append("<div class='page-choice' data='"+choices[i][0]+"'><span>"+Q.textProcessor.replaceText(choices[i][0])+"</span></div>");
                    $(cont).children(".page-choice").last().click(function(){
                        Q.storyController.selectChoice($(this).attr("data"));
                    });
                }
            }
            return cont;
        },
        changeEvent:function(props){
            this.finishScene();
            Q.startScene(props[0],props[1],props[2]);
        },
        finishEvent:function(){
            $("#text-content").remove();
        }
    });
    
    Q.GameObject.extend("CharacterStatsMenu",{
        createMenu:function(){
            $("#main-container").append("<div id='character-stats-display-cont' class='big-box'></div>");
            $("#character-stats-display-cont").append(
                    "<div class='char-stats-cont-main inner-box'></div>\n\
                    <div class='char-stats-cont-second inner-box'></div>"
            );
            $("#main-container").append("<div id='status-characters-options' class='big-box'></div>");
        },
        setUpBaseStatsPolygon:function(baseStats){
            var trimmedStatNames = CharacterGenerator.trimmedBaseStats;
            var statNames = CharacterGenerator.statNames;
            var parent = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats");
            
            var bg = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").children(".base-stats-polygon-background");
            bg.width(parent.width()/2);
            bg.height(bg.width());
            var fg = $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").children(".base-stats-polygon-foreground");
            fg.width(parent.width()/2);
            fg.height(fg.width());
            var numPoints = statNames.length;
            //50 as in 50%
            var radius = 50;
            var xCenter = radius;
            var yCenter = radius;
            var bgPointsString = "";
            var fgPointsString = "";
            for(var i=0;i<numPoints;i++){
                var statRatio = baseStats[trimmedStatNames[i]]/100;
                var bgX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints);
                var bgY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints);
                var fgX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints) * statRatio;
                var fgY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints) * statRatio;
                var txX = xCenter + radius * Math.sin(i * 2 * Math.PI / numPoints) * 2;
                var txY = yCenter - radius * Math.cos(i * 2 * Math.PI / numPoints) * 2;
                if(i === numPoints - 1){
                    bgPointsString += bgX+"% "+bgY+"%";
                    fgPointsString += fgX+"% "+fgY+"%";
                } else {
                    bgPointsString += bgX+"% "+bgY+"%, ";
                    fgPointsString += fgX+"% "+fgY+"%, ";
                }
                var stat = $("<div class='char-cont-polygon-stat'><div>"+statNames[i]+" "+baseStats[trimmedStatNames[i]]+"</div></div>");
                stat.css({"margin-left":txX + 15, "margin-top":txY + 25});
                $("#character-stats-display-cont").children(".char-stats-cont-second").children(".char-cont-base-stats").children(".char-cont-polygon-cont").append(stat);
                
            }
            bg.css('clip-path', "polygon("+bgPointsString+")");
            fg.css('clip-path', "polygon("+fgPointsString+")");
        },
        //Show a character's data
        showCharacterData:function(character){
            //Remove the previous character's data
            $("#character-stats-display-cont").contents().empty();
            $("#character-stats-display-cont").children(".char-stats-cont-main").append(this.mainCharData(character));
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.derivedCharData(character));
            this.setUpBaseStatsPolygon(character.combatStats);
            $("#equipable-gear-cont").remove();
        },
        //Show a character's data
        showCharacterCombatData:function(character){
            //Remove the previous character's data
            $("#character-stats-display-cont").contents().empty();
            $("#character-stats-display-cont").children(".char-stats-cont-main").append(this.mainCharData(character));
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
            $("#equipable-gear-cont").remove();
        },
        //Adds a character for comparing
        addCharacterData:function(){
            
        },
        //Removes a character if viewing more than one
        removeCharacterData:function(){
            
        },
        //Remove this menu (must call createMenu to make it again)
        removeMenu:function(){
            $("#character-stats-display-cont").remove();
        },
        
        mainCharData:function(data){
            function validateEquipment(eq){
                if(!eq || eq === "None") return "<div class='char-prop-medium'><span>-</span></div>";
                return "<div class='char-prop-medium'><span>"+eq.quality+" "+eq.material+" "+eq.name+"</span></div>";
            }
            var imgsrc = "images/sprites/"+data.charClass.toLowerCase()+".png";
            var cont = "<div class='char-cont-name'>\n\
                            <div class='char-prop-large'><span>"+data.name+"</span></div>\n\
                            <div class='char-prop-large'><span>Lv. "+data.level+"</span></div>\n\
                            <div class='char-prop-large'><span>"+data.nationality+" "+data.charClass+"</span></div>\n\
                        </div>\n\
                        <div class='char-cont-sprite'>\n\
                            <img src='"+imgsrc+"'>\n\
                        </div>\n\
                        <div class='char-cont-equipment'>\n\
                            "+validateEquipment(data.equipment[0])+"\n\
                            "+validateEquipment(data.equipment[1])+"\n\
                            "+validateEquipment(data.equipment[2])+"\n\
                            "+validateEquipment(data.equipment[3])+"\n\
                            "+validateEquipment(data.equipment[4])+"\n\
                        </div>";
            return cont;
        },
        derivedCharData:function(data){
            var baseStats = "<div class='char-cont-base-stats'>\n\
                                <div class='char-cont-polygon-spacer'></div>\n\
                                <div class='char-cont-polygon-cont'>\n\
                                    <div class='base-stats-polygon-background'></div>\n\
                                    <div class='base-stats-polygon-foreground'></div>\n\
                                </div>\n\
                                <div class='char-cont-polygon-spacer'></div>\n\
                            </div>";
            return baseStats;
        },
        combatCharData:function(data){
            var cont = $("<div class='char-cont-combat-stats'></div>");
            function stat(a,b){
                return "<div class='char-cont-combat-stat'><div>"+a+"</div><div>"+b+"</div></div>";
            }
            var stats = data.combatStats;
            cont.append(stat("ATK Accuracy",stats.atkAccuracy));
            cont.append(stat("ATK DMG MIN",stats.minAtkDmg));
            cont.append(stat("ATK DMG MAX",stats.maxAtkDmg));
            cont.append(stat("ATK Speed",stats.atkSpeed));
            cont.append(stat("Counter",stats.counterChance));
            cont.append(stat("Critical",stats.critChance));
            cont.append(stat("DMG Reduction",stats.damageReduction));
            cont.append(stat("DFN Ability",stats.defensiveAbility));
            cont.append(stat("Movement",stats.moveSpeed));
            cont.append(stat("Enc. Threshold",stats.encumbranceThreshold));
            cont.append(stat("Total Weight",stats.totalWeight));
            cont.append(stat("Enc. Penalty",stats.encumbrancePenalty));
            return cont;
        },
        displayEquipableGear:function(type){
            $("#equipable-gear-cont").remove();
            var cont = $("<table id='equipable-gear-cont'><thead><tr><th>Name</th></tr></thead><tbody></tbody></table>");
            var character = Q.partyManager.getAlly($("#status-characters-options").children(".selected-option").children("span").text());
            function appendToTable(str){
                cont.children("tbody").append("<tr><td class='equip-gear-item'><div>"+str+"</div></td></tr>");
            }
            if(character.equipment[type]) appendToTable("Unequip");
            var bag = Q.partyManager.bag;
            switch(type){
                case 0:
                case 1:
                    for(var i=0;i<bag.items.Weapons.length;i++){
                        var gear = bag.items.Weapons[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    for(var i=0;i<bag.items.Shields.length;i++){
                        var gear = bag.items.Shields[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 2:
                    for(var i=0;i<bag.items.Armour.length;i++){
                        var gear = bag.items.Armour[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 3:
                    for(var i=0;i<bag.items.Footwear.length;i++){
                        var gear = bag.items.Footwear[i];
                        appendToTable(gear.quality+"_"+gear.material+"_"+gear.name);
                    }
                    break;
                case 4:
                    for(var i=0;i<bag.items.Accessories.length;i++){
                        var gear = bag.items.Accessories[i];
                        appendToTable(gear.name);
                    }
                    break;
            }
            cont.children("tbody").children("tr").children(".equip-gear-item").click(function(){
                Q.characterStatsMenu.validateEquipGear(type,$(this).children("div").text());
            });
            return cont;
        },
        validateEquipGear:function(idx,text){
            var t = text.split("_");
            var character = Q.partyManager.getAlly($("#status-characters-options").children(".selected-option").children("span").text());
            var currentlyEquipped = character.equipment[idx];
            if(t[0] === "Unequip"){
                Q.partyManager.bag.addItem(currentlyEquipped.kind,currentlyEquipped);
                CharacterGenerator.removeEquipment(character,idx);
                character.combatStats = CharacterGenerator.getCombatStats(character);
                $("#character-stats-display-cont").children(".char-stats-cont-second").empty();
                $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
                
                $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+idx+")").children("span").text("-");
                $("#equipable-gear-cont").remove();
                return;
            }
            var quality = t[0];
            var material = t[1];
            var gear = t[2];
            if(t[3]) gear += " "+t[3];
            var toEquip = CharacterGenerator.equipment.gear[gear];
            //Figure out which eq should go where if it is a weapon/shield
            if(idx === 0 || idx === 1){
                //If it's a shield, always put in secondary hand
                if(toEquip.kind === "Shields"){
                    idx = 1;
                }
                //If it's a weapon, figure out which one does more damage between the toEquip and secondary
                else {
                    var secondary = character.equipment[1];
                    if(toEquip.maxdmg < secondary.maxdmg){
                        //Swap the values
                        [character.equipment[0], character.equipment[1]] = [character.equipment[1], character.equipment[0]];
                        //Change the text
                        $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+0+")").children("span").text(character.equipment[0].quality+" "+character.equipment[0].material+" "+character.equipment[0].gear);
                        //We're changing the secondary
                        idx = 1;    
                    } else if(idx === 1){
                        var primary = character.equipment[0];
                        if(primary.maxdmg < toEquip.maxdmg){
                            //Swap the values
                            [character.equipment[0], character.equipment[1]] = [character.equipment[1], character.equipment[0]];
                            $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+1+")").children("span").text(character.equipment[1].quality+" "+character.equipment[1].material+" "+character.equipment[1].gear);
                            idx = 0;
                        }
                    } else {
                        idx = 0;
                    }
                    
                }
            }
            var currentlyEquipped = character.equipment[idx];
            if(currentlyEquipped){
                //Remove whatever is equipped and add to the bag
                Q.partyManager.bag.addItem(currentlyEquipped.kind,currentlyEquipped);
            }
            //Remove the item from bag.
            Q.partyManager.bag.removeItem(toEquip.kind,{material:material,gear:gear,quality:quality});
            CharacterGenerator.removeEquipment(character,idx);
            CharacterGenerator.addEquipment(character,idx,CharacterGenerator.convertEquipment([material,gear],quality));
            $("#character-stats-display-cont").children(".char-stats-cont-second").empty();
            $("#character-stats-display-cont").children(".char-stats-cont-second").append(this.combatCharData(character)); 
            
            
            $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium:eq("+idx+")").children("span").text(quality+" "+material+" "+gear);
            $("#equipable-gear-cont").remove();
        }
    });
    
    //All menus created in the editor
    Q.component("locationsMenus",{
        extend:{
            createRecruitMenu:function(){
                $("#main-container").empty();
                Q.characterStatsMenu.createMenu();
                $("#main-container").append("<div id='options-cont-location' class='big-box'><div class='options-list inner-box'></div></div>");
                var optionsList = $("#options-cont-location").children(".options-list");
                var roster = Q.partyManager.roster;
                
                function rosterEmpty(){
                    optionsList.children(".option").first().replaceWith("<div class='option-title'><span>The roster is empty!</span></div>");
                }
                
                //Put each roster character as an option.
                for(var i=0;i<roster.length;i++){
                    $("#status-characters-options").append(this.newOption(roster[i].name));
                    $("#status-characters-options").children(".option").last().click(function(){
                        var char = roster[$(this).index()];
                        $(".selected-option").removeClass("selected-option");
                        $(this).addClass("selected-option");
                        var baseCost = 100;
                        var levelMultiplier = 20;
                        var cost = Math.floor(baseCost + (char.level * levelMultiplier) + CharacterGenerator.getAllGearCost(char.equipment));
                        optionsList.children(".option").first().children("span").text("Recruit "+$(this).text()+" for "+cost+" money?");
                        optionsList.children(".option").first().children("span").attr("cost",cost);
                        Q.characterStatsMenu.showCharacterData(char);
                    });
                }
                optionsList.append(this.newOption("Recruit"));
                optionsList.children(".option").first().click(function(){
                    var idx = $(".selected-option").index();
                    var cost = parseInt($(this).children("span").attr("cost"));
                    var currentMoney = Q.state.get("saveData").money;
                    if(currentMoney < cost){
                        alert("Not enough money!");
                    } else {
                        Q.variableProcessor.changeMoney(-cost);
                        Q.partyManager.addToAllies(roster[idx]);
                        Q.partyManager.removeFromRoster(idx);
                        $(".selected-option").remove();
                        if($("#status-characters-options").children(".option").length){
                            var num = idx > 0 ? idx - 1 : idx;
                            $("#status-characters-options").children(".option:eq("+(num)+")").trigger("click");
                        } else {
                            rosterEmpty();
                        }
                    }
                });
                optionsList.append($(this.newOption("Back")).click(function(){
                    $("#main-container").empty();
                    Q.locationController.setUpCont();
                    Q.locationController.changePage(Q.locationController.currentPage.name);
                }));
                if(roster.length){
                    $("#status-characters-options").children(".option").first().trigger("click");
                } else {
                    rosterEmpty();
                }
            },
            displayBuyItemsList:function(props){
                $("#main-container").empty();
                $("#main-container").append("<div id='options-cont-location' class='big-box'><div class='options-list inner-box'></div></div>");
                var optionsList = $("#options-cont-location").children(".options-list");
                optionsList.append(this.newOption("Buy"));
                optionsList.children(".option:eq(0)").click(function(){
                    var selectedCost = parseInt($(".buy-items-item-selected").children("td:eq(1)").text());
                    var curMoney = Q.state.get("saveData").money;
                    if(selectedCost > curMoney) {
                        alert("You don't have enough money!");
                        return;
                    }
                    var selectedItem = props[0][$(".buy-items-item-selected").index()];
                    Q.partyManager.bag.addItem(selectedItem[0],{gear:selectedItem[1],material:selectedItem[2],quality:selectedItem[3]});
                    Q.variableProcessor.changeMoney(-selectedCost);
                    alert(selectedItem[3]+" "+selectedItem[2]+" "+selectedItem[1]+" was bought for "+selectedCost+" money!");
                });
                optionsList.append(this.newOption("Back"));
                optionsList.children(".option:eq(1)").click(function(){
                    $("#main-container").empty();
                    Q.locationController.setUpCont();
                    Q.locationController.changePage(Q.locationController.currentPage.name);
                });
                
                
                var cont = $("<div id='buy-items-cont' class='big-box'></div>");
                cont.append("<div class='buy-items-title'><span>BUY ITEMS</span></div>");
                var list = $("<table id='buy-items-list'><thead><tr><th>Name</th><th>Cost</th></tr></thead><tbody></tbody></table>");
                cont.append(list);
                for(var i=0;i<props[0].length;i++){
                    var itm = props[0][i];
                    var item = $("<td class='buy-items-item'></td>");
                    switch(itm[0]){
                        case "Consumables":
                        case "Accessories":
                            item.append("<div>"+itm[1]+"</div>");   
                            break;
                        default:
                            item.append("<div>"+itm[3]+" "+itm[2]+" "+itm[1]+"</div>");
                            break;
                    }
                    var itmCost = CharacterGenerator.getGearCost({cost:CharacterGenerator.equipment.gear[itm[1]].cost,material:itm[2],quality:itm[3]});
                    var cost = $("<td class='buy-items-cost'></td>");
                    cost.append("<div>"+itmCost+"</div>");
                    var tr = $("<tr></tr>");
                    tr.append(item);
                    tr.append(cost);
                    tr.click(function(){
                        $(".buy-items-item-selected").removeClass("buy-items-item-selected");
                        $(this).addClass("buy-items-item-selected");
                    });
                    list.children("tbody").append(tr);
                }
                list.children("tbody").children("tr").first().trigger("click");
                $("#main-container").append(cont);
            },
            displaySellItemsList:function(props){
                
            },
            createGatherInfoMenu:function(){
                
            },
            createHuntMenu:function(){
                
            }
        }
    });
    Q.GameObject.extend("LocationController",{
        startEvent:function(data){
            this.add("locationsMenus");
            this.setUpCont();
            this.data = data;
            var pages = this.pages = [];
            for(var i=0;i<data.pages.length;i++){
                pages.push(data.pages[0]);
            }
            this.startPage = pages[0].name;
            //Set up the menu options that are always available, regardless of which location the player is at.
            pages.unshift({
                name:"_entourage",
                music:pages[0].music,
                bg:pages[0].bg,
                options:[
                    [
                        "Equip",
                        false,
                        [
                            [
                                "entourageEquipmentMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "Reward",
                        false,
                        [
                            [
                                "entourageRewardMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "Manage Taskforces",
                        false,
                        [
                            [
                                "entourageTaskForcesMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "View Status",
                        false,
                        [
                            [
                                "entourageStatusMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "Go Back",
                        false,
                        [
                            [
                                "changePage",
                                [
                                    "_base"
                                ]
                            ]
                        ]
                    ]
                ],
                onload:[]
            });
            pages.unshift({
                name:"_base",
                music:pages[1].music,
                bg:pages[1].bg,
                options:[
                    [
                        "View Entourage",
                        false,
                        [
                            [
                                "loadEntourageMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "Briony's Orders",
                        false,
                        [
                            [
                                "loadBrionyMenu",
                                []
                            ]
                        ]
                    ],
                    [
                        "Select Action",
                        false,
                        [
                            [
                                "changePage",
                                [
                                    pages[1].name
                                ]
                            ]
                        ]
                    ],
                    [
                        "Options",
                        false,
                        [
                            [
                                "loadOptionsMenu",
                                []
                            ]
                        ]
                    ]
                ],
                onload:[]
            });
            this.displayPage(pages[0].name);
        },
        setUpCont:function(){
            $("#main-container").append('<div id="options-cont-location" class="big-box"><div class="options-list inner-box"></div></div>');
        },
        finishEvent:function(){
            $("#options-cont-location").remove();
        },
        newOption:function(text){
            return $("<div class='option'><span>"+text+"</span></div>");
        },
        getPageData:function(name){
            return this.pages.filter(function(page){return page.name === name; })[0];
        },
        addBaseOptions:function(){
            $("#options-cont-location").children(".options-list").append(this.newOption("Entourage"));
        },
        displayPage:function(name){
            this.currentPage = this.getPageData(name);
            $("#background-image").attr('src', 'images/bg/'+this.currentPage.bg);
            Q.groupsProcessor.processGroups(this.currentPage.onload,this);
            $("#options-cont-location").append(this.newPage(this.currentPage));
            //If we're at the first set of user created options, add a go back button to go to the default options
            if(this.currentPage.name === this.startPage){ 
                $("#options-cont-location").children(".options-list").append($(this.newOption("Back")).click(function(){
                    $("#main-container").empty();
                    Q.locationController.setUpCont();
                    Q.locationController.changePage(Q.locationController.pages[0].name);
                }));
            }
        },
        changePage:function(name){
            $("#options-cont-location").children(".options-list").empty();
            this.displayPage(name);
        },
        getOption:function(chosen){
            return this.currentPage.options.find(function(option){return option[0] === chosen;});
        },
        newPage:function(data){
            return this.getOptions(data.options,$("#options-cont-location").children(".options-list"));
        },
        selectOption:function(option){
            var data = Q.locationController.getOption(option);
            Q.groupsProcessor.processEffects(data[2],Q.locationController);
        },
        getOptions:function(options,cont){
            for(var i=0;i<options.length;i++){
                if(options[i][1]) continue;
                cont.append(this.newOption(options[i][0]));
                $(cont).children(".option").last().click(function(){
                    Q.locationController.selectOption($(this).text());
                });
            }
            return cont;
        },
        
        //Base options funcs below
        loadEntourageMenu:function(){
            $("#options-cont-location").children(".options-list").empty();
            this.currentPage = this.getPageData("_entourage");
            $("#options-cont-location").append(this.getOptions(this.currentPage.options,$("#options-cont-location").children(".options-list")));
        },
        entourageEquipmentMenu:function(){
            $("#main-container").empty();
            Q.characterStatsMenu.createMenu();
            
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                $("#status-characters-options").append(this.newOption(allies[i].name));
                $("#status-characters-options").children(".option").last().click(function(){
                    var char = allies[$(this).index()];
                    $(".selected-option").removeClass("selected-option");
                    $(this).addClass("selected-option");
                    Q.characterStatsMenu.showCharacterCombatData(char);
                    $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium").addClass("char-prop-selectable")
                    $("#character-stats-display-cont").children(".char-stats-cont-main").children(".char-cont-equipment").children(".char-prop-medium").click(function(){
                        $("#main-container").append(Q.characterStatsMenu.displayEquipableGear($(this).index()));
                    });
                });
            }
            $("#status-characters-options").children(".option").first().trigger("click");
            $("#main-container").append("<div id='options-cont-location' class='big-box'><div class='options-list inner-box'></div></div>");
            var optionsList = $("#options-cont-location").children(".options-list");
            optionsList.append($(this.newOption("Back")).click(function(){
                $("#main-container").empty();
                Q.locationController.setUpCont();
                Q.locationController.changePage(Q.locationController.currentPage.name);
            }));
        },
        entourageRewardMenu:function(){
            
        },
        entourageTaskForcesMenu:function(){
            
        },
        entourageStatusMenu:function(){
            $("#main-container").empty();
            Q.characterStatsMenu.createMenu();
            var allies = Q.partyManager.allies;
            
            for(var i=0;i<allies.length;i++){
                $("#status-characters-options").append(this.newOption(allies[i].name));
                $("#status-characters-options").children(".option").last().click(function(){
                    var char = allies[$(this).index()];
                    $(".selected-option").removeClass("selected-option");
                    $(this).addClass("selected-option");
                    Q.characterStatsMenu.showCharacterData(char);
                });
            }
            $("#status-characters-options").children(".option").first().trigger("click");
            $("#main-container").append("<div id='options-cont-location' class='big-box'><div class='options-list inner-box'></div></div>");
            var optionsList = $("#options-cont-location").children(".options-list");
            optionsList.append($(this.newOption("Back")).click(function(){
                $("#main-container").empty();
                Q.locationController.setUpCont();
                Q.locationController.changePage(Q.locationController.currentPage.name);
            }));
        },
        
        loadBrionyMenu:function(){
            
        },
        loadOptionsMenu:function(){
            $("#main-container").empty();
            $("#main-container").append("<div id='options-menu' class='big-box'><div id='options-cont' class='inner-box'></div></div>");
            function makeOption(props){
                var itm = $("<div class='option-itm'><div><span>"+props[0]+"</span></div><div></div></div>");
                switch(props[1]){
                    case "checkbox":
                        var elm = $("<input type='checkbox' class='option-prop'>");
                        elm.prop("checked",Q.optionsController.options[props[2]]);
                        itm.children("div").last().append(elm);
                        break;
                    case "range":
                        itm.children("div").last().append("<input type='range' min='0' max='100' value="+Q.optionsController.options[props[2]]+" class='option-prop'>");
                        break;
                    case "select":
                        var options = "";
                        props[3].forEach(function(v){
                            options += "<option value = "+v+">"+v+"</option>";
                        });
                        var elm = $("<select class='option-prop'>"+options+"</select>");
                        itm.children("div").last().append(elm);
                        itm.children("div").last().children("select").last().val(Q.optionsController.options[props[2]]);
                        break;
                }
                $("#options-cont").append(itm);
            }
            var options = [
                ["Music","checkbox","musicEnabled"],
                ["Music Volume","range","musicVolume"],
                ["Sound","checkbox","soundEnabled"],
                ["Sound Volume","range","soundVolume"],
                ["Text Speed","select","textSpeed",["Slow","Normal","Fast"]],
                ["Auto Scroll","checkbox","autoScroll"],
                ["Cursor Speed","select","cursorSpeed",["Slow","Normal","Fast"]],
                ["Pointer Speed","select","pointerSpeed",["Slow","Normal","Fast"]],
                ["Brightness","range","brightness"],
                ["Damage Indicators","checkbox","damageIndicators"],
                ["Faction Highlighting","checkbox","factionHighlighting"],
                ["Recall Move","checkbox","recallMove"],
                ["Tool Tips","checkbox","tooltips"]
            ];
            options.forEach(function(opt){
                makeOption(opt);
            });
            $("#options-cont").append("<div class='options-cont-confirm-cont'><div>Save Options</div><div>Go Back</div></div>");
            function goBack(){
                $("#main-container").empty();
                Q.locationController.setUpCont();
                Q.locationController.displayPage(Q.locationController.pages[0].name);
            };
            $("#options-cont").children(".options-cont-confirm-cont").children("div").first().click(function(){
                $("#options-cont").children(".option-itm").each(function(idx){
                    if($(this).children("div").children(".option-prop[type='checkbox']").length){
                        Q.optionsController.options[options[idx][2]] = $(this).children("div").children(".option-prop").prop("checked");
                    } else {
                        Q.optionsController.options[options[idx][2]] = $(this).children("div").children(".option-prop").val();
                    }
                });
                Q.audioController.checkMusicEnabled();
                goBack();
            });
            $("#options-cont").children(".options-cont-confirm-cont").children("div").last().click(goBack);
        }
    });
    
    Q.GameObject.extend("OptionsController",{
        options:{
            musicEnabled:false,
            musicVolume:20,
            soundEnabled:true,
            soundVolume:100,
            textSpeed:"Fast",
            autoScroll:true,
            cursorSpeed:"Fast",
            pointerSpeed:"Fast",

            brightness:100,
            damageIndicators:true,
            factionHighlighting:true,

            recallMove:true,

            tooltips:true
        }
    });
    
    Q.GameObject.extend("TimeController",{
        week:0,
        reduceWounded:function(char){
            char.wounded--;
            if(!char.wounded){
                char.combatStats.hp = char.combatStats.maxHp;
            }
        },
        checkWeek:function(week){
            
            //TODO: Remake (Maybe story events could just be handled in by checking the week var in the editor created events or something). This wouldn't work for flavour, though.
            //Week should be cycled on returning to location?
            return;
            //Check the story events first as they are the most important.
            //Story events (important ones)
            var storyEvents = Q.state.get("storyEvents");
            if(storyEvents[week]){
                return storyEvents[week];
            }
            //Get the list of all events that could be played
            var potentialEvents = Q.state.get("potentialEvents");
            //Find the event with the highest priority (lowest number)
            var event = potentialEvents.sort(function(a, b){return a.priority - b.priority;})[0];
            if(event){
                event.completed = true;
                event.char.completedEvents.push({idx:event.idx,act:event.act,prop:event.prop});
                //Any potential events that can not recur should be marked as completed
                potentialEvents.forEach(function(ev){
                    if(!ev.recur&&!ev.completed){
                        ev.char.completedEvents.push({idx:ev.idx,act:ev.act,prop:ev.prop});
                    }
                });
                Q.state.set("potentialEvents",[]);
                var eventData = Q.state.get("flavourEvents")[event.act][event.prop][event.idx][2];
                return {event:eventData.event,scene:eventData.scene,type:eventData.type,char:event.char};
            }
            return false;
        },
        cycleWeek:function(props){
            Q.timeController.week ++;
            $("#hud-week").text(Q.timeController.week);
            //All characters that are wounded get reduced by 1
            var allies = Q.partyManager.allies;
            for(var i=0;i<allies.length;i++){
                this.reduceWounded(allies[i]);
            }
            /*
            
            //Find the event with the highest priority (lowest number)
            var event = potentialEvents.sort(function(a, b){return a[1] - b[1];})[0];
            console.log(event)*/
            
            var event = this.checkWeek(Q.timeController.week);
            if(event){
                Q.locationController.fullDestroy();
                var curEvent = Q.state.get("currentEvent");
                Q.state.set("anchorEvent",{event:curEvent.event,scene:curEvent.scene,type:curEvent.type});
                Q.startScene(event.type,event.scene,event.event,event.char);
            } else {
                //Start the next scene
                Q.startScene(props.next[0],props.next[1],props.next[2]);
            }
        }
    });
    /*
    Q.component("locationActions",{
        extend:{
            doAction:function(p){
                if(!p) return this.createMainMenu();
                this[p[2]](p[3]);
            },
            goBack:function(data){
                //this.changePage({page:this.p.currentPage});
                if(data) this[data.to](data.props);
                
            },
            changePage:function(p){
                this.p.lastPage = this.p.currentPage;
                this.p.currentPage = p.page;
                this.emptyConts();
                if(p.page==="start") return this.createActionsMenu();
                this.displayList(this.p.location[p.page]);
            },
            changeEvent:function(p){
                this.fullDestroy();
                Q.startScene(p[0],p[1],p[2]);
            },
            goToAnchorEvent:function(){
                this.fullDestroy();
                var anchor = Q.state.get("anchorEvent");
                Q.startScene(anchor.type,anchor.scene,anchor.event);
            },
            displayBuyItemsList:function(p){
                this.emptyConts();
                var list = p.list || this.p.list;
                var newList = [];
                list.forEach(function(itm,i){
                    switch(itm[0]){
                        case "Consumables":
                            newList.push([itm[1],"askBuyQuantity",{item:Q.state.get("items")[itm[1]],text:itm[1]}]); 
                            break;
                        case "Accessories":
                            newList.push([itm[1],"askBuyQuantity",{item:Q.state.get("equipment").gear[itm[1]],text:itm[1]}]);
                            break;
                        default:
                            var item = Q.charGen.convertEquipment([itm[3],itm[1]],itm[2]);
                            //Get the cost based on material and quality
                            newList.push([itm[2]+" "+itm[3]+" "+itm[1]+"   "+item.cost,"askBuyQuantity",{item:item,text:itm[2]+" "+itm[3]+" "+itm[1],list:list}]);
                            break;
                    }
                });
                this.displayList({actions:newList.concat([["Back",false,"goBack",["changePage",[this.p.currentPage]]]])});
                this.p.list = list;
            },
            askBuyQuantity:function(p){
                this.emptyConts();
                this.displayQuantityToggle({titleText:"Buy how many "+p.text+"? They cost "+p.item.cost+" each. You have "+Q.state.get("saveData").money+" money.",confirmText:"Confirm Buy",confirmFunc:"askBuy",item:p.item,text:p.text,goBack:{to:"displayBuyItemsList",props:{}}});
            },
            askBuy:function(props){
                this.emptyConts();
                //Check if we have enough money and display the correct text.
                var money = Q.state.get("saveData").money;
                var quantity = parseInt(props.quantity);
                if(money>=quantity*props.p.item.cost){
                    $(".mid-cont").text("Purchase "+quantity+" "+props.p.text+" for "+(quantity*props.p.item.cost)+" money?"+" You have "+money+" money.");
                    this.displayList({actions:[["Purchase",false,"buyItem",[quantity,props.p.item,props.p.text]],["Back",false,"goBack",["askBuyQuantity",[props.p]]]]});
                } else {
                    $(".mid-cont").append("You don't have enough money!");
                    this.displayList({actions:[["Back",false,"goBack",["askBuyQuantity",[props.p]]]]});
                }
            },
            buyItem:function(p){
                this.emptyConts();
                Q.state.get("Bag").addItem(p.item.kind,{amount:p.quantity,gear:p.item.name,material:p.item.material,quality:p.item.quality});
                Q.state.get("saveData").money -= p.quantity*p.item.cost;
                $(".mid-cont").text("You purchased the "+p.text+" for "+(p.quantity*p.item.cost)+" money.");
                this.displayList({actions:[["Back",false,"goBack",["changePage",[this.p.currentPage]]]]});
            },
            displaySellItemsList:function(p){
                this.emptyConts();
                var list = [];
                var bag = Q.state.get("Bag");
                switch(p.allow ? p.allow : "all"){
                    case "all":
                        var keys = Object.keys(bag.items);
                        keys.splice(keys.indexOf("Key"),1);
                        keys.forEach(function(k){
                            list = list.concat(bag.items[k]);
                        });
                        break;
                    case "items":
                        list = bag.items.Consumables;
                        break;
                    case "equipment":
                        list = bag.items.Weapons.concat(bag.items.Shields.concat(bag.items.Armour.concat(bag.items.Footwear.concat(bag.items.Accessories))));
                        break;
                }
                var newList = [];
                list.forEach(function(itm){
                    var text = itm.quality ? itm.quality+" "+itm.material+" "+itm.name : itm.name;
                    newList.push([text,"askSellQuantity",{item:itm,text:text}]);
                });
                this.displayList({actions:newList.concat([["Back",false,"goBack",["changePage",[this.p.currentPage]]]])});
            },
            askSellQuantity:function(p){
                this.emptyConts();
                this.displayQuantityToggle({titleText:"Sell how many "+p.text+" for "+Math.floor(p.item.cost/2)+" each.",confirmText:"Confirm Sell",confirmFunc:"askSell",item:p.item,text:p.text,goBack:{to:"displaySellItemsList",props:{allow:p.allow}}});
            },
            askSell:function(props){
                this.emptyConts();
                var quantity = parseInt(props.quantity);
                $(".mid-cont").text("Sell "+quantity+" "+props.p.text+" for "+Math.floor(quantity*props.p.item.cost/2)+"?");
                this.displayList({actions:[["Sell","sellItems",{quantity:parseInt(quantity),item:props.p.item}],["Back",false,"goBack",["askSellQuantity",[props.p]]]]});
            },
            sellItems:function(p){
                this.emptyConts();
                Q.state.get("Bag").decreaseItem(p.item.kind,{gear:p.item.name,material:p.item.material,quality:p.item.quality},p.quantity);
                Q.state.get("saveData").money += Math.floor(p.item.cost*p.quantity/2);
                this.changePage({page:this.p.currentPage});
            },
            
            checkConds:function(cond){
                var condsMet = true;
                if(cond){
                    for(var i=0;i<cond.length;i++){
                        condsMet = this["condFuncs"][cond[i][0]](cond[i][1]);
                        if(!condsMet) return condsMet;
                    }
                }
                return condsMet;
            },
            executeEffects:function(effects,p){
                for(var i=0;i<effects.length;i++){
                    this["effectFuncs"][effects[i][0]](effects[i][1],p);
                }
            },
            condFuncs:{
                checkVar:function(obj){
                    var varValue;
                    switch(obj[0]){
                        case "Event":
                            varValue = Q.state.get("eventVars")[obj[1]];
                            break;
                        case "Scene":
                            varValue = Q.state.get("sceneVars")[obj[1]];
                            break;
                        case "Global":
                            varValue = Q.state.get("globalVars")[obj[1]];
                            break;
                    }
                    return Q.textModules.evaluateStringOperator(varValue,obj[2],obj[3]);
                },
                checkCharProp:function(obj){
                    var char = Q.state.get("allies").find(function(ally){return ally.name === obj[0];});
                    if(!char) return false;
                    return Q.textModules.evaluateStringOperator(char[obj[1]],obj[2],obj[3]);
                },
                checkCharStat:function(obj){
                    var char = Q.state.get("allies").find(function(ally){return ally.name === obj[0];});
                    if(char){
                        var prop;
                        switch(obj[1]){
                            case "Base Stats":
                                prop = char.baseStats[obj[2]];
                                break;
                            case "Derived Stats":
                                prop = char.combatStats[obj[2]];
                                break;
                        }
                        return Q.textModules.evaluateStringOperator(prop,obj[3],obj[4]);
                    }
                },
                checkKeyword:function(obj){
                    switch(obj[0]){
                        case "partySize":
                            var size = Q.state.get("allies").length;
                            return Q.textModules.evaluateStringOperator(size,obj[1],obj[2]);
                    }
                }
            },
            effectFuncs:{
                setVar:function(obj){
                    Q.textModules.effectFuncs.setVar(obj);
                },
                changePage:function(obj){
                    Q.locationController.changePage(obj[0]);
                },
                changeEvent:function(obj){
                    Q.startScene(obj[0],obj[1],obj[2]);
                },
                addToRoster:function(obj){
                    var char = Q.charGen.generateCharacter(obj,"rosterFromFile");
                    Q.state.get("saveData").applicationsRoster.push(char);
                },
                enableChoice:function(obj,p){
                    for(var i=0;i<p.actions.length;i++){
                        if(p.actions[i][0]===obj[0]){
                            p.actions[i][1] = false;
                        }
                    }
                }
            }
        }
    });
    
    */
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
                scriptNum:0,
                
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
            this.modDialogueBox("hide");
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
            if(!this.p.script[this.p.groupNum]||!this.p.script[this.p.groupNum][this.p.scriptNum]) return;
            if(this.p.textIndex>this.p.script[this.p.groupNum][this.p.scriptNum][1][0][this.p.textNum].length-1){
                this.p.nextTextTri = this.stage.insert(new Q.NextTextTri({x:this.p.x+this.p.w/2,y:this.p.y+this.p.h}));
                this.off("step",this,"cycleText");
                return;
            }
            //Q.playSound("text_stream.mp3");
            $(this.p.textBox).text($(this.p.textBox).text()+this.p.text[this.p.textNum]);
            this.p.textIndex++;
        },
        next:function(){
            //Case that there are no actions (skip to the next event). This should not happen exept for testing as why would you even have an empty battleScene?
            if(!this.p.script.length){
                this.changeEvent(this.p.next[0],this.p.next[1],this.p.next[2]);
                return;
            } 
            if(this.p.scriptNum>=this.p.script[this.p.groupNum].length){
                this.p.groupNum++;
                this.p.scriptNum = 0;
            }
            //If we're finished
            if(!this.p.script[this.p.groupNum]){
                this.changeEvent(this.p.next[0],this.p.next[1],this.p.next[2]);
                return;
            }
            var data = this.p.script[this.p.groupNum][this.p.scriptNum];
            //If it's text
            if(data[0]==="text"){
                this.p.text = this.p.script[this.p.groupNum][this.p.scriptNum][1][2].split("\n\n")
                this.p.textNum = 0;
                this.p.textIndex = 0;
                $(this.p.leftImage).attr("src","images/story/"+data[1][0]);
                $(this.p.rightImage).attr("src","images/story/"+data[1][1]);
                $(this.p.textBox).text("");
                
                if(data[1][4]>0){
                    this.off("step",this,"checkInputs");
                    this.p.inputsTimer = data[1][4];
                    this.on("step",this,"waitForInputsTimer");
                    this.on("inputsTimerComplete",this,"activateAutoCycle");
                } else {
                    this.on("step",this,"cycleText");
                }
                if(data[1][5]) this.p.noCycle = true;
                this.modDialogueBox("show");
            } 
            //If it's a function
            else {
                console.log(data)
                //Do the function
                if(this[data[0]](this,data[1])){return;};
                //Go to the next script entry
                this.p.scriptNum++;
                this.next();
            }
        },
        //Runs the next text in the array of text
        nextText:function(){
            this.p.textNum++;
            //If we're at the end of the text array
            if(this.p.textNum>=this.p.text.length){
                this.p.scriptNum++;
                this.next();
                this.modDialogueBox("hide");
            } else {
                this.p.textIndex = 0;
                $(this.p.textBox).text("");
                this.on("step",this,"cycleText");
                this.modDialogueBox("show");
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
                    if(this.p.script[this.p.groupNum][this.p.scriptNum][0]!=="text") return;
                    //Check if the text is complete
                    if($(this.p.textBox).text().length===this.p.text[this.p.textNum].length){
                        if(this.p.nextTextTri) this.p.nextTextTri.destroy();
                        this.nextText();
                    } else {
                        $(this.p.textBox).text(this.p.text[this.p.textNum]);
                        this.p.textIndex = this.p.text[this.p.textNum].length;
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
        changeMusic:function(obj,props){
            Q.audioController.playMusic(props[0],function(){obj.forceCycle();});
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
        getChar:function(str){
            var id = str.split(" ");
            return this.getStoryCharacter(id[0],parseInt(id[1]));
        },
        //Get all characters on a certain team
        getStoryTeamCharacters:function(team){
            return Q.stage(0).lists.StoryCharacter.filter(function(char){
               return char.p.team===team; 
            });
        },
        waitTime:function(obj,props){
            setTimeout(function(){
                obj.forceCycle();
            },props[0]);
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
        centerViewLoc:function(obj,props){
            var spr = Q.stage(0).viewSprite;
            spr.p.loc = [props[0],props[1]];
            var speed = props[2];
            if(!speed){
                Q.BatCon.setXY(spr);
            } else {
                var pos = Q.BatCon.getXY(spr.p.loc);
                spr.animateTo(pos,speed/1000,function(){obj.forceCycle();});
            }
            return true;
        },
        //Tweens the viewport to the location
        centerViewChar:function(obj,props){
            this.p.cantCycle = true;
            this.p.noCycle = true;
            
            //Set the viewsprite to the current object that the viewport is following
            var spr = Q.stage(0).viewSprite;
            spr.p.obj = false;
            var to = this.getChar(props[0]);
            if(!props[1]){
                spr.p.loc = to.p.loc;
                Q.BatCon.setXY(spr);
                spr.followObj(to);
                obj.forceCycle();
            } else {
                spr.animateTo(to.p,props[1]/1000,function(){this.followObj(to);obj.forceCycle();});
            }
            return true;
            
        },
        //Changes the direction of a story character
        changeDir:function(obj,props){
            var obj = this.getChar(props[0]);
            obj.playStand(props[1]);
        },
        playAnim:function(obj,props){
            Q.audioController.playSound(props[3]);
            var char = this.getChar(props[0]);
            char.play(props[1]+props[2]);
        },
        changeMoveSpeed:function(obj,props){
            var obj = this.getChar(props[0]);
            obj.p.stepDelay = props[1]/1000;
        },
        playSound:function(obj,props){
            Q.audioController.playSound(props[0]);
            
        },
        //Moves a character along a path
        moveAlong:function(obj,props){
            var obj = this.getChar(props[0]);
            //If the is a function that should be played once the object reaches its destination
            obj.on("doneAutoMove",obj,function(){
                //If we have a new path, do it!
                this.playStand(props[1]);
                //If we're cycling on arrival
                if(props[2]){
                    Q.dialogueController.p.scriptNum++;
                    Q.dialogueController.next();
                }
                //Allow cycling to the next script item
                Q.dialogueController.p.noCycle = false;
            });
            obj.moveAlongPath(props[3]);
            this.p.noCycle = true;
            //If we're waiting on arrival
            return props[2];
        },
        //Fades a character in or out
        fadeChar:function(obj,props){
            var obj = this.getChar(props[0]);
            var speed = props[2]/1000;
            if(props[1]==="in"){
                obj.animate({opacity:1},speed,Q.Easing.Linear);
                obj.show();
            } else if(props[1]==="out"){
                obj.animate({opacity:0},speed,Q.Easing.Linear);
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
        animateTo:function(to,speed,callback){
            if(this.p.obj){
                this.p.obj = false;
                this.off("step","follow");
            }
            if(!speed){
                this.p.x = to.x;
                this.p.y = to.y;
                if(callback){
                    callback();
                }
            } else {
                this.animate({x:to.x,y:to.y},speed,Q.Easing.Quadratic.InOut,{callback:callback || function(){} });
            }
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

