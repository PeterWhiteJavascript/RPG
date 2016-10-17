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
                    eq[key].level = equipmentData[key][2];
                } else {
                    eq[key] = {};
                }
            });
            return eq;
        }
        function getAttacks(attackData){
            var attacks = Q.state.get("attacks");
            var keys = Object.keys(attackData);
            var at = {};
            keys.forEach(function(key){
                at[key] = {};
                for(var i=0;i<attackData[key].length;i++){
                    at[key][attackData[key][i]]=attacks[key][attackData[key][i]];
                }
            });
            return at; 
        }
        var char = {
            name:data.name,
            level:data.level,
            gender:data.gender,
            stats:data.stats,
            charClass:data.charClass,
            equipment:getEquipment(data.equipment),
            attacks:getAttacks(data.attacks),
            value:data.value,
            method:data.method
        };
        console.log(char)
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
    Q.setXY=function(obj,loc){
        obj.p.x = loc[0]*Q.tileW+Q.tileW/2;
        obj.p.y = loc[1]*Q.tileH+Q.tileH/2;
    };
};