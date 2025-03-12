class Zombie {
    constructor (game, x, y) {
        Object.assign(this, {game, x, y});

        this.state = 0; //0 = idle, 1 = walking, 2 = attack, 3 = damaged
        this.facing = 0; //0 = right, 1 = left
        this.attackPower = 5;
        this.scale = 2.6;
        this.speed = 73;

        this.health = 20;
        this.maxHealth = 20;
        this.didCrit = false;
        this.attackPower = 10;
        this.attackCooldown = 1.0; // Cooldown in seconds between attacks
        this.attackCooldownTimer = 0; // Tracks remaining cooldown time

        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        this.attackTimer = 1;

        this.healthbar = this.game.addEntity(new HealthBar(this.game, this, -2, 12));

        this.dead = false;
        this.deathAnimationTimer = 7 * 0.15;

        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        this.bitSizeX = 32;
        this.bitSizeY = 32;

        this.isSlowed = false;
        this.slowDuration = 0;
        this.slowTimer = 0;
        this.baseSpeed = this.speed;

        this.currentTarget = null;  // Can be either player or bomb (for monkey bomb upgrade)
        this.targetType = "player"; // "player" or "bomb"
        this.nearestBomb = null;
        
        this.miniBoss = false;

        this.entityOrder = 10;


        this.animations = []; //will be used to store animations

        this.updateBB();
        this.loadAnimation();
    }
    


    updateBB() {
        const width = this.bitSizeX * this.scale * 0.5;  // Adjust scaling factor if needed
        const height = this.bitSizeY * this.scale * 0.8; // Adjust scaling factor if needed
        const offsetX = (this.bitSizeX * this.scale - width) / 2 - 4; // Center adjustment
        const offsetY = (this.bitSizeY * this.scale - height) / 2 + 6; // Adjust Y position if needed
    
        this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
    }

    loadAnimation() {
        for (var i = 0; i < 4; i++) {
            this.animations.push([]);
            for (var j = 0; j < 2; j++) {
                this.animations[i].push([]);
            }
        }


        //LOOKNG RIGHT
        //idle, looking to the right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 0, 32, 32, 7.9, 0.2, false, true);

        //Walking, looking right
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 64, 32, 32, 7.9, 0.09, false, true);

        //Attack, to the right
        this.animations[2][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 0, 32, 32, 32, 7, 0.08, false, true);

        //Damaged, to the right
        this.animations[3][0] =  new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 32, 160, 32, 32, 2, 0.2, false, true); //wanna start at where the zombie turns white or else there'll be a delay

        

        //LOOKING LEFT
        //idle, looking to the left
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 162, 0, 32, 32, 7.9, 0.2, true, true);

        //Walking, looking left
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 166, 64, 32, 31.9, 7.9, 0.09, true, true);

        //Attack, to the left
        this.animations[2][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 193, 32, 32, 32, 7, 0.08, true, true);

        //Damaged, to the left
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie-Flipped.png"), 350, 160, 32, 32, 1, 0.2, true, true);


        this.deadAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Zombie/Zombie.png"), 32, 160, 32, 32, 7, 0.15, false, false);

        this.warning = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/warning.png"), 0, 0, 1024, 1024, 7.9, 0.1, false, true); //used for mini bosses

        this.glowAnim = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/glow.png"), 192, 192, 32, 32, 2.9, 0.1, false, true);
    }



    update() {
        //Handle damage animation time so it isnt infinite. This is when the player hits the zombie
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle state
            }
        }

        if (this.dead) {
            // Handle death animation
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return; //return so the zombie would stop moving when it's dead.
            } else {
                // Remove zombie from world after the animation finishes
                this.removeFromWorld = true;
                return;
            }
        }

        if (this.isSlowed) {
            this.slowTimer += this.game.clockTick;
            if (this.slowTimer >= this.slowDuration) {
                // Reset speed when slow duration expires
                this.speed = this.baseSpeed;
                this.isSlowed = false;
                this.slowTimer = 0;
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

        // Reduce attack cooldown timer
        if (this.attackCooldownTimer > 0) { //this is used for every zombie attack. Makes sure a zombie hits player once every second instead of every tick.
            this.attackCooldownTimer -= this.game.clockTick;
        }

        const player = this.game.adventurer; // Reference to the player character

        //Where on the player or near the player the zombie will be going towards
        //
       // Find nearest bomb
        if (this.game.adventurer.monkeyBomb && !this.miniBoss) { //if the player has the upgrade and this isn't a miniboss zombie
            this.nearestBomb = this.findNearestBomb();
        }
        
        //determine target (bomb or player)
        let targetX, targetY;
        if (this.nearestBomb) { //if it's null, the bomb either doesn't exist at the moment or player doesnt have upgrade
            this.currentTarget = this.nearestBomb;
            this.targetType = "bomb";
            targetX = this.nearestBomb.x + (this.nearestBomb.bitSize * this.nearestBomb.scale)/2;
            targetY = this.nearestBomb.y + (this.nearestBomb.bitSize * this.nearestBomb.scale)/2;
        } else {
            this.currentTarget = this.game.adventurer;
            this.targetType = "player";
            targetX = this.game.adventurer.x + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
            targetY = this.game.adventurer.y + (this.game.adventurer.bitSize * this.game.adventurer.scale)/2;
        }

        //Where on the player or near the player the zombie will be going towards
        const dx = targetX - (this.x + (this.bitSizeX * this.scale)/2);
        const dy = targetY - (this.y + (this.bitSizeY * this.scale)/2);
    
        //Calculate the distance to the player.
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        //if the zombie isnt next to the player, then we should 
        if (distance > 0) {
            // Normalize the direction vector. Which way we're going towards. left, right, bottom right etc.
            const directionX = dx / distance;
            const directionY = dy / distance;
            
    
            //Move the zombie toward the player
            const movement = this.speed * this.game.clockTick; //Adjust speed for frame rate
    
            this.x += directionX * movement;
            this.y += directionY * movement;

            // Update state (walking or idle)
            if (distance > 2) {
                this.state = 1; // Walking
                this.facing = dx < 0 ? 1 : 0; // 1 = left, 0 = right
            } 
        }

        this.previousState = this.state;
    
        // // Check for collision with any attack slashes
        const separationDistance = 100; // Minimum distance between zombies
        const entities = this.game.entities;
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity instanceof Zombie && entity !== this) {
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

            if (entity instanceof Adventurer) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Enemy melee punch.wav");
                        // Attack the player and reset cooldown timer
                        entity.takeDamage(this.attackPower);
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                        console.log("Zombie attacked the player!");
                    }
                    //Set zombie to attacking state
                    this.state = 2; //Attacking state
                }
            }

            if (entity instanceof Bomb && this.game.adventurer.monkeyBomb) {
                if (this.BB.collide(entity.BB) && !entity.invincible) {
                    if (this.attackCooldownTimer <= 0) {
                        // Attack the player and reset cooldown timer
                        this.attackCooldownTimer = this.attackCooldown; // Reset the cooldown timer
                    }
                    //Set zombie to attacking state
                    this.state = 2; //Attacking state
                }
            }


            if (entity instanceof Lightning && entity.lightningOption === 1 && !this.isSlowed) {
                if (entity.circle.BC.collidesWithBox(this.BB)) {
                    this.applySlowEffect(this.game.adventurer.slowCooldown); 
                }
            }
        }

        // Play attack animation and reduce timer
        if (this.state === 2) {
            this.attackTimer -= this.game.clockTick;
            if (this.attackTimer <= 0) {
                this.attackTimer = 1.0; //Reset attack timer
            }
        }
        
        this.updateBB();

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
            // Default knockback direction (e.g., upward) in case the zombie and source overlap
            this.pushbackVector.x = 0;
            this.pushbackVector.y = -knockbackForce;
        }
    
        if (this.health <= 0) {
            let drop = Math.random();
            if(drop < this.game.adventurer.dropChance) {
                this.game.addEntity(new Onecoin(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2), (this.y + (this.bitSizeY * this.scale)/2)));
            }
            if (this.miniBoss) {
                this.game.addEntity(new Chest(this.game, (this.x + (this.bitSizeX * this.scale)/2) - 125, (this.y + (this.bitSizeY * this.scale)/2) - 125));
                this.game.addEntity(new ExperienceOrb(this.game, (this.x + (this.bitSizeX * this.scale)/2) + 15, (this.y + (this.bitSizeY * this.scale)/2)));
            }
            this.dead = true;
            this.state = 3;
        } else {
            this.state = 3;
            this.isPlayingDamageAnimation = true;
            this.damageAnimationTimer = this.damageAnimationDuration;
            if (this.facing === 0) {
                this.animations[3][0].elapsedTime = 0;
            } else {
                this.animations[3][1].elapsedTime = 0;
            }
        }
    }

    findNearestBomb() {
        let nearestBomb = null;
        let shortestDistance = this.game.adventurer.detectionRadius;

        const entities = this.game.entities;
        for (let entity of entities) {
            if (entity instanceof Bomb) {
                const dx = (entity.x + (entity.bitSize * entity.scale)/2) - (this.x + (this.bitSizeX * this.scale)/2);
                const dy = (entity.y + (entity.bitSize * entity.scale)/2) - (this.y + (this.bitSizeY * this.scale)/2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestBomb = entity;
                }
            }
        }

        return nearestBomb;
    }

    applySlowEffect(duration) {
        this.isSlowed = true;
        this.slowDuration = duration;
        this.slowTimer = 0;
        this.speed /= 2; // Reduce speed by half
    }

    drawMinimap(ctx, mmX, mmY) {
        ctx.fillStyle = "Red";
        ctx.fillRect(mmX + this.x / 32, mmY + this.y / 32, 3, 3);
    };

    draw(ctx) {
        // Calculate shadow dimensions based on zombie scale
        const shadowWidth = 40 * (this.scale / 2.6); // 2.6 is default scale
        const shadowHeight = 16 * (this.scale / 2.6);

        const shadowX = (this.x + (18 * (this.scale / 2.6))) - this.game.camera.x;
        const shadowY = (this.y + (77 * (this.scale / 2.6))) - this.game.camera.y;
        if (this.miniBoss) {
             this.warning.drawFrame(this.game.clockTick, ctx, shadowX, shadowY - (38 * this.scale), 0.05);
            // this.glowAnim.drawFrame(this.game.clockTick, ctx, shadowX, shadowY - (38 * this.scale), this.scale);

        }

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        if (this.dead) {
            // Only draw shadow if death animation is still playing
           if (this.deathAnimationTimer > 0) {
                this.deadAnimation.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
           }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[3][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        }
        //used to indicate the path/direction the ghoul is going towards. (line 131 and 132);
        // ctx.strokeStyle = 'Green';

        // ctx.strokeRect(this.BB.x + 15- this.game.camera.x, this.BB.y- this.game.camera.y, 20, 20);

        // const player = this.game.adventurer;
        // ctx.strokeRect(player.BB.x + 6 - this.game.camera.x, player.BB.y- this.game.camera.y, 20, 20);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Yellow';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }

    }
    
}