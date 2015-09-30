/// <reference path="three.d.ts" />
function resize(canvas, renderer, camera) {
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    renderer.setSize(w, h);
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = -h / 2;
    camera.bottom = h / 2;
    camera.updateProjectionMatrix();
}
function initRenderer(canvas) {
    return new THREE.WebGLRenderer({
        canvas: canvas,
        premultipliedAlpha: false,
        alpha: true
    });
}
function initScene() {
    var scene = new THREE.Scene();
    return scene;
}
function initCamera(w, h) {
    var camera = new THREE.OrthographicCamera(-w / 2, w / 2, -h / 2, h / 2, 1, 1000);
    camera.position.z = 1;
    return camera;
}
function initGeometry() {
    var geo = new THREE.Geometry();
    geo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, 0, 10));
    //need some faces, only faces are rendered by the fragment shader
    geo.faces.push(new THREE.Face3(0, 1, 2));
    // var geo = new THREE.CubeGeometry(10, 10, 10);
    return geo;
}
function initMaterial(attributes) {
    var mat = new THREE.ShaderMaterial({
        // uniforms: this.uniforms,
        side: THREE.DoubleSide,
        vertexShader: document.querySelector('#vertexShader').textContent,
        fragmentShader: document.querySelector('#fragmentShader').textContent,
        attributes: attributes
    });
    return mat;
}
function frame(renderer, scene, camera) {
    renderer.render(scene, camera);
    requestAnimationFrame(function () {
        frame(renderer, scene, camera);
    });
}
function init(canvasId) {
    var canvas = document.getElementById(canvasId);
    var renderer = initRenderer(canvas);
    var scene = initScene();
    var camera = initCamera(100, 100);
    var attributes = {
        activity: { type: 'f', value: [0, 0, 0, 0] }
    };
    var material = initMaterial(attributes);
    var geometry = initGeometry();
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    window.onresize = function () {
        resize(canvas, renderer, camera);
    };
    window.onmousedown = function () {
        attributes.activity.value[1] = 1;
        material.attributes.activity.needsUpdate = true;
    };
    window.onmouseup = function () {
        attributes.activity.value[1] = 0;
        material.attributes.activity.needsUpdate = true;
    };
    resize(canvas, renderer, camera);
    frame(renderer, scene, camera);
}
init('main');
