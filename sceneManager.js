class SceneManager {
    constructor(game) {
        this.game = game;
        this.game.camera = this; //this class will be this.game.camera
        this.x = 0;
        this.y = 0;
        this.game.camera.x = this.x;
        this.game.camera.y = this.y;
        
        this.adventurer = new Adventurer(this.game, 0, 0); //placing player character at 0, 0 in world map

        this.waveManager = new WaveManager(game);
        this.Hud = new Hud(this.game, this.adventurer);
        this.upgrade = new UpgradeSystem(this.game);
        this.shop = new Shop(this.game);
        this.levelShop = new LevelShop(this.game);
        new Pause(this.game);
        this.title = new Title(this.game);
        this.enableShop = false;
        this.enableLevelShop = false;

        this.enableTitle = false; //Whether title screen shows up or not

        this.shakeIntensity = 0;
        this.shakeDecay = 0.9; 


        // Add the Game Map first so it's always underneath everything
        this.game.addEntity(new GameMap(this.game)); //Will add to title when we get other maps

        this.deathScreen = new DeathScreen(this.game);
        this.game.addEntity(this.deathScreen);

        //this.loadTestLevel();
        if (!this.enableTitle) this.loadTestLevel(false);

    };



    loadTestLevel(transition) {
        this.clearEntities();
        this.game.click = {x:0, y:0};
        this.transition = transition
        if (this.transition) {
            this.game.addEntity(new TransitionScreen(this.game, 1));
        } else {
            this.game.addEntity(new GameMap(this.game));
            //Fade in effect
            this.game.addEntity(new FadeIn(this.game));
            // ASSET_MANAGER.playAsset("./Audio/Music/Survivorio Clone Battle Song (1).wav");
        var adventurer = false;
        if(!adventurer) this.game.addEntity(this.adventurer);        
        // this.game.addEntity(new Adventurer(this.game, 0, 0));

        // this.game.addEntity(new BlueGhoul(this.game, 400, 400));
        // this.game.addEntity(new BlueGhoul(this.game, 400, 400));
        // this.game.addEntity(new HellSpawn(this.game, 400, 400));
        // this.game.addEntity(new HellSpawn(this.game, 800, 400));

        // this.game.addEntity(new FreakyGhoul(this.game, 800, 800));
        // this.game.addEntity(new FreakyGhoul(this.game, 300, 800));
        // this.game.addEntity(new Ghost(this.game, 400, 400));
        // this.game.addEntity(new Ghost(this.game, 400, 400));


        // this.game.addEntity(new Zombie(this.game, 400, 400));
        // this.game.addEntity(new Zombie(this.game, 200, 400));
        // this.game.addEntity(new Zombie(this.game, 300, 450));
        // this.game.addEntity(new Zombie(this.game, 130, 400));
        // this.game.addEntity(new Zombie(this.game, 323, 400));
        // this.game.addEntity(new Zombie(this.game, 513, 400));
        // this.game.addEntity(new Zombie(this.game, 42, 400));
        // this.game.addEntity(new BanditNecromancer(this.game, 42, 400));
        this.game.addEntity(new Necromancer(this.game, 42, 400));
        // this.game.addEntity(new Imp(this.game, 42, 400));

        // this.game.addEntity(new RatMage(this.game, 200, 400));
        // this.game.addEntity(new FoxMage(this.game, 200, 400));
        // this.game.addEntity(new Crow(this.game, 200, 400));
        // this.game.addEntity(new Slime(this.game, 200, 400));
        // this.game.addEntity(new Boar(this.game, 200, 400));
        // this.game.addEntity(new Wizard(this.game, 200, 200));
        // this.game.addEntity(new Goblin(this.game, 200, 200));
        //  this.game.addEntity(new Cyclops(this.game, 200, 400));
        // this.game.addEntity(new Minotaur(this.game, 200, 400));
        // this.game.addEntity(new GoblinMech(this.game, 200, 400));

        // this.game.addEntity(new Boss1(this.game, 200, 400));
        //  this.game.addEntity(new GolemMech(this.game, 200, 200));



        // this.game.addEntity(this.generateObject("Barrel", 100, 100));
        // this.game.addEntity(this.generateObject("Crate", 300, 100));
        // this.game.addEntity(this.generateObject("Pot", 500, 100));
        // this.game.addEntity(this.generateObject("Barrel", 200, 100));
        // this.game.addEntity(this.generateObject("Crate", 100, 300));
        // this.game.addEntity(this.generateObject("Pot", 100, 500));
        // this.game.addEntity(this.generateObject("Crate", 300, 500));
        // this.game.addEntity(this.generateObject("Barrel", 500, 500));
        // this.game.addEntity(this.generateObject("Crate", 500, 300));

        //find a better way to do this.
        this.game.addEntity(new Sign(this.game, 20, 20, 
            "KeyBoard Controls:      - Move using WASD              - Attack using left click " +                
            "                    - Right click on item 1 to use close Range AOE                   - Switch weapons using 1 and 2 (Sword is 1 and Bow is 2)" + 
            "                - To roll press shift (Will give invincibility frames          - Press e to place bomb down" +
            "                    - Right click on bow item to use long-ranged AOE"));

        this.game.addEntity(new Sign(this.game, 220, 20, 
            "KeyBoard Controls (cont):                  - Press f for Dark-bolt ability (will slow down enemies if hit and be in random places around character"));

        this.game.addEntity(new Sign(this.game, 420, 20, 
            "Cool Combos:                  - Slashing your arrow in mid air will double the arrow speed and damage                          " +
                "- Putting a bomb down, you can slash it towards enemies                      " + 
                "- Striking lightning down on dark-bolt will create an explosion that'll do ALOT of damage"));
        
      

        //this.game.addEntity(new GameMap(this.game));
        }
    }

    triggerDeathScreen() {
        this.deathScreen.trigger();
    }
    

    respawn() {
        this.deathScreen.respawn();
    }

    generateObject(object, x, y) {
        //random generator
        var pool = ["onecoin", "threecoin", "nothing"];
        console.log(object);

        if (object == "Barrel") {
            console.log("test");
            return new Barrel(this.game, x, y, pool[randomInt(pool.length)]);
        } else if (object == "Crate") {
            return new Crate(this.game, x, y, pool[randomInt(pool.length)]);
        } else {
            return new Pot(this.game, x, y, pool[randomInt(pool.length)]);    
        }
    }
    clearEntities() {
        this.game.entities.forEach(entity => {
            entity.removeFromWorld = true;
        });
    }

    update() {
        PARAMS.DEBUG = document.getElementById("debug").checked;
        //Midpoint of the canvas
        const midPointX = PARAMS.CANVAS_WIDTH / 2 ;
        const midPointY = PARAMS.CANVAS_HEIGHT / 2 ;
        if (!this.enableTitle) {
        //Update camera position to middle of the player
        this.x = this.adventurer.x - midPointX + (this.adventurer.bitSize * this.adventurer.scale)/2; //Removed + 20 here if we find a glitch.
        this.y = this.adventurer.y - midPointY + (this.adventurer.bitSize * this.adventurer.scale)/2; 
        }
        if (this.game.keys["p"]) {// && PARAMS.CHEATS
            this.game.addEntity(new ExperienceOrb(this.game, this.game.adventurer.x, this.game.adventurer.y));
            this.game.keys["p"] = false;
        }
        if (this.enableTitle) {
            if (this.game.leftClick) {
                this.enableTitle = false;
                this.loadTestLevel(true);
            }
            this.title.update();
            this.x += 1;
            this.y += 0.1;
            // this.game.addEntity(new GameMap(this.game));
        }
        
        if (this.shakeIntensity > 0) {
            this.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay; 
        }

       // this.waveManager.update();

       
    }

    /**
     * Method used to initialize shakeIntensity to shake the camera.
     */
    cameraShake(intensity) {
        this.shakeIntensity = intensity;
    }

    draw(ctx) {
        // Sort entities by entityOrder (lower values are drawn first)
        //this.game.entities.sort((a, b) => a.entityOrder - b.entityOrder);
    
        // Draw all entities
        // for (let entity of this.game.entities) {
        //     entity.draw(ctx);
        // }
    
        // Draw UI text
        if (this.enableTitle) {
            this.title.draw(ctx);
        } else if (!this.transition){
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            if (!this.game.adventurer.dead) {
                this.Hud.update();
                this.Hud.draw(ctx);
            }
            if(this.enableShop) {
                this.game.shopPause = true;
                // this.shop.
            }
            if (this.enableLevelShop) {
                this.game.shopPause = true;
                // this.enableLevelShop = false;
            }
        }   
    }
}
class Title {
    constructor(game) {
        this.game = game;
        this.elaspedTime = 0;
        this.changes = 0;
    }
    update() {
        this.elaspedTime += this.game.clockTick;
        if (this.elaspedTime > 2) this.elaspedTime = 0;
        if (this.elaspedTime >= 1) {
            this.changes -= 0.01;
        } else if (this.elaspedTime >= 0) {
            this.changes += 0.01;
        }
    }
    draw(ctx) {
        // ctx.fillStyle = rgba(0,0,0, 0.5);
        // ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        ctx.textAlign = "center"; 
        ctx.textBaseline = "top"; 
        ctx.fillStyle = "White";
        // ctx.strokeStyle = "Black";
        // ctx.lineWidth = 5;
        ctx.shadowColor = "Black";
        // ctx.lineWidth = 5;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = 10;
        ctx.font = 84 + 'px "Press Start 2P"';
        ctx.fillText("Holawrad",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 -200);
        // ctx.strokeText("Holawrad",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 -200);
        ctx.font = 16 + this.changes + 'px "Press Start 2P"';
        ctx.shadowOffsetY = 0;
        // ctx.lineWidth = 1;
        ctx.fillText("Click to Enter",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 250 + this.changes);
        // ctx.shadowBlur = 5;
        ctx.shadowBlur = 0;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic"; 
    }
}