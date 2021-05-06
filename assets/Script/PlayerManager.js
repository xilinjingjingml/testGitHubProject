import FBUtils from "./FBUtils";

export default class PlayerManager {
    static _inst = null;
    static get inst() {
        if(!PlayerManager._inst) {
            PlayerManager._inst = new PlayerManager();
        }
        return PlayerManager._inst;
    }

    _coin = 0;
    get coin() {
        return this._coin;
    }
    
    initCoinNum(num) {
        this._coin = num;
    }

    addCoin(num, push = true) {
        this._coin += num;
        FBUtils.inst.playerData.coin = this._coin;

        push && FBUtils.inst.setPlayerData({coin: this._coin});

        return this._coin;
    }

    _currentCharacterId = 0;
    initcurrentCharacterId(id){
        this._currentCharacterId = id || 0;
    }

    get currentCharacterId() {
        return this._currentCharacterId;
    }

    changeCurrentCharacterId(id ,push = true) {
        this._currentCharacterId = id;
        push && FBUtils.inst.setPlayerData({currentCharacterId: this._currentCharacterId});
    }
    
    _characterDetailsList = [
        {
            manID : 0,
            btn : 2,     //按钮状态：0：ADS  1:GOLD  2:没有按钮
            // buySta : 1,  //0 : 没有拥有  1：拥有
            buyNum : 0,
        },
        {
            manID : 1,
            btn : 0,     //按钮状态：0：ADS  1:GOLD
            // buySta : 1,  //0 : 没有拥有  1：拥有
            buyNum : 0, 
        },
        {
            manID : 2,
            btn : 1,     //按钮状态：0：ADS  1:GOLD
            // buySta : 0,  //0 : 没有拥有  1：拥有
            buyNum : 500,  
        },
        {
            manID : 3,
            btn : 1,     //按钮状态：0：ADS  1:GOLD
            // buySta : 0,  //0 : 没有拥有  1：拥有
            buyNum : 1000,  
        },
        {
            manID : 4,
            btn : 1,     //按钮状态：0：ADS  1:GOLD
            buySta : 0,  //0 : 没有拥有  1：拥有
            buyNum : 1500, 
        },
        {
            manID : 5,
            btn : 1,     //按钮状态：0：ADS  1:GOLD
            // buySta : 0,  //0 : 没有拥有  1：拥有
            buyNum : 2000,  
        }
    ]

    get characterDetailsList() {
        return this._characterDetailsList;
    }

    _characterList = [] //0 : 没有拥有  1：拥有

    initCharacterList(arr) {
        this._characterList = arr || [];
    }

    get characterList() {
        return this.characterList;
    }

    hasCharacter(id) {
        return id !== NaN && this._characterList.some(v => v === id);
    }

    unlockCharacter(id) {
        if(id !== NaN && this._characterList.indexOf(id) < 0) {
            this._characterList.push(id);
            //push fb data
        }
    }
}
