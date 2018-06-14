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
    Q.getWalkableOn = function(tile,required){
        var move = tile.move;
        //If there is something required for standing on this tile and the character does not have it
        if(tile.required&&(!required||!required[tile.required])) move = 1000000;
        return move || 1000000;
    };
    Q.getMatrix = function(type,team,required,obj){
        var cM=[];
        var stage = Q.stage(0);
        //var otherTeam = team==="enemy"?"ally":"enemy";
        function getTarget(){
            return Q.BattleGrid.getObject([x,y]);
        }/*
        function getZOC(){
            return Q.BattleGrid.getZOC(otherTeam,[i_walk,j_walk]);
        }*/
        function getModifiedTiles(){
            return Q.modifiedTilesController.getTile(x,y);
        }
        var tileTypes = Q.state.get("tileTypes");
        var windWalking = obj?obj.p.talents.includes("Wind Walking"):false;
        for(var x=0;x<stage.lists.TileLayer[0].p.tiles[0].length;x++){
            var costRow = [];
            for(var y=0;y<stage.lists.TileLayer[0].p.tiles.length;y++){
                var cost = 1;
                var objOn = false;
                //var zocOn = false;
                var modified = false;
                //If we're walking, enemies are impassable
                if(type==="walk"){
                    cost = Q.getWalkableOn(tileTypes[Q.BatCon.getTileType([x,y])],required);
                    //Don't check for other objects and ZOC in the story
                    if(team!=="story"&&cost<1000000){
                        objOn = getTarget();
                        //zocOn = getZOC();
                        modified = getModifiedTiles();
                    }
                    
                    //Allow walking over allies and dead people as long as there's no zoc tile
                    if(objOn&&(objOn.p.team===team||objOn.p.combatStats.hp<=0||windWalking)/*&&!zocOn*/){objOn=false;};
                }
                //If there's still no enemy on the square, get the tileCost
                if(objOn){
                    costRow.push(1000000);
                } else if(!modified){
                    if(windWalking) cost = 1;
                    costRow.push(cost);
                }
                //Only allow movement onto the first caltrops or burning tile
                else if(modified === 7 || modified === 4){
                    costRow.push(1000);
                } 
                //If modified is sort of a regular tile.
                else {
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
    Q.compareLocsForDirection = function(userLoc, loc, dir){
        var difX = userLoc[0] - loc[0];
        var difY = userLoc[1] - loc[1];
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
    Q.fadeAnim = function(ms, color, startTime, opacityTo, opacityStart, callback){
        color = color || "white";
        var fader = $("<div id='fader' class='fader-"+color+"'></div>");
        $("#main-content").append(fader);
        opacityStart = opacityStart || 0;
        $("#fader").css("opacity",opacityStart);
        opacityTo = opacityTo || 0;
        startTime = startTime || 0;
        setTimeout(function(){
            $( "#fader" ).fadeTo( ms , opacityTo, function() {
                $("#fader").remove();
                if(callback) callback();
            });
        }, startTime);
    };
    
    Q.getSpriteAt = function(loc){
        return Q.stage(0).locate(loc[0]*Q.tileW+Q.tileW/2,loc[1]*Q.tileH+Q.tileH/2,Q.SPRITE_CHARACTER);
    };
    Q.getXY = function(loc){
        return {x:loc[0] * Q.tileW + Q.tileW / 2,y:loc[1] * Q.tileH + Q.tileH / 2};
    };
    Q.getLoc = function(x, y){
        return [~~(x / Q.tileW), ~~(y / Q.tileH)];
    };
};