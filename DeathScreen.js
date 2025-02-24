class DeathScreen {
    constructor(game) {
        this.game = game;
        this.game.deathScreen = this;
        this.visible = false; // Start hidden
        this.entityOrder = 500; //Put it over everything everything
        this.spotlight = ASSET_MANAGER.getAsset("./Sprites/Objects/spotlight.png");  //Spotlight over dead player
        this.brokeheart = ASSET_MANAGER.getAsset("./Sprites/Objects/brokenheart.png");  //broken heart over dead player

        this.buttonWidth = 360;
        this.buttonHeight = 60;
        this.centerButtonX = PARAMS.CANVAS_WIDTH / 2 - this.buttonWidth / 2;
        this.centerButtonY = PARAMS.CANVAS_HEIGHT / 2  + 250;
        this.respawnBefore = false; //makes sure player can respawn one time

        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");

        this.hoverStates = {
            restart: false,
            respawn: false,
            stats: false
        };

           // Initialize eyes
        this.eyes = [];
        this.initializeEyes();

    }

    initializeEyes() {
        // Create 20 pairs of eyes
        for (let i = 0; i < 20; i++) {
            // Random position for each pair of eyes
            const x = Math.random() * PARAMS.CANVAS_WIDTH;
            const y = Math.random() * PARAMS.CANVAS_HEIGHT;
            
            // Random blink timing
            const blinkInterval = 2000 + Math.random() * 3000; // Between 2-5 seconds
            const lastBlink = Date.now() + Math.random() * 5000; // Stagger initial blinks
            
            this.eyes.push({
                x,
                y,
                radius: 3 + Math.random() * 2, // Random size between 3-5 pixels
                spacing: 10 + Math.random() * 5, // Random spacing between eyes in a pair
                blinkInterval,
                lastBlink,
                isBlinking: false,
                opacity: 0.6 + Math.random() * 0.4 // Random opacity between 0.6-1
            });
        }
    }

    updateEyes() {
        const currentTime = Date.now();
        this.eyes.forEach(eye => {
            //check if it's time to blink
            if (currentTime - eye.lastBlink > eye.blinkInterval) {
                eye.isBlinking = true;
                eye.lastBlink = currentTime;
                
                //reset blink after 150ms
                setTimeout(() => {
                    eye.isBlinking = false;
                }, 150);
            }
        });
    }

    drawEyes(ctx) {
        this.eyes.forEach(eye => {
            if (!eye.isBlinking) {
                // Draw left eye
                ctx.beginPath();
                ctx.arc(eye.x, eye.y, eye.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, ${eye.opacity})`;
                ctx.fill();

                // Draw right eye
                ctx.beginPath();
                ctx.arc(eye.x + eye.spacing, eye.y, eye.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, ${eye.opacity})`;
                ctx.fill();
            }
        });
    }

    trigger() {
        this.visible = true;
    }

    // Check if a point is inside a button
    isInsideButton(x, y, buttonY) {
            return x >= this.centerButtonX - 10 &&
                   x <= this.centerButtonX - 10 + this.buttonWidth + 25 &&
                   y >= buttonY &&
                   y <= buttonY + this.buttonHeight;
    }

    update() {
        this.canRespawn = this.game.adventurer.coins >= 350 && !this.respawnBefore;
        
        if (this.visible) {
            this.updateEyes(); //update the eyes to blink

            // update hover
            const mouseX = this.game.mouse ? this.game.mouse.x : 0;
            const mouseY = this.game.mouse ? this.game.mouse.y : 0;

            this.hoverStates.restart = this.isInsideButton(mouseX, mouseY, this.centerButtonY - 42);
            this.hoverStates.respawn = this.isInsideButton(mouseX, mouseY, this.centerButtonY + 40);
            this.hoverStates.stats = this.isInsideButton(mouseX, mouseY, this.centerButtonY + 120);

            //handle clicks
            if (this.game.leftClick) {
                const clickX = this.game.click.x;
                const clickY = this.game.click.y;

                if (this.isInsideButton(clickX, clickY, this.centerButtonY - 42)) {
                    console.log("Restart clicked");
                    this.restartGame();
                }
                
                if (this.isInsideButton(clickX, clickY, this.centerButtonY + 40)) {
                    if (this.canRespawn) {
                        console.log("Respawn clicked");
                        this.game.adventurer.respawnHere();
                    }
                }

                if (this.isInsideButton(clickX, clickY, this.centerButtonY + 120)) {
                    console.log("Stats clicked");
                    //open player stats here
                }

                this.game.leftClick = false;
            }
        }
    }

    respawn() {
      //  this.removeFromWorld = true;
        this.respawnBefore = true;
        this.visible = false;
    }

    draw(ctx) {
        if (!this.visible) return;

        // Background overlay
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);

        this.drawEyes(ctx); //draw the eyes in the background


        //"You Died" text
        ctx.drawImage(this.spotlight, 0, 293, 1200, 1200, PARAMS.CANVAS_WIDTH / 2 - 500, 0, 1000, 1000);
       // ctx.drawImage(this.brokeheart, 0, 0, 590, 500, PARAMS.CANVAS_WIDTH / 2 - 23, PARAMS.CANVAS_HEIGHT / 2, 35, 35);
        ctx.drawImage(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 192, 224, 32, 32, PARAMS.CANVAS_WIDTH / 2 - 100, PARAMS.CANVAS_HEIGHT / 2, 150, 150);

        ctx.fillStyle = "red";
        ctx.font = '50px "Press Start 2P"';
        ctx.fillText("YOU DIED", PARAMS.CANVAS_WIDTH / 2 - 205, PARAMS.CANVAS_HEIGHT / 2 - 260);

        //restart Button
        ctx.fillStyle = this.hoverStates.restart ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
        ctx.beginPath();
        ctx.roundRect(this.centerButtonX - 10, this.centerButtonY - 42, this.buttonWidth + 25, this.buttonHeight, [10]);
        ctx.strokeStyle = "Black";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.hoverStates.restart ? 'rgb(246, 8, 8)' : 'rgb(108, 19, 19)';
        ctx.font = '30px "Press Start 2P"';
        let textWidthRestart = ctx.measureText("Restart").width;
        let textXRestart = this.centerButtonX + (this.buttonWidth - textWidthRestart) / 2 + 7;
        let textYRestart = this.centerButtonY - 42 + this.buttonHeight / 2 + 18;
        ctx.fillText("Restart", textXRestart, textYRestart);

        //respawn Button
        ctx.fillStyle = this.hoverStates.respawn ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
        ctx.beginPath();
        ctx.roundRect(this.centerButtonX - 10, this.centerButtonY + 40, this.buttonWidth + 25, this.buttonHeight, [10]);
        ctx.strokeStyle = "Black";
        ctx.fill();
        ctx.stroke();

        let gradient = ctx.createLinearGradient(this.centerButtonX, this.centerButtonY, this.centerButtonX + this.buttonWidth, this.centerButtonY);
        gradient.addColorStop(0, this.hoverStates.respawn ? "#ff4040" : "red");
        gradient.addColorStop(0.16, this.hoverStates.respawn ? "#ffa500" : "orange");
        gradient.addColorStop(0.32, this.hoverStates.respawn ? "#ffff40" : "yellow");
        gradient.addColorStop(0.48, this.hoverStates.respawn ? "#40ff40" : "green");
        gradient.addColorStop(0.64, this.hoverStates.respawn ? "#4040ff" : "blue");
        gradient.addColorStop(0.8, this.hoverStates.respawn ? "#4b0082" : "indigo");
        gradient.addColorStop(1, this.hoverStates.respawn ? "#ee82ee" : "violet");

        if (this.canRespawn) {
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = this.hoverStates.respawn ? "lightgray" : "gray";
        }

        let textWidthRespawn = ctx.measureText("Respawn").width;
        let textXRespawn = this.centerButtonX + (this.buttonWidth - textWidthRespawn) / 2 + 7;
        let textYRespawn = this.centerButtonY - 42 + this.buttonHeight / 2 + 100;
        ctx.fillText("  Respawn", textXRespawn, textYRespawn);

        // Stats Button
        ctx.fillStyle = this.hoverStates.stats ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
        ctx.beginPath();
        ctx.roundRect(this.centerButtonX - 10, this.centerButtonY + 120, this.buttonWidth + 25, this.buttonHeight, [10]);
        ctx.strokeStyle = "Black";
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.hoverStates.stats ? 'rgb(0, 255, 242)' : 'rgb(15, 184, 175)';
        let textWidthStats = ctx.measureText("Player Stats").width;
        let textXStats = this.centerButtonX + (this.buttonWidth - textWidthStats) / 2 + 7;
        let textYStats = this.centerButtonY - 42 + this.buttonHeight / 2 + 180;
        ctx.fillText("Player Stats", textXStats, textYStats);

        // Draw coin count for respawn
        ctx.drawImage(this.coinImage, 
            10, 140, 
            14, 14, 
            this.centerButtonX + this.buttonWidth / 2 - 200, this.centerButtonY + this.buttonHeight / 2 + 20, 
            14 * 4, 14 * 4
        );

        if (this.canRespawn) {
            ctx.fillStyle = this.hoverStates.respawn ? 'rgb(255, 255, 255)' : 'rgb(245, 245, 245)';
        } else {
            ctx.fillStyle = this.hoverStates.respawn ? "lightgray" : "gray";
        }
        let coinWidth = ctx.measureText("350").width;
        let coinX = this.centerButtonX + (this.buttonWidth - coinWidth) / 2 - 100;
        let coinY = this.centerButtonY - 42 + this.buttonHeight / 2 + 100;
        ctx.fillText("350", coinX, coinY);

    }

    restartGame() {
        // this.visible = false;
        // this.game.entities = []; // Clear all entities

        // // Reload the player and the scene
        // new SceneManager(this.game);
        // // this.game.addEntity(sceneManager);
    }

    quitGame() {
        console.log("Quit game! Implement main menu logic here.");
        // Implement logic to return to main menu or exit
    }
}