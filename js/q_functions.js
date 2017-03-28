Quintus.QFunctions=function(Q){
    
    Q.markEventCompleted = function(char,prop){
        var event = char.events[prop].filter(function(e){
            return e[char.awards[prop]];
        })[0];
        var idx = char.events[prop].indexOf(event);
        var itm = char.events[prop].splice(idx,1);
        if(!char.completedEvents[prop]) char.completedEvents[prop] = [];
        char.completedEvents[prop].push(itm);
    };
    
    //Adds a character event if it exists
    Q.addCharEvent = function(char,prop){
        var event = char.events[prop].filter(function(e){
            return e[char.awards.feasted];
        })[0];
        if(event) Q.state.get("potentialEvents").push([char,event[char.awards.feasted],prop]);
    };
    
    //Loads all unique assets that are used in a scene
    Q.loadSceneAssets = function(data,callback){
        var musicAssets = [];
        var bgAssets = [];
        for(var i=0;i<data.length;i++){
            if(musicAssets.indexOf("bgm/"+data[i].music)<0) {
                musicAssets.push("bgm/"+data[i].music);
            }
            if(bgAssets.indexOf(data[i].bg)<0){
                bgAssets.push(data[i].bg);
            }
        }
        Q.load(musicAssets.concat(bgAssets),callback);
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
        stage.follow(obj,{x:true,y:true}/*,{minX: minX, maxX: maxX, minY: minY,maxY:maxY}*/);
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
    Q.getMatrix = function(type,team,required){
        var tileTypes = Q.state.get("tileTypes");
        var cM=[];
        var stage = Q.stage(0);
        var otherTeam = team==="enemy"?"ally":"enemy";
        function getWalkable(){
            var tile = tileTypes[Q.BatCon.getTileType([i_walk,j_walk])];
            var move = tile.move;
            //If there is something required for standing on this tile and the character does not have it
            if(tile.required&&(!required||!required[tile.required])) move = 1000000;
            return move?move:1000000;
        }
        function getTarget(){
            return Q.BattleGrid.getObject([i_walk,j_walk]);
        }
        function getZOC(){
            return Q.BattleGrid.getZOC(otherTeam,[i_walk,j_walk]);
        }
        for(var i_walk=0;i_walk<stage.lists.TileLayer[0].p.tiles[0].length;i_walk++){
            var costRow = [];
            for(var j_walk=0;j_walk<stage.lists.TileLayer[0].p.tiles.length;j_walk++){
                var cost = 1;
                var objOn = false;
                var zocOn = false;
                //If we're walking, enemies are impassable
                if(type==="walk"){
                    cost = getWalkable();
                    //Don't check for other objects and ZOC in the story
                    if(team!=="story"&&cost<1000000){
                        objOn = getTarget();
                        zocOn = getZOC();
                    }

                    //Allow walking over allies and dead people as long as there's no zoc tile
                    if(objOn&&(objOn.p.team===team||objOn.p.hp<=0)&&!zocOn){objOn=false;};
                }
                //If there's still no enemy on the sqaure, get the tileCost
                if(objOn){
                    costRow.push(1000000);
                } else if(zocOn){
                    costRow.push(1000);
                } else {
                    costRow.push(cost);
                }
            }
            cM.push(costRow);
        }
        return cM;
    };
    //Returns a path from one location to another
    Q.getPath = function(loc,toLoc,graph){
        var start = graph.grid[loc[0]][loc[1]];
        var end = graph.grid[toLoc[0]][toLoc[1]];
        return Q.astar.search(graph, start, end);
    };
};