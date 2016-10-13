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
        loadMenus:function(){
            var stage = this.stage;
            Q.stageScene("menus",1,{data:stage.options.data,menus:stage.options.data.menus});
            Q.clearStage(0);
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
            Q.stageScene("dialogue",0,{data:stage.options.data, dialogue:dialogue});
            //Clear this stage
            Q.clearStage(1);
            Q.input.off("confirm",stage);
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
        }
        //END JSON FUNCTIONS
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
            this.p.points = [[0,0],[this.p.w,0],[this.p.w,this.p.h],[0,this.p.h]];
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

