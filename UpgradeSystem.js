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
        this.maxAmount = -1;
        this.lowerMaxAmount = 5;

        this.speedIncrease = 5;
        this.hpIncreaseAmount = 10;
        this.rollingCooldownDecrease = 0.25;
        //Sword
        this.attackScale = 0.25;
        //Bow
        this.arrowSpeedIncrease = 100;
        //Magic
        this.magicDamageIncrease = 5;
        this.cooldownReduction = 1;
        this.magicKnockback = 1000;
        this.lightningKnockback = 1000;
        this.magicSize = 0.25;
        //Bomb
        this.bombDamageIncrease = 5;
        this.bombCooldown = 0.1;
        this.bombKnockback = 1000;
        this.explosionScaleIncrease = 0.25;
        this.bombRetrieveCD = 0.5;
        this.bombMaxAmountIncrease = 1;

        this.uniqueOdds = 0.1;

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
                type: "Sword", // 0 for sword  
                max: this.maxAmount, //Number of times this upgrade can so up
                current: 0, //Current number of times selected
                color: "White", //Color of text
            },
            {
                game: this.game,
                name: "Sword Attack Speed Increase", 
                upgrade() {this.game.adventurer.attackCooldown -= this.game.upgrade.attackSpeedIncreaseAmount;
                    if (this.game.adventurer.attackCooldownTimer > this.game.adventurer.attackCooldown) {
                    this.game.adventurer.attackCooldownTimer -= this.game.upgrade.attackSpeedIncreaseAmount
                    };
                 }, 
                description: `Decreases Attack Cooldown by ${this.attackSpeedIncreaseAmount}`,
                type: "Sword",
                max: 10,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Sword Knockback Increase", 
                upgrade() {this.game.adventurer.knockback += this.game.upgrade.knockbackIncrease; }, 
                description: `Increase Sword Knockback by ${this.knockbackIncrease / 1000}`,
                type: "Sword",
                max: this.maxAmount,
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "Bow Attack Increase", 
                upgrade() {this.game.adventurer.bowDamage += this.game.upgrade.attackIncreaseAmount;}, 
                description: `Increase Bow Attack by ${this.attackIncreaseAmount}`,
                type: "Bow",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bow Attack Speed Increase", 
                upgrade() {this.game.adventurer.shootCooldown -= this.game.upgrade.attackSpeedIncreaseAmount; }, 
                description: `Decreases Bow Attack Cooldown by ${this.attackSpeedIncreaseAmount}`,
                type: "Bow",
                max: 7,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bow Knockback Increase", 
                upgrade() {this.game.adventurer.bowKnockback += this.game.upgrade.knockbackIncrease; }, 
                description: `Increase Bow Knockback by ${this.knockbackIncrease / 1000}`,
                type: "Bow",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Arrow Speed Increase", 
                upgrade() {this.game.adventurer.arrowSpeed += this.game.upgrade.arrowSpeedIncrease; }, 
                description: `Increase Arrow Speed by ${this.arrowSpeedIncrease}`,
                type: "Bow",
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
                type: "Other",
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
                type: "Other",
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
                type: "Other",
                max: 4,
                current: 0,
                color: "White",
                
            }, 
            {
                game: this.game,
                name: "Sword Attack Size Increase", 
                upgrade() {this.game.adventurer.slashScale += this.game.upgrade.attackScale; }, 
                description: `Increase Sword Attack Size by ${this.attackScale}`,
                type: "Sword",
                max: this.maxAmount,
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "Crit Chance Increase", 
                upgrade() {this.game.adventurer.critChance += 0.05; }, 
                description: `Increase Crit Chance by 5%`,
                type: "Other",
                max: 19, // to get to 100%
                current: 0,
                color: "White",
            }, 
            {
                game: this.game,
                name: "Crit Damage Increase", 
                upgrade() {this.game.adventurer.critDamage += 0.1; }, 
                description: `Increase Crit Damage by 10%`,
                type: "Other",
                max: this.maxAmount,
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
                type: "Unlock",
                max: 1,
                current: 0,
                color: "Yellow",
                
            },
            {
                game: this.game,
                name: "Magic", 
                upgrade() {this.game.adventurer.enableMagic = true;}, 
                description: `Able to use magic when weapon is sword`,
                type: "Unlock",
                max: 1,
                current: 0,
                color: "Yellow",
            
            },
            {
                game: this.game,
                name: "Lightning", 
                upgrade() {this.game.adventurer.enableLightning = true;}, 
                description: `Able to use lightning when weapon is bow`,
                type: "Unlock",
                max: 1,
                current: 0,
                color: "Yellow",
            
            },
            {
                game: this.game,
                name: "DarkBolt", 
                upgrade() {this.game.adventurer.enableBolt = true;}, 
                description: `Able to use darkbolt`,
                type: "Unlock",
                max: 1,
                current: 0,
                color: "Yellow",
            
            },
            {
                game: this.game,
                name: "Piercing Arrows", 
                upgrade() {this.game.adventurer.piercing = true;}, 
                description: `Arrows can now pierce`,
                type: "Bow",
                max: 1,
                current: 0,
                color: rgb(65, 255, 90),
                
            },
            {
                game: this.game,
                name: "All Weapon Damage Increase", 
                upgrade() {this.game.adventurer.attackDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                    this.game.adventurer.bowDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                    this.game.adventurer.magicDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                    this.game.adventurer.bombDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                    this.game.adventurer.lightingDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                    this.game.adventurer.boltDamage += (this.game.upgrade.attackIncreaseAmount * 0.4);
                 }, 
                description: `Increase all weapon damage by ${this.attackIncreaseAmount * 0.4}`,
                type: "All",
                max: this.maxAmount,
                current: 0,
                color: rgb(65, 214, 255),
            },
            // {
            //     game: this.game,
            //     name: "Sword and Bow Attack Speed Increase", 
            //     upgrade() {this.game.adventurer.attackDamage += this.game.upgrade.attackIncreaseAmount;
            //         this.game.adventurer.bowDamage += this.game.upgrade.attackIncreaseAmount;
            //         this.game.adventurer.magicDamage += this.game.upgrade.attackIncreaseAmount;
            //         this.game.adventurer.bombDamage += this.game.upgrade.attackIncreaseAmount;
            //         this.game.adventurer.lightingDamage += this.game.upgrade.attackIncreaseAmount;
            //         this.game.adventurer.boltDamage += this.game.upgrade.attackIncreaseAmount;
            //      }, 
            //     description: `Increase all weapon damage by ${this.attackScale}`,
            //     type: "Other",
            //     max: this.maxAmount,
            //     current: 0,
            //     color: rgb(65, 214, 255),
            // },
            {
                game: this.game,
                name: "Unlocks Sword and Bow Combo", 
                upgrade() {this.game.adventurer.slashArrowCombo = true; }, 
                description: `Able to supercharge arrow damage when slashing arrow with sword`,
                type: "Combo",
                max: 1,
                current: 0,
                color: rgb(170, 65, 255),
            },
            {
                game: this.game,
                name: "Triple Shot", 
                upgrade() {this.game.adventurer.tripleShot = true; }, 
                description: `Fires three arrows at once`,
                type: "Bow",
                max: 1,
                current: 0,
                color: rgb(65, 255, 90),
            }
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
                type: "Magic",
                max: 14,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Damage Increase", 
                upgrade() {this.game.adventurer.magicDamage += this.game.upgrade.magicDamageIncrease; }, 
                description: `Increase Magic Damage by ${this.magicDamageIncrease}`,
                type: "Magic",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Knockback Increase", 
                upgrade() {this.game.adventurer.magicKnockback += this.game.upgrade.magicKnockback; }, 
                description: `Increase Magic Knockback by ${this.magicKnockback/1000}`,
                type: "Magic",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Magic Size Increase", 
                upgrade() {this.game.adventurer.magicScale += this.game.upgrade.magicSize; }, 
                description: `Increase Magic Size by ${this.magicSize}`,
                type: "Magic",
                max: this.maxAmount,
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
                type: "Bomb",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Damage Increase", 
                upgrade() {this.game.adventurer.bombDamage += this.game.upgrade.bombDamageIncrease;}, 
                description: `Increase Bomb Damage by ${this.bombDamageIncrease}`,
                type: "Bomb",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Cooldown Decrease", 
                upgrade() {this.game.adventurer.bombCooldown -= this.game.upgrade.bombCooldown;}, 
                description: `Decrease Bomb Cooldown by ${this.bombCooldown.toFixed(1)} seconds`,
                type: "Bomb",
                max: 4,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Knockback Increase ", 
                upgrade() {this.game.adventurer.bombKnockback += this.game.upgrade.bombKnockback;}, 
                description: `Increase Bomb Knockback by ${this.bombKnockback / 1000}`,
                type: "Bomb",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Max Bomb Amount Increase", 
                upgrade() {this.game.adventurer.bombMaxAmount += this.game.upgrade.bombMaxAmountIncrease;}, 
                description: `Increase Max Bomb Amount by ${this.bombMaxAmountIncrease}`,
                type: "Bomb",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Bomb Retrieval CD Decrease", 
                upgrade() {this.game.adventurer.bombCooldownRetrieve -= this.game.upgrade.bombRetrieveCD;}, 
                description: `Decrease Bomb Retrieval Cooldown by ${this.bombRetrieveCD} seconds`,
                type: "Bomb",
                max: 9,
                current: 0,
                color: "White",
            },

        ];
        this.lightningList = [
            {
                game: this.game,
                name: "Lightning Cooldown Decrease", 
                upgrade() {this.game.adventurer.lightningCooldown -= 0.1; //Make sure the cooldown is not less than 0
                    if (this.game.adventurer.lightningCooldownTimer != this.game.adventurer.lightningCooldown) {
                        this.game.adventurer.lightningCooldownTimer -= 0.1;
                    }
                }, 
                description: `Decrease Lightning Cooldown by 0.25 seconds`,
                type: "Lightning",
                max: 19,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Lightning Damage Increase", 
                upgrade() {this.game.adventurer.lightingDamage += this.game.upgrade.magicDamageIncrease; }, 
                description: `Increase Lightning Damage by ${this.magicDamageIncrease}`,
                type: "Lightning",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Lightning Knockback Increase", 
                upgrade() {this.game.adventurer.lightningKnockback += this.game.upgrade.magicKnockback; }, 
                description: `Increase Lightning Knockback by ${this.lightningKnockback/1000}`,
                type: "Lightning",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "Lightning Size Increase", 
                upgrade() {this.game.adventurer.lightingScale += this.game.upgrade.magicSize; }, 
                description: `Increase Lightning Size by ${this.magicSize}`,
                type: "Lightning",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
    ];
        this.darkBoltList = [
            {
                game: this.game,
                name: "DarkBolt Size Increase", 
                upgrade() {this.game.adventurer.boltScale += this.game.upgrade.explosionScaleIncrease;}, 
                description: `Increase Darkbolt size by ${this.explosionScaleIncrease}`,
                type: "DarkBolt",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "DarkBolt Damage Increase", 
                upgrade() {this.game.adventurer.boltDamage += this.game.upgrade.bombDamageIncrease;}, 
                description: `Increase DarkBolt Damage by ${this.bombDamageIncrease}`,
                type: "DarkBolt",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "DarkBolt Cooldown Decrease", 
                upgrade() {this.game.adventurer.boltCooldown -= 0.1;}, 
                description: `Decrease DarkBolt Cooldown by 0.1 seconds`,
                type: "DarkBolt",
                max: 3,
                current: 0,
                color: "White",
            },
            // {
            //     game: this.game,
            //     name: "Darkbolt Slow Increase ", 
            //     upgrade() {this.game.adventurer.bombKnockback += this.game.upgrade.bombKnockback;}, 
            //     description: `Increase Bomb Knockback by ${this.bombKnockback / 1000}`,
            //     type: "DarkBolt",
            //     max: this.maxAmount,
            //     current: 0,
            //     color: "White",
            // },
            {
                game: this.game,
                name: "Max DarkBolt Amount Increase", 
                upgrade() {this.game.adventurer.boltMaxAmount += this.game.upgrade.bombMaxAmountIncrease;}, 
                description: `Increase Max Darkbolt Amount by ${this.bombMaxAmountIncrease}`,
                type: "DarkBolt",
                max: this.maxAmount,
                current: 0,
                color: "White",
            },
            {
                game: this.game,
                name: "DarkBolt Retrieval CD Decrease", 
                upgrade() {this.game.adventurer.boltCooldownRetrieve -= this.game.upgrade.bombRetrieveCD;}, 
                description: `Decrease Bomb Retrieval Cooldown by ${this.bombRetrieveCD}`,
                type: "DarkBolt",
                max: 19,
                current: 0,
                color: "White",
            },
        ];
        this.bombUniqueList = [
            {
                game: this.game,
                name: "Unlocks Sword and Bomb Combo", 
                upgrade() {this.game.adventurer.slashBombCombo = true; }, 
                description: `Able to bombs when slashing arrow with sword`,
                type: "Combo",
                max: 1,
                current: 0,
                color: rgb(170, 65, 255)
            },
            {
                game: this.game,
                name: "Monkey Bomb", 
                upgrade() {this.game.adventurer.monkeyBomb = true; }, 
                description: `Bombs can now attract melee enemies`,
                type: "Bomb",
                max: 1,
                current: 0,
                color: rgb(65, 255, 90)
            },
            {
                game: this.game,
                name: "Rolling Bomb", 
                upgrade() {this.game.adventurer.enableRollingBomb = true; }, 
                description: `Places a bomb when you roll. Does not comsume bomb`,
                type: "Bomb",
                max: 1,
                current: 0,
                color: rgb(65, 255, 90)
            },

        ];
        this.lightningDarkBoltList = [
            {
                game: this.game,
                name: "Unlocks Lightning and Darkbolt Combo", 
                upgrade() {this.game.adventurer.lightningDarkBoltCombo = true; }, 
                description: `Able to supercharge Darkbolt when combining it with lightning`,
                type: "Combo",
                max: 1,
                current: 0,
                color: rgb(170, 65, 255),
            }
        ];

        this.basic = [];
        this.unique = [];

        this.first = null;
        this.second = null;
        this.third = null;

        this.selectedUpgrade = null;
        this.firstTime = true;
        this.firstTimeWeapons = true;

    }
    getThreeUpgrades() {
        this.addValidUpgrade();
        let random = Math.random();
        if (this.unique.length > 0 && random < this.uniqueOdds) { //Gamble for unique upgrades // && this.totalUpgradeCount > 4
            this.first = this.getRandomUpgrade(this.unique); //Set first option to a random unique upgrade
            this.unique.splice(this.index, 1); //Remove the unique upgrade from current pool so no overlap
            this.noUpgrades1 = false;
        } else if (this.basic.length > 0) { //If we lose the chance for unique upgrade
            this.first = this.getRandomUpgrade(this.basic); //Set first option to a basic upgrade
            this.basic.splice(this.index, 1); // Remove the basic upgrade from pool so no overlap
            this.noUpgrades1 = false;
        } else if (this.unique.length > 0) { //If no more basic upgrades, use from unique pool
            this.first = this.getRandomUpgrade(this.unique); // Set to unique
            this.unique.splice(this.index, 1); 
            this.noUpgrades1 = false;
        } else {
            console.log("No upgrade");
            this.first = null;
            this.noUpgrades1 = true;
        }
        random = Math.random();
        if (this.unique.length > 0 && random < this.uniqueOdds) {
            this.second = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
            this.noUpgrades2 = false;
        } else if (this.basic.length > 0) {
            this.second = this.getRandomUpgrade(this.basic);
            this.basic.splice(this.index, 1);
            this.noUpgrades2 = false;
        } else if (this.unique.length > 0) {
            this.second = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
            this.noUpgrades2 = false;
        } else {
            console.log("No upgrade");
            this.second = null;
            this.noUpgrades2 = true;
        }
        random = Math.random();
        if (this.unique.length > 0 && random < this.uniqueOdds) { //Gamble for unique upgrades
            this.third = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
            this.noUpgrades3 = false;
        } else if (this.basic.length > 0) { //Defaults to basic upgrades
            this.third = this.getRandomUpgrade(this.basic);
            this.basic.splice(this.index, 1);
            this.noUpgrades3 = false;
        } else if (this.unique.length > 0) { //If no more basic, then use unique upgrades
            this.third = this.getRandomUpgrade(this.unique);
            this.unique.splice(this.index, 1);
            this.noUpgrades3 = false;
        } else { // No upgrades left
            console.log("No upgrade");
            this.third = null;
            this.noUpgrades3 = true;
        }
        this.selectedUpgrade = null;
        this.resetList();
        if (this.noUpgrades1 && this.noUpgrades2 && this.noUpgrades3) {
            this.noUpgrades = true;
            // this.game.adventurer.health = this.game.adventurer.maxhealth;
        } else {
            this.noUpgrades = false;
        }
        
    }
    addValidUpgrade() {
        for (let i = 0; i < this.basicList.length; i++) {
            if (this.basicList[i].max > this.basicList[i].current || this.basicList[i].max == -1) { //If the amount of time chosen does not reach the max, then add to upgrade pool
                this.basic.push(this.basicList[i]);
            }
        }
        for (let i = 0; i < this.uniqueList.length; i++) { //Lower chance stuff
            if (this.uniqueList[i].max > this.uniqueList[i].current || this.uniqueList[i].max == -1) {
                this.unique.push(this.uniqueList[i]);
            }
        }
        if (this.game.adventurer.enableMagic) {
            for (let i = 0; i < this.magicList.length; i++) { //If we get magic enabled, add to basic pool
                if (this.magicList[i].max > this.magicList[i].current || this.magicList[i].max == -1) {
                    this.basic.push(this.magicList[i]);
                }
            }
        }
        if (this.game.adventurer.enableBomb) {
            for (let i = 0; i < this.bombList.length; i++) { //If we get magic enabled, add to basic pool
                if (this.bombList[i].max > this.bombList[i].current || this.bombList[i].max == -1) {
                    this.basic.push(this.bombList[i]);
                }
            }
            for (let i = 0; i < this.bombUniqueList.length; i++) {
                if (this.bombUniqueList[i].max > this.bombUniqueList[i].current || this.bombUniqueList[i]. max == -1) this.unique.push(this.bombUniqueList[i]);
            }
        }
        if (this.game.adventurer.enableLightning) {
            for (let i = 0; i < this.lightningList.length; i++) {
                if (this.lightningList[i].max > this.lightningList[i].current || this.lightningList[i].max == -1) {
                    this.basic.push(this.lightningList[i]);
                }
            }
        }
        if (this.game.adventurer.enableBolt) {
            for (let i = 0; i < this.darkBoltList.length; i++) {
                if (this.darkBoltList[i].max > this.darkBoltList[i].current || this.darkBoltList[i].max == -1) {
                    this.basic.push(this.darkBoltList[i]);
                }
            }
        }
        
        if (this.game.adventurer.enableLightning && this.game.adventurer.enableBolt) {
            if (this.lightningDarkBoltList[0].max > this.lightningDarkBoltList[0].current) this.unique.push(this.lightningDarkBoltList[0]);
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
                if ((this.game.keys["1"] && !this.noUpgrades1) || (this.game.isClicking(x - 300, y, width, height) && 
                this.game.leftClick && !this.noUpgrades1)) 
                {
                    this.selectedUpgrade = this.first;
                }
                //Option 2 keys and mouse area
                if ((this.game.keys["2"] && !this.noUpgrades2) || (this.game.isClicking(x, y, width, height) && 
                this.game.leftClick && !this.noUpgrades2)) 
                {
                    this.selectedUpgrade = this.second;
                }
                //Option 3 keys and mouse area
                if ((this.game.keys["3"] && !this.noUpgrades3) || (this.game.isClicking(x + 300, y, width, height) && 
                this.game.leftClick && !this.noUpgrades3)) 
                {
                    this.selectedUpgrade = this.third;
                }
                //Selection Button location
                if (this.selectedUpgrade != null && 
                    this.game.isClicking(this.centerButtonX + 150, this.centerButtonY, this.buttonWidth, this.buttonHeight) ||
                    this.selectedUpgrade != null && this.game.keys["enter"]) 
                {
                    this.updateChoice(this.selectedUpgrade);
                    this.game.keys["enter"] = false;
                }
                //Reroll Button location
                if (this.game.isClicking(this.centerButtonX - 150, this.centerButtonY, this.buttonWidth, this.buttonHeight) && 
                this.canReroll || this.game.keys["r"] && this.canReroll) 
                {
                    this.getThreeUpgrades();
                    this.game.adventurer.coins -= 10;
                    this.game.keys["r"] = false;
                    this.game.click = {x:0, y:0};
                    this.selectedUpgrade = null;
                    this.rerollTimer = 0.5;
                }
                //Player stat location
                if (this.checkHeroStatus()) {
                    ASSET_MANAGER.playAsset("./Audio/SoundEffects/Select.mp3");
                    this.enablePlayerStats = true;
                    this.game.click = {x:0, y:0};
                }
                //Exit Button
                if (this.checkExitButton(this.game.click.x, this.game.click.y, true)) {
                    this.game.click = {x:0, y:0};
                    this.game.toggleUpgradePause();
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
    checkExitButton(mouseX, mouseY, clicking) {
        if (mouseX > PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - 10 && mouseX < PARAMS.CANVAS_WIDTH + this.exitButtonSize.width &&
            mouseY > 10 && mouseY < 10 + this.exitButtonSize.height && clicking) {
                ASSET_MANAGER.playAsset("./Audio/SoundEffects/Back.mp3");
            }
        return mouseX > PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - 10 && mouseX < PARAMS.CANVAS_WIDTH + this.exitButtonSize.width &&
        mouseY > 10 && mouseY < 10 + this.exitButtonSize.height;
    }
    checkHeroStatus() {
        let circleX = this.heroIconX + (this.heroIconLength * this.heroIconScale / 2);
        let circleY = this.heroIconY + (this.heroIconHeight * this.heroIconScale / 2);
        let circle = {x: circleX, y: circleY};
        let circleRadius = (this.heroIconHeight / 2) * this.heroIconScale;
        return getDistance(this.game.click, circle) < circleRadius;
    }
    updateChoice(upgrade) {
        this.selectedUpgrade = upgrade;
        upgrade.upgrade();
        //CHange to add to object updteas count of upgrade used
        upgrade.current++;
        this.incrementType(upgrade.type);
        if (this.currentUpgrades.length > 0) {
            let count = 0;
            for (let i = 0; i < this.currentUpgrades.length; i++) { //See if the upgrade is in the current hero
                if (this.currentUpgrades[i] == upgrade) count++;
            }
            if (count == 0) this.currentUpgrades.push(upgrade);
        } else {
            this.currentUpgrades.push(upgrade);
        }
        if (this.swordUpgradeCount >= 5) this.updateSwordLevel();
        if (this.bowUpgradeCount >= 5) this.updateBowLevel();
        if (this.game.upgradePause) {
            if (this.points > 1) {
                this.points--;
                //Timer reroll
                this.getThreeUpgrades();
                if (!this.noUpgrades3) {
                    this.rerollTimer = 0.5; //Trigger for upgrades
                }
            } else {
                this.points--;
                if(this.game.settings.enableLevelUpPause) this.game.toggleUpgradePause();
                this.makingChoice = false;
            }
        }
        this.game.keys["1"] = false;
        this.game.keys["2"] = false;
        this.game.keys["3"] = false;
        this.game.leftClick = false;
        this.selectedUpgrade = null;
    }
    incrementType(type) {
        if (type == "Sword") {
            this.swordUpgradeCount++;
        } else if (type == "Bow") {
            this.bowUpgradeCount++;
        } else if (type == "All") {
            this.swordUpgradeCount++;
            this.bowUpgradeCount++;
        } else {
            this.otherUpgradeCount++;
        }
        this.totalUpgradeCount = this.swordUpgradeCount + this.bowUpgradeCount + this.otherUpgradeCount;
    }
    updateSwordLevel() {
        // if (this.game.adventurer.swordUpgrade >= 20) {
        //     this.game.adventurer.swordUpgrade = 4;
        // } else 
        if (this.swordUpgradeCount >= 20) {
            this.game.adventurer.swordUpgrade = 3;
        } else if (this.swordUpgradeCount >= 10) {
            this.game.adventurer.swordUpgrade = 2;
        } else {
            this.game.adventurer.swordUpgrade = 1;
        }
        // this.game.adventurer.swordUpgrade = 1;
    }
    updateBowLevel() {
        // if (this.game.adventurer.swordUpgrade >= 20) {
        //     this.game.adventurer.swordUpgrade = 4;
        // } else 
        if (this.bowUpgradeCount >= 20) {
            this.game.adventurer.bowUpgrade = 3;
        } else if (this.bowUpgradeCount >= 10) {
            this.game.adventurer.bowUpgrade = 2;
        } else {
            this.game.adventurer.bowUpgrade = 1;
        }
        // this.game.adventurer.swordUpgrade = 1;
    }
    draw(ctx) {
        //visual for upgrade screen
        if (this.makingChoice) {
            if (this.enablePlayerStats) {
                ctx.clearRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
                this.player.draw(ctx);
            } else {
                this.game.draw(ctx); // Only way to make it transparent
                this.upgradeBackground(ctx);
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
                        PARAMS.CANVAS_WIDTH / 2 - 300, PARAMS.CANVAS_HEIGHT / 2 + 50,
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
                        PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 50,
                        250, 25
                    );
                    ctx.fillText(`x${this.second.current}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 190);
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
                        PARAMS.CANVAS_WIDTH / 2 + 300, PARAMS.CANVAS_HEIGHT / 2 + 50,
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
                this.heroStatus(ctx); //Last so it draw over everything
            }
        } 
        this.exitButton(ctx);
        this.game.resetDrawingValues();
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
            //First Upgrade
            ctx.beginPath();
            if (this.game.isHovering(x - 300, y, width, height) && !this.noUpgrades1 || 
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
            if (this.game.isHovering(x, y, width, height) && !this.noUpgrades2 || 
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
            if (this.game.isHovering(x + 300, y, width, height) && !this.noUpgrades3 || 
                this.selectedUpgrade == this.third && this.selectedUpgrade != null
            ) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.selectedUpgrade == this.third && this.selectedUpgrade != null) {
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

            if (this.game.isHovering(this.centerButtonX - 150, this.centerButtonY, this.buttonWidth, this.buttonHeight) 
                && this.canReroll) 
            {
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
                if (this.game.isHovering(this.centerButtonX + 150, this.centerButtonY, this.buttonWidth, this.buttonHeight)
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
    heroStatus(ctx) {
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.font = '18px "Press Start 2P"';
        let circleX = this.heroIconX + (this.heroIconLength * this.heroIconScale / 2);
        let circleY = this.heroIconY + (this.heroIconHeight * this.heroIconScale / 2);
        let circle = {x: circleX, y: circleY};
        let circleRadius = (this.heroIconHeight / 2) * this.heroIconScale;
        let padding = 10;
        if(getDistance(this.game.mouse, circle) < circleRadius) {
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
            ctx.fillText(line, x, y);
            line = ' ' + words[i] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, y);
    }
    exitButton(ctx) {
        let buffer = 10;
        ctx.beginPath();
        ctx.roundRect(PARAMS.CANVAS_WIDTH - this.exitButtonSize.width - buffer, buffer, this.exitButtonSize.width, this.exitButtonSize.height, [10, 30, 10, 10]);
        ctx.lineWidth = 5;
        ctx.strokeStyle = rgb(200, 0, 0);
        (this.checkExitButton(this.game.mouse.x, this.game.mouse.y, false)) ? ctx.fillStyle = rgb(100, 0, 0) : ctx.fillStyle = rgb(150, 0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.font = '36px "Press Start 2P"';
        ctx.fillStyle = rgb(255, 0, 0);
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillText("X", PARAMS.CANVAS_WIDTH - 60, 32.5)
    }
    giveAllUpgrade() {
        if (this.firstTime) {
            this.currentUpgrades.push(...this.basicList);
            this.currentUpgrades.push(...this.uniqueList);
            this.currentUpgrades.push(...this.bombList);
            this.currentUpgrades.push(...this.magicList);
            this.currentUpgrades.push(...this.lightningList);
            this.currentUpgrades.push(...this.darkBoltList);
            this.currentUpgrades.push(...this.bombUniqueList);
            this.currentUpgrades.push(...this.lightningDarkBoltList);
            this.currentUpgrades.forEach(upgrade => {
                if (upgrade.max == -1) {
                    for(let i = 0; i < 20; i++) {
                        upgrade.upgrade();
                    upgrade.current++;
                    }
                } else {
                    while(upgrade.current < upgrade.max) {
                        upgrade.upgrade();
                        upgrade.current++;
                    }
                }
            });
            this.firstTime = false;
        }
    }
    // unlockAllWeapons() {
    //     if (this.firstTimeWeapons) {
    //     this.uniqueList.forEach(upgrade => {
    //         if (upgrade.type == "Unlock") {
    //             upgrade.current++;
    //             this.currentUpgrades.push(upgrade);
    //         }
    //     });
    //     this.firstTimeWeapons = false;
    //     }
    // }
}
class PlayerStatus {
    constructor(game, upgrade) {
        Object.assign(this, {game, upgrade});

        this.exitButtonSize = {width: 100, height: 40};
        this.healthBarSize = {width: 300, height: 25};
        this.selected = "Sword";
        // this.background = 
        this.startX = 60;
        this.startY = 60;
        this.width = PARAMS.CANVAS_WIDTH / 2 - this.startX;
        this.height = PARAMS.CANVAS_HEIGHT - this.startY * 2;

        this.bombAnimation = this.bombAnimation = new Animator(ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png"), 0, 16, 16, 16, 4, 0.1, false, true);
        this.background = ASSET_MANAGER.getAsset("./Sprites/HudIcons/PlayerBackground.png");
        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.animation = [];
        this.actions = 0;
        this.swordDuration = 0.9;
        this.currentTimer = 0;
        this.bowDuration = 0.75;
        this.magicDuration = 0.55;
        this.rollDuration = 0.55;
        this.bombDuration = 0.35;

        this.upgradeMenu = false;

        this.upgradeButton = {length: 200, height: 40};

        this.pageCount = 1;

        this.stats = [];
        this.values = [];
        this.upgradePage1Stats = [];
        this.upgradePage1Values = [];
        this.upgradePage2Stats = [];
        this.upgradePage2Values = [];

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
        this.animation[2] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/BowLeft.png"), 0, -8, 32, 32, 8, 0.1, true, false);
        //Magic
        this.animation[3] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 320, 32, 32, 6, 0.1, true, false);
        //Bomb
        this.animation[4] = new Animator(ASSET_MANAGER.getAsset("./Sprites/Adventurer/AdventurerSprite2Flipped.png"), 224, 160, 32, 32, 6, 0.1, true, false);
    }
    update() {
        this.healthRatio = this.game.adventurer.health / this.game.adventurer.maxhealth;
        this.stamina = (this.game.adventurer.rollCooldown - this.game.adventurer.rollCooldownTimer) / this.game.adventurer.rollCooldown;
        this.experience = this.game.adventurer.experience / this.game.adventurer.experienceToNextLvl;

        let button = {width: (this.width - 20) / 4, height: 40};

        let y = this.startY + 50 + 10 + this.healthBarSize.height * 2 + 20 + 70 + 40;
        if (this.game.keys["1"] || this.game.isClicking(this.startX + 10, y, button.width, button.height)) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Audio_Music_Slash.mp3");
            this.animation[1].elapsedTime = 0;
            this.actions = 1;
            this.currentTimer = this.swordDuration;
            this.game.keys["1"] = false;
            this.selected = "Sword";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["2"] || this.game.isClicking(this.startX + 10 + button.width, y, button.width, button.height)) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Arrows.mp3");
            this.animation[2].elapsedTime = 0;
            this.actions = 2;
            this.currentTimer = this.bowDuration;
            this.game.keys["2"] = false;
            this.selected = "Bow";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["3"] || this.game.isClicking(this.startX + 10 + button.width * 2, y, button.width, button.height)) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/Bomb Placing.wav");
            this.animation[4].elapsedTime = 0;
            this.actions = 4;
            this.currentTimer = this.rollDuration;
            this.game.keys["3"] = false;
            this.selected = "Bomb";
            this.game.click = {x: 0, y: 0};
        }
        if (this.game.keys["4"] || this.game.isClicking(this.startX + 10 + button.width * 3, y, button.width, button.height)) {
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/LightningStrike.mp3");
            this.animation[3].elapsedTime = 0;
            this.actions = 3;
            this.currentTimer = this.magicDuration;
            this.game.keys["4"] = false;
            this.selected = "DKBolt";
            this.game.click = {x: 0, y: 0};
        }
        //Upgrade viewer button
        let upgradeButtonX = this.startX + this.width / 2 - this.upgradeButton.length / 2;
        let upgradeButtonY = y - 30 + this.width - 25 * 2 + 20 - 40;
        //Upgrade Button
        if (this.game.isClicking(upgradeButtonX, upgradeButtonY, this.upgradeButton.length, this.upgradeButton.height)) {
            this.game.click = {x:0, y:0};
            this.toggleUpgradeMenu();
        }
        if (this.upgrade.checkExitButton(this.game.click.x, this.game.click.y, true) && this.game.upgradePause) {
            this.game.click = {x:0, y:0};
            this.upgrade.enablePlayerStats = false;
            this.upgradeMenu = false;
        }
        if (this.upgrade.checkExitButton(this.game.click.x, this.game.click.y, true) && this.game.deathScreen.showUpgrade) {
            this.game.click = {x:0, y:0};
            this.game.deathScreen.showUpgrade = false;
        }
        if (this.upgrade.checkExitButton(this.game.click.x, this.game.click.y, true) && this.game.winScreen.showUpgrade) {
            this.game.click = {x:0, y:0};
            this.game.winScreen.showUpgrade = false;
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
        if (this.actions == 4 && this.currentTimer <= 0) {
            this.actions = 0;
            this.animation[0].elapsedTime = 0;
        }
        if (this.currentTimer > 0) {
            this.currentTimer -= this.game.pauseTick;
        }
        //Page Change Button
        if (this.game.isClicking(PARAMS.CANVAS_WIDTH / 2 + this.width / 2 - this.upgradeButton.length / 2, upgradeButtonY, this.upgradeButton.length, this.upgradeButton.height)) {
            this.game.click = {x:0, y:0};
            this.togglePage();
        }

    }
    draw(ctx) {
        let adventurer = this.game.adventurer;

        this.drawBackground(ctx);
        ctx.fillStyle = "White";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText("Player Stats:", this.startX + this.width / 2, this.startY + 25);
        this.drawHP(ctx);
        this.drawEXP(ctx);
        let statList = ["Speed:", "Stamina Cooldown:", "Crit Chance:", "Crit Damage"];
        let statValues = [`${adventurer.speed.toFixed(0)}`, `${adventurer.rollCooldown} secs`, 
            `${(adventurer.critChance * 100).toFixed(0)}%`, `${(adventurer.critDamage * 100).toFixed(0)}%`]
        let buffer = 20;
        let Y = this.startY + 50 + 10 + this.healthBarSize.height * 2 + buffer;
        ctx.font = '12px "Press Start 2P"';

        let currentY = Y;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "top"; 
        for (let line of statList) {
            ctx.fillText(line, this.startX + buffer, currentY);
            currentY += 20;
        }
        currentY = Y;
        ctx.textAlign = "right"; 
        for (let line of statValues) {
            ctx.fillText(line, this.width + this.startX - buffer, currentY);
            currentY += 20;
        }

        ctx.beginPath();
        ctx.moveTo(this.startX, currentY + 10);
        ctx.lineTo(this.width + this.startX, currentY + 10);
        ctx.lineWidth = 3;
        ctx.stroke();
        this.drawAttacksBackground(ctx, currentY + 30);
        this.drawUpgradeButton(ctx);
        this.drawMultipliers(ctx);
        this.drawCoins(ctx);
        if (this.actions == 4) this.bombAnimation.drawFrame(this.game.pauseTick, ctx, PARAMS.CANVAS_WIDTH * 0.75 - (16 * 15) / 2, PARAMS.CANVAS_HEIGHT / 2 + 70, 15);
        this.animation[this.actions].drawFrame(this.game.pauseTick, ctx, PARAMS.CANVAS_WIDTH * 0.75 - (32 * 15) / 2 - 30, PARAMS.CANVAS_HEIGHT / 2 - 140, 15);
        if (this.upgradeMenu) {
            this.displayUpgrades(ctx);
        }
        this.game.resetDrawingValues();

    }
    drawBackground(ctx) {
        ctx.drawImage(this.background, 
            0, 0, 
            1024, 768, 
            0, 0, 
            PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT
        );


        ctx.beginPath();
        ctx.roundRect(this.startX, this.startY, this.width, this.height, [10]);
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 3;
        ctx.fillStyle = rgba(38, 38, 38, 0.9);
        ctx.fill();
        ctx.stroke();
    }
    drawHP(ctx) {
        let X = this.startX + this.width / 2 - this.healthBarSize.width / 2;
        let Y = this.startX + 50;
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
        let X = this.startX + this.width / 2 - this.healthBarSize.width / 2;
        let Y = this.startY + 50 + 10 + this.healthBarSize.height;
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
    drawUpgradeButton(ctx) {
        let oldY = this.startY + 50 + 10 + this.healthBarSize.height * 2 + 20 + 70;
        let y = oldY - 30 + this.width - 25 * 2 + 20;
        ctx.beginPath();
        let currentX = this.startX + this.width / 2 - this.upgradeButton.length / 2;
        ctx.lineWidth = 2;
        ctx.roundRect(currentX, y, this.upgradeButton.length, this.upgradeButton.height, [10, 10, 10, 10]);
        ctx.strokeStyle = "Black";
        if (this.game.isHovering(currentX, y, this.upgradeButton.length, this.upgradeButton.height)) {
            ctx.fillStyle = rgb(70, 70, 70);
        } else {
            ctx.fillStyle = rgb(100, 100, 100);
        }
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = "White";    
        ctx.fillText("View Upgrades", currentX + this.upgradeButton.length / 2, y + this.upgradeButton.height / 2);
    }
    drawPageButton(ctx) {
        let oldY = this.startY + 50 + 10 + this.healthBarSize.height * 2 + 20 + 70;
        let y = oldY - 30 + this.width - 25 * 2 + 20;
        ctx.beginPath();
        let currentX = PARAMS.CANVAS_WIDTH / 2 + this.width / 2 - this.upgradeButton.length / 2;
        ctx.lineWidth = 2;
        ctx.roundRect(currentX, y, this.upgradeButton.length, this.upgradeButton.height, [10, 10, 10, 10]);
        ctx.strokeStyle = "Black";
        if (this.game.isHovering(currentX + 20, y, this.upgradeButton.length - 20, this.upgradeButton.height)) {
            ctx.fillStyle = rgb(70, 70, 70);
        } else {
            ctx.fillStyle = rgb(100, 100, 100);
        }
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle";
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = "White";    
        ctx.fillText(`Page ${this.pageCount}`, currentX + this.upgradeButton.length / 2, y + this.upgradeButton.height / 2);
        ctx.font = '10px "Press Start 2P"';
    }
    drawAttacksBackground(ctx, y) {
        let mouseX = 0;
        let mouseY = 0;
        let offset = 25;
        if (this.game.mouse != null) {
            mouseX = this.game.mouse.x;
            mouseY = this.game.mouse.y;
        }
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.roundRect(this.startX + offset, y + 40, this.width - offset * 2, this.height - y - 50, [0, 0, 10, 10]);
        ctx.strokeStyle = "Black";
        ctx.fillStyle = rgba(101, 101, 101, 0.5);
        ctx.fill();
        ctx.stroke();

        let attacks = ["Sword", "Bow", "Bomb", "DKBolt"];
        let button = {width: (this.width - offset * 2) / attacks.length, height: 40};
        let currentX = this.startX + offset;
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
            ctx.fillStyle = "White";    
            ctx.fillText(attack, currentX + button.width / 2, y + button.height / 2);
            currentX += button.width;
        }
        ctx.textAlign = "left"; 
        ctx.textBaseline = "alphabetic";
    }
    displayAttackStats(ctx, attack, y) {
        let stats = [];
        let values = [];
        let magicStats = [];
        let magicValues = [];
        let title = [];
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = "White"; 
        if (attack == "Sword") {
            title.push("Basic Sword Stats:");
            stats = ["Damage", "Attack Speed", "Knockback", "Attack Size", ""];
            values = [`${this.game.adventurer.attackDamage}`, `${this.game.adventurer.attackCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.knockback / 1000}`, `${this.game.adventurer.slashScale.toFixed(1)}`, ""
            ];
            if (this.game.adventurer.enableMagic) {
                title.push("Magic Slash Stats:");
                magicStats = ["Damage", "Cooldown", "Knockback", "Attack Size"];
                magicValues = [`${this.game.adventurer.magicDamage}`, `${this.game.adventurer.magicCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.magicKnockback / 1000}`, `${this.game.adventurer.magicScale.toFixed(1)}`
                ];
            }
                
        }
        if (attack == "Bow") {
            title.push("Basic Bow Stats:");
            stats = ["Damage", "Attack Speed", "Knockback", "Arrow Speed", ""];
            values = [`${this.game.adventurer.bowDamage}`, `${this.game.adventurer.shootCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.bowKnockback / 1000}`, `${this.game.adventurer.arrowSpeed}`, ""
            ];
            if (this.game.adventurer.enableLightning) {
                title.push("Lightning Strike Stats:");
                magicStats = ["Damage", "Cooldown", "Knockback", "Attack Size"];
                magicValues = [`${this.game.adventurer.lightingDamage}`, `${this.game.adventurer.lightningCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.lightningKnockback / 1000}`, `${this.game.adventurer.lightningScale.toFixed(1)}`
                ];
            }
            // let starting = stats.length;
            // this.upgrade.currentUpgrades.forEach(upgrade => {
            //     if (upgrade.type == 1) {
            //         stats.push(upgrade.name);
            //         if (upgrade.max != 1) values.push("x" + upgrade.current);
            //     }
            // });
            // let end = stats.length;
            // if (starting == end) stats.push("No Upgrades");
        }
        if (attack == "Bomb") {
            if (!this.game.adventurer.enableBomb) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Get Upgrade to Unlock", this.startX + 25 + (this.width - 50) / 2, y + 20 + (this.height - y) / 2); //this.height - y - 50
            } else {
                title.push("Bomb Stats:");
                stats = ["Damage", "Cooldown", "Knockback", "Explosion Size", "Retrieval Speed ", "Max Amount", ""];
                values = [`${this.game.adventurer.bombDamage}`, `${this.game.adventurer.bombCooldown.toFixed(1)} secs`,
                `${this.game.adventurer.bombKnockback / 1000}`, `${this.game.adventurer.bombExplosionScale}`,
                `${this.game.adventurer.bombCooldownRetrieve.toFixed(1)} secs`, `${this.game.adventurer.bombMaxAmount}`, ""
                ];
                // let starting = stats.length;
                // this.upgrade.currentUpgrades.forEach(upgrade => {
                //     if (upgrade.type == 3) {
                //         stats.push(upgrade.name);
                //         if (upgrade.max != 1) values.push("x" + upgrade.current);
                //     }
                // });
                // let end = stats.length;
                // if (starting == end) stats.push("No Upgrades");
            }

        }
        if (attack == "DKBolt") {
            if (!this.game.adventurer.enableBolt) {
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Get Upgrade to Unlock", this.startX + 25 + (this.width - 50) / 2, y + 20 + (this.height - y) / 2);
            } else {
                title.push("Dark Bolt Stats:");
                stats = ["Damage", "Cooldown", "Explosion Size", "Retrieval Speed ", "Max Amount", ""];
                values = [`${this.game.adventurer.boltDamage}`, `${this.game.adventurer.boltCooldown.toFixed(1)} secs`,
                    `${this.game.adventurer.boltScale}`, `${this.game.adventurer.boltCooldownRetrieve.toFixed(1)} secs`, 
                    `${this.game.adventurer.boltMaxAmount}`
                ];
                // let starting = stats.length;
                // this.upgrade.currentUpgrades.forEach(upgrade => {
                //     if (upgrade.type == 3) {
                //         stats.push(upgrade.name);
                //         if (upgrade.max != 1) values.push("x" + upgrade.current);
                //     }
                // });
                // let end = stats.length;
                // if (starting == end) stats.push("No Upgrades");
            }
        }

        // }
        // let fontSize = 12;
        // console.log(stats.length);
        // if (stats.length > 20) {
        //     fontSize = 12;
        // }
        // if (stats.length > 23) {
        //     fontSize = 10;
        // }
        // if (stats.length > 25) {
        //     fontSize = 8;
        // }
        // ctx.font = fontSize + 'px "Press Start 2P"'
        // 20 - 12, 23 - 11
        if (stats.length > 0) {
            ctx.textAlign = "left"; 
            ctx.textBaseline = "top"; 
            let currentY = y + 60;
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(title[0], this.startX + 40, currentY); //Title of stat
            currentY += 25;
            ctx.font = '12px "Press Start 2P"';
    
            for (let line of stats) {
                ctx.fillText(line, this.startX + 40, currentY);
                currentY += 20;
            }
            currentY = y + 85;
            ctx.textAlign = "right"; 
            for (let line of values) {
                ctx.fillText(line, this.width + 20, currentY);
                currentY += 20;
            }
    
            if (magicStats.length > 0) {
                let nextY = currentY;
                ctx.textAlign = "left"; 
                ctx.font = '14px "Press Start 2P"';
                ctx.fillText(title[1], this.startX + 40, currentY); //title of stat
                nextY += 25;
                ctx.font = '12px "Press Start 2P"';
    
                for (let line of magicStats) {
                    ctx.fillText(line, this.startX + 40, nextY);
                    nextY += 20;
                }
                nextY = currentY + 25;
                ctx.textAlign = "right"; 
                for (let line of magicValues) {
                    ctx.fillText(line, this.width + 20, nextY);
                    nextY += 20;
                }
            }
        }
        //Reset changes
        ctx.textAlign = "left";
        ctx.textBaseline = "center";
    }
    displayUpgrades(ctx) {
        ctx.beginPath();
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2, this.startY, this.width, this.height, [10]);
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 3;
        ctx.fillStyle = rgba(39, 39, 39, 0.9);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "top"; 
        let y = this.startY + 25;
        // let stats = [];
        // let values = [];
        let sword = ["Sword Upgrade:"];
        let bow = ["Bow Upgrade:"];
        let swordSpecial = ["Sword Magic Upgrade:"];
        let bowSpecial = ["Bow Magic Upgrade:"];
        let darkBolt = ["DarkBolt Upgrade:"];
        let bomb = ["Bomb Upgrade:"];
        let combo = ["Combo:"];
        let other = ["Other Upgrade:"];

        let swordAmount = [""];
        let bowAmount = [""];
        let swordSpecialAmount = [""];
        let bowSpecialAmount = [""];
        let darkBoltAmount = [""];
        let bombAmount = [""];
        let comboAmount = [""];
        let otherAmount = [""];
        let list = [sword, bow, swordSpecial, bowSpecial, bomb, darkBolt, combo, other];
        let list2 = [swordAmount, bowAmount, swordSpecialAmount, bowSpecialAmount, bombAmount, darkBoltAmount, comboAmount, otherAmount];
        let upgradeAmount = 0;
        this.upgrade.currentUpgrades.forEach(upgrade => {
            if (upgrade.type == "Sword") {
                upgradeAmount++;
                sword.push(upgrade.name);
                (upgrade.max != 1) ? swordAmount.push("x" + upgrade.current) : swordAmount.push("");
            }
            if (upgrade.type == "Bow") {
                upgradeAmount++;
                bow.push(upgrade.name);
                (upgrade.max != 1) ? bowAmount.push("x" + upgrade.current) : bowAmount.push("");
            }
            if (upgrade.type == "Magic") {  //Sword Magic
                upgradeAmount++;
                swordSpecial.push(upgrade.name);
                (upgrade.max != 1) ? swordSpecialAmount.push("x" + upgrade.current) : swordSpecialAmount.push("");
            }
            if (upgrade.type == "Bomb") { //Bomb
                upgradeAmount++;
                bomb.push(upgrade.name);
                (upgrade.max != 1) ? bombAmount.push("x" + upgrade.current) : bombAmount.push("");
            }
            if (upgrade.type == "Lightning") { //BowMagic
                upgradeAmount++;
                bowSpecial.push(upgrade.name);
                (upgrade.max != 1) ? bowSpecialAmount.push("x" + upgrade.current) : bowSpecialAmount.push("");
            }
            if (upgrade.type == "DarkBolt") { //DarkBolt
                upgradeAmount++;
                darkBolt.push(upgrade.name);
                (upgrade.max != 1) ? darkBoltAmount.push("x" + upgrade.current) : darkBoltAmount.push("");
            }
            if (upgrade.type == "Combo") {
                upgradeAmount++;
                combo.push(upgrade.name);
                (upgrade.max != 1) ? comboAmount.push("x" + upgrade.current) : comboAmount.push("");
            }
            if (upgrade.type == "Other" || upgrade.type == "All") {
                upgradeAmount++;
                other.push(upgrade.name);
                (upgrade.max != 1) ? otherAmount.push("x" + upgrade.current) : otherAmount.push("");
            }
        });
        ctx.font = '24px "Press Start 2P"';
        ctx.fillStyle = "White";
        if (this.upgrade.currentUpgrades == 0) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("No Upgrades", PARAMS.CANVAS_WIDTH / 2 + 25 + (this.width - 50) / 2, y + 40 + (this.height - y) / 2);
        } else {
            for (let i of list) {
                if (i.length > 1) {
                    this.stats.push(...i);
                    this.stats.push("");
                }
            }
            for (let i of list2) {
                if (i.length > 1) {
                    this.values.push(...i);
                    this.values.push("");
                }
            }
        }
        // console.log(this.stats);
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = "White";
        let currentY = y;
        if (this.stats.length > 35) {
            this.drawPageButton(ctx);
            for (let i = 0; i < 35; i++) {
                this.upgradePage1Stats.push(this.stats[i]);
                this.upgradePage1Values.push(this.values[i]);
            }
            let current = 35;
            while (current < this.stats.length) {
                this.upgradePage2Stats.push(this.stats[current]);
                this.upgradePage2Values.push(this.values[current]);
                current++;
            }
            if (this.upgradePage2Stats[0] == "") {
                this.upgradePage2Stats.shift();
                this.upgradePage2Values.shift();
            } 

            if (this.pageCount == 1) {
                ctx.textAlign = "left"
                for (let line of this.upgradePage1Stats) {
                    ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + 25, currentY);
                    currentY += 15;
                }
                currentY = y;
                ctx.textAlign = "right"; 
                for (let line of this.upgradePage1Values) {
                    ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + this.width - 25, currentY);
                    currentY += 15;
                }
            } else if (this.pageCount == 2) {
                ctx.textAlign = "left"
                for (let line of this.upgradePage2Stats) {
                    ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + 25, currentY);
                    currentY += 15;
                }
                currentY = y;
                ctx.textAlign = "right"; 
                for (let line of this.upgradePage2Values) {
                    ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + this.width - 25, currentY);
                    currentY += 15;
                }
            }
        }
        else {
            for (let line of this.stats) {
                ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + 25, currentY);
                currentY += 15;
            }
            currentY = y;
            ctx.textAlign = "right"; 
            for (let line of this.values) {
                ctx.fillText(line, PARAMS.CANVAS_WIDTH / 2 + this.width - 25, currentY);
                currentY += 15;
            }
        }
        this.resetLists();

    }
    resetLists() {
        this.stats = [];
        this.values = [];
        this.upgradePage1Stats = [];
        this.upgradePage2Stats = [];
        this.upgradePage1Values = [];
        this.upgradePage2Values = [];
    }
    toggleUpgradeMenu() {
        this.upgradeMenu = !this.upgradeMenu;
    }
    togglePage() {
        if (this.pageCount == 1) {
            this.pageCount = 2;
        } else {
            this.pageCount = 1;
        }
    }
    drawCoins(ctx) {
        let buffer = (5 * 3.5) / 2;
        ctx.font = '12px "Press Start 2P"';
        let width = ctx.measureText(this.game.adventurer.coins.toString()).width + 20 + buffer * 2;
        let height = buffer * 2 + 20;
        ctx.beginPath();
        ctx.fillStyle = rgba(101, 101, 101, 0.5);
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 2;
        ctx.roundRect(PARAMS.CANVAS_WIDTH * 0.75 - width / 2, this.startY + buffer, width, height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "White";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(this.game.adventurer.coins, PARAMS.CANVAS_WIDTH * 0.75 - width / 2 + buffer + 20, this.startY + buffer + height / 2);
        ctx.drawImage(this.coinImage, 
            14, 143, 
            5, 5, 
            PARAMS.CANVAS_WIDTH * 0.75 - width / 2 + buffer, this.startY + buffer + height / 2 - buffer +1, 
            5 * 3.5, 5 * 3.5
        );
        ctx.lineWidth = 1;
    }
    drawMultipliers(ctx) {
        let buffer = 20;
        ctx.beginPath();
        ctx.fillStyle = rgba(38, 38, 38, 0.9);
        ctx.strokeStyle = "Black";
        ctx.lineWidth = 3;
        ctx.roundRect(PARAMS.CANVAS_WIDTH * 0.75 - 175, this.startY, 350, 125, [10]);
        ctx.fill();
        ctx.stroke();

        let adventurer = this.game.adventurer;
        let statList = ["Exp Multiplier:", "Coin Multiplier:"];
        let statValues = [`x${adventurer.expMultiplier.toFixed(1)}`, `x${adventurer.coinMultiplier.toFixed(1)}`]
        let Y = this.startY + buffer * 2 + 30;
        ctx.font = '12px "Press Start 2P"';

        ctx.fillStyle = "White";
        let currentY = Y;
        ctx.textAlign = "left"; 
        ctx.textBaseline = "top"; 
        for (let line of statList) {
            ctx.fillText(line, PARAMS.CANVAS_WIDTH * 0.75 - 175 + buffer, currentY);
            currentY += 20;
        }
        currentY = Y;
        ctx.textAlign = "right"; 
        for (let line of statValues) {
            ctx.fillText(line, PARAMS.CANVAS_WIDTH * 0.75 + 175 - buffer, currentY);
            currentY += 20;
        }
    }

    
}