Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene){
        Q.load("json/story/"+scene+".json",function(){
            //Get the data from the json file
            var data = Q.assets["json/story/"+scene+".json"];
            //Make sure that we have dialogue
            if(data.dialogue){
                //Load the bg
                Q.load("bg/"+data.dialogue.bg,function(){
                    //Set up the dialogue scene
                    Q.makeDialogue(scene);
                    //Stage the scene
                    Q.stageScene(scene,{data:data});
                });
                
            }
        });
    };
    Q.makeDialogue = function(sceneName,data){
        //Create the scene
        Q.scene(sceneName,function(stage){
            var dialogueData = stage.options.data.dialogue;
            //Show the background image
            stage.insert(new Q.BackgroundImage({asset:"bg/"+dialogueData.bg}));
            //Show a text box (testing)
            var textbox = stage.insert(new Q.TextBox());
            var da = stage.insert(new Q.DialogueArea({w: Q.width-20}));
            var dialogue = da.insert(new Q.Dialogue({label:"...", align: 'left', x: 10}));

            var interactionIndex = 0;
            var textIndex = 0;
            Q.input.on("confirm", function() {
                if(textIndex >= dialogueData.interaction[interactionIndex].text.length) {
                    textIndex = 0;
                    interactionIndex++;
                }
                if(interactionIndex >= dialogueData.interaction.length) {
                    dialogue.p.label = "[End of Dialogue]";
                    // todo: Go to next scene
                    interactionIndex = 0;
                    textIndex = 0;
                    return;
                }
                dialogue.p.label = dialogueData.interaction[interactionIndex].text[textIndex];
                dialogue.p.align = dialogueData.interaction[interactionIndex].pos;
                if(dialogue.p.align == 'left') {
                    dialogue.p.x = 10;
                } else if(dialogue.p.align == 'right') {
                    dialogue.p.x = Q.width-30;
                }
                textIndex++;
            });
        });
    };
};