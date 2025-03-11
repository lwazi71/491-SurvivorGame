class TransitionScreen {
    constructor (game, level) {
        Object.assign(this, {game, level});

        this.elapsed = 0;
        this.loading = ["Loading", "Loading.","Loading..","Loading..."];
        this.text = 0;
        this.timer = 0;
        this.duration = 0.5;
        this.heroAnimation = [];
        this.loadingTimer = Math.floor(Math.random() * (5 - 2 + 1) + 2);; //2 to 5 seconds
        this.scale = 2.8;

        this.loadHeroAnimation();
    }
    loadHeroAnimation() {
        for (var i = 0; i < 2; i++) {
            this.heroAnimation.push([]);
        }
        //Walking
        this.heroAnimation[0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/HudIcons/AdventurerSpriteTransition2.png"), 0, 0, 32, 32, 8, 0.1, false, true);
        //Pushing
        this.heroAnimation[1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 416, 32, 32, 8, 0.12, false, true); 
        
        this.crate = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/DestructibleObjects.png"), 0, 128, 63.3, 63.3, 1, 1, false, true);;
    }
    update() {
        this.elapsed += this.game.clockTick;
        this.ratio = this.elapsed / this.loadingTimer;
        this.timer += this.game.clockTick;
        if (this.timer > this.duration) {
            (this.text > 2) ? this.text = 0 : this.text++;;
            this.timer = 0;
        }
        if (this.elapsed > this.loadingTimer) {
            this.game.camera.loadLevel(this.level, false);
            this.removeFromWorld = true;
            this.elapsed = 0;
        }
        this.game.disableMouseInputs();
    }
    draw(ctx) {
        ctx.fillStyle = "Black";
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        ctx.fillStyle = "White";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "bottom"; 
        ctx.font = 24 + 'px "Press Start 2P"';
        ctx.fillText(this.loading[this.text],PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT - 120);

        let runningScale = 4;
        this.heroAnimation[0].drawFrame(this.game.clockTick, ctx, PARAMS.CANVAS_WIDTH / 2 - 16 * runningScale, PARAMS.CANVAS_HEIGHT / 2 - 16 * runningScale, runningScale);

        //Fake loading bar
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.fillStyle = "White";
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - 200, PARAMS.CANVAS_HEIGHT - 100, 400 * this.ratio, 50, [10]);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "White";
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - 200, PARAMS.CANVAS_HEIGHT - 100, 400, 50, [10]);
        ctx.stroke();

        this.heroAnimation[1].drawFrame(this.game.clockTick, ctx, 
            (PARAMS.CANVAS_WIDTH / 2 - 16 * this.scale - 250) + (400 * this.ratio), PARAMS.CANVAS_HEIGHT - 135, this.scale);
        this.crate.drawFrame(this.game.clockTick, ctx, 
            (PARAMS.CANVAS_WIDTH / 2 - (63.3 / 2) * this.scale + 22 - 250) + (400 * this.ratio), PARAMS.CANVAS_HEIGHT - 135 - 40, this.scale);
    }
}
class FadeIn {
    constructor(game) {
        this.game = game;
        this.elapsed = 0;
        this.changes = 1;
        this.entityOrder = 100;
    }
    update() {
        this.elapsed += this.game.clockTick;
        if (this.elapsed > 1) {
            this.removeFromWorld = true;
        }
        this.changes -= 0.02;
    }
    draw(ctx) {
        ctx.fillStyle = rgba(0, 0, 0, this.changes);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
    }
}

class FadeText {
    constructor(game, text) {
        this.game = game;
        this.text = text;
        this.elapsed = 0;
        this.changes = 1;
        this.entityOrder = 100;
    }
    update() {
        this.elapsed += this.game.clockTick;
        if (this.elapsed > 4) {
            this.removeFromWorld = true;
        }
        if (this.elapsed > 3) this.changes -= 0.02;
    }
    draw(ctx) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = rgba(255, 255, 255, this.changes);
        ctx.strokeStyle = rgba(0, 0, 0, this.changes);
        // ctx.font = 24 + 'px "Press Start 2P"';
        ctx.font = 36 + 'px Lilita One';
        ctx.fillText(this.text, PARAMS.CANVAS_WIDTH / 2, 150);
        ctx.strokeText(this.text, PARAMS.CANVAS_WIDTH / 2, 150);
    }
}