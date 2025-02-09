class UpgradeSystem {
    constructor(game) {
        Object.assign(this, {game});
        this.points = 0;
        this.game.upgrade = this;

        this.buttonWidth = 100;
        this.buttonHeight = 40;
        this.centerButtonX = PARAMS.CANVAS_WIDTH / 2 - this.buttonWidth / 2;
        this.centerButtonY = PARAMS.CANVAS_HEIGHT / 2  + 250;

        this.swordUpgradeCount = 0;
        this.bowUpgradeCount = 0;
        this.otherUpgradeCount = 0;
        this.totalUpgradeCount = 0;

        this.noUpgrades1 = false;
        this.noUpgrades2 = false;
        this.noUpgrades3 = false;
        this.noUpgrades = false;

        this.attackIncreaseAmount = 5;
        this.attackSpeedIncreaseAmount = 0.1;
        this.hpIncreaseAmount = 10;
        this.cooldownReduction = 10;
        this.explosionScaleIncrease = 10;

        this.makingChoice = false;

        this.basicList = [
            {
                game: this.game, //I think this is needed to the object can see game
                name: "Attack Increase", 
                upgrade() {this.game.adventurer.attackDamage += this.game.upgrade.attackIncreaseAmount;}, //What happens when upgrade() is called
                description: `Increases Attack by ${this.attackIncreaseAmount}`, //Description of upgrade
                type: 0, // 0 for sword  
                max: 1, //Number of times this upgrade can so up
                current: 0, //Current number of times selected
                color: "White", //Color of text
            },
            {
                game: this.game,
                name: "Attack Speed Increase", 
                upgrade() {this.game.adventurer.attackCooldown -= this.game.upgrade.attackSpeedIncreaseAmount; }, 
                description: `Decreases Attack Cooldown by ${this.attackSpeedIncreaseAmount}`,
                type: 0,
                max: 4,
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "Bow Attack Increase", 
                upgrade() {this.game.adventurer.bowDamage += this.game.upgrade.attackIncreaseAmount;}, 
                description: `Increase Bow Attack by ${this.attackIncreaseAmount}`,
                type: 1,
                max: 1,
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "HP Increase", 
                upgrade() {this.game.adventurer.maxhealth += this.game.upgrade.hpIncreaseAmount;
                    this.game.adventurer.health += this.game.upgrade.hpIncreaseAmount;
                }, 
                description: `Increase Max HP by ${this.hpIncreaseAmount}`,
                type: -1,
                max: 1,
                current: 0,
                color: "White",
                
            }, 
        ];
        this.uniqueList = [ //More rare upgrades
            {
                game: this.game,
                name: "Bombs", 
                upgrade() {this.game.adventurer.enableBomb = true;}, 
                description: `Able to use bombs`,
                type: -1,
                max: 1,
                current: 0,
                color: "Yellow",
                
            },
            {
                game: this.game,
                name: "Magic", 
                upgrade() {this.game.adventurer.enableMagic = true;}, 
                description: `Able to use magic`,
                type: -1,
                max: 1,
                current: 0,
                color: "Yellow",
                
            }
        ];
        this.magicList = [
            {
                game: this.game,
                name: "Decrease Magic Cooldown", 
                upgrade() {this.game.adventurer.magicCooldown -= this.game.upgrade.cooldownReduction; //Make sure the cooldown is not less than 0
                    if (this.game.adventurer.magicCooldownTimer != this.game.adventurer.magicCooldown) {
                        this.game.adventurer.magicCooldownTimer -= this.game.upgrade.cooldownReduction;
                    }
                }, 
                description: `Decrease Magic Cooldown by ${this.cooldownReduction} seconds`,
                type: -1,
                max: 4,
                current: 0,
                color: "White",
                
            }
        ];
        this.bombList = [
            {
                game: this.game,
                name: "Increase Explosion Scale", 
                upgrade() {this.game.adventurer.bombExplosionScale += this.game.upgrade.explosionScaleIncrease;}, 
                description: `Decrease Explosion Scale by ${this.explosionScaleIncrease}`,
                type: -1,
                max: 1,
                current: 0,
                color: "White",
            }
        ];

        this.basic = [];
        this.unique = [];

        this.first = null;
        this.second = null;
        this.third = null;

        this.selectedUpgrade = null;

    }
    getThreeUpgrades() {
        this.addValidUpgrade();
        let random = Math.random();
        if (this.unique.length > 0 && random < 0.1 && this.totalUpgradeCount > 4) { //Gamble for unique upgrades
            this.first = this.getRandomUpgrade(this.unique); //Set first option to a random unique upgrade
            this.unique.splice(this.index, 1); //Remove the unique upgrade from current pool so no overlap
        } else if (this.basic.length > 0) { //If we lose the chance for unique upgrade
            this.first = this.getRandomUpgrade(this.basic); //Set first option to a basic upgrade
            this.basic.splice(this.index, 1); // Remove the basic upgrade from pool so no overlap
        } else if (this.unique.length > 0) { //If no more basic upgrades, use from unique pool
            this.first = this.getRandomUpgrade(this.unique); // Set to unique
            this.unique.splice(this.index, 1); 
        } else {
            console.log("No upgrade");
            this.noUpgrades1 = true;
        }
        random = Math.random();
        if (this.unique.length > 0 && random < 0.1 && this.totalUpgradeCount > 4) {
            this.second = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
        } else if (this.basic.length > 0) {
            this.second = this.getRandomUpgrade(this.basic);
            this.basic.splice(this.index, 1);
        } else if (this.unique.length > 0) {
            this.second = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
        } else {
            console.log("No upgrade");
            this.noUpgrades2 = true;
        }
        random = Math.random();
        if (this.unique.length > 0 && random < 0.1 && this.totalUpgradeCount > 4) { //Gamble for unique upgrades
            this.third = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
        } else if (this.basic.length > 0) { //Defaults to basic upgrades
            this.third = this.getRandomUpgrade(this.basic);
            this.basic.splice(this.index, 1);
        } else if (this.unique.length > 0) { //If no more basic, then use unique upgrades
            this.third = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
        } else { // No upgrades left
            console.log("No upgrade");
            this.noUpgrades3 = true;
        }

        this.resetList();
        if (this.noUpgrades1 && this.noUpgrades2 && this.noUpgrades3) {
            this.noUpgrades = true;
            this.game.adventurer.health = this.game.adventurer.maxhealth;
            this.game.toggleUpgradePause();
        }
        
    }
    addValidUpgrade() {
        for (let i = 0; i < this.basicList.length; i++) {
            if (this.basicList[i].max > this.basicList[i].current) { //If the amount of time chosen does not reach the max, then add to upgrade pool
                this.basic.push(this.basicList[i]);
            }
        }
        for (let i = 0; i < this.uniqueList.length; i++) { //Lower chance stuff
            if (this.uniqueList[i].max > this.uniqueList[i].current) {
                this.unique.push(this.uniqueList[i]);
            }
        }
        if (this.game.adventurer.enableMagic) {
            for (let i = 0; i < this.magicList.length; i++) { //If we get magic enabled, add to basic pool
                if (this.magicList[i].max > this.magicList[i].current) {
                    this.basic.push(this.magicList[i]);
                }
            }
        }
        if (this.game.adventurer.enableBomb) {
            for (let i = 0; i < this.bombList.length; i++) { //If we get magic enabled, add to basic pool
                if (this.bombList[i].max > this.bombList[i].current) {
                    this.basic.push(this.bombList[i]);
                }
            }
        }
    }

    getRandomUpgrade(upgrades) {
        this.index = Math.floor(Math.random() * upgrades.length);
        // let index = 1;
        return upgrades[this.index];
    }
    
    update() {
        
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.click != null) {
            mouseX = this.game.click.x;
            mouseY = this.game.click.y;
        }
        this.makingChoice = true;
        if((this.game.keys["1"] && !this.noUpgrades1) || 
        (mouseX > this.centerButtonX - 300 && mouseX < this.centerButtonX + this.buttonWidth - 300 &&
            mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight && 
            this.game.leftClick && !this.noUpgrades1)
        ) {
            this.updateChoice(this.first);
        }
        if((this.game.keys["2"] && !this.noUpgrades2) || 
            (mouseX > this.centerButtonX && mouseX < this.centerButtonX + this.buttonWidth &&
                mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight && 
                this.game.leftClick && !this.noUpgrades2)
        ) {
            this.updateChoice(this.second);
        }
        if((this.game.keys["3"] && !this.noUpgrades3) || 
        (mouseX > this.centerButtonX + 300 && mouseX < this.centerButtonX + this.buttonWidth + 300 &&
            mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight && 
            this.game.leftClick && !this.noUpgrades3)
        ) {
            this.updateChoice(this.third);
        }
        //PARAMS.CANVAS_WIDTH / 2 - 50, PARAMS.CANVAS_HEIGHT / 2 + 250, 100, 40
        
    }
    updateChoice(upgrade) {
        this.selectedUpgrade = upgrade;
        upgrade.upgrade();
        //CHange to add to object updteas count of upgrade used
        upgrade.current++;
        this.incrementType(upgrade.type);
        if (this.swordUpgradeCount >= 5) this.updateSwordLevel();
        if (this.bowUpgradeCount >= 5) this.game.adventurer.bowUpgrade = 1;
        if (this.points > 1) {
            this.points--;
            this.getThreeUpgrades();
        } else {
            this.points--;
            this.game.toggleUpgradePause();
        }
        this.makingChoice = false;
        this.game.keys["1"] = false;
        this.game.keys["1"] = false;
        this.game.keys["3"] = false;
        this.game.leftClick = false;
    }
    incrementType(type) {
        if (type == 0) {
            this.swordUpgradeCount++;
        } else if (type == 1) {
            this.bowUpgradeCount++;
        } else {
            this.otherUpgradeCount++;
        }
        this.totalUpgradeCount = this.swordUpgradeCount + this.bowUpgradeCount + this.otherUpgradeCount;
    }
    updateSwordLevel() {
        // if (this.game.adventurer.swordUpgrade < 4) this.game.adventurer.swordUpgrade++;
        this.game.adventurer.swordUpgrade = 1;
    }
    draw(ctx) {
        const mouseX = this.game.mouse.x;
        const mouseY = this.game.mouse.y;
        //visual for upgrade screen
        if (this.makingChoice) {
            this.game.draw(ctx); // Only way to make it transparent
            this.upgradeBackground(ctx);
            ctx.font = '20px Arial';
            ctx.lineWidth = 1;
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 
            ctx.fillStyle = "White";
            ctx.fillText(`Upgrade Point count: ${this.points}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 - 275);
            if (!this.noUpgrades1 && this.points > 0) {
                ctx.fillStyle = this.first.color;
                ctx.font = '18px "Press Start 2P"';
                this.wrapText(ctx, `${this.first.name}`,
                    PARAMS.CANVAS_WIDTH / 2 - 290, PARAMS.CANVAS_HEIGHT / 2 - 175,
                    250, 25
                );
                ctx.font = '12px "Press Start 2P"';
                this.wrapText(ctx, `${this.first.description}`, 
                    PARAMS.CANVAS_WIDTH / 2 - 290, PARAMS.CANVAS_HEIGHT / 2 + 100,
                    250, 25
                );
                // ctx.fillText(`${this.first.name}`, PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2);
                // ctx.fillText(`${this.first.description}`, PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 + 100);
                ctx.fillText(`x${this.first.current}`, PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 + 190);

                //Testing selection "buttons"
                if (mouseX > this.centerButtonX - 300 && mouseX < this.centerButtonX + this.buttonWidth - 300 &&
                    mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight
                ) {
                    // console.log("hovering");
                    ctx.fillStyle = rgb(41, 41, 41);
                } else {
                    ctx.fillStyle = rgb(74, 74, 74);
                }
                ctx.strokeStyle = "Black";
                
                //Drawing the buttons

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX - 300, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX - 300, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.strokeStyle = "Black";
                ctx.stroke();
                
                ctx.font = '10px "Press Start 2P"';
                ctx.fillStyle = "White";
                ctx.fillText("Select", this.centerButtonX + this.buttonWidth / 2 - 300, this.centerButtonY + this.buttonHeight / 2);

                // ctx.strokeRect(this.centerButtonX - 300, this.centerButtonY, 100, 40); //Select Button Area
            }
            if (!this.noUpgrades2 && this.points > 0) {
                ctx.fillStyle = this.second.color;
                ctx.font = '18px "Press Start 2P"';
                this.wrapText(ctx, `${this.second.name}`,
                    PARAMS.CANVAS_WIDTH / 2 + 10, PARAMS.CANVAS_HEIGHT / 2 - 175,
                    250, 25
                );
                ctx.font = '12px "Press Start 2P"';
                this.wrapText(ctx, `${this.second.description}`, 
                    PARAMS.CANVAS_WIDTH / 2 + 10, PARAMS.CANVAS_HEIGHT / 2 + 100,
                    250, 25
                );
                // ctx.fillText(`${this.second.name}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
                // ctx.fillText(`${this.second.description}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 100);
                ctx.fillText(`x${this.second.current}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 190);


                //Testing selection "buttons"
                if (mouseX > this.centerButtonX && mouseX < this.centerButtonX + this.buttonWidth &&
                    mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight
                ) {
                    // console.log("hovering");
                    ctx.fillStyle = rgb(41, 41, 41);
                } else {
                    ctx.fillStyle = rgb(74, 74, 74);
                }
                ctx.strokeStyle = "Black";

                //Drawing the buttons

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.strokeStyle = "Black";
                ctx.stroke();
                
                ctx.font = '10px "Press Start 2P"';
                ctx.fillStyle = "White";
                ctx.fillText("Select", this.centerButtonX + this.buttonWidth / 2, this.centerButtonY + this.buttonHeight / 2);
            }
            if (!this.noUpgrades3 && this.points > 0) {
                ctx.fillStyle = this.third.color;
                ctx.font = '18px "Press Start 2P"';
                this.wrapText(ctx, `${this.third.name}`,
                    PARAMS.CANVAS_WIDTH / 2 + 310, PARAMS.CANVAS_HEIGHT / 2 - 175,
                    270, 25
                );
                ctx.font = '12px "Press Start 2P"';
                this.wrapText(ctx, `${this.third.description}`, 
                    PARAMS.CANVAS_WIDTH / 2 + 310, PARAMS.CANVAS_HEIGHT / 2 + 100,
                    270, 25
                );
                // ctx.fillText(`${this.third.name}`, PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2);
                // ctx.fillText(`${this.third.description}`, PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 + 100);
                ctx.fillText(`x${this.third.current}`, PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 + 190);

                //Testing selection "buttons"
                if (mouseX > this.centerButtonX + 300 && mouseX < this.centerButtonX + this.buttonWidth + 300 &&
                    mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight
                ) {
                    // console.log("hovering");
                    ctx.fillStyle = rgb(41, 41, 41);
                } else {
                    ctx.fillStyle = rgb(74, 74, 74);
                }

                //Drawing the buttons

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX + 300, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(this.centerButtonX + 300, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
                ctx.strokeStyle = "Black";
                ctx.stroke();
                
                ctx.font = '10px "Press Start 2P"';
                ctx.fillStyle = "White";
                ctx.fillText("Select", this.centerButtonX + this.buttonWidth / 2 + 300, this.centerButtonY + this.buttonHeight / 2);

            }
            if (this.noUpgrades) {
                ctx.fillStyle = "White"
                ctx.fillText(`No Upgrade Available`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
            }
            if (this.points < 1) {
                ctx.fillStyle = "White"
                ctx.fillText(`Level Up to see Upgrades`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
            }
        } 
        if (!this.makingChoice){
            // this.game.draw(ctx);
            // this.upgradeBackground(ctx);
            this.game.setDelay = 1;
            // ctx.clearRect(100, 100, PARAMS.CANVAS_WIDTH - 200, PARAMS.CANVAS_HEIGHT - 200); //Either be very precise on non transparent areas, or entire thing
        }
        //need draw update to restart with nothing
    }
    resetList() {
        this.basic = [];
        this.unique = [];
    }
    upgradeBackground(ctx) {
        let width = 275;
        let height = 425;
        let x = PARAMS.CANVAS_WIDTH / 2 - width / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - height /2;
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        if (!this.noUpgrades && this.points > 0) {
            ctx.beginPath();
            ctx.roundRect(x - 300, y, width, height, [10]);
            ctx.roundRect(x, y, width, height, [10]);
            ctx.roundRect(x + 300, y, width, height, [10]);
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.fill();
    
            ctx.beginPath();
            ctx.roundRect(x - 300, y, width, height, [10]);
            ctx.roundRect(x, y, width, height, [10]);
            ctx.roundRect(x + 300, y, width, height, [10]);
            ctx.strokeStyle = 'White';
            ctx.stroke();
        }
    }

    //I just found it off the internet
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testLine = '';
        let metrics = null;
      
        for (let i = 0; i < words.length; i++) {
          testLine = line + words[i] + ' ';
          metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
      
          if (testWidth > maxWidth && i > 0) {
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 
            ctx.fillText(line, x, y);
            line = words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
      }
}