Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene){
        Q.load("json/story/"+scene+".json",function(){
            var data = Q.assets["json/story/"+scene+".json"];
            if(data.dialogue){
                Q.load("bg/"+data.dialogue.bg,function(){
                    Q.makeDialogue(scene);
                    //Stage the scene
                    Q.stageScene(scene,{data: data, dialogue: data.dialogue});
                });
                
            }
            if(data.battle) {
                Q.loadTMX("tmx/" + data.battle.map, function() {
                    Q.makeBattle(scene);
                });
            }
        });
    };
    Q.makeDialogue = function(sceneName){
        Q.scene(sceneName,function(stage){
            var dialogueData = stage.options.dialogue;
            if(dialogueData.bg && dialogueData.bg.length > 0) {
                stage.insert(new Q.BackgroundImage({asset:"bg/"+dialogueData.bg}));
            }
            //Show a text box (testing)
            var textbox = stage.insert(new Q.TextBox());
            var da = stage.insert(new Q.DialogueArea({w: Q.width-20}));
            var dialogue = da.insert(new Q.Dialogue({label:"...", align: 'left', x: 10}));

            var interactionIndex = 0;
            var textIndex = 0;
            dialogue.nextText = function() {
                if(textIndex >= dialogueData.interaction[interactionIndex].text.length) {
                    textIndex = 0;
                    interactionIndex++;
                }
                if(interactionIndex >= dialogueData.interaction.length) {
                    // todo: How do I decide what's next? What if it isn't a battle?
                    Q.input.off("confirm", dialogue);
                    Q.stageScene("battle_"+sceneName,{data:stage.options.data, battle: stage.options.data.battle});
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
            };
            dialogue.nextText();
            Q.input.on("confirm", dialogue, function() {
                dialogue.nextText();
            });
        });
    };
    Q.makeBattle = function(sceneName){
        Q.scene("battle_" + sceneName,function(stage){
            var battleData = stage.options.battle;
            Q.stageTMX("tmx/"+battleData.map, stage);

            Q.input.on("confirm", stage, function() {
                // Temporary: press 'enter' to win the battle
                Q.input.off("confirm", stage);
                Q.stageScene(sceneName, 1, {data: stage.options.data, dialogue: stage.options.data.menus});
            });
        });
    };
};
