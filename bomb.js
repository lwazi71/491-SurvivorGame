class Bomb {
    constructor(game, x, y, bombtimer, damage, explosionscale) {
        Object.assign(this, {game, x, y, bombtimer, damage, explosionscale});
        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");



        // this.state = 0; //0 = ticking state, 1 = explosion state
        // this.scale = 3.5;
        // this.explosionDuration = 0.9; // How long the explosion lasts in seconds
        // this.explosionTimer = this.explosionDuration;
        // this.hasExploded = false; // Track if damage has been dealt

        this.state = 0; // 0 = ticking state
        this.scale = 3.5;
        this.hasExploded = false; //Track if damage has been dealt
        this.bitSize = 32; //must have bitsize for explosion animation (required for CircleAOE class)
        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.animations = [];
        this.updateBB();

        this.loadAnimations();
    }

    updateBB() {
        this.BB = new BoundingBox(this.x + 38, this.y + 36, 35, 35);
    }

    loadAnimations() {
        //ticking animation
        this.animations[0] = new Animator(this.spritesheet, 0, 32, 32, 32, 3.9, 0.1, false, true);
    }



    update() {
        this.bombtimer -= this.game.clockTick;

        if (!this.hasExploded) {
            // Apply knockback effect

            this.x += this.pushbackVector.x * this.game.clockTick;
            this.y += this.pushbackVector.y * this.game.clockTick;

            // Decay the pushback vector
            this.pushbackVector.x *= this.pushbackDecay;
            this.pushbackVector.y *= this.pushbackDecay;
        }
            
        if (this.bombtimer <= 0 && !this.hasExploded) {
            this.explode();
            this.hasExploded = true;
            this.removeFromWorld = true;
        }

        this.updateBB();
    }

    explode() {
        const centerX = this.x + (this.bitSize * this.scale) / 2; //start explosion animation in the middle of the bomb.
        const centerY = this.y + (this.bitSize * this.scale) / 2;

        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Explosion.mp3");
        //48 x 48 explosion
        this.game.camera.cameraShake(100);
        this.game.addEntity(new CircleAOE
            (this.game, centerX, centerY, "./Sprites/Explosion/explosion.png", null, this.explosionscale, this.damage, 0, this, true, 0, 0, 48, 48, 8, 0.1, false, false));

    }

    takeKnockback(knockbackForce, sourceX, sourceY) {
        // Apply knockback
        //find the center of our character for the knockback.
        const dx = (this.x + (this.bitSize * this.scale)/2 - 10) - sourceX;
        const dy = (this.y + (this.bitSize * this.scale)/2 - 10) - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the mob and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    }



    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Green';
            ctx.strokeRect((this.x + (this.bitSize * this.scale)/2 - 10) - this.game.camera.x, (this.y + (this.bitSize * this.scale)/2 - 10) - this.game.camera.y, 20, 20);

            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }
}