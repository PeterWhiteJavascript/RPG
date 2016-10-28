Quintus.Animations=function(Q){
Q.setUpAnimations=function(){
    //UI Objects
    Q.compileSheets("ui/ui_objects.png","json/data/ui_objects.json");
    
    
    //Sprites
    var toSheet= [
        ['archer','archer.png',24,48,6,6,344,352],
        ['barbarian','barbarian.png',24,48,6,6,344,352],
        ['knight','knight.png',24,48,6,14,344,352]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "sprites/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:toSheet[j][4],
           sy:toSheet[j][5],
           w:toSheet[j][6],
           h:toSheet[j][7]
        });
    };

    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("Character", {
        standingleft:{ frames: [1,2], rate:standRate},
        walkingleft:{ frames: [1,2,3], rate:walkRate},
        attackingleft:{ frames: [1,2,3,3,2,1], rate:walkRate,trigger:"doneAttack"},
        
        standingright:{ frames: [5,6], rate:standRate},
        walkingright:{ frames: [5,6,7], rate:walkRate},
        attackingright:{ frames: [5,6,7,7,6,5], rate:walkRate,trigger:"doneAttack"},
        
        standingup:{ frames: [5,6], rate:standRate},
        walkingup:{ frames: [5,6,7], rate:walkRate},
        attackingup:{ frames: [5,6,7,7,6,5], rate:walkRate,trigger:"doneAttack"},
        
        standingdown:{ frames: [1,2], rate:standRate},
        walkingdown:{ frames: [1,2,3], rate:walkRate},
        attackingdown:{ frames: [1,2,3,3,2,1], rate:walkRate,trigger:"doneAttack"}
        
        
    });
};
    
};