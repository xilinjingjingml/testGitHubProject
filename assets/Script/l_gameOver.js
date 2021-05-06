import FBUtils from "./FBUtils";

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        nowScore: cc.Label,
        bestScore: cc.Label,
        btn_GoHome: cc.Button,

        // sp_0 : cc.Sprite,
        // sp_1 : cc.Sprite,
        // sp_2 : cc.Sprite,
        // sp_3 : cc.Sprite,
        // sp_4 : cc.Sprite,
        // score_0 : cc.Label,
        // score_1 : cc.Label,
        // score_2 : cc.Label,
        // score_3 : cc.Label,
        // score_4 : cc.Label,
        // nowScore : cc.Label,
        // bestScore : cc.Label,
    },

    onLoad() {
        var action = cc.repeatForever(cc.sequence(cc.scaleTo(0.6, 1.1, 1.1), cc.scaleTo(0.6, 0.9, 0.9)));
        this.btn_GoHome.node.runAction(action);
    },

    //设置成绩
    setNowScore(s1) {
        this.nowScore.string = s1;
    },

    setBestScore(s2) {
        this.bestScore.string = s2;
    },

    onShow() {
        this.node.active = true;
        this.tryPostAfterEnd();
    },

    onHide() {
        this.node.active = false;
    },

    //加载好友排行版
    onClikeGoHome() {
        // console.log("jin------------onClikeGoHome");
        cc.director.loadScene("login_breakeUp");
    },

    update(dt) {

    },

    tryPostAfterEnd() {
        const inst = FBUtils.inst;
        if (inst.shouldPostUpdates && inst.getcontextId()) {
            const postNode = cc.find('Canvas/post_node');
            if (!postNode) {
                return;
            }
            inst.shouldPostUpdates = false;
            const comp = postNode.getComponent('PostNode');
            const entryData = inst.entryData();
            if (!entryData || entryData.type !== 'challenge') {
                //send challenge
                comp.setChallengeData(cc.g_Game.breakUpNum, cc.g_Game.bestBreakUpNum, () => {
                    inst.updateCunstom({
                        test: `${inst.getName()} ${cc.g_Game.breakUpNum} Challenge if you refuse to accept it.`,
                        image: inst.getImgBase64(comp.challengeNode, 300, 157),
                        data: { type: 'challenge', playerID: inst.getID(), name: inst.getName(), photo: inst.getPhoto(), score: cc.g_Game.breakUpNum }
                    });
                });
            } else {
                inst.getcontextPlayers()
                    .then((players) => {
                        if (entryData.type === 'challenge' && entryData.playerID !== inst.getID() && players.some(v => v.getID() === entryData.playerID)) {
                            //send reply
                            comp.setReplyData(inst.getPhoto(), cc.g_Game.breakUpNum, entryData.photo, entryData.score, () => {
                                inst.updateCunstom({
                                    test: 'Will you be the next president of the United States?',
                                    image: inst.getImgBase64(comp.replyNode, 300, 157),
                                    data: { type: 'reply' }
                                });
                            });
                        }
                    })
            }
        }
    },
});
