class Adventurer { //every entity should have update and draw!
    constructor(game, x, y) { //game will be the game engine!
        Object.assign(this, {game, x, y});
        this.game.adventurer = this;
        this.scale = 2.8;
        this.bitSize = 32; //32 x 32
        

        const offSet = (this.bitSize * this.scale)/2; //because of the size (2.8) of our sprite animation, we wanna go up to the scale.
        this.x = this.x - offSet; 
        this.y = this.y - offSet;
        
        this.speed = 200; //how fast the player moves


        this.state = 0; //0 = idle, 1 = walking, 2 = run, 3 = jumping, 4 = attack1, 5 = attack2, 6 = attack3, 7 = roll, 8 = ladder, 9 = bow, 10 = damaged, 11 = magic
        this.facing = 0; //0 = right, 1 = left, 2 = up, 3 = down
        this.dead = false;
        this.deathAnimationTimer = 8 * 0.12;


        this.climbingLadder = false;
        //this.attack
        this.invincible = false;
        this.velocity = {x: 0, y: 0};
        this.lastMove = 0;
        this.health = 100; //default max health of the player
        this.maxhealth = 100;

        //player getting damaged
        this.damageAnimationTimer = 0;
        this.damageAnimationDuration = 0.2; // Duration of damage animation
        this.isPlayingDamageAnimation = false;
        

        this.currentWeapon = 0; //sword = 0, bow = 1
        this.slashType = null;

        this.timeToIdle = 3; //havent implemented but if player stands still for 3 seconds, we could do the idle animation each time

        //ROLLING PROPERTIES
        this.rolling = false; //default value because we're not rolling right now
        this.rollDuration = 0.45; // seconds
        this.rollTimer = 0;
        this.rollCooldown = 2; //after a roll, there'll be a cooldown (in seconds)
        this.rollCooldownTimer = 0;
        this.rollSpeed = 420; //faster than normal speed
        this.canRoll = true; //default value where users can roll right away


        //ATTACK PROPERTIES
        this.attacking = false;
        this.attackDuration = 0.56;  // Duration of attack animation
        this.attackTimer = 0;
        this.canAttack = true;
        this.attackCooldown = 1.1;   //Time between attacks.
        this.attackCooldownTimer = 0;
        this.slashType = 0; //0 = default right slash animation, 1 = up animation
        this.slashDistance = 27; //Distance from character center to slash
        this.slashScale = 2.3; //we could upgrade slash scale, and increase the range of our sword
        this.swordUpgrade = 0; //maybe use for upgrading sword later? If we upgrade a sword, we could change colors?
        this.knockback = 2000; // Base force of knockback
        this.attackDamage = 5; 
        this.parry = false;


        //PROJECTILE PROPERTIES
        this.shooting = false;
        this.shootingDuration = 0.3; //for animation
        this.shootingTimer = 0;
        this.canShoot = true;
        this.shootCooldown = 0.8;
        this.shootCooldownTimer = 0;
        this.bowKnockback = 0;
        this.bowDamage = 4;
        this.arrowSpeed = 800;
        this.bowUpgrade = 0; 
        this.piercing = false; //piercing could be for shooting through enemies. Collateral. Could be an upgrade
        this.tripleShot = false; //shotgun like pattern when shooting bow. Look in bowShoot() method if you want to take a closer look or change anything

        //MAGIC AOE PROPERTIES
        this.magicking = false;
        this.magicDuration = 6 * 0.1; //for animation
        this.canMagic = true;
        this.magicCooldown = 15; //long cool down
        this.magicCooldownTimer = 0;
        this.magicKnockback = 2000;
        this.magicDamage = 33;
        this.magicScale = 6;
        this.enableMagic = false; //changed to true for now for debugging


        //BOMB PROPERTIES
        this.enableBomb = false; //changed to true for now for debugging
        this.enableRollingBomb = false; //Rolling spawns a bomb
        this.bombDamage = 25;
        this.bombExplosionScale = 10;
        this.bombTimer = 4;
        this.bombKnockback = 2000;
        this.canBomb = true;
        this.bombCooldown = 0.5; //how often we could our bomb down.
        this.bombCooldownTimer = 0;
        this.bombMaxAmount = 5;
        this.bombCurrentAmnt = 5;
        this.bombCooldownRetrieve = 5; //will be the cooldown for when will get another bomb back in their inventory.
        this.bombCooldownRetrieveTimer = 0; //the timer that will time that retrieve cooldown above.
        this.monkeyBomb = false; //monkey bomb upgrade
        this.detectionRadius = 110;


        //LIGHTNING PROPERTIES:
        this.enableLightning = false;
        this.lightningMagic = false; 
        this.lightingDamage = 10;
        this.lightningScale = 5;
        this.lightningKnockback = 1000;
        this.canLightning = true;
        this.lightningCooldown = 2; //how much time between each lightning strike we can do
        this.lightningCooldownTimer = 0;

        //DARK-BOLT PROPERTIES:
        this.enableBolt = false;
        this.canBolt = true; 
        this.boltMagic = false; //if we currently are doing dark bolt magic
        this.boltDamage = 7;
        this.boltCooldown = 0.4; //how much time between each bolt strike we can do
        this.boltCooldownTimer = 0;
        this.boltMaxAmount = 6;
        this.boltCurrentAmount = 6;
        this.boltCooldownRetrieve = 10; //will be the cooldown for when will get another bolt back in their inventory.
        this.boltCooldownRetrieveTimer = 0; //the timer that will time that retrieve cooldown above.
        this.boltScale = 3;
        this.slowCooldown = 7;

        this.lightningOption = 0; //0 = normal lightning, 1 = Dark-Bolt lightning

        //POTION PROPERTIES:
        this.enablePotion = true;
        this.canPotion = true;
        this.potion = 3;
        this.potionMaxAmount = 99;
        this.potionCooldown = 0.5;
        this.potionCooldownTimer = 0;
        this.potionHealingAmount = this.maxhealth * 0.2;

        //UPGRADE COMBO CONTROL VARIABLE:
        this.slashArrowCombo = false; //combo where player can hit arrow with their sword to make arrow go faster + do 2x more damage
        this.slashBombCombo = false; //combo where player can hit the bomb with their sword towards enemies
        this.lightningDarkBoltCombo = false; //combo where player can hit dark bolt with lightning to cause wider explosion + more damage

        this.critChance = 0.05; //5%
        this.critDamage = 1.5; //150%
        this.coins = 0;
        this.level = 1;
        this.experience = 0;
        this.experienceToNextLvl = 10;
        this.upgrade = null;
        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");  //Just a shadow we'll put under the player 

        //respawn
        this.respawnAnimationTimer = 8 * 0.12;
        this.respawning = false;
        this.respawningUlt = false;
        this.respawningDamage = 40;
        this.respawningKnockback = 5000;
        this.respawningScale = 6;

        this.dropChance = 0.43; //0.41 chance of dropping something for the player
        this.expMultiplier = 1;
        this.coinMultiplier = 1;
        this.pushbackVector = { x: 0, y: 0 };
        this.pushbackDecay = 0.9; // Determines how quickly the pushback force decays

        this.entityOrder = 98;

        this.elapsedTime = 0;
        this.updateBB(); //put the boundary on player right away

        //adventure animations (storing)
        this.animations = []; //will be used to store animations
        this.loadAnimation();
    };

    updateBB() {
        // this.lastBB = this.BB; //we gotta know where we were before changing the scene
        // if (this.state != 4 || this.state != 5 || this.state != 6) {
        //     this.BB = new BoundingBox(this.x + 33, this.y + 24, 32 , 32 + 27);
        // } 
       // this.BB = new BoundingBox(this.x, this.y, 32, 32);

       const width = this.bitSize * this.scale * 0.3;  // Adjust scaling factor if needed
       const height = this.bitSize * this.scale * 0.6; // Adjust scaling factor if needed
       const offsetX = (this.bitSize * this.scale - width) / 2 + 4; // Center adjustment
       const offsetY = (this.bitSize * this.scale - height) / 2 + 10; // Adjust Y position if needed
   
       this.BB = new BoundingBox(this.x + offsetX, this.y + offsetY, width, height);
    }

    //helper functions
    loadAnimation() {
        for (var i = 0; i < 13; i++) {
            this.animations.push([]);
            for (var j = 0; j < 4; j++) {
                this.animations[i].push([]);
            }
        }

        //idle right
        this.animations[0][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 0, 32, 32, 13, 0.2, false, true);


        //idle left 
        this.animations[0][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 256, 32, 32, 13, 0.2, false, true); 
        //idle up
        this.animations[0][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingUp.png"), 96, 0, 32, 32, 0.9, 0.12, false, true);

        //idle down
        this.animations[0][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingDown.png"), 93, 0, 32, 32, 0.9, 0.12, false, true);

        //walking right 
        this.animations[1][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 32, 32, 32, 7.9, 0.08, false, true);

        //walking left 
        this.animations[1][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 288, 32, 32, 8, 0.08, false, true); 

        //walking up 
        this.animations[1][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingUp.png"), 0, -1.5, 32, 32, 7.9, 0.08, false, true);

        //walking down
        this.animations[1][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/WalkingDown.png"), -3, -2, 32, 32, 7.9, 0.08, false, true);

        //jump right/up
        this.animations[3][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 160, 32, 32, 5.9, 0.08, false, true);

        //jump left/maybe down
        this.animations[3][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 416, 32, 32, 5.9, 0.08, false, true);

        //attack1 right/down
        this.animations[4][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 64, 32, 32, 10, 0.056, false, true);

        //attack1 left
        this.animations[4][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 320, 32, 32, 10, 0.056, false, true);

        //attack up
        this.animations[4][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AttackUp.png"), -3, 2, 32, 32, 10, 0.056, false, true);

        //attack2 right
        this.animations[5][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 2, 96, 32, 32, 10, 0.056, false, true);

        //attack2 left
        this.animations[5][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 352, 32, 32, 10, 0.056, false, true);

        //attack3 right/down
        this.animations[6][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 3.1, 128, 32, 32, 10, 0.056, false, true);

        //attack 3 left/down
        this.animations[6][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 384, 32, 32, 10, 0.056, false, true);

        //roll right/up
        this.animations[7][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), -2, 384, 32, 32, 5, 0.075, false, true);

        //roll left/down
        this.animations[7][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 256, 384, 32, 32, 5, 0.075, true, true); //maybe take a look at this

        //climbing up ladder
        this.animations[8][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, false, true);
        
        //climbing down ladder
        this.animations[8][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 256, 32, 32, 3.9, 0.15, true, true);

        //bow right
        this.animations[9][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 160, 288, 32, 32, 3, 0.1, false, true);

        //bow left
        this.animations[9][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/BowLeft.png"), 0, -8, 32, 32, 3, 0.1, true, true);


        //damaged to the right/up
        this.animations[10][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, true);

        //damaged to the left/down
        this.animations[10][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 449, 32, 32, 3, 0.12, false, true);

        //damaged to when hit looking up (honestly didnt need up and down)
        this.animations[10][2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, true);

        //damaged when hit looking down
        this.animations[10][3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 32, 192, 32, 32, 3, 0.12, false, true);

        //magic animation, right
        this.animations[11][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 320, 32, 32, 6, 0.1, true, true);

        this.animations[11][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 320, 32, 32, 6, 0.1, false, true);

        //magic animations, but hands up. Will be used for lightning
        this.animations[12][0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 320, 32, 32, 6, 0.1, false, true);

        this.animations[12][1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 320, 32, 32, 6, 0.1, true, true);

        //death animation
        this.deadAnim = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 448, 32, 32, 8, 0.12, false, false); 

        this.respawnAnim = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2.png"), 0, 448, 32, 32, 8, 0.12, true, false); 

    };

    updateFacing(velocityDirection) {
        //this is to make sure our attack animation doesnt get countered or canceled by the movement animation right away when we start attacking.
        if (!this.attacking && !this.shooting && !this.magicking && !this.lightningMagic && !this.boltMagic) {
            if (velocityDirection.x > 0) this.facing = 0, this.state = 1; //If we're moving in the positive x direction, we're going to the right. Change animation to walk right
            if (velocityDirection.x < 0) this.facing = 1, this.state = 1; 
            if (velocityDirection.y < 0) this.facing = 2, this.state = 1;
            if (velocityDirection.y > 0) this.facing = 3, this.state = 1;
        
            if (velocityDirection.x == 0 && velocityDirection.y == 0) { //used to remember our last move before returning back to idle animation
                switch (this.lastMove) {
                    case 0: this.facing = 0; break; 
                    case 1: this.facing = 1; break;
                    case 2: this.facing = 2; break;
                    case 3: this.facing = 3; break;
                }
                this.state = 0;
            }
            
            if (velocityDirection.x > 0 && velocityDirection.y > 0) this.facing = 0, this.state = 1; //going to bottom right corner, keep right animation
            if (velocityDirection.x < 0 && velocityDirection.y < 0) this.facing = 1, this.state = 1; //going to top left corner, keep left animation
            if (velocityDirection.x > 0 && velocityDirection.y < 0) this.facing = 0, this.state = 1; //going to top right corner, keep right animation
            if (velocityDirection.x < 0 && velocityDirection.y > 0) this.facing = 1, this.state = 1; //going to bottom left corner, keep left animation
        }
    }


    update() {
        // if (this.dead) return;
        // console.log(this.game.leftClick);
        if (this.dead) {
            // Handle death animation
            this.deathAnimationTimer -= this.game.clockTick;
    
            if (this.deathAnimationTimer > 0) {
                // Keep playing the death animation
                return;
            } else {
                this.deathAnimationTimer = 8 * 0.12; //reset the death animation
                this.game.toggleDeathPause();
                this.game.camera.triggerDeathScreen(); // Notify SceneManager to show death screen
                this.deathPosition = { x: this.x, y: this.y }; // Store death position
                this.deadAnim.elapsedTime = 0;
               // this.removeFromWorld = true;
                return;
            }
        }

        if (this.respawning) {
            // Handle respawn animation
            this.respawnAnimationTimer -= this.game.clockTick;
    
            if (this.respawnAnimationTimer > 0) {
                // Keep playing the respawn animation
                return;
            } else {
                this.respawningUlt = true;
                this.magicAOE();
                this.respawnAnimationTimer = 8 * 0.12; //reset animation
                this.respawnAnim.elapsedTime = 0;
                this.respawning = false;
                this.state = 0;
                return;
            }
        }

        //Handle damage animation time so it isnt infinite. This is when player gets damaged
        if (this.isPlayingDamageAnimation) {
            this.damageAnimationTimer -= this.game.clockTick;
            if (this.damageAnimationTimer <= 0) {
                this.invincible = false; //at the end of the player getting damaged animation we'll turn i-frames off
                this.isPlayingDamageAnimation = false; //should turn off when damage animation is over
                this.state = 0; // Return to idle state
            }
        }

        //this is used as the cooldown for rolling
        if (!this.canRoll) {
            this.rollCooldownTimer -= this.game.clockTick;
            if (this.rollCooldownTimer <= 0) {
                this.canRoll = true;
            }
        }
        
        //Handle roll input (using Shift key)
        //We can roll when we're not already rolling, when we can roll (no cooldown atm) and we're not in an attacking animation
        if (this.game.keys["shift"] && !this.rolling && this.canRoll && !this.attacking) {
            this.invincible = true; //when we start rolling, we'll turn invincible into true (player won't get hurt)
            this.performRolling();
            this.game.keys["shift"] = false; 
        }

        //Handle rolling state
        if (this.rolling) { //when we're rolling, we want to calculate how long we roll.
            this.rollTimer -= this.game.clockTick;          
            // End roll when timer expires
            if (this.rollTimer <= 0) {
                this.rolling = false;
                this.invincible = false; //once we're done with our roll, i-frames will be turned off
                this.velocity.x = 0;
                this.velocity.y = 0;
                this.state = 0; // Return to idle state
            }
            this.game.leftClick = false;
        }



        //If we're not rolling, we can move properly
        if (!this.rolling) {
            if (this.game.keys["w"] && !this.game.keys["s"]) {
                this.velocity.y = -this.speed;
                this.lastMove = 2;
            } else if (this.game.keys["s"] && !this.game.keys["w"]) {
                this.velocity.y = this.speed;
                this.lastMove = 3;
            } else {
                this.velocity.y = 0;
            }
            
            if (this.game.keys["a"] && !this.game.keys["d"]) {
                this.velocity.x = -this.speed;
                this.lastMove = 1;
            } else if (this.game.keys["d"] && !this.game.keys["a"]) {
                this.velocity.x = this.speed;
                this.lastMove = 0;
            } else {
                this.velocity.x = 0;
            }
            this.updateFacing(this.velocity);
        }

        if (!this.dead) {
            // Apply knockback effect

            this.x += this.pushbackVector.x * this.game.clockTick;
            this.y += this.pushbackVector.y * this.game.clockTick;

            // Decay the pushback vector
            this.pushbackVector.x *= this.pushbackDecay;
            this.pushbackVector.y *= this.pushbackDecay;

        }

        //COOLDOWN TRACKING SECTION --------------------------------
        //this is used as the cool down for each attack
        if (!this.canAttack) {
            this.attackCooldownTimer -= this.game.clockTick;
            if (this.attackCooldownTimer <= 0) {
                this.canAttack = true;
            }
        }

        //Track bow cooldown
        if (!this.canShoot) {
            this.shootCooldownTimer -= this.game.clockTick;
            if (this.shootCooldownTimer <= 0) { //once cooldown ends
                this.canShoot = true; //we can now shoot again
            }
        }

        //Track magic AOE cooldown
        if (!this.canMagic) {
            this.magicCooldownTimer -= this.game.clockTick;
            if (this.magicCooldownTimer <= 0) { //once cooldown ends
                this.canMagic = true; //we can now do magic again!
            }
        }

       //Track bomb cooldown
        if (!this.canBomb) {
            this.bombCooldownTimer -= this.game.clockTick;
            if (this.bombCooldownTimer <= 0) { //once cooldown ends
                this.canBomb = true; //we can now put bomb down again
            }
        }

        //Track bomb amount cooldown
        if (this.bombCurrentAmnt < this.bombMaxAmount) {
            this.bombCooldownRetrieveTimer -= this.game.clockTick; 
            if (this.bombCooldownRetrieveTimer <= 0) {
                console.log("should be added once");
                this.bombCooldownRetrieveTimer = this.bombCooldownRetrieve;

                this.bombCurrentAmnt++;
            }
        }

        if (!this.canLightning) {
            this.lightningCooldownTimer -= this.game.clockTick;
            if (this.lightningCooldownTimer <= 0) {
                this.canLightning = true;
            }
            this.game.rightClicks = false;
        }

        if (!this.canBolt) {
            this.boltCooldownTimer -= this.game.clockTick;
            if (this.boltCooldownTimer <= 0) { //once cooldown ends
                this.canBolt = true; //we can now put bomb down again
            }
        }

        if (this.boltCurrentAmount < this.boltMaxAmount) {
            this.boltCooldownRetrieveTimer -= this.game.clockTick; 
            if (this.boltCooldownRetrieveTimer <= 0) {
                console.log("should be added once");
                this.boltCooldownRetrieveTimer = this.boltCooldownRetrieve;
                this.boltCurrentAmount++;
            }
        }
        if (!this.canPotion) {
            this.potionCooldownTimer -= this.game.clockTick;
            if (this.potionCooldownTimer <= 0) { //once cooldown ends
                this.canPotion = true; //we can now put bomb down again
            }
        }
        //-------------------------------------------------------------

        if (this.game.keys["1"]) {
            this.currentWeapon = 0;
            // this.speed = 330;
        } else if (this.game.keys["2"]) {
            this.currentWeapon = 1;
        }


        // Handle sword attacks - only affected by sword cooldown
        if (this.currentWeapon == 0 && this.game.leftClick) {
            if (!this.attacking && this.canAttack && !this.rolling) {
                console.log("we clicked left click!");
                this.attack();
            }
            this.game.leftClick = false;
        }
        
        // Handle bow attacks - only affected by bow cooldown
        if (this.currentWeapon == 1 && this.game.leftClick) {
            if (!this.shooting && this.canShoot && !this.rolling) { //&& !this.attacking) { 
                this.bowShoot();
            }
            this.game.leftClick = false;
        }

        //Ultimate control
        if (this.game.rightClicks && this.canMagic && !this.rolling && this.enableMagic && this.currentWeapon == 0) { //&& !this.shooting && !this.attacking if we dont want player to use magic during attack animation
            console.log("we clicked right click!")
            this.invincible = true;
            this.magicAOE();
        } 
        //bomb controls
        if (this.game.keys["e"] && this.canBomb && !this.rolling && this.bombCurrentAmnt > 0 && this.enableBomb) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Bomb Placing.wav");
            this.game.keys["e"] = false;
            this.bombCurrentAmnt--;
            const characterCenterX = this.x + (this.bitSize * this.scale) / 2; 
            const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
            this.bombCooldownTimer = this.bombCooldown;
            if (this.bombCooldownRetrieveTimer <= 0) {
                this.bombCooldownRetrieveTimer = this.bombCooldownRetrieve;
            }
            this.canBomb = false;
            this.game.addEntity(new Bomb(this.game, characterCenterX - 50, characterCenterY -32, this.bombTimer, this.bombDamage, this.bombExplosionScale));
        }
        
        //lightning control
        if (this.game.rightClicks && this.canLightning && !this.rolling && !this.shooting && !this.attacking && this.currentWeapon == 1 && this.enableLightning) {
            this.lightningCooldownTimer = this.lightningCooldown;
            this.lightningOption = 0;
            this.lightning();
            this.game.rightClicks = false;
        } else {
            this.game.rightClicks = false;
        }
        
        //dark-bolt control
        if (this.game.keys["f"] && this.canBolt && !this.rolling && this.boltCurrentAmount > 0 && this.enableBolt) {
            this.boltCurrentAmount--;
            this.lightningOption = 1;
            if (this.boltCooldownRetrieveTimer <= 0) {
                this.boltCooldownRetrieveTimer = this.boltCooldownRetrieve;
            }
            this.darkBolt();            
        }
        if (this.game.keys["x"] && this.canPotion && this.potion > 0 && this.health < this.maxhealth && this.enablePotion) {
            this.potion--;
            this.usePotion();          
        }

        //ANIMATION TIMING -------------------------------------------------------------------
        if (this.attacking) { //when we're in our attacking animation, we wanna time it.
            this.attackTimer -= this.game.clockTick;
            //End attack when timer expires
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.state = 0;  // Return to idle state
                
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }

        if (this.shooting) { //when we're in our bow shooting animation, we wanna time it.
            this.shootingTimer -= this.game.clockTick;
            //End shooting when timer expires
            if (this.shootingTimer <= 0) {
                this.shooting = false;
                this.state = 0;  // Return to idle state
                
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }

        if (this.magicking || this.lightningMagic || this.boltMagic) { //when we're in our magic animation, we wanna time it. All these 3 have the same animation
            this.magicTimer -= this.game.clockTick;
            if (this.magicTimer <= 0) {
                this.magicking = false;
                this.lightningMagic = false;
                this.boltMagic = false;
                this.state = 0;  // Return to idle state
                this.invincible = false;
                // Reset idle animation
                this.animations[0][this.facing].elapsedTime = 0;
            }
        }
        //-----------------------------------------------------------------------------------------------

        //for ladders maybe do, if the bounding boxes are touching or near each other and the user clicks on e?

        
        //maybe there are pits players can fall into? We could have small collision boxes for those void tiles. If touched the player could die? 


        
        // Always update position based on velocity
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
        this.updateBB();


        //checking for collision
        //Collision detection with objects
        this.game.entities.forEach(entity => {
            if ((entity instanceof Barrel || entity instanceof Crate || entity instanceof Pot) 
                && this.BB.collide(entity.BB)) {
                // Resolve collision by adjusting adventurer's position
                const overlap = this.BB.overlap(entity.BB);
                if (overlap.x > 0 && overlap.y > 0) {
                    if (overlap.x < overlap.y) {
                        //Horizontal collision
                        if (this.BB.left < entity.BB.left) {
                            this.x -= overlap.x; //Push back to the left
                        } else {
                            this.x += overlap.x; //Push forward to the right
                        }
                    } else {
                        //Vertical collision
                        if (this.BB.top < entity.BB.top) {
                            this.y -= overlap.y; //Push back upward
                        } else {
                            this.y += overlap.y; //Push forward downward
                        }
                    }
                    this.updateBB(); //Update bounding box after position adjustment
                }
            }
            
            //coin section
            if ((entity instanceof Onecoin) && this.BB.collide(entity.BB)) {
                //Math.floor(Math.random() * (max - min + 1)) + min;
                const coinAmnt = Math.floor(Math.random() * 2) + 1; //1 - 2 when picking up a coin that looks like just 1
                this.coins += Math.round(coinAmnt * this.coinMultiplier);
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/coinCollecting.wav");
                entity.removeFromWorld = true;
            } else if ((entity instanceof Threecoin) && this.BB.collide(entity.BB)) {
                const coinAmnt = Math.floor(Math.random() * (5 - 3 + 1)) + 3; //3 - 5 when picking up a coin that looks like 3 coins
                this.coins += Math.round(coinAmnt * this.coinMultiplier);
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/coinCollecting.wav");
                entity.removeFromWorld = true;
            } else if ((entity instanceof MultipleCoins) && this.BB.collide(entity.BB)) {
                const coinAmnt = Math.floor(Math.random() * (50 - 20 + 1)) + 20; //20 - 50 when picking up mulitple coins
                this.coins += Math.round(coinAmnt * this.coinMultiplier);
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/coinCollecting.wav");
                entity.removeFromWorld = true;
            } else if ((entity instanceof CoinPile) && this.BB.collide(entity.BB)) {
                const coinAmnt = Math.floor(Math.random() * (120 - 51 + 1)) + 51; //51 - 120 when picking up mulitple coins
                this.coins += Math.round(coinAmnt * this.coinMultiplier);
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/coinCollecting.wav");
                entity.removeFromWorld = true;
            } 

            if ((entity instanceof Chest) && this.BB.collide(entity.BB)) {
                //open screen.
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Chest open.wav");
                this.game.camera.enableChest = true;
                entity.removeFromWorld = true;
            } 
        });

        if (this.attackCooldown < this.attackDuration) {
            this.attackDuration = this.attackCooldown;
        }

        if (this.shootCooldown < this.shootingDuration) {
            this.shootingDuration = this.shootCooldown;
        }
        this.elapsedTime += this.game.clockTick;

        if(PARAMS.CHEATS) {
            this.enableBolt = true;
            this.enableBomb = true;
            this.enableLightning = true;
            this.enableMagic = true;
            this.enablePotion = true;
            // this.monkeyBomb = true;
            // this.attackDamage = 10;
            // this.slashArrowCombo = true;
            // this.slashBombCombo = true;
            // this.lightningDarkBoltCombo = true;
            // this.game.upgrade.unlockAllWeapons();
            if (this.game.settings.enableUpgrades) this.game.upgrade.giveAllUpgrade();
        }
        if (this.game.settings.enableInvincibility) this.invincible = true;
    };

    performRolling() {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Dodge.wav");
        this.rolling = true;
        this.canRoll = false;
        this.rollCooldownTimer = this.rollCooldown;
        this.state = 7; // Set state to rolling
        this.rollTimer = this.rollDuration;

        //Reset roll animations when starting a new roll
        this.animations[7][0].elapsedTime = 0;  //Reset right roll frame
        this.animations[7][1].elapsedTime = 0;  //Reset left roll frame

        
        // Calculate diagonal roll speed (normalize for consistent speed)
        const diagonalSpeed = this.rollSpeed / Math.sqrt(2);
        
        //Checking for diagonal movement
        const rollingRight = this.game.keys["d"] && !this.game.keys["a"];
        const rollingLeft = this.game.keys["a"] && !this.game.keys["d"];
        const rollingUp = this.game.keys["w"] && !this.game.keys["s"];
        const rollingDown = this.game.keys["s"] && !this.game.keys["w"];

        // Set roll velocity based on key combinations
        if (rollingRight && rollingUp) { //if player presses d and w and rolls
            // Rolling top-right
            this.velocity.x += diagonalSpeed;
            this.velocity.y -= diagonalSpeed;
            this.facing = 0; //Use right-facing animation
        } else if (rollingLeft && rollingUp) { //if player presses w and a and rolls
            // Rolling top-left
            this.velocity.x -= diagonalSpeed;
            this.velocity.y += -diagonalSpeed;
            this.facing = 1; //Use left-facing animation
        } else if (rollingRight && rollingDown) { //if player presses s and d and rolls
            //Rolling bottom-right
            this.velocity.x += diagonalSpeed;
            this.velocity.y += diagonalSpeed;
            this.facing = 0; //Use right-facing animation
        } else if (rollingLeft && rollingDown) { //if player presses a and s and rolls
            //Rolling bottom-left
            this.velocity.x -= diagonalSpeed;
            this.velocity.y += diagonalSpeed;
            this.facing = 1; // Use left-facing animation
        } else {
            //Handle single direction rolls
           // switch (this.facing) {
                if (rollingRight) { //right
                    this.velocity.x += this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 0;
                } else if (rollingLeft) { //left
                    this.velocity.x -= this.rollSpeed;
                    this.velocity.y = 0;
                    this.facing = 1;
                } else if (rollingUp) { //up
                    this.velocity.y -= this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 0;
                } else { //down. Also default value when player isnt moving and presses roll button
                    this.velocity.y += this.rollSpeed;
                    this.velocity.x = 0;
                    this.facing = 1;
                }
        }
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2; 
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        if (this.enableRollingBomb) this.game.addEntity(new Bomb(this.game, characterCenterX - 50, characterCenterY -32, this.bombTimer, this.bombDamage, this.bombExplosionScale));
            
    }
    


    attack() {
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Audio_Music_Slash.mp3");
        this.attacking = true; 
        this.canAttack = false;
        this.attackCooldownTimer = this.attackCooldown;
        this.attackTimer = this.attackDuration;
        
        //Get mouse position relative to character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2; 
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        
        //Get mouse position in world coordinates
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;
        
        //Calculate angle between character and mouse
        const dx = mouseX - characterCenterX;
        const dy = mouseY - characterCenterY;
        const angle = Math.atan2(dy, dx); //radians
        
        //Convert angle to degrees for easier checks
        const degrees = angle * (180 / Math.PI);
        var slashDirection = null;
        
        // Determine attack type and direction based on angle
        if (degrees >= -110 && degrees < -70) {
            //Pure up attack zone
            this.state = 4; //attack 1 (stored as attack 1 in animations)
            this.facing = 2; //have the player look up when we're attacking up
            slashDirection = 1;
        } else if (degrees >= -160 && degrees < -110) {
            //Upper left quadrant (1st quadrant) - Attack 2
            this.state = 5; //attack 2
            this.facing = 1; //have the player look left when it's upper left
            slashDirection = 3;
        } else if (degrees >= -70 && degrees < -20) {
            //Upper right quadrant - Attack 2
            this.state = 5; //attack 2
            this.facing = 0; //have the player look right when its in upper right
            slashDirection = 1;
        } else if (degrees >= 45 && degrees < 135) {
            //Lower quadrant - Attack 3
            this.state = 6; //attack 3
            this.facing = dx > 0 ? 0 : 1; //lower quadrant to the right or left
            slashDirection = dx > 0 ? 3 : 1; //if degrees is greater than 0, we're facing rigth. So do correct slash move.
        } else {
            //Horizontal quadrants - Attack 1
            this.state = 4;
            this.facing = dx > 0 ? 0 : 1; //to the sides of the character. Swing right or left with attack 1
            slashDirection = dx > 0 ? 3 : 1;
        }

        // Calculate slash position
        const slashX = this.x + Math.cos(angle) * this.slashDistance; //where the slash should be
        const slashY = this.y + Math.sin(angle) * this.slashDistance;

        if (this.swordUpgrade == 0) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/red-slash.png", 
                "./Sprites/Slash/red-slash-flipped.png", this.slashScale, angle, slashDirection, 
                this.attackDamage, this.knockback, this, true));
        } else if (this.swordUpgrade == 1) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/blue2-slash.png", 
                "./Sprites/Slash/blue2-slash-flipped.png", this.slashScale, angle, slashDirection, 
                this.attackDamage, this.knockback, this, true));
        } else if (this.swordUpgrade == 2) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/yellow-slash.png", 
                "./Sprites/Slash/yellow-slash-flipped.png", this.slashScale, angle, 
                slashDirection, this.attackDamage, this.knockback, this, true));
        } else if (this.swordUpgrade == 3) {
            this.game.addEntity(new AttackSlash(this.game, slashX, slashY, "./Sprites/Slash/blue-slash.png", 
                "./Sprites/Slash/blue-slash-flipped.png", this.slashScale, angle, 
                slashDirection, this.attackDamage, this.knockback, this, true));
        }

        //Reset all possible attack animations
        this.animations[4][0].elapsedTime = 0; //Attack 1 right
        this.animations[4][1].elapsedTime = 0; //Attack 1 left
        this.animations[4][2].elapsedTime = 0; //Attack up
        this.animations[5][0].elapsedTime = 0; //Attack 2 right
        this.animations[5][1].elapsedTime = 0; //Attack 2 left
        this.animations[6][0].elapsedTime = 0; //Attack 3 right
        this.animations[6][1].elapsedTime = 0; //Attack 3 left
    }

    bowShoot() {
        // Prevent shooting too frequently
        this.shooting = true; 
        this.canShoot = false;
        this.shootCooldownTimer = this.shootCooldown;
        this.shootingTimer = this.shootingDuration;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Arrows.mp3");


        // Get mouse position in world coordinates
        const mouseX = this.game.mouse.x + this.game.camera.x;
        const mouseY = this.game.mouse.y + this.game.camera.y;
        
        // Calculate character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        
        // Calculate angle to mouse
        const dx = mouseX - characterCenterX;
        const dy = mouseY - characterCenterY;
        const angle = Math.atan2(dy, dx);

         //Convert angle to degrees for easier checks
         const degrees = angle * (180 / Math.PI);

        if (degrees >= -90 && degrees < 90) { //right side of charcter
            this.facing = 0; 
        } else {
            this.facing = 1; //left side of character
        }
        // Add arrow to game entities
        if (this.tripleShot) {
            const baseAngle = Math.atan2(dy, dx);
            const spreadAngle = 0.26;
            const angles = [
                baseAngle - spreadAngle,
                baseAngle,
                baseAngle + spreadAngle
            ];
            angles.forEach(angle => {
                this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, Math.round(this.bowDamage / 2), this.arrowSpeed, 
                    "./Sprites/Projectiles/Arrows_pack.png", this.bowKnockback, true, 2, this.piercing,
                    2, 0, -6, 32, 32, 1, 0.2, false, true, - 15, -15, this.bitSize * 2 - 35, this.bitSize * 2 - 35, this.bitSize, this.bitSize, this)); 
            });
        } else {
            this.game.addEntity(new Projectile(this.game, characterCenterX, characterCenterY, angle, this.bowDamage, this.arrowSpeed, 
                "./Sprites/Projectiles/Arrows_pack.png", this.bowKnockback, true, 2, this.piercing,
                2, 0, -6, 32, 32, 1, 0.2, false, true, - 15, -15, this.bitSize * 2 - 35, this.bitSize * 2 - 35, this.bitSize, this.bitSize, this)); 
        }
        //bounding box will always start at this.x for the projectile. The -15 is just something that we could maybe offset it by. If no offset,  then we could just put 0


        // Set bow state and cooldown
        this.state = 9; // Bow state

        this.animations[9][0].elapsedTime = 0; //Bow right
        this.animations[9][1].elapsedTime = 0; //Bow left
    }

    magicAOE() { //kinda like an ult?
        this.magicking = true; 
        this.canMagic = false;
        this.magicCooldownTimer = this.magicCooldown;
        this.magicTimer = this.magicDuration;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/FireBall.mp3");

        // Calculate character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;

        if (this.game.mouse != null) {
            const mouseX = this.game.mouse.x + this.game.camera.x;
            const mouseY = this.game.mouse.y + this.game.camera.y;

            const dx = mouseX - characterCenterX;
            const dy = mouseY - characterCenterY;
            const angle = Math.atan2(dy, dx);
                
            //Convert angle to degrees for easier checks
            const degrees = angle * (180 / Math.PI);
                
            if (degrees >= -90 && degrees < 90) { //right side of charcter
                this.facing = 0; 
            } else {
                this.facing = 1; //left side of character
            }
        }
        
        if (this.respawningUlt) {
            //If we want respawning ult to crit
            this.game.addEntity(new CircleAOE(this.game, characterCenterX, characterCenterY , "./Sprites/Magic/magic.png", 
                null, this.respawningScale, this.respawningDamage, this.respawningKnockback, this, true, 
                0, 64, 64, 64, 7, 0.08, false, false));
        } else {
            this.game.addEntity(new CircleAOE(this.game, characterCenterX, characterCenterY , "./Sprites/Magic/magic.png", 
                null, this.magicScale, this.magicDamage, this.magicKnockback, this, true, 
                0, 320, 64, 64, 9, 0.08, false, false));
        }

        this.respawningUlt = false;

        //change animation state to 11
        this.state = 11;

        this.animations[11][0].elapsedTime = 0; //Magic right animation reset
        this.animations[11][1].elapsedTime = 0; //Magic left animation reset
                
    }

    lightning() {
        this.lightningMagic = true;
        this.canLightning = false;
        this.lightningCooldownTimer = this.lightningCooldown;
        this.magicTimer = this.magicDuration;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/LightningStrike.mp3");

        
        // Get character center
        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;
        
        // Set animation state
        this.state = 12;
        this.animations[12][this.facing].elapsedTime = 0;

        if (this.game.mouse != null) {
            const mouseX = this.game.mouse.x + this.game.camera.x;
            const mouseY = this.game.mouse.y + this.game.camera.y;

            const dx = mouseX - characterCenterX;
            const dy = mouseY - characterCenterY;
            const angle = Math.atan2(dy, dx);
                
            //Convert angle to degrees for easier checks
            const degrees = angle * (180 / Math.PI);
                
            if (degrees >= -90 && degrees < 90) { //right side of charcter
                this.facing = 0; 
            } else {
                this.facing = 1; //left side of character
            }
            this.game.addEntity(new Lightning(
                this.game,
                mouseX,
                mouseY,
                this.lightingDamage,
                this.lightningKnockback,
                this,
                this.lightningScale,
                mouseX,
                mouseY,
                this.lightningOption
            )); 
        }
        

        //Reset animation
        this.animations[12][0].elapsedTime = 0;
        this.animations[12][1].elapsedTime = 0;
    }

    darkBolt() {
        this.boltMagic = true;
        this.canBolt = false;
        this.boltCooldownTimer = this.boltCooldown;
        this.magicTimer = this.magicDuration;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/LightningStrike.mp3");

        const characterCenterX = this.x + (this.bitSize * this.scale) / 2;
        const characterCenterY = this.y + (this.bitSize * this.scale) / 2;

        this.state = 12;
        this.animations[12][this.facing].elapsedTime = 0;

        const radius = 400;    // Maximum distance from player
        const angle = Math.random() * Math.PI * 2; // Random angle
        const distance = Math.random() * radius;   // Random distance
        
        const strikeX = characterCenterX + Math.cos(angle) * distance;
        const strikeY = characterCenterY + Math.sin(angle) * distance;

        if (this.facing == 2) { //when character is looking up
            this.facing = 0; 
        } else if (this.facing == 3) {//when character is looking down
            this.facing = 1; 
        }
        this.game.addEntity(new Lightning(
            this.game,
            strikeX,
            strikeY,
            this.boltDamage,
            this.lightningKnockback,
            this,
            this.boltScale,
            null,
            null,
            this.lightningOption
        )); 

        // Reset animation
        this.animations[12][0].elapsedTime = 0;
        this.animations[12][1].elapsedTime = 0;
    }
    usePotion() {
        this.canPotion = false;
        ASSET_MANAGER.playAsset("./Audio/SoundEffects/Healing.wav");
        this.potionCooldownTimer = this.potionCooldown;
        this.potionHealingAmount = Math.round(this.maxhealth * 0.2);
        (this.health + this.potionHealingAmount > this.maxhealth) ? this.health = this.maxhealth : this.health += this.potionHealingAmount;
    }

    takeDamage(amount) {
        if (!this.invincible) {
            console.log(this.health);
            this.health -= amount;
            if (this.health <= 0) {
                this.health = 0;
                this.dead = true;
                console.log("Player is dead!");
               // ASSET_MANAGER.pauseBackgroundMusic();
            } else {
                this.state = 10;
                this.invincible = true;
                this.isPlayingDamageAnimation = true;
                this.damageAnimationTimer = this.damageAnimationDuration;
                if (this.facing === 0 || this.facing === 2) {
                    this.animations[10][0].elapsedTime = 0;
                } else {
                    this.animations[10][1].elapsedTime = 0;
                }
            }
        }
    }

    //method used for bosses/mini bosses. Added this because felt lazy to implement/edit the takeDamage method 
    takeDamageKnockback(amount, knockbackForce, sourceX, sourceY){
        if (!this.invincible) {
            // Apply knockback
            const dx = (this.x + (this.bitSize * this.scale)/2) - sourceX;
            const dy = (this.y + (this.bitSize * this.scale)/2) - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy);


            if (distance > 0) {
                this.pushbackVector.x = (dx / distance) * knockbackForce;
                this.pushbackVector.y = (dy / distance) * knockbackForce;
            } else {
                // Default knockback direction (e.g., upward) in case the zombie and source overlap
                this.pushbackVector.x = 0;
                this.pushbackVector.y = -knockbackForce;
            }
            console.log(this.health);
            this.health -= amount;
            if (this.health <= 0) {
                this.dead = true;
                this.health = 0;
                console.log("Player is dead!");
               // ASSET_MANAGER.pauseBackgroundMusic();
            } else {
                this.state = 10;
                this.invincible = true;
                this.isPlayingDamageAnimation = true;
                this.damageAnimationTimer = this.damageAnimationDuration;
                if (this.facing === 0 || this.facing === 2) {
                    this.animations[10][0].elapsedTime = 0;
                } else {
                    this.animations[10][1].elapsedTime = 0;
                }
            }
        }
    }
    

    respawnHere() {
        console.log("testing here");
        this.game.toggleDeathPause()
        this.invincible = true;
        this.coins -= 350; // Deduct respawn cost
        this.health = this.maxhealth; // Reset health
        this.dead = false;
        this.game.camera.respawn();
        this.game.pause = false;
        this.respawning = true;
        
        // Reset position to where player died
        this.x = this.deathPosition.x;
        this.y = this.deathPosition.y;
        
        // Reset any other necessary stats
        this.facing = this.lastMove;
                
        // Reset cooldowns
        this.rollCooldownTimer = 0;
        this.attackCooldownTimer = 0;
        this.shootCooldownTimer = 0;
        this.magicCooldownTimer = 0;
        this.bombCooldownTimer = 0;
        this.lightningCooldownTimer = 0;
        this.boltCooldownTimer = 0;
    }

    levelUp() {
        if (this.experience >= this.experienceToNextLvl) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/LevelUp.wav");
            while (this.experience >= this.experienceToNextLvl) {
                // this.health = this.maxhealth;
                this.level++;
                this.game.upgrade.points++;
                this.experience -= this.experienceToNextLvl;
                (this.experienceToNextLvl > 100) ? this.experienceToNextLvl = 100 : this.experienceToNextLvl = Math.floor(this.experienceToNextLvl * 1.1);
            }
            this.levelUpMenu();
        }
    }
    levelUpMenu() {
        this.game.upgrade.getThreeUpgrades();
        if (!this.game.upgrade.noUpgrades) {
            if (this.game.settings.enableLevelUpPause) this.game.toggleUpgradePause();
        }
    }
    critDamageCheck(damage) {
        // console.log(damage);
        const random = Math.random();
        let finalDamage = damage;
        if(random < this.critChance) {
            finalDamage *= this.critDamage;
        }
        return Math.round(finalDamage);
    }
    //If we want to do a minimap, need to add this for all entities being added
    drawMinimap(ctx, mmX, mmY) {
        ctx.fillStyle = "White";
        ctx.fillRect(mmX + this.x / this.bitSize, mmY + this.y / this.bitSize, 3, 3);
    };

    draw(ctx) {        
        const shadowWidth = 32 * (this.scale / 2.8); 
        const shadowHeight = 16 * (this.scale / 2.8);

        const shadowX = (this.x + (33 * (this.scale / 2.8))) - this.game.camera.x;
        const shadowY = (this.y + (77 * (this.scale / 2.8))) - this.game.camera.y;

        ctx.drawImage(this.shadow, 0, 0, 64, 32, shadowX, shadowY, shadowWidth, shadowHeight);

        if (this.dead) {
            if (this.deathAnimationTimer > 0) {
                this.game.click = {x: 0, y: 0};
                this.deadAnim.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
            }
        } else if (this.respawning) {
            if (this.respawnAnimationTimer > 0) {
                this.respawnAnim.drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale);
            }
        } else if (this.isPlayingDamageAnimation) {
            this.animations[10][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); 
        } else {
            this.animations[this.state][this.facing].drawFrame(this.game.clockTick, ctx, this.x - this.game.camera.x, this.y - this.game.camera.y, this.scale); //we're putting her at pixel 25 x 25 on canvas
            //2.8
        }
            //will show the bound box of our player

            // ctx.strokeStyle = 'Green';
            // ctx.strokeRect((this.x + (this.bitSize * this.scale)/2) - this.game.camera.x, (this.y + (this.bitSize * this.scale)/2) - this.game.camera.y, 20, 20);
        if (PARAMS.DEBUG) {
            ctx.strokeStyle = 'Red';
            ctx.strokeRect(this.BB.x - this.game.camera.x, this.BB.y - this.game.camera.y, this.BB.width, this.BB.height);
        }
     
    };
}