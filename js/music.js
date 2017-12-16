Quintus.Music=function(Q){
    
Q.GameObject.extend("AudioController",{
    loadedMusic:[],
    currentMusic:"",
    playMusic:function(music,callback){
        if(!music) music = this.currentMusic;
        if(Q.optionsController.options.musicEnabled){
            var loadedMusic = this.loadedMusic;
            var ld = loadedMusic.includes(music);
            //If the music hasn't been loaded
            if(!ld){
                $("#loading-screen").show();
                this.stopMusic(this.currentMusic);
                this.stopMusic(music);
                Q.load("bgm/"+music,function(){
                    Q.audio.play("bgm/"+music,{loop:true});
                    loadedMusic.push(music);
                    if(callback){callback();}
                },{progressCallback:Q.progressCallback});
            //If the music is different than the currentMusic
            } else if(this.currentMusic!==music){
                this.stopMusic(this.currentMusic);
                this.stopMusic(music);
                Q.audio.play("bgm/"+music,{loop:true});
            }
            //Do the callback instantly if the music has been loaded
            if(ld){
                if(callback){callback();}
            }
        } else {
            if(callback){callback();}
        }
        this.currentMusic = music;
    },
    stopMusic:function(music){
        if(!music) music = this.currentMusic;
        Q.audio.stop("bgm/"+music);
    },
    checkMusicEnabled:function(){
        if(Q.optionsController.options.musicEnabled){
            this.playMusic(this.currentMusic);
        } else {
            this.stopMusic(this.currentMusic);
        }
    },
    playSound:function(sound,callback){
        if(Q.optionsController.options.soundEnabled){
            if(sound.length){
                Q.audio.play("sfx/"+sound);
            }
        }
        if(callback){callback();}
    }
});
};


