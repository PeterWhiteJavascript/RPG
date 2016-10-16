Quintus.QFunctions=function(Q){
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
        obj.p.x = loc[0]*Q.tileW;
        obj.p.y = loc[1]*Q.tileH;
    };
};