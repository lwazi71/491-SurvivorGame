class GolemMech {
    constructor(game, x, y) {
        Object.assign(this, {game, x, y});
        this.damage = 36;


        //0 = walking, 1 = projectile arm, 2 = immunity animation, 3 = immunity (healing) last frame, 4 = attack, 
        //5 = damaged, 6 = laser??? 
        this.state = 0; 
        this.facing = 0;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        
        this.scale = 6;
        this.bitSizeX = 100;
        this.bitSizeY = 100;

        this.speed = 185;
        
        //Attack Properties
        this.attackRange = 180; //Detection range for attacks
        this.attacking = false;
        this.attackCooldown = 0.7; //Seconds between attacks
        this.attackTimer = 0;
        this.lockedFacing = null; //Will be locked to this.facing, which is why we start off with null.
        this.knockback = 2000;
        this.attackDuration = 6.9 * 0.1; 

        //Death/Damage
        this.deathAnimationTimer = 5.9 * 0.1;
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.9 * 0.1; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.deathAnimationTimer2 = 3.9 * 0.1;
        this.deadP2 = false;
        

        //Immunity/Healing Properties. If player gets too far, it'll start healing itself until the player damages it again
        this.immunity = false;
        this.immunityTransformAnimationTimer = 0;
        this.immunityTransformAnimationDuration = 6 * 0.1; // Duration should match your animation (5 frames * 0.1s)
        this.immunitydeTransformAnimationTimer = 0;
        this.healingSound = 0;




        //Projectile Properties: 
        this.shootArmTimer = 0;
        this.shootDuration = 8.9 * 0.1;
        this.shootSpeed = 1200;
        this.shootCooldown = 3.7; //Shoot every 4 seconds
        this.shootTimer = 0; //should be 0
        this.shootAnimationElapsedTime = 0; //used for when boss does throwing animation then it faces other way
        this.shouldShoot = false;
        this.armLifeTime = 2;
        this.range = 650; //range is how close our player has to be
        this.armScale = 5;
        this.armDamage = 21;
        this.armKnockback = 1600;

        //Armour Buff Properties

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays
        this.dead = false;

        this.attackDelay = 0;

        this.currentHealth = 500;
        this.maxHealth = 500;
        this.didCrit = false;

        this.name = "Chrono Golem"

        this.profileAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/HudIcons/Boss2Hud.png"), 0, 0, 32, 32, 7, 0.2, false, true);
        this.healthbar = this.game.addEntity(new BossHealthBar(game, this, this.profileAnimation, 32, 0, 0, 3));
        this.pointer = this.game.addEntity(new Pointer(game, this));


        this.healRate = 50; // Health restored per second

        this.entityOrder = 40;

        this.animations = [];
        this.loadAnimation();
        this.updateBB();
    }


    loadAnimation() {
        for (var i = 0; i < 7; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }

        //RIGHT
        //walking
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 0, 0, 100, 100, 3.9, 0.1, false, true);

        //projectile
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 0, 200, 100, 100, 8.9, 0.1, false, true);

        //immunity transformation
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 0, 300, 100, 100, 6.9, 0.1, false, true);

        //immunity last frame. Should be when it starts healing
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 700, 300, 100, 100, 0.95, 0.2, false, true);

        //attack
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 0, 400, 100, 100, 6.9, 0.1, false, true);

        //damaged
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 200, 700, 100, 100, 0.9, 0.1, false, true);

        //immunity detransformation
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 10, 300, 100, 100, 6.9, 0.1, true, true);


        
        //could be laser move in the future??
        //this.animations[6][0]...

        //LEFT
        //walking
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 611, 0, 100, 100, 3.9, 0.1, true, true);

        //projectile
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 111, 200, 100, 100, 8.9, 0.1, true, true);

        //immunity transformation
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 311, 300, 100, 100, 6.9, 0.1, true, true);

        //immunity last frame. Should be when it starts healing
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 206, 300, 100, 100, 0.95, 0.2, true, true);

        //attack
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 311, 400, 100, 100, 6.9, 0.1, true, true);

        //damaged
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 711, 700, 100, 100, 0.9, 0.1, true, true);
        
        //immunity detransformation
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech-flipped.png"), 301, 300, 100, 100, 6.9, 0.1, false, true);

        this.deathAnimation1 = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 200, 700, 100, 100, 6, 0.1, false, false);

        this.deathAnimation2 = new Animator(ASSET_MANAGER.getAsset("./Sprites/Boss/GolemMech.png"), 200, 800, 100, 100, 4, 0.1, false, false);

    }

    updateBB() {
        // Create a bounding box that's smaller than the sprite for better collision
        const width = this.bitSizeX * this.scale * 0.3;  // 40% of sprite width
        const height = this.bitSizeY * this.scale * 0.45; // 50% of sprite height
        const offsetX = (this.bitSizeX * this.scale - width) / 2;
        const offsetY = (this.bitSizeY * this.scale - height) / 2 - 15;
    
        this.BB = new BoundingBox(
            this.x + offsetX,
            this.y + offsetY,
            width,
            height
        );
    }

    update() {
        //in case the healing goes above max health
        if (this.currentHealth >= this.maxHealth) { 
            this.currentHealth = this.maxHealth;
        }
        //Get player's center position
        const player = this.game.adventurer;
        if (!player || player.dead) return;

        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to walking state
            }
        }

        if (this.dead) {
            // Handle death animation sequence
            if (!this.deadP2) {
                // Phase 1 of death animation
                this.deathAnimationTimer -= this.game.clockTick;
                
                if (this.deathAnimationTimer <= 0) {
                    // First animation finished, start second animation
                    this.deadP2 = true;
                    this.deathAnimationTimer2 = 3.9 * 0.1; // Reset the second timer
                }
                return; // Return so the enemy stops moving during animation
            } else {
                // Phase 2 of death animation
                this.deathAnimationTimer2 -= this.game.clockTick;
                
                if (this.deathAnimationTimer2 <= 0) {
                    // Remove enemy from world after both animations finish
                    this.removeFromWorld = true;
                }
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

        // Handle transform state
        if (this.state === 2) { //Immunity transformation state
            this.immunityTransformAnimationTimer += this.game.clockTick;
            this.invincible = true; //turned invincible to avoid any conflicts / bugs w/ animation when we hit it. Could remove, but it makes it look better
            if (this.immunityTransformAnimationTimer >= this.immunityTransformAnimationDuration) {
                this.state = 3; // Switch to last frame where we should start healing
                this.immunityTransformAnimationTimer = 0;
                this.invincible = false;
                this.immunity = true;
                return;
            }
            return;
        }
        
        if (this.state === 3) {
            //heal here
            this.healingSound += this.game.clockTick;
            if (this.healingSound > 1) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Healing.wav");
                this.healingSound = 0;
            }
            const healAmount = this.healRate * this.game.clockTick;
            this.currentHealth = Math.min(this.currentHealth + healAmount, this.maxHealth);
            if (distance < 245) {
                this.state = 6;
                this.immunitydeTransformAnimationTimer = 0;
                return;
            }
            return;
        }

        if (this.state === 6 && this.immunity) {
            this.immunitydeTransformAnimationTimer += this.game.clockTick;
            if (this.immunitydeTransformAnimationTimer >= this.immunityTransformAnimationDuration) {
                this.state = 0;
                this.immunitydeTransformAnimationTimer = 0;
                this.immunity = false;
                this.animations[6][this.facing].elapsedTime = 0;
                return;
            }
            return;
        }

        if (distance > 2 && !this.attacking && !this.immunity) {
            const newFacing = dx < 0 ? 1 : 0;
            if (this.facing !== newFacing && this.shootArmTimer > 0) {
                //Store current throw animation time before switching
                this.shootAnimationElapsedTime = this.animations[1][this.facing].elapsedTime;
                //Update facing
                this.facing = newFacing;
                // Set the new direction's animation to the same time
                this.animations[1][this.facing].elapsedTime = this.shootAnimationElapsedTime;
            } else {
                this.facing = newFacing;
            }
        }

        // Handle attack cooldown
        if (this.attackTimer > 0) {
            this.attackTimer -= this.game.clockTick;
        }

        //this is used so mech wont get spammed when its in its damage animation state
        if (player.BB.collide(this.BB) && this.attackTimer <= 0 && !this.attacking) {
            const centerX = this.BB.x + this.BB.width / 2;
            const centerY = this.BB.y + this.BB.height / 2;
            player.takeDamageKnockback(this.damage, this.knockback, centerX, centerY); // Slightly reduced damage
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
                const attackProgress = this.animations[4][this.facing].elapsedTime / this.attackDuration; 
                if (attackProgress >= 0.7 && distance <= this.attackRange) {
                    const centerX = this.BB.x + this.BB.width/2 - 15;
                    const centerY = this.BB.y + this.BB.height/2 - 10;
                    player.takeDamageKnockback(this.damage, this.knockback, centerX, centerY);
                }
            }
            
            if (this.currentAttackTimer <= 0) {
                this.attacking = false;
                this.state = 0; // Return to idle
                this.lockedFacing = null; // Release the facing lock
            }
        }

        // Movement logic 
        //if (!this.BB.collide(player.BB)) {
            // Calculate normalized direction vector
            const dirX = dx / distance;
            const dirY = dy / distance;

            // Move towards player
            this.x += dirX * this.speed * this.game.clockTick;
            this.y += dirY * this.speed * this.game.clockTick;

            // Only update to walking animation if not attacking
            if (!this.attacking) {
                this.state = 0; // Walking animation state
            }
        //}

        if (distance <= this.range && this.shootTimer <= 0 && distance >= 222 && !this.attacking && !this.immunity) { //between distance 222 - 650, it'll shoot
            //Start throwing animation and set flag to shoot after
            this.shootArmTimer = this.shootDuration;
            this.shouldShoot = true; //Should set flag to shoot when animation ends
            this.shootTimer = this.shootCooldown; // Reset cooldown
        }
        

        if (this.attackTimer <= 0 && !this.isPlayingDamageAnimation && this.shootArmTimer <= 0) { 
            if (this.BB.collide(player.BB) && distance > 50) {
                //Player is touching mech
                this.attack1();
            } else if (dy < 100 && distance < 200) {
                //player is above AND more horizontal than vertical - do attack1. dy < 0 checks if player is above mech
                this.attack1();
            }
        }

        // Handle shooting cooldown
        if (this.shootTimer > 0) {
            this.shootTimer -= this.game.clockTick;
        }

        if (this.shootArmTimer > 0 && !this.attacking) {
            this.shootArmTimer -= this.game.clockTick;
            this.state = 1; // Keep in throw state while timer is active
            // Update the stored elapsed time
            this.shootAnimationElapsedTime = this.animations[1][this.facing].elapsedTime;
            if (this.attacking) {
                console.log("bruhz");
            }
            // Check if we're at the end of the throw animation
            if (this.shootArmTimer <= 0.1 && this.shouldShoot && !this.attacking) {
                console.log("testing");
                this.shootArm(); 
                this.shouldShoot = false; //Reset the flag
            }
            this.updateBB();
            return;
        } 
        else {
            // Reset throw animation times when complete
            this.animations[1][0].elapsedTime = 0;
            this.animations[1][1].elapsedTime = 0;
            this.shootAnimationElapsedTime = 0;
           // this.state = 0; // Return to running state when throw is done
        }

        if (this.currentHealth <= (this.maxHealth/2) && !this.immunity && distance > 650) { //if the player goes too far, the robot will stop following believing it's safe to heal
            this.immunityHealing();
        }


        const separationDistance = 200; 
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if ((entity instanceof GolemMech) && entity !== this) {
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
        this.state = 4; // Attack animation state
        this.currentAttackTimer = this.attackDuration;
        this.attackTimer = this.attackCooldown;
        this.lockedFacing = this.facing; // Lock the facing direction
    
        // Reset attack animation
        this.animations[4][this.facing].elapsedTime = 0;
        
        this.shootTimer += 0.8;
        this.animations[1][0].elapsedTime = 0;
        this.animations[1][1].elapsedTime = 0;
    }

    shootArm() {
        const characterCenterX = this.x + (this.bitSizeX * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSizeY * this.scale) / 2;
        const player = this.game.adventurer;
        const dx = (player.x + (player.bitSize * player.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2);
        const dy = (player.y + (player.bitSize * player.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);

        const angle = Math.atan2(dy, dx);



        if (this.currentHealth <= (this.maxHealth * 0.4)) {
            const baseAngle = Math.atan2(dy, dx);
            const spreadAngle = 0.26;
            const angles = [
                baseAngle - spreadAngle,
                baseAngle,
                baseAngle + spreadAngle
            ];
            //Intentional as 3 seems too loud or so
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss2 Arm Launch.mp3");
            angles.forEach(angle => {
                this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.armDamage, this.shootSpeed, 
                    "./Sprites/Boss/arm_projectile.png", this.armKnockback, false, this.armScale, false, this.armLifeTime,
                    0, -10, 100, 100, 3, 0.1, false, true, 200, 200, 32, 32, 100, 100, this, true));
            });
        } else {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss2 Arm Launch.mp3");
            this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.armDamage, this.shootSpeed, 
                "./Sprites/Boss/arm_projectile.png", this.armKnockback, false, this.armScale, false, this.armLifeTime,
                0, -10, 100, 100, 3, 0.1, false, true, 200, 200, 32, 32, 100, 100, this, true));
        }
    }

    immunityHealing() {
        if (this.state === 0) {
            this.state = 2;
            this.immunityTransformAnimationTimer = 0;
            this.animations[2][this.facing].elapsedTime = 0; //reset animation
        }
    }

    takeDamage(damage, knockbackForce, sourceX, sourceY) {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy damage.mp3");
        if (this.immunity) {
            return;
        }
        if (this.dead) {
            return;
        }
        this.currentHealth -= damage;
        
        
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
    
        if (this.currentHealth <= 0) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/boss2 Death.wav");
            this.game.addEntity(new CoinPile(this.game, (this.x + 28), (this.y + 55)));
            this.game.addEntity(new BossExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2)));

            setTimeout(() => {
                // Check if the game still exists before adding the entity
                if (this.game && this.game.addEntity) {
                    this.game.addEntity(new PortalDoor(this.game, (this.BB.x + this.BB.width/2), (this.BB.y + this.BB.height/2)));
                    this.game.camera.bossDead = true;
                }
            }, 5000);
            
            this.dead = true;
            this.state = 5;
        } else {
            this.state = 5;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[5][0].elapsedTime = 0;
            } else {
                this.animations[5][1].elapsedTime = 0;
            }
        }
    }

    draw(ctx) {
        // Draw shadow
        const shadowWidth = 120 * (this.scale / 3);
        const shadowHeight = 32 * (this.scale / 3);
        const shadowX = (this.x + (90 * (this.scale / 3))) - this.game.camera.x;
        const shadowY = (this.y + (220* (this.scale / 3))) - this.game.camera.y;
        
        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);
                
        // Draw mech
        if (this.dead) {
            if (!this.deadP2) {
                // Draw the first death animation
                this.deathAnimation1.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
            } else {
                // Draw the second death animation
                this.deathAnimation2.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
            }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[5][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
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