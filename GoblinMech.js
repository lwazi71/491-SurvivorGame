class GoblinMech {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.damage = 36;
        this.state = 0; // Start in idle state
        this.facing = 0;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.scale = 3;
        this.bitSizeX = 160;
        this.bitSizeY = 96;

        this.speed = 120;
        
        // Combat properties
        this.attackRange = 200; //Detection range for attacks
        this.attacking = false;
        this.attackCooldown = 0.7; //Seconds between attacks
        this.attackTimer = 0;
        this.lockedFacing = null; //Will be locked to this.facing, which is why we start off with null.
        this.knockback = 2000;
        
        // Animation timers
        this.attack1Duration = 0.345; 

        this.deathAnimationTimer = 0.5;
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.45; // Duration of damage animation
        this.isPlayingDamageAnimation = false;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays
        this.dead = false;

        this.attackDelay = 0;

        this.health = 160;
        this.maxHealth = 160;
        this.didCrit = false;
        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, -6, 18));

        this.entityOrder = 40;

        this.animations = [];
        this.loadAnimation();
        this.updateBB();
    }


    loadAnimation() {
        for (var i = 0; i < 5; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }

        //RIGHT
        //idle 
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech.png"), 0, 0, 160, 96, 2, 0.2, false, true);

        //walking
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech.png"), 0, 96, 160, 96, 7.9, 0.08, false, true);

        //Attack 1
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech.png"), 0, 192, 160, 96, 6.9, 0.05, false, true);

        //Damaged
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech.png"), 160, 288, 160, 96, 3, 0.15, false, true);


        //LEFT
        //idle
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech-flipped.png"), 960, 0, 160, 96, 4.9, 0.2, true, true);

        //walking
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech-flipped.png"), 18, 96, 160, 96, 7.9, 0.08, true, true);

        //Attack 1
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech-flipped.png"), 178, 192, 160, 96, 6.9, 0.05, true, true);

        //Damaged
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech-flipped.png"), 640, 288, 160, 96, 3, 0.15, true, true);

        this.warning = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/warning.png"), 0, 0, 1024, 1024, 7.9, 0.1, false, true); //used for mini bosses

        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Goblin/GoblinMech.png"), 160, 384, 160, 96, 5, 0.1, false, false);
    }

    updateBB() {
        // Create a bounding box that's smaller than the sprite for better collision
        const width = this.bitSizeX * this.scale * 0.3;  // 40% of sprite width
        const height = this.bitSizeY * this.scale * 0.5; // 50% of sprite height
        const offsetX = (this.bitSizeX * this.scale - width) / 2 ;
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 73;
    
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

        //will be based on the player BB because we're going to use the player bounding box to get hits with mech
        const playerCenterX = player.BB.x + player.BB.width / 2;
        const playerCenterY = player.BB.y + player.BB.height / 2;
        
        // Get mech's center position
        const mechCenterX = this.BB.x + this.BB.width / 2;
        const mechCenterY = this.BB.y + this.BB.height / 2;
        
        // Calculate distances
        const dx = playerCenterX - mechCenterX;
        const dy = playerCenterY - mechCenterY;
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

        //this is used so mech wont get spammed when its in its damage animation state
        if (player.BB.collide(this.BB) && this.attackTimer <= 0 && !this.attacking) {
            const centerX = this.BB.x + this.BB.width / 2;
            const centerY = this.BB.y + this.BB.height / 2;
            player.takeDamageKnockback(this.damage/2, this.knockback, centerX, centerY); // Slightly reduced damage
        }

        // Update attack state if attacking
        if (this.attacking) {
            this.currentAttackTimer -= this.game.clockTick;
            
            // Add continuous hit detection during attack
            const player = this.game.adventurer;
            if (player && !player.dead) {
                const dx = (player.BB.x + player.BB.width/2) - (this.BB.x + this.BB.width/2);
                const dy = (player.BB.y + player.BB.height/2) - (this.BB.y + this.BB.height/2);
                const distance = Math.sqrt(dx * dx + dy * dy);
        
                //Check for hit during the active frames of the attack animation
                //When during the attack the player will get damaged. Player can still potentially not get damaged during wind up.
                const attackProgress = this.animations[2][this.facing].elapsedTime / this.attack1Duration; 
                if (attackProgress >= 0.5 && distance <= this.attackRange) {
                    const centerX = this.BB.x + this.BB.width/2 - 15;
                    const centerY = this.BB.y + this.BB.height/2 - 10;
                    player.takeDamageKnockback(this.damage, this.knockback, centerX, centerY);
                }
            }
            
            if (this.currentAttackTimer <= 0) {
                this.attacking = false;
                this.state = 1; // Return to idle
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
        }
        

        if (this.attackTimer <= 0 && !this.isPlayingDamageAnimation) { 
            if (this.BB.collide(player.BB) && distance > 50) {
                //Player is touching mech
                this.attack1();
            } else if (dy < 40 && distance < 150) {
                //player is above AND more horizontal than vertical - do attack1. dy < 0 checks if player is above mech
                this.attack1();
            }
        }
        const separationDistance = 200; 
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if ((entity instanceof GoblinMech || entity instanceof Boss1 || entity instanceof Goblin) && entity !== this) {
                const dx = entity.x - this.x;
                const dy = entity.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < separationDistance && distance > 0) {
                    // Apply a repelling force
                    const repelFactor = 40; // Adjust for stronger/weaker repulsion
                    const repelX = dx / distance * repelFactor * this.game.clockTick;
                    const repelY = dy / distance * repelFactor * this.game.clockTick;
    
                    this.x -= repelX;
                    this.y -= repelY;
                }
            }
        }
  



        this.updateBB();
    }
    
    attack1() {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee punch.wav");
        this.attacking = true;
        this.state = 2; // Attack1 animation state
        this.currentAttackTimer = this.attack1Duration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; // Lock the facing direction
    
        // Reset attack animation
        this.animations[2][this.facing].elapsedTime = 0;
    }

    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        this.health -= damage;
        if (this.dead) {
            return;
        }
        
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
            this.game.addEntity(new MultipleCoins(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2)));

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
        const shadowWidth = 120 * (this.scale / 3);
        const shadowHeight = 32 * (this.scale / 3);
        const shadowX = (this.x + (175 * (this.scale / 3))) - this.game.camera.x;
        const shadowY = (this.y + (270* (this.scale / 3))) - this.game.camera.y;
        
        this.warning.drawFrame(this.game.clockTick, ctx, shadowX + 35, shadowY - (58 * this.scale), 0.05);

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
                
        // Draw mech
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