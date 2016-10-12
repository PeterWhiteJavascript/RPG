Quintus.SceneFuncs=function(Q){
    
    Q.startScene = function(scene){
        Q.load("json/story/"+scene+".json",function(){
            var data = Q.assets["json/story/"+scene+".json"];
            //If there is dialogue
            if(data.dialogue){
                //Add the bg/ path to the array of bg's
                data.dialogue.bg.forEach(function(bg,i){data.dialogue.bg[i] = "bg/"+bg;});
                //Load the bg assets and create the scene
                Q.load(data.dialogue.bg.join(','),function(){
                    //Stage the scene
                    Q.stageScene("dialogue",1,{data: data, dialogue: data.dialogue});
                });
            }
            if(data.battle) {
                Q.loadTMX("tmx/" + data.battle.map, function() {
                    //For those occasions where there's no dialogue cutscene, stage the battle scene.
                    if(!data.dialogue){
                        Q.stageScene("battle",{data:data,battle:data.battle});
                    }
                });
            }
            if(data.victory){
                //Add the bg/ path to the array of bg's
                data.victory.bg.forEach(function(bg,i){data.victory.bg[i] = "bg/"+bg;});
            }
            if(data.defeat){
                //Add the bg/ path to the array of bg's
                data.defeat.bg.forEach(function(bg,i){data.defeat.bg[i] = "bg/"+bg;});
            }
        });
    };
    Q.scene("dialogue",function(stage){
        var dialogueData = stage.options.dialogue;
        console.log(dialogueData)
        var bgImage = stage.insert(new Q.BackgroundImage({asset:dialogueData.bg[0]}));
        //The textbox is in charge of all of the functions that need to be run to do custom events.
        //It also shows the text_box.png
        var textbox = stage.insert(new Q.TextBox({dialogueData:dialogueData,bgImage:bgImage,bg:dialogueData.bg[0]}));
        //The Dialogue Area is the inner area of the text box. It will be transparent later on.
        textbox.p.dialogueArea = stage.insert(new Q.DialogueArea({w: Q.width-20}));
        //The Dialogue is the text that is inside the dialogue area
        textbox.p.dialogueText = textbox.p.dialogueArea.insert(new Q.Dialogue({label:"...", align: 'left', x: 10}));
        textbox.nextText();
        Q.input.on("confirm", textbox, function() {
            this.nextText();
        });
    });
    Q.scene("battle",function(stage){
        var battleData = stage.options.battle;
        Q.stageTMX("tmx/"+battleData.map, stage);

        // Temporary: press 'enter' to win the battle
        Q.input.on("confirm", stage, function() {
            Q.input.off("confirm", stage);
            Q.stageScene("dialogue", 1, {data: stage.options.data, dialogue: stage.options.data.victory});
        });
        // Temporary: press 'esc' to win the battle
        Q.input.on("esc", stage, function() {
            Q.input.off("esc", stage);
            Q.stageScene("dialogue", 1, {data: stage.options.data, dialogue: stage.options.data.defeat});
        });
    });
    Q.scene("menus",function(stage){
        //TO DO: Create menus that you can use
        console.log("Menu time!")
        console.log(stage.options.menus)
    });
};
