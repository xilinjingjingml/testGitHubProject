import FBUtils from "./FBUtils";
import PlayerManager from "./PlayerManager";

cc.g_Game = {}
cc.g_Game.initData = function(data)
{
    cc.g_Game.userList        = data
    cc.g_Game.invincible      = false;  //无敌状态
    cc.g_Game.invincibleNum   = -1;     //无敌时的图片数
    cc.g_Game.invincibleSpeed = 1;      //无敌速度
    cc.g_Game.breakUpNum      = 0;      //拆开情侣数
    cc.g_Game.bestBreakUpNum  = 0;      //历史最好成绩
    cc.g_Game.resurgenceNum   = 1;      //复活状态
    cc.g_Game.playerData      = {};     //个人信息
    cc.g_Game.Loaded          = false;  //是否加载完毕
}

cc.Class({
    extends: cc.Component,

    properties: {
        img_Crown : null,

        btn_start : cc.Button,
        btn_rank : cc.Button,
        btn_shortcut : cc.Button,
        btn_rankShare : cc.Button,
        item_rank : cc.Prefab,
        rank_friend : cc.Sprite,
        rank_world : cc.Sprite,
        shortcut_shuoMing :　cc.Sprite,

        //排行榜
        node_rank : cc.Node,
        img_me : cc.Sprite,
        head_me : cc.Sprite,
        name_me :　cc.Label,
        score_me : cc.Label,
        rankingNum_me : cc.Label,

        worldLayout : cc.Node,
        friendLayout : cc.Node,
        world_scrollView : cc.Node,
        friend_scrollView : cc.Node,
        
        //弹窗
        node_tip : cc.Node,
        icon_noSupport : cc.Sprite,
        btn_shareToGame : cc.Button,
        btn_toGame : cc.Button,

        _selfWorldRankNum : 0,
        _selfFriendRankNum : 0,

        panel_layer: cc.Node,
        character_layer : cc.Node,

        daily_panel_prefab: cc.Prefab,
        character_panel_prefab : cc.Prefab,

        //loadingImg
        loading_layer : cc.Node,
        loadingImg : cc.Sprite,

        logo : cc.Sprite,

        allPrefab : [cc.Prefab],

        startAudio:{
            type:cc.AudioSource,
            default:null
        },
        node_test : cc.Sprite,
        // _rankSta : true
    },

    onLoad () {
        console.log("jin------------start：接口测试555");
            // this.loadArguments();
            // cc.g_Game.initData([]);
            // PlayerManager.inst.initCharacterList([1,0,0,0,0,0]);
            // PlayerManager.inst.initcurrentCharacterId(0);
            
            if(!cc.g_Game.Loaded){
                cc.g_Game.initData([]);
                this.loadMapImg();
                cc.director.preloadScene('main_breakeUp', function () {
                    cc.log('jin----------Next scene preloaded');
                });

                const playerDataKeys = ['lastEnterTime', 'lastDailyRewardTime', 'coin', 'characterList', 'currentCharacterId'];
                FBInstant.startGameAsync()
                .then(() => FBUtils.inst.getPlayerData(playerDataKeys))
                .then((data) => {
                    
                    if(data && data.lastEnterTime && data.characterList ) {// && data.currentCharacterId == "undefind"
                        //old player
                        const now = Date.now();
                        const lastEnter = data.lastEnterTime;
                        const lastDaily = data.lastDailyRewardTime;

                        FBUtils.inst.needDailyReward = FBUtils.inst.newDayCheck(lastDaily, now);

                        data.lastEnterTime = now;
                        FBUtils.inst.playerData = data;
                        FBUtils.inst.setPlayerData({lastEnterTime: now});

                    }else {
                        //new player
                        const playerData = FBUtils.inst.playerData;
                        playerData.lastEnterTime = Date.now();
                        playerData.lastDailyRewardTime = playerData.coin = 0;
                        playerData.characterList = [1, 0, 0, 0, 0, 0] //0 : 没有拥有  1：拥有
                        playerData.currentCharacterId = 0;
                        FBUtils.inst.setPlayerData(playerData);
                    }
                })
                .then(()=> {
                    this.setPlayerData();
                    this.loadArguments();
                    this.checkDailyPanel();
                    // FBUtils.inst.preloadInterstitialAd();
                })
                .then(() => {
                    const entryData = FBUtils.inst.entryData();
                    if(entryData && entryData.type === 'challenge' && entryData.playerID !== FBUtils.inst.getID()) {
                        FBUtils.inst.shouldPostUpdates = true;
                        this.onStartGameInstantLy();
                    }
                });
            }else {
                this.setPlayerData();
                this.loadArguments();
                this.checkDailyPanel();
                // FBUtils.inst.preloadInterstitialAd();
            }
        this.startPlay();
        this.playAction();
        // this.testLeaderboard();  //排行榜测试
        // this.test();
    },
    
    start() {
        
    },

    loadArguments(){
        this.world_scrollView.active   = false;
        this.friend_scrollView.active  = false;
        cc.g_Game.invincible      = false;  //无敌状态
        cc.g_Game.invincibleNum   = -1;     //无敌时的图片数
        cc.g_Game.invincibleSpeed = 1;      //无敌速度
        cc.g_Game.breakUpNum      = 0;      //拆开情侣数
        cc.g_Game.resurgenceNum   = 1;      //复活状态
    },

    setPlayerData(){
        //1.加载世界。好友榜。自己成绩1  2     2.获取个人最高分
        var self = this;
        self.setUserData();     //获取自己信息
        self.showMyRank();      //自己  世界榜成绩
        self.showWorldRank();   //世界榜
        self.showFriendRank();  //好友榜 && 自己
    },

    setUserData(){
        if(!cc.g_Game.Loaded){
            var info = {
                contextID :   FBInstant.context.getID(),   // 游戏 ID
                contextType : FBInstant.context.getType(), // 游戏类型
                locale :      FBInstant.getLocale(),       // 地区
                platform :    FBInstant.getPlatform(),     // 平台
                sdkVersion :  FBInstant.getSDKVersion(),   // SDK 版本号
                ID :          FBInstant.player.getID()     // playerID
            }
            cc.g_Game.playerData = info;
            PlayerManager.inst.initCoinNum(FBUtils.inst.playerData.coin || 0);
            PlayerManager.inst.initCharacterList(FBUtils.inst.playerData.characterList || [1,0,0,0,0,0]);
            PlayerManager.inst.initcurrentCharacterId(FBUtils.inst.playerData.currentCharacterId || 0);
            cc.g_Game.Loaded = true;
        }
        
        // console.log("jin-------------cc.g_Game.playerData: ", cc.g_Game.playerData);
    },
    
    test(){
        var self = this;
        var _anim_0 = this.node_test.node.getComponent(cc.Animation);
        _anim_0.play('capBoy');
        self.scheduleOnce(function() {
            self.node_test.node.scaleX = -1;
            self.node_test.node.anchorX = 0;
            _anim_0.play('ScapBoy');
        }, 3);
    },


    testLeaderboard(){
        console.log("jin----------testLeaderboard");
        if (typeof FBInstant === 'undefined') return;
        FBInstant.getLeaderboardAsync('world_ranking' )//FBInstant.context.getID()
        .then(leaderboard => {
            console.log("jin------进来了");
            console.log(leaderboard.getName());
            return leaderboard.setScoreAsync(0);
        })
        .then(() => console.log('Score saved'))
        .catch(error => console.error(error));

        //间隔10s后，获取值
    },

    //排行榜API

    // 显示皇冠
    showCrown(num){
        var self = this;
        // console.log("jin-----------num: ",num);
        if(num == 1 || num == 2 || num == 3){
            self.rankingNum_me.node.active = false;
            // console.log('jin----------self.rankingNum_me.node.active:', self.rankingNum_me.node.active);
        }else{
            self.rankingNum_me.node.active = true;
            self.img_me.node.active = false;
            self.rankingNum_me.string = num;
            return
        }
        cc.loader.loadResDir("crown", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
            }
            self.img_me.node.active = true;
            self.img_me.spriteFrame = spriteFrame[num-1];
        });
    },

    showHeadImg(url){
        var self = this;
        var selfNode = self.node;
        // var remoteUrl = "http://unknown.org/someres.png";
        cc.loader.load(url, (err, texture) => {
            if(selfNode.isValid){
                self.head_me.spriteFrame = new cc.SpriteFrame(texture);
                self.head_me.width = 80;
                self.head_me.height = 80;
            }
           
        });
    },

    showName(str){
        return str.substr(0,7);
    },

    showMyRank(){
        var self = this;
        FBInstant
        .getLeaderboardAsync('world_ranking')
        .then(leaderboard => leaderboard.getPlayerEntryAsync())
        .then(entries => {
            // console.log("jin------进来了获得排行榜方法二22");
            console.log(
            entries.getRank() + '. ' +
            entries.getPlayer().getName() + ': ' +
            entries.getScore()
            );
            console.log("jin-----rank: ", entries.getRank());
            if(entries.getRank() == "undefined" || entries.getRank() == null){
                self.btn_rank.node.active = false;
                return;
            }else{
                self.btn_rank.node.active = true;
                self.btn_rank.node.runAction(cc.sequence(cc.scaleTo(0.3, 0.3, 0.3), cc.scaleTo(0.3, 1, 1)));
            }

            //皇冠
            self.showCrown(entries.getRank());
            self.name_me.string  = self.showName(entries.getPlayer().getName());
            self.score_me.string = entries.getScore();
            cc.g_Game.bestBreakUpNum = entries.getScore();
            self.showHeadImg(entries.getPlayer().getPhoto());
            self._selfWorldRankNum = entries.getRank();
        }).catch(error => console.error(error));
    },

    createWorldItem(data, i){
        var item, itemJs;
        item = cc.instantiate(this.item_rank);
        itemJs = item.getComponent("item_rank");
        itemJs.initRank(data, i);
        this.worldLayout.addChild(item);
    },

    createFriendItem(data, i){
        var item, itemJs;
        item = cc.instantiate(this.item_rank);
        itemJs = item.getComponent("item_rank");
        itemJs.initRank(data, i);
        this.friendLayout.addChild(item);
    },

    //世界榜
    showWorldRank(){
        var self = this;
        this.worldLayout.removeAllChildren();
        FBInstant.getLeaderboardAsync('world_ranking')
        .then(leaderboard => leaderboard.getEntriesAsync(100, 0))
        .then(entries => {
            console.log("jin------进来了获得排行榜方法一");
            for (var i = 0; i < entries.length; i++) {
                var data = {};
                data.name    = entries[i].getPlayer().getName();
                data.rankNum = entries[i].getRank();
                data.headImg = entries[i].getPlayer().getPhoto() ;
                data.score   = entries[i].getScore();
                self.createWorldItem(data, i);
            }
        }).catch(error => console.error(error));
    },

    //好友榜
    showFriendRank(){
        var self = this;
        this.worldLayout.removeAllChildren();
        FBInstant.getLeaderboardAsync('world_ranking')
        .then(leaderboard => leaderboard.getConnectedPlayerEntriesAsync(100, 0))
        .then(entries => {
            for (var i = 0; i < entries.length; i++) {
                var data = {};
                data.name    = entries[i].getPlayer().getName();
                data.rankNum = entries[i].getRank();
                data.headImg = entries[i].getPlayer().getPhoto() ;
                data.score   = entries[i].getScore();
                
                if(entries[i].getPlayer().getID() == cc.g_Game.playerData.ID){
                    self._selfFriendRankNum = data.rankNum;
                }
                self.createFriendItem(data, i);
            }
        }).catch(error => console.error(error));
    },

    loadMapImg(){
        var self = this;
        cc.loader.loadResDir("bg", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
            }
        });
        cc.loader.loadResDir("single", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
            }
        });
        cc.loader.loadResDir("Character1_img", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
            }
        });
        cc.loader.loadResDir("animation_img", cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.log("Loading resource fail.");
            }
        });
    },
    //特效
    playAction(){
        var action_0 = cc.scaleTo(0.3, 1.2, 1.2);
        var action_1 = cc.scaleTo(0.2, 0.8, 0.8);
        var action_2 = cc.scaleTo(0.3, 0.9, 0.9);
        var action_3 = cc.scaleTo(0.2, 0.8, 0.8);
        var sequence = cc.sequence(action_0, action_1, action_2, action_3, cc.rotateBy(0.1, 8), cc.rotateBy(0.1, -16), cc.rotateBy(0.1, 16), cc.rotateBy(0.1, -8), cc.delayTime(1));
        this.logo.node.runAction(cc.repeatForever(sequence));

        var action_4 = cc.repeatForever(cc.sequence(cc.fadeOut(2),cc.fadeIn(2)));
        this.shortcut_shuoMing.node.runAction(action_4);
        var action_5 = cc.repeatForever(cc.sequence(cc.scaleTo(0.6, 1.1, 1.1), cc.scaleTo(0.6, 0.9, 0.9)));
        this.btn_rankShare.node.runAction(action_5);

    },

    // 截屏返回 iamge base6，用于 Share
    getImgBase64 (sta) {
        let target = cc.find('Canvas/node_rank');
        let width = 750, height = 1500;
        if(!sta){
            target = cc.find('Canvas');
            width = 750, height = 1500;
        }else{
            target = cc.find('Canvas/img_share1');
            width = 300, height = 157;
        }
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

    startPlay:function(){
        this.startAudio.play();
    },

    startPause:function(){
        this.startAudio.pause();
    },

    onClickeWorldRank(){
        // console.log("jin-------------onClickeWorldRank");
        if (typeof FBInstant === 'undefined') return;
        if(!this.rank_world.node.active){
            this.rank_world.node.active = true;
            this.rank_friend.node.active = false;
            this.world_scrollView.active = true;
            this.friend_scrollView.active = false;
            console.log("jin-------this._selfWorldRankNum: ", this._selfWorldRankNum);
            this.showCrown(this._selfWorldRankNum);
        }
    },

    onClickeFriendRank(){
        // console.log("jin-------------onClickeFriendRank");
        if (typeof FBInstant === 'undefined') return;
        if(!this.rank_friend.node.active){
            this.rank_world.node.active = false;
            this.rank_friend.node.active = true;
            this.world_scrollView.active = false;
            this.friend_scrollView.active = true;
            console.log("jin-------this._selfFriendRankNum: ", this._selfFriendRankNum);
            this.showCrown(this._selfFriendRankNum);
        }
    },

    onClickeQuit(){
        // console.log("jin-------------onClickeQuit");
        this.node_rank.active = false;
    },

    onClickeRank(){
        // console.log("jin-------------onClickeRank");
        if (typeof FBInstant === 'undefined') return;
        this.node_rank.active = true;
        //首先显示世界榜
        this.world_scrollView.active = true;
        this.friend_scrollView.active = false;
    },

    onStartGame(){
        this.node_tip.active = true;
        this.btn_shareToGame.node.active = true;
        this.btn_toGame.node.active = true;
        this.icon_noSupport.node.active = false;
        //animate

        
        // this.loading_layer.active = true;
        // var action = cc.rotateBy(1, 270);
        // this.loadingImg.node.runAction(cc.repeatForever(action));
        // this.startPause();
        // cc.director.loadScene("main_breakeUp");
    },

    onStartGameInstantLy() {
        this.setLoadingStatus(true);
        this.startPause();
        cc.director.loadScene("main_breakeUp");
    },

    onStartFriendsGame() {
        FBUtils.inst.chooseAsync()
        .then(() => {
            FBUtils.inst.shouldPostUpdates = true;
            this.onStartGameInstantLy();
        })
        .catch((err) => {
            console.log(`choose friends game error: ${JSON.stringify(err)}`);
            if(err && err.code == 'SAME_CONTEXT') {
                FBUtils.inst.shouldPostUpdates = true;
                this.onStartGameInstantLy();
            }
        })
    },

    onClickShortcut(){
        var self = this;
        // FBInstant.createShortcutAsync()
        // .then(function() {
        //     console.log("jin------Shortcut created");
        // })
        // .catch(function() {
        //     console.log("jin------Shortcut not created");
        // });
        console.log('jin-------点击快捷方式');
        this.icon_noSupport.node.active = true;
        this.btn_shareToGame.node.active = false;
        this.btn_toGame.node.active = false;

        FBInstant.canCreateShortcutAsync()
        .then(function(canCreateShortcut) {
            console.log('jin-------点击快捷方式' ,canCreateShortcut);
            if (canCreateShortcut) {
            FBInstant.createShortcutAsync()
                .then(function() {
                    console.log("jin------Shortcut created");
                })
                .catch(function() {
                    console.log("jin------Shortcut not created");
                });
            }else{
                //弹框
                self.node_tip.active = true;
                self.scheduleOnce(function(){
                    self.node_tip.active = false;
                    self.icon_noSupport.node.active = false;
                }, 1.5)
            }
        });
    },

    onClickShare(){
        FBInstant.shareAsync({
            intent: 'CHALLENGE',
            image: this.getImgBase64(),
            text: "Let's break up couples!",
            data: {myReplayData: '...'},
        }).then(() => {
            console.log("jin----------状态：CHALLENGE");
        });
    },

    onClikeToGame(){
        console.log("jin----------onClikeToGame");
        this.onStartGameInstantLy();
    },
    
    onClikeShareToGmae(){
        var self = this;
        // cc.g_Game.resurgenceNum = cc.g_Game.resurgenceNum + 2;
        // self.onStartGameInstantLy();
        console.log("jin----------onClikeToGame");

        const onSuc = () => {
            console.log(`choose success`);
            FBUtils.inst.updateCunstom({
                image: this.getImgBase64(1),
                text: 'How many couples did you break up today?'
            })
            .catch((err) => {
                console.log(`update error ${err}`);
            });
            cc.g_Game.resurgenceNum = cc.g_Game.resurgenceNum + 2;
            self.onStartGameInstantLy();
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

    onClickCharacter() {
        console.log("jin---------character: ");
        const CharacterNode = cc.instantiate(this.character_panel_prefab);
        this.character_layer.addChild(CharacterNode);
    },

    checkDailyPanel() {
        if(FBUtils.inst.needDailyReward) {
            //SHOW DAILY REWARD
            const dailyNode = cc.instantiate(this.daily_panel_prefab);
            this.panel_layer.addChild(dailyNode);
        }
    },

    setLoadingStatus(show) {
        this.loading_layer.active = show;
        this.loadingImg.node.stopAllActions();
        if(show) {
            const action = cc.rotateBy(1, 270);
            this.loadingImg.node.runAction(cc.repeatForever(action));
        }
    }
});