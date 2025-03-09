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
        this.shop = new ChestItems(this.game);
        this.levelShop = new LevelShop(this.game);
        new Pause(this.game);
        this.title = new Title(this.game);
        this.enableChest = false;
        this.enableLevelShop = false;

        this.enableTitle = false; //Whether title screen shows up or not

        this.shakeIntensity = 0;
        this.shakeDecay = 0.9; 


        // Add the Game Map first so it's always underneath everything

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
            ASSET_MANAGER.adjustVolume(this.game.settings.currVolume);
            ASSET_MANAGER.playAsset("./Audio/Music/Survivorio Clone Battle Song (1).wav");
        var adventurer = false;
        if(!adventurer) this.game.addEntity(this.adventurer);
        this.Hud = new Hud(this.game, this.adventurer);
        this.upgrade = new UpgradeSystem(this.game);
        this.deathScreen = new DeathScreen(this.game);
        this.startWave = true;        
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
        // this.game.addEntity(new Necromancer(this.game, 42, 400));
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
         this.game.addEntity(new GolemMech(this.game, 200, 200));



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
        // PARAMS.DEBUG = document.getElementById("debug").checked;
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
            this.x += 1;
            this.y += 0.1;
        }
        
        if (this.shakeIntensity > 0) {
            this.x += (Math.random() - 0.5) * this.shakeIntensity;
            this.y += (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay; 
        }
        if (this.startWave) this.waveManager.update();

       
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
            this.title.update(ctx);
            this.title.draw(ctx);
        } else if (!this.transition){
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            if (!this.game.adventurer.dead && this.game.settings.enableHUD) {
                this.Hud.update(); //Comment out both when demoing
                this.Hud.draw(ctx);
            }
            if(this.enableChest) {
                this.game.shopPause = true;
                // this.shop.
            }
            if (this.enableLevelShop) {
                this.game.shopPause = true;
                // this.enableLevelShop = false;
            }
            // if (this.startWave) this.waveManager.draw(ctx);
        }   
    }
}
class Title {
    constructor(game) {
        this.game = game;
        this.settings = this.game.pauseMenu.settings;
        this.showSettings = false;
        this.elapsedTime = 0;
        this.changes = 0;
        this.titleEffect = 0.00;
        this.titleEffectTimer = 0;
        this.slashAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Slash/red-slash.png"), 128, 0, 128, 128, 3, 0.15, false, false);
        this.button = {length: 200, height: 60};
        this.background = new GameMap(this.game); //Will add to title when we get other maps
        this.options = [
            {
                name: "Start",
                game: this.game,
                action() {this.game.camera.enableTitle = false;
                        this.game.camera.loadTestLevel(true);}
            },
            {
                name: "Settings",
                game: this.game,
                action() {this.game.camera.title.showSettings = true;
                }
            },
            {
                name: "Quit",
                game: this.game,
                action() {window.close()}
            }
        ];

    }
    update(ctx) {
        this.elapsedTime += this.game.clockTick;
        this.titleEffectTimer += this.game.clockTick;
        //In settings
        if (this.game.upgrade.checkExitButton(this.game.click.x, this.game.click.y) && this.showSettings) {
            this.showSettings = false;
        }

        
        if(!this.showSettings) {
            //Timers for title screen
            if (this.titleEffectTimer > 5) this.titleEffect += 0.015;
            if (this.titleEffect >= 1.4) {
                this.titleEffect = 0; 
                this.titleEffectTimer = 0;
                this.slashAnimation.elapsedTime = 0;
            }
            if (this.elapsedTime > 2) this.elapsedTime = 0;
            if (this.elapsedTime >= 1) {
                this.changes -= 0.01;
            } else if (this.elapsedTime >= 0) {
                this.changes += 0.01;
            }

            //Button clicks
            let firstY = PARAMS.CANVAS_HEIGHT / 2 - this.button.height / 2 + 50;
            // let buttonX = PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2;
            this.options.forEach(choice => {
                ctx.font = '32px "Press Start 2P"';
                if (this.game.isClicking(PARAMS.CANVAS_WIDTH / 2 - ctx.measureText(choice.name).width / 2, firstY, 
                ctx.measureText(choice.name).width, this.button.height) && this.game.leftClick) {
                    choice.action();
                    this.game.leftClick = false;
                }
                firstY += this.button.height + 10;
            });
        }
    }
    draw(ctx) {
        this.background.draw(ctx);
        ctx.fillStyle = rgba(0,0,0, 0.25);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        if (this.showSettings) {
            this.settings.update();
            this.settings.draw(ctx);
            this.game.upgrade.exitButton(ctx);
        } else {
            this.drawTitle(ctx);
            this.drawButtons(ctx);
            // ctx.strokeText("Holawrad",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 -200);
        }
    }
    drawTitle(ctx) {
        ctx.textAlign = "center"; 
        ctx.textBaseline = "top"; 
        // ctx.strokeStyle = "Black";
        // ctx.lineWidth = 5;
        ctx.shadowColor = "Black";
        // ctx.lineWidth = 5;
        let titleFont = 84 + 'px "Press Start 2P"';
        ctx.font = titleFont
        ctx.fillStyle = "Black";
        ctx.shadowBlur = 10;
        for (let i = 1; i <= 15; i++) {
            ctx.fillText("Holawrad",PARAMS.CANVAS_WIDTH / 2 + i / 2, PARAMS.CANVAS_HEIGHT / 2 - 200 + i);
        }
        ctx.shadowOffsetY = 20;
        ctx.shadowOffsetX = 10;
        let textLength = ctx.measureText("Holawrad").width;
        let gradient = ctx.createLinearGradient(PARAMS.CANVAS_WIDTH / 2 - textLength / 2, PARAMS.CANVAS_HEIGHT / 2 - 250, 
            PARAMS.CANVAS_WIDTH / 2 + textLength / 2, PARAMS.CANVAS_HEIGHT / 2 - 150);


        //Need to make it so it resets when first is at 1
        let location = this.titleEffect;
        if (location - 0.6 < 0) location = 0.6;
        gradient.addColorStop(location - 0.6, "White");

        location = this.titleEffect;
        if (location - 0.3 < 0) location = 0.3;
        if (location - 0.3 > 1) location = 1.3;
        gradient.addColorStop(location - 0.3, rgb(215, 198, 198));

        location = this.titleEffect;
        if (location > 1) location = 1;
        gradient.addColorStop(location, "White");

        this.titleEffectTimer < 5 ? ctx.fillStyle = "White" : ctx.fillStyle = gradient;
        ctx.fillText("Holawrad",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 -200);
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;

        ctx.lineWidth = 1;
        ctx.strokeStyle = rgb(47, 47, 47);
        ctx.font = titleFont;
        ctx.strokeText("Holawrad",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 -200);
        ctx.lineWidth = 1;
        // console.log(this.titleEffectTimer);
        // if (this.titleEffectTimer > 2) {
        //     ctx.save();
        //     // ctx.translate(PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
        //     // ctx.rotate(90);
        //     // this.slashAnimation.drawFrame(this.game.clockTick, ctx, -(PARAMS.CANVAS_WIDTH / 2) + 200, -(PARAMS.CANVAS_HEIGHT / 2) + 300, 3);            
        //     // ctx.rotate(45);
        //     // this.slashAnimation.drawFrame(this.game.clockTick, ctx, 400, -900, 4);
        //     ctx.restore();
        // }
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }
    drawFlashingText(ctx) {
        ctx.font = 16 + this.changes + 'px "Press Start 2P"';
        // ctx.lineWidth = 1;
        ctx.fillStyle = "White";
        ctx.fillText("Click to Enter",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 250 + this.changes);
        // ctx.shadowBlur = 5;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic"; 
    }
    drawButtons(ctx) {
        // ctx.fillStyle = "Gray";
        // ctx.beginPath();
        // ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2, PARAMS.CANVAS_HEIGHT / 2 - this.button.height / 2 + 50, 
        //     this.button.length, this.button.height, [10]);
        // ctx.strokeStyle = "Black";
        // ctx.fill();
        // ctx.stroke();


        ctx.font = 24 + 'px "Press Start 2P"';
        ctx.fillStyle = "White";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        // ctx.fillText("Start",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 50 );
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic"; 

        let firstY = PARAMS.CANVAS_HEIGHT / 2 - this.button.height / 2 + 50;
        let buttonX = PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2;
        this.options.forEach(choice => {
            // ctx.beginPath();
            // if (this.game.isHovering(buttonX, firstY, this.button.length, this.button.height)) {
            //     ctx.fillStyle = rgb(50, 50, 50);
            //     ctx.lineWidth = 3;
            // } else {
            //     ctx.fillStyle = rgb(74, 74, 74);
            //     ctx.lineWidth = 1;
            // }
            // ctx.strokeStyle = "Black";
            // if (this.currentMenu == choice.name) ctx.strokeStyle = "White";
            // ctx.roundRect(buttonX, firstY, this.button.length, this.button.height, [10]);
            // ctx.fill();
            // ctx.stroke();
            
            ctx.strokeStyle = 'Black';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "White";
            ctx.font = '32px "Press Start 2P"';
            // console.log(ctx.measureText(choice.name).width);
            let fontSize = 32;
            ctx.lineWidth = 3;
            if (this.game.isHovering(PARAMS.CANVAS_WIDTH / 2 - ctx.measureText(choice.name).width / 2, firstY, 
            ctx.measureText(choice.name).width, this.button.height)) {
                fontSize = 40;
                ctx.lineWidth = 5;
            }
            ctx.strokeStyle = "Black";
            ctx.font = fontSize + 'px "Press Start 2P"';
            ctx.strokeText(choice.name, buttonX + this.button.length / 2, firstY + this.button.height / 2);
            ctx.fillText(choice.name, buttonX + this.button.length / 2, firstY + this.button.height / 2);
            firstY += this.button.height + 10;
        });
    }
}