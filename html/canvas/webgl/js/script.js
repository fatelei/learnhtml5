var gl; // global WebGL object
var shaderProgram;

function initGL(canvas) {
    try {
        gl = canvas.getContext('experimental-webgl');
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {}
    if (! gl) {
        alert('Can`t initialise WebGL, not supported');
    }
}

function getShader(gl, type) {
    var str = '';
    var shader;

    if (type == 'x-fragment') {
        str = "#ifdef GL_ES\n"+
"precision highp float;\n"+
"#endif\n"+
"varying vec4 vColor;\n"+
"void main(void) {\n"+
"    gl_FragColor = vColor;\n"+
"}\n";
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == 'x-vertex') {
        str = "attribute vec3 aVertexPosition;\n"+
"attribute vec4 aVertexColor;\n"+
"uniform mat4 uMVMatrix;\n"+
"uniform mat4 uPMatrix;\n"+
"varying vec4 vColor;\n"+
"void main(void) {\n"+
"    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n"+
"    vColor = aVertexColor;\n"+
"}\n";
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function initShaders() {
    var fragmentShader = getShader(gl, 'x-fragment');
    var vertexShader = getShader(gl, 'x-vertex');

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Can`t initialise shaders');
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw 'Invalid popMatrix!';
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var objVertexPositionBuffer;
var objVertexColorBuffer;

function initObjBuffers() {
    objVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, objVertexPositionBuffer);
    var vertices = [
         1.0,  2.0,  -1.0,
        -1.0,  2.0,  -1.0,
         1.0, -2.0,  -1.0,
        -1.0, -2.0,  -1.0,
         1.0,  2.0,  1.0,
        -1.0,  2.0,  1.0,
         1.0, -2.0,  1.0,
        -1.0, -2.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    objVertexPositionBuffer.itemSize = 3;
    objVertexPositionBuffer.numItems = 8;

    objVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, objVertexColorBuffer);
    var colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 0.5,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 0.5,
        1.0, 0.0, 0.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    objVertexColorBuffer.itemSize = 4;
    objVertexColorBuffer.numItems = 8;
}

var iObjDeg = 0;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0.0, 0.0, -10.0]);

    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(iObjDeg), [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, objVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, objVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, objVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, objVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, objVertexPositionBuffer.numItems);

    mvPopMatrix();
}

function drawFrame() {
    requestAnimFrame(drawFrame);
    drawScene();

    iObjDeg += 3; // 3 degrees per frame
}

function initWebGl() {
    var canvas = document.getElementById('panel');

    initGL(canvas);
    initShaders()
    initObjBuffers();

    gl.clearColor(1.0, 0.5, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    drawFrame();
}
