import * as THREE from 'three'; 
import Stats from 'three/examples/jsm/libs/stats.module.js'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


export default class SceneInit { 
    // Properties 
    canvasID : string;
    fov : number;
    clock : THREE.Clock;
    scene : THREE.Scene;
    camera : THREE.PerspectiveCamera;
    renderer : THREE.WebGLRenderer;
    stats: Stats;
    controls: OrbitControls;


    constructor(canvasID : string, fov : number = 36) {
        this.canvasID = canvasID;
        this.fov = fov;
    }


    initScene() { 
        // Create a new scene, load the controls 
        this.clock = new THREE.Clock();
        this.scene = new THREE.Scene(); 
        this.camera = new THREE.PerspectiveCamera(
            this.fov, 
            window.innerWidth / window.innerHeight, 
            1, 
            1000
        )
        this.camera.lookAt(0, 0, 0);
        this.camera.position.z = 15; 

        const canvas = document.getElementById(this.canvasID) as HTMLCanvasElement;

        // Create the WebGL renderer 
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });

        // Then set the renderer size 
        this.renderer.setSize(window.innerWidth, window.innerHeight); 
        document.body.appendChild(this.renderer.domElement);

        // Add orbit controls and stats 
        this.controls = new OrbitControls(this.camera, this.renderer.domElement); 
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);

        // Add window resize event listener
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Render a grid to see what's going on (temporary)
        // const gridHelper = new THREE.GridHelper(10, 10);
        // gridHelper.rotation.x = Math.PI / 2;
        // this.scene.add(gridHelper);

    }

    animate() { 
        // Perform the rendering of the current frame
        this.render();
        this.stats.update();
        this.controls.update();

        // This tells the browser to call this function again on the next frame 
        window.requestAnimationFrame(this.animate.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera); 
    }

    onWindowResize() { 
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight); 
    }

    attachGroup(gameGroup : THREE.Group) { 
        this.scene.add(gameGroup);
    }

}