Quintus.UIObjects=function(Q){
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
    Q.Sprite.extend("TextBox",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                asset:"ui/text_box.png",
                
                interactionIndex:0,
                textIndex:0
            });
            //Uncomment if we add touch and set type to Q.SPRITE_UI
            //Q._generatePoints(this,true);
            this.p.y=Q.height-this.p.h;
            this.on("step",this,"checkInputs");
        },
        checkInputs:function(){
            if(Q.inputs['confirm']){
                if(this.p.dialogueText.interact()){
                    this.nextText();
                };
                Q.inputs['confirm']=false;
            }
        },
        checkTextNum:function(){
            var currentInteraction = this.p.dialogueData.interaction[this.p.interactionIndex];
            if(!currentInteraction.text || this.p.textIndex >= currentInteraction.text.length) {
                this.p.textIndex = 0;
                this.p.interactionIndex++;
            }
        },
        next:function() {
            var type = this.checkDialogueType(this.p.dialogueData.interaction[this.p.interactionIndex]);
            this['cycle' + type]();
        },
        nextText:function() {
            this.checkTextNum();
            this.next();
        },
        checkDialogueType:function(interaction){
            if(interaction.text){
                return 'Text';
            } else if(interaction.func){
                return 'Func';
            }
        },
        cycleText:function(){
            var interaction = this.p.dialogueData.interaction[this.p.interactionIndex];
            this.p.dialogueText.setNewText(interaction.text[this.p.textIndex]);
            this.p.dialogueText.p.align = interaction.pos;
            
            if(this.p.dialogueText.p.align == 'left') {
                this.p.dialogueText.p.x = 10;
            } else if(this.p.dialogueText.p.align == 'right') {
                this.p.dialogueText.p.x = this.p.dialogueArea.p.w-10;
            }
            this.p.textIndex++;
            //Update the assets
            if(interaction.asset[0]){
                this.p.leftAsset.p.asset = "story/"+interaction.asset[0];
            } else {
                this.p.leftAsset.p.asset = "";
            }
            if(interaction.asset[1]){
                this.p.rightAsset.p.asset = "story/"+interaction.asset[1];
            } else {
                this.p.rightAsset.p.asset = "";
            }
            // Check if we should run the next line in the action queue immediately without waiting for user confirmation (ie. to open a menu)
            if(interaction.skipLast && interaction.text.length == this.p.textIndex) {
                this.nextText();
            }
        },
        cycleFunc:function(){
            //If the function finishes this dialogue, it will be true.
            //This also gets the function that needs to be executed from the JSON
            if(this[this.p.dialogueData.interaction[this.p.interactionIndex].func].apply(this,this.p.dialogueData.interaction[this.p.interactionIndex].props)){return;};
            this.p.interactionIndex++;
            this.next();
        },
        //START JSON FUNCTIONS
        loadLocation:function(location,menu){
            var stage = this.stage;
            //Make sure the battle is gone
            Q.clearStages();
            Q.stageScene("location",0,{data:Q.state.get("locations")[location],menu:menu});
            return true;
        },
        loadBattle:function(path){
            var stage = this.stage;
            Q.stageScene("battle",0,{data:stage.options.data, path:path});
            //Clear this stage
            Q.clearStage(1);
            return true;
        },
        //Shows additional dialogue (which will probably be determined by factors such as player choices, how well they did in battle, etc...)
        moreDialogue:function(path){
            var stage = this.stage;
            Q.stageScene("dialogue",1,{data:stage.options.data, path:path});
            return true;
        },
        //Any time the user needs to make a decision during dialogue
        confirmation:function(options){
            var stage = this.stage;
            //Create the options menu box and put it into focus
            stage.insert(new Q.ConfirmBox({maxIndex:options.length-1,options:options}));
            this.off("step",this,"checkInputs");
            return true;
        },
        triggerQuest:function(questName){
            var quests = Q.state.get("acceptedQuests");
            if(quests[questName]) {
                // We've already received this quest
                return;
            }
            var data = Q.state.get("quests")[questName];
            Q.load(data.bgs.concat(data.chars).join(','),function(){
                Q.clearStages();
                Q.stageScene("dialogue", 1, {data: data, path: "dialogue"});
            });
            return true;
        },
        //Accepts a quest that the player has confirmed that they want to do.
        acceptQuest:function(quest){
            var quests = Q.state.get("acceptedQuests");
            quests[quest] = {name:quest,completed:false};
            //For now, send the user right to the scene!
            Q.clearStages();
            Q.startScene(quest);
            return true;
        },
        getProp:function(prop){
            return this.p[prop];
        },
        changeBg:function(bg){
            this.p.bg = bg;
            this.p.bgImage.p.asset = bg;
        },
        testFunc:function(string,integer,coolFunc,superCoolFunc){
            console.log("I am a string: "+string);
            console.log("I am an integer: "+integer);
            eval(coolFunc);
            console.log("I am the current background: "+eval(superCoolFunc));
        },
        doDefeat:function(){
            //This will run on defeat. TODO
        }
        //END JSON FUNCTIONS
    });
    
    Q.UI.Container.extend("ConfirmBox",{
        init:function(p){
            this._super(p,{
                x:Q.width/2,y:Q.height/2,
                cx:0,cy:0,
                w:300,h:200,
                type:Q.SPRITE_NONE,
                fill:"yellow",
                textIndex:0,
                confirmOptions:[],
                z:100
            });
            //Q._generatePoints(this,true);
            this.on("inserted");
        },
        inserted:function(){
            var options = this.p.options;
            var box = this;
            //Display the list of options to choose from
            options.forEach(function(opt,i){
                //The text that displays to show the option
                var confirmOption = box.insert(new Q.UI.Text({y:i*20,label:opt.text,next:opt.next}));
                box.p.confirmOptions.push(confirmOption);
                if(i===0){confirmOption.p.color="red";};
                //When this option is selected
                confirmOption.on("selected",function(path){
                    this.stage.pause();
                    if(opt.exitStage && Q.stages.length > 1) {
                        // Pop off the top stage, and unpause the previous one
                        var lastStage = Q.stages.length - 1;
                        Q.clearStage(lastStage);
                        Q.stages[lastStage - 1].unpause();
                    } else {
                        Q.stageScene("dialogue", 1, {data: box.stage.options.data, path: path});
                    }
                });
            });
            this.fit(10,10);
        },
        changeOptionColor:function(){
            this.p.confirmOptions.forEach(function(opt){
                opt.p.color="black";
            });
            this.p.confirmOptions[this.p.textIndex].p.color="red";
        },
        cycleUp:function(){
            this.p.textIndex--;
            if(this.p.textIndex<0){this.p.textIndex=this.p.maxIndex;};
            this.changeOptionColor();
        },
        cycleDown:function(){
            this.p.textIndex++;
            if(this.p.textIndex>this.p.maxIndex){this.p.textIndex=0;};
            this.changeOptionColor();
        },
        selectOption:function(){
            this.p.confirmOptions[this.p.textIndex].trigger("selected",this.p.confirmOptions[this.p.textIndex].p.next);
        },
        step:function(){
            if(Q.inputs['up']){
                this.cycleUp();
                Q.inputs['up']=false;
            } else if(Q.inputs['down']){
                this.cycleDown();
                Q.inputs['down']=false;
            } else if(Q.inputs['confirm']){
                this.selectOption();
                Q.inputs['confirm']=false;
            }
        }
    });
    Q.UI.Container.extend("DialogueArea",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_UI,
                label:"",
                w:Q.width-20,
                h:95,
                fill:"yellow"
            });
            Q._generatePoints(this,true);
            this.p.y=Q.height-this.p.h-15;
            this.p.x+=10;
        }
    });
    Q.UI.Text.extend("Dialogue",{
        init:function(p){
            this._super(p,{
                x:0,y:0,
                cx:0,cy:0,
                type:Q.SPRITE_NONE,
                label:"_",
                charNum:0,
                time:0,
                speed:Q.state.get("options").textSpeed
            });
            this.setNewText(this.p.text);
        },
        setNewText:function(text){
            this.p.text = text;
            this.p.charNum=0;
            this.p.time=0;
            this.p.label = this.p.text[this.p.charNum];
            this.on("step",this,"streamCharacters");
        },
        streamCharacters:function(){
            this.p.time++;
            if(this.p.time>=this.p.speed){
                this.p.time=0;
                this.p.charNum++;
                if(this.p.charNum>=this.p.text.length){
                    this.off("step",this,"streamCharacters");
                    return;
                }
                this.p.label+=this.p.text[this.p.charNum];
                Q.playSound("text_stream.mp3");
            }
        },
        interact:function(){
            var done = false;
            if(this.p.label.length>=this.p.text.length){
                done=true;
            } else {
                this.p.label=this.p.text;
                this.off("step",this,"streamCharacters");
            }
            return done;
        }
    });
};

