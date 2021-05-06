import FBUtils from "./FBUtils";
import PlayerManager from "./PlayerManager";

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onCollectRewarded() {
        const inst = FBUtils.inst;
        inst.needDailyReward = false;
        PlayerManager.inst.addCoin(200, false);
        inst.playerData.lastDailyRewardTime = Date.now();
        inst.setPlayerData({coin: PlayerManager.inst.coin, lastDailyRewardTime: FBUtils.inst.playerData.lastDailyRewardTime});
        
        this.node.destroy();
    }
});
