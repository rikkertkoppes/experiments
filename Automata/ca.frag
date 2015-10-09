#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;
uniform int step;

int get(vec2 offset) {
    return int(texture2D(state, (gl_FragCoord.xy + offset) / scale).r);
}

void main() {
    int sum =
        4 * get(vec2(-1.0, -1.0)) +
        // get(vec2(-1.0,  0.0)) +
        // get(vec2(-1.0,  1.0)) +
        2 * get(vec2( 0.0, -1.0)) +
        // get(vec2( 0.0,  1.0)) +
        1 * get(vec2( 1.0, -1.0));
        // get(vec2( 1.0,  0.0)) +
        // get(vec2( 1.0,  1.0));
    if (step == int(gl_FragCoord.y)) {
        if (sum >= 1 && sum <= 4) {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    } else {
        // don't change
        float current = float(get(vec2(0.0, 0.0)));
        gl_FragColor = vec4(current, current, current, 1.0);
    }
}