//=============================================================================
// _sprites.js
//=============================================================================

'use strict';

//-----------------------------------------------------------------------------
// Sprite_Base
//
// The sprite class with a feature which displays animations.

class Sprite_Base extends Sprite {
    constructor() {
        super();
        this._animationSprites = [];
        this._effectTarget = this;
        this._hiding = false;
    }

    update() {
        super.update();
        this.updateVisibility();
        this.updateAnimationSprites();
    };

    hide() {
        this._hiding = true;
        this.updateVisibility();
    };

    show() {
        this._hiding = false;
        this.updateVisibility();
    };

    updateVisibility() {
        this.visible = !this._hiding;
    };

    updateAnimationSprites() {
        if (this._animationSprites.length > 0) {
            var sprites = this._animationSprites.clone();
            this._animationSprites = [];
            for (var i = 0; i < sprites.length; i++) {
                var sprite = sprites[i];
                if (sprite.isPlaying()) {
                    this._animationSprites.push(sprite);
                } else {
                    sprite.remove();
                }
            }
        }
    };

    startAnimation(animation, mirror, delay) {
        var sprite = new Sprite_Animation();
        sprite.setup(this._effectTarget, animation, mirror, delay);
        this.parent.addChild(sprite);
        this._animationSprites.push(sprite);
    };

    isAnimationPlaying() {
        return this._animationSprites.length > 0;
    };

    //-----------------------------------------------------------------------------
    // Added methods

    drawGraphic(type, obj) {
        var base = new PIXI.Graphics();
        switch (type) {
            case "circle":
                base.lineStyle(obj.lineWidth, obj.lineColor, obj.lineAlpha);
                base.beginFill(obj.color);
                base.drawCircle(0, 0, obj.radius);
                base.endFill();
                break;
            case "roundedRect":
                base.lineStyle(obj.lineWidth, obj.lineColor, obj.lineAlpha);
                base.beginFill(obj.color);
                base.drawRoundedRect(0, 0, obj.width, obj.height, obj.radius);
                base.endFill();
                break;
            default:
                base.lineStyle(obj.lineWidth, obj.lineColor, obj.lineAlpha);
                base.beginFill(obj.color);
                base.drawRect(0, 0, obj.width, obj.height);
                base.endFill();
                break;
        }
        return base;
    };

    drawComp(type, obj) {
        var base = this.drawGraphic(type, obj);
        var comp = new PIXI.Sprite(base.generateCanvasTexture());
        type === "circle" ? comp.radius = obj.radius : null;
        comp._frame = comp.getBounds();
        return comp;
    };

    drawText(text, obj) {
        return new PIXI.Text(text, obj);
    };

    makeFrames(sheet, index, frameNumber, framePerRow, width, height, offsetX, offsetY){
        var rectangle, frame, frames = [];
        for (var i = 0; i < frameNumber; i++) {
            rectangle = new Rectangle((i % framePerRow) * width + offsetX
                , Math.floor(i / framePerRow) * height + offsetY, width, height);
            frame = new PIXI.Texture(TextureCache["img/images/" + sheet + index + ".png"], rectangle);
            frames.push(frame);
        }
        return frames;
    };

    drawInner(obj) {
        this.inner = this.drawComp("rect", {
            color: obj.color,
            width: this.widthValue,
            height: this.heightValue,
            lineWidth: obj.lineWidth, lineColor: obj.lineColor
        });
        this.addChildAt(this.inner, 0);
    };
}

//-----------------------------------------------------------------------------
// Sprite_Button
//
// The sprite for displaying a button.

class Sprite_Button extends Sprite {
    constructor() {
        super();
        this._touching = false;
        this._coldFrame = null;
        this._hotFrame = null;
        this._clickHandler = null;
    }

    update() {
        super.update();
        this.updateFrame();
        this.processTouch();
    };

    updateFrame() {
        var frame;
        if (this._touching) {
            frame = this._hotFrame;
        } else {
            frame = this._coldFrame;
        }
        if (frame) {
            this.setFrame(frame.x, frame.y, frame.width, frame.height);
        }
    };

    setColdFrame(x, y, width, height) {
        this._coldFrame = new Rectangle(x, y, width, height);
    };

    setHotFrame(x, y, width, height) {
        this._hotFrame = new Rectangle(x, y, width, height);
    };

    setClickHandler(method) {
        this._clickHandler = method;
    };

    callClickHandler() {
        if (this._clickHandler) {
            this._clickHandler();
        }
    };

    processTouch() {
        if (this.isActive()) {
            if (TouchInput.isTriggered() && this.isButtonTouched()) {
                this._touching = true;
            }
            if (this._touching) {
                if (TouchInput.isReleased() || !this.isButtonTouched()) {
                    this._touching = false;
                    if (TouchInput.isReleased()) {
                        this.callClickHandler();
                    }
                }
            }
        } else {
            this._touching = false;
        }
    };

    isActive() {
        var node = this;
        while (node) {
            if (!node.visible) {
                return false;
            }
            node = node.parent;
        }
        return true;
    };

    isButtonTouched() {
        var x = this.canvasToLocalX(TouchInput.x) + (this.anchor.x * this.width);
        var y = this.canvasToLocalY(TouchInput.y) + (this.anchor.y * this.height);
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    };

    canvasToLocalX(x) {
        var node = this;
        while (node) {
            x -= node.x;
            node = node.parent;
        }
        return x;
    };

    canvasToLocalY(y) {
        var node = this;
        while (node) {
            y -= node.y;
            node = node.parent;
        }
        return y;
    };
}

//-----------------------------------------------------------------------------
// Sprite_Character
//
// The sprite for displaying a character.

class Sprite_Character extends Sprite_Base {
    constructor(character) {
        super();
        this.initMembers();
        this.setCharacter(character);
    }

    initMembers() {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._character = null;
        this._balloonDuration = 0;
        this._tilesetId = 0;
        this._upperBody = null;
        this._lowerBody = null;
    };

    setCharacter(character) {
        this._character = character;
    };

    update() {
        super.update();
        this.updateBitmap();
        this.updateFrame();
        this.updatePosition();
        this.updateAnimation();
        this.updateBalloon();
        this.updateOther();
    };

    updateVisibility() {
        super.updateVisibility();
        if (this._character.isTransparent()) {
            this.visible = false;
        }
    };

    isTile() {
        return this._character.tileId > 0;
    };

    tilesetBitmap(tileId) {
        var tileset = $gameMap.tileset();
        var setNumber = 5 + Math.floor(tileId / 256);
        return ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
    };

    updateBitmap() {
        if (this.isImageChanged()) {
            this._tilesetId = $gameMap.tilesetId();
            this._tileId = this._character.tileId();
            this._characterName = this._character.characterName();
            this._characterIndex = this._character.characterIndex();
            if (this._tileId > 0) {
                this.setTileBitmap();
            } else {
                this.setCharacterBitmap();
            }
        }
    };

    isImageChanged() {
        return (this._tilesetId !== $gameMap.tilesetId() ||
            this._tileId !== this._character.tileId() ||
            this._characterName !== this._character.characterName() ||
            this._characterIndex !== this._character.characterIndex());
    };

    setTileBitmap() {
        this.bitmap = this.tilesetBitmap(this._tileId);
    };

    setCharacterBitmap() {
        this.bitmap = ImageManager.loadCharacter(this._characterName);
        this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
    };

    updateFrame() {
        if (this._tileId > 0) {
            this.updateTileFrame();
        } else {
            this.updateCharacterFrame();
        }
    };

    updateTileFrame() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (Math.floor(this._tileId / 128) % 2 * 8 + this._tileId % 8) * pw;
        var sy = Math.floor(this._tileId % 256 / 8) % 16 * ph;
        this.setFrame(sx, sy, pw, ph);
    };

    updateCharacterFrame() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.updateHalfBodySprites();
        if (this._bushDepth > 0) {
            var d = this._bushDepth;
            this._upperBody.setFrame(sx, sy, pw, ph - d);
            this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
            this.setFrame(sx, sy, 0, ph);
        } else {
            this.setFrame(sx, sy, pw, ph);
        }
    };

    characterBlockX() {
        if (this._isBigCharacter) {
            return 0;
        } else {
            var index = this._character.characterIndex();
            return index % 4 * 3;
        }
    };

    characterBlockY() {
        if (this._isBigCharacter) {
            return 0;
        } else {
            var index = this._character.characterIndex();
            return Math.floor(index / 4) * 4;
        }
    };

    characterPatternX() {
        return this._character.pattern();
    };

    characterPatternY() {
        return (this._character.direction() - 2) / 2;
    };

    patternWidth() {
        if (this._tileId > 0) {
            return $gameMap.tileWidth();
        } else if (this._isBigCharacter) {
            return this.bitmap.width / 3;
        } else {
            return this.bitmap.width / 12;
        }
    };

    patternHeight() {
        if (this._tileId > 0) {
            return $gameMap.tileHeight();
        } else if (this._isBigCharacter) {
            return this.bitmap.height / 4;
        } else {
            return this.bitmap.height / 8;
        }
    };

    updateHalfBodySprites() {
        if (this._bushDepth > 0) {
            this.createHalfBodySprites();
            this._upperBody.bitmap = this.bitmap;
            this._upperBody.visible = true;
            this._upperBody.y = -this._bushDepth;
            this._lowerBody.bitmap = this.bitmap;
            this._lowerBody.visible = true;
            this._upperBody.setBlendColor(this.getBlendColor());
            this._lowerBody.setBlendColor(this.getBlendColor());
            this._upperBody.setColorTone(this.getColorTone());
            this._lowerBody.setColorTone(this.getColorTone());
        } else if (this._upperBody) {
            this._upperBody.visible = false;
            this._lowerBody.visible = false;
        }
    };

    createHalfBodySprites() {
        if (!this._upperBody) {
            this._upperBody = new Sprite();
            this._upperBody.anchor.x = 0.5;
            this._upperBody.anchor.y = 1;
            this.addChild(this._upperBody);
        }
        if (!this._lowerBody) {
            this._lowerBody = new Sprite();
            this._lowerBody.anchor.x = 0.5;
            this._lowerBody.anchor.y = 1;
            this._lowerBody.opacity = 128;
            this.addChild(this._lowerBody);
        }
    };

    updatePosition() {
        this.x = this._character.screenX();
        this.y = this._character.screenY();
        this.z = this._character.screenZ();
    };

    updateAnimation() {
        this.setupAnimation();
        if (!this.isAnimationPlaying()) {
            this._character.endAnimation();
        }
        if (!this.isBalloonPlaying()) {
            this._character.endBalloon();
        }
    };

    updateOther() {
        this.opacity = this._character.opacity();
        this.blendMode = this._character.blendMode();
        this._bushDepth = this._character.bushDepth();
    };

    setupAnimation() {
        if (this._character.animationId() > 0) {
            var animation = $dataAnimations[this._character.animationId()];
            this.startAnimation(animation, false, 0);
            this._character.startAnimation();
        }
    };

    setupBalloon() {
        if (this._character.balloonId() > 0) {
            this.startBalloon();
            this._character.startBalloon();
        }
    };

    startBalloon() {
        if (!this._balloonSprite) {
            this._balloonSprite = new Sprite_Balloon();
        }
        this._balloonSprite.setup(this._character.balloonId());
        this.parent.addChild(this._balloonSprite);
    };

    updateBalloon() {
        this.setupBalloon();
        if (this._balloonSprite) {
            this._balloonSprite.x = this.x;
            this._balloonSprite.y = this.y - this.height;
            if (!this._balloonSprite.isPlaying()) {
                this.endBalloon();
            }
        }
    };

    endBalloon() {
        if (this._balloonSprite) {
            this.parent.removeChild(this._balloonSprite);
            this._balloonSprite = null;
        }
    };

    isBalloonPlaying() {
        return !!this._balloonSprite;
    };
}

//-----------------------------------------------------------------------------
// Sprite_Battler
//
// The superclass of Sprite_Actor and Sprite_Enemy.

class Sprite_Battler extends Sprite_Base {
    //-----------------------------------------------------------------------------
    //Initialize
    constructor(battler) {
        super();
        this.initMembers();
        this.setBattler(battler);
    }

    initMembers() {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._battler = null;
        this._damages = [];
        this._homeX = 0;
        this._homeY = 0;
        this._offsetX = 0;
        this._offsetY = 0;
        this._targetOffsetX = NaN;
        this._targetOffsetY = NaN;
        this._movementDuration = 0;
        this._selectionEffectCount = 0;
        this._battlerName = '';
        this._motion = 0;
        this._motionCount = 0;
        this._pattern = 0;
        this._appeared = false;
        this._battlerHue = 0;
        this._effectType = null;
        this._effectDuration = 0;
        this._shake = 0;
        this._scaled = false;
        this._needMirror = false;
        this._mirrored = false;
        this._retreating = false;
        this.createShadowSprite();
        this.createWeaponSprite();
        this.createMainSprite();
        this.createStateSprite();
    };

    setBattler(battler) {
        var changed = (battler !== this._battler);
        if (changed) {
            this._battler = battler;
            this.startEntryMotion();
            this._stateSprite.setup(battler);
        }
    };

    setHome(x, y) {
        this._homeX = x;
        this._homeY = y;
        this.updatePosition();
    };

    createMainSprite() {
        this._mainSprite = new Sprite_Base();
        this._mainSprite.anchor.x = 0.5;
        this._mainSprite.anchor.y = 1;
        this.addChild(this._mainSprite);
        this._effectTarget = this._mainSprite;
    };

    createShadowSprite() {
        this._shadowSprite = new Sprite();
        this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow2');
        this._shadowSprite.anchor.x = 0.5;
        this._shadowSprite.anchor.y = 0.5;
        this._shadowSprite.y = -2;
        this.addChild(this._shadowSprite);
    };

    createWeaponSprite() {
        this._weaponSprite = new Sprite_Weapon();
        this.addChild(this._weaponSprite);
    };

    createStateSprite() {
        this._stateSprite = new Sprite_StateOverlay();
        this.addChild(this._stateSprite);
    };

    damageOffsetX() {
        return 0;
    };

    damageOffsetY() {
        return -8;
    };

    canvasToLocalX(x) {
        var node = this;
        while (node) {
            x -= node.x;
            node = node.parent;
        }
        return x;
    };

    canvasToLocalY(y) {
        var node = this;
        while (node) {
            y -= node.y;
            node = node.parent;
        }
        return y;
    };

    update() {
        super.update();
        if (this._battler && this._battler._sheetData) {
            this.updateMain();
            this.updateAnimation();
            this.updateDamagePopup();
            this.updateSelectionEffect();
            this.updateMotion();
            this.updateEffect();
            this.processStatusBar();
        } else {
            this.bitmap = null;
        }
        this.updateShadow();
    };

    processStatusBar() {
        if (TouchInput.isTriggered() && this.isSpriteTouched()) {
            this._hovering = true;
        }

        if (this._hovering) {
            if (!this._isStatusUpdated) {
                this._isStatusUpdated = true;
            }
            if (!this.isSpriteTouched()) {
                this._hovering = false;
                this._isStatusUpdated = false;
            }
        }
    };

    isSpriteTouched() {
        let width = this.cellWidth(),
            height = this.cellHeight(),
            x = this.canvasToLocalX(TouchInput.x) + (this.anchor.x * width),
            y = this.canvasToLocalY(TouchInput.y) + (this.anchor.y * height);
        return x >= 0 && y >= 0 && x < width && y < height;
    };

    cellWidth() {
        if (this._battler) {
            return this._battler._sheetData.frames[0].frame.w;
        } else {
            return 0;
        }
    }

    cellHeight() {
        if (this._battler) {
            return this._battler._sheetData.frames[0].frame.h;
        } else {
            return 0;
        }
    }

    updateVisibility() {
        super.updateVisibility();
        if (!this._battler || !this._battler.isSpriteVisible()) {
            this.visible = false;
        }
    };

    updateMain() {
        if (this._battler.isSpriteVisible()) {
            if (!this.isMoving()) this.updateTargetPosition();
            this.updateBitmap();
            this.updateFrame();
        }
        this.updateMove();
        this.updatePosition();
    };

    updateMove() {
        var bitmap = this._mainSprite.bitmap;
        if (!bitmap || bitmap.isReady()) {
            if (this._movementDuration > 0) {
                var v = MathHelper.smoothStep(1 / this._movementDuration);
                this._offsetX = (this._offsetX * (1 - v) + this._targetOffsetX * v);
                this._offsetY = (this._offsetY * (1 - v) + this._targetOffsetY * v);
                this._movementDuration--;
                if (this._movementDuration === 0) {
                    this.onMoveEnd();
                }
            }
        }
    };

    updatePosition() {
        this.x = this._homeX + this._offsetX;
        this.y = this._homeY + this._offsetY;
    };

    updateAnimation() {
        this.setupAnimation();
    };

    updateDamagePopup() {
        this.setupDamagePopup();
        if (this._damages.length > 0) {
            for (var i = 0; i < this._damages.length; i++) {
                this._damages[i].update();
            }
            if (!this._damages[0].isPlaying()) {
                this.parent.removeChild(this._damages[0]);
                this._damages.shift();
            }
        }
    };

    updateSelectionEffect() {
        var target = this._effectTarget;
        if (this._battler.isSelected()) {
            this._selectionEffectCount++;
            if (this._selectionEffectCount % 30 < 15) {
                target.setBlendColor([255, 255, 255, 64]);
            } else {
                target.setBlendColor([0, 0, 0, 0]);
            }
        } else if (this._selectionEffectCount > 0) {
            this._selectionEffectCount = 0;
            target.setBlendColor([0, 0, 0, 0]);
        }
    };

    updateShadow() {
        this._shadowSprite.visible = !!this._battler;
    };

    updateTargetPosition() {
        var escaped = BattleManager.isEscaped() && !this._battler.isEnemy();
        if (this._battler.isActing()) {
            if (escaped) {
                if (!this._retreating) this.retreat();
            } else {
                this.stepForward();
            }
        } else if (escaped) {
            if (!this._retreating) this.retreat();
        } else if (!this.inHomePosition()) {
            this.stepBack();
        }
    };

    updateBitmap() {
        var name = this._battler.battlerName();
        if (this._battlerName !== name) {
            this._battlerName = name;
            this._mainSprite.bitmap = ImageManager.loadSvActor(name);
        }
    };

    updateFrame() {
        var bitmap = this._mainSprite.bitmap;
        if (bitmap) {
            this.updateMirror();
            var motionIndex = this._motion ? this._motion.index : 0;
            var j = this._battler._sheetData.motions[motionIndex];
            var pattern = (this._motion ? this._pattern < this._motion.patterns : false) ? this._pattern : 0;
            var frame = this._battler._sheetData.frames[j + pattern].frame;
            this._mainSprite.setFrame(frame.x, frame.y, frame.w, frame.h);
        }
    };

    updateMirror() {
        if (this._needMirror) {
            this.scale.x *= -1;
            this._needMirror = false;
            this._mirrored = !this._mirrored;
        }
    };

    updateMotion() {
        this.setupMotion();
        this.setupWeaponAnimation();
        if (this._battler.isMotionRefreshRequested()) {
            this.refreshMotion();
            this._battler.clearMotion();
        }
        this.updateMotionCount();
    };

    updateMotionCount() {
        if (this._motion && ++this._motionCount >= this.motionSpeed()) {
            if (this._motion.loop) {
                this._pattern = this._pattern === this._motion.patterns ? 0 : this._pattern + 1;
            } else if (this._pattern === this._motion.patterns) {
                this.refreshMotion();
            } else {
                this._pattern++;
            }
            this._motionCount = 0;
        }
    };

    motionSpeed() {
        return 8;
    };

    updateShake() {
        this.x += this._shake;
    };

    isMotionDone() {
    };

    //-----------------------------------------------------------------------------
    //Setup

    setupAnimation() {
        while (this._battler.isAnimationRequested()) {
            var data = this._battler.shiftAnimation();
            var animation = $dataAnimations[data.animationId];
            var mirror = data.mirror;
            var delay = animation.position === 3 ? 0 : data.delay;
            this.startAnimation(animation, mirror, delay);
            for (var i = 0; i < this._animationSprites.length; i++) {
                var sprite = this._animationSprites[i];
                sprite.visible = this._battler.isSpriteVisible();
            }
        }
    };

    setupDamagePopup() {
        if (this._battler.isDamagePopupRequested()) {
            if (this._battler.isSpriteVisible()) {
                var sprite = new Sprite_Damage();
                sprite.x = this.x + this.damageOffsetX();
                sprite.y = this.y + this.damageOffsetY();
                sprite.setup(this._battler);
                this._damages.push(sprite);
                this.parent.addChild(sprite);
            }
            this._battler.clearDamagePopup();
            this._battler.clearResult();
        }
    };

    startMove(x, y, duration) {
        if (this._targetOffsetX !== x || this._targetOffsetY !== y) {
            this._targetOffsetX = x;
            this._targetOffsetY = y;
            this._movementDuration = duration;
            if (duration === 0) {
                this._offsetX = x;
                this._offsetY = y;
            }
        }
    };

    isMoving() {
        return this._movementDuration > 0;
    };

    inHomePosition() {
        return this._offsetX === 0 && this._offsetY === 0;
    };

    setSquare(squares, index) {
        // The x, y position of a square.
        var sx, sy;
        sx = squares.x + squares.children[index].x;
        sy = squares.y + squares.children[index].y;
        this.setHome(sx, sy);
    };

    setupMotion() {
        if (this._battler.isMotionRequested()) {
            this.startMotion(this._battler.motionType());
            this._battler.clearMotion();
        }
    };

    setupWeaponAnimation() {
        if (this._battler.isWeaponAnimationRequested()) {
            this._weaponSprite.setup(this._battler.weaponImageId());
            this._battler.clearWeaponAnimation();
        }
    };

    startMotion(motionType) {
        var newMotion = Sprite_Battler.MOTIONS[motionType];
        if (this._motion !== newMotion) {
            this._motion = newMotion;
            this._motionCount = 0;
            this._pattern = 0;
        }
    };

    refreshMotion() {
        var actor = this._battler;
        var motionGuard = Sprite_Battler.MOTIONS['guard'];
        if (actor) {
            if (this._motion === motionGuard && !BattleManager.isInputting()) {
                return;
            }
            var stateMotion = actor.stateMotionIndex();
            if (actor.isInputting() || actor.isActing()) {
                this.startMotion('run');
            } else if (stateMotion === 3) {
                this.startMotion('dead');
            } else if (stateMotion === 2) {
                this.startMotion('sleep');
            } else if (actor.isGuard() || actor.isGuardWaiting()) {
                this.startMotion('guard');
            } else if (actor.isDying()) {
                this.startMotion('dying');
            } else if (actor.isUndecided()) {
                this.startMotion('idle');
            } else {
                this.startMotion('idle');
            }
        }
    };

    startEntryMotion() {
        if (this._battler) {
            this.refreshMotion();
            this.startMotion('idle');
            this.startMove(0, 0, 0);
        }
    };

    stepBack() {
        this.startMove(0, 0, 48);
    };

    retreat() {
        this.requestMirror();
        this._retreating = true;
        this.startMove(-400, 0, 30);
    };

    requestMirror() {
        this._needMirror = true;
    }

    onMoveEnd() {
        if (!BattleManager.isBattleEnd()) {
            this.refreshMotion();
        }
    };

    //-----------------------------------------------------------------------------
    //Special Effects

    initVisibility() {
        this._appeared = this._battler.isAlive();
        if (!this._appeared) {
            this.opacity = 0;
        }
    };

    setupEffect() {
        if (this._appeared && this._battler.isEffectRequested()) {
            this.startEffect(this._battler.effectType());
            this._battler.clearEffect();
        }
        if (!this._appeared && this._battler.isAlive()) {
            this.startEffect('appear');
        } else if (this._appeared && this._battler.isHidden()) {
            this.startEffect('disappear');
        }
    };

    startEffect(effectType) {
        this._effectType = effectType;
        switch (this._effectType) {
            case 'appear':
                this.startAppear();
                break;
            case 'disappear':
                this.startDisappear();
                break;
            case 'whiten':
                this.startWhiten();
                break;
            case 'blink':
                this.startBlink();
                break;
            case 'collapse':
                this.startCollapse();
                break;
            case 'bossCollapse':
                this.startBossCollapse();
                break;
            case 'instantCollapse':
                this.startInstantCollapse();
                break;
        }
        this.revertToNormal();
    };

    startAppear() {
        this._effectDuration = 16;
        this._appeared = true;
    };

    startDisappear() {
        this._effectDuration = 32;
        this._appeared = false;
    };

    startWhiten() {
        this._effectDuration = 16;
    };

    startBlink() {
        this._effectDuration = 20;
    };

    startCollapse() {
        this._effectDuration = 32;
        this._appeared = false;
    };

    startBossCollapse() {
        this._effectDuration = this.bitmap.height;
        this._appeared = false;
    };

    startInstantCollapse() {
        this._effectDuration = 16;
        this._appeared = false;
    };

    updateEffect() {
        this.setupEffect();
        if (this._effectDuration > 0) {
            this._effectDuration--;
            switch (this._effectType) {
                case 'whiten':
                    this.updateWhiten();
                    break;
                case 'blink':
                    this.updateBlink();
                    break;
                case 'appear':
                    this.updateAppear();
                    break;
                case 'disappear':
                    this.updateDisappear();
                    break;
                case 'collapse':
                    this.updateCollapse();
                    break;
                case 'bossCollapse':
                    this.updateBossCollapse();
                    break;
                case 'instantCollapse':
                    this.updateInstantCollapse();
                    break;
            }
            if (this._effectDuration === 0) {
                this._effectType = null;
            }
        }
    };

    isEffecting() {
        return this._effectType !== null;
    };

    revertToNormal() {
        this._shake = 0;
        this.blendMode = 0;
        this.opacity = 255;
        this.setBlendColor([0, 0, 0, 0]);
    };

    updateWhiten() {
        var alpha = 128 - (16 - this._effectDuration) * 10;
        this.setBlendColor([255, 255, 255, alpha]);
    };

    updateBlink() {
        this.opacity = (this._effectDuration % 10 < 5) ? 255 : 0;
    };

    updateAppear() {
        this.opacity = (16 - this._effectDuration) * 16;
    };

    updateDisappear() {
        this.opacity = 256 - (32 - this._effectDuration) * 10;
    };

    updateCollapse() {
        this.blendMode = Graphics.BLEND_ADD;
        this.setBlendColor([255, 128, 128, 128]);
        this.opacity *= this._effectDuration / (this._effectDuration + 1);
    };

    updateBossCollapse() {
        this._shake = this._effectDuration % 2 * 4 - 2;
        this.blendMode = Graphics.BLEND_ADD;
        this.opacity *= this._effectDuration / (this._effectDuration + 1);
        this.setBlendColor([255, 255, 255, 255 - this.opacity]);
        if (this._effectDuration % 20 === 19) {
            SoundManager.playBossCollapse2();
        }
    };

    updateInstantCollapse() {
        this.opacity = 0;
    };
}

Sprite_Battler.MOTIONS = {
    idle:       {index: 0, patterns: 7, loop: true},
    run:        {index: 1, patterns: 3, loop: false},
    melee:      {index: 2, patterns: 5, loop: false},
    back:       {index: 3, patterns: 3, loop: false},
    block:      {index: 4, patterns: 7, loop: false}
    /*guard:      {index: 3, patterns: 8, loop: false},
    evade:      {index: 4, patterns: 7, loop: false},
    damaged:    {index: 5, patterns: 7, loop: false},
    dying:      {index: 6, patterns: 7, loop: true},
    dead:       {index: 7, patterns: 7, loop: false},
    melee:      {index: 9, patterns: 5, loop: false},
    missile:    {index: 10, patterns: 7, loop: false},
    channel:    {index: 11, patterns: 7, loop: false},
    toss:       {index: 12, patterns: 7, loop: false},
    victory:    {index: 13, patterns: 7, loop: false},
    asleep:     {index: 14, patterns: 7, loop: true}*/
};

class Sprite_Actor extends Sprite_Battler {
    constructor(battler, enemy) {
        super(battler, enemy);
    }

    stepForward() {
        this.startMove(448, 0, 48);
    };
}

class Sprite_Enemy extends Sprite_Battler {
    constructor(battler, enemy) {
        super(battler, enemy);
        this.requestMirror();
    }

    stepForward() {
        this.startMove(-448, 0, 48);
    };
}

//-----------------------------------------------------------------------------
// Sprite_Animation
//
// The sprite for displaying an animation.

class Sprite_Animation extends Sprite {
    constructor() {
        super();
        this._reduceArtifacts = true;
        this.initMembers();
    }

    initMembers() {
        this._target = null;
        this._animation = null;
        this._mirror = false;
        this._delay = 0;
        this._rate = 4;
        this._duration = 0;
        this._flashColor = [0, 0, 0, 0];
        this._flashDuration = 0;
        this._screenFlashDuration = 0;
        this._hidingDuration = 0;
        this._bitmap1 = null;
        this._bitmap2 = null;
        this._cellSprites = [];
        this._screenFlashSprite = null;
        this._duplicated = false;
        this.z = 8;
    };

    setup(target, animation, mirror, delay) {
        this._target = target;
        this._animation = animation;
        this._mirror = mirror;
        this._delay = delay;
        if (this._animation) {
            this.remove();
            this.setupRate();
            this.setupDuration();
            this.loadBitmaps();
            this.createSprites();
        }
    };

    remove() {
        if (this.parent && this.parent.removeChild(this)) {
            this._target.setBlendColor([0, 0, 0, 0]);
            this._target.show();
        }
    };

    setupRate() {
        this._rate = 4;
    };

    setupDuration() {
        this._duration = this._animation.frames.length * this._rate + 1;
    };

    update() {
        super.update();
        this.updateMain();
        this.updateFlash();
        this.updateScreenFlash();
        this.updateHiding();
        Sprite_Animation._checker1 = {};
        Sprite_Animation._checker2 = {};
    };

    updateFlash() {
        if (this._flashDuration > 0) {
            var d = this._flashDuration--;
            this._flashColor[3] *= (d - 1) / d;
            this._target.setBlendColor(this._flashColor);
        }
    };

    updateScreenFlash() {
        if (this._screenFlashDuration > 0) {
            var d = this._screenFlashDuration--;
            if (this._screenFlashSprite) {
                this._screenFlashSprite.x = -this.absoluteX();
                this._screenFlashSprite.y = -this.absoluteY();
                this._screenFlashSprite.opacity *= (d - 1) / d;
                this._screenFlashSprite.visible = (this._screenFlashDuration > 0);
            }
        }
    };

    absoluteX() {
        var x = 0;
        var object = this;
        while (object) {
            x += object.x;
            object = object.parent;
        }
        return x;
    };

    absoluteY() {
        var y = 0;
        var object = this;
        while (object) {
            y += object.y;
            object = object.parent;
        }
        return y;
    };

    updateHiding() {
        if (this._hidingDuration > 0) {
            this._hidingDuration--;
            if (this._hidingDuration === 0) {
                this._target.show();
            }
        }
    };

    isPlaying() {
        return this._duration > 0;
    };

    loadBitmaps() {
        var name1 = this._animation.animation1Name;
        var name2 = this._animation.animation2Name;
        var hue1 = this._animation.animation1Hue;
        var hue2 = this._animation.animation2Hue;
        this._bitmap1 = ImageManager.loadAnimation(name1, hue1);
        this._bitmap2 = ImageManager.loadAnimation(name2, hue2);
    };

    isReady() {
        return this._bitmap1 && this._bitmap1.isReady() && this._bitmap2 && this._bitmap2.isReady();
    };

    createSprites() {
        if (!Sprite_Animation._checker2[this._animation]) {
            this.createCellSprites();
            if (this._animation.position === 3) {
                Sprite_Animation._checker2[this._animation] = true;
            }
            this.createScreenFlashSprite();
        }
        if (Sprite_Animation._checker1[this._animation]) {
            this._duplicated = true;
        } else {
            this._duplicated = false;
            if (this._animation.position === 3) {
                Sprite_Animation._checker1[this._animation] = true;
            }
        }
    };

    createCellSprites() {
        this._cellSprites = [];
        for (var i = 0; i < 16; i++) {
            var sprite = new Sprite();
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;
            this._cellSprites.push(sprite);
            this.addChild(sprite);
        }
    };

    createScreenFlashSprite() {
        this._screenFlashSprite = new ScreenSprite();
        this.addChild(this._screenFlashSprite);
    };

    updateMain() {
        if (this.isPlaying() && this.isReady()) {
            if (this._delay > 0) {
                this._delay--;
            } else {
                this._duration--;
                this.updatePosition();
                if (this._duration % this._rate === 0) {
                    this.updateFrame();
                }
            }
        }
    };

    updatePosition() {
        if (this._animation.position === 3) {
            this.x = this.parent.width / 2;
            this.y = this.parent.height / 2;
        } else {
            var parent = this._target.parent;
            var grandparent = parent ? parent.parent : null;
            this.x = this._target.x;
            this.y = this._target.y;
            if (this.parent === grandparent) {
                this.x += parent.x;
                this.y += parent.y;
            }
            if (this._animation.position === 0) {
                this.y -= this._target.height;
            } else if (this._animation.position === 1) {
                this.y -= this._target.height / 2;
            }
        }
    };

    updateFrame() {
        if (this._duration > 0) {
            var frameIndex = this.currentFrameIndex();
            this.updateAllCellSprites(this._animation.frames[frameIndex]);
            this._animation.timings.forEach(function (timing) {
                if (timing.frame === frameIndex) {
                    this.processTimingData(timing);
                }
            }, this);
        }
    };

    currentFrameIndex() {
        return (this._animation.frames.length -
            Math.floor((this._duration + this._rate - 1) / this._rate));
    };

    updateAllCellSprites(frame) {
        for (var i = 0; i < this._cellSprites.length; i++) {
            var sprite = this._cellSprites[i];
            if (i < frame.length) {
                this.updateCellSprite(sprite, frame[i]);
            } else {
                sprite.visible = false;
            }
        }
    };

    updateCellSprite(sprite, cell) {
        var pattern = cell[0];
        if (pattern >= 0) {
            var sx = pattern % 5 * 192;
            var sy = Math.floor(pattern % 100 / 5) * 192;
            var mirror = this._mirror;
            sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
            sprite.setFrame(sx, sy, 192, 192);
            sprite.x = cell[1];
            sprite.y = cell[2];
            sprite.rotation = cell[4] * Math.PI / 180;
            sprite.scale.x = cell[3] / 100;

            if (cell[5]) {
                sprite.scale.x *= -1;
            }
            if (mirror) {
                sprite.x *= -1;
                sprite.rotation *= -1;
                sprite.scale.x *= -1;
            }

            sprite.scale.y = cell[3] / 100;
            sprite.opacity = cell[6];
            sprite.blendMode = cell[7];
            sprite.visible = true;
        } else {
            sprite.visible = false;
        }
    };

    processTimingData(timing) {
        var duration = timing.flashDuration * this._rate;
        switch (timing.flashScope) {
            case 1:
                this.startFlash(timing.flashColor, duration);
                break;
            case 2:
                this.startScreenFlash(timing.flashColor, duration);
                break;
            case 3:
                this.startHiding(duration);
                break;
        }
        if (!this._duplicated && timing.se) {
            AudioManager.playSe(timing.se);
        }
    };

    startFlash(color, duration) {
        this._flashColor = color.clone();
        this._flashDuration = duration;
    };

    startScreenFlash(color, duration) {
        this._screenFlashDuration = duration;
        if (this._screenFlashSprite) {
            this._screenFlashSprite.setColor(color[0], color[1], color[2]);
            this._screenFlashSprite.opacity = color[3];
        }
    };

    startHiding(duration) {
        this._hidingDuration = duration;
        this._target.hide();
    };
}

Sprite_Animation._checker1 = {};
Sprite_Animation._checker2 = {};

//-----------------------------------------------------------------------------
// Sprite_Damage
//
// The sprite for displaying a popup damage.

class Sprite_Damage extends Sprite {
    constructor() {
        super();
        this._duration = 90;
        this._flashColor = [0, 0, 0, 0];
        this._flashDuration = 0;
        this._damageBitmap = ImageManager.loadSystem('Damage');
    }

    setup(target) {
        var result = target.result();
        if (result.missed || result.evaded) {
            this.createMiss();
        } else if (result.hpAffected) {
            this.createDigits(0, result.hpDamage);
        } else if (target.isAlive() && result.mpDamage !== 0) {
            this.createDigits(2, result.mpDamage);
        }
        if (result.critical) {
            this.setupCriticalEffect();
        }
    };

    setupCriticalEffect() {
        this._flashColor = [255, 0, 0, 160];
        this._flashDuration = 60;
    };

    digitWidth() {
        return this._damageBitmap ? this._damageBitmap.width / 10 : 0;
    };

    digitHeight() {
        return this._damageBitmap ? this._damageBitmap.height / 5 : 0;
    };

    createMiss() {
        var w = this.digitWidth();
        var h = this.digitHeight();
        var sprite = this.createChildSprite();
        sprite.setFrame(0, 4 * h, 4 * w, h);
        sprite.dy = 0;
    };

    createDigits(baseRow, value) {
        var string = Math.abs(value).toString();
        var row = baseRow + (value < 0 ? 1 : 0);
        var w = this.digitWidth();
        var h = this.digitHeight();
        for (var i = 0; i < string.length; i++) {
            var sprite = this.createChildSprite();
            var n = Number(string[i]);
            sprite.setFrame(n * w, row * h, w, h);
            sprite.x = (i - (string.length - 1) / 2) * w;
            sprite.dy = -i;
        }
    };

    createChildSprite() {
        var sprite = new Sprite();
        sprite.bitmap = this._damageBitmap;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1;
        sprite.y = -40;
        sprite.ry = sprite.y;
        this.addChild(sprite);
        return sprite;
    };

    update() {
        super.update();
        if (this._duration > 0) {
            this._duration--;
            for (var i = 0; i < this.children.length; i++) {
                this.updateChild(this.children[i]);
            }
        }
        this.updateFlash();
        this.updateOpacity();
    };

    updateChild(sprite) {
        sprite.dy += 0.5;
        sprite.ry += sprite.dy;
        if (sprite.ry >= 0) {
            sprite.ry = 0;
            sprite.dy *= -0.6;
        }
        sprite.y = Math.round(sprite.ry);
        sprite.setBlendColor(this._flashColor);
    };

    updateFlash() {
        if (this._flashDuration > 0) {
            var d = this._flashDuration--;
            this._flashColor[3] *= (d - 1) / d;
        }
    };

    updateOpacity() {
        if (this._duration < 10) {
            this.opacity = 255 * this._duration / 10;
        }
    };

    isPlaying() {
        return this._duration > 0;
    };
}

//-----------------------------------------------------------------------------
// Sprite_StateIcon
//
// The sprite for displaying state icons.

class Sprite_StateIcon extends Sprite {
    constructor() {
        super();
        this.initMembers();
        this.loadBitmap();
    }

    initMembers() {
        this._battler = null;
        this._iconIndex = 0;
        this._animationCount = 0;
        this._animationIndex = 0;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
    };

    loadBitmap() {
        this.bitmap = ImageManager.loadSystem('IconSet');
        this.setFrame(0, 0, 0, 0);
    };

    setup(battler) {
        this._battler = battler;
    };

    update() {
        super.update();
        this._animationCount++;
        if (this._animationCount >= this.animationWait()) {
            this.updateIcon();
            this.updateFrame();
            this._animationCount = 0;
        }
    };

    animationWait() {
        return 40;
    };

    updateIcon() {
        var icons = [];
        if (this._battler && this._battler.isAlive()) {
            icons = this._battler.allIcons();
        }
        if (icons.length > 0) {
            this._animationIndex++;
            if (this._animationIndex >= icons.length) {
                this._animationIndex = 0;
            }
            this._iconIndex = icons[this._animationIndex];
        } else {
            this._animationIndex = 0;
            this._iconIndex = 0;
        }
    };

    updateFrame() {
        var pw = Sprite_StateIcon._iconWidth;
        var ph = Sprite_StateIcon._iconHeight;
        var sx = this._iconIndex % 16 * pw;
        var sy = Math.floor(this._iconIndex / 16) * ph;
        this.setFrame(sx, sy, pw, ph);
    };
}

Sprite_StateIcon._iconWidth = 32;
Sprite_StateIcon._iconHeight = 32;

//-----------------------------------------------------------------------------
// Sprite_StateOverlay
//
// The sprite for displaying an overlay image for a state.

class Sprite_StateOverlay extends Sprite_Base {
    constructor() {
        super();
        this.initMembers();
        this.loadBitmap();
    }

    initMembers() {
        this._battler = null;
        this._overlayIndex = 0;
        this._animationCount = 0;
        this._pattern = 0;
        this.anchor.x = 0.5;
        this.anchor.y = 1;
    };

    loadBitmap() {
        this.bitmap = ImageManager.loadSystem('States');
        this.setFrame(0, 0, 0, 0);
    };

    setup(battler) {
        this._battler = battler;
    };

    update() {
        super.update();
        this._animationCount++;
        if (this._animationCount >= this.animationWait()) {
            this.updatePattern();
            this.updateFrame();
            this._animationCount = 0;
        }
    };

    animationWait() {
        return 8;
    };

    updatePattern() {
        this._pattern++;
        this._pattern %= 8;
        if (this._battler) {
            this._overlayIndex = this._battler.stateOverlayIndex();
        }
    };

    updateFrame() {
        if (this._overlayIndex > 0) {
            var w = 96;
            var h = 96;
            var sx = this._pattern * w;
            var sy = (this._overlayIndex - 1) * h;
            this.setFrame(sx, sy, w, h);
        } else {
            this.setFrame(0, 0, 0, 0);
        }
    };
}

//-----------------------------------------------------------------------------
// Sprite_Weapon
//
// The sprite for displaying a weapon image for attacking.

class Sprite_Weapon extends Sprite_Base {
    constructor() {
        super();
        this.initMembers();
    }

    initMembers() {
        this._weaponImageId = 0;
        this._animationCount = 0;
        this._pattern = 0;
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this.x = -16;
    };

    setup(weaponImageId) {
        this._weaponImageId = weaponImageId;
        this._animationCount = 0;
        this._pattern = 0;
        this.loadBitmap();
        this.updateFrame();
    };

    update() {
        super.update();
        this._animationCount++;
        if (this._animationCount >= this.animationWait()) {
            this.updatePattern();
            this.updateFrame();
            this._animationCount = 0;
        }
    };

    animationWait() {
        return 12;
    };

    updatePattern() {
        this._pattern++;
        if (this._pattern >= 3) {
            this._weaponImageId = 0;
        }
    };

    loadBitmap() {
        var pageId = Math.floor((this._weaponImageId - 1) / 12) + 1;
        if (pageId >= 1) {
            this.bitmap = ImageManager.loadSystem('Weapons' + pageId);
        } else {
            this.bitmap = ImageManager.loadSystem('');
        }
    };

    updateFrame() {
        if (this._weaponImageId > 0) {
            var index = (this._weaponImageId - 1) % 12;
            var w = 96;
            var h = 64;
            var sx = (Math.floor(index / 6) * 3 + this._pattern) * w;
            var sy = Math.floor(index % 6) * h;
            this.setFrame(sx, sy, w, h);
        } else {
            this.setFrame(0, 0, 0, 0);
        }
    };

    isPlaying() {
        return this._weaponImageId > 0;
    };
}

//-----------------------------------------------------------------------------
// Sprite_Balloon
//
// The sprite for displaying a balloon icon.

class Sprite_Balloon extends Sprite_Base {
    constructor() {
        super();
        this.initMembers();
        this.loadBitmap();
    }

    initMembers() {
        this._balloonId = 0;
        this._duration = 0;
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this.z = 7;
    };

    loadBitmap() {
        this.bitmap = ImageManager.loadSystem('Balloon');
        this.setFrame(0, 0, 0, 0);
    };

    setup(balloonId) {
        this._balloonId = balloonId;
        this._duration = 8 * this.speed() + this.waitTime();
    };

    update() {
        super.update();
        if (this._duration > 0) {
            this._duration--;
            if (this._duration > 0) {
                this.updateFrame();
            }
        }
    };

    updateFrame() {
        var w = 48;
        var h = 48;
        var sx = this.frameIndex() * w;
        var sy = (this._balloonId - 1) * h;
        this.setFrame(sx, sy, w, h);
    };

    speed() {
        return 8;
    };

    waitTime() {
        return 12;
    };

    frameIndex() {
        var index = (this._duration - this.waitTime()) / this.speed();
        return 7 - Math.max(Math.floor(index), 0);
    };

    isPlaying() {
        return this._duration > 0;
    };
}

//-----------------------------------------------------------------------------
// Sprite_Picture
//
// The sprite for displaying a picture.

class Sprite_Picture extends Sprite {
    constructor(pictureId) {
        super();
        this._pictureId = pictureId;
        this._pictureName = '';
        this._isPicture = true;
        this.update();
    }

    picture() {
        return $gameScreen.picture(this._pictureId);
    };

    update() {
        super.update();
        this.updateBitmap();
        if (this.visible) {
            this.updateOrigin();
            this.updatePosition();
            this.updateScale();
            this.updateTone();
            this.updateOther();
        }
    };

    updateBitmap() {
        var picture = this.picture();
        if (picture) {
            var pictureName = picture.name();
            if (this._pictureName !== pictureName) {
                this._pictureName = pictureName;
                this.loadBitmap();
            }
            this.visible = true;
        } else {
            this._pictureName = '';
            this.bitmap = null;
            this.visible = false;
        }
    };

    updateOrigin() {
        var picture = this.picture();
        if (picture.origin() === 0) {
            this.anchor.x = 0;
            this.anchor.y = 0;
        } else {
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
        }
    };

    updatePosition() {
        var picture = this.picture();
        this.x = Math.floor(picture.x());
        this.y = Math.floor(picture.y());
    };

    updateScale() {
        var picture = this.picture();
        this.scale.x = picture.scaleX() / 100;
        this.scale.y = picture.scaleY() / 100;
    };

    updateTone() {
        var picture = this.picture();
        if (picture.tone()) {
            this.setColorTone(picture.tone());
        } else {
            this.setColorTone([0, 0, 0, 0]);
        }
    };

    updateOther() {
        var picture = this.picture();
        this.opacity = picture.opacity();
        this.blendMode = picture.blendMode();
        this.rotation = picture.angle() * Math.PI / 180;
    };

    loadBitmap() {
        this.bitmap = ImageManager.loadPicture(this._pictureName);
    };
}

//-----------------------------------------------------------------------------
// Sprite_Timer
//
// The sprite for displaying the timer.

class Sprite_Timer extends Sprite {
    constructor() {
        super();
        this._seconds = 0;
        this.createBitmap();
        this.update();
    }

    createBitmap() {
        this.bitmap = new Bitmap(96, 48);
        this.bitmap.fontSize = 32;
    };

    update() {
        super.update();
        this.updateBitmap();
        this.updatePosition();
        this.updateVisibility();
    };

    updateBitmap() {
        if (this._seconds !== $gameTimer.seconds()) {
            this._seconds = $gameTimer.seconds();
            this.redraw();
        }
    };

    redraw() {
        var text = this.timerText();
        var width = this.bitmap.width;
        var height = this.bitmap.height;
        this.bitmap.clear();
        this.bitmap.drawText(text, 0, 0, width, height, 'center');
    };

    timerText() {
        var min = Math.floor(this._seconds / 60) % 60;
        var sec = this._seconds % 60;
        return min.padZero(2) + ':' + sec.padZero(2);
    };

    updatePosition() {
        this.x = Graphics.width - this.bitmap.width;
        this.y = 0;
    };

    updateVisibility() {
        this.visible = $gameTimer.isWorking();
    };
}

//-----------------------------------------------------------------------------
// Sprite_Destination
//
// The sprite for displaying the destination place of the touch input.

class Sprite_Destination extends Sprite {
    constructor() {
        super()
        this.createBitmap();
        this._frameCount = 0;
    }

    update() {
        super.update();
        if ($gameTemp.isDestinationValid()) {
            this.updatePosition();
            this.updateAnimation();
            this.visible = true;
        } else {
            this._frameCount = 0;
            this.visible = false;
        }
    };

    createBitmap() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        this.bitmap.fillAll('white');
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };

    updatePosition() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        var x = $gameTemp.destinationX();
        var y = $gameTemp.destinationY();
        this.x = ($gameMap.adjustX(x) + 0.5) * tileWidth;
        this.y = ($gameMap.adjustY(y) + 0.5) * tileHeight;
    };

    updateAnimation() {
        this._frameCount++;
        this._frameCount %= 20;
        this.opacity = (20 - this._frameCount) * 6;
        this.scale.x = 1 + this._frameCount / 20;
        this.scale.y = this.scale.x;
    };

}

//-----------------------------------------------------------------------------
// Sprite_Square
//
// The sprite for displaying the battle square.

class Sprite_BaseSquare extends PIXI.Sprite {
    constructor() {
        var bitmap = new PIXI.Graphics();
        bitmap.lineStyle(3, 0xffffff, 1);
        bitmap.beginFill(0xccb347);
        bitmap.drawRoundedRect(0, 0, Sprite_BaseSquare.squareSide, Sprite_BaseSquare.squareSide * 0.75, 10);
        bitmap.endFill();
        super(bitmap.generateCanvasTexture());
        this._animationCount = 0;
        this._battler = null;
        this.visible = false;
    }

    update() {
        if (this._battler) {
            if (this._battler.isSelected() /*|| this._battler.isInputting()*/) {
                this.updateCursor();
                this._animationCount++;
                this._animationCount %= 40;
            } else {
                this.resetSquare();
            }
        }
    };

    updateCursor() {
        var blinkCount = this._animationCount;
        var opacity = this.opacity;
        if (blinkCount < 20) {
            opacity -= blinkCount * 4;
        } else {
            opacity -= (blinkCount - 39) * 4;
        }
        this.alpha = opacity / 255;
        this.visible = true;
    };

    resetSquare() {
        this.alpha = 1;
        this.visible = false;
        this._animationCount = 0;
    };

    setBattler(battler) {
        this._battler = battler;
    };
}
Sprite_BaseSquare.squareSide = 64;

Object.defineProperty(Sprite_BaseSquare.prototype, 'opacity', {
    get: function() {
        return this.alpha * 255;
    },
    set: function(value) {
        this.alpha = value.clamp(0, 255) / 255;
    },
    configurable: true
});

//-----------------------------------------------------------------------------
// Sprite_Square
//
// The sprite for displaying all battle squares.

class Sprite_Squares extends Sprite_Base {
    constructor() {
        super();
        this._spacing = 40;
        this._offset = 10;
        this._counter = 0;
        this._isEnemy = null;
    }

    update() {
        Sprite.prototype.update.call(this);
    };

    createSquares(index) {
        var square, d, dy, totalWidth;
        d = this._spacing;
        dy = this._offset;
        totalWidth = -d;
        this._isEnemy = (index !== 1);

        for (var i = 0; i < 9; i++) {
            square = new Sprite_BaseSquare();
            square.anchor.set(0.5, 0.3);

            if (i % 3 === 0) totalWidth += square.width + d;
            if (index === 1) {
                square.x = (2- Math.floor(i / 3)) * (square.width + d);
            } else {
                square.x = (Math.floor(i / 3)) * (square.width + d);
            }
            square.y = (i % 3) * (square.width + d);

            if (i >= 3 && i <= 5) square.y -= dy;
            this.addChild(square);
        }
        this._totalWidth = totalWidth;
    };

    placeSquares() {
        var sw = SceneManager._screenWidth,
            sh = SceneManager._screenHeight,
            dw = 176,
            dh = sh * 0.5;
        if (!this._isEnemy) {
            this.position.set(dw + Sprite_BaseSquare.squareSide, dh);
        } else {
            this.position.set(sw - dw - this._totalWidth, dh);
        }
    };
}