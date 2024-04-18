import { useEffect } from 'react'
import { GUI } from 'dat.gui'; 
import SceneInit from './three/SceneInit';
import SnakeGame from './three/SnakeGame';

function App() {
  useEffect(() => {
    const scene = new SceneInit('myThreeJsCanvas'); 
    scene.initScene(); 
    scene.animate(); 

    // Then create the snake game and add it to the scene 
    const snakeGame = new SnakeGame();
    scene.attachGroup(snakeGame.boardGroup); 
    scene.attachGroup(snakeGame.snakeGroup);

    // Add the settings GUI on top of the window 
    const gui = new GUI(); 

    // Add a board settings folder and add parameters 
    const gameSettings = gui.addFolder('Game Settings'); 
    gameSettings.add(snakeGame, 'gridSize', 5, 29, 1).onChange(() => {
      snakeGame.resetBoard(); 
      snakeGame.resetSnake(); 
    });
    gameSettings.add(snakeGame, 'snakeStartLength', 1, 200, 1).onChange(() => {
      snakeGame.resetSnake(); 
    });

    // Set up some test code to try moving 
    var moveParams = {
      arg: 'right', 
      triggerMove: () => {
        snakeGame.moveSnake(moveParams.arg);
      }
    }
    gameSettings.add(moveParams, 'arg', ['up', 'down', 'left', 'right']).name('Move Direction');
    gameSettings.add(moveParams, 'triggerMove').name('Move Snake');


    const animate = (t : number) => {
      requestAnimationFrame(animate);
    };
    animate(performance.now());

    // Cleanup function to ensure that not multiple GUIs are created 
    return () => {
      gui.destroy(); 
    }

  })
  
  return (
    <>
      <div>
        <canvas id="myThreeJsCanvas"></canvas>
      </div>
      
    </>
  )
}

export default App
