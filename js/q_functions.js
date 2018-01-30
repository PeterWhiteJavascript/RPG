Quintus.QFunctions=function(Q){
    Q.getDamageTime = function(tech){
        if(!tech) return 200;
        switch(tech.anim){
            default:
                return 100;  
               
        }
    };
    Q.getCharClassNum = function(c){
        return Q.state.get("charGeneration").classNames.indexOf(c);
    };
    Q.getNationalityNum = function(n){
        return Q.state.get("charGeneration").nationalities.indexOf(n);
    };
    
    Q.changeMorale = function(morale){
        Q.state.get("allies").forEach(function(ally){
            ally.morale+=morale;
        });
    };
    Q.setAward = function(obj,prop,amount){
        if(!obj || !obj["awards"]) return;
        obj["awards"][prop] += amount;
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
    Q.getRotatedDir = function(dir){
        switch(dir){
            case "up":
                return "right";
            case "right":
                return "down";
            case "down":
                return "left";
            case "left":
                return "up";
        }
    };
    Q.getBehindDirArray = function(dir){
        switch(dir){
            case "up":
                return [-1,1];
            case "right":
                return [-1,-1];
            case "down":
                return [1,-1];
            case "left":
                return [1,1];
        }
    };
    Q.getOppositeDir = function(dir){
        switch(dir){
            case "up":
                return "down";
            case "right":
                return "left";
            case "down":
                return "up";
            case "left":
                return "right";
        }
    };
    Q.getWalkableOn = function(i,j,required){
        var tileTypes = Q.state.get("tileTypes");
        var tile = tileTypes[Q.BatCon.getTileType([i,j])];
        var move = tile.move;
        var icy = Q.BattleGrid.icy && Q.BattleGrid.icy.p.tiles[j][i] ?1:0;
        //If there is something required for standing on this tile and the character does not have it
        if(tile.required&&(!required||!required[tile.required])) move = 1000000;
        return move?(move+icy):1000000;
    };
    Q.getMatrix = function(type,team,required,obj){
        var cM=[];
        var stage = Q.stage(0);
        //var otherTeam = team==="enemy"?"ally":"enemy";
        function getTarget(){
            return Q.BattleGrid.getObject([i_walk,j_walk]);
        }/*
        function getZOC(){
            return Q.BattleGrid.getZOC(otherTeam,[i_walk,j_walk]);
        }*/
        function getCaltrops(){
            return Q.BattleGrid.caltrops?Q.BattleGrid.caltrops.getTile(i_walk,j_walk):false;
        }
        var windWalking = obj?obj.p.talents.includes("Wind Walking"):false;
        for(var i_walk=0;i_walk<stage.lists.TileLayer[0].p.tiles[0].length;i_walk++){
            var costRow = [];
            for(var j_walk=0;j_walk<stage.lists.TileLayer[0].p.tiles.length;j_walk++){
                var cost = 1;
                var objOn = false;
                //var zocOn = false;
                var caltropsOn = false;
                //If we're walking, enemies are impassable
                if(type==="walk"){
                    cost = Q.getWalkableOn(i_walk,j_walk,required);
                    //Don't check for other objects and ZOC in the story
                    if(team!=="story"&&cost<1000000){
                        objOn = getTarget();
                        //zocOn = getZOC();
                        caltropsOn = getCaltrops();
                    }
                    
                    //Allow walking over allies and dead people as long as there's no zoc tile
                    if(objOn&&(objOn.p.team===team||objOn.p.combatStats.hp<=0||windWalking)/*&&!zocOn*/){objOn=false;};
                }
                //If there's still no enemy on the square, get the tileCost
                if(objOn){
                    costRow.push(1000000);
                }/* else if(zocOn){
                    costRow.push(1000);
                }*/ 
                else if(caltropsOn){
                    costRow.push(1000);
                } else {
                    if(windWalking) cost = 1;
                    costRow.push(cost);
                }
            }
            cM.push(costRow);
        }
        return cM;
    };
    //Returns a path from one location to another
    Q.getPath = function(loc,toLoc,graph,max){
        var start = graph.grid[loc[0]][loc[1]];
        var end = graph.grid[toLoc[0]][toLoc[1]];
        return Q.astar.search(graph, start, end, {maxScore:max});
    };
    
    //Make the character look at the pointer when moving.
    Q.compareLocsForDirection = function(userLoc,loc,dir){
        var difX = userLoc[0]-loc[0];
        var difY = userLoc[1]-loc[1];
        //When the pointer is on top of the character, don't change the direction
        if(difX===0&&difY===0) return;
        //If the x dif is greater than the y dif
        if(Math.abs(difX)>Math.abs(difY)){
            //If the user is to the left of the pointer, make him face right
            if(difX<0) dir = "right";
            else dir = "left";
        } else {
            if(difY<0) dir = "down";
            else dir = "up";
        }
        return dir;
    };
};