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

    getValidSpawnPosition() { //will spawn the mob outside the camera.
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
        
        // Calculate number of zombies for this wave
        // Increase zombies each wave: Wave 1 = 5 zombies, Wave 2 = 7 zombies, etc.
        this.monstersInWave = Math.floor(5 + (this.currentWave - 1) * 2);

       // var enemypool = ["zombie", "hellspawn", "ghost", "blueghoul", "freakyghoul"];
        var enemypool = ["zombie", "hellspawn"];
        
        // Spawn zombies with slight delay between each
        let monsterSpawned = 0;
        const spawnInterval = setInterval(() => {
            let enemy = enemypool[randomInt(enemypool.length)];
            if (monsterSpawned < this.monstersInWave) {
                this.spawnZombie();
                monsterSpawned++;
            } else {
                clearInterval(spawnInterval);
            }
        }, 500); // Spawn a zombie every 500ms
    }

    spawnZombie() {
        const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
        const zombie = new Zombie(
            this.game, 
            spawnPos.x, 
            spawnPos.y
        );
        
        // // Scale zombie stats based on wave number
        // zombie.health = Math.floor(20 * (1 + this.currentWave * 0.2)); // Increase health by 20% each wave
        // zombie.attackPower = Math.floor(10 * (1 + this.currentWave * 0.1)); // Increase attack by 10% each wave
        // zombie.speed = 200 * (1 + this.currentWave * 0.05); // Increase speed by 5% each wave
        
        this.game.addEntity(zombie);
    }

    
    spawnHellspawn() {
        const spawnPos = this.getValidSpawnPosition(); //make sure the zombie spawns out of the camera
        
        const hellspawn = new HellSpawn(
            this.game, 
            spawnPos.x, 
            spawnPos.y
        );
        
        // Scale zombie stats based on wave number
        // zombie.health = Math.floor(20 * (1 + this.currentWave * 0.2)); // Increase health by 20% each wave
        // zombie.attackPower = Math.floor(10 * (1 + this.currentWave * 0.1)); // Increase attack by 10% each wave
        // zombie.speed = 200 * (1 + this.currentWave * 0.05); // Increase speed by 5% each wave
        
        this.game.addEntity(hellspawn);
    }

    draw(ctx) {
        // Draw wave information
    //     ctx.font = '20px Arial';
    //     ctx.fillStyle = 'white';
    //     ctx.fillText(`Wave: ${this.currentWave}`, 10, 30);
    //     ctx.fillText(`Monsters Remaining: ${this.zombiesAlive}`, 10, 60);
        
    //     if (!this.waveInProgress) {
    //         ctx.fillText(`Next wave in: ${Math.ceil(this.waveTimer)}`, 10, 90);
    //     }
    }
}