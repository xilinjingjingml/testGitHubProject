
cc.Class({
    extends: cc.Component,

    properties: {
        challengeNode: cc.Node,
        challengeScore: cc.RichText,
        bestScore: cc.RichText,

        replyNode: cc.Node,
        selfHeader: cc.Sprite,
        oppoHeader: cc.Sprite,
        selfScore: cc.RichText,
        oppoScore: cc.RichText,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.challengeNode.opacity = this.replyNode.opacity = 0;
    },

    // update (dt) {},

    loadUrlImage(url) {
        return new Promise((resolve, reject) => {
            cc.loader.load(url, (err, texture) => {
                if (err) {
                    resolve(null);
                } else {
                    resolve(texture);
                }
            })
        });
    },

    setChallengeData(selfScore, bestScore, cb) {
        this.replyNode.opacity = 0;
        this.challengeNode.opacity = 255;
        // const [hw, hh] = [45, 45];

        this.challengeScore.string = `<outline color=#0 width=2>${selfScore}</outline>`;
        this.bestScore.string = `<outline color=#0 width=2>${bestScore}</outline>`;

        cb && cb();
        // this.loadUrlImage(selfHeader)
        //     .then((texture) => {
        //         if (texture && this.replyNode.isValid) {
        //             this.challengeHeader.spriteFrame = new cc.SpriteFrame(texture);
        //             this.selfHeader.node.width = hw;
        //             this.selfHeader.node.height = hh;
        //         }
        //     })
        //     .then(() => cb && cb());
    },

    setReplyData(selfHeader, selfScore, oppoHeader, oppoScore, cb) {
        this.challengeNode.opacity = 0;
        this.replyNode.opacity = 255;
        const [hw, hh] = [45, 45];

        const loadImageAsync = (url, target) => this.loadUrlImage(url)
            .then((texture) => {
                if (texture && target.isValid) {
                    target.spriteFrame = new cc.SpriteFrame(texture);
                    target.node.width = hw;
                    target.node.height = hh;
                }
            });

        this.selfScore.string = `<outline color=#0 width=2>${selfScore}</outline>`;
        this.oppoScore.string = `<outline color=#0 width=2>${oppoScore}</outline>`;

        Promise.all([loadImageAsync(selfHeader, this.selfHeader), loadImageAsync(oppoHeader, this.oppoHeader)])
            .then(() => cb && cb());
    }
});
