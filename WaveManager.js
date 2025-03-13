class WaveManager {
    constructor(game) {
        this.game = game;
        this.gameTime = 0; // Total time elapsed in seconds
        this.spawnBuffer = 500;
        this.bossSpawned = false;
        this.bossActive = false;
        this.maxEnemies =  700; //set to 700 so game doesnt start to lag or become too difficult
         // Boss fight timing
        this.bossTime = 300; //300 seconds seconds or 5 minutes until boss comes (initialization for map 1, can change it later on).
        this.mapCompleted = false; //will be for if we beat the boss
        this.totalGameTime = 0;
        this.multiplier = 0.17;
        
        // Enemy pools that unlock at different times
        this.enemyPools = {
            melee: {
                unlockTime: 0,
                enemies: [
                    { type: "zombie", weight: 70 },
                    { type: "goblin", weight: 25 },
                    { type: "ghost", weight: 25 },
                    { type: "blueghoul", weight: 25 },
                    { type: "freakyghoul", weight: 25 },
                    { type: "crow", weight: 25 },
                ]
            },
            ranged: {
                // unlockTime: 0,
                enemies: [
                    { type: "banditnecromancer", weight: 40 },
                    { type: "necromancer", weight: 30 },
                    { type: "foxmage", weight: 30 },
                    { type: "imp", weight: 30 }
                ]
            },
            chargers: {
                // unlockTime: 150, 
                enemies: [
                    {type: "hellspawn", weight: 33},
                    {type: "slime", weight: 33},
                    {type: "boar", weight: 34}
                ]
            },
            rangedAOE: {
                // unlockTime: 180,
                enemies: [
                    {type: "ratmage", weight: 50},
                    {type: "wizard", weight: 50}
                ]
            },
            minibosses: {
                // unlockTime: 300, // Unlocks at 5 minutes
                enemies: [
                    { type: "miniboss_zombie", weight: 25 },
                    { type: "miniboss_hellspawn", weight: 50 },
                    { type: "goblinmech", weight: 25},
                    { type: "cyclops", weight: 25},
                    { type: "minotaur", weight: 25},
                    { type: "miniboss_ghost", weight: 25},
                    { type: "miniboss_blueghoul", weight: 25},
                    { type: "miniboss_freakyghoul", weight: 25},
                    { type: "miniboss_banditnecromancer", weight: 25},
                    { type: "miniboss_necromancer", weight: 25},
                    { type: "miniboss_ratmage", weight: 25},
                    { type: "miniboss_foxmage", weight: 25},
                    { type: "miniboss_imp", weight: 25},
                    { type: "miniboss_crow", weight: 25},
                    { type: "miniboss_slime", weight: 25},
                    { type: "miniboss_boar", weight: 25},
                    { type: "miniboss_wizard", weight: 25},
                    { type: "miniboss_goblin", weight: 25}
                ]
            }
        };
        //Spawn patterns that activate at different times
        // if (this.game.currMap == 1) {
        //     this.spawnPatterns = [
        //         {
        //             startTime: 0, //when they'll start spawning
        //             interval: 3, // Spawn every 3 seconds
        //             count: 1,
        //             pool: "melee",
        //             enemy_type: "zombie", // Always spawn zombies
        //             oneTime: false //If we want to spawn the enemy one time. If this is true, it won't worry about the interval and just spawn at the start time

        //         },
        //         // {
        //         //     startTime: 30, //After 30 seconds, zombie enemies will spawn faster now
        //         //     interval: 7, count: 2, pool: "melee", enemy_type: "zombie"},
        //         {
        //             startTime: 30, //After 1 minute, melee enemies will spawn 2 times now
        //             interval: 7, count: 2, pool: "melee", enemy_type: "blueghoul", oneTime: false},
        //         {
        //             startTime: 45, //1 minute. The interval makes it go to 1 minute
        //             interval: 15, count: 2, pool: "melee", enemy_type: "goblin", oneTime: false},
        //         {
        //             startTime: 60, //1:30 minutes
        //             interval: 30, count: 2, pool: "ranged", enemy_type: "imp", oneTime: false},
        //         {
        //             startTime: 70, //2 and 30 minutes
        //             interval: 50, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
        //         {
        //             startTime: 120, // 3 minutes
        //             interval: 60, count: 1, pool: "minibosses", enemy_type: "cyclops", oneTime: false},
        //         {
        //             startTime: 210, //3:30 minutes
        //             interval: 40, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
        //         {
        //             startTime: 230, //4:00 minutes
        //             interval: 15, count: 1, pool: "charge", enemy_type: "slime", oneTime: false},
        //     ];
        // } else if (this.game.currMap == 2) {
        //     //set spawn pattern for map 2 here
        //     this.spawnPatterns = [
        //         {
        //             startTime: 0, //when they'll start spawning
        //             interval: 0, // Spawn every 3 seconds
        //             count: 1,
        //             pool: "minibosses",
        //           //  enemy_type: "miniboss_zombie", // Always spawn zombies
        //             oneTime: false //If we want to spawn the enemy one time. If this is true, it won't worry about the interval and just spawn at the start time

        //         }
        //     ];
        // } else if (this.game.currMap == 3) {
        //     //set spawn pattern for map 3 here
        // } else {
        //     //if there's no map right now, there will be no spawn pattern
        //     this.spawnPatterns = [];
        // }

        this.spawnPatterns = [];

        // Spawn timers for each pattern
        //this.spawnTimers = this.spawnPatterns.map(() => 0);
        
        // Stats scaling
        this.statsMultiplier = {
            health: 1,
            speed: 1,
            attackPower: 1
        };
    }

    weightedRandomEnemy(pool) {
        const enemies = this.enemyPools[pool].enemies;
        const totalWeight = enemies.reduce((sum, enemy) => sum + enemy.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const enemy of enemies) {
            random -= enemy.weight;
            if (random <= 0) return enemy.type;
        }
        return enemies[0].type; // Fallback
    }

    spawnEnemy(enemyType) {
        const spawnPos = this.getValidSpawnPosition();
        let enemy;
        if (this.getCurrentEnemyCount() >= this.maxEnemies) {
            return; // Don't spawn if we've reached the limit
        }

        switch(enemyType) {
            case "zombie":
                enemy = new Zombie(this.game, spawnPos.x, spawnPos.y);
                break;
            case "goblin":
                enemy = new Goblin(this.game, spawnPos.x, spawnPos.y);
                break;
            case "ghost":
                enemy = new Ghost(this.game, spawnPos.x, spawnPos.y);
                break;
            case "blueghoul":
                enemy = new BlueGhoul(this.game, spawnPos.x, spawnPos.y);
                break;
            case "freakyghoul":
                enemy = new FreakyGhoul(this.game, spawnPos.x, spawnPos.y);
                break;
            case "crow":
                enemy =  new Crow(this.game, spawnPos.x, spawnPos.y);
                break;
            case "banditnecromancer":
                enemy = new BanditNecromancer(this.game, spawnPos.x, spawnPos.y);
                break;
            case "necromancer":
                enemy = new Necromancer(this.game, spawnPos.x, spawnPos.y);
                break;
            case "foxmage":
                enemy = new FoxMage(this.game, spawnPos.x, spawnPos.y);
                break;
            case "imp":
                enemy = new Imp(this.game, spawnPos.x, spawnPos.y);
                break;
            case "hellspawn":
                enemy = new HellSpawn(this.game, spawnPos.x, spawnPos.y);
                break;
            case "slime":
                enemy = new Slime(this.game, spawnPos.x, spawnPos.y);
                break;
            case "boar":
                enemy = new Boar(this.game, spawnPos.x, spawnPos.y);
                break;
            case "ratmage":
                enemy = new RatMage(this.game, spawnPos.x, spawnPos.y);
                break;
            case "wizard":
                enemy = new Wizard(this.game, spawnPos.x, spawnPos.y);
                break;
            case "miniboss_zombie": //just zombie miniboss for now
                enemy = new Zombie(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "goblinmech": 
                enemy = new GoblinMech(this.game, spawnPos.x, spawnPos.y);
                break;
            case "cyclops": 
                enemy = new Cyclops(this.game, spawnPos.x, spawnPos.y);
                break;
            case "minotaur": 
                enemy = new Minotaur(this.game, spawnPos.x, spawnPos.y);
                break;
            case "miniboss_hellspawn":
                enemy = new HellSpawn(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossCharge(enemy);
                break;
            case "miniboss_ghost":
                enemy = new Ghost(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "miniboss_blueghoul":
                enemy = new BlueGhoul(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "miniboss_freakyghoul":
                enemy = new FreakyGhoul(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "miniboss_banditnecromancer":
                enemy = new BanditNecromancer(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRange(enemy);
                break;
            case "miniboss_necromancer":
                enemy = new Necromancer(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRange(enemy);
                break;
            case "miniboss_ratmage":
                enemy = new RatMage(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRangeAOE(enemy);
                break;
            case "miniboss_foxmage":
                enemy = new FoxMage(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRange(enemy);
                break;
            case "miniboss_imp":
                enemy = new Imp(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRange(enemy);
                break;
            case "miniboss_crow":
                enemy = new Crow(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "miniboss_slime":
                enemy = new Slime(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossCharge(enemy);
                break;
            case "miniboss_boar":
                enemy = new Boar(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossCharge(enemy);
                break;
            case "miniboss_goblin":
                enemy = new Goblin(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossMelee(enemy);
                break;
            case "miniboss_wizard":
                enemy = new Wizard(this.game, spawnPos.x, spawnPos.y);
                this.spawnMiniBossRangeAOE(enemy);
                break;
        }

        // Apply current stat multipliers
        if (enemy) { //and melee
            console.log(this.statsMultiplier.health);
            //if (enemy.type === "zombie" || enemy.type === ...)
             if (enemy.miniBoss || enemy instanceof Cyclops || enemy instanceof GoblinMech || enemy instanceof Minotaur) {
                const temp = enemy.health;
                enemy.health = Math.floor(enemy.health * this.statsMultiplier.health * 3);
                enemy.maxHealth = Math.floor(temp * this.statsMultiplier.health *3);
             } else {
                if (this.game.camera.currMap < 3) {
                    const temp = enemy.health;
                    enemy.health = Math.floor(enemy.health * this.statsMultiplier.health);
                    enemy.maxHealth = Math.floor(temp * this.statsMultiplier.health);
                } else {
                    const temp = enemy.health;
                    enemy.health = Math.floor(1.17 * enemy.health * this.statsMultiplier.health);
                    enemy.maxHealth = Math.floor(1.17 * temp * this.statsMultiplier.health);
                }
             }

            // enemy.speed *= this.statsMultiplier.speed;
                // enemy.attackPower *= this.statsMultiplier.attackPower;
            this.game.addEntity(enemy);
        }
    }

    getCurrentEnemyCount() {
        return this.game.entities.filter(entity => 
            entity instanceof Zombie || 
            entity instanceof Goblin ||
            entity instanceof Ghost ||
            entity instanceof BlueGhoul ||
            entity instanceof FreakyGhoul ||
            entity instanceof Crow ||
            entity instanceof BanditNecromancer ||
            entity instanceof Necromancer ||
            entity instanceof FoxMage ||
            entity instanceof Imp ||
            entity instanceof HellSpawn ||
            entity instanceof Slime ||
            entity instanceof Boar ||
            entity instanceof RatMage ||
            entity instanceof Wizard ||
            entity instanceof GoblinMech ||
            entity instanceof Cyclops ||
            entity instanceof Minotaur
        ).length;
    }

    isBossDefeated() {
        // Check if the boss is still alive
        const bossDefeated = !this.game.entities.some(entity => entity instanceof Boss1 && !entity.dead);
        
        // If boss is defeated, mark game as completed
        if (bossDefeated && this.bossActive) {
            this.mapCompleted = true;
        }
        
        return bossDefeated;    
    }

    update() {
        this.gameTime += this.game.clockTick; //for the map
        if (!this.bossSpawned) {
            this.totalGameTime += this.game.clockTick; 
        }
        console.log(this.statsMultiplier.health);

        // If game is completed, don't spawn anything
        if (this.mapCompleted) {
            return;
        }
        // Check for boss fight
        if (this.gameTime >= this.bossTime && !this.bossSpawned) {
           // this.clearAllEnemies();
            this.spawnBoss();
            return; // Don't spawn any more regular enemies
        }

        // Check for boss defeat
        if (this.bossActive && this.isBossDefeated()) {
            this.bossActive = false;
            return; // Exit early since game is now completed
        }


        // Don't spawn regular enemies during boss fight or after game completion
        if (this.bossActive || this.mapCompleted) return;


        // Regular enemy spawning logic
        this.statsMultiplier.health = 1 + (this.totalGameTime / 120) * this.multiplier; //increase enemy health by 7% every 2:00. This is so enemy still has fighting chance against player
        const twoMinuteIntervals = Math.floor(this.totalGameTime / 15); // Get number of completed 2-minute intervals
       
        // this.statsMultiplier.health = 1 + (this.totalGameTime / 120) * 0.25; //increase enemy health by 30% every 2:00. This is so enemy still has fighting chance against player
        // const twoMinuteIntervals = Math.floor(this.totalGameTime / 15); // Get number of completed 2-minute intervals
        // this.statsMultiplier.health = 1 + (twoMinuteIntervals * 0.2); // 20% increase per interval
        // this.statsMultiplier.speed = Math.round(1 + (this.gameTime / 600) * 0.2);
        // this.statsMultiplier.attackPower = Math.round(1 + (this.gameTime / 400) * 0.2);

        //spawn patterns:
        this.spawnPatterns.forEach((pattern, index) => {
            if (this.gameTime >= pattern.startTime) {
                if (pattern.oneTime) {
                    // Spawn once and remove from patterns
                    for (let i = 0; i < pattern.count; i++) {
                        const enemyType = pattern.enemy_type || this.weightedRandomEnemy(pattern.pool); //if there's an enemy listed, we'll used that enemy in the pattern, otherwise, we'll use whole pool
                        this.spawnEnemy(enemyType);
                    }
                    //remove this pattern
                    this.spawnPatterns.splice(index, 1);
                } else {
                    //regular spawn pattern logic
                    this.spawnTimers[index] += this.game.clockTick;
                    if (this.spawnTimers[index] >= pattern.interval) {
                        for (let i = 0; i < pattern.count; i++) {
                            const enemyType = pattern.enemy_type || this.weightedRandomEnemy(pattern.pool);
                            this.spawnEnemy(enemyType);
                        }
                        this.spawnTimers[index] = 0;
                    }
                }
            }
        });
    }

    /**
     * //will spawn the mob outside the camera.
     * @returns the x and y coordinate of where the zombie will spawn (should be outside the player camera)
     */
    getValidSpawnPosition() { 
        //Get camera position and viewport dimensions
        const camera = this.game.camera;
        const viewportWidth = PARAMS.CANVAS_WIDTH;
        const viewportHeight = PARAMS.CANVAS_HEIGHT;

        // Calculate the visible area boundaries
        const visibleLeft = camera.x;
        const visibleRight = camera.x + viewportWidth;
        const visibleTop = camera.y;
        const visibleBottom = camera.y + viewportHeight;

        // Define spawn area (slightly larger than visible area)
        const spawnLeft = visibleLeft - this.spawnBuffer;
        const spawnRight = visibleRight + this.spawnBuffer;
        const spawnTop = visibleTop - this.spawnBuffer;
        const spawnBottom = visibleBottom + this.spawnBuffer;

        // Choose a random side to spawn from (0: top, 1: right, 2: bottom, 3: left)
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch(side) {
            case 0: // Top
                x = spawnLeft + Math.random() * (spawnRight - spawnLeft);
                y = spawnTop;
                break;
            case 1: // Right
                x = spawnRight;
                y = spawnTop + Math.random() * (spawnBottom - spawnTop);
                break;
            case 2: // Bottom
                x = spawnLeft + Math.random() * (spawnRight - spawnLeft);
                y = spawnBottom;
                break;
            case 3: // Left
                x = spawnLeft;
                y = spawnTop + Math.random() * (spawnBottom - spawnTop);
                break;
        }

        // Add some randomness to prevent zombies spawning in exact lines
        const randomOffset = 50; // Random offset range
        x += Math.random() * randomOffset - randomOffset/2;
        y += Math.random() * randomOffset - randomOffset/2;

        return { x, y };
    }

    spawnMiniBossMelee(enemy) { //should pass in enemy object with coordinates. EX: spawnMiniBossMelee(new Zombie(game, x, y))
        if (enemy instanceof Zombie || enemy instanceof Crow || enemy instanceof BlueGhoul || enemy instanceof FreakyGhoul || enemy instanceof Ghost || enemy instanceof Goblin) {
            enemy.scale *= 1.4;
            enemy.maxHealth *= 3;
            enemy.health *= 3;
            enemy.speed *= 1.4;
            enemy.attackPower = Math.floor(enemy.attackPower * 1.2);
            enemy.entityOrder = 40;
            enemy.miniBoss = true;
        } else {
            console.log("this isn't a melee enemy");
            return;
        }
        return enemy;
    }

    spawnMiniBossCharge(enemy) {
        if (enemy instanceof Slime || enemy instanceof HellSpawn || enemy instanceof Boar) {
            enemy.scale *= 1.4; 
            enemy.maxHealth *= 3;
            enemy.health *= 3;
            enemy.speed *= 1.4;
            enemy.chargeSpeed *= 1.2;
            enemy.chargingDamage = Math.floor(enemy.chargingDamage * 1.2);
            enemy.attackPower = Math.floor(enemy.attackPower * 1.5);
            enemy.entityOrder = 40;
            enemy.miniBoss = true;
        } else {
            console.log("this isn't a charge enemy");
            return;
        }
        return enemy;
    }

    spawnMiniBossRange(enemy) {
        if (enemy instanceof BanditNecromancer || enemy instanceof Necromancer || enemy instanceof Imp || enemy instanceof FoxMage) {
            enemy.scale *= 1.3;
            enemy.maxHealth *= 3;
            enemy.health *= 3;
            enemy.speed *= 1.4;
            enemy.damage = Math.floor(enemy.damage * 1.7);
            enemy.collisionDamage *= 2;
            enemy.entityOrder = 40;
            enemy.miniBoss = true;
        } else {
            console.log("this isn't a range enemy");
            return;
        }
        return enemy;
    }

    spawnMiniBossRangeAOE(enemy) {
        if (enemy instanceof RatMage || enemy instanceof Wizard) {
            enemy.scale *= 1.3;
            enemy.maxHealth *= 3;
            enemy.health *= 3;
            enemy.speed *= 1.7;
            enemy.damage = Math.floor(enemy.damage * 1.7);
            enemy.collisionDamage *= 2;
            enemy.entityOrder = 40;
            enemy.miniBoss = true;
        } else {
            console.log("this isn't a range AOE enemy");
            return;
        }
        return enemy;
    }

    spawnBoss() {
        const spawnPos = this.getValidSpawnPosition();
        if (this.game.camera.currMap == 1) { //less than 20 because boss will have a move that will bring a lot of enemy in. Dont want to make it too hard
            console.log("boss should now spawn");
            const boss1 = new Boss1(this.game, spawnPos.x, spawnPos.y);
            const temp = boss1.currentHealth;
            boss1.currentHealth = Math.floor(boss1.currentHealth * this.statsMultiplier.health * 4);
            boss1.maxHealth = Math.floor(temp * this.statsMultiplier.health * 4);
            this.game.addEntity(boss1);
            this.bossSpawned = true;
            this.bossActive = true;
        } else if (this.game.camera.currMap == 2) {
            console.log("boss should now spawn");
            const boss2 = new GolemMech(this.game, spawnPos.x, spawnPos.y);
            const temp = boss2.currentHealth;
            boss2.currentHealth = Math.floor(boss2.currentHealth * this.statsMultiplier.health * 5);
            boss2.maxHealth = Math.floor(temp * this.statsMultiplier.health * 5);
            this.game.addEntity(boss2);
            this.bossSpawned = true;
            this.bossActive = true;
        } else if (this.game.camera.currMap == 3) {
            console.log("boss should now spawn");
            const boss3 = new Boss3(this.game, spawnPos.x, spawnPos.y);
            const temp = boss3.currentHealth;
            boss3.currentHealth = Math.floor(boss3.currentHealth * this.statsMultiplier.health * 7);
            boss3.maxHealth = Math.floor(temp * this.statsMultiplier.health * 7);
            this.game.addEntity(boss3);
            this.bossSpawned = true;
            this.bossActive = true;
        } else if (this.game.camera.currMap == 4) {
            console.log("boss should now spawn");
            const boss4 = new Boss4(this.game, spawnPos.x, spawnPos.y);
            const temp = boss4.currentHealth;
            boss4.currentHealth = Math.floor(boss4.currentHealth * this.statsMultiplier.health * 10);
            boss4.maxHealth = Math.floor(temp * this.statsMultiplier.health * 10);
            this.game.addEntity(boss4);
            this.bossSpawned = true;
            this.bossActive = true;
        } else if (this.game.camera.currMap == 5) { //impossible map
            this.bossSpawned = false;
            this.bossActive = false;
        }
    }

    resetForNewMap() {
        const currentStatsMultiplier = {
            health: this.statsMultiplier.health,
            speed: this.statsMultiplier.speed,
            attackPower: this.statsMultiplier.attackPower
        };
        console.log(this.statsMultiplier.health);
        this.game.adventurer.health = this.game.adventurer.maxhealth;

        // Reset timers
        this.gameTime = 0;
        this.spawnTimers = this.spawnPatterns.map(() => 0);
        
        // Reset boss-related flags
        this.bossSpawned = false;
        this.bossActive = false;
        this.mapCompleted = false;
    
        if (this.game.camera.currMap == 1) {
            this.spawnPatterns = [
                {
                    startTime: 0, //when they'll start spawning
                    interval: 4, // Spawn every 4 seconds
                    count: 1,
                    pool: "melee",
                    enemy_type: "goblin", // Always spawn goblin
                    oneTime: false //If we want to spawn the enemy one time. If this is true, it won't worry about the interval and just spawn at the start time
                },
                // {
                //     startTime: 30, //After 30 seconds, zombie enemies will spawn faster now
                //     interval: 7, count: 2, pool: "melee", enemy_type: "zombie"},
                {
                    startTime: 30, //After 1 minute, melee enemies will spawn 2 times now
                    interval: 14, count: 1, pool: "melee", enemy_type: "blueghoul", oneTime: false},
                {
                    startTime: 35, //1 minute. The interval makes it go to 1 minute
                    interval: 20, count: 3, pool: "melee", enemy_type: "zombie", oneTime: false},
                {
                    startTime: 60, //1:30 minutes
                    interval: 30, count: 1, pool: "ranged", enemy_type: "imp", oneTime: false},
                {
                    startTime: 70, //2 and 30 minutes
                    interval: 50, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
                {
                    startTime: 120, // 3 minutes
                    interval: 60, count: 1, pool: "minibosses", enemy_type: "minotaur", oneTime: false},
                {
                    startTime: 210, //3:30 minutes
                    interval: 40, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
                {
                    startTime: 230, //4:00 minutes
                    interval: 15, count: 1, pool: "charge", enemy_type: "boar", oneTime: false},
                ];
                this.statsMultiplier = {
                    health: 1,
                    speed: 1,
                    attackPower: 1
                };
                this.totalGameTime = 0;
                this.maxEnemies = 35;
        } else if (this.game.camera.currMap == 2) {
            //set spawn pattern for map 2 here
            this.spawnPatterns = [
                {startTime: 0, interval: 5, count: 4, pool: "melee", enemy_type: "zombie", oneTime: false},
                {
                    startTime: 20, //After 30 seconds, zombie enemies will spawn faster now?
                    interval: 10, count: 2, pool: "melee", enemy_type: "ghost"},
                {
                    startTime: 20, //After 30 seconds, zombie enemies will spawn faster now?
                    interval: 70, count: 1, pool: "minibosses", oneTime: false},
                {
                    startTime: 20, //After 30 seconds, melee enemies will spawn 2 times now
                    interval: 10, count: 2, pool: "melee", enemy_type: "blueghoul", oneTime: false},
                {
                    startTime: 45, //1 minute. The interval makes it go to 1 minute
                    interval: 15, count: 3, pool: "melee", enemy_type: "crow", oneTime: false},
                {
                    startTime: 60, //1:15 minute. 
                    interval: 15, count: 1, pool: "melee", enemy_type: "crow", oneTime: false},
                {
                    startTime: 75, //1:30 minutes
                    interval: 15, count: 1, pool: "ranged", enemy_type: "banditnecromancer", oneTime: false},
                {
                    startTime: 70, //2 and 30 minutes
                    interval: 50, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
                {
                    startTime: 120, // 3 minutes
                    interval: 60, count: 1, pool: "minibosses", 
                    enemy_type: "goblinmech", 
                    oneTime: false},
                {
                    startTime: 180, //After 187 seconds, zombie enemies will spawn faster now
                    interval: 7, count: 5, pool: "melee", enemy_type: "zombie", oneTime: false},
                {
                    startTime: 210, //3:30 minutes
                    interval: 40, count: 1, pool: "rangedAOE", enemy_type: "ratmage", oneTime: false},
                {
                    startTime: 230, //4:00 minutes
                    interval: 15, count: 2, pool: "charge", enemy_type: "slime", oneTime: false},
            ];
            this.statsMultiplier = currentStatsMultiplier;
            this.maxEnemies = 80;
        } else if (this.game.camera.currMap == 3) {
            //set spawn pattern for map 3 here
            this.spawnPatterns = [
                {startTime: 0, interval: 3, count: 1, pool: "melee", enemy_type: "ghost", oneTime: false},
                {
                    startTime: 0, 
                    interval: 7, count: 8, pool: "melee", enemy_type: "freakyghoul"},
                {
                    startTime: 30, 
                    interval: 14, count: 7, pool: "melee", enemy_type: "zombie", oneTime: false},
                {
                    startTime: 30, //After 50 seconds, zombie enemies will spawn faster now
                    interval: 20, count: 2, pool: "melee", enemy_type: "freakyghoul"},
                {
                    startTime: 35, //1 minute. The interval makes it go to 1 minute
                    interval: 20, count: 2, pool: "charge", enemy_type: "hellspawn", oneTime: false},
                {
                    startTime: 60, //1:30 minutes
                    interval: 30, count: 3, pool: "ranged", enemy_type: "imp", oneTime: false},
                {
                    startTime: 90, //2:00 minutes
                    interval: 30, count: 3, pool: "melee", enemy_type: "blueghoul", oneTime: false},
                {
                    startTime: 103, //2 and 30 minutes
                    interval: 17, count: 2, pool: "rangedAOE", enemy_type: "wizard", oneTime: false},
                {
                    startTime: 120, // 3 minutes
                    interval: 60, count: 1, pool: "minibosses", enemy_type: "cyclops", oneTime: false},
                {
                    startTime: 190, //3:30 minutes
                    interval: 20, count: 2, pool: "ranged", enemy_type: "necromancer", oneTime: false},
                {
                    startTime: 230, //4:00 minutes
                    interval: 15, count: 1, pool: "charge", enemy_type: "slime", oneTime: false},
                {
                    startTime: 240, //4:30
                    interval: 30, count: 1, pool: "minibosses", enemy_type: "cyclops", oneTime: true},
                ];
                this.statsMultiplier = currentStatsMultiplier;
                this.maxEnemies = 700;
        } else if (this.game.camera.currMap == 4) {
            //set spawn pattern for map 4 here
            this.spawnPatterns = [
                { //0 seconds, will start with melee enemies randomly
                    startTime: 0, 
                    interval: 3, 
                    count: 8,
                    pool: "melee",
                    oneTime: false 
                },
                {
                    startTime: 0, 
                    interval: 10, count: 5, pool: "melee", oneTime: false},
                {startTime: 15, interval: 15, count: 6, pool: "ranged", oneTime: false}, //30 seconds will spawn in ranged enemies
                {starTime: 15, interval: 25, count: 3, pool: "rangedAOE", oneTime: false},
                {startTime: 30, interval: 20, count: 2, pool: "minibosses", oneTime: false}, //50 seconds, we'll start spawning in mini
                {starTime: 90, interval: 2, count: 6, pool: "melee", oneTime: false},
                {starTime: 110, interval: 6, count: 1, pool: "minibosses", oneTime: false},
                {startTime: 15, interval: 3, count: 2, pool: "ranged", oneTime: false}, //30 seconds will spawn in ranged enemies
            ];
             if (!this.game.settings.enableBoss) this.bossTime = 210; //maybe have the final spawn in earlier? 210 seconds
        } else if (this.game.camera.currMap == 5) { //secret level map
            this.spawnPatterns = [{startTime: 0, interval: 0, count: 1, pool: "minibosses", oneTime: false}];
            this.bossTime = 10000;
        } else {
            //if there's no map right now, there will be no spawn pattern
            this.spawnPatterns = [];
        }

          // Reset spawn timers for the new patterns
        this.spawnTimers = this.spawnPatterns.map(() => 0);

    }


    draw(ctx) {
        // Draw wave information
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        
        // if (!this.waveInProgress) {
        //     ctx.fillText(`Next wave in: ${Math.ceil(this.waveTimer)}`, PARAMS.CANVAS_WIDTH / 2, 200);
        // }
        ctx.fillText(this.gameTime.toFixed(0), PARAMS.CANVAS_WIDTH / 2, 200);
    }
}