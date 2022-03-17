import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader';
import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import { Object3D, Vector2, Vector3 } from 'three';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private frameId: number = null;
  private file: File;
  private leftArrow: THREE.Mesh;
  private rightArrow: THREE.Mesh;
  private upArrow: THREE.Mesh;
  private downArrow: THREE.Mesh;
  private leftCrosswise: THREE.Mesh;
  private rightCrosswise: THREE.Mesh;
  private scaleUp: THREE.Mesh;
  private scaleDown: THREE.Mesh;
  private mouse = new THREE.Vector2();
  private model: THREE.Mesh;

  public constructor(private ngZone: NgZone) { }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = null;
      this.canvas = null;
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.mouse = new Vector2(0, 0);
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true, // smooth edges
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    // this.scene.add(new THREE.AxesHelper(1))

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 6;
    this.scene.add(this.camera);

    // const controls = new OrbitControls(this.camera, this.renderer.domElement);
    // controls.enableDamping = true;

    // soft white light
    this.light = new THREE.AmbientLight(0xffffff);
    this.light.position.set(0, 0, -30)
    this.scene.add(this.light);


    var loader = new THREE.TextureLoader();

    // Load an image file into a custom material
    var material = new THREE.MeshLambertMaterial({
      map: loader.load('assets/arrow-up.png')
    });

    // create a plane geometry for the image with a width of 10
    // and a height that preserves the image's aspect ratio
    var geometry = new THREE.PlaneGeometry(1, 1 * .75);

    // Control buttons
    this.leftArrow = new THREE.Mesh(geometry, material);
    this.rightArrow = new THREE.Mesh(geometry, material);
    this.upArrow = new THREE.Mesh(geometry, material);
    this.downArrow = new THREE.Mesh(geometry, material);
    this.leftCrosswise = new THREE.Mesh(geometry, material);
    this.rightCrosswise = new THREE.Mesh(geometry, material);

    this.leftArrow.scale.set(0.6, 0.6, 0.6);
    this.leftArrow.rotation.z = 33;
    this.leftArrow.position.x = -3;
    this.leftArrow.position.y = -3;
    this.leftArrow.name = "Arrow";
    this.scene.add(this.leftArrow);

    this.rightArrow.scale.set(0.6, 0.6, 0.6);
    this.rightArrow.rotation.z = -33
    this.rightArrow.position.x = -2.5;
    this.rightArrow.position.y = -3;
    this.rightArrow.name = "Arrow";
    this.scene.add(this.rightArrow);

    this.upArrow.scale.set(0.6, 0.6, 0.6);
    this.upArrow.position.x = 0;
    this.upArrow.position.y = -3;
    this.upArrow.name = "Arrow";
    this.scene.add(this.upArrow);

    this.downArrow.scale.set(0.6, 0.6, 0.6);
    this.downArrow.rotation.z = 66;
    this.downArrow.position.x = 0.5;
    this.downArrow.position.y = -3;
    this.downArrow.name = "Arrow";
    this.scene.add(this.downArrow);

    this.leftCrosswise.scale.set(0.6, 0.6, 0.6);
    this.leftCrosswise.rotation.z = 1;
    this.leftCrosswise.position.x = 3;
    this.leftCrosswise.position.y = -3;
    this.leftCrosswise.name = "Arrow";

    this.scene.add(this.leftCrosswise);

    this.rightCrosswise.scale.set(0.6, 0.6, 0.6);
    this.rightCrosswise.rotation.z = -2.3;
    this.rightCrosswise.position.x = 3.6;
    this.rightCrosswise.position.y = -3;
    this.rightCrosswise.name = "Arrow";

    this.scene.add(this.rightCrosswise);
    //

    // Scale buttons
    this.scaleUp = new THREE.Mesh(geometry, material);
    this.scaleDown = new THREE.Mesh(geometry, material);
    this.scaleUp.name = "Arrow";
    this.scaleDown.name = "Arrow";


    this.scaleUp.position.x = 6;
    this.scaleUp.position.y = 3;

    this.scaleDown.position.x = 7;
    this.scaleDown.position.y = 3;
    this.scaleDown.rotation.z = 66;

    this.scene.add(this.scaleUp);
    this.scene.add(this.scaleDown);
    //

    // Plane
    const planeGeometry = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = "Plane";
    plane.position.x = 0;
    plane.position.y = -1;
    plane.position.z = 0;
    plane.rotation.x = 64.4;
    this.scene.add(plane);
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });

      window.addEventListener('pointerdown', (event) => this.onMouseDown(event), false);
    });
  }

  public onMouseDown(event) {
    var object = this.scene.getObjectByName("stlModel");
    event.preventDefault();
    this.mouse = new THREE.Vector2();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    var vec = new THREE.Vector3(); // create once and reuse
    var pos = new THREE.Vector3(); // create once and reuse

    vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1,
      0.5);

    vec.unproject(this.camera);

    vec.sub(this.camera.position).normalize();

    var distance = - this.camera.position.z / vec.z;

    let vector = pos.copy(this.camera.position).add(vec.multiplyScalar(distance));

    if (vector.x > -3.2 && vector.x < -2.7) {
      object.rotation.y -= 0.3;
    }

    if (vector.x > -2.7 && vector.x < -2.2) {
      object.rotation.y += 0.3;
    }

    if (vector.x > -0.169 && vector.x < 0.169) {
      object.rotation.x -= 0.3;
    }

    if (vector.x > 0.33 && vector.x < 0.64) {
      object.rotation.x += 0.3;
    }

    if (vector.x > 2.79 && vector.x < 3.18) {
      object.rotation.z -= 0.3;
    }

    if (vector.x > 3.42 && vector.x < 3.78) {
      object.rotation.z += 0.3;
    }

    if (vector.x > 5.7 && vector.x < 6.2) {
      object.scale.x += 0.1;
      object.scale.y += 0.1;
      object.scale.z += 0.1;
    }

    if (vector.x > 6.7 && vector.x < 7.2) {
      object.scale.x -= 0.1;
      object.scale.y -= 0.1;
      object.scale.z -= 0.1;
    }
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
      // this.setupKeyControls();
    });
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setFile(file: File): void {
    this.removeMeshModel();
    this.file = file;
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(this.file);
    fileReader.onload = (e) => {
      const loader = new STLLoader();
      var geometry: THREE.BufferGeometry = loader.parse(fileReader.result);
      const material = new THREE.MeshNormalMaterial({});
      var mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(0.14, 0.14, 0.14);
      mesh.position.x = 0;
      mesh.position.y = 1;
      mesh.position.z = 0;
      mesh.name = "stlModel";
      this.model = mesh;
      this.model.name = "stlModel";
      this.scene.add(mesh);
      // // Plane
      // const planeGeometry = new THREE.PlaneGeometry(5, 5);
      // const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      // plane.name = "Plane";
      // plane.position.x = 0;
      // plane.position.y = this.model.scale.y - plane.scale.y;
      // plane.position.z = 0;
      // plane.rotation.x = 64.4;
      // this.scene.add(plane);
    }
  }

  public setLogo(file: File): void {
    this.file = file;
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(this.file);
    fileReader.onload = (e) => {
      const loader = new SVGLoader();
      var svg: SVGResult = loader.parse(fileReader.result as string);
      const paths = svg.paths;
      const group = new THREE.Group();
      group.position.x = 0;
      group.position.y = 0;
      group.position.z = 0;

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const shapes = SVGLoader.createShapes(path);
        for (let j = 0; j < shapes.length; j++) {
          const shape = shapes[j];
          const geometry = new THREE.ShapeGeometry(shape);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.set(0.03, 0.03, 0.03);
          mesh.position.x = -8;
          mesh.position.y = 4;
          mesh.position.z = 0;
          mesh.rotateOnWorldAxis(new Vector3(1, 0, 0), 3.14);
          group.add(mesh);
        }
      }
      this.scene.add(group);
    }
  }

  public getBase64(file): string {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    return reader.result as string;
  }

  public removeMeshModel(): void {
    let removeObject: Object3D;
    this.scene.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        if (node.name == "stlModel") {
          removeObject = node;
        }
      }
    });
    this.scene.remove(removeObject);
  }

  public takeScreenshot() {

    var scaleArray = [];
    this.scene.children.forEach(element => {
      if (element.name === "Arrow") {
        let elem = new Vector3(element.scale.x, element.scale.y, element.scale.z);
        scaleArray.push(elem);
        element.scale.set(0, 0, 0);
      }
    });

    // open in new window like this
    //
    var w = window.open('', '');
    w.document.title = "Screenshot";
    //w.document.body.style.backgroundColor = "red";
    var img = new Image();
    // Without 'preserveDrawingBuffer' set to true, we must render now
    this.renderer.render(this.scene, this.camera);
    img.src = this.renderer.domElement.toDataURL();
    w.document.body.appendChild(img);

    // download file like this.

    var a = document.createElement('a');
    // Without 'preserveDrawingBuffer' set to true, we must render now
    this.renderer.render(this.scene, this.camera);
    a.href = this.renderer.domElement.toDataURL().replace("image/png", "image/octet-stream");
    a.download = 'canvas.png'
    a.click();

    // New version of file download using toBlob.
    // toBlob should be faster than toDataUrl.
    // But maybe not because also calling createOjectURL.

    this.renderer.render(this.scene, this.camera);
    this.renderer.domElement.toBlob(function (blob) {
      var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'canvas.png';
      a.click();
    }, 'image/png', 1.0);

    scaleArray.reverse();
    this.scene.children.forEach(element => {
      if (element.name === "Arrow") {
        let scale: Vector3 = scaleArray.pop();
        console.log(scale);
        element.scale.set(scale.x, scale.y, scale.z);
      }
    });
  }

  // public setupKeyControls() {
  //   let model = this.scene.getObjectByName('stlModel');
  //   document.onkeydown = function (e) {
  //     // x yukarı aşağı
  //     // y sağ sol 
  //     // z çapraz
  //     switch (e.keyCode) {
  //       case 37:
  //         model.rotation.z += 0.1;
  //         break;
  //       case 38:
  //         model.rotation.x -= 0.1;
  //         break;
  //       case 39:
  //         model.rotation.z -= 0.1;
  //         break;
  //       case 40:
  //         model.rotation.x += 0.1;
  //         break;
  //     }
  //   };
  // }

  public setPlaneColor(planeColor) {
    const planeMaterial = new THREE.MeshBasicMaterial({ color: planeColor, side: THREE.DoubleSide });

    this.scene.children.forEach(element => {
      if (element.name === "Plane") {
        var planeMesh = element as THREE.Mesh;
        planeMesh.material = planeMaterial;
        // plane.material = planeMaterial;
      }
    });
  }
}
