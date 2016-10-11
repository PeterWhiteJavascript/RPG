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
            var data = stage.options.data;
            //Show the background image
            stage.insert(new Q.BackgroundImage({asset:"bg/"+data.dialogue.bg}));
            //Show a text box (testing)
            var textbox = stage.insert(new Q.TextBox());
            var da = stage.insert(new Q.DialogueArea());
            da.insert(new Q.Dialogue({label:"hihih"}))
            //textbox.insert(new )
            console.log(textbox)
            console.log(stage.options)
        });
    };
};