class UpgradeSystem {
    constructor(game) {
        Object.assign(this, {game});
        this.proportion = PARAMS.CANVAS_WIDTH / 1024; //Assuming it's always going to be 4:3
        this.points = 0;
        this.game.upgrade = this;

        this.player = new PlayerStatus(game, this);
        this.enablePlayerStats = false;
        this.rerollTimer = 0;

        this.heroIcon = ASSET_MANAGER.getAsset("./Sprites/HudIcons/AdventurerSpriteHud2.png");
        this.heroIconScale = 4;
        this.heroIconLength = 16;
        this.heroIconHeight = 16;
        this.heroIconX = PARAMS.CANVAS_WIDTH - this.heroIconLength * this.heroIconScale - 10;
        this.heroIconY = PARAMS.CANVAS_HEIGHT - this.heroIconHeight * this.heroIconScale - 10;
        this.heroanimation = new Animator(this.heroIcon, 0, 0, this.heroIconLength, this.heroIconHeight, 12.9, 0.2, false, true);

        this.buttonWidth = 150;
        this.buttonHeight = 50;
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
        //Upgrade changes
        //General share values
        this.attackIncreaseAmount = 5;
        this.attackSpeedIncreaseAmount = 0.1;
        this.knockbackIncrease = 100;
        this.maxAmount = 10;
        this.lowerMaxAmount = 5;

        this.speedIncrease = 10;
        this.hpIncreaseAmount = 10;
        this.rollingCooldownDecrease = 0.25;
        //Sword
        this.attackScale = 0.5;
        //Bow
        this.arrowSpeedIncrease = 100;
        //Magic
        this.magicDamageIncrease = 20;
        this.cooldownReduction = 10;
        this.magicKnockback = 1000;
        this.magicSize = 1;
        //Bomb
        this.bombDamageIncrease = 5;
        this.bombCooldown = 0.1;
        this.bombKnockback = 1000;
        this.explosionScaleIncrease = 10;
        this.bombRetrieveCD = 0.5;
        this.bombMaxAmountIncrease = 1;

        this.exitButtonSize = {width: 100, height: 40};

        this.makingChoice = false;
        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentUpgrades = [];
        this.basicList = [
            {
                game: this.game, //I think this is needed to the object can see game
                name: "Sword Attack Increase", 
                upgrade() {this.game.adventurer.attackDamage += this.game.upgrade.attackIncreaseAmount;}, //What happens when upgrade() is called
                description: `Increases Sword Attack by ${this.attackIncreaseAmount}`, //Description of upgrade
                type: 0, // 0 for sword  
                max: this.maxAmount, //Number of times this upgrade can so up
                current: 0, //Current number of times selected
                color: "White", //Color of text
            },
            {
                game: this.game,
                name: "Sword Attack Speed Increase", 
                upgrade() {this.game.adventurer.attackCooldown -= this.game.upgrade.attackSpeedIncreaseAmount; }, 
                description: `Decreases Attack Cooldown by ${this.attackSpeedIncreaseAmount}`,
                type: 0,
                max: 3,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Sword Knockback Increase", 
                upgrade() {this.game.adventurer.knockback += this.game.upgrade.knockbackIncrease; }, 
                description: `Increase Sword Knockback by ${this.knockbackIncrease / 1000}`,
                type: 0,
                max: this.maxAmount,
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "Bow Attack Increase", 
                upgrade() {this.game.adventurer.bowDamage += this.game.upgrade.attackIncreaseAmount;}, 
                description: `Increase Bow Attack by ${this.attackIncreaseAmount}`,
                type: 1,
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bow Attack Speed Increase", 
                upgrade() {this.game.adventurer.shootCooldown -= this.game.upgrade.attackSpeedIncreaseAmount; }, 
                description: `Decreases Bow Attack Cooldown by ${this.attackSpeedIncreaseAmount}`,
                type: 0,
                max: 7,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bow Knockback Increase", 
                upgrade() {this.game.adventurer.bowKnockback += this.game.upgrade.knockbackIncrease; }, 
                description: `Increase Bow Knockback by ${this.knockbackIncrease / 1000}`,
                type: 1,
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Arrow Speed Increase", 
                upgrade() {this.game.adventurer.arrowSpeed += this.game.upgrade.arrowSpeedIncrease; }, 
                description: `Increase Arrow Speed by ${this.arrowSpeedIncrease}`,
                type: 1,
                max: this.maxAmount,
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
                max: this.maxAmount,
                current: 0,
                color: "White",
                
            },
            {
                game: this.game,
                name: "Speed Increase", 
                upgrade() {this.game.adventurer.speed += this.game.upgrade.speedIncrease;
                }, 
                description: `Increase Speed by ${this.speedIncrease}`,
                type: -1,
                max: this.maxAmount,
                current: 0,
                color: "White",
                
            },
            {
                game: this.game,
                name: "Rolling Cooldown Decrease", 
                upgrade() {this.game.adventurer.rollCooldown -= this.game.upgrade.rollingCooldownDecrease;
                }, 
                description: `Decrease Rolling Cooldown by ${this.rollingCooldownDecrease}`,
                type: -1,
                max: 4,
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
                
            },
            {
                game: this.game,
                name: "Piercing Arrows", 
                upgrade() {this.game.adventurer.piercing = true;}, 
                description: `Arrows can now pierce`,
                type: 1,
                max: 1,
                current: 0,
                color: "Yellow",
                
            },
            {
                game: this.game,
                name: "Sword Attack Size Increase", 
                upgrade() {this.game.adventurer.slashScale += this.game.upgrade.attackScale; }, 
                description: `Increase Sword Attack Size by ${this.attackScale}`,
                type: 0,
                max: this.lowerMaxAmount,
                current: 0,
                color: rgb(65, 214, 255),
            },
        ];
        this.magicList = [
            {
                game: this.game,
                name: "Magic Cooldown Decrease", 
                upgrade() {this.game.adventurer.magicCooldown -= this.game.upgrade.cooldownReduction; //Make sure the cooldown is not less than 0
                    if (this.game.adventurer.magicCooldownTimer != this.game.adventurer.magicCooldown) {
                        this.game.adventurer.magicCooldownTimer -= this.game.upgrade.cooldownReduction;
                    }
                }, 
                description: `Decrease Magic Cooldown by ${this.cooldownReduction} seconds`,
                type: 2,
                max: 4,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Damage Increase", 
                upgrade() {this.game.adventurer.magicDamage += this.game.upgrade.magicDamageIncrease; }, 
                description: `Increase Magic Damage by ${this.magicDamageIncrease}`,
                type: 2,
                max: 10,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Knockback Increase", 
                upgrade() {this.game.adventurer.magicKnockback += this.game.upgrade.magicKnockback; }, 
                description: `Increase Magic Knockback by ${this.magicKnockback/1000}`,
                type: 2,
                max: 10,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Size Increase", 
                upgrade() {this.game.adventurer.magicScale += this.game.upgrade.magicSize; }, 
                description: `Increase Magic Size by ${this.magicSize}`,
                type: 2,
                max: 10,
                current: 0,
                color: "White",
            },
        ];
        this.bombList = [
            {
                game: this.game,
                name: "Explosion Scale Increase", 
                upgrade() {this.game.adventurer.bombExplosionScale += this.game.upgrade.explosionScaleIncrease;}, 
                description: `Increase Explosion Scale by ${this.explosionScaleIncrease}`,
                type: 3,
                max: this.lowerMaxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Damage Increase", 
                upgrade() {this.game.adventurer.bombDamage += this.game.upgrade.bombDamageIncrease;}, 
                description: `Increase Bomb Damage by ${this.bombDamageIncrease}`,
                type: 3,
                max: this.lowerMaxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Cooldown Decrease", 
                upgrade() {this.game.adventurer.bombCooldown -= this.game.upgrade.bombCooldown;}, 
                description: `Decrease Bomb Cooldown by ${this.bombCooldown.toFixed(1)}`,
                type: 3,
                max: 4,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Knockback Increase ", 
                upgrade() {this.game.adventurer.bombKnockback += this.game.upgrade.bombKnockback;}, 
                description: `Increase Bomb Knockback by ${this.bombKnockback / 1000}`,
                type: 3,
                max: this.lowerMaxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Max Bomb Amount Increase", 
                upgrade() {this.game.adventurer.bombMaxAmount += this.game.upgrade.bombMaxAmountIncrease;}, 
                description: `Increase Max Bomb Amount by ${this.bombMaxAmountIncrease}`,
                type: 3,
                max: this.lowerMaxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Retrieval CD Decrease", 
                upgrade() {this.game.adventurer.bombCooldownRetrieve -= this.game.upgrade.bombRetrieveCD;}, 
                description: `Decrease Bomb Retrieval Cooldown by ${this.bombRetrieveCD}`,
                type: 3,
                max: this.lowerMaxAmount,
                current: 0,
                color: "White",
            },

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
            this.first = null;
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
            this.second = null;
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
            this.third = null;
            this.noUpgrades3 = true;
        }
        this.selectedUpgrade = null;
        this.resetList();
        if (this.noUpgrades1 && this.noUpgrades2 && this.noUpgrades3) {
            this.noUpgrades = true;
            this.game.adventurer.health = this.game.adventurer.maxhealth;
        }
        
    }
    addValidUpgrade() {
        for (let i = 0; i < this.basicList.length; i++) {
            if (this.basicList[i].max > this.basicList[i].current) { //If the amount of time chosen does not reach the max, then add to upgrade pool
                // this.basic.push(this.basicList[i]);
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
                    // this.basic.push(this.magicList[i]);
                }
            }
        }
        if (this.game.adventurer.enableBomb) {
            for (let i = 0; i < this.bombList.length; i++) { //If we get magic enabled, add to basic pool
                if (this.bombList[i].max > this.bombList[i].current) {
                    // this.basic.push(this.bombList[i]);
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
        if (this.enablePlayerStats) {
            this.player.update();
        } else {
            this.canReroll = this.game.adventurer.coins >= 10 && !this.noUpgrades3;
            let mouseX = 0;
            let mouseY = 0;
            if (this.game.click != null) {
                mouseX = this.game.click.x;
                mouseY = this.game.click.y;
            }
            let mouse = {x: mouseX, y: mouseY};
            let width = 275;
            let height = 425;
            let x = PARAMS.CANVAS_WIDTH / 2 - width / 2;
            let y = PARAMS.CANVAS_HEIGHT /2 - height /2;
            //Circle for HeroIcon in upgrade
            let circleX = this.heroIconX + (this.heroIconLength * this.heroIconScale / 2);
            let circleY = this.heroIconY + (this.heroIconHeight * this.heroIconScale / 2);
            let circle = {x: circleX, y: circleY};
            let circleRadius = (this.heroIconHeight / 2) * this.heroIconScale;

            if (this.game.keys["c"]) this.enablePlayerStats = true;

            this.makingChoice = true;
            if (this.rerollTimer <= 0) {
                //Option 1 keys and mouse area
                if((this.game.keys["1"] && !this.noUpgrades1) ||
                (mouseX > x - 300 && mouseX < x - 300 + width &&
                mouseY > y && mouseY < y + height && this.game.leftClick && !this.noUpgrades1)
                ) {
                    this.selectedUpgrade = this.first;
                }
                //Option 2 keys and mouse area
                if((this.game.keys["2"] && !this.noUpgrades2) ||
                        (mouseX > x && mouseX < x + width &&
                        mouseY > y && mouseY < y + height && this.game.leftClick && !this.noUpgrades2)
                ) {
                    this.selectedUpgrade = this.second;
                }
                //Option 3 keys and mouse area
                if((this.game.keys["3"] && !this.noUpgrades3) ||
                    (mouseX > x + 300 && mouseX < x + 300 + width &&
                    mouseY > y && mouseY < y + height && this.game.leftClick && !this.noUpgrades3)
                ) {
                    this.selectedUpgrade = this.third;
                }
                //Selection Button location
                if (this.selectedUpgrade != null && mouseX > this.centerButtonX + 150 && mouseX < this.centerButtonX + this.buttonWidth + 150 &&
                    mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight ||
                    this.selectedUpgrade != null && this.game.keys["enter"]

                ) {
                    this.updateChoice(this.selectedUpgrade);
                    this.selectedUpgrade = null;
                    this.game.keys["enter"];
                }
                //Reroll Button location
                if (mouseX > this.centerButtonX - 150 && mouseX < this.centerButtonX + this.buttonWidth - 150 &&
                    mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight && this.canReroll ||
                    this.game.keys["r"] && this.canReroll) {
                    this.getThreeUpgrades();
                    this.game.adventurer.coins -= 10;
                    this.game.keys["r"] = false;
                    this.game.click = {x:0, y:0};
                    this.selectedUpgrade = null;
                    this.rerollTimer = 0.5;
                }
                //Player stat location
                if(getDistance(mouse, circle) < circleRadius) {
                    this.enablePlayerStats = true;
                    this.game.click = {x:0, y:0};
                }
                //Exit Button
                if (mouseX > PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - 10 && mouseX < PARAMS.CANVAS_WIDTH + this.exitButtonSize.width &&
                        mouseY > 10 && mouseY < 10 + this.exitButtonSize.height) {
                    this.game.click = {x:0, y:0};
                    this.game.toggleUpgradePause();
                    this.game.setDelay = 1;
                    this.makingChoice = false;
                    this.enablePlayerStats = false;
                }
            }
            if (this.rerollTimer > 0) {
                this.getThreeUpgrades();
                this.rerollTimer -= this.game.pauseTick;
            }
        }
    }
    updateChoice(upgrade) {
        this.selectedUpgrade = upgrade;
        upgrade.upgrade();
        //CHange to add to object updteas count of upgrade used
        upgrade.current++;
        this.incrementType(upgrade.type);
        if (this.currentUpgrades.length > 0) {
            let count = 0;
            for (let i = 0; i < this.currentUpgrades.length; i++) {
                if (this.currentUpgrades[i] == upgrade) count++;
            }
            if (count == 0) this.currentUpgrades.push(upgrade);
        } else {
            this.currentUpgrades.push(upgrade);
        }
        if (this.swordUpgradeCount >= 5) this.updateSwordLevel();
        if (this.bowUpgradeCount >= 5) this.game.adventurer.bowUpgrade = 1;
        if (this.points > 1) {
            this.points--;
            //Timer reroll
            this.getThreeUpgrades();
            if (!this.noUpgrades3) {
                this.rerollTimer = 0.5; //Trigger for upgrades
            }
        } else {
            this.points--;
            // this.game.toggleUpgradePause();
        }
        this.makingChoice = false;
        this.game.keys["1"] = false;
        this.game.keys["2"] = false;
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
        // if (this.game.adventurer.swordUpgrade >= 20) {
        //     this.game.adventurer.swordUpgrade = 4;
        // } else if (this.game.adventurer.swordUpgrade >= 15) {
        //     this.game.adventurer.swordUpgrade = 3;
        // } else if (this.game.adventurer.swordUpgrade >= 10) {
        //     this.game.adventurer.swordUpgrade = 2;
        // } else {
        //     this.game.adventurer.swordUpgrade = 1;
        // }
        this.game.adventurer.swordUpgrade = 1;
    }
    draw(ctx) {
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.mouse != null) {
            mouseX = this.game.mouse.x;
            mouseY = this.game.mouse.y;
        }
        //visual for upgrade screen
        if (this.makingChoice) {
            if (this.enablePlayerStats) {
                ctx.clearRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
                this.player.draw(ctx);
            } else {
                this.game.draw(ctx); // Only way to make it transparent
                this.upgradeBackground(ctx, mouseX, mouseY);
                ctx.font = '18px "Press Start 2P"';
                ctx.lineWidth = 1;
                ctx.textAlign = "center"; 
                ctx.textBaseline = "middle"; 
                ctx.fillStyle = "White";
                ctx.fillText(`Upgrade Point count: ${this.points}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 - 250);
                if (!this.noUpgrades1 && this.points > 0) {
                    ctx.fillStyle = this.first.color;
                    ctx.font = '18px "Press Start 2P"';
                    this.wrapText(ctx, `${this.first.name}`,
                        PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 - 175,
                        250, 25
                    );
                    ctx.font = '12px "Press Start 2P"';
                    this.wrapText(ctx, `${this.first.description}`, 
                        PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 + 100,
                        250, 25
                    );
                    ctx.fillText(`x${this.first.current}`, PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 + 190);
    
                }
                if (!this.noUpgrades2 && this.points > 0) {
                    ctx.fillStyle = this.second.color;
                    ctx.font = '18px "Press Start 2P"';
                    this.wrapText(ctx, `${this.second.name}`,
                        PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 - 175,
                        250, 25
                    );
                    ctx.font = '12px "Press Start 2P"';
                    this.wrapText(ctx, `${this.second.description}`, 
                        PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 100,
                        250, 25
                    );
                    ctx.fillText(`x${this.second.current}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 190);
    
    
                    // //Testing selection "buttons"
                    // if (mouseX > this.centerButtonX && mouseX < this.centerButtonX + this.buttonWidth &&
                    //     mouseY > this.centerButtonY && mouseY < this.centerButtonY + this.buttonHeight
                    // ) {
                    //     // console.log("hovering");
                    //     ctx.fillStyle = rgb(41, 41, 41);
                    // } else {
                    //     ctx.fillStyle = rgb(74, 74, 74);
                    // }
                    // ctx.strokeStyle = "Black";
                }
                if (!this.noUpgrades3 && this.points > 0) {
                    ctx.fillStyle = this.third.color;
                    ctx.font = '18px "Press Start 2P"';
                    this.wrapText(ctx, `${this.third.name}`,
                        PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 - 175,
                        270, 25
                    );
                    ctx.font = '12px "Press Start 2P"';
                    this.wrapText(ctx, `${this.third.description}`, 
                        PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 + 100,
                        270, 25
                    );
                    ctx.fillText(`x${this.third.current}`, PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 + 190);
    
                }
                ctx.font = '18px "Press Start 2P"';
                if (this.noUpgrades) {
                    ctx.fillStyle = "White"
                    ctx.fillText(`No Upgrade Available`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
                } else if (this.points < 1) {
                    ctx.fillStyle = "White"
                    ctx.fillText(`Level Up to see Upgrades`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2);
                }
                this.heroStatus(ctx, mouseX, mouseY); //Last so it draw over everything
            }
        } 
        if (!this.makingChoice){
            this.game.setDelay = 1;
        }
        this.exitButton(ctx, mouseX, mouseY);
        this.game.resetDrawingValues();
    }
    resetList() {
        this.basic = [];
        this.unique = [];
    }
    upgradeBackground(ctx, X, Y) {
        let width = 275;
        let height = 425;
        let x = PARAMS.CANVAS_WIDTH / 2 - width / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - height /2;
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        if (!this.noUpgrades && this.points > 0) {
            //First Upgrade
            ctx.beginPath();
            if (X > x - 300 && X < x - 300 + width &&
                Y > y && Y < y + height && !this.noUpgrades1 || 
                this.selectedUpgrade == this.first && this.selectedUpgrade != null
            ) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.selectedUpgrade == this.first && this.selectedUpgrade != null) {
                ctx.strokeStyle = 'White';
                ctx.shadowColor = "White";
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'Black';
            }
            ctx.roundRect(x - 300, y, width, height, [10]);
            ctx.fill();
            ctx.stroke();

            //Second Upgrade
            ctx.beginPath();
            if (X > x && X < x + width &&
                Y > y && Y < y + height && !this.noUpgrades2 || 
                this.selectedUpgrade == this.second && this.selectedUpgrade != null
            ) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.selectedUpgrade == this.second && this.selectedUpgrade != null) {
                ctx.strokeStyle = 'White';
                ctx.shadowColor = "White";
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'Black';
            }
            ctx.roundRect(x, y, width, height, [10]);
            ctx.fill();
            ctx.stroke();

            //Third Upgrade
            ctx.beginPath();
            if (X > x + 300 && X < x + 300 + width &&
                Y > y && Y < y + height && !this.noUpgrades3 || 
                this.selectedUpgrade == this.third && this.selectedUpgrade != null
            ) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.selectedUpgrade == this.third && this.selectedUpgrade != null) {
                //Here cuz of a bug
                // console.log(this.selectedUpgrade);
                // console.log(this.third);
                ctx.strokeStyle = 'White';
                ctx.shadowColor = "White";
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'Black';
            }
            ctx.roundRect(x + 300, y, width, height, [10]);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;

            //Reroll button
            //Drawing the buttons

            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 

            if (X > this.centerButtonX - 150 && X < this.centerButtonX + this.buttonWidth - 150 &&
                Y > this.centerButtonY && Y < this.centerButtonY + this.buttonHeight && this.canReroll
            ) {
                // console.log("hovering");
                ctx.fillStyle = rgb(41, 41, 41);
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
            }

            ctx.beginPath();
            ctx.roundRect(this.centerButtonX - 150, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
            ctx.strokeStyle = "Black";
            ctx.fill();
            ctx.stroke();
            
            ctx.font = '14px "Press Start 2P"';
            if (this.canReroll) {
                ctx.fillStyle = "White";
            } else {
                ctx.fillStyle = "Gray";
            }
            ctx.fillText("Reroll", this.centerButtonX + this.buttonWidth / 2 - 150, this.centerButtonY + this.buttonHeight / 2);

            ctx.drawImage(this.coinImage, 
                10, 140, 
                14, 14, 
                this.centerButtonX + this.buttonWidth / 2 - 200, this.centerButtonY + this.buttonHeight / 2 + 20, 
                14 * 4, 14 * 4
            );
            ctx.textAlign = "left"; 
            ctx.font = '14px "Press Start 2P"';
            if (this.game.adventurer.coins >= 10) {
                ctx.fillStyle = "White";
            } else {
                ctx.fillStyle = "Red";
            }
            ctx.fillText("x10", this.centerButtonX + this.buttonWidth / 2 - 160, this.centerButtonY + this.buttonHeight + 15);
            ctx.textAlign = "center"; 

            //Select button
            //Drawing the buttons
            if (this.selectedUpgrade != null) {
                if (X > this.centerButtonX + 150 && X < this.centerButtonX + this.buttonWidth + 150 &&
                    Y > this.centerButtonY && Y < this.centerButtonY + this.buttonHeight
                ) {
                    // console.log("hovering");
                    ctx.fillStyle = rgb(41, 41, 41);
                } else {
                    ctx.fillStyle = rgb(74, 74, 74);
                }
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
            }
            
            ctx.beginPath();
            ctx.roundRect(this.centerButtonX + 150, this.centerButtonY, this.buttonWidth, this.buttonHeight, [10]);
            ctx.strokeStyle = "Black";
            ctx.fill();
            ctx.stroke();
            
            if(this.selectedUpgrade != null) {
                ctx.fillStyle = "White";
            } else {
                ctx.fillStyle = "Gray";
            }
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText("Confirm", this.centerButtonX + this.buttonWidth / 2 + 150, this.centerButtonY + this.buttonHeight / 2);


        }
    }
    heroStatus(ctx, X, Y) {
        let mouse = {x: X, y: Y};
        let circleX = this.heroIconX + (this.heroIconLength * this.heroIconScale / 2);
        let circleY = this.heroIconY + (this.heroIconHeight * this.heroIconScale / 2);
        let circle = {x: circleX, y: circleY};
        let circleRadius = (this.heroIconHeight / 2) * this.heroIconScale;
        let padding = 10;
        if(getDistance(mouse, circle) < circleRadius) {
            this.heroIconScale = 5;
            this.heroIconX = PARAMS.CANVAS_WIDTH - this.heroIconLength * this.heroIconScale - 5;
            this.heroIconY = PARAMS.CANVAS_HEIGHT - this.heroIconHeight * this.heroIconScale - 5;
            ctx.lineWidth = 5;
            ctx.font = 10 + 'px "Press Start 2P"';
            padding = 15;
        } else {
            this.heroIconScale = 4;
            this.heroIconX = PARAMS.CANVAS_WIDTH - this.heroIconLength * this.heroIconScale - 10;
            this.heroIconY = PARAMS.CANVAS_HEIGHT - this.heroIconHeight * this.heroIconScale - 10;
            ctx.lineWidth = 4;
            ctx.font = 8 + 'px "Press Start 2P"';
            this.heroanimation.elapsedTime = 0;
        }
        ctx.beginPath();
        ctx.fillStyle = rgb(44, 142, 174);
        ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
        ctx.fill();
        this.heroanimation.drawFrame(this.game.pauseTick, ctx, this.heroIconX, this.heroIconY, this.heroIconScale);
        ctx.beginPath();
        ctx.strokeStyle = 'Black'
        ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
        ctx.lineWidth = 7 * this.proportion;
        ctx.stroke();

        ctx.fillStyle = "White";
        ctx.fillText("Character", this.heroIconX + this.heroIconHeight * this.heroIconScale / 2, this.heroIconY + this.heroIconHeight * this.heroIconScale - padding);
        ctx.fillText("Stats", this.heroIconX + this.heroIconHeight * this.heroIconScale / 2, this.heroIconY + this.heroIconHeight * this.heroIconScale);
    }
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = ' ';
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
            line = ' ' + words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
    }
    exitButton(ctx, mouseX, mouseY) {
        let buffer = 10;
        ctx.beginPath();
        ctx.roundRect(PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - buffer, buffer, this.exitButtonSize.width, this.exitButtonSize.height, [10, 30, 10, 10]);
        ctx.lineWidth = 5;
        ctx.strokeStyle = rgb(200, 0, 0);
        if (mouseX > PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - buffer && mouseX < PARAMS.CANVAS_WIDTH + this.exitButtonSize.width &&
            mouseY > buffer && mouseY < buffer+this.exitButtonSize.height
        ) {
            ctx.fillStyle = rgb(100, 0, 0);
        } else {
            ctx.fillStyle = rgb(150, 0, 0);
        }
        ctx.fill();
        ctx.stroke();
        ctx.font = '36px "Press Start 2P"';
        ctx.fillStyle = rgb(255, 0, 0);
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillText("X", PARAMS.CANVAS_WIDTH - 60, 32.5)
    }
}
class PlayerStatus {
    constructor(game, upgrade) {
        Object.assign(this, {game, upgrade});

        this.exitButtonSize = {width: 100, height: 40};
        this.healthBarSize = {width: 300, height: 25};
        this.selected = "Sword";
        // this.background = 
        this.width = PARAMS.CANVAS_WIDTH / 2 - 60;
        this.height = PARAMS.CANVAS_HEIGHT - 120;

        this.shadow = ASSET_MANAGER.getAsset("./Sprites/Objects/shadow.png");
        this.animation = [];
        this.actions = 0;
        this.swordDuration = 0.9;
        this.currentTimer = 0;
        this.bowDuration = 0.55;
        this.magicDuration = 0.6;
        this.loadAnimation();

    }
    loadAnimation() {
        for (var i = 0; i < 12; i++) {
            this.animation.push([]);
        }
        //Idle
        this.animation[0] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 256, 32, 32, 12.9, 0.2, false, true);
        //Sword
        this.animation[1] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite.png"), 0, 320, 32, 32, 10, 0.1, false, false);
        //Bow
        this.animation[2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/BowLeft.png"), 0, -8, 32, 32, 3, 0.2, true, false);
        //Magic
        this.animation[3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 320, 32, 32, 6, 0.1, false, false);
    }
    update() {
        this.healthRatio = this.game.adventurer.health / this.game.adventurer.maxhealth;
        this.stamina = (this.game.adventurer.rollCooldown - this.game.adventurer.rollCooldownTimer) / this.game.adventurer.rollCooldown;
        this.experience = this.game.adventurer.experience / this.game.adventurer.experienceToNextLvl;

        let mouseX = 0;
        let mouseY = 0;
        if (this.game.click != null) {
            mouseX = this.game.click.x;
            mouseY = this.game.click.y;
        }
        let button = {width: (this.width - 50) / 4, height: 40};

        let y = 110 + 10 + this.healthBarSize.height * 2 + 20 + 70;
        if (this.game.keys["1"] || mouseX > 85 && mouseX < 85 + button.width &&
            mouseY > y && mouseY < y + button.height) {
            this.animation[1].elapsedTime = 0;
            this.actions = 1;
            this.currentTimer = this.swordDuration;
            this.game.keys["1"] = false;
            this.selected = "Sword";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["2"] || mouseX > 85 + button.width && mouseX < 85 + button.width * 2 &&
            mouseY > y && mouseY < y + button.height) {
            this.animation[2].elapsedTime = 0;
            this.actions = 2;
            this.currentTimer = this.bowDuration;
            this.game.keys["2"] = false;
            this.selected = "Bow";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["3"] || mouseX > 85 + button.width * 2 && mouseX < 85 + button.width * 3 &&
            mouseY > y && mouseY < y + button.height) {
            this.animation[3].elapsedTime = 0;
            this.actions = 3;
            this.currentTimer = this.magicDuration;
            this.game.keys["3"] = false;
            this.selected = "Magic";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["4"] || mouseX > 85 + button.width * 3 && mouseX < 85 + button.width * 4 &&
            mouseY > y && mouseY < y + button.height) {
            this.actions = 0;
            this.game.keys["4"] = false;
            this.selected = "Bomb";
            this.game.click = {x: 0, y: 0};
        }

        if (mouseX > PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - 10 && mouseX < PARAMS.CANVAS_WIDTH + this.exitButtonSize.width &&
            mouseY > 10 && mouseY < 10 + this.exitButtonSize.height) {
            this.game.click = {x:0, y:0};
            this.upgrade.enablePlayerStats = false;
        }
        if (this.actions == 1 && this.currentTimer <= 0) {
            this.actions = 0;
            this.animation[0].elapsedTime = 0;
        }
        if (this.actions == 2 && this.currentTimer <= 0) {
            this.actions = 0;
            this.animation[0].elapsedTime = 0;
        }
        if (this.actions == 3 && this.currentTimer <= 0) {
            this.actions = 0;
            this.animation[0].elapsedTime = 0;
        }
        if (this.currentTimer > 0) {
            this.currentTimer -= this.game.pauseTick;
        }

    }
    draw(ctx) {
        let adventurer = this.game.adventurer;
        this.drawBackground(ctx);
        ctx.fillStyle = "White";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText("Player Stats:", 60 + this.width / 2, 85);
        this.drawHP(ctx);
        this.drawEXP(ctx);
        let statList = ["Speed:", "Stamina Cooldown:"];
        let statValues = [`${adventurer.speed.toFixed(0)}`, `${adventurer.rollCooldown} secs`]
        let scale = 10;
        let Y = 110 + 10 + this.healthBarSize.height * 2 + 20;
        ctx.font = '12px "Press Start 2P"';

        let currentY = Y;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "top"; 
        for (let line of statList) {
            ctx.fillText(line, 80, currentY);
            currentY += 20;
        }
        currentY = Y;
        ctx.textAlign = "right"; 
        for (let line of statValues) {
            ctx.fillText(line, this.width + 40, currentY);
            currentY += 20;
        }

        ctx.beginPath();
        ctx.moveTo(60, currentY + 10);
        ctx.lineTo(this.width + 60, currentY + 10);
        ctx.lineWidth = 5;
        ctx.stroke();
        this.drawAttacksBackground(ctx, currentY + 30);
        this.animation[this.actions].drawFrame(this.game.pauseTick, ctx, PARAMS.CANVAS_WIDTH * 0.75 - (32 * 15) / 2, PARAMS.CANVAS_HEIGHT / 2 - 140, 15);
        this.game.resetDrawingValues();

    }
    drawBackground(ctx) {
        ctx.beginPath();
        ctx.roundRect(60, 60, this.width, this.height, [10]);
        ctx.strokeStyle = "Black";
        ctx.fillStyle = rgba(0,0,0, 0.5);
        ctx.fill();
        ctx.stroke();
    }
    drawHP(ctx) {
        let X = 60 + this.width / 2 - this.healthBarSize.width / 2;
        let Y = 110;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width, this.healthBarSize.height, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();
        
        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width * this.healthRatio, this.healthBarSize.height, [5]);
        ctx.fillStyle = this.healthRatio < 0.2 ? rgb(150, 0, 0) : this.healthRatio < 0.5 ? rgb(190, 180, 0) : rgb(0, 110, 0);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width, this.healthBarSize.height, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();

        //Health Text
        let healthX = X + this.healthBarSize.width / 2;
        let healthY = Y + this.healthBarSize.height / 2;

        ctx.font = '20px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.lineWidth = 1;

        ctx.fillText(`HP : ${this.game.adventurer.health} / ${this.game.adventurer.maxhealth}`, healthX, healthY);
        ctx.strokeText(`HP : ${this.game.adventurer.health} / ${this.game.adventurer.maxhealth}`, healthX, healthY);
    }
    drawEXP(ctx) {
        let X = 60 + this.width / 2 - this.healthBarSize.width / 2;
        let Y = 110 + 10 + this.healthBarSize.height;
        //Experience Bar
        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width, this.healthBarSize.height, [5]);
        ctx.fillStyle = rgba(0, 0, 0, 0.5);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width * this.experience, this.healthBarSize.height, [5]);
        ctx.fillStyle = 'Green';
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(X, Y, this.healthBarSize.width, this.healthBarSize.height, [5]);
        ctx.strokeStyle = 'Black';
        ctx.stroke();


        //Experience Text
        ctx.font = '20px Lilita One';

        ctx.strokeStyle = 'Black';
        ctx.fillStyle = 'white';
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        
        // ctx.fillText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        // ctx.strokeText(`Lvl 1 : 50 / 100`, (PARAMS.CANVAS_WIDTH / 2), this.experienceBarY + 12.5);
        ctx.fillText(`Level ${this.game.adventurer.level} : ${this.game.adventurer.experience} / ${this.game.adventurer.experienceToNextLvl}`, X + this.healthBarSize.width / 2, Y + this.healthBarSize.height / 2);
        ctx.strokeText(`Level ${this.game.adventurer.level} : ${this.game.adventurer.experience} / ${this.game.adventurer.experienceToNextLvl}`, X + this.healthBarSize.width / 2, Y + this.healthBarSize.height / 2);
    }
    drawAttacksBackground(ctx, y) {
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.mouse != null) {
            mouseX = this.game.mouse.x;
            mouseY = this.game.mouse.y;
        }
        let button = {width: (this.width - 50) / 4, height: 40};
        let currentX = 85;
        let attacks = ["Sword", "Bow", "Magic", "Bomb"];
        for (let attack of attacks) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.roundRect(currentX, y, button.width, button.height, [10, 10, 0, 0]);
            ctx.strokeStyle = "Black";
            if (mouseX > currentX && mouseX < currentX + button.width &&
                mouseY > y && mouseY < y + button.height || this.selected == attack
            ) {
                this.displayAttackStats(ctx, this.selected, y);
                ctx.fillStyle = rgb(70, 70, 70);
            } else {
                ctx.fillStyle = rgb(100, 100, 100);
            }
            ctx.fill();
            ctx.stroke();
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle";
            ctx.font = '12px "Press Start 2P"';
            ctx.fillStyle = "Black";    
            ctx.fillText(attack, currentX + button.width / 2, y + button.height / 2);
            currentX += button.width;
        }
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.roundRect(85, y + 40, this.width - 50, this.height - y, [0, 0, 10, 10]);
        ctx.strokeStyle = "Black";
        // ctx.fillStyle = rgba(0, 0, 0, 0.5);
        // ctx.fill();
        ctx.stroke();
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";
    }
    displayAttackStats(ctx, attack, y) {
        let stats = [];
        let values = [];
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = "White"; 
        if (attack == "Sword") {
            stats = ["Basic Sword Stats:", "Damage", "Attack Speed", "Knockback", "Attack Size", "", "Sword Upgrade:"];
            values = ["",`${this.game.adventurer.attackDamage}`, `${this.game.adventurer.attackCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.knockback / 1000}`, `${this.game.adventurer.slashScale.toFixed(1)}`, "", ""
            ];
            let starting = stats.length;
            this.upgrade.currentUpgrades.forEach(upgrade => {
                if (upgrade.type == 0) {
                    stats.push(upgrade.name);
                    if (upgrade.max != 1) values.push("x" + upgrade.current);
                }
            });
            let end = stats.length;
            if (starting == end) stats.push("No Upgrades");
        }
        if (attack == "Bow") {
            stats = ["Basic Bow Stats:","Damage", "Attack Speed", "Knockback", "Arrow Speed", "", "Bow Upgrade:"];
            values = ["",`${this.game.adventurer.bowDamage}`, `${this.game.adventurer.shootCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.bowKnockback / 1000}`, `${this.game.adventurer.arrowSpeed}`, "", ""
            ];
            let starting = stats.length;
            this.upgrade.currentUpgrades.forEach(upgrade => {
                if (upgrade.type == 1) {
                    stats.push(upgrade.name);
                    if (upgrade.max != 1) values.push("x" + upgrade.current);
                }
            });
            let end = stats.length;
            if (starting == end) stats.push("No Upgrades");
        }
        if (attack == "Magic") {
            if (!this.game.adventurer.enableMagic) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Get Upgrade to Unlock", 85 + (this.width - 50) / 2, y + 40 + (this.height - y) / 2);
            } else {
                stats = ["Damage", "Cooldown", "Knockback", "Attack Size", "", "Magic Upgrade:"];
                values = [`${this.game.adventurer.magicDamage}`, `${this.game.adventurer.magicCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.magicKnockback / 1000}`, `${this.game.adventurer.magicScale.toFixed(1)}`, "", ""
                ];
                let starting = stats.length;
                this.upgrade.currentUpgrades.forEach(upgrade => {
                    if (upgrade.type == 2) {
                        stats.push(upgrade.name);
                        if (upgrade.max != 1) values.push("x" + upgrade.current);
                    }
                });
                let end = stats.length;
                if (starting == end) stats.push("No Upgrades");
            }
        }
        if (attack == "Bomb") {
            if (!this.game.adventurer.enableBomb) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Get Upgrade to Unlock", 85 + (this.width - 50) / 2, y + 40 + (this.height - y) / 2);
            } else {
                stats = ["Damage", "Cooldown", "Knockback", "Explosion Size", "Retrieval Speed ", "Max Amount", "", "Bomb Upgrade:"];
                values = [`${this.game.adventurer.bombDamage}`, `${this.game.adventurer.bombCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.bombKnockback / 1000}`, `${this.game.adventurer.bombExplosionScale}`,
                `${this.game.adventurer.bombCooldownRetrieve.toFixed(1)} secs`, `${this.game.adventurer.bombMaxAmount}`, "", ""
                ];
                let starting = stats.length;
                this.upgrade.currentUpgrades.forEach(upgrade => {
                    if (upgrade.type == 3) {
                        stats.push(upgrade.name);
                        if (upgrade.max != 1) values.push("x" + upgrade.current);
                    }
                });
                let end = stats.length;
                if (starting == end) stats.push("No Upgrades");
            }

        } 
        ctx.textAlign = "left"; 
        ctx.textBaseline = "top"; 
        let currentY = y + 60;
        for (let line of stats) {
            ctx.fillText(line, 100, currentY);
            currentY += 20;
        }
        currentY = y + 60;
        ctx.textAlign = "right"; 
        for (let line of values) {
            ctx.fillText(line, this.width + 20, currentY);
            currentY += 20;
        }
        //Reset changes
        ctx.textAlign = "left";
        ctx.textBaseline = "center";
    }
    
}