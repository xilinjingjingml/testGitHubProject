
export default class FBUtils {
	static _inst = null;
	static get inst() {
		if (!FBUtils._inst) {
			FBUtils._inst = new FBUtils();
		}
		return FBUtils._inst;
	}

	needDailyReward = true;
	shouldPostUpdates = false;

	getImgBase64(target, width, height) {

		let renderTexture = new cc.RenderTexture(width, height);
		renderTexture.begin();
		target._sgNode.visit();
		renderTexture.end();
		//
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
	}

	shareAsync(base64Img, text) {
		return FBInstant.shareAsync({
			intent: "INVITE",
			image: base64Img,
			text: text || "Hey buddy, Come and play with me!",
		});
	}

	chooseAsync(opt = {}) {
		return FBInstant.context.chooseAsync(opt)
	}

	updateCunstom(info = {}) {
		return FBInstant.updateAsync({
			action: 'CUSTOM',
			cta: info.cta || 'Play now',
			image: info.image,
			text: info.text || 'Play with me!',
			template: info.template || 'VILLAGE_INVASION',
			data: info.data,
			strategy: info.strategy || 'IMMEDIATE',
			notification: info.notification || 'NO_PUSH'
		});
	}

	updateLeaderboard(leaderboardName, text) {
		return FBInstant.updateAsync({
			action: 'LEADERBOARD',
			name: leaderboardName,
			text: text
		});
	}

	getID() {
		return FBInstant.player.getID();
	}

	getName() {
		return FBInstant.player.getName();
	}

	getPhoto() {
		return FBInstant.player.getPhoto();
	}

	getcontextId() {
		return FBInstant.context.getID();
	}

	getcontextType() {
		return FBInstant.context.getType();
	}

	getcontextPlayers() {
		return FBInstant.context.getPlayersAsync();
	}

	_friends = null;
	getFriends() {
		return new Promise((resolve, reject) => {
			if (!!this._friends) {
				resolve(this._friends);
			} else {
				FBInstant.player.getConnectedPlayersAsync()
					.then((players) => {
						resolve(this._friends = players || []);
					})
					.catch((err) => {
						resolve(this._friends = []);
					});
			}
		});
	}

	entryData() {
		return FBInstant.getEntryPointData();
	}

	logEvent(eventName, eventDetails) {
		return FBInstant.logEvent(eventName, 1, eventDetails);
	}

	playerData = {};

	getPlayerData(keyArray = []) {
		return FBInstant.player.getDataAsync(keyArray);
	}

	setPlayerData(dataObject = {}) {
		return FBInstant.player.setDataAsync(dataObject);
	}

	getLanguage() {
		return FBInstant.getLocale();
	}

	rAdInstance = null;
	rAdId = '867845816738454_889496371240065';
	rAdLoaded = false;

	preloadRewardedAd() {
		FBInstant.getRewardedVideoAsync(this.rAdId)
			.then((rewarded) => {
				this.rAdInstance = rewarded;
				return rewarded.loadAsync();
			}).then(() => {
				console.log('Rewarded ad preloaded SUCCESS');
				this.rAdLoaded = true;
			}).catch((err) => {
				console.error(`Rewarded ad preload failed: ${JSON.stringify(err)}`);

				this.rAdLoaded = false;
				this.rAdInstance = null;
				window.setTimeout(() => this.preloadRewardedAd(), 1000);
			});
	}

	tryShowRewardedAd() {
		return new Promise((resolve, reject) => {
			if (this.rAdLoaded) {
				return this.rAdInstance.showAsync()
					.then(() => {
						this.rAdInstance = null;
						this.rAdLoaded = false;
						this.preloadRewardedAd();
						resolve(true);
					})
					.catch((err) => {
						console.log(`show rewarded ad failed ${JSON.stringify(err)}`);
						resolve(false);
					});
			} else {
				resolve(false);
			}
		});
	}

	iAdInstance = null;
	iAdId = '867845816738454_906577859531916';
	iAdLoaded = false;

	preloadInterstitialAd() {
		FBInstant.getInterstitialAdAsync(this.iAdId)
			.then((inter) => {
				this.rAdInstance = inter;
				return inter.loadAsync();
			}).then(() => {
				console.log('Interstitial ad preloaded SUCCESS');
				this.iAdLoaded = true;
			}).catch((err) => {
				console.error(`Interstitial ad preload failed: ${JSON.stringify(err)}`);

				this.iAdLoaded = false;
				this.iAdInstance = null;
				window.setTimeout(() => this.preloadInterstitialAd(), 1000);
			});
	}

	tryShowInterstitialAd() {
		return new Promise((resolve, reject) => {
			if (this.iAdLoaded) {
				return this.iAdInstance.showAsync()
					.then(() => {
						this.iAdInstance = null;
						this.iAdLoaded = false;
						this.preloadInterstitialAd();
						resolve(true);
					})
					.catch((err) => {
						console.log(`show interstitial ad failed ${JSON.stringify(err)}`);
						resolve(false);
					});
			} else {
				resolve(false);
			}
		});
	}

	//Utils
	newDayCheck(lastStamp, nowStamp) {
		let now = new Date(nowStamp);
		let last = new Date(lastStamp);
		return nowStamp > lastStamp && now.getFullYear() >= last.getFullYear() && now.getMonth() >= last.getMonth() && now.getDate() > last.getDate();
	}
}
