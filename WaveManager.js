class WaveManager {
    constructor(game) {
        this.game = game;
        this.currentWave = 0;
        this.zombiesInWave = 0;
        this.zombiesAlive = 0;
        this.waveInProgress = false;

        //might change it to where there'll be a timer for each wave. Timer increases each wave.
        this.timeBetweenWaves = 10; //Time in seconds between waves
        this.waveTimer = this.timeBetweenWaves; 
        this.spawnBuffer = 100; //Extra distance from screen edge for spawning
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

    update() {
        // Count alive zombies
        this.zombiesAlive = this.game.entities.filter(entity => entity instanceof Zombie || entity instanceof HellSpawn && !entity.dead).length;

        if (!this.waveInProgress) {
            // Update wave timer
            this.waveTimer -= this.game.clockTick;

            if (this.waveTimer <= 0) {
                this.startNewWave();
            }
        } else if (this.zombiesAlive === 0) {
            // Current wave is finished
            this.waveInProgress = false;
            this.waveTimer = this.timeBetweenWaves;
        }
    }

    startNewWave() {
        this.currentWave++;
        this.waveInProgress = true;
        
    //     // Calculate number of zombies for this wave
    //     // Increase zombies each wave: Wave 1 = 5 zombies, Wave 2 = 7 zombies, etc.
    //     this.monstersInWave = Math.floor(5 + (this.currentWave - 1) * 2);

    //    // var enemy_contact = ["zombie", "hellspawn", "ghost", "blueghoul", "freakyghoul"];
    //     var enemypool = ["zombie", "hellspawn"];
        
    //     // Spawn zombies with slight delay between each
    //     let monsterSpawned = 0;
    //     const spawnInterval = setInterval(() => {
    //         let enemy = enemypool[randomInt(enemypool.length)];
    //         if (monsterSpawned < this.monstersInWave) {
    //             this.spawnZombie();
    //             monsterSpawned++;
    //         } else {
    //             clearInterval(spawnInterval);
    //         }
    //     }, 500); // Spawn a zombie every 500ms

        const waveConfig = WAVE_CONFIG[this.currentWave] || {enemies: ["zombie"],count:5};
        let enemiesToSpawn = waveConfig.count;
        let enemiesSpawned = 0;
        
        const spawnInterval = setInterval(() => {
            if(enemiesSpawned < enemiesToSpawn) {
                if(waveConfig.boss){
                    this.spawnEnemy(waveConfig.boss);

                }
                else if(waveConfig.miniBoss) {
                    let randomEnemy = new Enemy(waveConfig.enemies[randomInt(waveConfig.enemies.length)]);
                    this.spawnEnemy(randomEnemy, true); 
                }
                else {
                    this.spawnEnemy(waveConfig.enemies[randomInt(waveConfig.enemies.length)]);
                }
                enemiesSpawned++;
            }
            else {
                clearInterval(spawnInterval);
            }
    }, 500); // Spawn a zombie every 500ms
}
    /**
     * Spawns an enemy dynamically based on type, with optional mini-boss scaling.
     * @param {*} ctx 
     */
    spawnEnemy(type, isMiniBoss = false) {
        const spawnPos = this.getValidSpawnPosition();
        let enemy;
    
        switch(type) {
            case "zombie":
                enemy = new Zombie(this.game, spawnPos.x, spawnPos.y);
                break;
            case "hellspawn":
                enemy = new HellSpawn(this.game, spawnPos.x, spawnPos.y);
                break;
            case "blueghoul":
                enemy = new BlueGhoul(this.game, spawnPos.x, spawnPos.y);
                break;
            case "freakyghoul":
                enemy = new FreakyGhoul(this.game, spawnPos.x, spawnPos.y);
                break;
            case "DemonLord":
                enemy = new DemonLord(this.game, spawnPos.x, spawnPos.y);
                break;
            default:
                console.log("Invalid enemy type");
                return;
        }
    
        // Apply special melee mini-boss scaling if applicable
        if (isMiniBoss && this.isMeleeEnemy(enemy)) {
            enemy = this.spawnMiniBossMelee(enemy);
        } else {
            this.scaleEnemy(enemy, isMiniBoss);
        }
    
        this.game.addEntity(enemy);
    }
    
    /**
     * Checks if an enemy is classified as a melee-type.
     */
    isMeleeEnemy(enemy) {
        return enemy instanceof Zombie || 
               enemy instanceof Crow || 
               enemy instanceof BlueGhoul || 
               enemy instanceof FreakyGhoul || 
               enemy instanceof Ghost || 
               enemy instanceof Goblin;
    }
    
    /**
     * Applies melee mini-boss scaling to the given enemy.
     */
    spawnMiniBossMelee(enemy) {
        if (this.isMeleeEnemy(enemy)) {
            enemy.scale *= 1.4;
            enemy.health *= 2;
            enemy.speed *= 1.4;
            enemy.attackPower *= 1.2;
            enemy.entityOrder = 40;
        } else {
            console.log("This isn't a melee enemy");
            return enemy;
        }
        return enemy;
    }
    // spawnZombie() {
    //     const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
    //     const zombie = new Zombie(
    //         this.game, 
    //         spawnPos.x, 
    //         spawnPos.y
    //     );
        
    //     // // Scale zombie stats based on wave number
    //     // zombie.health = Math.floor(20 * (1 + this.currentWave * 0.2)); // Increase health by 20% each wave
    //     // zombie.attackPower = Math.floor(10 * (1 + this.currentWave * 0.1)); // Increase attack by 10% each wave
    //     // zombie.speed = 200 * (1 + this.currentWave * 0.05); // Increase speed by 5% each wave
        
    //     this.game.addEntity(zombie);
    // }

    // spawnMiniBossZombie() {
    //     const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
    //     const zombie = new Zombie(
    //         this.game, 
    //         spawnPos.x, 
    //         spawnPos.y
    //     );
        
    //     // Scale zombie stats based on wave number
    //     zombie.health *= 2;
    //     zombie.attackPower *= 2;
    //     zombie.speed *= 1.3;
    //     zombie.scale *= 1.5;

    //     this.game.addEntity(zombie);
    // }

    // spawnMiniBoss(enemy) { //we'll pass in a enemy object in here. Should be passed in with the random coordinates already.
    //     // const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
    //     enemy.health *= 2;
    //     enemy.attackPower *= 2;
    // }

    
    // spawnHellspawn() {
    //     const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
    //     const hellspawn = new HellSpawn(
    //         this.game, 
    //         spawnPos.x, 
    //         spawnPos.y
    //     );
        
    //     // Scale zombie stats based on wave number
    //     // zombie.health = Math.floor(20 * (1 + this.currentWave * 0.2)); // Increase health by 20% each wave
    //     // zombie.attackPower = Math.floor(10 * (1 + this.currentWave * 0.1)); // Increase attack by 10% each wave
    //     // zombie.speed = 200 * (1 + this.currentWave * 0.05); // Increase speed by 5% each wave
        
    //     this.game.addEntity(hellspawn);
    // }

    // spawnMiniBossMelee(enemy) { //should pass in enemy object with coordinates. EX: spawnMiniBossMelee(new Zombie(game, x, y))
    //     if (enemy instanceof Zombie || enemy instanceof Crow || enemy instanceof BlueGhoul || enemy instanceof FreakyGhoul || enemy instanceof Zombie || enemy instanceof Ghost || enemy instanceof Goblin) {
    //         enemy.scale *= 1.4;
    //         enemy.health *= 2;
    //         enemy.speed *= 1.4;
    //         enemy.attackPower *= 1.2;
    //         enemy.entityOrder = 40;
    //     } else {
    //         console.log("this isn't a melee enemy");
    //         return;
    //     }
    //     return enemy;
    // }

    /**
     * Adjusts enemy attributes  based on wave scaling
     * @param {} ctx 
     */
    scaleEnemy(enemy,isMiniBoss) {
        const waveMultiplier = 1 + (this.currentWave * 0.2);

        enemy.health = Math.floor(enemy.health * waveMultiplier);
        enemy.attackPower = Math.floor(enemy.attackPower * waveMultiplier);
        enemy.speed = Math.floor(enemy.speed * waveMultiplier);

        if(isMiniBoss) {
            enemy.health *=2;
            enemy.attackPower *=2;
            enemy.speed *=1.5;
            enemy.scale *= 1.5;
    }
}
    draw(ctx) {
        ctx.fillText(`Wave: ${this.currentWave}`, 10, 240);
        ctx.fillText(`Monsters Remaining: ${this.zombiesAlive}`, 10, 270);
        if (!this.waveInProgress) {
            ctx.fillText(`Next wave in: ${Math.ceil(this.waveTimer)}s`, 10, 300);
    }
}
}

// Defines wave progression, introducing new enemies, mini-bosses, and bosses at key points
const WAVE_CONFIG = {
    1: {enemies: ["zombie"], count: 5},
    3: {enemies: ["zombie", "hellspawn"], count: 7},
    5: {enemies: ["zombie", "hellspawn", "blueghoul"], count: 10},
    10: {miniBoss: true, count:12},
    15: {boss: "DemonLord",count:1}
};
