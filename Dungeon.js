class Dungeon{
    constructor(width,height,spriteSheet){
        this.width = width;
        this.height = height;
        this.spriteSheet = spriteSheet;
        this.grid = []; // 2d array for dungeon layout
        this.edges = []; // Edges for Kruskal's algorithm

        this.generarteGrid(); // Generates the dungeon
        this.generarteMaze(); // Generates the maze
    }

    generarteGrid(){ // Generates
        // Create a 2D grid filled with walls ('#')
        this.grid = Array.from({length:this.height}, () =>
        Array.from({length:this.width}, () => '#')
);

    //Mark nodes (odd-indexed cells) and add edges
    for(let y = 1; y<this.height; y+=2){
        for(let x = 1; x<this.width; x+=2){
            this.grid[y][x] = '.'; //Potential room is marked

            if(x+2 < this.width) {
                this.edges.push({from: {x,y}, to: {x:x+2,y}});
            }

            if(y+2 < this.height) {
                this.edges.push({from: {x,y}, to: {x,y:y+2}});
            }
        }
    }
} 
    // Generates the maze using Kruskal's algorithm
    generarteMaze(){
        this.edges.sort(() => Math.random() - 0.5); // Shuffle the edges

        //Disjoin set to track connected components
        const disjointSet = new Map();

        const find = (cell) => {
            if(disjointSet.get(cell) != cell) {
                disjointSet.set(cell, find(disjointSet.get(cell)));
            }
            return disjointSet.get(cell);
        };

        const union = (cell1,cell2) => {
            disjointSet.set(find(cell1), find(cell2));
        }

        //Initialize the disjoint set with each node as its own set

        for(let y = 1; y <this.height; y+=2) {
            for(let x =1; x < this.width; x+=2){
                const cellKey = `${x},${y}`;
                disjointSet.set(cellKey, cellKey);
            }
        }

        //Processs each edge

        for(const edge of this.edges){
            const fromKey = `${edge.from.x},${edge.from.y}`;
            const toKey = `${edge.to.x},${edge.to.y}`;

            //if the nodes are in different sets, connect them
            if(find(fromKey) !==find(toKey)){
                union(fromKey,toKey);

                const midX = (edge.from.x + edge.to.x) / 2;
                const midY = (edge.from.y + edge.to.y) / 2;
                this.grid[midY][midX] = '.'; // Potential path is marked

        }

    }

}
    printDungeon(){ // Print
        console.log(this.grid.map(row => row.join('')).join('\n'));
    }
}
const dungeon = new Dungeon(40,40);
dungeon.printDungeon();