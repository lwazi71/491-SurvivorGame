class WinScreen {
    constructor(game) {
        this.game = game;
        this.game.winScreen = this;
        // this.player = new PlayerStatus(game, this.game.upgrade);
        this.player = this.game.upgrade.player;
        this.visible = false; // Start hidden
        this.entityOrder = 500; //Put it over everything everything
        this.stars = ASSET_MANAGER.getAsset("./Sprites/HudIcons/stars.png");

        this.elapsedTime = 0;

        this.buttonWidth = 320;
        this.buttonHeight = 60;
        this.centerButtonX = PARAMS.CANVAS_WIDTH / 2 - this.buttonWidth / 2;
        this.centerButtonY = PARAMS.CANVAS_HEIGHT / 2  + 100;
        this.respawnBefore = false; //makes sure player can respawn one time

        this.rotationAngle = 0.5; // For adventurer sprite rotation;
        this.rotationSpeed = 0.03; // Add this line - controls how fast it rotates

        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.showUpgrade = false;

        this.hoverStates = {
            restart: false,
            continue: false,
            stats: false
        };

    }

    trigger() {
        this.visible = true;
    }

    // Check if a point is inside a button
    isInsideButton(x, y, buttonY) {
            return x >= this.centerButtonX &&
                   x <= this.centerButtonX + this.buttonWidth &&
                   y >= buttonY &&
                   y <= buttonY + this.buttonHeight && !this.showUpgrade;
    }

    update() {
        this.player = this.game.upgrade.player; // Just in case it doesn't update
        if (this.showUpgrade) this.player.update();
        (this.canRespawn) ? this.elapsedTime += 0.01 : this.elapsedTime = 0;
        this.canRespawn = this.game.adventurer.coins >= 1;

        this.rotationAngle += this.rotationSpeed;
        
        if (this.visible) {
            // update hover
            const mouseX = this.game.mouse ? this.game.mouse.x : 0;
            const mouseY = this.game.mouse ? this.game.mouse.y : 0;

            this.hoverStates.continue = this.isInsideButton(mouseX, mouseY, this.centerButtonY);
            this.hoverStates.stats = this.isInsideButton(mouseX, mouseY, this.centerButtonY + this.buttonHeight + 20);
            this.hoverStates.restart = this.isInsideButton(mouseX, mouseY, this.centerButtonY + this.buttonHeight * 2 + 20 * 2);

            //handle clicks
            if (this.game.leftClick) {
                const clickX = this.game.click.x;
                const clickY = this.game.click.y;
                
                if (this.isInsideButton(clickX, clickY, this.centerButtonY)) {
                    if (this.canRespawn) {
                        console.log("Respawn clicked");
                        this.continue();
                    }
                }

                if (this.isInsideButton(clickX, clickY, this.centerButtonY + 20 + this.buttonHeight)) {
                    console.log("Stats clicked");
                    this.showUpgrade = true;
                    //open player stats here
                }

                if (this.isInsideButton(clickX, clickY, this.centerButtonY + 40 + this.buttonHeight * 2)) {
                    console.log("Restart clicked");
                    this.restartGame();
                }

                this.game.leftClick = false;
            }
        }
    }

    continue() {
      //  this.removeFromWorld = true;
        // this.respawnBefore = true;
        this.game.toggleDeathPause();
        this.visible = false;
        this.game.camera.loadLevel(this.game.camera.currMap += 1, true);
    }

    draw(ctx) {
        if (!this.visible) return;
        if (this.showUpgrade) {
            // this.player.update();
            this.player.draw(ctx);
            this.game.upgrade.exitButton(ctx);
        } else {
            // Background overlay
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);

            //Alignment line
            // ctx.beginPath();
            // ctx.strokeStyle = "White";
            // ctx.moveTo(PARAMS.CANVAS_WIDTH / 2 , 0);
            // ctx.lineTo(PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT);
            // ctx.stroke();

        // ctx.drawImage(this.brokeheart, 0, 0, 590, 500, PARAMS.CANVAS_WIDTH / 2 - 23, PARAMS.CANVAS_HEIGHT / 2, 35, 35);
            ctx.drawImage(this.stars, 0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
            const spriteWidth = 32;
            const spriteHeight = 32;
            const scale = 2.8;
            const centerX = PARAMS.CANVAS_WIDTH / 2;
            const centerY = PARAMS.CANVAS_HEIGHT / 2 - 75;
            // Calculate orbit parameters
            const orbitRadius = 60; // Distance from center point
            const spriteX = centerX + Math.cos(this.rotationAngle) * orbitRadius;
            const spriteY = centerY + Math.sin(this.rotationAngle) * orbitRadius;
            
            // Save the current context state
            ctx.save();
            
            // Move to the position where we want to draw the sprite
            ctx.translate(spriteX, spriteY);
            
            // Rotate the sprite to always face the center (optional)
            ctx.rotate(this.rotationAngle + Math.PI / 2); // Add PI/2 to adjust initial orientation
            
            // Draw the sprite centered on the rotation point
            ctx.drawImage(
                ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 
                96, 192, // Source x, y
                spriteWidth, spriteHeight, // Source width, height
                -spriteWidth * scale / 2, -spriteHeight * scale / 2, // Destination x, y (centered)
                spriteWidth * scale, spriteHeight * scale // Destination width, height
            );
            
            // Restore the context to its original state
            ctx.restore();
                

            ctx.textBaseline = "top";
            ctx.textAlign = "center";

            ctx.fillStyle = "yellow";
            ctx.font = '50px "Press Start 2P"';
            ctx.fillText("YOU WIN", PARAMS.CANVAS_WIDTH / 2, 75);
            let buttonY = this.centerButtonY;

            ctx.textBaseline = "middle";
            const center = PARAMS.CANVAS_WIDTH / 2;

            ctx.font = 24 + 'px "Press Start 2P"';
            //respawn Button
            ctx.fillStyle = this.hoverStates.continue ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
            ctx.beginPath();
            ctx.roundRect(this.centerButtonX, buttonY, this.buttonWidth, this.buttonHeight, [10]);
            ctx.strokeStyle = "Black";
            ctx.fill();
            ctx.stroke();

            let gradient = ctx.createLinearGradient(this.centerButtonX, this.centerButtonY, this.centerButtonX + this.buttonWidth, this.centerButtonY);
            // console.log(this.elapsedTime + 0.8 % 1)
            gradient.addColorStop(this.elapsedTime % 1, this.hoverStates.continue ? "#ff4040" : "red");
            gradient.addColorStop((this.elapsedTime + 0.16) % 1, this.hoverStates.continue ? "#ffa500" : "orange");
            gradient.addColorStop((this.elapsedTime + 0.32) % 1, this.hoverStates.continue ? "#ffff40" : "yellow");
            gradient.addColorStop((this.elapsedTime + 0.48) % 1, this.hoverStates.continue ? "#40ff40" : "green");
            gradient.addColorStop((this.elapsedTime + 0.64) % 1, this.hoverStates.continue ? "#4040ff" : "blue");
            gradient.addColorStop((this.elapsedTime + 0.8) % 1, this.hoverStates.continue ? "#4b0082" : "indigo");
            gradient.addColorStop((this.elapsedTime + 1) % 1, this.hoverStates.continue ? "#ee82ee" : "violet");

            if (this.canRespawn) {
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = this.hoverStates.continue ? "lightgray" : "gray";
            }

            // let textWidthRespawn = ctx.measureText("Respawn").width;
            // let textXRespawn = this.centerButtonX + (this.buttonWidth - textWidthRespawn) / 2 + 7;
            // let textYRespawn = this.centerButtonY - 42 + this.buttonHeight / 2 + 100;
            ctx.textBaseline = "top";
            ctx.fillText("CONTINUE?!", center, buttonY + 7.5);

            // Draw coin count for respawn
            ctx.font = 14 + 'px "Press Start 2P"';
            let coinWidth = ctx.measureText("1").width + 20;
            let coinScale = 3;
            
            ctx.drawImage(this.coinImage, 
                14, 143, 
                5, 5, 
                center - (5 * coinScale) / 2 - coinWidth / 2, buttonY - (5 * coinScale) + this.buttonHeight - 7.5 , 
                (5 * coinScale), (5 * coinScale)
            );
            if (this.canRespawn) {
                ctx.fillStyle = this.hoverStates.continue ? 'rgb(255, 255, 255)' : 'rgb(245, 245, 245)';
            } else {
                if (this.game.adventurer.coins < 350) {
                    ctx.fillStyle = "Red";
                } else {
                    ctx.fillStyle = this.hoverStates.continue ? "lightgray" : "gray";
                }
            }
            ctx.textAlign = "left";
            // let coinX = this.centerButtonX + (this.buttonWidth - coinWidth) / 2 - 100;
            // let coinY = this.centerButtonY - 42 + this.buttonHeight / 2 + 100;
            ctx.textBaseline = "middle";
            ctx.fillText("1", center - coinWidth / 2 + (5 * coinScale), buttonY - (5 * coinScale) / 2 + this.buttonHeight - 7.5);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = 24 + 'px "Press Start 2P"';

            buttonY += this.buttonHeight + 20;

            // Stats Button
            ctx.fillStyle = this.hoverStates.stats ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
            ctx.beginPath();
            ctx.roundRect(this.centerButtonX, buttonY, this.buttonWidth, this.buttonHeight, [10]);
            ctx.strokeStyle = "Black";
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.hoverStates.stats ? 'rgb(0, 255, 242)' : 'rgb(15, 184, 175)';
            // let textWidthStats = ctx.measureText("Player Stats").width;
            // let textXStats = this.centerButtonX + (this.buttonWidth - textWidthStats) / 2 + 7;
            // let textYStats = this.centerButtonY - 42 + this.buttonHeight / 2 + 180;
            ctx.fillText("Your Stats", center, buttonY + this.buttonHeight / 2);

            buttonY += this.buttonHeight + 20;

            //restart Button
            ctx.fillStyle = this.hoverStates.restart ? 'rgb(58, 58, 58)' : 'rgb(38, 38, 38)';
            ctx.beginPath();
            ctx.roundRect(this.centerButtonX, buttonY, this.buttonWidth, this.buttonHeight, [10]);
            ctx.strokeStyle = "Black";
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = this.hoverStates.restart ? 'rgb(0, 231, 16)' : 'rgb(3, 100, 0)';
            // let textWidthRestart = ctx.measureText("Restart").width;
            // let textXRestart = this.centerButtonX + (this.buttonWidth - textWidthRestart) / 2 + 7;
            // let textYRestart = this.centerButtonY - 42 + this.buttonHeight / 2 + 18;
            ctx.fillText("Play Again?", center, buttonY + this.buttonHeight / 2);

        }
    }

    restartGame() {
        this.visible = false;
        this.game.camera.enableTitle = true;
        this.game.camera.oneTime = true;
        this.game.entities = [];
        this.game.deathPause = false;
        this.game.camera.startWave = false;
        ASSET_MANAGER.pauseMusic();
        this.game.camera.adventurer = new Adventurer(this.game, 0, 0);
        // this.visible = false;
        // this.game.entities = []; // Clear all entities

        // // Reload the player and the scene
        new SceneManager(this.game);
        // // this.game.addEntity(sceneManager);
    }

    quitGame() {
        console.log("Quit game! Implement main menu logic here.");
        // Implement logic to return to main menu or exit
    }
}