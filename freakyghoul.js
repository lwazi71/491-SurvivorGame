class FreakyGhoul {
    constructor(game) {
        this.game = game;

        this.spriteSheet = ASSET_MANAGER.getAsset("./Sprites/Mobs/Freaky Ghoul/Ghoul Sprite Sheet.png");

        if (!this.spriteSheet) {
            console.error("Failed to load sprite sheet for Freaky Ghoul.");
        } else {
            console.log("Sprite sheet for Freaky Ghoul loaded successfully:", this.spriteSheet);
        }

        this.states = ["idle", "movement", "attack", "damage", "death"];
        this.state = "idle";

        this.animations = {
            idle: { row: 0, frames: 4, duration: 0.2 },
            movement: { row: 1, frames: 8, duration: 0.15 },
            attack: { row: 2, frames: 6, duration: 0.25 },
            damage: { row: 3, frames: 4, duration: 0.3 },
            death: { row: 4, frames: 6, duration: 0.35 },
        };

        this.elapsedTime = 0;
        this.totalTime = this.animations[this.state].duration * this.animations[this.state].frames;

        this.frameWidth = 32; 
        this.frameHeight = 32; 

        this.x = 50; 
        this.y = 200; 

        this.speed = 75; 

        this.damageDelay = 0.4; 
        this.deathDelay = 0.5; 
        this.bufferedTime = 0; 
    }

    update() {
        this.elapsedTime += this.game.clockTick;

        if (this.bufferedTime > 0) {
            this.bufferedTime -= this.game.clockTick;
            if (this.bufferedTime <= 0) {
                this.elapsedTime = 0; 
            }
            return; 
        }


        if (this.elapsedTime >= this.totalTime) {
            this.elapsedTime = 0; 
            const currentIndex = this.states.indexOf(this.state);

            if (this.state === "attack") {
                this.bufferedTime = this.damageDelay;
                this.state = "damage"; 
            } else if (this.state === "damage") {
                this.bufferedTime = this.deathDelay;
                this.state = "death"; 
            } else {
                this.state = this.states[(currentIndex + 1) % this.states.length];
            }

            this.totalTime = this.animations[this.state].duration * this.animations[this.state].frames;
        }

        if (this.state === "movement") {
            this.x += this.speed * this.game.clockTick;
            if (this.x > 1024) {
                this.x = -this.frameWidth; 
            }
        }
    }

    draw(ctx) {
        if (!this.spriteSheet) {
            console.error("Sprite sheet is not ready for drawing.");
            return;
        }

        const animation = this.animations[this.state];
        const frame = Math.floor(this.elapsedTime / animation.duration);

        const sourceX = frame * this.frameWidth;
        const sourceY = animation.row * this.frameHeight;

        ctx.drawImage(
            this.spriteSheet,
            sourceX, sourceY, this.frameWidth, this.frameHeight, 
            this.x, this.y, this.frameWidth, this.frameHeight
        );
    }
}
