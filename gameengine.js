// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {
    constructor(options) {
        // What you will use to draw
        // Documentation: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
        this.ctx = null;

        // Everything that will be updated and drawn each frame
        this.entities = [];

        // Information on the input
        this.click = null;
        this.leftclick = null;
        this.rightclick = null;
        this.mouse = null;
        this.wheel = null;
        this.keys = {};

        this.leftClick = null;
        this.pause = false;
        this.upgradePause = false;
        this.setDelay = 0;

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
        if (this.keys["b"]) {
            this.toggleUpgradePause();
            this.click = {x: 0, y: 0};
        }
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
        if (this.keys["escape"]) {
            if (this.upgradePause && !this.upgrade.enablePlayerStats) {
                this.toggleUpgradePause();
                this.setDelay = 1;
                this.upgrade.makingChoice = false;
                this.upgrade.enablePlayerStats = false;
            } else if (this.upgradePause && this.upgrade.enablePlayerStats){
                this.upgrade.enablePlayerStats = false;
            } else {
                this.togglePause();
                this.disableMouseInputs();
                this.drawPause(this.ctx);
            }
            this.resetDrawingValues();
            this.keys["escape"] = false;
        }

        if (!this.pause) {
            this.clockTick = this.timer.tick();
            this.pauseTick = this.timer.pauseTick();

            if (!this.upgradePause && this.setDelay <= 0) { //Default loop
                this.update();
                this.draw();
                this.timer.isPaused = false;
                this.timer.enablePauseTick = false;
            } else if (this.setDelay <= 0) {
                this.upgrade.update();
                this.upgrade.draw(this.ctx);
                this.timer.isPaused = true;
                this.timer.enablePauseTick = true;
                this.disableMouseInputs();
            } else {
                if (this.setDelay > 0) this.setDelay -= 0.1;
            }
        }
    };

    toggleUpgradePause() {
        this.upgradePause = !this.upgradePause;
    }

    togglePause() {
        this.pause = !this.pause;
    }
    drawPause(ctx) {
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        ctx.fillStyle = "White";
        ctx.fillText("Paused",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);

        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
    }
    resetDrawingValues(ctx) {
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "alphabetic";
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = "Black";
        this.ctx.strokeStyle = "Black";
    }
};

// KV Le was here :)