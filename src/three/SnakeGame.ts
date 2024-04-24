import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class SnakeGame { 
    // Three JS Groups 
    boardGroup: THREE.Group;
    snakeGroup: THREE.Group; 
    tweenTimeStep: number; 
    lastTime: number;

    // Default Parameters 
    gridSize: number;
    snakeStartLength: number;

    // Derived parameters
    unsignedBoardBound : number;

    // MNaps 
    snakeMap : boolean[][]; 
    snackMap : boolean[][]; 

    // Do the basics of constructing the game
    constructor() { 
        // Handle parameters 
        this.gridSize = 9;
        this.snakeStartLength = 15; 

        // Animation params 
        this.tweenTimeStep = 250; 

        // Create the board group 
        this.boardGroup = new THREE.Group();
        this.resetBoard(); 
        this.snakeGroup = new THREE.Group(); 
        this.resetSnake(); 
    }

    loop(t : number) {
        TWEEN.update(t);
        const timeStep = t - this.lastTime; 
        if (timeStep > this.tweenTimeStep) { 
            this.lastTime = t; 
        }
    }

    clearBoard() { 
        this.boardGroup.clear();
    }

    resetBoard() {
        console.log("Snake game has been reset with grid size: ", this.gridSize);
        this.clearBoard(); 

        // Calculate the appropriate indices to construct the board 
        this.unsignedBoardBound = Math.floor(this.gridSize / 2);
        const startIndex = -1 * this.unsignedBoardBound;
        const endIndex = this.unsignedBoardBound;

        // Then add cubes to the group given gridSize. 2D grid, on the XZ plane, centered at 0, 0, 0
        for (let i = startIndex; i <= endIndex; i++) { 
            for (let j = startIndex; j <= endIndex; j++) { 
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const wireframeGeometry = new THREE.WireframeGeometry(geometry);
                const material = new THREE.LineBasicMaterial({color: '#0CFF00'});
                const wireframe = new THREE.LineSegments(wireframeGeometry, material);
                wireframe.position.set(i, j, 0);
                this.boardGroup.add(wireframe);
            }
        }
    }

    clearSnake() { 
        this.snakeGroup.clear(); 
        this.snakeMap = this.createEmptyMap();
    }

    resetSnake() { 

        // First clear old snake 
        this.clearSnake();

        // Now we need to actually create the snake. We are given a default length of the snake 
        // and the group to add the snake to. A snake is defined as a series of cubes
        // that are all added to the snake group. The head of the snake will start at 0,0,0
        // We should also check that the length of the snake doesn't exceed the grid size

        // Get current number of boxes in the board group 
        const totalBoardSquares = this.boardGroup.children.length; 

        if (this.snakeStartLength > totalBoardSquares) { 
            console.error("Cannot create a snake longer than the board size");
            return;
        }

        // Now create the snake, the group is already created in the constructor
        // Start at the origin
        let bodyPieceX = 0; 
        let bodyPieceY = 0; 
        
        let remainingSnakePieces = this.snakeStartLength;
        let currentGrowDirection = 'left'; 

        while(remainingSnakePieces > 0) { 
            // Create the piece 
            const geometry = new THREE.BoxGeometry(1, 1, 1); 
            const material = new THREE.MeshBasicMaterial({color: '#FF0000'});
            const cube = new THREE.Mesh(geometry, material); 
            cube.position.set(bodyPieceX, bodyPieceY, 0);
            this.snakeGroup.add(cube);

            // Calculate the map coordinates 
            const [mapI, mapJ] = this.globalToMapCoords(bodyPieceX, bodyPieceY);
            this.snakeMap[mapI][mapJ] = true; // Snake marker in this position 

            // Move the body piece in the appropriate direction 
            switch(currentGrowDirection) { 
                case 'left': 
                    if (bodyPieceX - 1 < -1 * this.unsignedBoardBound) { 
                        currentGrowDirection = 'up'; 
                        bodyPieceY += 1;
                        break;
                    }
                    bodyPieceX -= 1; 
                    break; 
                case 'right': 
                    if (bodyPieceX + 1 > this.unsignedBoardBound) {
                        currentGrowDirection = 'down'; 
                        bodyPieceY -= 1; 
                        break; 
                    }
                    bodyPieceX += 1; 
                    break; 
                case 'up': 
                    if (bodyPieceY + 1 > this.unsignedBoardBound) { 
                        currentGrowDirection = 'right'; 
                        bodyPieceX += 1; 
                        break; 
                    }
                    bodyPieceY += 1; 
                    break; 
                case 'down': 
                    if (bodyPieceY - 1 < -1 * this.unsignedBoardBound) { 
                        currentGrowDirection = 'left'; 
                        bodyPieceX -= 1; 
                        break; 
                    }
                    bodyPieceY -= 1; 
                    break; 
            }
            
            // Decrement the remaining snake pieces
            remainingSnakePieces -= 1;

        }
    }

    // Generates an empty map given the current grid size
    createEmptyMap(): boolean[][] { 
        return Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(false))
    }

    globalToMapCoords(x : number, y : number): [ mapI : number, mapJ : number] {

        // Global coords are expressed from -UnsignedBoardBound to UnsignedBoardBound, need to do conversion
        // In the map, we express from 0 to gridSize -1, wher first index is y (moving downwards)
        // and second index is x (moving rightwards)
        const mapI = -1 * y + this.unsignedBoardBound;  
        const mapJ = x + this.unsignedBoardBound;

        return [mapI, mapJ];
    }

    mapToGlobalCoords(i : number, j : number): [globalX : number, globalY : number] {
        // Inverse of the above function
        const globalX = j - this.unsignedBoardBound;
        const globalY = -1 * i + this.unsignedBoardBound;

        return [globalX, globalY];
    }

    checkOutOfBounds(i : number, j : number): boolean {
        return i < 0 || i >= this.gridSize || j < 0 || j >= this.gridSize;
    }

    checkSelfCollision(i : number, j : number): boolean {
        return this.snakeMap[i][j];
    }


    moveSnake(direction: string) { 
        // This function is a primitive that will move the snake in the given direction. 
        // TODO: Replace with a more animated movement system 

        // First get the head of the snake
        const head = this.snakeGroup.children[0] as THREE.Mesh;

        // Get the current position of the head and perturb it 
        let nextPositionX = head.position.x;
        let nextPositionY = head.position.y;

        switch(direction) { 
            case 'left': 
                nextPositionX -= 1; 
                break; 
            case 'right': 
                nextPositionX += 1; 
                break; 
            case 'up': 
                nextPositionY += 1; 
                break; 
            case 'down': 
                nextPositionY -= 1; 
                break; 
        }

        // Then iterate through the hole list. Store parameters for 
        // Previous piece of the snake in order ot move it to the next position
        for (let i = 0; i < this.snakeGroup.children.length; i++) {
            const currentPiece = this.snakeGroup.children[i] as THREE.Mesh;
 
            // Save current position to be used as "nextPosition" for the next piece
            const tempX = currentPiece.position.x;
            const tempY = currentPiece.position.y;

            // Check for collision beforehand 
            const [mapI, mapJ] = this.globalToMapCoords(nextPositionX, nextPositionY);
            const isOutOfBounds = this.checkOutOfBounds(mapI, mapJ);
            const isSelfCollision = i == 0 && !isOutOfBounds ? this.checkSelfCollision(mapI, mapJ) : false; // Only check for collisions at the head. 

            if (i == 0) { 
                console.log("Trying to move head from ", tempX, tempY, " to ", nextPositionX, nextPositionY);
                console.log("Out of Bounds/Collision: ", isOutOfBounds, isSelfCollision);
            }

            if (isOutOfBounds || isSelfCollision) { 
                console.log("Game Over");
                this.resetSnake();
                return;
            }

            // Remove the tail from the previous map position, add the head to the new map position 
            if (i == 0) { 
                // Add coords to map 
                this.snakeMap[mapI][mapJ] = true;
            } else if (i == this.snakeGroup.children.length - 1) { 
                const [tailMapI, tailMapJ] = this.globalToMapCoords(tempX, tempY);
                this.snakeMap[tailMapI][tailMapJ] = false;
            }

        
            //currentPiece.position.set(nextPositionX, nextPositionY, 0);
            this.animateSnakePieceMovement(currentPiece, nextPositionX, nextPositionY); 
            
            // Remap next position 
            nextPositionX = tempX;
            nextPositionY = tempY;
        }
    }

    animateSnakePieceMovement(snakePiece : THREE.Mesh, nextPositionX : number, nextPositionY : number) { 
        // Animate the movement of a single snake piece to a new position 
        // This function is a primitive that will move the snake in the given direction.
        
        // Get the current position of the head and perturb it
        const currentPositionX = snakePiece.position.x;
        const currentPositionY = snakePiece.position.y;

        // Animate the movement of the snake piece
        const tween = new TWEEN.Tween({
            x: currentPositionX,
            y: currentPositionY
        })
        .to({
            x: nextPositionX,
            y: nextPositionY
        }, this.tweenTimeStep)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .onUpdate(({ x, y }) => {
            snakePiece.position.set(x, y, 0);
        });

        tween.start(); 
    }

}