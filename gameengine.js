// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = {x: 0, y: 0};
        this.leftclick = null;
        this.rightclick = null;
        this.mouse = {x: 0, y: 0};
        this.wheel = null;
        this.keys = {};

        this.leftClick = null;
        this.pause = false;
        this.upgradePause = false;
        this.shopPause = false;
        this.deathPause = false;

        this.currMap = 1;
        

        // Options and the Details
        this.options = options || {
            debugging: false,
        };
    };

    init(ctx) {
        this.ctx = ctx;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        this.running = true;
        const gameLoop = () => {
            this.loop();
            requestAnimFrame(gameLoop, this.ctx.canvas);
        };
        gameLoop();
    };

    startInput() {
        const getXandY = e => ({
            x: e.clientX - this.ctx.canvas.getBoundingClientRect().left,
            y: e.clientY - this.ctx.canvas.getBoundingClientRect().top
        });
        
        this.ctx.canvas.addEventListener("mousemove", e => {
            if (this.options.debugging) {
                console.log("MOUSE_MOVE", getXandY(e));
            }
            this.mouse = getXandY(e);
        });

        this.ctx.canvas.addEventListener("click", e => {
            if (this.options.debugging) {
                console.log("CLICK", getXandY(e));
            }
            this.click = getXandY(e);
            this.leftClick = true;
        });

        this.ctx.canvas.addEventListener("wheel", e => {
            if (this.options.debugging) {
                console.log("WHEEL", getXandY(e), e.wheelDelta);
            }
            e.preventDefault(); // Prevent Scrolling
            this.wheel = e;
        });

        this.ctx.canvas.addEventListener("contextmenu", e => {
            if (this.options.debugging) {
                console.log("RIGHT_CLICK", getXandY(e));
            }
            e.preventDefault(); // Prevent Context Menu
            this.rightclick = getXandY(e);
            this.rightClicks = true;
        });

        this.ctx.canvas.addEventListener('mousedown', e => {
            if (e.button === 0) { // Left mouse button
              this.leftClickHeld = true;
            //   console.log('Left mouse button is held down.');
            }
        });
        this.ctx.canvas.addEventListener('mouseup', e => {
            if (event.button === 0) { // Left mouse button
              this.leftClickHeld = false;
            //   console.log('Left mouse button is released.');
            }
          });


        // this.ctx.canvas.addEventListener("keydown", e => {
        //     if (e.shiftKey && e.repeat) return;

        //     this.keys[e.key] = true
        // });

        this.ctx.canvas.addEventListener("keydown", event => this.keys[event.key.toLowerCase()] = true);
        this.ctx.canvas.addEventListener("keyup", event => this.keys[event.key.toLowerCase()] = false);


        // this.ctx.canvas.addEventListener("keydown", e => {
        //     switch (e.key) {
        //         case 'd':
        //             that.right = true;
        //             break;
        //         case 'a':
        //             that.left = true;
        //             break;
        //         case 's':
        //             that.down = true;
        //             break;
        //         case 'w':
        //             that.up = true;
        //             break;
        //         case 'g':
        //             this.gkey = true;
        //             break;
        //         case ' ':
        //             this.spacekey = true;
        //             break;
        //         case 'e':
        //             this.ekey = true;
        //             break;
        //         case 'c':
        //             that.camera.camlock = !that.camera.camlock;
        //             break;
        //         case 'x': {
        //             this.camera.offsetx = 0;
        //             this.camera.offsety = 0;
        //         }
        //         case '1':
        //             this.camera.inventory.current = 1;
        //             break;
        //         case '2':
        //             this.camera.inventory.current = 2;
        //             break;
        //         case '3':
        //             this.camera.inventory.current = 3;
        //             break;
        //         case '4':
        //             this.camera.inventory.current = 4;
        //             break;
        //         case 'f':
        //             this.camera.inventory.useItem();
        //             break;
        //         case 'i':
        //             this.ikey = !this.ikey;
        //             break;
        //         default:
        //             break;
        //         }
        // }, false);


        // this.ctx.canvas.addEventListener("keyup", e => {
        //     switch (e.key) {
        //         case 'd':
        //             this.right = false;
        //             break;
        //         case 'a':
        //             this.left = false;
        //             break;
        //         case 's':
        //             this.down = false;
        //             break;
        //         case 'w':
        //             this.up = false;
        //             break;
        //         case 'g':
        //             this.gkey = false;
        //             break;
        //         case ' ':
        //             this.spacekey = false;
        //             break;
        //         case 'e':
        //             this.ekey = false;
        //             break;
        //         default:
        //             break;
        //     }
    //    }, false);
    };

    disableMouseInputs() {
        this.leftClick = false;
        this.rightClicks = false;
        // this.click = {x:0, y:0};
    }

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        // Clear the whole canvas with transparent color (rgba(0, 0, 0, 0))
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
       // console.log(this.entities);
        this.entities.sort((a, b) => (b.entityOrder || 0) - (a.entityOrder || 0));
        //console.log(this.entities);

        //Draw latest things first. GOING IN REVERSE ORDER!
        for (let i = this.entities.length - 1; i >= 0; i--) {
            this.entities[i].draw(this.ctx, this);
        }
        this.camera.draw(this.ctx);
    };

    update() {
        let entitiesCount = this.entities.length;
        //Upgrade
        if (this.keys["b"] && !this.adventurer.dead) {
            this.toggleUpgradePause();
            this.click = {x: 0, y: 0};
        }
        
        // if (this.keys["u"]) {
        //     this.camera.enableChest = true;
        //     this.toggleShopPause();
        //     this.click = {x: 0, y: 0};
        // }
        // //How to open shop
        // if (this.keys["i"]) {
        //     this.camera.enableLevelShop = true;
        //     this.toggleShopPause();
        //     this.keys["i"] = false;
        // }
        for (let i = 0; i < entitiesCount; i++) {
            let entity = this.entities[i];

            if (!entity.removeFromWorld) {
                entity.update();
            }
        }

        this.camera.update();

        for (let i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }
    };

    loop() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.clockTick = this.timer.tick();
        this.pauseTick = this.timer.pauseTick();
        this.escapeButton();
        if (!this.pause) {
            if (!this.upgradePause && !this.shopPause && !this.deathPause) { //Default loop
                this.update();
                this.draw();
                this.timer.isPaused = false;
                this.timer.enablePauseTick = false;
            } else if (this.upgradePause) {
                this.upgrade.update();
                this.upgrade.draw(this.ctx);
                this.timer.isPaused = true;
                this.timer.enablePauseTick = true;
                this.disableMouseInputs();
            } else if (this.shopPause && this.camera.enableChest) {
                this.chestItems.enableBuy = true;
                this.chestItems.update();
                this.chestItems.draw(this.ctx);
                this.timer.isPaused = true;
                this.timer.enablePauseTick = true;
                this.disableMouseInputs();
            } else if (this.shopPause && this.camera.enableLevelShop) {
                this.levelShop.enableBuy = true;
                this.levelShop.update();
                this.levelShop.draw(this.ctx);
                this.timer.isPaused = true;
                this.timer.enablePauseTick = true;
                this.disableMouseInputs();
            } else if (this.deathPause) {
                this.deathScreen.update();
                this.deathScreen.draw(this.ctx);
                this.winScreen.update();
                this.winScreen.draw(this.ctx);
                this.timer.isPaused = true;
                this.timer.enablePauseTick = true;
                // this.disableMouseInputs();
            }
        } else {
            this.pauseMenu.update();
            this.pauseMenu.draw(this.ctx);
            this.timer.isPaused = true;
            this.disableMouseInputs();
        }
    };
    escapeButton() {
        //escape settings
        if (this.keys["escape"] && !this.camera.enableTitle && !this.camera.transition) {
            if (this.upgradePause && !this.upgrade.enablePlayerStats) {
                this.toggleUpgradePause();
                this.upgrade.makingChoice = false;
                this.upgrade.enablePlayerStats = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            } else if (this.upgradePause && this.upgrade.enablePlayerStats){
                this.upgrade.enablePlayerStats = false;
                this.upgrade.player.upgradeMenu = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            } else if (this.shopPause && this.chestItems.showPlayer) {
                this.chestItems.showPlayer = false;
                this.upgrade.player.upgradeMenu = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            // } else if (this.shopPause && this.camera.enableShop) {
            //     this.shop.enableBuy = false;
            //     this.shop.showUpgrade = false;
            //     this.shopPause = false;
            } else if (this.shopPause && this.camera.enableLevelShop) {
                if (this.levelShop.showPlayer) {
                    this.levelShop.showPlayer = false;
                    this.upgrade.player.upgradeMenu = false;
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
                } else if (this.levelShop.showUpgrade) {
                    //Empty so it does nothing
                } else {
                    this.levelShop.fade = true;
                    this.levelShop.elapsedTime = 1;
                    this.levelShop.changes = 1;
                    this.camera.enableLevelShop = false;
                    this.levelShop.enableBuy = false;
                    this.levelShop.showUpgrade = false;
                    this.toggleShopPause();
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
                }
            } else if (this.deathPause && this.deathScreen.showUpgrade) {
                this.deathScreen.showUpgrade = false;
                this.upgrade.player.upgradeMenu = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            } else if (this.pause && this.pauseMenu.showSettings) {
                this.pauseMenu.showSettings = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            } else if (this.pause && this.pauseMenu.confirmation) {
                this.pauseMenu.confirmation = false;
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            } else if (!this.deathPause){ //
                this.togglePause();
                if (this.pause) {
                    ASSET_MANAGER.pauseMusic()
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Pause.mp3");
                } else {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Unpause.mp3");
                    ASSET_MANAGER.playAsset(this.camera.levelMusicPath);
                }
            }
            this.resetDrawingValues();
            this.keys["escape"] = false;
        }
        if (this.keys["escape"] && this.camera.enableTitle && this.camera.title.showSettings) {
            this.camera.title.showSettings = false;
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            this.keys["escape"] = false;
        }
    }
    toggleUpgradePause() {
        this.upgradePause = !this.upgradePause;
        // if (this.upgradePause) {
        //     ASSET_MANAGER.pauseMusic();
        // } else {
        //     ASSET_MANAGER.playAsset(this.camera.levelMusicPath);
        // }
    }

    toggleDeathPause() {
        this.deathPause = !this.deathPause;
    }

    togglePause() {
        this.pause = !this.pause;
    }
    toggleShopPause() {
        this.shopPause = !this.shopPause;
        if (this.shopPause) {
            ASSET_MANAGER.pauseMusic();
            ASSET_MANAGER.playAsset("./Audio/Music/Shop Music.mp3");
        } else {
            ASSET_MANAGER.pauseMusic();
            ASSET_MANAGER.playAsset(this.camera.levelMusicPath);
        }
    }
    resetDrawingValues() {
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "alphabetic";
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = "Black";
        this.ctx.strokeStyle = "Black";
    }
    isHovering(x, y, length, height) {
        this.mouse.x ? this.mouse.x : 0;
        this.mouse.y ? this.mouse.y : 0;
        return this.mouse.x > x && this.mouse.x < x + length &&
        this.mouse.y > y && this.mouse.y < y + height;
    }
    isClicking(x, y, length, height) {
        // this.mouse.x ? this.mouse.x : 0;
        // this.mouse.y ? this.mouse.y : 0;
        let check = false;
        if (this.click.x > x && this.click.x < x + length &&
            this.click.y > y && this.click.y < y + height && this.leftClick) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Select.mp3");
                check = true;
                // this.leftClick = false;
            }
        return check
    }
    isPaused() {
        return this.pause || this.upgradePause || this.deathPause || this.shopPause;
    }
};

// KV Le was here :)