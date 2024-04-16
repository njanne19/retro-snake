import * as THREE from 'three';

export default class SnakeGame { 
    gridSize: number;
    boardGroup: THREE.Group;

    // Do the basics of constructing the game
    constructor() { 
        // Handle parameters 
        this.gridSize = 5;

        // Create the board group 
        this.boardGroup = new THREE.Group();
        this.resetBoard(); 
        
    }

    clearBoard() { 
        // Remove all children from the board group 
        this.boardGroup.clear();
    }

    resetBoard() {
        this.clearBoard(); 

        // Calculate the appropriate indices to construct the board 
        const startIndex = -1 * Math.floor(this.gridSize / 2);
        const endIndex = Math.floor(this.gridSize / 2); 

        // Then add cubes to the group given gridSize. 2D grid, on the XZ plane, centered at 0, 0, 0
        for (let i = startIndex; i <= endIndex; i++) { 
            for (let j = startIndex; j <= endIndex; j++) { 
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const wireframeGeometry = new THREE.WireframeGeometry(geometry);
                var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
                const material = new THREE.LineBasicMaterial({color: randomColor});
                const wireframe = new THREE.LineSegments(wireframeGeometry, material);
                wireframe.position.set(i, j, 0);
                this.boardGroup.add(wireframe);

            }
        }
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        // const cube = new THREE.Mesh(geometry, material);
        // cube.position.set(0, 0, 0); 
        // this.boardGroup.add(cube);
    }

}