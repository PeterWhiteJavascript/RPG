Quintus.QFunctions=function(Q){
    
    Q.setOption=function(opt,value){
        Q.state.p.options[opt]=value;
    };
    Q.setXY=function(obj,loc){
        obj.p.x = loc[0]*Q.tileW;
        obj.p.y = loc[1]*Q.tileH;
    };
};