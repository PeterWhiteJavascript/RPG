Quintus.UIObjects=function(Q){
    
    Q.GameObject.extend("PartyManager",{
        allies:[],
        roster:[],
        init:function(){
            
        },
        adjustTempStatChange:function(char,props){
            char.tempStatChanges.push(props);
            char.baseStats[props[0]] = Q.variableProcessor.evaluateStringOperator(char.baseStats[props[0]],props[1],props[2]);
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
        convertCombatStat:function(stat){
            switch(stat){
                case "Max Hit Points":
                    return "maxHp";
                case "Max Technique Points":
                    return "maxTp";
                case "Pain Tolerance":
                    return "painTolerance";
                case "Damage Reduction":
                    return "damageReduction";
                case "Physical Resistance":
                    return "physicalResistance";
                case "Mental Resistance":
                    return "mentalResistance";
                case "Magical Resistance":
                    return "magicalResistance";
                case "Attack Range":
                    return "atkRange";
                case "Max Attack Damage":
                    return "maxAtkDmg";
                case "Encumbrance Threshold":
                    return "encumbranceThreshold";
                case "Total Weight":
                    return "totalWeight";
                case "Encumbrance Penalty":
                    return "encumbrancePenalty";
                case "Defensive Ability":
                    return "defensiveAbility";
                case "Attack Accuracy":
                    return "atkAccuracy";
                case "Critical Chance":
                    return "critChance";
                case "Counter Chance":
                    return "counterChance";
                case "Attack Speed":
                    return "atkSpeed";
                case "Move Speed":
                    return "moveSpeed";
            }
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
            Object.assign(obj.vars.Global,GDATA.game['global-vars.json'].vrs);
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
                    this.vars[scope][vr] = Q.variableProcessor.evaluateStringOperator(this.vars[scope][vr],op,vl);
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
                case "==": return vr==vl;
                case "!=": return vr!=vl;
                case ">": return vr>vl;
                case "<": return vr<vl;
                case ">=": return vr>=vl;
                case "<=": return vr<=vl;
            }
        },
        getDeepValue:function(obj, path){
            for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
                obj = obj[path[i]];
            };
            return obj;
        },
        //Takes a string and evaluates anything within {} and then returns a new string
        replaceText:function(text){
            //Loop through each {}
            while(text.indexOf("{") !== -1){
                text = text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                    return Q.textProcessor.getVarValue(p1);
                });
            }
            return text;
           
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
                        newText = GDATA.game["modules.json"].gender[Q.partyManager.alex.gender][prop];
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
            console.log(conds,required)
            for(var i=0;i<conds.length;i++){
                var func = conds[i][0];
                var props = conds[i][1];
                switch(func){
                    case "checkVar":
                        var scope = props[0];
                        var vr = Q.variableProcessor.getVar(scope,props[1]);
                        var op = props[2];
                        var vl = props[3];
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
                        Q.variableProcessor.setVar(props[0],props[1],props[2],props[3],Q.state.get("currentEvent").scene,Q.state.get("currentEvent").event);
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
                        obj.currentPage.choices.find(function(choice){return props[0] === choice[0];})[1] = false;
                        break;
                    case "disableChoice":
                        obj.currentPage.choices.find(function(choice){return props[0] === choice[0];})[1] = true;
                        break;
                    //Flavour only. Sends back to event that happened before triggering the flavour event.
                    case "goToAnchorEvent":
                        
                        break;
                    case "recruitChar":
                        //Adds the character to the party
                        break;
                    case "changeInfluence":
                        Q.partyManager.influence[props[0]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.influence[props[0]],props[1],props[2],0,100);
                        console.log(props,Q.partyManager.influence)
                        break;
                    case "changeRelation":
                        Q.partyManager.relations[props[0]][props[1]] = Q.variableProcessor.evaluateStringOperator(Q.partyManager.relations[props[0]][props[1]],props[2],props[3],0,100);
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
    /*
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
                                prop = char.combatStats[Q.convertCombatStat(obj[2])];
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
                }*/
    Q.GameObject.extend("StoryController",{
        init:function(){
            var cont = $('<div id="text-cont"></div>');
            var text = $('<div id="text-content"></div>');
            cont.append(text);
            $("#main-content").append(cont);
        },
        //When a story event starts, set data and show the container.
        startEvent:function(data){
            this.data = data;
            this.displayPage(data.pages[0].name);
            $("#text-cont").show();
        },
        finishEvent:function(){
            $("#text-cont").hide();
        },
        getPageData:function(name){
            return this.data.pages.filter(function(page){return page.name === name; })[0];
        },
        getPageParagraph:function(text){
            var cont = $("<div class='page-text'>"+Q.textProcessor.makeParagraphs(text)+"</div>");
            return cont;
        },
        getChoice:function(name){
            return this.currentPage.choices.find(function(choice){return choice[0] === name});
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
                    $(cont).append("<div class='page-choice'><span>"+choices[i][0]+"</span></div>");
                    $(cont).children(".page-choice").last().click(function(){
                        Q.storyController.selectChoice($(this).text());
                    });
                }
            }
            return cont;
        },
        newPage:function(data){
            var cont = $("<div class='page'></div>");
            $(cont).append(this.getPageParagraph(data.text));
            $(cont).append(this.getPageChoices(data.choices));
            return cont;
        },
        displayPage:function(name){
            this.currentPage = this.getPageData(name);
            Q.groupsProcessor.processGroups(this.currentPage.onload,this);
            $("#text-content").append(this.newPage(this.currentPage));
        },
        changePage:function(name){
            $("#text-content").children(".page").remove();
            this.displayPage(name);
        },
        changeEvent:function(props){
            this.finishScene();
            Q.startScene(props[0],props[1],props[2]);
        }
    });
    
    
    Q.component("time",{
        added:function(){
            this.entity.on("cycleWeek",this,"cycleWeek");
        },
        reduceWounded:function(char){
            char.wounded--;
            if(!char.wounded){
                char.combatStats.hp = char.combatStats.maxHp;
            }
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
        cycleWeek:function(){
            Q.state.get("saveData").week++;
            //All characters that are wounded get reduced by 1
            var allies = Q.state.get("allies");
            for(var i=0;i<allies.length;i++){
                this.reduceWounded(allies[i]);
            }
            /*
            
            //Find the event with the highest priority (lowest number)
            var event = potentialEvents.sort(function(a, b){return a[1] - b[1];})[0];
            console.log(event)*/
            
            var event = this.checkWeek(Q.state.get("saveData").week);
            console.log(event)
            if(event){
                Q.locationController.fullDestroy();
                var curEvent = Q.state.get("currentEvent");
                Q.state.set("anchorEvent",{event:curEvent.event,scene:curEvent.scene,type:curEvent.type});
                Q.startScene(event.type,event.scene,event.event,event.char);
            } else {
                Q.locationController.createMainMenu();
            }
        }
    });
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
                                prop = char.combatStats[Q.convertCombatStat(obj[2])];
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
            this.add("locationActions");
            this.add("time");
        },
        fullDestroy:function(){
            this.emptyConts();
            $(this.p.menuCont).remove();
            $(this.p.leftCont).remove();
            $(this.p.midCont).remove();
            this.destroy();
        },
        inserted:function(){
            this.p.menuCont = this.createCont("main-menu");
            this.p.midCont = this.createCont("mid-cont");
            this.p.leftCont = this.createCont("left-cont");
            $(this.p.leftCont).hide();
            this.createMainMenu();
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
            /*cont.append(
                '<ul id="main-menu-ul">\n\
                    <li id="lc-entourage" class="btn btn-default" func="createEntourageMenu">Entourage</li>\n\
                    <li id="lc-briony" class="btn btn-default" func="createBrionyMenu">Briony</li>\n\
                    <li id="lc-select-action" class="btn btn-default" func="createActionsMenu">Actions</li>\n\
                    <li id="lc-log" class="btn btn-default" func="createLogMenu">Log</li>\n\
                    <li id="lc-options" class="btn btn-default" func="createOptionsMenu">Options</li>\n\
                </ul>'
            );*/
            cont.append(
                '<ul id="main-menu-ul">\n\
                    <li id="lc-select-action" class="btn btn-default" func="createActionsMenu">Actions</li>\n\
                    <li id="lc-entourage" class="btn btn-default" func="createEntourageMenu">Entourage</li>\n\
                    <li id="lc-log" class="btn btn-default" func="createLogMenu">Log</li>\n\
                </ul>'
            );
            $("#main-menu-ul li").click(function(){
                Q.locationController[$(this).attr("func")]();
            });
        },
        createEntourageMenu:function(){
            this.emptyConts();
            var cont = this.p.menuCont;
            /*
            cont.append(
                '<ul id="entourage-menu-ul">\n\
                    <li id="en-taskforce" class="btn btn-default" func="createTaskforceMenu">Taskforce</li>\n\
                    <li id="en-cash-bonus" class="btn btn-default" func="createCashBonusMenu">Cash Bonus</li>\n\
                    <li id="en-distribute-gear" class="btn btn-default" func="createDistributeGearMenu">Equip</li>\n\
                    <li id="en-back" class="btn btn-default" func="createMainMenu">Back</li>\n\
                </ul>'
            );
             */
            cont.append(
                '<ul id="entourage-menu-ul">\n\
                    <li id="en-distribute-gear" class="btn btn-default" func="createDistributeGearMenu">Equip</li>\n\
                    <li id="en-infirmary" class="btn btn-default" func="createInfirmaryMenu">Infirmary</li>\n\
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
        createInfirmaryMenu:function(){
            this.emptyConts();
            var cont = this.p.midCont;
            
            var cont = this.p.leftCont;
            cont.append('<ul id="left-menu-ul"></ul>');
            //Generate list of characters at 0 hp.
            var chars = Q.state.get("allies").filter(function(ally){
                return ally.combatStats.hp===0;
            });
            if(!chars.length){
                alert("There are no characters that are wounded!");
                this.createEntourageMenu();
                return;
            }
            chars.forEach(function(char){
                $("#left-menu-ul").append('<li id="'+char.name+'" class="character btn btn-default">'+char.name+'</li>');
            });
            var t = this;
            $(".character").on("click",function(){
                $('.character').removeClass("selected-color");
                $(this).addClass("selected-color");
                var name = $(this).attr("id");
                var target = Q.state.get("allies").filter(function(a){
                    return a.name===name;
                })[0];
                t.showRecruitCharacterCard(t,target);
                t.p.selectedAlly = target;
            });
            $(".character").first().trigger("click");
            this.p.leftCont.show();
            this.showRecruitCharacterCard(this,chars[0]);
            var infirmaryActions = [
                [
                    "Visit",
                    "infirmaryVisitCharacter"
                ],
                [
                    "Back",
                    "createEntourageMenu"
                ]
            ];
            this.displayList({actions:infirmaryActions});
        },
        infirmaryVisitCharacter:function(){
            var ally = this.p.selectedAlly;
            ally.loyalty = Math.min(ally.loyalty+10,100);
            Q.setAward(ally,"visited",1);
            this.time.reduceWounded(ally);
            this.addToPotentialEvents(ally,"infirmary");
            this.trigger("cycleWeek");
        },
        addToPotentialEvents:function(char,prop){
            /* OLD FLAVOUR EVENTS CODE. WILL NEED TO BE COMPLETELY REDONE
            var evaluateProp = function(d,char){
                if(!d) return true;
                var success = true;
                var keys = Object.keys(d);
                //Loop through each condition. All must evaluate true to continue.
                keys.forEach(function(key){
                    //The character's var value
                    var value = key.split('.').reduce(Q.textModules.getObjPathFromString,char);
                    var toMatch = d[key];
                    if(Q._isArray(toMatch)){
                        if(!Q.textModules.evaluateStringOperator(value,toMatch[0],toMatch[1])) success = false;
                    } else {
                        if(toMatch !== value) success = false;
                    }
                });
                return success;
            };
            var eventCompleted = function(act,prop,idx,char){
                //Will be 0 if the event was not completed yet.
                return char.completedEvents.filter(function(event){
                    return event.act === act && event.prop === prop && event.idx === idx;
                }).length;
            };
            var checkEvents = function(act,prop,char,idx){
                var data = act.split('.').reduce(Q.textModules.getObjPathFromString,Q.state.get("flavourEvents"))[prop][idx];
                if(evaluateProp(data[0],char)&&!eventCompleted(act,prop,idx,char)){
                    return {act:act,prop:prop,idx:idx,priority:data[1],recur:data[3],char:char};
                };
                return false;
            };
            var act = "Act-"+Q.state.get("saveData").act;
            var events = Q.state.get("flavourEvents");
            //Loop through the events that haven't been played and find the most suitable
            var potentialEvents = [];
            //Regular act events
            if(events[act][prop]){
                for(var i=0;i<events[act][prop].length;i++){
                    var data = checkEvents(act,prop,char,i);
                    if(data) potentialEvents.push(data);
                }
            }
            //'All' act events
            if(events["All"][prop]){
                for(var i=0;i<events["All"][prop].length;i++){
                    var data = checkEvents("All",prop,char,i);
                    if(data) potentialEvents.push(data);
                }
            }
            Q.state.set("potentialEvents",Q.state.get("potentialEvents").concat(potentialEvents));*/
        },
        createDistributeGearMenu:function(){
            this.emptyConts();
            var actions = [];
            var allies = Q.state.get("allies");
            allies.forEach(function(ally){
                actions.push([ally.name,"fillEquipMenu",ally]);
            });
            actions.push(["Back",false,"createEntourageMenu",[]]);
            this.displayList({actions:actions});
            var cont = this.p.midCont;
            cont.append('\n\
                <div id="equip-menu">\n\
                    <div id="equip-menu-left"><img></div>\n\
                    \n\
                    <div id="equip-menu-mid">\n\
                        <ul>\n\
                            <li>Right Hand</li>\n\
                            <li>Left Hand</li>\n\
                            <li>Body</li>\n\
                            <li>Feet</li>\n\
                            <li>Accessory</li>\n\
                        </ul>\n\
                    </div>\n\
                    <div id="equip-menu-right">\n\
                        <ul>\n\
                            <li><select id="equip-right-hand" class="equip-select">'+this.fillHandsSelect(allies[0].equipment.righthand)+'</select></li>\n\
                            <li><select id="equip-left-hand" class="equip-select">'+this.fillHandsSelect(allies[0].equipment.lefthand)+'</select></li>\n\
                            <li><select id="equip-armour" class="equip-select">'+this.fillArmourSelect(allies[0].equipment.armour)+'</select></li>\n\
                            <li><select id="equip-footwear" class="equip-select">'+this.fillFootwearSelect(allies[0].equipment.footwear)+'</select></li>\n\
                            <li><select id="equip-accessory" class="equip-select">'+this.fillAccessorySelect(allies[0].equipment.accessory)+'</select></li>\n\
                        </ul>\n\
                    </div>\n\
                </div>\n\
            ');
            this.fillEquipMenu(allies[0]);
            //Removes the selected item from the bag, add the item to the character, remove what was equipped and add to bag.
            $(".equip-select").on("change",function(){
                var thisID = $(this).attr("id");
                var char = Q.locationController.p.selectedAlly;
                if(thisID==="equip-accessory"){
                    Q.state.get("Bag").unequipItem(char,"accessory","toBag");
                    Q.state.get("Bag").equipItem(char,"accessory",$(this).find(":selected").attr("name"));
                } else {
                    var quality = $(this).find(":selected").attr("quality");
                    var material = $(this).find(":selected").attr("material");
                    var name = $(this).find(":selected").attr("name");
                    if(thisID==="equip-right-hand"){
                        Q.state.get("Bag").unequipItem(char,"righthand","toBag");
                        Q.state.get("Bag").equipItem(char,"righthand",name,material,quality);
                        $("#equip-left-hand").empty();
                        $("#equip-left-hand").append(Q.locationController.fillHandsSelect(char.equipment.lefthand));
                        Q.locationController.fillHandsSelect(char.equipment.lefthand);
                    } else if(thisID==="equip-left-hand"){
                        Q.state.get("Bag").unequipItem(char,"lefthand","toBag");
                        Q.state.get("Bag").equipItem(char,"lefthand",name,material,quality);
                        $("#equip-right-hand").empty();
                        $("#equip-right-hand").append(Q.locationController.fillHandsSelect(char.equipment.righthand));
                    } else if(thisID==="equip-armour"){
                        Q.state.get("Bag").unequipItem(char,"armour","toBag");
                        Q.state.get("Bag").equipItem(char,"armour",name,material,quality);
                    } else {
                        Q.state.get("Bag").unequipItem(char,"footwear","toBag");
                        Q.state.get("Bag").equipItem(char,"footwear",name,material,quality);
                    }
                }
                Q.locationController.fillEquipMenu(char);
            });
        },
        fillHandsSelect:function(ha){
            var opts = '<option>None</option>';
            var eq = Q.state.get("Bag").items.Weapons.concat(Q.state.get("Bag").items.Shields);
            if(ha) eq.unshift(ha);
            eq.forEach(function(e){
                opts += '<option quality="'+e.quality+'" material="'+e.material+'" name="'+e.name+'">'+e.quality+' '+e.material+' '+e.name+'</option>';
            });
            return opts;
        },
        fillArmourSelect:function(ar){
            var opts = '<option>None</option>';
            var eq = Q.state.get("Bag").items.Armour;
            if(ar) eq.unshift(ar);
            eq.forEach(function(e){
                opts += '<option quality="'+e.quality+'" material="'+e.material+'" name="'+e.name+'">'+e.quality+' '+e.material+' '+e.name+'</option>';
            });
            return opts;
        },
        fillFootwearSelect:function(ft){
            var opts = '<option>None</option>';
            var eq = Q.state.get("Bag").items.Footwear;
            if(ft) eq.unshift(ft);
            eq.forEach(function(e){
                opts += '<option quality="'+e.quality+'" material="'+e.material+'" name="'+e.name+'">'+e.quality+' '+e.material+' '+e.name+'</option>';
            });
            return opts;
        },
        fillAccessorySelect:function(ac){
            var opts = '<option>None</option>';
            var eq = Q.state.get("Bag").items.Accessories;
            if(ac) eq.unshift(ac);
            eq.forEach(function(e){
                opts += '<option name="'+e.name+'">'+e.name+'</option>';
            });
            return opts;
        },
        fillEquipMenu:function(ally){
            var lastAlly = this.p.selectedAlly;
            if(lastAlly){
                var opts = ["right-hand","left-hand","armour","footwear"];
                var vals = ["righthand","lefthand","armour","footwear"];
                opts.forEach(function(o,i){
                    $("#equip-"+o+" option").each(function() {
                        if($(this).val()===lastAlly.equipment[vals[i]].quality+' '+lastAlly.equipment[vals[i]].material+' '+lastAlly.equipment[vals[i]].name){
                            $(this).remove();
                        }
                    });
                });
                $("#equip-accessory option").each(function() {
                    if($(this).val()===lastAlly.equipment.accessory.name){
                        $(this).remove();
                    }
                });
            }
            this.p.selectedAlly = ally;
            //Add this ally's equipment options
            if(ally.equipment.righthand) $("#equip-right-hand").append($('<option quality="'+ally.equipment.righthand.quality+'" material="'+ally.equipment.righthand.material+'" name="'+ally.equipment.righthand.name+'">'+ally.equipment.righthand.quality+' '+ally.equipment.righthand.material+' '+ally.equipment.righthand.name+'</option>'));
            if(ally.equipment.lefthand) $("#equip-left-hand").append($('<option quality="'+ally.equipment.lefthand.quality+'" material="'+ally.equipment.lefthand.material+'" name="'+ally.equipment.lefthand.name+'">'+ally.equipment.lefthand.quality+' '+ally.equipment.lefthand.material+' '+ally.equipment.lefthand.name+'</option>'));
            if(ally.equipment.armour) $("#equip-armour").append($('<option quality="'+ally.equipment.armour.quality+'" material="'+ally.equipment.armour.material+'" name="'+ally.equipment.armour.name+'">'+ally.equipment.armour.quality+' '+ally.equipment.armour.material+' '+ally.equipment.armour.name+'</option>'));
            if(ally.equipment.footwear) $("#equip-footwear").append($('<option quality="'+ally.equipment.footwear.quality+'" material="'+ally.equipment.footwear.material+'" name="'+ally.equipment.footwear.name+'">'+ally.equipment.footwear.quality+' '+ally.equipment.footwear.material+' '+ally.equipment.footwear.name+'</option>'));
            if(ally.equipment.accessory) $("#equip-accessory").append($('<option name="'+ally.equipment.accessory.name+'">'+ally.equipment.accessory.name+'</option>'));
            
            $("#equip-menu-left img").attr("src","images/sprites/"+ally.charClass.toLowerCase()+".png");
            $("#equip-right-hand").val(ally.equipment.righthand ? ally.equipment.righthand.quality+" "+ally.equipment.righthand.material+" "+ally.equipment.righthand.name : "None");
            $("#equip-left-hand").val(ally.equipment.lefthand ? ally.equipment.lefthand.quality+" "+ally.equipment.lefthand.material+" "+ally.equipment.lefthand.name : "None");
            $("#equip-armour").val(ally.equipment.armour ? ally.equipment.armour.quality+" "+ally.equipment.armour.material+" "+ally.equipment.armour.name : "None");
            $("#equip-footwear").val(ally.equipment.footwear ? ally.equipment.footwear.quality+" "+ally.equipment.footwear.material+" "+ally.equipment.footwear.name : "None");
            $("#equip-accessory").val(ally.equipment.accessory ? ally.equipment.accessory.name : "None");
            
        },
        createBrionyMenu:function(){
            
        },
        createActionsMenu:function(){
            this.emptyConts();
            this.p.currentPage = "start";
            this.p.action = 0;
            this.displayList({actions:this.p.location.actions.concat([["Back",false,"createMainMenu",[]]]),onload:this.p.location.onload});
        },
        displayQuantityToggle:function(p){
            var cont = this.p.menuCont;
            cont.append('<div>'+p.titleText+'</div><ul id="actions-menu-ul"></ul>');
            $("#actions-menu-ul").append('\n\
                <li><input type="number" min=1 max='+(p.item.amount || 99)+' class="menu-input" value=1></li>\n\
                <li id="confirm-quantity" class="btn btn-default" func="'+p.confirmFunc+'">'+p.confirmText+'</li>\n\
                <li id="quantity-go-back" class="btn btn-default">Back</li>\n\
                ');
            $("#confirm-quantity").click(function(){
                Q.locationController[$("#confirm-quantity").attr("func")]({quantity:$("#actions-menu-ul li input").first().val(),p:p});
            });
            $("#quantity-go-back").click(function(){
                Q.locationController.goBack(p.goBack);
            });
        },
        displayList:function(p){
            if(p.onload){
                for(var i=0;i<p.onload.length;i++){
                    var group = p.onload[i];
                    if(this.checkConds(group.conds)){
                        this.executeEffects(group.effects,p);
                    };
                }
                
            }
            var actions = p.actions.slice();
            var cont = this.p.menuCont;
            cont.append('<ul id="actions-menu-ul"></ul>');
            for(var i=0;i<actions.length;i++){
                if(!actions[i][1]){
                    $("#actions-menu-ul").append('<li id="ac-'+actions[i][2]+'" class="btn btn-default" num="'+i+'">'+actions[i][0]+'</li>');
                }
            }
            $("#actions-menu-ul li").click(function(){
                Q.locationController.doAction(actions[$(this).attr("num")]);
            });
        },
        createFundraiseMenu:function(){
            
        },
        createCampaignMenu:function(){
            
        },
        getCharacterCost:function(char){
            var rh = Q.charGen.getEquipmentProp("cost",char.equipment.righthand);
            var lh = Q.charGen.getEquipmentProp("cost",char.equipment.lefthand);
            var ar = Q.charGen.getEquipmentProp("cost",char.equipment.armour);
            var ft = Q.charGen.getEquipmentProp("cost",char.equipment.footwear);
            var baseStats = 0;
            Object.keys(char.baseStats).forEach(function(itm){baseStats+=char.baseStats[itm];});
            var base = 100;
            return char.level*20+rh+lh+ar+ft+baseStats+base;
        },
        recruitCharacter:function(){
            var character = Q.state.get("saveData").applicationsRoster.filter(function(a){
                return a.name===$(".character.selected-color").attr("id");
            })[0];
            var cost = this.getCharacterCost(character);
            var money = Q.state.get("saveData").money;
            if(money>=cost){
                Q.state.get("saveData").money-=cost;
                Q.state.get("allies").push(character);
                Q.state.get("saveData").applicationsRoster.splice(Q.state.get("saveData").applicationsRoster.indexOf(character),1);
                if(Q.state.get("saveData").applicationsRoster.length){
                    this.createRecruitMenu();
                } else {
                    $("#co-back").trigger("click");
                }
            } else {
                alert("You don't have "+cost+" money!");
            }
        },
        showRecruitCharacterCard:function(obj,target){
            if(this.p.characterMenu) this.p.characterMenu.destroy();
            this.p.characterMenu = this.stage.insert(new Q.BigStatusBox({target:{p:target}}));
        },
        createRecruitMenu:function(){
            this.emptyConts();
            $(this.p.leftCont).show();
            var available = Q.state.get("saveData").applicationsRoster;
            var cont = this.p.leftCont;
            cont.append('<ul id="left-menu-ul"></ul>');
            for(var i=0;i<available.length;i++){
                $("#left-menu-ul").append('<li id="'+available[i].name+'" class="character btn btn-default">'+available[i].name+'</li>');
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
                var cost = t.getCharacterCost(Q.state.get("saveData").applicationsRoster.filter(function(a){
                    return a.name===$(".character.selected-color").attr("id");
                })[0]);
                $("#co-recruit").text("Recruit for "+cost);
            });
            
            this.p.menuCont.append(
                '<ul id="confirm-recruit-menu-ul">\n\
                    <li id="co-recruit" class="btn btn-default" func="recruitCharacter">Recruit</li>\n\
                    <li id="co-back" class="btn btn-default" func="createActionsMenu">Back</li>\n\
                </ul>'
            );
            $(".character").first().trigger("click");
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
            this.p.characterMenu = this.stage.insert(new Q.BigStatusBox({target:{p:char}}));
        },
        removeCharacterMenu:function(){
            this.p.characterMenu.destroy();
            this.createMainMenu();
        },
        createOptionsMenu:function(){
            
        }
    });
    
    
    /*
    //Using CSS/Jquery, create the story dialogue with options
    Q.GameObject.extend("StoryController",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                w:Q.width/2,
                h:Q.height-100
            });
            this.p.x+=10;
            this.p.y+=10;
            this.p.container = ;
            this.p.textContent = ;
            $(this.p.container).append(this.p.textContent);
            $(document.body).append(this.p.container);
            this.insertPage(0);
        },
        insertPage:function(num){
            var page = this.p.pages[num];
            console.log(page)
            //Do the onload conditions/effects
            Q.textModules.processCondEffects(this,page.onload);
            if(!this.p.changedPage){
                //Make the background correct
                this.p.bgImage.p.asset = page.bg;
                //Play the music for the page
                Q.playMusic(page.music);
                var txt = this.beautifyText(Q.textModules.processTextVars(page.text));
                var contentBox = this.p.textContent;
                if(txt.length) $(contentBox).append('<p>'+txt+'</p>');
                //Show the choices
                $(contentBox).append('<ul class="choice-list"></ul>');
                page.choices.forEach(function(choice){
                    if(choice.disabled==="Enabled"){
                        $(contentBox).children(".choice-list").last().append('<li>'+choice.displayText+'</li>');
                    }
                });
            } else {
                this.p.changedPage = false;
            }
        },
        beautifyText:function(txt){
            //Split up all of the text by paragraph into an array(at \n)
            var beau = txt.split("\n").filter(
                    //Remove any \n that has no text in it
                    function(itm){
                        return itm.length;
                    //Rework the items into paragraphs.
                    }).map(function(itm){
                        var pClass = "story";
                        if(itm[0]==="\"") pClass = "dialogue";
                        return "<p class='"+pClass+"'>"+itm+"</p>";
                    //Join the array back into a string
                    }).join(" ");
            if(beau.length) beau = "<div class='text-header-line'></div>"+beau;
            return beau;
        },
        insertChoiceDesc:function(desc){
            //this.removePage();
            this.removeChoices();
            var contentBox = this.p.textContent;
            var txt = this.beautifyText(Q.textModules.processTextVars(desc));
            if(txt.length) $(contentBox).append('<p>'+txt+'</p>');
            
        },
        removeChoices:function(){
            $(".choice-list").remove();
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
            //this.removePage();
            this.insertPage(pageNum);
        },
        getChoice:function(page,choice){
            return page.choices.filter(function(ch){
                return ch.displayText===choice;
            })[0];
        },
        effectFuncs:{
            setVar:function(t,obj){
                Q.textModules.effectFuncs.setVar(t,obj);
            },
            changePage:function(t,obj){
                t.changePage(obj.page);
                t.p.changedPage = true;
            },
            enableChoice:function(t,obj){
                //Find the page choice and enable or disable it.
                t.getChoice(t.p.pages[t.p.pageNum],obj.choice).disabled = obj.toggle;
            },
            changeEvent:function(t,obj){
                Q.startScene(obj.type,obj.scene,obj.event);
                $("#text-container").remove();
            },
            goToAnchorEvent:function(){
                var anchor = Q.state.get("anchorEvent");
                Q.startScene(anchor.type,anchor.scene,anchor.event);
                $("#text-container").remove();
            },
            recruitChar:function(t,obj){
                var data = Q.state.get("characters")[obj.name];
                var char = Q.charGen.generateCharacter(data,"officer");
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
            },
            tempStatChange:function(t,obj){
                obj.val = parseInt(obj.val);
                var char = Q.state.get("allies").filter(function(ally){return ally.name===obj.char;})[0];
                if(!char) return;
                char.tempStatChange[obj.stat] += obj.val;
                char.eachTempStatChange.push(obj);
            },
            equipItem:function(t,obj){
                if(obj.char==="Bag"){
                    Q.state.get("Bag").addItem(obj.eqType,{gear:obj.gear,material:obj.material,quality:obj.quality});
                    return;
                }
                var eq = Q.charGen.convertEquipment([obj.material,obj.gear],obj.quality);
                var char = Q.state.get("allies").filter(function(ally){return ally.name===obj.char;})[0];
                if(!char) return;
                switch(obj.eqType){
                    case "Weapons":
                    case "Shields":
                        Q.state.get("Bag").unequipItem(char,"righthand","toBag");
                        char.equipment.righthand = eq;
                        break;
                    case "Armour":
                        Q.state.get("Bag").unequipItem(char,"armour","toBag");
                        char.equipment.armour = eq;
                        break;
                    case "Footwear":
                        Q.state.get("Bag").unequipItem(char,"footwear","toBag");
                        char.equipment.footwear = eq;
                    break;
                    case "Accesories":
                        Q.state.get("Bag").unequipItem(char,"accessory","toBag");
                        char.equipment.accessory = eq;
                        break;
                }
                var hp = char.combatStats.hp;
                var tp = char.combatStats.tp;
                char.combatStats = Q.charGen.getCombatStats(char);
                char.combatStats.hp = hp;
                char.combatStats.tp = tp;
            },
            unequipItem:function(t,obj){
                var char = Q.state.get("allies").filter(function(ally){return ally.name===obj.char;})[0];
                if(!char) return;
                if(obj.from==="all"){
                    var keys = Object.keys(char.equipment);
                    keys.forEach(function(k){
                        char.equipment[k] = false;
                    });
                }
                else {
                    Q.state.get("Bag").unequipItem(char,obj.from,obj.options);
                }
            },
            changeItemQuantity:function(t,obj){
                if(obj.amount<0){
                    Q.state.get("Bag").decreaseItem("Consumables",{gear:obj.name},parseInt(obj.amount));
                } else {
                    Q.state.get("Bag").addItem("Consumables",{gear:obj.name,amount:parseInt(obj.amount)});
                }    
            }
        }
    });*/
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
            Q.playMusic(props[0],function(){obj.forceCycle();});
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
            Q.playSound(props[0]);
            this.getChar(props[0]);["play"+anim](dir);
        },
        changeMoveSpeed:function(obj,props){
            var obj = this.getChar(props[0]);
            obj.p.stepDelay = props[1]/1000;
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

