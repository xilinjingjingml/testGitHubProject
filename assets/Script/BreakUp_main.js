import FBUtils from "./FBUtils";

//随机min~max 之间整数
function RndNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

cc.Class({
    extends: cc.Component,

    properties: {
        player : cc.Node,
        player1 : cc.Sprite,
        layer_playerControl : cc.Sprite,
        bg_node : cc.Node,
        loversArr_node : cc.Node,
        loversPrefab : cc.Prefab,
        animalsPrefab : cc.Prefab,
        player_2 : cc.Sprite,
        player_21 : cc.Sprite,
        breakUpNum : cc.Label,
        light_0 : cc.Sprite,
        light_1 : cc.Sprite,
        runDust_0 : cc.Sprite,
        runDust_1 : cc.Sprite,
        ani_light_0 : null,
        ani_light_1 : null,
        ani_runDust_0 : null,
        ani_runDust_1 : null,

        _tmpX : 0,
        _bgPosY : 0,
        _mapStartPosY : 0,
        _mapNum : 0,                //当前地图数量
        _createdMapNum : 0,         //生成过的地图数
        _mapArr : null,

        _loversPosY : 0,
        _loversPrefab : null,
        _startLoversY : 500,
        _loversNum : 0,             //当前loers数量
        _createdLoverNum : 0,       //生成过的lovers数

        _mapAndLoversSta : false,
        _singleImg : null,
        _anim : null,
        
        //可调节变量
        startSpeed : 0,             //地图与情侣的初始化速度
        AToBSpace : 0,              //出现情侣间隔距离
        addSpeedMul : 0,            //间隔十个 速度增加的百分比
        _addSpeedNum : 0,
        _ooaddSpeed : 0,
        _ooaddSpeedB : 0,
        _playerImg : null,
        _loverAllY : 0,
        
        node_myLife : cc.Node,
        life_0 : cc.Sprite,
        life_1 : cc.Sprite,
        life_2 : cc.Sprite,

        //结算页
        layer_gameOver : cc.Prefab,
        layer_gameOverS : null,
        node_gameOver : cc.Node,

        //暂停页
        node_pause : cc.Node,

        //新手引导页
        node_guide : cc.Node,
        img_light : cc.Sprite,
        _startPause : true,        //新手引导后的暂停界面处理

        //引导用的1.情侣 2.单身
        _guideSta : true,

        //复活页
        node_resurgence : cc.Node,
        _resurgenceSta : 2,        //死后复活机会：1.分享  2.播放广告
        btn_share : cc.Button,
        btn_video : cc.Button,
        btn_quitR : cc.Button,

        //音效
        startAudio:{
            type:cc.AudioSource,
            default:null
        },
        invincibleAudio:{
            type:cc.AudioSource,
            default:null
        },
        //音效
        sfxAudioClips: [cc.AudioClip],

        //ad
        _preloadedRewardedVideo : null,

        //连续撞击锁
        _loversOnOffA : 1,

        //animal
        animalsArr_node : cc.Node,
        _animalsPosY : 0,
        _createdAnimalsNum : 0,
        _animalsNum : 0,

        //share
        l_score : cc.Label,
        l_bestScore : cc.Label,

    },

    // use this for initialization
    onLoad: function () {
         //播放大叔动画
        this._anim = this.player1.node.getComponent(cc.Animation);
        this._anim.play('uncle');
        this.layer_playerControl.node.active = true;
        var self = this;
        this.playerControl();
        this.loadArguments();
        this.loadMapImg();
        this.createGuideLovers();
        this.createLovers();

        //统一销毁
        this.schedule(function () {
            //map
            if(self._mapNum >= 4 && self._mapNum <= 16){
                // console.log("jin-----成成", self._mapNum);
                self.createMap();
            }
            // console.log("jin-----高", (self._createdMapNum - self._mapNum) * 1334, this.bg_node.y-100);
            if((self._createdMapNum - self._mapNum) * 3074 <= -(this.bg_node.y + 3074)){
                //删掉之前的东西
                if(self.bg_node._children[0]){
                    self.bg_node._children[0].destroy();
                    self._mapNum--;
                }
            }

            if((self._createdAnimalsNum - self._animalsNum) * 4099 <= -(this.animalsArr_node.y + 4099)){
                //删掉之前的东西
                if(self.animalsArr_node._children[0]){
                    self.animalsArr_node._children[0].destroy();
                    self._animalsNum--;
                }
            }

            // lovers
            if(self.loversArr_node._children.length >= 4 && self.loversArr_node._children.length <= 20){
                // console.log("jin-----成成", self._loversNum);
                self.createLovers();
            }
        }, 1);

        this.node.on("game_over", function (event) {
            event.stopPropagation();
            self.startPause();
            // console.log("jin-----------game_over:", event);
            //播放“撞到”
            self.gameOver(0);
        });

        this.node.on("game_over2", function (event) {
            event.stopPropagation();
            self.startPause();
            // console.log("jin-----------game_over2222222:", event);
            // 播放“扑倒”
            self.gameOver(1);
        });

        this.node.on("invincible", function (event) {
            event.stopPropagation();
            // console.log("jin-----------invincible:", event.getType());
            if(event.getType() == "invincible"){
                // console.log("jin--------对上了", cc.g_Game.invincibleNum);
                self.invinciblePlay();
                self.createPlayer2(cc.g_Game.invincibleNum);
                self.player_2.node.active = true;
                self.light_0.node.active = true;
                self.light_1.node.active = true;
                self.runDust_0.node.active = true;
                self.runDust_1.node.active = true;
                cc.g_Game.invincible = true;

                //无敌时，加速
                // cc.audioEngine.playEffect(self.sfxAudioClips[0], false);

                // cc.audioEngine.playEffect(self.sfxAudioClips[1], false);
                // cc.g_Game.invincibleSpeed = 2
                // cc.g_Game.breakUpNum++;
                self.scheduleOnce(function() {
                    //播放Player动画
                    cc.g_Game.invincible = false;
                    //正常时，减速
                    // cc.g_Game.invincibleSpeed = 1;
                    self.turnOffIninvincible();
                    self.player_2.node.active = false;
                    self.light_0.node.active = false;
                    self.light_1.node.active = false;
                    self.runDust_0.node.active = false;
                    self.runDust_1.node.active = false;
                    self.invinciblePause();
                }, 8);
            }
        });

        // this.loadAD();
        this.startPlay();
        this.ShowHeartIcon(cc.g_Game.resurgenceNum);
        var action_0 = cc.repeatForever(cc.sequence(cc.fadeOut(1),cc.fadeIn(1)));
        this.img_light.node.runAction(action_0);
    },

    // start(){
    //     console.log(this.getImgBase64());//"jin----------getImgBase64: "
    // },

    //初始化参数
    loadArguments(){
        this._mapStartPosY          = 0;
        this._mapNum                = 0;
        this._createdMapNum         = 0;
        this._loversPrefab          = this.loversPrefab;
        this._startLoversY          = 500;
        this._mapAndLoversSta       = false;
        this.node_pause.active      = false;
        this._startPause            = true;
        this.node_resurgence.active = false;
        this._resurgenceSta         = 2;
        this._guideSta              = true;
        cc.director.getCollisionManager().enabled = true;
    },

    playerControl() {
        this.layer_playerControl.node.on('touchstart', this.onTouchStart, this);
        this.layer_playerControl.node.on('touchmove', this.onTouchMove, this);
        this.layer_playerControl.node.on('touchend', this.onTouchEnd, this);
    },

    loadMapImg(){
        var self = this;
        cc.loader.loadResDir("bg", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
                cc.director.loadScene("Loading");
            }
            // console.log("jin---------sprite.spriteFrame", spriteFrame.length, self._mapStartPosY);
            self._mapArr = spriteFrame;
            self.createMap();
        });
        cc.loader.loadResDir("single", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
                cc.director.loadScene("Loading");
            }
            // console.log("jin---------single sprite.spriteFrame", spriteFrame.length);
            self._singleImg = spriteFrame;
        });
        cc.loader.loadResDir("Character1_img", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
                cc.director.loadScene("Loading");
            }
            // console.log("jin---------single sprite.spriteFrame", spriteFrame.length);
            self._playerImg = spriteFrame;
        });
        //load gameOver Layer
        var layer_gameOvers = cc.instantiate(this.layer_gameOver);
        this.layer_gameOverS = layer_gameOvers.getComponent("l_gameOver");
        // itemJs.initRank(data, i);
        this.node_gameOver.addChild(layer_gameOvers);
    },

    gameOver(num){
        this._mapAndLoversSta = false;
        console.log("jin------l_score: ",cc.g_Game.breakUpNum, this.l_score.string);
        this.l_score.string = cc.g_Game.breakUpNum;
        this.l_bestScore.string = cc.g_Game.bestBreakUpNum;
        //其他事件，1.播放动画(player)，等待3秒钟，显示结束界面 2.保存数据
        this._anim.stop('uncle');
        if(num == 0){
            this.player1.node.getComponents(cc.Sprite)[0].spriteFrame = this._playerImg[0];
        }else{
            this.player1.node.getComponents(cc.Sprite)[0].spriteFrame = this._playerImg[1];
        }
        this.layer_playerControl.node.active = false;
        if(cc.g_Game.resurgenceNum != 0){
            console.log("jin-----resurgence: ");
            this.resurgence();
        }else{
            // this.node_resurgence.active = true;
            // this.node_pause.active = false;
            // console.log("jin-----this.node_pause.active: ", this._guideSta);
            //1.不能 看视频 分享，结算
            if(this._resurgenceSta > 0){
                this.node_resurgence.active = true;
                this.node_pause.active = false;
                this._resurgenceSta--;
            }else{
                // console.log("jin-----_guideSta222: ", this._guideSta);
                this.layer_gameOverS.onShow();
                this.setRankData();
            }
        }
    },

    //最佳成绩
    setRankData(){
        this.layer_gameOverS.setNowScore(cc.g_Game.breakUpNum);
        console.log("jin------------cc.g_Game.bestBreakUpNum:", cc.g_Game.bestBreakUpNum, "cc.g_Game.breakUpNum: ", cc.g_Game.breakUpNum);
        if(cc.g_Game.bestBreakUpNum < cc.g_Game.breakUpNum){
            cc.g_Game.bestBreakUpNum = cc.g_Game.breakUpNum;
            this.layer_gameOverS.setBestScore(cc.g_Game.bestBreakUpNum);
            // console.log("jin----------testLeaderboard");
            if (typeof FBInstant === 'undefined') return;
            FBInstant.getLeaderboardAsync('world_ranking' )//FBInstant.context.getID()
            .then(leaderboard => {
                // console.log("jin------进来了");
                // console.log(leaderboard.getName());
                return leaderboard.setScoreAsync(cc.g_Game.bestBreakUpNum);
            })
            .then(() => console.log('Score saved'))
            .catch(error => console.error(error));
        }else{
            this.layer_gameOverS.setBestScore(cc.g_Game.bestBreakUpNum);
        }
    },

    onTouchStart(event) {
        // this.startPlay();
        // console.log(this.startPlay(),'音效开始播放')
        // console.log('x'+this.player.x,'y'+this.player.y)
        this._vTouchStartPos = event.touch.getLocation();
        if(this._guideSta){
            this._mapAndLoversSta = true;
        }

        // this._mapAndLoversSta = true;
        // this._anim.play('uncle');
    },

    onTouchMove(event) {
        let endpos = event.touch.getLocation();
        var playerPosX = this.player.x;
        let x = -(this._vTouchStartPos.x - endpos.x);
        // let y = this._vTouchStartPos.y - endpos.y;
        // console.log('jin-------touchMove', x); 

        if (this._tmpX != x) {
            this.player.setPosition(playerPosX + (x - this._tmpX), this.player.y);
            this._tmpX = x;
        }
    },

    onTouchEnd(event) {
        let endpos = event.touch.getLocation();
        let x = this._vTouchStartPos.x - endpos.x;
        let y = this._vTouchStartPos.y - endpos.y;
        // console.log('jin-------touchEnd', x, y); 
        this._tmpX = 0;
        // this._mapAndLoversSta = false;
        // this._anim.pause('uncle');
    },

    moveMap(dt){
        this._bgPosY = Math.round(this._bgPosY - this.startSpeed * dt * cc.g_Game.invincibleSpeed * (1 + this._addSpeedNum * this.addSpeedMul));
        if(this._bgPosY >= 1400){
            log("jin----------已到达最大速度");
            this._bgPosY = 1400;
        }
        this.bg_node.setPosition(0, this._bgPosY);
        // console.log("jin-------_bgPos: ", this._bgPosY);
    },

    moveLovers(dt){
        this._loversPosY = Math.round(this._loversPosY - this.startSpeed * dt * cc.g_Game.invincibleSpeed * (1 + this._addSpeedNum * this.addSpeedMul));
        if(this._loversPosY >= 1400){
            this._loversPosY = 1400;
        }
        this.loversArr_node.setPosition(0, this._loversPosY);
    },

    moveAnimals(dt){
        this._animalsPosY = Math.round(this._animalsPosY - this.startSpeed * dt * cc.g_Game.invincibleSpeed * (1 + this._addSpeedNum * this.addSpeedMul));
        if(this._animalsPosY >= 1400){
            this._animalsPosY = 1400;
        }
        this.animalsArr_node.setPosition(0, this._animalsPosY);
    },

    createMap(){
        var self = this;
        for (var i = 0; i < 4; i++) {   //spriteFrame.length
                var tmpY = 0;
                var node = new cc.Node('myNode');
                const sprite = node.addComponent(cc.Sprite);
                sprite.spriteFrame = self._mapArr[i % 4];
                self.bg_node.addChild(node);
                // console.log("jin-------------node:", self._mapStartPosY, self._createdMapNum, self._mapArr[i % 4]._originalSize.height);
                node.setPosition(0, self._mapStartPosY + self._createdMapNum * self._mapArr[i % 4]._originalSize.height); 
                console.log('jin-----------breakUpNum: ', cc.g_Game.breakUpNum);
                if(cc.g_Game.breakUpNum >= 100){
                    this.animalsArr_node.active = true;
                }else{
                    this.animalsArr_node.active = false;
                }
                if(i == 1){
                    // this.scheduleOnce(function () {
                        var tmpX = -300;
                        if(cc.g_Game.breakUpNum <= 7) {
                            tmpX = 1000;
                        }
                        var cell = cc.instantiate(this.animalsPrefab);
                        cell.active = true;
                        cell.getComponent('animals').inst_type = "CROCODILE";
                        this.animalsArr_node.addChild(cell);
                        cell.setPosition(tmpX, self._mapStartPosY + self._createdMapNum * self._mapArr[i % 4]._originalSize.height);
                        self._animalsNum++;
                        self._createdAnimalsNum++;
                }else if(i == 2){
                    // if(cc.g_Game.breakUpNum >= 10) {
                        var tmpX = -290;
                        if(cc.g_Game.breakUpNum <= 100) {
                            tmpX = 1000;
                        }
                        var cell = cc.instantiate(this.animalsPrefab);
                        cell.active = true;
                        cell.getComponent('animals').inst_type = "SHEEP";
                        this.animalsArr_node.addChild(cell);
                        console.log("jin-----------tmpX: ", tmpX, self._animalsNum, self._createdAnimalsNum);
                        cell.setPosition(tmpX, self._mapStartPosY + self._createdMapNum * self._mapArr[i % 4]._originalSize.height);
                        self._animalsNum++;
                        self._createdAnimalsNum++;
                    // }; 
                    
                }else if(i == 3){
                    var tmpX = 300;
                    if(cc.g_Game.breakUpNum <= 100) {
                        tmpX = 1000;
                    }
                    // this.scheduleOnce(function () {
                    var cell = cc.instantiate(this.animalsPrefab);
                    cell.active = true;
                    cell.getComponent('animals').inst_type = "CAMEL";
                    this.animalsArr_node.addChild(cell);
                    cell.setPosition(tmpX, self._mapStartPosY + self._createdMapNum * self._mapArr[i % 4]._originalSize.height);
                    self._animalsNum++;
                    self._createdAnimalsNum++;
                    // }, 1); 
                }else{

                }
                
                self._mapNum++;
                self._createdMapNum++;
        }
    },

    createGuideLovers(){
        var self = this;
        //创建两个单独的：1.情侣  2.单身
        console.log("jin-----createGuideLovers");
        var tmpX = RndNum(-200, 200);
        self.cell_0 = cc.instantiate(this._loversPrefab);
        self.cell_0.active = true;
        self.cell_0.getComponent('lovers_node').creatorLovers(2);
        this.loversArr_node.addChild(self.cell_0);
        this._loverAllY = this._startLoversY;
        self.cell_0.setPosition(tmpX, this._loverAllY);//this._startLoversY + this._createdLoverNum * this.AToBSpace
        this._createdLoverNum++;
        this._loversNum++;

        var tmpX = RndNum(-200, 200);
        self.cell_1 = cc.instantiate(this._loversPrefab);
        self.cell_1.active = true;
        self.cell_1.getComponent('lovers_node').creatorLovers(1);
        this.loversArr_node.addChild(self.cell_1);
        this._loverAllY = this._loverAllY + this.AToBSpace;
        self.cell_1.setPosition(tmpX, this._loverAllY);
        this._createdLoverNum++;
        this._loversNum++;
    },

    createLovers(){
        var self = this;
        var goGo = parseInt(this._loversNum/40);
        if(goGo == this._loversOnOffA){
            var tmpX = RndNum(-200, 200);
            for (var i = 0; i < 4; i++) {
                var tempY =0;
                if(i == 0){
                    tempY = this.AToBSpace;
                }else{
                    tempY = 300;
                }
                console.log('jin------连续');
                let cell = cc.instantiate(this._loversPrefab);
                cell.active = true;
                cell.getComponent('lovers_node').creatorLovers(2);
                this.loversArr_node.addChild(cell);
                console.log("jin-----createLoverssssss: ", tmpX, tempY);
                this._loverAllY = this._loverAllY + tempY;
                cell.setPosition(tmpX, this._loverAllY);
                this._createdLoverNum++;
                this._loversNum++;
                if(i == 3){
                    this._loversOnOffA++;
                }
            }
        }else{
            for (var i = 0; i < 6; i++) {
                var tmpX = RndNum(-200, 200);
                let cell = cc.instantiate(this._loversPrefab);
                cell.active = true;
                cell.getComponent('lovers_node').creatorLovers();
                this.loversArr_node.addChild(cell);
                this._loverAllY = this._loverAllY + this.AToBSpace;
                cell.setPosition(tmpX, this._loverAllY);
                this._createdLoverNum++;
                this._loversNum++;
            }
        }
    },
    

    createPlayer2(num){
        // console.log("jin---------num: ", num, cc.g_Game.invincibleNum);
        this.player_21.node.getComponents(cc.Sprite)[0].spriteFrame = this._singleImg[num];
        //light_0 light_1动画  runDust_0  runDust_1动画 player换图 关闭player动画 换图
        this.ani_light_0 = this.light_0.node.getComponent(cc.Animation);
        this.ani_light_1 = this.light_1.node.getComponent(cc.Animation);
        this.ani_runDust_0 = this.runDust_0.node.getComponent(cc.Animation);
        this.ani_runDust_1 = this.runDust_1.node.getComponent(cc.Animation);

        this.ani_light_0.play('light');
        this.ani_light_1.play('light');
        this.ani_runDust_0.play('runDust');
        this.ani_runDust_1.play('runDust');
        this._anim.pause('uncle');

        if(cc.g_Game.invincibleNum >= 0 && cc.g_Game.invincibleNum < 3){
            this.player1.node.getComponents(cc.Sprite)[0].spriteFrame = this._playerImg[2];
            this.runDust_0.node.setPosition(-11, this.runDust_0.node.y);
        }else if(cc.g_Game.invincibleNum >= 3 && cc.g_Game.invincibleNum < 6){
            // console.log("jin----------------this.runDust_0.node.x: ", this.runDust_0.node.x);
            this.player1.node.getComponents(cc.Sprite)[0].spriteFrame = this._playerImg[3];
            this.runDust_0.node.setPosition(7, this.runDust_0.node.y);
        }
    },

    //关闭无敌状态
    turnOffIninvincible(){
        this.ani_light_0.pause('light');
        this.ani_light_1.pause('light');
        this.ani_runDust_0.pause('runDust');
        this.ani_runDust_1.pause('runDust');
        this._anim.play('uncle');
    },

    resurgence(){
        var self = this;
        if(self.node_resurgence.active){
            self.node_resurgence.active = false;
        }
        if(cc.g_Game.resurgenceNum > 0){
            cc.g_Game.resurgenceNum = cc.g_Game.resurgenceNum - 1;
            self.ShowHeartIcon(cc.g_Game.resurgenceNum);
        }

        self.scheduleOnce(function() {
            self.startPause();
            self.invinciblePlay();
            //1.打开 复活页 一个人的无敌 2.关闭 暂停页 控制板
            // cc.g_Game.invincible    = true;
            self.layer_playerControl.node.active = false;
            // console.log("jin--------self.light_1.node.active: ", self.light_1.node.active);
            self.light_0.node.active = true;
            self._mapAndLoversSta = false;
            self.player.setPosition(this.player.x, this.player.y - 300);
            self._anim.play('uncle');
            // 1.关闭触摸事件监听 2.播放从后面跑到前面动画 3.打开监听
            var action_0 = cc.moveTo(1.4, cc.p(this.player.x, this.player.y+300));
            self.player.runAction(cc.sequence(action_0, self.invincibleFunc(),cc.delayTime(1.5), cc.callFunc(()=>{
               
                self._mapAndLoversSta = true;
                cc.g_Game.invincible = false;
                self.light_0.node.active = false;
                self.startPlay();
                self.invinciblePause();
            })));
        },2);
    },

    //复活
    invincibleFunc(){
        var self = this;
        self.layer_playerControl.node.active = true;
        cc.g_Game.invincible  = true;
        self._mapAndLoversSta = true;
        self.node_pause.active = false;
    },

    //加载广告
    loadAD(){
        console.log("jin-----加载广告了");
        var self = this;

        FBInstant.getRewardedVideoAsync(
            '867845816738454_889496371240065', // Your Ad Placement Id
        ).then(function(rewarded) {
            // Load the Ad asynchronously
            console.log("jin-----加载广告了111");
            self._preloadedRewardedVideo = rewarded;
            return self._preloadedRewardedVideo.loadAsync();
        }).then(function() {
            console.log("jin-----加载广告了222");
            console.log('Rewarded video preloaded')
        }).catch(function(err){
            self.scheduleOnce(function () {
                console.log("jin------重新进入广告加载");
                self.loadAD();
            }, 3);
            console.error('Rewarded video failed to preload: ' + err.message);
        });
    },

    //播放广告
    playAD(){
        console.log("jin-----加载广告了333");
        var self = this;
        self._preloadedRewardedVideo.showAsync()
        .then(function() {
            // Perform post-ad success operation
            self.btn_video.node.active = false;
            self.resurgence();
            console.log('Rewarded video watched successfully');
        })
    },

    ShowHeartIcon(num){
        console.log("jin-----num: ", num);
        if(num == 3){
            this.life_0.node.active = true;
            this.life_1.node.active = true;
            this.life_2.node.active = true;
        }else if(num == 2){
            this.life_0.node.active = true;
            this.life_1.node.active = true;
            this.life_2.node.active = false;
        }else if(num == 1){
            this.life_0.node.active = true;
            this.life_1.node.active = false;
            this.life_2.node.active = false;
        }else if(num == 0){
            this.life_0.node.active = false;
            this.life_1.node.active = false;
            this.life_2.node.active = false;
        }
    },

    //跳入开始页面，播放音效
    startPlay:function(){
        this.startAudio.play();
    },

    startPause:function(){
        this.startAudio.pause();
    },

    invinciblePlay:function(){
        this.invincibleAudio.play();
    },

    invinciblePause:function(){
        this.invincibleAudio.pause();
    },



    onClikeGuide(){
        var self = this;
        this.node_guide.active = false;
        
    },

    onClikePlayVideo(){
        console.log("jin------------onClikePlayVideo");
        this.playAD();
    },

    // 分享功能
    onClikeShare(){
        var self = this;
        // console.log("jin------------onClikeShare");
        if (typeof FBInstant === 'undefined') return;

        const onSuc = () => {
            console.log(`choose success`);
            FBUtils.inst.updateCunstom({
                image: this.getImgBase64(),
                text: 'How many couples did you break up today?',
            })
            .catch((err) => {
                console.log(`update error ${err}`);
            });
            self.btn_share.node.active = false;
            self.resurgence();
        }

        FBUtils.inst.chooseAsync()
        .then(onSuc)
        .catch((err) => {
            console.log(`choose error: ${err}`);
            if(err.code === "SAME_CONTEXT") {
                onSuc();
            }
        });
    },

    onClikeGameOver(){
        // console.log("jin------------onClikeGameOver");
        this.node_resurgence.active = false;
        this.layer_gameOverS.onShow();
        this.setRankData();
    },

    onClikeGoHome(){
        // console.log("jin------------onClikeGoHome");
        cc.director.loadScene("login_breakeUp");
    },

    // 截屏返回 iamge base6，用于 Share
    getImgBase64 () {
        // let sp = cc.find('Canvas/New Sprite(Splash)').getComponent(cc.Sprite);
        let target = cc.find('Canvas/node_share');
        let width = 300, height = 157;
        let renderTexture = new cc.RenderTexture(width, height);
        renderTexture.begin();
        target._sgNode.visit();
        renderTexture.end();
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {
            let texture = renderTexture.getSprite().getTexture();
            let image = texture.getHtmlElementObj();
            ctx.drawImage(image, 0, 0);
        }
        else if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            let buffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
            let texture = renderTexture.getSprite().getTexture()._glID;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            let data = new Uint8Array(width * height * 4);
            gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            let rowBytes = width * 4;
            for (let row = 0; row < height; row++) {
                let srow = height - 1 - row;
                let data2 = new Uint8ClampedArray(data.buffer, srow * width * 4, rowBytes);
                let imageData = new ImageData(data2, width, 1);
                ctx.putImageData(imageData, 0, row);
            }
        }
        return canvas.toDataURL('image/png');
    },

    // called every frame
    update: function (dt) {
        if(this._mapAndLoversSta){
            //移动地图 情侣
            // console.log("jin------move");
            this.moveMap(dt);
            this.moveLovers(dt);
            this.moveAnimals(dt);
            this._startPause = false;
            this.node_pause.active = false;
        }else{
            if(!this._startPause && !this._guideSta){
                this.node_pause.active = true;
            }
        }

        //同步player2位置
        if(cc.g_Game.invincibleNum >= 0 && cc.g_Game.invincibleNum < 3){
            this.player_2.node.setPosition(this.player.x - 85, this.player.y);
        }else if(cc.g_Game.invincibleNum >= 3 && cc.g_Game.invincibleNum < 6){
            this.player_2.node.setPosition(this.player.x + 78, this.player.y);
        }

        //显示分数
        // console.log("jin------------this.breakUpNum.node.string: ", this.breakUpNum.string, cc.g_Game.breakUpNum);
        this.breakUpNum.string = cc.g_Game.breakUpNum;

        this._ooaddSpeed = Math.ceil(cc.g_Game.breakUpNum / 20)

        if(cc.g_Game.breakUpNum % 20 == 0 && cc.g_Game.breakUpNum){
            // console.log("jin------------this._addSpeedNum: ", this._addSpeedNum, this._ooaddSpeed, this._ooaddSpeedB);
            if(this._ooaddSpeed != this._ooaddSpeedB){
                // console.log("jin------------this._addSpeedNum: ", this._addSpeedNum);
                this._ooaddSpeedB = this._ooaddSpeed;
                this._addSpeedNum++;
            }
        }
    },
    
});
