Quintus.Animations=function(Q){
Q.setUpAnimations=function(){
    //UI Objects
    Q.compileSheets("ui/ui_objects.png","json/data/ui_objects.json");
    
    
    //Sprites
    var toSheet= [
        ['archer','archer.png',24,24,0,0,192,72],
        ['assassin','assassin.png',24,24,0,0,192,72],
        ['berserker','berserker.png',24,24,0,0,192,72],
        ['elementalist','elementalist.png',24,24,0,0,192,72],
        ['healer','healer.png',24,24,0,0,192,72],
        ['illusionist','illusionist.png',24,24,0,0,192,72],
        ['legionnaire','legionnaire.png',24,24,0,0,192,72],
        ['skirmisher','skirmisher.png',24,24,0,0,192,72],
        ['vanguard','vanguard.png',24,24,0,0,192,72],
        ['mirage','mirage.png',32,32,0,0,128,32],
        ['ground','ground.png',32,32,0,0,320,32]
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
    //Animations
    var toSheet= [
        ['SonicBoom','SonicBoom.png',96,96,0,0,288,288],
        ['Whirlwind','Whirlwind.png',32,32,0,0,96,32],
        ['Piercing','Piercing.png',64,32,0,0,320,32],
        ['FrostRay','FrostRay.png',32,32,0,0,320,32]
    ];
    for(j=0;j<toSheet.length;j++){
        Q.sheet(toSheet[j][0],
        "animations/"+toSheet[j][1],
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
    var supafAst = 1/12;
    var tooFast = 1/24;
    Q.animations("Character", {
        standingup:{ frames: [0,1], rate:standRate},
        walkingup:{ frames: [0,1], rate:walkRate},
        attackingup:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
        missedup:{frames:[0,2,6,4],rate:supafAst,loop:false,trigger:"playStand"},
        counteringup:{frames:[0,2,6,4],rate:supafAst,loop:false,trigger:"doneCounter"},
        liftup:{frames:[9,9,9],rate:standRate},
        liftedup:{frames:[51],rate:standRate},
        hurtup:{frames:[1],rate:standRate},
        dyingup:{frames:[0,2,6,4],rate:walkRate,loop:false,trigger:"doneDying"},
        deadup:{frames:[0],rate:standRate},
        
        standingright:{ frames: [2,3], rate:standRate},
        walkingright:{ frames: [2,3], rate:walkRate},
        attackingright:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
        missedright:{frames:[2,6,4,0],rate:supafAst,loop:false,trigger:"playStand"},
        counteringright:{frames:[2,6,4,0],rate:supafAst,loop:false,trigger:"doneCounter"},
        liftright:{frames:[9,9,9],rate:standRate},
        liftedright:{frames:[51],rate:standRate},
        hurtright:{frames:[3],rate:standRate},
        dyingright:{frames:[2,6,4,0],rate:walkRate,loop:false,trigger:"doneDying"},
        deadright:{frames:[2],rate:standRate},
        
        standingleft:{ frames: [4,5], rate:standRate},
        walkingleft:{ frames: [4,5], rate:walkRate},
        attackingleft:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
        missedleft:{frames:[6,4,0,2],rate:supafAst,loop:false,trigger:"playStand"},
        counteringleft:{frames:[6,4,0,2],rate:supafAst,loop:false,trigger:"doneCounter"},
        liftleft:{frames:[8,8,8],rate:standRate},
        liftedleft:{frames:[50],rate:standRate},
        hurtleft:{frames:[5],rate:standRate},
        dyingleft:{frames:[6,4,0,2],rate:walkRate,loop:false,trigger:"doneDying"},
        deadleft:{frames:[4],rate:standRate},
        
        standingdown:{ frames: [6,7], rate:standRate},
        walkingdown:{ frames: [6,7], rate:walkRate},
        attackingdown:{ frames: [0,2,6,4], rate:tooFast, loop:false,trigger:"doneAttack"},
        misseddown:{frames:[4,0,2,6],rate:supafAst,loop:false,trigger:"playStand"},
        counteringdown:{frames:[4,0,2,6],rate:supafAst,loop:false,trigger:"doneCounter"},
        liftdown:{frames:[8,8,8],rate:standRate},
        lifteddown:{frames:[50],rate:standRate},
        hurtdown:{frames:[7],rate:standRate},
        dyingdown:{frames:[4,0,2,6],rate:walkRate,loop:false,trigger:"doneDying"},
        deaddown:{frames:[6],rate:standRate},
        
        levelingUp:{frames:[4,0,2,6,4,0,2,6],rate:standRate,loop:false,trigger:"playStand"}
    });
    Q.animations("SonicBoom",{
        booming:{frames:[0,0,1,1,0,0,1,1,2,2,1,1,2,2,3,3,4,4,3,3,4,4,5,5,4,4,5,5,6,7,6,7,8,7,8,7,6,0,0],rate:1/20, loop:false,trigger:"doneAttack"}
    });
    Q.animations("Whirlwind",{
        winding:{frames:[0,0,1,1,2,2,1,2,1,2,1,2,1,2],rate:1/12, loop:false,trigger:"doneAttack"}
    });
    Q.animations("Piercing",{
        piercingStart:{frames:[0,1],rate:1/6,loop:false,next:"piercingEnd",trigger:"doneAttack"},
        piercingEnd:{frames:[2,3],rate:1/6,loop:false,trigger:"finished"}
    });
    Q.animations("FrostRay",{
        frostGoingOut:{frames:[0,1,2,3,4,5],rate:1/16,loop:false,trigger:"doneOut"},
        frostExploding:{frames:[6,7,6,7],rate:1/6,loop:false,trigger:"finished"}
    });
    
    Q.animations("mirage",{
        doingItsThing:{frames:[0,0,0,0,1,2,3,3,2,1],rate:standRate}
    });
    Q.animations("ground",{
        stability:{frames:[0,1],rate:standRate}
    });
};
    
};