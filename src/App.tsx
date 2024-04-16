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

    // Add the settings GUI on top of the window 
    const gui = new GUI(); 


    const animate = (t : number) => {
      requestAnimationFrame(animate);
    };
    animate(performance.now());

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
