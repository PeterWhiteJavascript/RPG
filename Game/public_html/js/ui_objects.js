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
        },
        checkTextNum:function(){
            if(this.p.textIndex >= this.p.dialogueData.interaction[this.p.interactionIndex].text.length) {
                this.p.textIndex = 0;
                this.p.interactionIndex++;
            }
        },
        nextText:function() {
            //Remove later
            if(this.p.dialogueData.interaction[this.p.interactionIndex].func){alert("Code is broken. A function should never be tried to run here.");}
            this.checkTextNum();
            var type = this.checkDialogueType(this.p.dialogueData.interaction[this.p.interactionIndex]);
            this['cycle'+type]();
        },
        checkDialogueType:function(interaction){
            if(interaction.text){
                return 'Text';
            } else if(interaction.func){
                return 'Func';
            }
        },
        cycleText:function(){
            this.p.dialogueText.p.label = this.p.dialogueData.interaction[this.p.interactionIndex].text[this.p.textIndex];
            this.p.dialogueText.p.align = this.p.dialogueData.interaction[this.p.interactionIndex].pos;
            
            if(this.p.dialogueText.p.align == 'left') {
                this.p.dialogueText.p.x = 10;
            } else if(this.p.dialogueText.p.align == 'right') {
                this.p.dialogueText.p.x = this.p.dialogueArea.p.w-10;
            }
            this.p.textIndex++;
            //Update the assets
            if(this.p.dialogueData.interaction[this.p.interactionIndex].asset[0]){
                this.p.leftAsset.p.asset = "story/"+this.p.dialogueData.interaction[this.p.interactionIndex].asset[0];
            } else {
                this.p.leftAsset.p.asset = "";
            }
            if(this.p.dialogueData.interaction[this.p.interactionIndex].asset[1]){
                this.p.rightAsset.p.asset = "story/"+this.p.dialogueData.interaction[this.p.interactionIndex].asset[1];
            } else {
                this.p.rightAsset.p.asset = "";
            }
            
        },
        cycleFunc:function(){
            //If the function finishes this dialogue, it will be true.
            //This also gets the function that needs to be executed from the JSON
            if(this[this.p.dialogueData.interaction[this.p.interactionIndex].func].apply(this,this.p.dialogueData.interaction[this.p.interactionIndex].props)){return;};
            this.p.interactionIndex++;
            var type = this.checkDialogueType(this.p.dialogueData.interaction[this.p.interactionIndex]);
            this['cycle'+type]();
        },
        //START JSON FUNCTIONS
        loadLocation:function(location,menu){
            var stage = this.stage;
            Q.stageScene("location",0,{location:Q.state.get("locations")[location],menu:menu});
            Q.clearStage(1);
            Q.input.off("confirm",stage);
            return true;
        },
        loadBattle:function(){
            var stage = this.stage;
            Q.stageScene("battle",0,{data:stage.options.data, battle: stage.options.data.battle});
            //Clear this stage
            Q.clearStage(1);
            Q.input.off("confirm",stage);
            return true;
        },
        //Shows additional dialogue (which will probably be determined by factors such as player choices, how well they did in battle, etc...)
        moreDialogue:function(name){
            var stage = this.stage;
            var dialogue = stage.options.data[name];
            Q.stageScene("dialogue",1,{data:stage.options.data, dialogue:dialogue});
            //Clear this stage
            Q.clearStage(1);
            Q.input.off("confirm",stage);
            return true;
        },
        //Any time the user needs to make a decision during dialogue
        confirmation:function(options){
            var stage = this.stage;
            //Create the options menu box and put it into focus
            var confirmationBox = stage.insert(new Q.ConfirmBox({maxIndex:options.length-1}));
            Q.input.off("confirm",stage);
            Q.input.on("up",confirmationBox,"cycleUp");
            Q.input.on("down",confirmationBox,"cycleDown");
            Q.input.on("confirm",confirmationBox,"selectOption");
            //Display the list of options to choose from
            options.forEach(function(opt,i){
                //The text that displays to show the option
                var confirmOption = confirmationBox.insert(new Q.Dialogue({y:i*20,label:opt.text,next:opt.next}));
                confirmationBox.p.confirmOptions.push(confirmOption);
                if(i===0){confirmOption.p.color="red";};
                //When this option is selected
                confirmOption.on("selected",function(next){
                    //If this option is selected, load that dialogue and destroy this confirmation box
                    Q.stageScene("dialogue",1,{data:stage.options.data, dialogue:stage.options.data[next]});
                    Q.input.off("up",stage);
                    Q.input.off("down",stage);
                    Q.input.off("confirm",stage);
                });
            });
            confirmationBox.fit(10,10);
            //Disable input for this text box for now while the user selects the option
            Q.input.off("confirm",stage);
            return true;
        },
        //Accepts a quest that the player has confirmed that they want to do.
        acceptQuest:function(){
            var stage = this.stage;
            var sceneName = stage.options.data.sceneName;
            var quests = Q.state.get("acceptedQuests");
            quests[sceneName] = sceneName;
            //For now, send the user right to the scene!
            Q.clearStages();
            Q.startScene(sceneName);
            return true;
        },
        //When the dialogue is finished
        finished:function(){
            Q.input.off("confirm",this.stage);
            Q.clearStages();
            return(this.loadLocation(Q.state.get("currentLocation").name,Q.state.get("currentMenu")));
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
            //This will run on defeat. Depending on the mode, it will either game over or continue at the point just before the battle. TODO
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
                confirmOptions:[]
            });
            //Q._generatePoints(this,true);
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
                label:""
            });
        }
    });
};

