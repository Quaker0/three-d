import {
  AmbientLight,
  BoxGeometry,
  Color,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Raycaster,
  Vector2,
  LoadingManager,
} from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

const scene = new Scene();

const light = new AmbientLight(0x404040, 3);
light.position.set(-2, 0, 1);
scene.add(light);

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

function onProgress(xhr: ProgressEvent<EventTarget>) {
  // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
}

function onError(e: ErrorEvent) {
  console.log("An error happened", e);
}

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new BoxGeometry(3, 0.1, 3);
const material = new MeshLambertMaterial({ color: new Color(0.12, 0.1, 0.1) });
const cube = new Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
camera.position.y = 1;

const manager = new LoadingManager();
const loader = new OBJLoader(manager);
const materialsLoader = new MTLLoader();
const raycaster = new Raycaster();
let model: Object3D;

async function onPointerClick(event: MouseEvent) {
  const pointer = new Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  const objs = intersects
    .filter((o) => o.object?.parent?.parent?.uuid === model.uuid)
    .map((o) => o.object);
  if (objs.length) {
    objs.map((o) => {
      o.visible = false;
    });
    loadHouse();
  }
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function loadTent() {
  materialsLoader.load(
    "assets/tent/tent.mtl",
    function (materials) {
      materials.preload();
      loader.setMaterials(materials);
      loader.load(
        "assets/tent/tent.obj",
        function onLoad(object) {
          object.scale.set(0.5, 0.5, 0.5);
          const newObj = new Object3D();
          object.position.set(0, 0.55, 0.2);
          newObj.add(object);
          scene.add(newObj);
          model = newObj;
        },
        onProgress,
        onError
      );
    },
    onProgress,
    onError
  );
}

function loadHouse() {
  materialsLoader.load(
    "assets/house/house.mtl",
    function (materials) {
      materials.preload();
      loader.setMaterials(materials);
      loader.load(
        "assets/house/house.obj",
        function onLoad(object) {
          object.scale.set(0.3, 0.3, 0.3);
          object.rotation.set(
            model.rotation.x,
            model.rotation.y,
            model.rotation.z
          );
          scene.add(object);
          model = object;
        },
        onProgress,
        onError
      );
    },
    onProgress,
    onError
  );
}

loadTent();

function animate() {
  requestAnimationFrame(animate);
  if (model) {
    cube.rotation.y += 0.01;
    model.rotation.y += 0.01;
  }
  render();
}
addEventListener("mousedown", onPointerClick);
animate();

function render() {
  renderer.render(scene, camera);
}
