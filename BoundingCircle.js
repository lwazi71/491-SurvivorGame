class BoundingCircle {
    /**
     * 
     * @param {*} x the x coordinate of the center of the circle
     * @param {*} y the y coordinate of the center of the circle
     * @param {*} radius the radius of the circle
     */
    constructor(centerX, centerY, radius) {
            this.x = centerX; //X-coordinate of the circle's center
            this.y = centerY; //Y-coordinate of the circle's center
            this.radius = radius; //Radius of the circle
    };
    
    //Check collision with another circle
    collidesWithCircle(otherCircle) {
        const dx = this.x - otherCircle.x;
        const dy = this.y - otherCircle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + otherCircle.radius);
    }
    
    //Check collision with a bounding box
    collidesWithBox(box) {
        const closestX = Math.max(box.x, Math.min(this.x, box.x + box.width));
        const closestY = Math.max(box.y, Math.min(this.y, box.y + box.height));
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        return (dx * dx + dy * dy) < (this.radius * this.radius);
    }
    
    draw(ctx, camera) {


        //debug
        if (PARAMS.DEBUG) {
            ctx.beginPath();
            ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "blue";
            ctx.stroke();
        }
    }


}