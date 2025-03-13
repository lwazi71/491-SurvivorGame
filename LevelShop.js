class LevelShop {
    constructor(game) {
        Object.assign(this, {game});
        this.game.levelShop = this;
        this.showUpgrade = false;
        this.enableBuy = false;
        this.player = this.game.upgrade.player;
        this.showPlayer = false;
        this.length = 150;
        this.height = 150;
        this.center = {x: PARAMS.CANVAS_WIDTH / 2 - this.length / 2, y: PARAMS.CANVAS_HEIGHT / 2 - this.height / 2};
        this.button = {length: 150, height: 50};
        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.confirmHeight = 300;

        this.optionsUpdate();

        this.selected = this.options[0].name;
        this.selectedPrice = this.options[0].price;
        this.selectedDescription = this.options[0].description;
        this.upgradeCard = {length:275, height:425};
        this.buyAmount = 1;
        this.totalPrice = this.selectedPrice;
        this.currentAmount = 1;
        this.lastUpgrade = null;

        this.shopIcons = ASSET_MANAGER.getAsset("./Sprites/Objects/shopIcons.png");
        this.background = ASSET_MANAGER.getAsset("./Sprites/HudIcons/shopBackground.png");
        
        this.buyMenuY = 75 + 50 + this.length + 50 + 60;
        this.menu = {width: PARAMS.CANVAS_WIDTH - 150, height: PARAMS.CANVAS_HEIGHT - 150};
        this.fade = true;
        this.elapsedTime = 0;
        this.changes = 1;

        this.basic = [];
        this.unique = [];

        
    }
    optionsUpdate() {
        this.options = [
            {
                name: "Health Potion",
                game: this.game,
                description: "Restores 20% of max hp when used",
                price: 10,
                condition: this.game.adventurer.potion <= this.game.adventurer.potionMaxAmount ,
                num: 0
            }, 
            {
                name: "Exp Increase Multiplier",
                game: this.game,
                description: "Increase Exp Multiplier by 0.1",
                price: 100,
                condition: true ,
                num: 1
            },
            {
                name: "Coin Increase Multiplier",
                game: this.game,
                description: "Increase Coin Multiplier by 0.1",
                price: 100,
                condition: true,
                num: 2
            },
            {
                name: "Basic Upgrade",
                game: this.game,
                description: "Gets a random basic upgrade",
                price: 20,
                condition: this.game.levelShop.checkBasicUpgrade(),
                num: 3
            }, 
            {
                name:"Rare Upgrade",
                game: this.game,
                description: "Gets a random rare upgrade",
                price: 40,
                condition: this.game.levelShop.checkUniqueUpgrade(),
                num: 4
            }
        ];
    }
    update() {
        if (this.fade) {
            this.elapsed += this.game.clockTick;
            if (this.elapsed > 1) {
                this.fade = false;
            }
            this.changes -= 0.02;
        }
        this.player = this.game.upgrade.player;
        if (!this.showPlayer) {
            if (!this.showUpgrade) {
                this.optionsUpdate();
                //In shop selection
                this.updateShopItems();
                this.updateBuyArea();
            }
            //Upgrade Card
            this.updateUpgradeMenu();
        }
        if (this.game.upgrade.checkExitButton(this.game.click.x, this.game.click.y, true) && !this.showUpgrade) {
            if (this.showPlayer) {
                this.showPlayer = false;
                this.game.upgrade.player.upgradeMenu = false;
                this.game.click = {x:0, y:0};
            } else {
                this.enableBuy = false;
                this.game.camera.enableLevelShop = false;
                this.showUpgrade = false;
                this.game.toggleShopPause();
                this.fade = true;
                this.elapsedTime = 0;
                this.changes = 1;
                this.game.click = {x:0, y:0};
            }
        }
        if (this.game.upgrade.checkHeroStatus() && !this.showUpgrade) {
            this.showPlayer = true;
            this.game.click = {x:0, y:0};
        }
    }
    updateShopItems() {
        this.firstX = this.center.x - 170 * 2;
        let currentY = 75 + 20 + 60 + 50;
        this.options.forEach(choice => {
            if (this.game.isClicking(this.firstX, currentY, this.length, this.height) && choice.condition && !this.showUpgrade) {
                this.selected = choice.name;
                this.selectedPrice = choice.price;
                this.selectedDescription = choice.description;
                this.currentAmount = 1;
                this.game.click = {x:0, y:0};
            }
            this.firstX += 170
        });
    }
    updateBuyArea() {
        let buttonX = (this.center.x + 170 * 2 - 10) + ((75 + this.menu.width) - (this.center.x + 170 * 2 - 10)) / 2 - this.button.length / 2;
        let buttonCenterY = (this.buyMenuY) + ((PARAMS.CANVAS_HEIGHT - 75) - ((this.buyMenuY))) / 2 - 20;
        //Buy button
        if (this.game.isClicking(buttonX, buttonCenterY, this.button.length, this.button.height) && 
        this.game.adventurer.coins >= this.selectedPrice * this.currentAmount) {
            this.selectChoice(this.selected);
            ASSET_MANAGER.playAsset("./Audio/SoundEffects/coinCollecting.wav");
            this.currentAmount = 1;
        }
        if (this.selected != "Basic Upgrade" && this.selected != "Rare Upgrade") {
            //Removing items
            if (this.game.isClicking(buttonX, buttonCenterY - 30 - this.button.height / 2, 40, 40) && this.currentAmount > 1) {
                this.currentAmount--;
            }
            //Adding items
            if (this.game.isClicking(buttonX + this.button.length - 40, buttonCenterY - 30 - this.button.height / 2, 40, 40) && 
                this.currentAmount < 99 && this.game.adventurer.coins >= this.selectedPrice * this.currentAmount) {
                this.currentAmount ++;
            }
        }
        this.totalPrice = this.selectedPrice * this.currentAmount;
    }
    updateUpgradeMenu() {
        let x = PARAMS.CANVAS_WIDTH / 2 - this.upgradeCard.length / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - this.upgradeCard.height / 2 - 50;
        if (this.game.isClicking(x, y, this.upgradeCard.length, this.upgradeCard.height) && this.showUpgrade
        ) {
            this.selected = this.upgrade;
        }
        //Confirm Button
        if(this.game.isClicking(PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2, 
            PARAMS.CANVAS_HEIGHT / 2 + this.confirmHeight / 2 + 50,
            this.button.length, this.button.height)) {
            if (this.showUpgrade && this.selected != null) {
                this.game.upgrade.updateChoice(this.selected);
                this.game.upgrade.addValidUpgrade();
                this.showUpgrade = false;
                this.selected = this.lastUpgrade;
                this.game.click = {x:0, y:0};
                this.mouseX = 0;
            }
        }
    }
    selectChoice(choice) {
        console.log(choice);
        switch(choice) {
            case "Health Potion":
                this.game.adventurer.coins -= this.options[0].price * this.currentAmount;
                this.game.adventurer.potion += this.currentAmount;
                if (!this.game.adventurer.enablePotion) this.game.adventurer.enablePotion = true;
                break;
            case "Exp Increase Multiplier":
                this.game.adventurer.coins -= this.options[1].price * this.currentAmount;
                this.game.adventurer.expMultiplier += 0.1 * this.currentAmount;
                break;
            case "Coin Increase Multiplier":
                this.game.adventurer.coins -= this.options[2].price * this.currentAmount;
                this.game.adventurer.coinMultiplier += 0.1 * this.currentAmount;
                break;
            case "Basic Upgrade":
                this.game.adventurer.coins -= this.options[3].price;
                this.lastUpgrade = choice;
                this.selected = null;
                this.getRandomBasicUpgrade();
                break;
            case "Rare Upgrade":
                this.game.adventurer.coins -= this.options[4].price;
                this.lastUpgrade = choice;
                this.selected = null;
                this.getRandomUniqueUpgrade();
                break;
            default:
                console.log("Not a valid choice");
        }
    }
    checkBasicUpgrade() {
        this.game.upgrade.addValidUpgrade();
        let value = this.game.upgrade.basic.length > 0;
        this.game.upgrade.resetList();
        return value;
    }
    checkUniqueUpgrade() {
        this.game.upgrade.addValidUpgrade();
        let value =this.game.upgrade.unique.length > 0;
        this.game.upgrade.resetList();
        return value
    }
    getRandomBasicUpgrade() {
        this.game.upgrade.addValidUpgrade();
        this.upgrade = this.getRandomUpgrade(this.game.upgrade.basic);
        this.showUpgrade = true;
        this.game.upgrade.resetList();
    }
    getRandomUniqueUpgrade() {
        this.game.upgrade.addValidUpgrade();
        this.upgrade = this.getRandomUpgrade(this.game.upgrade.unique);
        this.showUpgrade = true;
        this.game.upgrade.resetList();
    }
    getRandomUpgrade(upgrades) {
        this.index = Math.floor(Math.random() * upgrades.length);
        return upgrades[this.index];
    }
    draw(ctx) {
        if (this.showPlayer) {
            this.player.update();
            this.player.draw(ctx);
        } else {
            ctx.drawImage(this.background, 
                0, 0, 
                640, 480, 
                0, 0, 
                PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT
            );
            ctx.fillStyle = rgba(0,0,0, 0.75);
            ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
            this.drawOptions(ctx);
            this.drawBuyArea(ctx);
            this.drawCoins(ctx);
            this.drawBuyText(ctx);
            this.game.upgrade.heroStatus(ctx);
            if (this.showUpgrade) {
                ctx.fillStyle = rgba(0,0,0, 0.75);
                ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
                this.drawUpgrade(ctx);
                this.drawConfirm(ctx);
            }
        }
        this.game.upgrade.exitButton(ctx, this.game.mouse.x, this.game.mouse.y);
        if (this.fade) {
            //Draw fade in
            ctx.fillStyle = rgba(0, 0, 0, this.changes);
            ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        }

    }
    drawOptions(ctx) {
        //Background
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.fillStyle = rgba(0,0,0, 0.9);
        ctx.strokeStyle = 'Gray';
        ctx.roundRect(75, 75, this.menu.width, this.menu.height, [10]);
        ctx.fill();
        ctx.stroke();

        //Shop Text 
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = '32px "Press Start 2P"';
        ctx.fillStyle = "White";
        ctx.fillText("Shop", PARAMS.CANVAS_WIDTH / 2, 75 + 20);

        //Line going up and down
        ctx.beginPath();
        ctx.moveTo(this.center.x + 170 * 2 - 10, this.buyMenuY); //Hardcoded 75 is buffer and 200 is rough size to put button 
        ctx.lineTo(this.center.x + 170 * 2 - 10, PARAMS.CANVAS_HEIGHT - 75);
        ctx.stroke();

        //Line across
        ctx.beginPath();
        ctx.moveTo(75, this.buyMenuY); //Hardcoded 75 is buffer and 40 / 2 is buffer 
        ctx.lineTo(PARAMS.CANVAS_WIDTH - 75, this.buyMenuY);
        ctx.stroke();
        ctx.lineWidth = 1;

        //Drawing Options
        this.firstX = this.center.x - 170 * 2;
        let currentY = 75 + 20 + 60 + 50;
        ctx.strokeStyle = "Black"
        ctx.textAlign = "center"; 
        ctx.font = '14px "Press Start 2P"';
        this.options.forEach(choice => {
            ctx.beginPath();
            if ((this.game.isHovering(this.firstX, currentY, this.length, this.height) || this.selected == choice.name) && !this.showUpgrade) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.selected == choice.name) {
                ctx.strokeStyle = 'White';
                ctx.shadowColor = "White";
                ctx.shadowBlur = 15;
            } else {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'Gray';
            }
            ctx.roundRect(this.firstX, currentY, this.length, this.height, [10]);
            ctx.fill();
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            let offset = 10;
            if (choice.num == 0) offset += 10;
            ctx.drawImage(this.shopIcons, 
                32 * choice.num, 0, 
                32, 32, 
                this.firstX + this.length / 2 - (32 * 3) / 2, currentY + this.height / 2 - (32 * 3) / 2 - offset, 
                32 * 3, 32 * 3
                );
            let coinY = currentY + this.length - 5 - 20;
            let width = ctx.measureText("x" + choice.price.toString()).width + 20 + 5; // 5 spacing 20 is coin length
            (this.game.adventurer.coins >= choice.price) ? ctx.fillStyle = "White" : ctx.fillStyle = "Red";
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.fillText("x" + choice.price.toString(), this.firstX + this.length / 2 - width / 2 + 20 + 5, coinY);
            ctx.drawImage(this.coinImage, 
                14, 143, 
                5, 5, 
                this.firstX - width / 2 + this.length / 2, coinY - 9, 
                5 * 4, 5 * 4
            );
            ctx.lineWidth = 1;
            this.firstX += 170;
        });

    }
    drawBuyArea(ctx) {
        let buttonX = (this.center.x + 170 * 2 - 10) + ((75 + this.menu.width) - (this.center.x + 170 * 2 - 10)) / 2 - this.button.length / 2;
        let buttonCenterY = (this.buyMenuY) + ((PARAMS.CANVAS_HEIGHT - 75) - ((this.buyMenuY))) / 2 - 20; 
        //Buy Button
        ctx.beginPath();
        if (this.game.isHovering(buttonX, buttonCenterY, this.button.length, this.button.height) && !this.showUpgrade) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = 'Gray';
        ctx.roundRect(buttonX, buttonCenterY, this.button.length, this.button.height, [10]);
        ctx.fill();
        ctx.stroke();
        //Buy button text
        (this.game.adventurer.coins >= this.selectedPrice * this.currentAmount) ? ctx.fillStyle = "White" : ctx.fillStyle = "Red";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = '18px "Press Start 2P"';
        ctx.fillText("Buy", buttonX + this.button.length / 2, buttonCenterY + this.button.height / 2);

        //Reduce Items
        ctx.beginPath();
        if (this.game.isHovering(buttonX, buttonCenterY - 30 - this.button.height / 2, 40, 40) && 
            (this.selected != "Basic Upgrade" && this.selected != "Rare Upgrade") && this.currentAmount > 1 && !this.showUpgrade) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = 'Gray';
        ctx.roundRect(buttonX, buttonCenterY - 30 - this.button.height / 2, 40, 40, [10]);
        ctx.fill();
        ctx.stroke();
        (this.selected != "Basic Upgrade" && this.selected != "Rare Upgrade" && this.currentAmount > 1) ? ctx.fillStyle = "White" : ctx.fillStyle = "Gray";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = '24px Lilita One';
        ctx.fillText("-", buttonX + 20, buttonCenterY - 30 - 5);

        //Add Items
        ctx.beginPath();
        if (this.game.isHovering(buttonX + this.button.length - 40, buttonCenterY - 30 - this.button.height / 2, 40, 40) && 
            (this.selected != "Basic Upgrade" && this.selected != "Rare Upgrade") && 
            this.game.adventurer.coins >= this.selectedPrice * this.currentAmount && this.currentAmount < 99 && !this.showUpgrade) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = 'Gray';
        ctx.roundRect(buttonX + this.button.length - 40, buttonCenterY - 30 - this.button.height / 2, 40, 40, [10]);
        ctx.fill();
        ctx.stroke();

        (this.selected != "Basic Upgrade" && this.selected != "Rare Upgrade" && 
            this.game.adventurer.coins >= this.selectedPrice * this.currentAmount && 
            this.currentAmount < 99) ? ctx.fillStyle = "White" : ctx.fillStyle = "Gray";

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = '24px Lilita One';
        ctx.fillText("+", buttonX + this.button.length - 20, buttonCenterY - 30 - 4);

        //Amount Current
        ctx.fillStyle = "White";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText(`x${this.currentAmount}`, buttonX + this.button.length / 2, buttonCenterY - 10 - this.button.height / 2)


        let coinY = buttonCenterY + 20 + this.button.height;
        let width = ctx.measureText("x" + this.totalPrice.toString()).width + 20 + 5; // 5 spacing 20 is coin length
        let coinX = buttonX + this.button.length / 2;
        (this.game.adventurer.coins >= this.totalPrice) ? ctx.fillStyle = "White" : ctx.fillStyle = "Red";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText("x" + (this.totalPrice).toString(), coinX - width / 2 + 20 + 5, coinY);
        ctx.drawImage(this.coinImage, 
            14, 143, 
            5, 5, 
            coinX - width / 2, coinY - 9, 
            5 * 4, 5 * 4
        );
        
    }
    drawBuyText(ctx) {

        let buffer = 20;
        let X = 75 + (this.center.x + 170 * 2 - 10 - 75) / 2;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.font = '18px "Press Start 2P"';
        let text = this.selected;
        if (this.showUpgrade) text = this.lastUpgrade;

        //To get to middle of text
        let y = this.buyMenuY + buffer + 20 + ((PARAMS.CANVAS_HEIGHT - 150 - this.buyMenuY + buffer + 20) / 2);
        ctx.fillText(text, X, this.buyMenuY + buffer);
        ctx.font = '14px "Press Start 2P"';
        ctx.textBaseline = "middle";
        ctx.fillText(this.selectedDescription, X, y);
        if (this.selected == "Health Potion") {
            ctx.fillText(`(Current Potion Count: ${this.game.adventurer.potion})`, X, y + 40);
        } else if (this.selected == "Exp Increase Multiplier") {
            ctx.fillText(`(Current Exp Multiplier: ${this.game.adventurer.expMultiplier.toFixed(1)})`, X, y + 40);
        } else if (this.selected == "Coin Increase Multiplier") {
            ctx.fillText(`(Current Coin Multiplier: ${this.game.adventurer.coinMultiplier.toFixed(1)})`, X, y + 40);
        }
    

    }
    drawConfirm(ctx) {
        ctx.beginPath();
        if (this.game.isHovering(PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2, 
            PARAMS.CANVAS_HEIGHT / 2 + this.confirmHeight / 2 + 50,
            this.button.length, this.button.height)) 
        {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = "Black";
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2, 
            PARAMS.CANVAS_HEIGHT / 2 + this.confirmHeight / 2 + 50, 
            this.button.length, this.button.height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.font = '14px "Press Start 2P"';
        ((this.selected != null && !this.showUpgrade) || (this.showUpgrade && this.selected != null)) ? ctx.fillStyle = "White" : ctx.fillStyle = "Gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Confirm", PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + this.confirmHeight / 2 + this.button.height / 2 + 50); //PARAMS.CANVAS_HEIGHT / 2  + 250
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
    drawUpgrade(ctx) {
        let x = PARAMS.CANVAS_WIDTH / 2 - this.upgradeCard.length / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - this.upgradeCard.height / 2 - 50;

        ctx.strokeStyle = "Black"
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (this.game.isHovering(x, y, this.upgradeCard.length, this.upgradeCard.height) || this.selected != null) {
            ctx.fillStyle = rgb(50, 50, 50);
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        if (this.selected != null) {
            ctx.strokeStyle = 'White';
            ctx.shadowColor = "White";
            ctx.shadowBlur = 15;
        } else {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'Black';
        }
        ctx.roundRect(x, y, this.upgradeCard.length, this.upgradeCard.height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'Black';
        //Text
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillStyle = "White";
        ctx.fillStyle = this.upgrade.color;
        ctx.font = '18px "Press Start 2P"';
        this.game.upgrade.wrapText(ctx, `${this.upgrade.name}`,
            PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 - 175 - 50,
            250, 25
        );
        ctx.font = '12px "Press Start 2P"';
        this.game.upgrade.wrapText(ctx, `${this.upgrade.description}`, 
            PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 50 - 50,
            250, 25
        );
        ctx.fillText(`x${this.upgrade.current}`, PARAMS.CANVAS_WIDTH / 2, PARAMS.CANVAS_HEIGHT / 2 + 190 - 50);
    }
    drawCoins(ctx) {
        let buffer = 10;
        ctx.font = '14px "Press Start 2P"';
        let width = ctx.measureText(this.game.adventurer.coins.toString()).width + 20 + buffer * 2 + 5;
        const Y = 75 + 20 + 50;
        const centerX = PARAMS.CANVAS_WIDTH / 2 - width / 2;
        let height = buffer * 2 + 20;
        ctx.beginPath();
        ctx.fillStyle = rgb(74, 74, 74);
        ctx.strokeStyle = "Gray";
        ctx.lineWidth = 5;
        ctx.roundRect(centerX, Y, width, height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "White";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(this.game.adventurer.coins, centerX + buffer + 20 + 5, Y + height / 2);
        ctx.drawImage(this.coinImage, 
            14, 143, 
            5, 5, 
            centerX + buffer, Y + buffer, 
            5 * 4, 5 * 4
        );
        ctx.lineWidth = 1;
    }
}