//=============================================================================
// _scenes.js
//=============================================================================

'use strict';

//========================================================a=====================

/**
 * The Superclass of all scene within the game.
 *
 * @class Scene_Base
 * @constructor
 * @extends Stage
 */
class Scene_Base extends PIXI.display.Stage {
    /**
     * Create a instance of Scene_Base.
     *
     * @instance
     * @memberof Scene_Base
     */
    constructor() {
        super();
        this._active = false;
        this._reserved = false;
        this._fadeSign = 0;
        this._fadeDuration = 0;
        this._fadeSprite = null;
        this._imageReservationId = Utils.generateRuntimeId();
    }

    /**
     * Attach a reservation to the reserve queue.
     *
     * @method attachReservation
     * @instance
     * @memberof Scene_Base
     */
    attachReservation() {
        ImageManager.setDefaultReservationId(this._imageReservationId);
    };

    /**
     * Remove the reservation from the Reserve queue.
     *
     * @method detachReservation
     * @instance
     * @memberof Scene_Base
     */
    detachReservation() {
        ImageManager.releaseReservation(this._imageReservationId);
    };

    reservedForGUI() {
        this._reserved = true;
    }

    /**
     * Create the components and add them to the rendering process.
     *
     * @method create
     * @instance
     * @memberof Scene_Base
     */
    create() {
    };

    createWhiteBackground() {
        this._background = new ScreenSprite();
        this._background.setWhite();
        this._background.alpha = 1;
        this.addChild(this._background);
    }

    /**
     * Returns whether the scene is active or not.
     *
     * @method isActive
     * @instance
     * @memberof Scene_Base
     * @return {Boolean} return true if the scene is active
     */
    isActive() {
        return this._active;
    };

    /**
     * Return whether the scene is ready to start or not.
     *
     * @method isReady
     * @instance
     * @memberof Scene_Base
     * @return {Boolean} Return true if the scene is ready to start
     */
    isReady() {
        return ImageManager.isReady();
    };

    /**
     * Return whether the scene is a pop-up or not.
     *
     * @method isGUI
     * @instance
     * @memberof Scene_Base
     * @return {Boolean} Return true if it is a pop-up
     */
    isGUI() {
        return false;
    };

    /**
     * Return whether the scene is reserved or not.
     *
     * @method isReserved
     * @instance
     * @memberof Scene_Base
     * @return {Boolean} Return true if it is reserved.
     */
    isReserved() {
        return this._reserved;
    }

    /**
     * Start the scene processing.
     *
     * @method start
     * @instance
     * @memberof Scene_Base
     */
    start() {
        this._active = true;
    };

    /**
     * Continue the scene processing.
     *
     * @method continue
     * @instance
     * @memberof Scene_Base
     */
    resume() {
        this._active = true;
    }

    /**
     * Update the scene processing each new frame.
     *
     * @method update
     * @instance
     * @memberof Scene_Base
     */
    update() {
        this.updateFade();
        this.updateChildren();
    };

    /**
     * Stop the scene processing.
     *
     * @method stop
     * @instance
     * @memberof Scene_Base
     */
    stop() {
        this._active = false;
    };

    /**
     * Return whether the scene is busy or not.
     *
     * @method isBusy
     * @instance
     * @memberof Scene_Base
     * @return {Boolean} Return true if the scene is currently busy
     */
    isBusy() {
        return this._fadeDuration > 0;
    };

    /**
     * Terminate the scene before switching to a another scene.
     *
     * @method terminate
     * @instance
     * @memberof Scene_Base
     */
    terminate() {
    };

    /**
     * Create the layer for the windows children
     * and add it to the rendering process.
     *
     * @method createWindowLayer
     * @instance
     * @memberof Scene_Base
     */
    createWindowLayer() {
        let width = Graphics.boxWidth;
        let height = Graphics.boxHeight;
        let x = (Graphics.width - width) / 2;
        let y = (Graphics.height - height) / 2;
        this._windowLayer = new WindowLayer();
        this._windowLayer.move(x, y, width, height);
        this.addChild(this._windowLayer);
    };

    /**
     * Add the children window to the windowLayer processing.
     *
     * @method addWindow
     * @instance
     * @memberof Scene_Base
     */
    addWindow(window) {
        this._windowLayer.addChild(window);
    };

    /**
     * Request a fadeIn screen process.
     *
     * @method startFadeIn
     * @param {Number} [duration=30] The time the process will take for fadeIn the screen
     * @param {Boolean} [white=false] If true the fadein will be process with a white color else it's will be black
     *
     * @instance
     * @memberof Scene_Base
     */
    startFadeIn(duration, white) {
        this.createFadeSprite(white);
        this._fadeSign = 1;
        this._fadeDuration = duration || 30;
        this._fadeSprite.opacity = 255;
    };

    /**
     * Request a fadeOut screen process.
     *
     * @method startFadeOut
     * @param {Number} [duration=30] The time the process will take for fadeOut the screen
     * @param {Boolean} [white=false] If true the fadeOut will be process with a white color else it's will be black
     *
     * @instance
     * @memberof Scene_Base
     */
    startFadeOut(duration, white) {
        this.createFadeSprite(white);
        this._fadeSign = -1;
        this._fadeDuration = duration || 30;
        this._fadeSprite.opacity = 0;
    };

    /**
     * Create a Screen sprite for the fadein and fadeOut purpose and
     * add it to the rendering process.
     *
     * @method createFadeSprite
     * @instance
     * @memberof Scene_Base
     */
    createFadeSprite(white) {
        if (!this._fadeSprite) {
            this._fadeSprite = new ScreenSprite();
            this.addChild(this._fadeSprite);
        }
        if (white) {
            this._fadeSprite.setWhite();
        } else {
            this._fadeSprite.setBlack();
        }
    };

    /**
     * Update the screen fade processing.
     *
     * @method updateFade
     * @instance
     * @memberof Scene_Base
     */
    updateFade() {
        if (this._fadeDuration > 0) {
            let d = this._fadeDuration;
            if (this._fadeSign > 0) {
                this._fadeSprite.opacity -= this._fadeSprite.opacity / d;
            } else {
                this._fadeSprite.opacity += (255 - this._fadeSprite.opacity) / d;
            }
            this._fadeDuration--;
        }
    };

    /**
     * Update the children of the scene EACH frame.
     *
     * @method updateChildren
     * @instance
     * @memberof Scene_Base
     */
    updateChildren() {
        this.children.forEach(function (child) {
            if (child.update) {
                child.update();
            }
        });
    };

    /**
     * Pop the scene from the stack array and switch to the
     * previous scene.
     *
     * @method popScene
     * @instance
     * @memberof Scene_Base
     */
    popScene() {
        SceneManager.pop();
    };

    /**
     * Check whether the game should be triggering a gameover.
     *
     * @method checkGameover
     * @instance
     * @memberof Scene_Base
     */
    checkGameover() {
        if ($gameParty.isAllDead()) {
            SceneManager.goto(Scene_Gameover);
        }
    };

    /**
     * Slowly fade out all the visual and audio of the scene.
     *
     * @method fadeOutAll
     * @instance
     * @memberof Scene_Base
     */
    fadeOutAll() {
        let time = this.slowFadeSpeed() / 60;
        AudioManager.fadeOutBgm(time);
        AudioManager.fadeOutBgs(time);
        AudioManager.fadeOutMe(time);
        this.startFadeOut(this.slowFadeSpeed());
    };

    /**
     * Return the screen fade speed value.
     *
     * @method fadeSpeed
     * @instance
     * @memberof Scene_Base
     * @return {Number} Return the fade speed
     */
    fadeSpeed() {
        return 24;
    };

    /**
     * Return a slow screen fade speed value.
     *
     * @method slowFadeSpeed
     * @instance
     * @memberof Scene_Base
     * @return {Number} Return the fade speed
     */
    slowFadeSpeed() {
        return this.fadeSpeed() * 2;
    };
}

//-----------------------------------------------------------------------------
// Scene_Boot
//
// The scene class for initializing the entire game.

class Scene_Boot extends Scene_Base {
    constructor() {
        super();
        this._startDate = Date.now();
    }

    create() {
        super.create();
        DataManager.loadDatabase();
        ConfigManager.load();
        this.loadSystemWindowImage();
    };

    loadSystemWindowImage() {
        ImageManager.reserveSystem('Window');
    };

    static loadSystemImages() {
        ImageManager.reserveSystem('IconSet');
        ImageManager.reserveSystem('Balloon');
        ImageManager.reserveSystem('Shadow1');
        ImageManager.reserveSystem('Shadow2');
        ImageManager.reserveSystem('Damage');
        ImageManager.reserveSystem('States');
        ImageManager.reserveSystem('Weapons1');
        ImageManager.reserveSystem('Weapons2');
        ImageManager.reserveSystem('Weapons3');
        ImageManager.reserveSystem('ButtonSet');
    };

    isReady() {
        if (super.isReady()) {
            return DataManager.isDatabaseLoaded() && this.isGameFontLoaded();
        } else {
            return false;
        }
    };

    isGameFontLoaded() {
        if (Graphics.isFontLoaded('GameFont')) {
            return true;
        } else if (!Graphics.canUseCssFontLoading()) {
            let elapsed = Date.now() - this._startDate;
            if (elapsed >= 60000) {
                throw new Error('Failed to load GameFont');
            }
        }
    };

    start() {
        super.start();
        SoundManager.preloadImportantSounds();
        if (DataManager.isBattleTest()) {
            DataManager.setupBattleTest();
            SceneManager.goto(Scene_Battle);
        } else if (DataManager.isEventTest()) {
            DataManager.setupEventTest();
            SceneManager.goto(Scene_Map);
        } else {
            this.checkPlayerLocation();
            DataManager.setupNewGame();
            SceneManager.goto(Scene_Title);
            Window_StartMenu.initCommandPosition();
        }
        this.updateDocumentTitle();
    };

    updateDocumentTitle() {
        document.title = $dataSystem.gameTitle;
    };

    checkPlayerLocation() {
        if ($dataSystem.startMapId === 0) {
            throw new Error('Player\'s starting position is not set');
        }
    };
}

//-----------------------------------------------------------------------------
// Scene_Title
//
// The scene class of the title screen.

class Scene_Title extends Scene_Base {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createBackground();
        this.createForeground();
        this.createWindowLayer();
        this.createCommandWindow();
    };

    start() {
        super.start();
        SceneManager.clearStack();
        this.centerSprite(this._backSprite1);
        this.centerSprite(this._backSprite2);
        this.playTitleMusic();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    resume() {
        super.resume();
        this._commandWindow.show();
    }

    stop() {
        super.stop();
        SceneManager.snapForBackground();
    }

    isBusy() {
        return this._commandWindow.isClosing() || super.isBusy();
    };

    terminate() {
        super.terminate();
        SceneManager.snapForBackground();
    };

    createBackground() {
        this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
        this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    createForeground() {
        this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this.addChild(this._gameTitleSprite);
        if ($dataSystem.optDrawTitle) {
            this.drawGameTitle();
        }
    };

    drawGameTitle() {
        let x = 20;
        let y = Graphics.height / 4;
        let maxWidth = Graphics.width - x * 2;
        let text = $dataSystem.gameTitle;
        this._gameTitleSprite.bitmap.outlineColor = 'black';
        this._gameTitleSprite.bitmap.outlineWidth = 8;
        this._gameTitleSprite.bitmap.fontSize = 72;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    };

    centerSprite(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    createCommandWindow() {
        this._commandWindow = new Window_StartMenu();
        this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
        this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('exit', this.commandExit.bind(this));
        this._commandWindow.setHandler('edit', this.commandEditMode.bind(this));
        this.addWindow(this._commandWindow);
        this._commandWindow.open();
    };

    commandNewGame() {
        DataManager.setupNewGame();
        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };

    commandContinue() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Load);
    };

    commandOptions() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Options);
    };

    commandExit() {
        this._commandWindow.close();
        SceneManager.exit();
    };

    commandEditMode() {
        if (Utils.isNwjs() && Utils.isOptionValid('test')) {
            history.replaceState(null, '', location.href.replace('index', 'Gheum/Gheum'));
            location.reload();
        }
    }

    playTitleMusic() {
        AudioManager.playBgm($dataSystem.titleBgm);
        AudioManager.stopBgs();
        AudioManager.stopMe();
    };
}

//-----------------------------------------------------------------------------
// Scene_StageOpening
//
// The scene class of the title screen.

class Scene_StageOpening extends Scene_Base {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createBackground();
        this.createForeground();
        this.createWindowLayer();
        this.createCommandWindow();
    };

    start() {
        super.start();
        SceneManager.clearStack();
        this.centerSprite(this._backSprite1);
        this.centerSprite(this._backSprite2);
        this.playTitleMusic();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    resume() {
        super.resume();
        this._commandWindow.show();
    }

    stop() {
        super.stop();
        SceneManager.snapForBackground();
    }

    isBusy() {
        return this._commandWindow.isClosing() || super.isBusy();
    };

    terminate() {
        super.terminate();
        SceneManager.snapForBackground();
    };

    createBackground() {
        this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
        this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    createForeground() {
        this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this.addChild(this._gameTitleSprite);
        if ($dataSystem.optDrawTitle) {
            this.drawGameTitle();
        }
    };

    drawGameTitle() {
        let x = 20;
        let y = Graphics.height / 4;
        let maxWidth = Graphics.width - x * 2;
        let text = $dataSystem.gameTitle;
        this._gameTitleSprite.bitmap.outlineColor = 'black';
        this._gameTitleSprite.bitmap.outlineWidth = 8;
        this._gameTitleSprite.bitmap.fontSize = 72;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    };

    centerSprite(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    createCommandWindow() {
        this._commandWindow = new Window_StartMenu();
        this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
        this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('exit', this.commandExit.bind(this));
        this._commandWindow.setHandler('edit', this.commandEditMode.bind(this));
        this.addWindow(this._commandWindow);
        this._commandWindow.open();
    };

    commandNewGame() {
        DataManager.setupNewGame();
        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };

    commandContinue() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Load);
    };

    commandOptions() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Options);
    };

    commandExit() {
        this._commandWindow.close();
        SceneManager.exit();
    };

    commandEditMode() {
        if (Utils.isNwjs() && Utils.isOptionValid('test')) {
            history.replaceState(null, '', location.href.replace('index', 'Gheum/Gheum'));
            location.reload();
        }
    }

    playTitleMusic() {
        AudioManager.playBgm($dataSystem.titleBgm);
        AudioManager.stopBgs();
        AudioManager.stopMe();
    };
}

//-----------------------------------------------------------------------------
// Scene_StageEnding
//
// The scene class of the title screen.

class Scene_StageEnding extends Scene_Base {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createBackground();
        this.createForeground();
        this.createWindowLayer();
        this.createCommandWindow();
    };

    start() {
        super.start();
        SceneManager.clearStack();
        this.centerSprite(this._backSprite1);
        this.centerSprite(this._backSprite2);
        this.playTitleMusic();
        this.startFadeIn(this.fadeSpeed(), false);
    };

    resume() {
        super.resume();
        this._commandWindow.show();
    }

    stop() {
        super.stop();
        SceneManager.snapForBackground();
    }

    isBusy() {
        return this._commandWindow.isClosing() || super.isBusy();
    };

    terminate() {
        super.terminate();
        SceneManager.snapForBackground();
    };

    createBackground() {
        this._backSprite1 = new Sprite(ImageManager.loadTitle1($dataSystem.title1Name));
        this._backSprite2 = new Sprite(ImageManager.loadTitle2($dataSystem.title2Name));
        this.addChild(this._backSprite1);
        this.addChild(this._backSprite2);
    };

    createForeground() {
        this._gameTitleSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this.addChild(this._gameTitleSprite);
        if ($dataSystem.optDrawTitle) {
            this.drawGameTitle();
        }
    };

    drawGameTitle() {
        let x = 20;
        let y = Graphics.height / 4;
        let maxWidth = Graphics.width - x * 2;
        let text = $dataSystem.gameTitle;
        this._gameTitleSprite.bitmap.outlineColor = 'black';
        this._gameTitleSprite.bitmap.outlineWidth = 8;
        this._gameTitleSprite.bitmap.fontSize = 72;
        this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
    };

    centerSprite(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    };

    createCommandWindow() {
        this._commandWindow = new Window_StartMenu();
        this._commandWindow.setHandler('newGame', this.commandNewGame.bind(this));
        this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('exit', this.commandExit.bind(this));
        this._commandWindow.setHandler('edit', this.commandEditMode.bind(this));
        this.addWindow(this._commandWindow);
        this._commandWindow.open();
    };

    commandNewGame() {
        DataManager.setupNewGame();
        this._commandWindow.close();
        this.fadeOutAll();
        SceneManager.goto(Scene_Map);
    };

    commandContinue() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Load);
    };

    commandOptions() {
        this._commandWindow.hide();
        this.reservedForGUI();
        SceneManager.push(Scene_Options);
    };

    commandExit() {
        this._commandWindow.close();
        SceneManager.exit();
    };

    commandEditMode() {
        if (Utils.isNwjs() && Utils.isOptionValid('test')) {
            history.replaceState(null, '', location.href.replace('index', 'Gheum/Gheum'));
            location.reload();
        }
    }

    playTitleMusic() {
        AudioManager.playBgm($dataSystem.titleBgm);
        AudioManager.stopBgs();
        AudioManager.stopMe();
    };
}

//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

class Scene_Map extends Scene_Base {
    constructor() {
        super();
        this._waitCount = 0;
        this._encounterEffectDuration = 0;
        this._mapLoaded = false;
        this._touchCount = 0;
    }

    create() {
        super.create();
        this._transfer = $gamePlayer.isTransferring();
        let mapId = this._transfer ? $gamePlayer.newMapId() : $gameMap.mapId();
        DataManager.loadMapData(mapId);
    };

    isReady() {
        if (!this._mapLoaded && DataManager.isMapLoaded()) {
            this.onMapLoaded();
            this._mapLoaded = true;
        }
        return this._mapLoaded && super.isReady();
    };

    onMapLoaded() {
        if (this._transfer) {
            $gamePlayer.performTransfer();
        }
        this.createDisplayObjects();
    };

    start() {
        super.start();
        SceneManager.clearStack();
        if (this._transfer) {
            this.fadeInForTransfer();
            this._mapNameWindow.open();
            $gameMap.autoplay();
        } else if (this.needsFadeIn()) {
            this.startFadeIn(this.fadeSpeed(), false);
        }
    };

    update() {
        this.updateDestination();
        this.updateMainMultiply();
        if (this.isSceneChangeOk()) {
            this.updateScene();
        } else if (SceneManager.isNextScene(Scene_Battle)) {
            this.updateEncounterEffect();
        }
        this.updateWaitCount();
        super.update();
    };

    updateMainMultiply() {
        this.updateMain();
        if (this.isFastForward()) {
            this.updateMain();
        }
    };

    updateMain() {
        let active = this.isActive();
        $gameMap.update(active);
        $gamePlayer.update(active);
        $gameTimer.update(active);
        $gameScreen.update();
    };

    isFastForward() {
        return ($gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || TouchInput.isLongPressed()));
    };

    stop() {
        super.stop();
        if (SceneManager._nextScene) {
            switch (SceneManager._nextScene.constructor) {
                case Scene_Menu:
                case Scene_Character:
                case Scene_Objectives:
                    SceneManager.snapForBackground();
            }
        }
        $gamePlayer.straighten();
        this._mapNameWindow.close();
        if (this.needsSlowFadeOut()) {
            this.startFadeOut(this.slowFadeSpeed(), false);
        } else if (SceneManager.isNextScene(Scene_Map)) {
            this.fadeOutForTransfer();
        } else if (SceneManager.isNextScene(Scene_Battle)) {
            this.launchBattle();
        }
    };

    isBusy() {
        return ((this._messageWindow && this._messageWindow.isClosing()) ||
            this._waitCount > 0 || this._encounterEffectDuration > 0 ||
            super.isBusy(this));
    };

    terminate() {
        super.terminate();
        if (!SceneManager.isNextScene(Scene_Battle)) {
            this._spriteset.update();
            this._mapNameWindow.hide();
            this._windowLayer.visible = false;
            this._windowLayer.visible = true;
        } else {
            ImageManager.clearRequest();
        }

        if (SceneManager.isNextScene(Scene_Map)) {
            ImageManager.clearRequest();
        }

        $gameScreen.clearZoom();

        this.removeChild(this._fadeSprite);
        this.removeChild(this._mapNameWindow);
        this.removeChild(this._windowLayer);
        this.removeChild(this._spriteset);
    };

    needsFadeIn() {
        return (SceneManager.isPreviousScene(Scene_Battle) ||
            SceneManager.isPreviousScene(Scene_Load));
    };

    needsSlowFadeOut() {
        return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
    };

    updateWaitCount() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    };

    updateDestination() {
        if (this.isMapTouchOk()) {
            this.processMapTouch();
        } else {
            $gameTemp.clearDestination();
            this._touchCount = 0;
        }
    };

    isMapTouchOk() {
        return this.isActive() && $gamePlayer.canMove();
    };

    processMapTouch() {
        if (TouchInput.isTriggered() || this._touchCount > 0) {
            if (TouchInput.isPressed()) {
                if (this._touchCount === 0 || this._touchCount >= 15) {
                    let x = $gameMap.canvasToMapX(TouchInput.x);
                    let y = $gameMap.canvasToMapY(TouchInput.y);
                    $gameTemp.setDestination(x, y);
                }
                this._touchCount++;
            } else {
                this._touchCount = 0;
            }
        }
    };

    isSceneChangeOk() {
        return this.isActive() && !$gameMessage.isBusy();
    };

    updateScene() {
        this.checkGameover();
        if (!SceneManager.isSceneChanging()) {
            this.updateTransferPlayer();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateEncounter();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateCallDebug();
        }
    };

    createDisplayObjects() {
        this.createSpriteset();
        this.createMapNameWindow();
        this.createWindowLayer();
        this.createAllWindows();
    };

    createSpriteset() {
        this._spriteset = new Spriteset_Map();
        this.addChild(this._spriteset);
    };

    createAllWindows() {
        this.createMenuBar();
        this.createMessageWindow();
        this.createScrollTextWindow();
    };

    createMenuBar() {
        this._menuBar = new Window_MenuBar();
        this._menuBar.setHandler('mainmenu', this.onMenuCalled.bind(this));
        this.addWindow(this._menuBar);
    };

    createMapNameWindow() {
        this._mapNameWindow = new Window_MapName();
        this.addChild(this._mapNameWindow);
    };

    createMessageWindow() {
        this._messageWindow = new Window_Message();
        this.addWindow(this._messageWindow);
        this._messageWindow.subWindows().forEach(function (window) {
            this.addWindow(window);
        }, this);
    };

    createScrollTextWindow() {
        this._scrollTextWindow = new Window_ScrollText();
        this.addWindow(this._scrollTextWindow);
    };

    updateTransferPlayer() {
        if ($gamePlayer.isTransferring()) {
            SceneManager.goto(Scene_Map);
        }
    };

    updateEncounter() {
        if ($gamePlayer.executeEncounter()) {
            SceneManager.goto(Scene_Battle);
        }
    };

    onMenuCalled() {
        if (this.isSceneChangeOk()) {
            if (!SceneManager.isSceneChanging() && !$gameMap.isEventRunning()) {
                this.reservedForGUI();
                SceneManager.push(Scene_Menu);
                Window_Menu.initCommandPosition();
                $gameTemp.clearDestination();
                this._mapNameWindow.hide();
                this._waitCount = 2;
            }
        }
    };

    updateCallDebug() {
        if (this.isDebugCalled()) {
            SceneManager.push(Scene_Debug);
        }
    };

    isDebugCalled() {
        return Input.isTriggered('debug') && $gameTemp.isPlaytest();
    };

    fadeInForTransfer() {
        let fadeType = $gamePlayer.fadeType();
        switch (fadeType) {
            case 0:
            case 1:
                this.startFadeIn(this.fadeSpeed(), fadeType === 1);
                break;
        }
    };

    fadeOutForTransfer() {
        let fadeType = $gamePlayer.fadeType();
        switch (fadeType) {
            case 0:
            case 1:
                this.startFadeOut(this.fadeSpeed(), fadeType === 1);
                break;
        }
    };

    launchBattle() {
        BattleManager.saveBgmAndBgs();
        this.stopAudioOnBattleStart();
        SoundManager.playBattleStart();
        this.startEncounterEffect();
        this._mapNameWindow.hide();
    };

    stopAudioOnBattleStart() {
        if (!AudioManager.isCurrentBgm($gameSystem.battleBgm())) {
            AudioManager.stopBgm();
        }
        AudioManager.stopBgs();
        AudioManager.stopMe();
        AudioManager.stopSe();
    };

    startEncounterEffect() {
        this._spriteset.hideCharacters();
        this._encounterEffectDuration = this.encounterEffectSpeed();
    };

    updateEncounterEffect() {
        if (this._encounterEffectDuration > 0) {
            this._encounterEffectDuration--;
            let speed = this.encounterEffectSpeed();
            let n = speed - this._encounterEffectDuration;
            let p = n / speed;
            let q = 2* p ** 2 + 1 ;
            let zoomX = $gamePlayer.screenX();
            let zoomY = $gamePlayer.screenY() - 24;
            if (n === 2) {
                //$gameScreen.setZoom(zoomX, zoomY, 1);
                this.snapForBattleBackground();
                this.startFlashForEncounter(speed / 2);
            }
            $gameScreen.setZoom(zoomX, zoomY, q);
            if (n === Math.floor(speed / 6)) {
                this.startFlashForEncounter(speed / 2);
            }
            if (n === Math.floor(speed / 2)) {
                BattleManager.playBattleBgm();
                this.startFadeOut(this.fadeSpeed());
            }
        }
    };

    snapForBattleBackground() {
        this._windowLayer.visible = false;
        SceneManager.snapForBackground();
        this._windowLayer.visible = true;
    };

    startFlashForEncounter(duration) {
        let color = [255, 255, 255, 255];
        $gameScreen.startFlash(color, duration);
    };

    encounterEffectSpeed() {
        return 60;
    };
}

//-----------------------------------------------------------------------------
// Scene_MenuBase
//
// The superclass of all the menu-type scenes.

class Scene_MenuBase extends Scene_Base {
    constructor() {
        super()
    }

    create() {
        super.create();
        this.createBackground();
        this.updateActor();
        this.createWindowLayer();
    };

    actor() {
        return this._actor;
    };

    updateActor() {
        this._actor = $gameParty.menuActor();
    };

    createBackground() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap;
        this.addChild(this._backgroundSprite);
    };

    setBackgroundOpacity(opacity) {
        this._backgroundSprite.opacity = opacity;
    };

    createHelpWindow() {
        this._helpWindow = new Window_Help();
        this.addWindow(this._helpWindow);
    };

    nextActor() {
        $gameParty.makeMenuActorNext();
        this.updateActor();
        this.onActorChange();
    };

    previousActor() {
        $gameParty.makeMenuActorPrevious();
        this.updateActor();
        this.onActorChange();
    };

    onActorChange() {
    };

    isGUI() {
        return true;
    }
}

//-----------------------------------------------------------------------------
// Scene_Menu
//
// The scene class of the menu screen.

class Scene_Menu extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createMenuWindow();
    };

    createMenuWindow() {
        this._menuWindow = new Window_Menu(0, 0);
        this._menuWindow.setHandler('character', this.commandCharacter.bind(this));
        this._menuWindow.setHandler('objectives', this.commandObjectives.bind(this));
        this._menuWindow.setHandler('options', this.commandOptions.bind(this));
        this._menuWindow.setHandler('save', this.commandSave.bind(this));
        this._menuWindow.setHandler('quit', this.commandQuit.bind(this));
        this._menuWindow.setHandler('continue', this.popScene.bind(this));
        this._menuWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._menuWindow);
    };

    commandCharacter() {
        SceneManager.push(Scene_Character);
    };

    commandObjectives() {
        SceneManager.push(Scene_Objectives);
    };

    commandOptions() {
        SceneManager.push(Scene_Options);
    };

    commandSave() {
        SceneManager.push(Scene_Save);
    };

    commandQuit() {
        this.fadeOutAll();
        SceneManager.goto(Scene_Title);
    };
}

//-----------------------------------------------------------------------------
// Scene_Status
//
// The scene class of the status screen.

class Scene_Character extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createCommandWindow();
        this.createGoldWindow();
        this.createStatusWindow();
    };

    start() {
        super.start();
        this._statusWindow.refresh();
    };

    createCommandWindow() {
        this._commandWindow = new Window_Character(0, 0);
        this._commandWindow.setHandler('status', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('items', this.commandItems.bind(this));
        this._commandWindow.setHandler('skills', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('equipments', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    createGoldWindow() {
        this._goldWindow = new Window_Gold(0, 0);
        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
        this.addWindow(this._goldWindow);
    };

    createStatusWindow() {
        this._statusWindow = new Window_CharacterStatus(0, this._commandWindow.height);
        this._statusWindow.height = Graphics.height - this._commandWindow.height;
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };

    commandItems() {
        SceneManager.push(Scene_Item);
    };

    commandPersonal() {
        this._statusWindow.setFormationMode(false);
        this._statusWindow.selectLast();
        this._statusWindow.activate();
        this._statusWindow.setHandler('ok', this.onPersonalOk.bind(this));
        this._statusWindow.setHandler('cancel', this.onPersonalCancel.bind(this));
    };

    commandFormation() {
        this._statusWindow.setFormationMode(true);
        this._statusWindow.selectLast();
        this._statusWindow.activate();
        this._statusWindow.setHandler('ok', this.onFormationOk.bind(this));
        this._statusWindow.setHandler('cancel', this.onFormationCancel.bind(this));
    };

    onPersonalOk() {
        switch (this._commandWindow.currentSymbol()) {
            case 'skills':
                SceneManager.push(Scene_Skill);
                break;
            case 'equipments':
                SceneManager.push(Scene_Equip);
                break;
            case 'status':
                SceneManager.push(Scene_Status);
                break;
        }
    };

    onPersonalCancel() {
        this._statusWindow.deselect();
        this._commandWindow.activate();
    };

    onFormationOk() {
        let index = this._statusWindow.index;
        let actor = $gameParty.members()[index];
        let pendingIndex = this._statusWindow.pendingIndex();
        if (pendingIndex >= 0) {
            $gameParty.swapOrder(index, pendingIndex);
            this._statusWindow.setPendingIndex(-1);
            this._statusWindow.redrawItem(index);
        } else {
            this._statusWindow.setPendingIndex(index);
        }
        this._statusWindow.activate();
    };

    onFormationCancel() {
        if (this._statusWindow.pendingIndex() >= 0) {
            this._statusWindow.setPendingIndex(-1);
            this._statusWindow.activate();
        } else {
            this._statusWindow.deselect();
            this._commandWindow.activate();
        }
    };
}

//-----------------------------------------------------------------------------
// Scene_Status
//
// The scene class of the status screen.

class Scene_Objectives extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createObjectivesWindow();
        this.createHelpWindow();
    };

    start() {
        super.start();
        //this._objectivesWindow.refresh();
    };

    createObjectivesWindow() {
        this._objectivesWindow = new Window_Objectives(0, 0);
        this._objectivesWindow.x = (Graphics.boxWidth - this._objectivesWindow.width)/2;
        this._objectivesWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._objectivesWindow);
    };

    createHelpWindow() {
        let wx = this._objectivesWindow.x;
        let wy = this._objectivesWindow.y + this._objectivesWindow.height;
        let ww = this._objectivesWindow.width;
        let wh = Graphics._boxHeight - wy;
        this._helpWindow = new Window_Help();
        this._helpWindow.x = wx;
        this._helpWindow.y = wy;
        this._helpWindow.width = ww;
        this._helpWindow.height = wh;
        this._objectivesWindow.setHelpWindow(this._helpWindow);
        this.addWindow(this._helpWindow);
    };

}

//-----------------------------------------------------------------------------
// Scene_ItemBase
//
// The superclass of Scene_Item and Scene_Skill.

class Scene_ItemBase extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
    };

    createActorWindow() {
        this._actorWindow = new Window_CharacterActor();
        this._actorWindow.setHandler('ok', this.onActorOk.bind(this));
        this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
        this.addWindow(this._actorWindow);
    };

    item() {
        return this._itemWindow.item();
    };

    user() {
        return null;
    };

    isCursorLeft() {
        return this._itemWindow.index % 2 === 0;
    };

    showSubWindow(window) {
        window.x = this.isCursorLeft() ? Graphics.boxWidth - window.width : 0;
        window.show();
        window.activate();
    };

    hideSubWindow(window) {
        window.hide();
        window.deactivate();
        this.activateItemWindow();
    };

    onActorOk() {
        if (this.canUse()) {
            this.useItem();
        } else {
            SoundManager.playBuzzer();
        }
    };

    onActorCancel() {
        this.hideSubWindow(this._actorWindow);
    };

    determineItem() {
        let action = new Game_Action(this.user());
        let item = this.item();
        action.setItemObject(item);
        if (action.isForFriend()) {
            this.showSubWindow(this._actorWindow);
            this._actorWindow.selectForItem(this.item());
        } else {
            this.useItem();
            this.activateItemWindow();
        }
    };

    useItem() {
        this.playSeForItem();
        this.user().useItem(this.item());
        this.applyItem();
        this.checkCommonEvent();
        this.checkGameover();
        this._actorWindow.refresh();
    };

    activateItemWindow() {
        this._itemWindow.refresh();
        this._itemWindow.activate();
    };

    itemTargetActors() {
        let action = new Game_Action(this.user());
        action.setItemObject(this.item());
        if (!action.isForFriend()) {
            return [];
        } else if (action.isForAll()) {
            return $gameParty.members();
        } else {
            return [$gameParty.members()[this._actorWindow.index]];
        }
    };

    canUse() {
        return this.user().canUse(this.item()) && this.isItemEffectsValid();
    };

    isItemEffectsValid() {
        let action = new Game_Action(this.user());
        action.setItemObject(this.item());
        return this.itemTargetActors().some(function (target) {
            return action.testApply(target);
        }, this);
    };

    applyItem() {
        let action = new Game_Action(this.user());
        action.setItemObject(this.item());
        this.itemTargetActors().forEach(function (target) {
            for (let i = 0; i < action.numRepeats(); i++) {
                action.apply(target);
            }
        }, this);
        action.applyGlobal();
    };

    checkCommonEvent() {
        if ($gameTemp.isCommonEventReserved()) {
            SceneManager.goto(Scene_Map);
        }
    };
}

//-----------------------------------------------------------------------------
// Scene_Item
//
// The scene class of the item screen.

class Scene_Item extends Scene_ItemBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createCategoryWindow();
        this.createItemWindow();
        this.createActorWindow();
    };

    createCategoryWindow() {
        this._categoryWindow = new Window_ItemCategory();
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.y = this._helpWindow.height;
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._categoryWindow);
    };

    createItemWindow() {
        let wy = this._categoryWindow.y + this._categoryWindow.height;
        let wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
        this._categoryWindow.setItemWindow(this._itemWindow);
    };

    user() {
        let members = $gameParty.movableMembers();
        let bestActor = members[0];
        let bestPha = 0;
        for (let i = 0; i < members.length; i++) {
            if (members[i].pha > bestPha) {
                bestPha = members[i].pha;
                bestActor = members[i];
            }
        }
        return bestActor;
    };

    onCategoryOk() {
        this._itemWindow.activate();
        this._itemWindow.selectLast();
    };

    onItemOk() {
        $gameParty.setLastItem(this.item());
        this.determineItem();
    };

    onItemCancel() {
        this._itemWindow.deselect();
        this._categoryWindow.activate();
    };

    playSeForItem() {
        SoundManager.playUseItem();
    };

    useItem() {
        super.useItem();
        this._itemWindow.redrawCurrentItem();
    };
}

//-----------------------------------------------------------------------------
// Scene_Skill
//
// The scene class of the skill screen.

class Scene_Skill extends Scene_ItemBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createSkillTypeWindow();
        this.createStatusWindow();
        this.createItemWindow();
        this.createActorWindow();
    };

    start() {
        super.start();
        this.refreshActor();
    };

    createSkillTypeWindow() {
        let wy = this._helpWindow.height;
        this._skillTypeWindow = new Window_SkillType(0, wy);
        this._skillTypeWindow.setHelpWindow(this._helpWindow);
        this._skillTypeWindow.setHandler('skill', this.commandSkill.bind(this));
        this._skillTypeWindow.setHandler('cancel', this.popScene.bind(this));
        this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._skillTypeWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._skillTypeWindow);
    };

    createStatusWindow() {
        let wx = this._skillTypeWindow.width;
        let wy = this._helpWindow.height;
        let ww = Graphics.boxWidth - wx;
        let wh = this._skillTypeWindow.height;
        this._statusWindow = new Window_SkillStatus(wx, wy, ww, wh);
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };

    createItemWindow() {
        let wx = 0;
        let wy = this._statusWindow.y + this._statusWindow.height;
        let ww = Graphics.boxWidth;
        let wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_SkillList(wx, wy, ww, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._skillTypeWindow.setSkillWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };

    refreshActor() {
        let actor = this.actor();
        this._skillTypeWindow.setActor(actor);
        this._statusWindow.setActor(actor);
        this._itemWindow.setActor(actor);
    };

    user() {
        return this.actor();
    };

    commandSkill() {
        this._itemWindow.activate();
        this._itemWindow.selectLast();
    };

    onItemOk() {
        this.actor().setLastMenuSkill(this.item());
        this.determineItem();
    };

    onItemCancel() {
        this._itemWindow.deselect();
        this._skillTypeWindow.activate();
    };

    playSeForItem() {
        SoundManager.playUseSkill();
    };

    useItem() {
        super.useItem();
        this._statusWindow.refresh();
        this._itemWindow.refresh();
    };

    onActorChange() {
        this.refreshActor();
        this._skillTypeWindow.activate();
    };
}

//-----------------------------------------------------------------------------
// Scene_Skill
//
// The scene class of the skill screen.

class Scene_SkillTree extends Scene_ItemBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createSkillWindow();
        this.createActorWindow();
    };

    start() {
        super.start();
        this.refreshActor();
    };

    createSkillWindow() {
        let wy = this._helpWindow.height;
        this._skillTypeWindow = new Window_SkillTree(0, wy);
        this._skillTypeWindow.setHelpWindow(this._helpWindow);
        this._skillTypeWindow.setHandler('skill', this.commandSkill.bind(this));
        this._skillTypeWindow.setHandler('cancel', this.popScene.bind(this));
        this._skillTypeWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._skillTypeWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._skillTypeWindow);
    };

    refreshActor() {
        let actor = this.actor();
        this._skillTypeWindow.setActor(actor);
        this._statusWindow.setActor(actor);
        this._itemWindow.setActor(actor);
    };

    user() {
        return this.actor();
    };

    commandSkill() {
        this._itemWindow.activate();
        this._itemWindow.selectLast();
    };

    onItemOk() {
        this.actor().setLastMenuSkill(this.item());
        this.determineItem();
    };

    onItemCancel() {
        this._itemWindow.deselect();
        this._skillTypeWindow.activate();
    };

    playSeForItem() {
        SoundManager.playUseSkill();
    };

    useItem() {
        super.useItem();
        this._statusWindow.refresh();
        this._itemWindow.refresh();
    };

    onActorChange() {
        this.refreshActor();
        this._skillTypeWindow.activate();
    };
}

//-----------------------------------------------------------------------------
// Scene_Equip
//
// The scene class of the equipment screen.

class Scene_Equip extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createStatusWindow();
        this.createCommandWindow();
        this.createSlotWindow();
        this.createItemWindow();
        this.refreshActor();
    };

    createStatusWindow() {
        this._statusWindow = new Window_EquipStatus(0, this._helpWindow.height);
        this.addWindow(this._statusWindow);
    };

    createCommandWindow() {
        let wx = this._statusWindow.width;
        let wy = this._helpWindow.height;
        let ww = Graphics.boxWidth - this._statusWindow.width;
        this._commandWindow = new Window_EquipCommand(wx, wy, ww);
        this._commandWindow.setHelpWindow(this._helpWindow);
        this._commandWindow.setHandler('equip', this.commandEquip.bind(this));
        this._commandWindow.setHandler('optimize', this.commandOptimize.bind(this));
        this._commandWindow.setHandler('clear', this.commandClear.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._commandWindow.setHandler('pageup', this.previousActor.bind(this));
        this.addWindow(this._commandWindow);
    };

    createSlotWindow() {
        let wx = this._statusWindow.width;
        let wy = this._commandWindow.y + this._commandWindow.height;
        let ww = Graphics.boxWidth - this._statusWindow.width;
        let wh = this._statusWindow.height - this._commandWindow.height;
        this._slotWindow = new Window_EquipSlot(wx, wy, ww, wh);
        this._slotWindow.setHelpWindow(this._helpWindow);
        this._slotWindow.setStatusWindow(this._statusWindow);
        this._slotWindow.setHandler('ok', this.onSlotOk.bind(this));
        this._slotWindow.setHandler('cancel', this.onSlotCancel.bind(this));
        this.addWindow(this._slotWindow);
    };

    createItemWindow() {
        let wx = 0;
        let wy = this._statusWindow.y + this._statusWindow.height;
        let ww = Graphics.boxWidth;
        let wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_EquipItem(wx, wy, ww, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setStatusWindow(this._statusWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this._slotWindow.setItemWindow(this._itemWindow);
        this.addWindow(this._itemWindow);
    };

    refreshActor() {
        let actor = this.actor();
        this._statusWindow.setActor(actor);
        this._slotWindow.setActor(actor);
        this._itemWindow.setActor(actor);
    };

    commandEquip() {
        this._slotWindow.activate();
        this._slotWindow.select(0);
    };

    commandOptimize() {
        SoundManager.playEquip();
        this.actor().optimizeEquipments();
        this._statusWindow.refresh();
        this._slotWindow.refresh();
        this._commandWindow.activate();
    };

    commandClear() {
        SoundManager.playEquip();
        this.actor().clearEquipments();
        this._statusWindow.refresh();
        this._slotWindow.refresh();
        this._commandWindow.activate();
    };

    onSlotOk() {
        this._itemWindow.activate();
        this._itemWindow.select(0);
    };

    onSlotCancel() {
        this._slotWindow.deselect();
        this._commandWindow.activate();
    };

    onItemOk() {
        SoundManager.playEquip();
        this.actor().changeEquip(this._slotWindow.index, this._itemWindow.item());
        this._slotWindow.activate();
        this._slotWindow.refresh();
        this._itemWindow.deselect();
        this._itemWindow.refresh();
        this._statusWindow.refresh();
    };

    onItemCancel() {
        this._slotWindow.activate();
        this._itemWindow.deselect();
    };

    onActorChange() {
        this.refreshActor();
        this._commandWindow.activate();
    };
}

//-----------------------------------------------------------------------------
// Scene_Status
//
// The scene class of the status screen.

class Scene_Status extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this._statusWindow = new Window_Status();
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._statusWindow.setHandler('pageup', this.previousActor.bind(this));
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };

    start() {
        super.start();
        this.refreshActor();
    };

    refreshActor() {
        let actor = this.actor();
        this._statusWindow.setActor(actor);
    };

    onActorChange() {
        this.refreshActor();
        this._statusWindow.activate();
    };

}

//-----------------------------------------------------------------------------
// Scene_Options
//
// The scene class of the options screen.

class Scene_Options extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createOptionsWindow();
    };

    terminate() {
        super.terminate();
        ConfigManager.save();
    };

    createOptionsWindow() {
        this._optionsWindow = new Window_Options();
        this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._optionsWindow);
    };
}

//-----------------------------------------------------------------------------
// Scene_File
//
// The superclass of Scene_Save and Scene_Load.

class Scene_File extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        DataManager.loadAllSavefileImages();
        this.createHelpWindow();
        this.createListWindow();
    };

    start() {
        super.start();
        this._listWindow.refresh();
    };

    savefileId() {
        return this._listWindow.index + 1;
    };

    createHelpWindow() {
        this._helpWindow = new Window_Help(1);
        this._helpWindow.setText(this.helpWindowText());
        this.addWindow(this._helpWindow);
    };

    createListWindow() {
        let x = 0;
        let y = this._helpWindow.height;
        let width = Graphics.boxWidth;
        let height = Graphics.boxHeight - y;
        this._listWindow = new Window_SavefileList(x, y, width, height);
        this._listWindow.setHandler('ok', this.onSavefileOk.bind(this));
        this._listWindow.setHandler('cancel', this.popScene.bind(this));
        this._listWindow.select(this.firstSavefileIndex());
        this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
        this._listWindow.setMode(this.mode());
        this._listWindow.refresh();
        this.addWindow(this._listWindow);
    };

    mode() {
        return null;
    };

    activateListWindow() {
        this._listWindow.activate();
    };

    helpWindowText() {
        return '';
    };

    firstSavefileIndex() {
        return 0;
    };

    onSavefileOk() {
    };
}

//-----------------------------------------------------------------------------
// Scene_Save
//
// The scene class of the save screen.

class Scene_Save extends Scene_File {
    constructor() {
        super();
    }

    mode() {
        return 'save';
    };

    helpWindowText() {
        return TextManager.saveMessage;
    };

    firstSavefileIndex() {
        return DataManager.lastAccessedSavefileId() - 1;
    };

    onSavefileOk() {
        super.onSavefileOk();
        $gameSystem.onBeforeSave();
        if (DataManager.saveGame(this.savefileId())) {
            this.onSaveSuccess();
        } else {
            this.onSaveFailure();
        }
    };

    onSaveSuccess() {
        SoundManager.playSave();
        StorageManager.cleanBackup(this.savefileId());
        this.popScene();
    };

    onSaveFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    };
}

//-----------------------------------------------------------------------------
// Scene_Load
//
// The scene class of the load screen.

class Scene_Load extends Scene_File {
    constructor() {
        super();
        this._loadSuccess = false;
    }

    terminate() {
        super.terminate();
        if (this._loadSuccess) {
            $gameSystem.onAfterLoad();
        }
    };

    mode() {
        return 'load';
    };

    helpWindowText() {
        return TextManager.loadMessage;
    };

    firstSavefileIndex() {
        return DataManager.latestSavefileId() - 1;
    };

    onSavefileOk() {
        super.onSavefileOk();
        if (DataManager.loadGame(this.savefileId())) {
            this.onLoadSuccess();
        } else {
            this.onLoadFailure();
        }
    };

    onLoadSuccess() {
        SoundManager.playLoad();
        this.fadeOutAll();
        this.reloadMapIfUpdated();
        SceneManager.goto(Scene_Map);
        this._loadSuccess = true;
    };

    onLoadFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    };

    reloadMapIfUpdated() {
        if ($gameSystem.versionId() !== $dataSystem.versionId) {
            $gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
            $gamePlayer.requestMapReload();
        }
    };
}

//-----------------------------------------------------------------------------
// Scene_Shop
//
// The scene class of the shop screen.

class Scene_Shop extends Scene_MenuBase {
    constructor() {
        super();
    }

    prepare(goods, purchaseOnly) {
        this._goods = goods;
        this._purchaseOnly = purchaseOnly;
        this._item = null;
    };

    create() {
        super.create();
        this.createHelpWindow();
        this.createGoldWindow();
        this.createCommandWindow();
        this.createDummyWindow();
        this.createNumberWindow();
        this.createStatusWindow();
        this.createBuyWindow();
        this.createCategoryWindow();
        this.createSellWindow();
    };

    createGoldWindow() {
        this._goldWindow = new Window_Gold(0, this._helpWindow.height);
        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
        this.addWindow(this._goldWindow);
    };

    createCommandWindow() {
        this._commandWindow = new Window_ShopCommand(this._goldWindow.x, this._purchaseOnly);
        this._commandWindow.y = this._helpWindow.height;
        this._commandWindow.setHandler('buy', this.commandBuy.bind(this));
        this._commandWindow.setHandler('sell', this.commandSell.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };

    createDummyWindow() {
        let wy = this._commandWindow.y + this._commandWindow.height;
        let wh = Graphics.boxHeight - wy;
        this._dummyWindow = new Window_Base(0, wy, Graphics.boxWidth, wh);
        this.addWindow(this._dummyWindow);
    };

    createNumberWindow() {
        let wy = this._dummyWindow.y;
        let wh = this._dummyWindow.height;
        this._numberWindow = new Window_ShopNumber(0, wy, wh);
        this._numberWindow.hide();
        this._numberWindow.setHandler('ok', this.onNumberOk.bind(this));
        this._numberWindow.setHandler('cancel', this.onNumberCancel.bind(this));
        this.addWindow(this._numberWindow);
    };

    createStatusWindow() {
        let wx = this._numberWindow.width;
        let wy = this._dummyWindow.y;
        let ww = Graphics.boxWidth - wx;
        let wh = this._dummyWindow.height;
        this._statusWindow = new Window_ShopStatus(wx, wy, ww, wh);
        this._statusWindow.hide();
        this.addWindow(this._statusWindow);
    };

    createBuyWindow() {
        let wy = this._dummyWindow.y;
        let wh = this._dummyWindow.height;
        this._buyWindow = new Window_ShopBuy(0, wy, wh, this._goods);
        this._buyWindow.setHelpWindow(this._helpWindow);
        this._buyWindow.setStatusWindow(this._statusWindow);
        this._buyWindow.hide();
        this._buyWindow.setHandler('ok', this.onBuyOk.bind(this));
        this._buyWindow.setHandler('cancel', this.onBuyCancel.bind(this));
        this.addWindow(this._buyWindow);
    };

    createCategoryWindow() {
        this._categoryWindow = new Window_ItemCategory();
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.y = this._dummyWindow.y;
        this._categoryWindow.hide();
        this._categoryWindow.deactivate();
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.onCategoryCancel.bind(this));
        this.addWindow(this._categoryWindow);
    };

    createSellWindow() {
        let wy = this._categoryWindow.y + this._categoryWindow.height;
        let wh = Graphics.boxHeight - wy;
        this._sellWindow = new Window_ShopSell(0, wy, Graphics.boxWidth, wh);
        this._sellWindow.setHelpWindow(this._helpWindow);
        this._sellWindow.hide();
        this._sellWindow.setHandler('ok', this.onSellOk.bind(this));
        this._sellWindow.setHandler('cancel', this.onSellCancel.bind(this));
        this._categoryWindow.setItemWindow(this._sellWindow);
        this.addWindow(this._sellWindow);
    };

    activateBuyWindow() {
        this._buyWindow.setMoney(this.money());
        this._buyWindow.show();
        this._buyWindow.activate();
        this._statusWindow.show();
    };

    activateSellWindow() {
        this._categoryWindow.show();
        this._sellWindow.refresh();
        this._sellWindow.show();
        this._sellWindow.activate();
        this._statusWindow.hide();
    };

    commandBuy() {
        this._dummyWindow.hide();
        this.activateBuyWindow();
    };

    commandSell() {
        this._dummyWindow.hide();
        this._categoryWindow.show();
        this._categoryWindow.activate();
        this._sellWindow.show();
        this._sellWindow.deselect();
        this._sellWindow.refresh();
    };

    onBuyOk() {
        this._item = this._buyWindow.item();
        this._buyWindow.hide();
        this._numberWindow.setup(this._item, this.maxBuy(), this.buyingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
    };

    onBuyCancel() {
        this._commandWindow.activate();
        this._dummyWindow.show();
        this._buyWindow.hide();
        this._statusWindow.hide();
        this._statusWindow.setItem(null);
        this._helpWindow.clear();
    };

    onCategoryOk() {
        this.activateSellWindow();
        this._sellWindow.select(0);
    };

    onCategoryCancel() {
        this._commandWindow.activate();
        this._dummyWindow.show();
        this._categoryWindow.hide();
        this._sellWindow.hide();
    };

    onSellOk() {
        this._item = this._sellWindow.item();
        this._categoryWindow.hide();
        this._sellWindow.hide();
        this._numberWindow.setup(this._item, this.maxSell(), this.sellingPrice());
        this._numberWindow.setCurrencyUnit(this.currencyUnit());
        this._numberWindow.show();
        this._numberWindow.activate();
        this._statusWindow.setItem(this._item);
        this._statusWindow.show();
    };

    onSellCancel() {
        this._sellWindow.deselect();
        this._categoryWindow.activate();
        this._statusWindow.setItem(null);
        this._helpWindow.clear();
    };

    onNumberOk() {
        SoundManager.playShop();
        switch (this._commandWindow.currentSymbol()) {
            case 'buy':
                this.doBuy(this._numberWindow.number());
                break;
            case 'sell':
                this.doSell(this._numberWindow.number());
                break;
        }
        this.endNumberInput();
        this._goldWindow.refresh();
        this._statusWindow.refresh();
    };

    onNumberCancel() {
        SoundManager.playCancel();
        this.endNumberInput();
    };

    doBuy(number) {
        $gameParty.loseGold(number * this.buyingPrice());
        $gameParty.gainItem(this._item, number);
    };

    doSell(number) {
        $gameParty.gainGold(number * this.sellingPrice());
        $gameParty.loseItem(this._item, number);
    };

    endNumberInput() {
        this._numberWindow.hide();
        switch (this._commandWindow.currentSymbol()) {
            case 'buy':
                this.activateBuyWindow();
                break;
            case 'sell':
                this.activateSellWindow();
                break;
        }
    };

    maxBuy() {
        let max = $gameParty.maxItems(this._item) - $gameParty.numItems(this._item);
        let price = this.buyingPrice();
        if (price > 0) {
            return Math.min(max, Math.floor(this.money() / price));
        } else {
            return max;
        }
    };

    maxSell() {
        return $gameParty.numItems(this._item);
    };

    money() {
        return this._goldWindow.value();
    };

    currencyUnit() {
        return this._goldWindow.currencyUnit();
    };

    buyingPrice() {
        return this._buyWindow.price(this._item);
    };

    sellingPrice() {
        return Math.floor(this._item.price / 2);
    };
}

//-----------------------------------------------------------------------------
// Scene_Name
//
// The scene class of the name input screen.

class Scene_Name extends Scene_MenuBase {
    constructor() {
        super();
    }

    prepare(actorId, maxLength) {
        this._actorId = actorId;
        this._maxLength = maxLength;
    };

    create() {
        super.create();
        this._actor = $gameActors.actor(this._actorId);
        this.createEditWindow();
        this.createInputWindow();
    };

    start() {
        super.start();
        this._editWindow.refresh();
    };

    createEditWindow() {
        this._editWindow = new Window_NameEdit(this._actor, this._maxLength);
        this.addWindow(this._editWindow);
    };

    createInputWindow() {
        this._inputWindow = new Window_NameInput(this._editWindow);
        this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
        this.addWindow(this._inputWindow);
    };

    onInputOk() {
        this._actor.setName(this._editWindow.name());
        this.popScene();
    };
}

//-----------------------------------------------------------------------------
// Scene_Debug
//
// The scene class of the debug screen.

class Scene_Debug extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createRangeWindow();
        this.createEditWindow();
        this.createDebugHelpWindow();
    };

    createRangeWindow() {
        this._rangeWindow = new Window_DebugRange(0, 0);
        this._rangeWindow.setHandler('ok', this.onRangeOk.bind(this));
        this._rangeWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._rangeWindow);
    };

    createEditWindow() {
        let wx = this._rangeWindow.width;
        let ww = Graphics.boxWidth - wx;
        this._editWindow = new Window_DebugEdit(wx, 0, ww);
        this._editWindow.setHandler('cancel', this.onEditCancel.bind(this));
        this._rangeWindow.setEditWindow(this._editWindow);
        this.addWindow(this._editWindow);
    };

    createDebugHelpWindow() {
        let wx = this._editWindow.x;
        let wy = this._editWindow.height;
        let ww = this._editWindow.width;
        let wh = Graphics.boxHeight - wy;
        this._debugHelpWindow = new Window_Base(wx, wy, ww, wh);
        this.addWindow(this._debugHelpWindow);
    };

    onRangeOk() {
        this._editWindow.activate();
        this._editWindow.select(0);
        this.refreshHelpWindow();
    };

    onEditCancel() {
        this._rangeWindow.activate();
        this._editWindow.deselect();
        this.refreshHelpWindow();
    };

    refreshHelpWindow() {
        this._debugHelpWindow.contents.clear();
        if (this._editWindow.active) {
            this._debugHelpWindow.drawTextEx(this.helpText(), 4, 0);
        }
    };

    helpText() {
        if (this._rangeWindow.mode() === 'switch') {
            return 'Enter : ON / OFF';
        } else {
            return ('Left     :  -1\n' +
                'Right    :  +1\n' +
                'Pageup   : -10\n' +
                'Pagedown : +10');
        }
    };
}

//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle screen.

class Scene_Battle extends Scene_Base {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createTextures();
        this.createDisplayObjects();
        this.group.enableSort = true;
    };

    start() {
        super.start();
        this.startFadeIn(this.fadeSpeed(), false);
        BattleManager.playBattleBgm();
        BattleManager.startBattle();
    };

    resume() {
        super.resume();
        this._menuBar.activate();
    }

    update() {
        let active = this.isActive();
        $gameTimer.update(active);
        $gameScreen.update();
        this.updateStatusWindow();
        if (active && !this.isBusy()) {
            this.updateBattleProcess();
        }
        super.update();
    };

    updateBattleProcess() {
        if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
            BattleManager.isBattleEnd()) {
            BattleManager.update();
            this.changeInputWindow();
        }
    };

    isAnyInputWindowActive() {
        return (this._skillWindow.active ||
            this._actorWindow.active ||
            this._enemyWindow.active);
    };

    changeInputWindow() {
        if (BattleManager.isInputting()) {
            if (BattleManager.actor()) {
                this.startSkillSelection();
            } else {
                this.selectNextCommand();
            }
        } else {
            this.endCommandSelection();
        }
    };

    stop() {
        super.stop();
        this._windowLayer.visible = false;
        if (SceneManager._nextScene) {
            switch (SceneManager._nextScene.constructor) {
                case Scene_Menu:
                case Scene_Character:
                case Scene_Objectives:
                    SceneManager.snapForBackground();
            }
        }
        if (this.needsSlowFadeOut()) {
            this.startFadeOut(this.slowFadeSpeed(), false);
        }
        this._windowLayer.visible = true;
    };

    terminate() {
        super.terminate();
        $gameParty.onBattleEnd();
        $gameTroop.onBattleEnd();
        AudioManager.stopMe();
        ImageManager.clearRequest();
    };

    needsSlowFadeOut() {
        return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover) ||
            SceneManager.isNextScene(Scene_Map));
    };

    updateStatusWindow() {
        if ($gameMessage.isBusy()) {
            this._playerBars.close();
            this._enemyBars.close();
            this._skillWindow.close();
            this._menuBar.close();
        } else if (this.isActive() && !this._messageWindow.isClosing()) {
            this._playerBars.open();
            this._enemyBars.open();
            this._menuBar.open();
        }
    };

    isSceneChangeOk() {
        return this.isActive() && !$gameMessage.isBusy();
    };

    createTextures() {
        Sprite_Projectile._createBaseTexture();
    }

    createDisplayObjects() {
        this.createSpriteset();
        this.createLayer();
        this.createWindowLayer();
        this.createAllWindows();
        this.createIndicator();
        BattleManager.setLogWindow(this._logWindow);
        BattleManager.setPlayerBars(this._playerBars);
        BattleManager.setEnemyBars(this._enemyBars);
        BattleManager.setSpriteset(this._spriteset);
        this._logWindow.setSpriteset(this._spriteset);
    };

    createWindowLayer() {
        super.createWindowLayer();
        this._windowLayer.parentGroup = this._spriteset._UIGroup;
    }

    createSpriteset() {
        this._spriteset = new Spriteset_Battle();
        this.addChild(this._spriteset);
    };

    createLayer() {
        this._mainLayer = new PIXI.display.Layer(this._spriteset._mainGroup);
        this._overlayLayer = new PIXI.display.Layer(this._spriteset._overlayGroup);
        this._UILayer = new PIXI.display.Layer(this._spriteset._UIGroup);
        this.addChild(this._mainLayer);
        this.addChild(this._overlayLayer);
        this.addChild(this._UILayer);
    }

    createAllWindows() {
        this.createMenuBar();
        this.createLogWindow();
        this.createPlayerBars();
        this.createEnemyBars();
        this.createHelpWindow();
        this.createSkillWindow();
        this.createActorWindow();
        this.createEnemyWindow();
        this.createMessageWindow();
        this.createScrollTextWindow();

    };

    createIndicator() {
        let indicator = new Sprite_TurnIndicator();
        indicator.x = Graphics.boxWidth / 2;
        indicator.y = 48;
        this.addChild(indicator);
    }

    createMenuBar() {
        this._menuBar = new Window_MenuBar();
        this._menuBar.setHandler('mainmenu', this.onMenuCalled.bind(this));
        this._menuBar.setHandler('character', this.onCharacterCalled.bind(this));
        this._menuBar.setHandler('objectives', this.onObjectivesCalled.bind(this));
        this.addWindow(this._menuBar);
    };

    createLogWindow() {
        this._logWindow = new Window_BattleLog();
        this.addWindow(this._logWindow);
    };

    createPlayerBars() {
        this._playerBars = new Window_PlayerBars();
        this._playerBars.y += this._menuBar.height;
        this.addWindow(this._playerBars);
    };

    createEnemyBars() {
        this._enemyBars = new Window_EnemyBars();
        this._enemyBars.y += this._menuBar.height;
        this.addWindow(this._enemyBars);
    };

    createHelpWindow() {
        this._helpWindow = new Window_BattleHelp(6);
        this._helpWindow.y = this._menuBar.y + this._menuBar.height;
        this._helpWindow.visible = false;
        this.addWindow(this._helpWindow);
    };

    setHelpWindowPosition() {
        this._helpWindow.width = this._skillWindow.width;
        this._helpWindow.x = this._skillWindow.x;
        this._helpWindow.y = this._skillWindow.y - this._helpWindow.height;
    }

    createSkillWindow() {
        this._skillWindow = new Window_BattleSkill();
        this._skillWindow.setHelpWindow(this._helpWindow);
        this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
        this._skillWindow.setHandler('cancel', this.onSkillSelectCancel.bind(this));
        this.addWindow(this._skillWindow);
        this.setHelpWindowPosition();
    };

    createActorWindow() {
        this._actorWindow = new Window_SelectActor(0, 0);
        this._actorWindow.x = this._playerBars.x;
        this._actorWindow.setHandler('ok',     this.onActorOk.bind(this));
        this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
        this.addWindow(this._actorWindow);
    };

    createEnemyWindow() {
        this._enemyWindow = new Window_SelectEnemy(0, this._playerBars.y);
        this._enemyWindow.x = this._playerBars.x;
        this._enemyWindow.setHandler('ok',     this.onEnemyOk.bind(this));
        this._enemyWindow.setHandler('cancel', this.onEnemyCancel.bind(this));
        this.addWindow(this._enemyWindow);
    };

    createMessageWindow() {
        this._messageWindow = new Window_Message();
        this.addWindow(this._messageWindow);
        this._messageWindow.subWindows().forEach(function(window) {
            this.addWindow(window);
        }, this);
    };

    createScrollTextWindow() {
        this._scrollTextWindow = new Window_ScrollText();
        this.addWindow(this._scrollTextWindow);
    };

    refreshStatus() {
        this._playerBars.refresh();
        this._enemyBars.refresh();
    };

    startSkillSelection() {
        this._menuBar.activate();
        this.activateSkillWindow();
    };

    activateSkillWindow() {
        this._skillWindow.setActor(BattleManager.actor());
        this._skillWindow.refresh();
        this._skillWindow.show();
        this._skillWindow.activate();
    };

    selectNextCommand() {
        BattleManager.selectNextCommand();
        this.changeInputWindow();
    };

    selectPreviousCommand() {
        BattleManager.selectPreviousCommand();
        this.changeInputWindow();
    };

    selectActorSelection() {
        this._actorWindow.refresh();
        this._actorWindow.show();
        this._actorWindow.activate();
    };

    onMenuCalled() {
        if (this.isSceneChangeOk()) {
            if (!SceneManager.isSceneChanging()) {
                this.reservedForGUI();
                SceneManager.push(Scene_Menu);
                Window_Menu.initCommandPosition();
            }
        }
    };

    onCharacterCalled() {
        if (this.isSceneChangeOk()) {
            if (!SceneManager.isSceneChanging()) {
                this.reservedForGUI();
                SceneManager.push(Scene_Character);
            }
        }
    }

    onObjectivesCalled() {
        if (this.isSceneChangeOk()) {
            if (!SceneManager.isSceneChanging()) {
                this.reservedForGUI();
                SceneManager.push(Scene_Objectives);
            }
        }
    }

    onActorOk() {
        let action = BattleManager.inputtingAction();
        action.setTarget(this._actorWindow.index);
        this._actorWindow.hide();
        this._skillWindow.hide();
        this.selectNextCommand();
    };

    onActorCancel() {
        this._actorWindow.hide();
        this._skillWindow.show();
        this._skillWindow.activate();
    };

    selectEnemySelection() {
        this._enemyWindow.refresh();
        this._enemyWindow.show();
        this._enemyWindow.select(0);
        this._enemyWindow.activate();
    };

    onEnemyOk() {
        let action = BattleManager.inputtingAction();
        action.setTarget(this._enemyWindow.enemyIndex());
        this._enemyWindow.hide();
        this._skillWindow.hide();
        this.selectNextCommand();
    };

    onEnemyCancel() {
        this._enemyWindow.hide();
        this._skillWindow.show();
        this._skillWindow.activate();
    };

    onSkillOk() {
        let skill = this._skillWindow.item();
        let action = BattleManager.inputtingAction();

        if (!skill.isItem) {
            action.setSkill(skill.id);
            BattleManager.actor().setLastBattleSkill(skill);
        } else {
            action.setItem(skill.id);
            $gameParty.setLastItem(skill);
        }
        this.onSelectAction();
    };

    onSkillSelectCancel() {
        this._skillWindow.activate();
        this._actorWindow.hide();
        this._enemyWindow.hide();
        this.selectPreviousCommand();
    };

    onSelectAction() {
        let action = BattleManager.inputtingAction();
        this._skillWindow.hide();
        if (!action.needsSelection()) {
            this.selectNextCommand();
        } else if (action.isForOpponent()) {
            this.selectEnemySelection();
        } else {
            this.selectActorSelection();
        }
    };

    endCommandSelection() {
        this._menuBar.deactivate();
    };
}

//-----------------------------------------------------------------------------
// Scene_Gameover
//
// The scene class of the game over screen.

class Scene_Gameover extends Scene_Base {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.playGameoverMusic();
        this.createBackground();
    };

    start() {
        super.start();
        this.startFadeIn(this.slowFadeSpeed(), false);
    };

    update() {
        if (this.isActive() && !this.isBusy() && this.isTriggered()) {
            this.goquit();
        }
        super.update();
    };

    stop() {
        super.stop();
        this.fadeOutAll();
    };

    terminate() {
        super.terminate();
        AudioManager.stopAll();
    };

    playGameoverMusic() {
        AudioManager.stopBgm();
        AudioManager.stopBgs();
        AudioManager.playMe($dataSystem.gameoverMe);
    };

    createBackground() {
        this._backSprite = new Sprite();
        this._backSprite.bitmap = ImageManager.loadSystem('GameOver');
        this.addChild(this._backSprite);
    };

    isTriggered() {
        return Input.isTriggered('ok') || TouchInput.isTriggered();
    };

    goquit() {
        SceneManager.goto(Scene_Title);
    };
}
