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
} from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const scene = new Scene();

const light = new AmbientLight(0x404040, 2);
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

const loader = new OBJLoader();
loader.setPath("");
const materialsLoader = new MTLLoader();
const raycaster = new Raycaster();
let model: Object3D;

async function onPointerClick(event: MouseEvent) {
  const pointer = new Vector2();
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  let wasHidden = false;
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object?.parent?.parent?.uuid === model.uuid) {
      intersects[i].object.visible = false;
      wasHidden = true;
      // await setTimeout(() => {
      //   intersects[i].object.visible = true;
      // }, 3_000);
    }
  }
  if (wasHidden) {
    loadHouse();
  }
}

function loadTent() {
  materialsLoader.setResourcePath("");
  materialsLoader.setPath("");
  materialsLoader.load(
    "models/textures/tent.mtl",
    function (materials) {
      materials.preload();
      loader.setMaterials(materials);
      loader.load(
        "models/tent.obj",
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
  materialsLoader.setResourcePath("");
  materialsLoader.setPath("");
  materialsLoader.load(
    "models/textures/house.mtl",
    function (materials) {
      materials.preload();
      loader.setMaterials(materials);
      loader.load(
        "models/house.obj",
        function onLoad(object) {
          object.scale.set(0.1, 0.1, 0.1);
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
  renderer.render(scene, camera);
}
addEventListener("mousedown", onPointerClick);
animate();
