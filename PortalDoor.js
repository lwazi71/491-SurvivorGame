class PortalDoor {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});

        this.spritesheet = ASSET_MANAGER.getAsset("./Sprites/Objects/portal.png");
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.animations = [];

        // Start with emerge animation (state 1)
        this.state = 1; 

        this.scale = 5;

        this.bitSizeX = 32;
        this.bitSizeY = 32;
        
        // Flag to track if emerge animation is complete
        this.emergeComplete = false;
        this.transition = true;
        
        // Track animation timer
        this.animationTimer = 0;
        this.pointer = this.game.addEntity(new Pointer(game, this));

        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Portal Open.wav");
        
        this.updateBB();
        this.loadAnimations();
    } 

    updateBB() {
        const width = this.bitSizeX * this.scale * 0.2;  // 40% of sprite width
        const height = this.bitSizeY * this.scale * 0.6; // 50% of sprite height
        const offsetX = (this.bitSizeX * this.scale - width) / 2 + 80;
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 100;
    
        this.BB = new BoundingBox(
            this.x + offsetX,
            this.y + offsetY,
            width,
            height
        );
    }

    loadAnimations() {
        //idle
        this.animations[0] = new Animator(this.spritesheet, 0, 0, 64, 64, 7.9, 0.1, false, true);

        //emerge
        this.animations[1] = new Animator(this.spritesheet, 0, 64, 64, 64, 7.9, 0.1, false, true);
    }

    update() {
        // If currently in emerge state
        if (this.state === 1) {
            // Add to the animation timer
            this.animationTimer += this.game.clockTick;
            
            // Check if emerge animation is complete (7.9 frames * 0.1 seconds per frame)
            if (this.animationTimer >= 7.9 * 0.1) {
                // Switch to idle state
                this.state = 0;
                // Reset animation timer
                this.animationTimer = 0;
                // Mark emerge as complete
                this.emergeComplete = true;
                this.updateBB();
            }
        }

        // Only check for player collision when portal is fully emerged
        if (this.emergeComplete) {
            // Get player entity
            const player = this.game.adventurer;

            if (player && this.BB.collide(player.BB)) {
                //this.game.currMap++;
                console.log("touching portal");
                if (this.game.camera.currMap < 4) {
                    this.game.camera.loadLevel(this.game.camera.currMap += 1, true);
                    this.game.camera.bossDead = false;
                } else {
                    this.game.toggleDeathPause();
                    this.game.camera.triggerWinScreen(); // Notify SceneManager to show death screen
                }
            } 
        }
    }

    draw(ctx) {
        this.animations[this.state].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);

        if (PARAMS.DEBUG) {

            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
    }
}