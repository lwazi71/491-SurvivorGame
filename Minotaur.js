class Minotaur {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.damage = 36;
        this.state = 0; // Start in idle state
        this.facing = 0;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.scale = 2.8;
        this.bitSizeX = 96;
        this.bitSizeY = 96;

        this.speed = 145;
        
        // Combat properties
        this.attackRange = 140; //Detection range for attacks
        this.closeRange = 70;   //Range for spin attack
        this.verticalCloseRange = 90; // Range for considering player "below" the minotaur
        this.attacking = false;
        this.attackCooldown = 1.3; //Seconds between attacks
        this.attackTimer = 0;
        this.lockedFacing = null; //Will be locked to this.facing, which is why we start off with null.
        this.knockback = 2000;
        
        // Animation timers
        this.attack1Duration = 0.712; // 9 frames * 0.1 seconds
        this.attack2Duration = 0.72; // 9 frames * 0.1 seconds

        this.deathAnimationTimer = 0.6;
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.3; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.health = 70;
        this.maxHealth = 70;
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, 5, -80));
        this.dead = false;

        this.entityOrder = 40;


        this.animations = [];
        this.loadAnimation();
        this.updateBB();
    }


    loadAnimation() {
        for (var i = 0; i < 6; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }

        //RIGHT
        //idle 
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 0, 96, 96, 5, 0.2, false, true);

        //walking
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 96, 96, 96, 8, 0.08, false, true);

        //Attack 1
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 288, 96, 96, 9, 0.08, false, true);

        //Attack 3
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 576, 96, 96, 9, 0.08, false, true);

        //Damaged
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 96, 768, 96, 96, 2, 0.15, false, true);


        //LEFT
        //idle
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 960, 96, 96, 5, 0.2, false, true);

        //walking
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 1056, 96, 96, 8, 0.08, false, true);

        //Attack 1
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 1248, 96, 96, 9, 0.08, false, true);

        //Attack 2
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 1536, 96, 96, 9, 0.08, false, true);

        //Damaged
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 96, 1728, 96, 96, 2, 0.15, false, true);

        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Minotaur/Minotaur.png"), 0, 864, 96, 96, 6, 0.1, false, false);
    }

    updateBB() {
        // Create a bounding box that's smaller than the sprite for better collision
        const width = this.bitSizeX * this.scale * 0.3;  // 40% of sprite width
        const height = this.bitSizeY * this.scale * 0.4; // 60% of sprite height
        const offsetX = (this.bitSizeX * this.scale - width) / 2 ;
        const offsetY = (this.bitSizeY * this.scale - height) / 2 - 10;
    
        this.BB = new BoundingBox(
            this.x + offsetX,
            this.y + offsetY,
            width,
            height
        );
    }

    update() {
       // Get player's center position
        const player = this.game.adventurer;
        if (!player || player.dead) return;

        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 1; // Return to idle state
            }
        }

        if (this.dead) {
            // Handle death animation
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return; //return so the enemy would stop moving when it's dead.
            } else {
                // Remove enemy from world after the animation finishes
                this.removeFromWorld = true;
                return;
            }
        }

        if (!this.dead) {
            // Apply knockback effect

            this.x += this.pushbackVector.x * this.game.clockTick;
            this.y += this.pushbackVector.y * this.game.clockTick;

            // Decay the pushback vector
            this.pushbackVector.x *= this.pushbackDecay;
            this.pushbackVector.y *= this.pushbackDecay;

        }

        //will be based on the player BB because we're going to use the player bounding box to get hits with minotaur
        const playerCenterX = player.BB.x + player.BB.width / 2;
        const playerCenterY = player.BB.y + player.BB.height / 2;
        
        // Get minotaur's center position
        const minotaurCenterX = this.BB.x + this.BB.width / 2;
        const minotaurCenterY = this.BB.y + this.BB.height / 2;
        
        // Calculate distances
        const dx = playerCenterX - minotaurCenterX;
        const dy = playerCenterY - minotaurCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only update facing if not attacking
        if (!this.attacking) {
            this.facing = dx > 0 ? 0 : 1;
            this.lockedFacing = null;
        }

        // Handle attack cooldown
        if (this.attackTimer > 0) {
            this.attackTimer -= this.game.clockTick;
        }

        // Update attack state if attacking
        if (this.attacking) {
            this.currentAttackTimer -= this.game.clockTick;
            if (this.currentAttackTimer <= 0) {
                this.attacking = false;
                this.state = 1; // Return to walking
                this.lockedFacing = null; // Release the facing lock
            }
        }

        // Movement logic - always try to move unless in collision
        if (!this.BB.collide(player.BB)) {
            // Calculate normalized direction vector
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Move towards player
            this.x += dirX * this.speed * this.game.clockTick;
            this.y += dirY * this.speed * this.game.clockTick;
            
            // Only update to walking animation if not attacking
            if (!this.attacking) {
                this.state = 1; // Walking animation state
            }
        } else if (!this.attacking) {
            this.state = 1; //idle animation state
        }

        //attack logic
        if (this.attackTimer <= 0 && !this.isPlayingDamageAnimation) { 
            if (this.BB.collide(player.BB) && distance > 50) {
                //Player is touching/inside minotaur - do attack2
                this.attack2();
            } else if (dy < 5 && distance < 120) {
                //player is above AND more horizontal than vertical - do attack1. dy < 0 checks if player is above minotaur
                this.attack1();
            }
        }

        this.updateBB();
    }
    
    attack1() {
        this.attacking = true;
        this.state = 2; // Attack1 animation state
        this.currentAttackTimer = this.attack1Duration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; // Lock the facing direction

        // Reset attack animation
        this.animations[2][this.facing].elapsedTime = 0;

        // Check if player is in attack range and deal damage
        const player = this.game.adventurer;
        if (player && !player.dead) {
            const dx = (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2);
            const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= this.attackRange) {
                // Calculate the center position of the minotaur for the knockback source
                const minotaurCenterX = this.BB.x + this.BB.width/2 - 15;
                const minotaurCenterY = this.BB.y + this.BB.height/2 - 10;

                // Pass the minotaur's center position as the source of the knockback
                player.takeDamageKnockback(this.damage, this.knockback, minotaurCenterX, minotaurCenterY);
            }
        }
    }

    attack2() {
        this.attacking = true;
        this.state = 3; // Attack2 animation state
        this.currentAttackTimer = this.attack2Duration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; //Lock the facing direction

        // Reset attack animation
        this.animations[3][this.facing].elapsedTime = 0;

        // Check if player is in close range and deal damage
        const player = this.game.adventurer;
        if (player && !player.dead) {
            const dx = (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2);
            const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const verticalDistance = Math.abs(dy);
            const angle = Math.atan2(dy, dx); //radians
            //Deal damage if either:
            if (distance <= this.closeRange || 
                (dy > 0 && verticalDistance <= this.verticalCloseRange && distance <= this.attackRange)) {
                const minotaurCenterX = this.BB.x + this.BB.width/2 - 15;
                const minotaurCenterY = this.BB.y + this.BB.height/2 - 10;
    
                // Pass the minotaur's center position as the source of the knockback
                player.takeDamageKnockback(this.damage * 1.5, this.knockback * 2, minotaurCenterX, minotaurCenterY);
            }
        }
    }

    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        this.health -= damage;
        
        // Apply knockback
        const dx = (this.x + (this.bitSizeX * this.scale)/2) - sourceX;
        const dy = (this.y + (this.bitSizeY * this.scale)/2) - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);


        if (distance > 0) {
            this.pushbackVector.x = (dx / distance) * knockbackForce;
            this.pushbackVector.y = (dy / distance) * knockbackForce;
        } else {
            // Default knockback direction (e.g., upward) in case the blue ghoul and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            let drop = Math.random();
            if(drop < this.dropchance) {
                this.game.addEntity(new Threecoin(this.game, (this.x + 28), (this.y + 55)));
            }
            this.dead = true;
            this.state = 4;
        } else {
            this.state = 4;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[4][0].elapsedTime = 0;
            } else {
                this.animations[4][1].elapsedTime = 0;
            }
        }
    }

    draw(ctx) {
        // Draw shadow
        const shadowWidth = 96 * (this.scale / 2.8);
        const shadowHeight = 32 * (this.scale / 2.8);
        const shadowX = (this.x + (84 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (150* (this.scale / 2.8))) - this.game.camera.y;
        
        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
        
        // Draw minotaur
        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[4][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }
        
        // Debug: Draw bounding box
        if (PARAMS.DEBUG) {
            if (this.BB) {
                ctx.strokeStyle = 'Red';
                ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
            }
            ctx.strokeStyle = 'Green';
            ctx.strokeRect((this.BB.x + this.BB.width/2) - 15 - this.game.camera.x, (this.BB.y + this.BB.height/2) - 10 - this.game.camera.y, 20, 20);
        }
    }
}