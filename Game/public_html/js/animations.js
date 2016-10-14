Quintus.Animations=function(Q){
Q.setUpAnimations=function(){
    //UI Objects
    Q.compileSheets("ui/ui_objects.png","json/data/ui_objects.json");
    
    
    //Sprites
    var toSheet= [
        ['Archer','Archer.png',24,48,344,352],
        ['Barbarian','Barbarian.png',24,48,344,352]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "sprites/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:0,
           sy:0,
           w:toSheet[j][4],
           h:toSheet[j][5]
        });
    };

    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("Character", {
        standingleft:{ frames: [1,2], rate:standRate},
        walkingleft:{ frames: [1,2,3], rate:walkRate}
        
    });
};
    
};