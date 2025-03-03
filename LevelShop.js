class LevelShop {
    constructor(game) {
        Object.assign(this, {game});
        this.game.levelShop = this;
        this.showUpgrade = false;
        this.enableBuy = false;
        this.length = 250;
        this.height = 300;
        this.center = {x: PARAMS.CANVAS_WIDTH / 2 - this.length / 2, y: PARAMS.CANVAS_HEIGHT / 2 - this.height / 2};
        this.button = {length: 125, height: 50};
        this.coinImage = ASSET_MANAGER.getAsset("./Sprites/Objects/collectables.png");
        this.selected = null;
        this.upgradeCard = {length:275, height:425};

        this.basic = [];
        this.unique = [];

        this.optionsUpdate();
    }
    optionsUpdate() {
        this.options = [
            {
                name: "Health Potion",
                game: this.game,
                description: "Restores 20% of max hp when used",
                price: 10,
                condition: this.game.adventurer.potion <= this.game.adventurer.potionMaxAmount 
            }, 
            {
                name: "Basic Upgrade",
                game: this.game,
                description: "Gets a random basic upgrade",
                price: 20,
                condition: this.game.shop.checkBasicUpgrade()
            }, 
            {
                name:"Rare Upgrade",
                game: this.game,
                description: "Gets a random rare upgrade",
                price: 40,
                condition: this.game.shop.checkUniqueUpgrade()
            }
        ];
    }
    update() {
        this.optionsUpdate();
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.click != null) {
            mouseX = this.game.click.x;
            mouseY = this.game.click.y;
        }
        this.firstX = this.center.x - 300;
        this.options.forEach(choice => {
            if (mouseX > this.firstX && mouseX < this.firstX + this.length &&
                mouseY > this.center.y && mouseY < this.center.y + this.height && this.game.adventurer.coins >= choice.price &&
                choice.condition && !this.showUpgrade
            ) {
                this.selected = choice.name;
                this.game.click = {x:0, y:0};
                mouseY = 0;
            }
            this.firstX += 300;
        });
        //Upgrade Card
        let x = PARAMS.CANVAS_WIDTH / 2 - this.upgradeCard.length / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - this.upgradeCard.height / 2 - 50;
        if (mouseX > x && mouseX < x + this.upgradeCard.length &&
            mouseY > y && mouseY < y + this.upgradeCard.height && this.showUpgrade
        ) {
            this.selected = this.upgrade;
        }

        //Confirm Button
        if (mouseX > PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2 && mouseX < PARAMS.CANVAS_WIDTH / 2 + this.button.length / 2 &&
            mouseY > this.center.y + this.height + 50 && mouseY < this.center.y + this.height + 50 + this.button.height 
                
        ) {
            if (this.showUpgrade && this.selected != null) {
                this.game.upgrade.updateChoice(this.selected);
                this.game.upgrade.addValidUpgrade();
                this.showUpgrade = false;
                this.selected = null;
                this.game.click = {x:0, y:0};
                this.mouseX = 0;
            } else if (this.selected != null) {
                this.selectChoice(this.selected);
                this.selected = null;
                this.game.click = {x:0, y:0};
                this.mouseX = 0;
            }

        }
        if (this.game.upgrade.checkExitButton(mouseX, mouseY) && !this.showUpgrade) {
            this.enableBuy = false;
            this.game.camera.enableLevelShop = false;
            this.showUpgrade = false;
            this.game.shopPause = false;
            this.game.click = {x:0, y:0};
        }
    }
    selectChoice(choice) {
        switch(choice) {
            case "Health Potion":
                this.game.adventurer.coins -= this.options[0].price;
                this.game.adventurer.potion++;
                if (!this.game.adventurer.enablePotion) this.game.adventurer.enablePotion = true;
                break;
            case "Basic Upgrade":
                this.game.adventurer.coins -= this.options[1].price;
                this.getRandomBasicUpgrade();
                break;
            case "Rare Upgrade":
                this.game.adventurer.coins -= this.options[2].price;
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
        this.game.draw(ctx);
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.fillRect(0, 0, PARAMS.CANVAS_WIDTH, PARAMS.CANVAS_HEIGHT);
        let mouseX = 0;
        let mouseY = 0;
        if (this.game.mouse != null) {
            mouseX = this.game.mouse.x;
            mouseY = this.game.mouse.y;
        }
        if (this.showUpgrade) {
            this.drawUpgrade(ctx, mouseX, mouseY);
        } else {
            this.drawOptions(ctx, mouseX, mouseY);
            this.drawCoins(ctx);
            this.game.upgrade.exitButton(ctx, mouseX, mouseY);
        }
        this.drawConfirm(ctx, mouseX, mouseY);

    }
    drawOptions(ctx, mouseX, mouseY) {
        this.firstX = this.center.x - 300;
        ctx.strokeStyle = "Black"
        ctx.textAlign = "center"; 
        ctx.font = '14px "Press Start 2P"';
        this.options.forEach(choice => {
            ctx.beginPath();
            if (mouseX > this.firstX && mouseX < this.firstX + this.length &&
                mouseY > this.center.y && mouseY < this.center.y + this.height && this.game.adventurer.coins >= choice.price &&
                choice.condition || this.selected == choice.name
            ) {
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
                ctx.strokeStyle = 'Black';
            }
            ctx.roundRect(this.firstX, this.center.y, this.length, this.height, [10]);
            ctx.fill();
            ctx.stroke();
            (this.game.adventurer.coins >= choice.price && choice.condition) ? ctx.fillStyle = "White" : ctx.fillStyle = "Gray";
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'Black';
            ctx.textBaseline = "top";
            ctx.fillText(choice.name, this.firstX + this.length / 2, this.center.y + 20);
            this.wrapText(ctx, choice.description, this.firstX + this.length / 2, this.center.y + this.height/2, 
                this.length - 40, 20);

            ctx.drawImage(this.coinImage, 
                14, 143, 
                5, 5, 
                this.firstX + this.length / 2 - (5 * 4 )/ 2 - 25, this.center.y + this.height - 20 - 5 * 4 + 5, 
                5 * 4, 5 * 4
            );
            ctx.textBaseline = "bottom";
            (this.game.adventurer.coins >= choice.price) ? ctx.fillStyle = "White" : ctx.fillStyle = "Red";
            ctx.fillText("x" + choice.price, this.firstX + this.length / 2 + 10, this.center.y + this.height - 20);
            this.firstX += 300;
        });
    }
    drawConfirm(ctx, mouseX, mouseY) {
        ctx.beginPath();
        if (mouseX > PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2 && mouseX < PARAMS.CANVAS_WIDTH / 2 + this.button.length / 2 &&
            mouseY > this.center.y + this.height + 50 && mouseY < this.center.y + this.height + 50 + this.button.height
        ) {
            if (!this.showUpgrade && this.selected != null) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
            if (this.showUpgrade && this.selected != null) {
                ctx.fillStyle = rgb(50, 50, 50);
                ctx.lineWidth = 3;
            } else {
                ctx.fillStyle = rgb(74, 74, 74);
                ctx.lineWidth = 1;
            }
        } else {
            ctx.fillStyle = rgb(74, 74, 74);
            ctx.lineWidth = 1;
        }
        ctx.strokeStyle = "Black";
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - this.button.length / 2, this.center.y + this.height + 50, 
            this.button.length, this.button.height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.font = '14px "Press Start 2P"';
        ((this.selected != null && !this.showUpgrade) || (this.showUpgrade && this.selected != null)) ? ctx.fillStyle = "White" : ctx.fillStyle = "Gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Confirm", PARAMS.CANVAS_WIDTH / 2, this.center.y + this.height + this.button.height / 2 + 50); //PARAMS.CANVAS_HEIGHT / 2  + 250
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
    drawUpgrade(ctx, mouseX, mouseY) {
        let x = PARAMS.CANVAS_WIDTH / 2 - this.upgradeCard.length / 2;
        let y = PARAMS.CANVAS_HEIGHT /2 - this.upgradeCard.height / 2 - 50;

        ctx.strokeStyle = "Black"
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (mouseX > x && mouseX < x + this.upgradeCard.length &&
            mouseY > y && mouseY < y + this.upgradeCard.height ||
            this.selected != null 
        ) {
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
        let height = buffer * 2 + 20;
        ctx.beginPath();
        ctx.fillStyle = rgb(74, 74, 74);
        ctx.strokeStyle = "Gray";
        ctx.lineWidth = 5;
        ctx.roundRect(PARAMS.CANVAS_WIDTH / 2 - width / 2, PARAMS.CANVAS_HEIGHT / 2 - 225, width, height, [10]);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "White";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(this.game.adventurer.coins, PARAMS.CANVAS_WIDTH / 2 - width / 2 + buffer + 20 + 5, PARAMS.CANVAS_HEIGHT / 2 - 225 + height / 2);
        ctx.drawImage(this.coinImage, 
            14, 143, 
            5, 5, 
            PARAMS.CANVAS_WIDTH / 2 - width / 2 + buffer, PARAMS.CANVAS_HEIGHT / 2 - 225 + buffer, 
            5 * 4, 5 * 4
        );
        ctx.lineWidth = 1;
    }
}