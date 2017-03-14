Quintus.UIObjects=function(Q){
    $(function(){
        //When clicking a choice
        $('body').on('click', '.choice-div', function() {
            Q.storyController.p.choice = Q.storyController.p.pages[Q.storyController.p.pageNum].choices[$(".choice-div").index(this)];
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
            
        },
        inserted:function(){
            this.createCont("main-menu");
            this.createMainMenu();
        },
        createCont:function(cl){
            var cont = $('<div class='+cl+'></div>');
            $(document.body).append(cont);
            this.p.menuCont = cont;
        },
        createMainMenu:function(){
            var cont = this.p.menuCont;
            cont.empty();
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
            var cont = this.p.menuCont;
            cont.empty();
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
            var actions = this.p.location.actions;
            var cont = this.p.menuCont;
            cont.empty();
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
        createRecruitMenu:function(){
            
        },
        createFeastMenu:function(){
            
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
            var chars = Q.state.get("allies");
            var cont = this.p.menuCont;
            cont.empty();
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
            
        },
        removeMenu:function(menu){
            $(menu).empty();
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
            this.on("inserted");
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
            var text = $('<div>'+this.processTextVars(page.text)+'</div>');
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
            $(contentBox).append('<div>'+desc+'</div>');
            
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
        //Finds a var
        matchVar:function(text){
            var t = this;
            var replaceVar = function(text,c){
                return text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                    return processTextVarInstance(p1,c);
                });
            };
            var processTextVarInstance = function(text,character){
                var affected = text.slice(0,text.indexOf("@"));
                var prop = text.slice(text.indexOf("@")+1,text.length);
                var varText = "";
                switch(affected){
                    //Event var
                    case "e":
                        
                        break;
                    //Scene var
                    case "s":
                        
                        break;
                    //Global var
                    case "g":
                        prop.split('.').reduce(t.getObjPathFromString,Q.state.get("globalVars").vrs);
                        break;
                    //The save data (in the game state)
                    case "save":
                        return prop.split('.').reduce(t.getObjPathFromString,Q.state.get("saveData"));
                    break;
                    //Affected is not one of the above. It is a character
                    default:
                        var intAffected = parseInt(affected);
                        var char;
                        //Affecting a certain property of a character
                        if(isNaN(intAffected)){
                            char = character;
                            return prop.split('.').reduce(t.getObjPathFromString, char);
                        }
                        char = t.p.characters[intAffected];
                        //Character specific text
                        if(char.officer){
                            varText = prop.split('.').reduce(t.getObjPathFromString,Q.state.get("characters")[affected].modules);
                            //Run this first.
                            var newText = replaceVar(varText,char);
                            //If there's more, do it again.
                            while(newText.indexOf("{")>=0){
                                var newText = replaceVar(newText,char);    
                            }
                            return varText;
                        }
                        //CharClass specific text
                        else {
                            varText = prop.split('.').reduce(t.getObjPathFromString,Q.state.get("charClasses")[char.charClass].modules);
                            //Run this first.
                            var newText = replaceVar(varText,char);
                            //If there's more, do it again.
                            while(newText.indexOf("{")>=0){
                                var newText = replaceVar(newText,char);    
                            }
                            return newText;
                        }
                        break;
                }
                return varText;
            };
            //Find any variables and replace the string with the values
            var replacedText = text.replace(/\{(.*?)\}/,function(match, p1, p2, p3, offset, string){
                return processTextVarInstance(p1);
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
                var textMatched = this.matchVar(newText);
                if(textMatched) newText = textMatched;
            } while(textMatched);
            return newText;
        },
        checkConds:function(cond){
            var condsMet = true;
            if(cond){
                //Loop through each condition
                for(var i=0;i<cond.length;i++){
                    //Run the condition's function (idx 0) with properties (idx 1)
                    condsMet = this["condFuncs"][cond[i][0]](this,cond[i][1]);
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
        inserted:function(){
            this.insertPage(this.p.pageNum);
        },
        getChoice:function(page,choice){
            return page.choices.filter(function(ch){
                return ch.displayText===choice;
            })[0];
        },
        condFuncs:{
            checkVar:function(t,obj){
                var vars;
                switch(obj.scope){
                    case "event":
                        var vars = t.p.vrs;
                        break;
                    case "scene":
                        var vars = Q.state.get("sceneVars");
                        break;
                    case "global":
                        var vars = Q.state.get("globalVars");
                        break;
                }
                for(var i=0;i<vars.length;i++){
                    if(vars[i].name===obj.vr){
                        if(vars[i].val===obj.vl){
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
                        var vars = t.p.vrs;
                        break;
                    case "scene":
                        var vars = Q.state.get("sceneVars");
                        break;
                    case "global":
                        var vars = Q.state.get("globalVars");
                        break;
                }
                for(var i=0;i<vars.length;i++){
                    if(vars[i].name===obj.vr){
                        vars[i].val = obj.vl;
                    }
                }
            },
            changePage:function(t,obj){
                t.p.choice = obj;//t.p.pages[t.getPageNum(obj.page)];
            },
            enableChoice:function(t,obj){
                //Find the page choice and enable it.
                t.getChoice(t.p.pages[t.p.pageNum],obj.choice).disabled = "Enabled";
            },
            changeEvent:function(t,obj){
                Q.startScene(obj.scene,obj.event);
                $("#text-container").remove();
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
            if(this.p.textIndex>this.p.script[this.p.scriptNum].text[this.p.textNum].length-1){
                this.p.nextTextTri = this.stage.insert(new Q.NextTextTri({x:this.p.x+this.p.w/2,y:this.p.y+this.p.h}));
                this.off("step",this,"cycleText");
                return;
            }
            //Q.playSound("text_stream.mp3");
            $(this.p.textBox).text($(this.p.textBox).text()+this.p.script[this.p.scriptNum].text[this.p.textNum][this.p.textIndex]);
            this.p.textIndex++;
        },
        next:function(){
            var data = this.p.script[this.p.scriptNum];
            //If it's text
            if(data.text){
                this.p.textNum = 0;
                this.p.textIndex = 0;
                $(this.p.leftImage).attr("src","images/"+data.asset[0]);
                $(this.p.rightImage).attr("src","images/"+data.asset[1]);
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
            if(this.p.textNum>=this.p.script[this.p.scriptNum].text.length){
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
                    if($(this.p.textBox).text().length===this.p.script[this.p.scriptNum].text[this.p.textNum].length){
                        if(this.p.nextTextTri) this.p.nextTextTri.destroy();
                        this.nextText();
                    } else {
                        $(this.p.textBox).text(this.p.script[this.p.scriptNum].text[this.p.textNum]);
                        this.p.textIndex = this.p.script[this.p.scriptNum].text[this.p.textNum].length;
                    }
                    /*this.p.inputsTimer=this.p.inputsTime;
                    this.off("step",this,"checkInputs");
                    this.on("step",this,"waitForInputsTimer");*/
                    Q.inputs['confirm']=false;
                };
            }
        },
        //SCRIPT FUNCTIONS BELOW
        changeEvent:function(scene,event){
            //Remove everything related to this scene
            $(this.p.container).remove();
            Q.startScene(scene,event);
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
        getStoryCharacter:function(id){
            //Gets a story character by their id
            if(Q._isNumber(id)){
                return Q.stage(0).lists.StoryCharacter.filter(function(char){
                    return char.p.storyId===id;
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
        modDialogueBox:function(display){console.log(display)
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
            //Go to location
            if(Q._isArray(obj)){
                spr.p.loc = obj;
                Q.BatCon.setXY(spr);
            } 
            //Follow object (passed in id number)
            else {
                spr.followObj(this.getStoryCharacter(obj));
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
            //Go to location
            if(Q._isArray(obj)){
                var pos = Q.BatCon.getXY(obj);
                spr.animate({x:pos.x,y:pos.y},1,Q.Easing.Quadratic.InOut,{callback:function(){
                    t.forceCycle();
                }});
            } 
            //Follow object (passed in id number)
            else {
                var to = this.getStoryCharacter(obj);
                spr.animate({x:to.p.x,y:to.p.y},speed?speed:1,Q.Easing.Quadratic.InOut,{callback:function(){
                    spr.followObj(to);
                    t.forceCycle();
                    t.showDialogueBox();
                }});
            }
            return true;
            
        },
        //Changes the direction of a story character
        changeDir:function(id,dir){
            var obj = this.getStoryCharacter(id);
            obj.playStand(dir);
        },
        playAnim:function(id,anim,dir,sound){
            Q.playSound(sound+".mp3");
            this.getStoryCharacter(id)["play"+anim](dir);
        },
        changeMoveSpeed:function(id,speed){
            var obj = this.getStoryCharacter(id);
            obj.p.stepDelay = speed;
        },
        //Moves a character along a path
        moveAlong:function(id,path,dir,allowCycle){
            var obj = this.getStoryCharacter(id);
            //If the is a function that should be played once the object reaches its destination
            obj.on("doneAutoMove",obj,function(){
                //If we have a new path, do it!
                this.playStand(dir);
                //If we're cycling on arrival
                if(allowCycle==="true"){
                    Q.dialogueController.p.scriptNum++;
                    Q.dialogueController.next();
                    //Allow cycling to the next script item
                    Q.dialogueController.p.noCycle = false;
                }
            });
            obj.moveAlongPath(path);
            this.p.noCycle = true;
            //If we're waiting on arrival
            if(allowCycle==="true"){
                return true;
            }
        },
        //Fades a character in or out
        fadeChar:function(id,inout){
            var obj = this.getStoryCharacter(id);
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
                type:Q.SPRITE_NONE
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
};

