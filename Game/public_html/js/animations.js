Quintus.Animations=function(Q){
Q.setUpAnimations=function(){
    //UI Objects
    Q.compileSheets("ui/ui_objects.png","json/data/ui_objects.json");
    
    //Sprites
    var toSheet= [
        ['rogue','player.png',32,64]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "sprites/"+toSheet[j][1],
        {
           tilew:toSheet[j][2],
           tileh:toSheet[j][3],
           sx:0,
           sy:0
        });
    };

    var standRate = 1/3;
    var walkRate = 1/6;
    Q.animations("player", {
        standingdown:{ frames: [0,1], rate:standRate},
        walkingdown:{ frames: [2,3,4,5], rate:walkRate},
        
        standingup:{ frames: [6,7], rate:standRate},
        walkingup:{ frames: [8,9,10,11], rate:walkRate},
        
        standingleft:{ frames: [12,13], rate:standRate},
        walkingleft:{ frames: [14,15,16,17], rate:walkRate},
        
        standingright:{ frames: [18,19], rate:standRate},
        walkingright:{ frames: [20,21,22,23], rate:walkRate}
    });
};
    
};