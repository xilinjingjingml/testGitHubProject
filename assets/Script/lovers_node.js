
//随机min~max 之间整数
function RndNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

cc.Class({
    extends: cc.Component,

    properties: {
        lovers_1 : cc.Sprite,
        lovers_2 : cc.Sprite,
        ani_bang : cc.Sprite,
        _eventSta : true,     //事件开关
        _manSta : 0,          //1.单身 2.情侣
        sprite_singleMan : null,
        sprite_loversL : null,
        sprite_loversR : null,
        _anim_0 : null,
        _anim_1 : null,
        _tmpImg_L : "",
        _tmpImg_R : "",
        _tmpSigleImg : "",

        sfxAudioClips: [cc.AudioClip],
    },

    onLoad () {
        var self = this;
        //随机变换图片
        cc.director.getCollisionManager().enabled = true;

        this.node.on("player_2", function (event) {
            event.stopPropagation();
            // console.log("jin--------event:", event);
            if(self._eventSta){
                cc.audioEngine.playEffect(self.sfxAudioClips[2], false);
                self.eventPass();
                self._eventSta = false;
            }
        });

        this.node.on("player_lovers", function (event) {
            event.stopPropagation();
            // console.log("jin--------event:", event);
            if(self._eventSta){
                // console.log("jin-------lo444");
                self.eventLovers();
                self._eventSta = false;
            }
        });

        this.node.on("player_pass", function (event) {
            event.stopPropagation();
            // console.log("jin--------event:", event);
            if(self._eventSta){
                // console.log("jin-------pass");
                // console.log('情侣撞飞音效')
                self.eventPass();
                self._eventSta = false;
            }
        });
        //noTouch
        this.node.on("noTouch", function (event) {
            event.stopPropagation();
            // console.log("jin--------event:", event);
            if(self._eventSta){
                // console.log("jin-------pass");
                self.eventNoTouch();
                self._eventSta = false;
            }
        });

        this.scheduleOnce(function () {
            self.node.removeFromParent();
        }, 180);
        this._anim_0 = this.lovers_1.node.getComponent(cc.Animation);
        this._anim_1 = this.lovers_2.node.getComponent(cc.Animation);
    },  

    creatorLovers(num){
        //随机 情侣 单身狗
        var tmpRandom = RndNum(0,9);
        if(num){
            this._manSta = num;
        }else{
            if(tmpRandom == 0){
                this._manSta = 1;
            }else{
                this._manSta = 2;
            }
        }

        // console.log("jin-------manSta:", this._manSta);
        this.loadImg(this._manSta);
    },

    eventLovers(){
        var self = this;
        //停止事件监听666。地图。情侣停止移动666 播放恶搞表情动画（lovers）
        if(cc.g_Game.invincible){
            this.ani_fly();
            return
        }
        if(this._manSta == 1){
            // console.log("jin------牵到单身狗");
            cc.audioEngine.playEffect(this.sfxAudioClips[2], false);
            //单身狗消失 显示player_2
            console.log("jin---------this._tmpSigleImg: ", typeof this._tmpSigleImg);
            cc.g_Game.invincibleNum = this._tmpSigleImg;
            this.node.dispatchEvent(new cc.Event.EventCustom('invincible', true));
            this.node.active = false;
            this.node.removeFromParent();
            // console.log("jin---------清理撞击的点");
        }else if(this._manSta == 2){
            this.node.dispatchEvent(new cc.Event.EventCustom('game_over', true));

            this.ani_LoverRun(this._tmpImg_L, 1, "l");
            this.ani_LoverRun(this._tmpImg_R, 1, "r");
            this._eventSta = true;

            cc.audioEngine.playEffect(this.sfxAudioClips[0], false);
        }
    },

    eventPass(){
        //停止事件监听。播放飞天动画。打开事件监听666
        var self = this;
        this.ani_bang.node.active = true;
        var _anim = this.ani_bang.node.getComponent(cc.Animation);
        
        if(cc.g_Game.invincible){
            this.ani_fly();
            cc.g_Game.breakUpNum++;
            cc.audioEngine.playEffect(self.sfxAudioClips[2], false);
            _anim.play('bangBang');
            this.scheduleOnce(function () {
                self.ani_bang.node.active = false;
            },0.1);
            return
        }
        if(this._manSta == 1){
            // console.log("jin------牵到单身狗");
            //单身狗消失 显示player_2
            cc.g_Game.invincibleNum = this._tmpSigleImg;
            this.node.dispatchEvent(new cc.Event.EventCustom('invincible', true));
            this.node.active = false;
            this.node.removeFromParent();
            // console.log("jin---------清理撞击的点");
        }else if(this._manSta == 2){
            this.ani_fly();
            cc.g_Game.breakUpNum++;
            // console.log("jin---------清理撞击的点5555");
            //普通撞击通过     音效
            cc.audioEngine.playEffect(this.sfxAudioClips[1], false);
            _anim.play('bangBang');
            this.scheduleOnce(function () {
                self.ani_bang.node.active = false;
            },0.1);
        }
    },

    eventNoTouch(){
        var self = this;
        if(cc.g_Game.invincible){
            if(this._manSta == 2){
                //单身狗消失 显示player_2
                cc.g_Game.breakUpNum++;
            }
            this.ani_fly();
            return
        }

        if(this._manSta == 2 ){//|| this._manSta == 1
            //单身狗消失 显示player_2
            this.node.dispatchEvent(new cc.Event.EventCustom('game_over2', true));
            this._eventSta = true;
            cc.audioEngine.playEffect(this.sfxAudioClips[0], false);
        }
    },

    loadImg(manSta){
        var self = this;
        // if(manSta == 1){//加载单身图片，改变位置
            cc.loader.loadResDir("single", cc.SpriteFrame, function (err, spriteFrame) {
                if (err) {
                    console.log("Loading resource fail.");
                    cc.director.loadScene("Loading");
                }

                self.sprite_singleMan = spriteFrame;
                if(manSta == 1){
                    //单身狗
                    var tmpImg = RndNum(0,2);
                    var tmpSex = RndNum(0,1);
                    // console.log("jin----------lovers_1", self.lovers_1.node.getComponents(cc.Sprite)[0], self.sprite_singleMan[tmpImg]);
                    self.lovers_1.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpImg];
                    self.lovers_1.node.setPosition(0, -100);
                    self.lovers_2.node.setPosition(0, -100);
                    if(tmpSex == 0){
                        self.ani_LoverRun(tmpImg, 0, "l");
                        // self.ani_runL(tmpImg);
                        self._tmpSigleImg = tmpImg;
                        self.lovers_2.node.active = false;
                        self.lovers_1.node.setPosition(50, -100);
                    }else if(tmpSex == 1){
                        self.ani_LoverRun(tmpImg + 3, 0, "r");
                        // self.ani_runR(tmpImg);
                        self._tmpSigleImg = tmpImg + 3;
                        self.lovers_1.node.active = false;
                        self.lovers_2.node.setPosition(-50, -100);
                    }
                }else if(manSta == 2){

                    // //lovers_l
                    // var tmpLover_l = RndNum(0, 2);
                    // self.lovers_1.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpLover_l];
                    // self.ani_runL(tmpLover_l);
                    // self._tmpImg_L = tmpLover_l;
                    

                    // //lovers_r
                    // var tmpLover_r = RndNum(3, 5);
                    // self.lovers_2.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpLover_r];
                    // self.ani_runR(tmpLover_r - 3);
                    // self._tmpImg_R = tmpLover_r - 3;

                    // 
                    //lovers_l
                    var tmpLover_l = RndNum(0, 5);
                    self.lovers_1.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpLover_l];
                    if(tmpLover_l >= 3 && tmpLover_l <= 5){
                        self.lovers_1.node.scaleX = -1;
                        self.lovers_1.node.anchorX = 0;
                    }
                    self.ani_LoverRun(tmpLover_l, 0, "l");
                    self._tmpImg_L = tmpLover_l;

                    var tmpLover_r = RndNum(0, 5);
                    if(tmpLover_r == tmpLover_l){
                        tmpLover_r = RndNum(0, 5);
                        if(tmpLover_r == tmpLover_l){
                            tmpLover_r = RndNum(0, 5);
                        }
                    }
                    self.lovers_2.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpLover_r];
                    if(tmpLover_r >= 0 && tmpLover_r <= 2){
                        self.lovers_2.node.scaleX = -1;
                        self.lovers_2.node.anchorX = 1;
                    }
                    self.ani_LoverRun(tmpLover_r, 0, "r");
                    self._tmpImg_R = tmpLover_r;
                    // self.lovers_1.node.getComponents(cc.Sprite)[0].spriteFrame = self.sprite_singleMan[tmpLover_l];
                    // self.ani_runL(tmpLover_l);
                    // self._tmpImg_L = tmpLover_l;
                }
            });
    },

    ani_LoverRun(num, sta, location){  //  NULL:run  1:angry 
        var aniNum = "";
        
        if(!sta){
            if(num == 0){
                aniNum = 'blackBoy';
            }else if(num == 1){
                aniNum = 'muscle';
            }else if(num == 2){
                aniNum = 'capBoy';
            }else if(num == 3){
                aniNum = 'blackGril';
            }else if(num == 4){
                aniNum = 'blondGril';
            }else if(num == 5){
                aniNum = 'brownGril';
            }
            if(location == "l"){
                this._anim_0.play(aniNum);
            }else if(location == "r"){
                this._anim_1.play(aniNum);
            }
        }else{
            if(num == 0){
                aniNum = 'SblackBoy';
            }else if(num == 1){
                aniNum = 'Smuscle';
            }else if(num == 2){
                aniNum = 'ScapBoy';
            }else if(num == 3){
                aniNum = 'SblackGril';
            }else if(num == 4){
                aniNum = 'SblondGril';
            }else if(num == 5){
                aniNum = 'SbrownGril';
            }
            if(location == "l"){
                this._anim_0.play(aniNum);
            }else if(location == "r"){
                this._anim_1.play(aniNum);
            }
        }
    },

    //飞天动画
    ani_fly(){
        var self = this;
        var spawn_1 = cc.spawn(
            cc.moveTo(0.8, cc.p(this.lovers_1.node.x - 600, this.lovers_1.node.y + 800)), 
            cc.rotateBy(0.8, -1080)
        );

        var spawn_2 = cc.spawn(
            cc.moveTo(0.8, cc.p(this.lovers_2.node.x + 600, this.lovers_2.node.y + 800)), 
            cc.rotateBy(0.8, 1080)
        );
        //动画结束后销毁
        // console.log("jin---------feisi9");
        this.lovers_2.node.runAction(spawn_2);
        this.lovers_1.node.runAction(cc.sequence(spawn_1, cc.callFunc(()=>{
            // console.log("jin---------清理撞击的点");
            self.node.removeFromParent();
        })));
        // cc.g_Game.breakUpNum++;
    },

    update (dt) {
        // if(this.node.x){
        //     console.log("jin---------this.node.x: ", this.node.y);
        // } 
    },
});
