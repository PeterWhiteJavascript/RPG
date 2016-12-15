Quintus.QFunctions=function(Q){
    //Sets up a character that is used in the story.
    Q.setUpStoryCharacter=function(data){
        function getEquipment(equipmentData){
            var equipment = Q.state.get("equipment");
            var keys = Object.keys(equipmentData);
            var eq = {};
            keys.forEach(function(key){
                if(equipmentData[key]){
                    eq[key] = equipment[equipmentData[key][0]][equipmentData[key][1]];
                } else {
                    eq[key] = {};
                }
            });
            return eq;
        }
        function getSkills(skillsData){
            var skills = Q.state.get("skills");
            var keys = Object.keys(skillsData);
            var sk = {
                dagger:{},
                sword:{},
                axe:{},
                spear:{},
                bow:{},
                shield:{}
            };
            keys.forEach(function(key){
                sk[key] = {};
                for(var i=0;i<skillsData[key].length;i++){
                    sk[key][skillsData[key][i]]=skills[key][skillsData[key][i]];
                }
            });
            return sk; 
        }
        var char = {
            name:data.name,
            level:data.level,
            exp:data.exp,
            gender:data.gender,
            stats:data.stats,
            charClass:data.charClass,
            equipment:getEquipment(data.equipment),
            skills:getSkills(data.skills),
            value:data.value,
            method:data.method
        };
        return char;
    };
    //Value scale of 1-100
    Q.getCharacterValue=function(value){
        if(value<=33) return "egoistic";
        if(value>=66) return "altruistic";
        return "loyal";
    };
    //Method scale of 1-100
    Q.getCharacterMethod=function(value){
        if(value<=33) return "compassionate";
        if(value>=66) return "logical";
        return "intuitive";
    };
    
    Q.getPathData=function(data,path){
        var newData = data;
        var arr = path.split('/');
        for(var i=0;i<arr.length;i++){
            newData = newData[arr[i]];
        }
        return newData;
    };
    Q.setOption=function(opt,value){
        Q.state.p.options[opt]=value;
    };
    //Follows a sprite
    Q.viewFollow=function(obj,stage){
        if(!stage){stage=Q.stage(0);};
        var minX=0;
        var maxX=(stage.mapWidth*Q.tileW)*stage.viewport.scale;
        var minY=0;
        var maxY=(stage.mapHeight*Q.tileH)*stage.viewport.scale;
        stage.follow(obj,{x:true,y:true},{minX: minX, maxX: maxX, minY: minY,maxY:maxY});
    };
    Q.pauseAllStages = function(){
        Q.stages.forEach(function(st){
            if(!st) return;
            st.pause();
        });
    };
    Q.unpauseAllStages = function(){
        Q.stages.forEach(function(st){
            if(!st) return;
            st.unpause();
        });
    };
    //Converts the direction into an location array that can be used to multiply for direction
    Q.getDirArray = function(dir){
        switch(dir){
            case "up":
                return [0,-1];
            case "right":
                return [1,0];
            case "down":
                return [0,1];
            case "left":
                return [-1,0];
        }
    };
};