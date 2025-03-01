class Pause {
    constructor(game) {
        Object.assign(this, {game});
        this.game.pauseMenu = this;
        this.button = {length: 150, height: 40};
        this.showSettings = false;
        this.confirmation = false;
        this.options = [
            {
                name: "Resume",
                game: this.game,
                action() {this.game.pause = false; }
            },
            {
                name: "Volume",
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
            this.game.pause && this.game.leftClick && !this.confirmation) 
            {
                choice.action();
                this.game.click = {x:0, y:0};
                mouseY = 0;
            }
            this.firstY += this.button.height + 10;
        });
        if (this.game.upgrade.checkExitButton(mouseX, mouseY) && this.showSettings) {
            this.showSettings = false;
            this.game.click = {x:0, y:0};
        }
        if (this.game.isClicking(this.centerX, PARAMS.CANVAS_HEIGHT / 2, this.button.length, this.button.height) &&
        this.confirmation) 
        {
            window.location.reload();
        }
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
            this.drawSettings(ctx);
        } else if (this.confirmation) {
            this.drawConfirmation(ctx);
        } else {
            this.drawOptions(ctx);
        }
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
    drawSettings(ctx) {
        this.game.upgrade.exitButton(ctx);
        //Setting background size
        let length = PARAMS.CANVAS_WIDTH - 150;
        let height = PARAMS.CANVAS_HEIGHT - 150;
        ctx.beginPath();
        ctx.fillStyle = rgba(0,0,0, 0.75);
        ctx.roundRect(75, 75, length, height, [10]);
        ctx.fill();
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