
var do_animation = false;

var InitDemo = function () {

    do_animation = false;
    var vertexShaderText = document.getElementById("vertex-shader").value;
    var fragmentShaderText = document.getElementById("fragment-shader").value;

    console.log('This is working');

    var canvas = document.getElementById('game-surface');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    //
    // Create shaders
    // 
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    //
    // Create buffer
    //
    var boxVertices = 
    [ // X, Y, Z           R, G, B
        // Top
        -1.0, 1.0, -1.0,   0.0, 0.0, 0.0,
        -1.0, 1.0, 1.0,    0.0, 0.0, 0.0,
        1.0, 1.0, 1.0,     0.0, 0.0, 0.0,
        1.0, 1.0, -1.0,    0.0, 0.0, 0.0,

        // Left
        -1.0, 1.0, 1.0,    0.0, 0.0, 0.0,
        -1.0, -1.0, 1.0,   0.0, 0.0, 0.0,
        -1.0, -1.0, -1.0,  0.0, 0.0, 0.0,
        -1.0, 1.0, -1.0,   0.0, 0.0, 0.0,

        // Right
        1.0, 1.0, 1.0,    0.0, 0.0, 0.0,
        1.0, -1.0, 1.0,   0.0, 0.0, 0.0,
        1.0, -1.0, -1.0,  0.0, 0.0, 0.0,
        1.0, 1.0, -1.0,   0.0, 0.0, 0.0,

        // Front
        1.0, 1.0, 1.0,    0.0, 0.0, 0.0,
        1.0, -1.0, 1.0,   0.0, 0.0, 0.0,
        -1.0, -1.0, 1.0,  0.0, 0.0, 0.0,
        -1.0, 1.0, 1.0,   0.0, 0.0, 0.0,

        // Back
        1.0, 1.0, -1.0,    0.0, 0.0, 0.0,
        1.0, -1.0, -1.0,   0.0, 0.0, 0.0,
        -1.0, -1.0, -1.0,  0.0, 0.0, 0.0,
        -1.0, 1.0, -1.0,   0.0, 0.0, 0.0,

        // Bottom
        -1.0, -1.0, -1.0,   0.0, 0.0, 0.0,
        -1.0, -1.0, 1.0,    0.0, 0.0, 0.0,
        1.0, -1.0, 1.0,     0.0, 0.0, 0.0,
        1.0, -1.0, -1.0,    0.0, 0.0, 0.0,
    ];
    for (var i=0; i<boxVertices.length; i+=3*2*4) {
        var offset = [ 0.0, 0.0, 0.0,  0.0, 0.0, 0.0,  
                       0.0, 0.0, 0.0,  0.0, 1.0, 0.0,
                       0.0, 0.0, 0.0,  1.0, 1.0, 0.0,
                       0.0, 0.0, 0.0,  1.0, 0.0, 0.0 ];
        for (var j=0; j<offset.length; j++) {
            boxVertices[i+j] += offset[j]
        }
    }

    var boxIndices =
    [
        // Top
        0, 1, 2,
        0, 2, 3,

        // Left
        5, 4, 6,
        6, 4, 7,

        // Right
        8, 9, 10,
        8, 10, 11,

        // Front
        13, 12, 14,
        15, 14, 12,

        // Back
        16, 17, 18,
        16, 18, 19,

        // Bottom
        21, 20, 22,
        22, 20, 23
    ];

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program);

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    var matTimeUniformLocation = gl.getUniformLocation(program, 'time');

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);
    

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    gl.uniform1f(matTimeUniformLocation, Date.now() / 100. );

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    do_animation = true;
    var loop = function () {
        if (do_animation) {
            angle = performance.now() / 3000 / 6 * 2 * Math.PI;
            mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
            mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
            mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
            gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
            gl.uniform1f(matTimeUniformLocation, (Date.now() / 1000.00)%10000. );

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

            requestAnimationFrame(loop);
        }
    };
    requestAnimationFrame(loop);
};
