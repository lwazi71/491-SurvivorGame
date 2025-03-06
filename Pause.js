class Pause {
    constructor(game) {
        Object.assign(this, {game});
        this.game.pauseMenu = this;
        this.button = {length: 150, height: 40};
        this.showSettings = false;
        this.confirmation = false;
        this.settings = new Settings(this.game);
        this.options = [
            {
                name: "Resume",
                game: this.game,
                action() {this.game.pause = false; }
            },
            {
                name: "Settings",
                game: this.game,
                action() {this.game.pauseMenu.showSettings = true; }
            },
            {
                name: "Quit",
                game: this.game,
                action() {console.log("you quit"); this.game.pauseMenu.confirmation = true;} //this.game.camera.title = true; this.game.pause = false; this.game.camera.clearEntities();
            }
            //window.location.reload();

        ];
        this.firstY = PARAMS.CANVAS_HEIGHT / 2;
        this.centerX = PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2;
    }
    update() {
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.click != null) {
            mouseX = this.game.click.x;
            mouseY = this.game.click.y;
        }
        this.firstY = PARAMS.CANVAS_HEIGHT / 2 - 50;
        this.options.forEach(choice => {
            if (this.game.isClicking(this.centerX, this.firstY, this.button.length, this.button.height) && 
            this.game.pause && this.game.leftClick && !this.confirmation && !this.showSettings) 
            {
                
                choice.action();
                this.game.click = {x:0, y:0};
                this.leftClick = false;
                mouseY = 0;
            }
            this.firstY += this.button.height + 10;
        });
        if (this.game.upgrade.checkExitButton(mouseX, mouseY) && this.showSettings) {
            this.showSettings = false;
            this.game.click = {x:0, y:0};
        }
        //Quit Prompt Yes
        if (this.game.isClicking(this.centerX, PARAMS.CANVAS_HEIGHT / 2, this.button.length, this.button.height) &&
        this.confirmation) 
        {
            // window.location.reload();
            //return to title
            this.game.click = {x:0, y:0};
            this.leftClick = false;
            this.game.pause = false;
            this.confirmation = false;
            this.game.camera.enableTitle = true;
            this.game.entities = [];
            this.game.camera.startWave = false;
            this.game.camera.adventurer = new Adventurer(this.game, 0, 0);
        }
        //Quit Prompt No
        if (this.game.isClicking(this.centerX, PARAMS.CANVAS_HEIGHT / 2 + this.button.height + 10, this.button.length, this.button.height) &&
        this.confirmation) 
        {
            this.confirmation = false;
        }

    }
    draw(ctx) {
        this.game.draw(ctx);
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        if (this.showSettings) {
            this.settings.update();
            this.settings.draw(ctx);
            this.game.upgrade.exitButton(ctx);
        } else if (this.confirmation) {
            this.drawConfirmation(ctx);
        } else {
            this.drawOptions(ctx);
        }
        ctx.lineWidth = 1;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";  
        
    }
    drawOptions(ctx) {
        ctx.beginPath();
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.strokeStyle = "Black";
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - 100, PARAMS.CANVAS_HEIGHT / 2 - 105, 200, 210, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "top"; 
        ctx.fillStyle = "White";
        ctx.fillText("Menu",PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 - 100 + 15);

        this.firstY = PARAMS.CANVAS_HEIGHT / 2 - 50;
        this.options.forEach(choice => {
            ctx.beginPath();
            if (this.game.isHovering(this.centerX, this.firstY, this.button.length, this.button.height)) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            ctx.roundRect(this.centerX, this.firstY, this.button.length, this.button.height, [10]);
            ctx.fill();
            ctx.stroke();
            
            ctx.strokeStyle = 'Black';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "White";
            ctx.font = '16px "Press Start 2P"';
            // ctx.font = 24 + 'px Lilita One';
            ctx.fillText(choice.name, PARAMS.CANVAS_WIDTH / 2, this.firstY + this.button.height / 2);
            this.firstY += this.button.height + 10;
        });
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "left"
    }
    drawConfirmation(ctx) {
        const length = 200;
        const height = 210;
        const centerX = PARAMS.CANVAS_WIDTH / 2;
        let centerY = PARAMS.CANVAS_HEIGHT / 2;
        ctx.beginPath();
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.strokeStyle = "Black";
        ctx.roundRect(centerX - length / 2, centerY - height / 2, length, height, [10]);
        ctx.fill();
        ctx.stroke();

        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = '16px "Press Start 2P"';
        // wrapText(ctx, text, x, y, maxWidth, lineHeight)
        ctx.fillStyle = "White";
        this.game.upgrade.wrapText(ctx, "Are you sure you want to quit?", 
            centerX, centerY - height / 2 + 10, 200, 15);
        //Yes
        ctx.beginPath();
        if (this.game.isHovering(this.centerX, centerY, this.button.length, this.button.height)) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.roundRect(this.centerX, centerY, this.button.length, this.button.height, [10]);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = 'Black';
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "White";
        ctx.font = '16px "Press Start 2P"';
        // ctx.font = 24 + 'px Lilita One';
        ctx.fillText("Yes", PARAMS.CANVAS_WIDTH / 2, centerY + this.button.height / 2);
        centerY += this.button.height + 10;
        // //No
        ctx.beginPath();
        if (this.game.isHovering(this.centerX, centerY, this.button.length, this.button.height)) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.roundRect(this.centerX, centerY, this.button.length, this.button.height, [10]);
        ctx.fill();
        ctx.stroke();
        
        ctx.strokeStyle = 'Black';
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "White";
        ctx.font = '16px "Press Start 2P"';
        // ctx.font = 24 + 'px Lilita One';
        ctx.fillText("No", PARAMS.CANVAS_WIDTH / 2, centerY + this.button.height / 2);
    }
}
class Settings {
    constructor(game) {
        this.game = game;
        this.game.settings = this;
        this.volumeSlider = {width: 150, height: 10, currVolume: 0.5};
        this.toggleMute = true;
        this.menuBuffer = 150;
        this.startY = this.menuBuffer + 50 //50 is buffer and 75 is border x value
        this.menuSpace = 200;
        this.currentMenu = "Volume";
        this.enableDebug = false;
        this.enableWeapons = false;
        this.enableInvincibility = false;
        this.enableHUD = true;
        this.enableLevelUpPause = true;
        this.button = {length: 150, height: 40};
        this.toggleButton = {length: 40, height: 40};
        this.options = [
            {
                name: "Volume",
                game: this.game,
                action() {this.game.settings.currentMenu = "Volume"}
            },
            {
                name: "Help",
                game: this.game,
                action() {this.game.settings.currentMenu = "Help"}
            },
            {
                name: "Other",
                game: this.game,
                action() {this.game.settings.currentMenu = "Other"}
            },
        ];
        this.updateCheats();
    }
    updateCheats() {
        this.cheats = [
            {
                name: "Debug",
                game: this.game,
                action() {this.game.settings.toggleDebug()},
                check: this.enableDebug
            },
            {
                name: "Unlock all Weapons",
                game: this.game,
                action() {this.game.settings.unlockWeapons()},
                check: this.enableWeapons
            },
            {
                name: "Toggle Invincibility",
                game: this.game,
                action() {this.game.settings.toggleInvincibility()},
                check: this.enableInvincibility
            },
            {
                name: "Disable HUD",
                game: this.game,
                action() {this.game.settings.toggleHud()},
                check: this.enableHUD
            },
            {
                name: "Enable Level Up Pause",
                game: this.game,
                action() {this.game.settings.toggleLevelUp()},
                check: this.enableLevelUpPause
            }
            
        ];
    }
    update() {
        this.updateMenuButtons();
        if (this.currentMenu == "Volume") this.updateVolumeMenu();
        // if (this.currentMenu == "Help") this.updateHelpMenu();
        if (this.currentMenu == "Other") this.updateOtherMenu();

    }
    updateVolumeMenu() {
        // this.menuBuffer = 200;
        //Make area slightly bigger for user errors
        if(this.game.isHovering((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 10, this.startY + 40,
            this.volumeSlider.width + 20, this.volumeSlider.height + 20) && this.game.leftClickHeld && this.currentMenu == "Volume") 
        {
            this.updateVolume();
        }
        //Vol Down
        if (this.game.isClicking((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 70, this.startY + 50, 40, 30) && this.currentMenu == "Volume") {
            this.volumeSlider.currVolume -= 0.1;
            this.game.leftClick = false;
        }
        //Vol Up
        if (this.game.isClicking((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 + this.volumeSlider.width / 2 + 20, this.startY + 50, 40, 30) && this.currentMenu == "Volume") {
            this.volumeSlider.currVolume += 0.1;
            this.game.leftClick = false;
        }
        //Mute
        if (this.game.isClicking((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 110, this.startY + 50, 40, 30) && this.currentMenu == "Volume") {
            if (this.toggleMute) {
                this.lastVolume = this.volumeSlider.currVolume;
                console.log(this.lastVolume);
                this.volumeSlider.currVolume = 0;
                this.toggleMute = false;
            } else {
                this.volumeSlider.currVolume = this.lastVolume;
                this.toggleMute = true;
            }

        }
        if (this.volumeSlider.currVolume < 0.015) this.volumeSlider.currVolume = 0;
        if (this.volumeSlider.currVolume > 0.99) this.volumeSlider.currVolume = 1;
    }
    updateVolume() {
        let volume = (Math.round(this.game.mouse.x) - ((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2)) / this.volumeSlider.width;
        this.volumeSlider.currVolume = volume;
    }
    updateMenuButtons() {
        let firstY = PARAMS.CANVAS_HEIGHT / 2 - this.button.height * 1.5 - 10;
        let buttonX = this.menuBuffer + (this.menuSpace - this.button.length) / 2;
        this.options.forEach(choice => {
            if (this.game.isClicking(buttonX, firstY, this.button.length, this.button.height)) {
                choice.action();
                console.log(this.currentMenu);
                this.game.leftClick = false;
            }
            firstY += this.button.height + 10;
        });
    }
    updateHelpMenu() {
    }
    updateOtherMenu() {
        this.updateCheats();
        let currentY = this.startY + 50;
        let centerX = this.menuBuffer + this.menuSpace + ((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - (this.menuBuffer + this.menuSpace)) / 2 - this.toggleButton.length;
        this.cheats.forEach(choice => {
            if (this.game.isClicking(centerX, currentY, this.toggleButton.length, this.toggleButton.height)) {
                choice.action();
                this.game.leftClick = false;
            }
            currentY += this.toggleButton.height + 10;
        });
    }
    draw(ctx) {
        this.drawBackgroundLayout(ctx);
        this.drawMenuButtons(ctx);
        if (this.currentMenu == "Volume") this.drawVolume(ctx);
        if (this.currentMenu == "Help") this.drawHelp(ctx);
        if (this.currentMenu == "Other") this.drawOther(ctx);
        ctx.lineWidth = 1;
    }
    drawBackgroundLayout(ctx) {
        //Setting background size
        ctx.lineWidth = 3;
        let length = PARAMS.CANVAS_WIDTH - this.menuBuffer * 2;
        let height = PARAMS.CANVAS_HEIGHT - this.menuBuffer * 2;
        ctx.beginPath();
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.strokeStyle = 'White';
        ctx.roundRect(this.menuBuffer, this.menuBuffer, length, height, [10]);
        ctx.fill();
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(this.menuSpace + this.menuBuffer, this.menuBuffer);
        ctx.lineTo(this.menuSpace + this.menuBuffer, PARAMS.CANVAS_HEIGHT - this.menuBuffer);
        ctx.strokeStyle = 'White';
        ctx.stroke();
        ctx.lineWidth = 1;

        // ctx.beginPath();
        // ctx.moveTo(0, PARAMS.CANVAS_HEIGHT / 2);
        // ctx.lineTo(PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT / 2);
        // ctx.strokeStyle = 'White';
        // ctx.stroke();
        // ctx.lineWidth = 1;
    }
    drawMenuButtons(ctx) {
        let firstY = PARAMS.CANVAS_HEIGHT / 2 - this.button.height * 1.5 - 10;
        let buttonX = this.menuBuffer + (this.menuSpace - this.button.length) / 2;
        this.options.forEach(choice => {
            ctx.beginPath();
            if (this.game.isHovering(buttonX, firstY, this.button.length, this.button.height) || this.currentMenu == choice.name) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            ctx.strokeStyle = "Black";
            if (this.currentMenu == choice.name) ctx.strokeStyle = "White";
            ctx.roundRect(buttonX, firstY, this.button.length, this.button.height, [10]);
            ctx.fill();
            ctx.stroke();
            
            ctx.strokeStyle = 'Black';
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "White";
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText(choice.name, buttonX + this.button.length / 2, firstY + this.button.height / 2);
            firstY += this.button.height + 10;
        });
    }
    drawVolume(ctx) {
        let currentY = this.startY;
        ctx.font = '28px "Press Start 2P"';
        ctx.fillStyle ="White";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Master Volume", (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2, currentY);

        currentY += 50;

        ctx.beginPath();
        ctx.fillStyle = "gray";
        ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2, currentY, 
            this.volumeSlider.width, this.volumeSlider.height, [5]);
        ctx.fill();
        if (this.volumeSlider.currVolume > 0.015) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2, currentY, 
                this.volumeSlider.width * this.volumeSlider.currVolume, this.volumeSlider.height, [5]);
            ctx.fill();
        }
        //Change the color
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 2;
        //Slider start X + length 7.5 is half of 15
        ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 + this.volumeSlider.width * this.volumeSlider.currVolume - 7.5, 
            currentY + this.volumeSlider.height / 2 - 7.5, 
            15, 15, [5]);
        ctx.fill();
        ctx.stroke();

        currentY -= 10; //I'm just lazy as it's to center the buttons to bar + 15 button height - 5 bar height
        ctx.beginPath();
        ctx.fillStyle = rgb(74, 74, 74);
        //Mute
        ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 110, currentY, 40, 30, [10]);
        //-
        ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 60, currentY, 40, 30, [10]);
        //+
        ctx.roundRect((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 + this.volumeSlider.width / 2 + 20, currentY, 40, 30, [10]);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "White";
        ctx.font = '12px "Press Start 2P"';
        ctx.fillText("-", (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 60 + 20, currentY + 15);
        ctx.fillText("+", (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 + this.volumeSlider.width / 2 + 20 + 20, currentY + 15);
        ctx.font = '20px "Press Start 2P"';
        let text = "🔊"
        if (!this.toggleMute) {
            text = "🔇";
        }
        ctx.fillText(text, (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.volumeSlider.width / 2 - 110 + 20, currentY + 11.5);
        ctx.textAlign = "left";
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText((this.volumeSlider.currVolume * 100).toFixed(0), (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 + this.volumeSlider.width / 2 + 20 + 40 + 10, currentY + 15);



        // if (this.game.isHovering(, , 50, 40)) {
        //     ctx.fillStyle = rgb(50, 50, 50);
        //     ctx.lineWidth = 3;
        // } else {
        //     ctx.fillStyle = rgb(74, 74, 74);
        //     ctx.lineWidth = 1;
        // }

    }
    drawHelp(ctx) {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = '12px "Press Start 2P"';
        const maxWidth = PARAMS.CANVAS_WIDTH - this.menuBuffer * 2 - this.menuSpace - 40;
        const lines = ["Controls:", "- Move using WASD", "- Attack using left click ",
            "- Switch weapons using 1 and 2 (Sword is", "  1 and Bow is 2)",
            "- To roll press shift (Will give", "  invincibility frames",                  
            "- When Sword Magic is unlocked, Right", "  click on item 1 to use close Ranged AOE",
            "- When Bow Magic is unlocked, Right click", "  on bow item to use long-ranged AOE",
            "- When Bomb is unlocked, Press E to place", "  bomb down",
            "- When Dark-bolt is unlocked, Press f for", "  Dark-bolt ability (will slow down",
             "  enemies if hit and be in random places", "  around the character"];
        // const lines = wrapText(ctx, text, maxWidth);
        let currentY = this.menuBuffer + 39 / 2;
        //PARAMS.CANVAS_HEIGHT - this.menuBuffer * 2 - 18 * 20 / 4?
        for (let line of lines) {
            ctx.fillText(line, (this.menuBuffer + this.menuSpace) + 10, currentY);
            currentY += 25;
        }
        
    }
    drawOther(ctx) {
        let currentY = this.startY;
        ctx.font = '28px "Press Start 2P"';
        ctx.fillStyle ="White";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Other Settings", (PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - this.toggleButton.length / 2, currentY);
        currentY += 50;
        let centerX = this.menuBuffer + this.menuSpace + ((PARAMS.CANVAS_WIDTH + this.menuSpace) / 2 - (this.menuBuffer + this.menuSpace)) / 2 - this.toggleButton.length;
        this.cheats.forEach(choice => {
            ctx.beginPath();
            if (this.game.isHovering(centerX, currentY, this.toggleButton.length, this.toggleButton.height)) {
                ctx.strokeStyle = "White";
                    ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = "Black";
                ctx.lineWidth = 1;
            }
            (choice.check) ? ctx.fillStyle = rgb(0, 150, 0) : ctx.fillStyle = rgb(150, 0, 0);
            ctx.roundRect(centerX, currentY, this.toggleButton.length, this.toggleButton.height, [10]);
            ctx.fill();
            ctx.stroke();
            
            ctx.strokeStyle = 'Black';
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillStyle = "White";
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(choice.name, centerX + this.toggleButton.length + 10, currentY + this.toggleButton.height / 2);
            currentY += this.toggleButton.height + 10;
        });
    }
    toggleDebug() {
        this.enableDebug = !this.enableDebug;
        PARAMS.DEBUG = this.enableDebug;
    }
    unlockWeapons() {
        this.enableWeapons = !this.enableWeapons;
        PARAMS.CHEATS = this.enableWeapons;
    }
    toggleInvincibility() {
        this.enableInvincibility = !this.enableInvincibility;
    }
    toggleHud() {
        this.enableHUD = !this.enableHUD;
    }
    toggleLevelUp() {
        this.enableLevelUpPause = !this.enableLevelUpPause;
    }
}