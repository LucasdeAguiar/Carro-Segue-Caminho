import * as THREE from 'three';
import * as YUKA from 'yuka';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const cena = new THREE.Scene();

renderer.setClearColor(0x00173D);

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.3,
    2000
);

camera.position.set(-4, 10, 15);
camera.lookAt(cena.position);

const iluminacao = new THREE.AmbientLight(0x80FF00);
cena.add(iluminacao);

const directionalLight = new THREE.DirectionalLight(0x32FF00, 1);
directionalLight.position.set(0, 10, 10);
cena.add(directionalLight);

const veiculo = new YUKA.Vehicle();

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add( new YUKA.Vector3(-8, 5, 4));
path.add( new YUKA.Vector3(-6, 0, -12));

path.add( new YUKA.Vector3(10, 0, 0));
path.add( new YUKA.Vector3(5, 0, 5));



path.loop = true;

veiculo.position.copy(path.current());

veiculo.maxSpeed = 4;


const onPathBehavior = new YUKA.OnPathBehavior(path);

veiculo.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(veiculo);

const followPathBehavior = new YUKA.FollowPathBehavior(path, 4);
veiculo.steering.add(followPathBehavior);



const posicao = [];
for(let i = 0; i < path._waypoints.length; i++) {
    const waypoint = path._waypoints[i];
    posicao.push(waypoint.x, waypoint.y, waypoint.z);
}


const loader = new GLTFLoader();
loader.load('./assets/SUV.glb', function(glb) {
    const model = glb.scene;
   
    cena.add(model);
    model.matrixAutoUpdate = false;
    veiculo.scale = new YUKA.Vector3(0.4, 0.3, 0.3);
    veiculo.setRenderComponent(model, sync);
});





const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(posicao, 3));

const lineMaterial = new THREE.LineBasicMaterial({color: 0xD30DFF   });
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
cena.add(lines);

const tempo = new YUKA.Time();




window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animar() {
    const delta = tempo.update().getDelta();
    entityManager.update(delta);
    renderer.render(cena, camera);
}


renderer.setAnimationLoop(animar);