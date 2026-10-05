import { useEffect, useRef } from 'react';

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

// A lit sphere + a lagging pointer glow, warped by a slow wave. The grain is not an overlay:
// each pixel averages 24 random taps of the field, so it thickens where the image has contrast
// (the lit edge) and vanishes across flat black.
const FRAG = `
precision highp float;
uniform vec2 res; uniform float t; uniform vec2 mouse;
float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }

float field(vec2 uv){
  float asp = res.x/res.y;
  vec2 p = (uv-0.5)*vec2(asp,1.);
  p += 0.018*vec2(sin(p.y*3.+t*.30), cos(p.x*3.+t*.23));          // slow standing wave

  vec2 c = vec2(0.42*asp, -0.34);                                  // sphere, anchored low-right
  vec2 q = (p-c)/0.62;
  float d = length(q);
  float edge = smoothstep(1.0, 0.9, d);
  float z = sqrt(max(1.-d*d, 0.));
  float lit = max(dot(vec3(q,z), normalize(vec3(-.55,.6,.65))), 0.)*edge;

  vec2 m = (mouse-0.5)*vec2(asp,1.);                               // pointer trail
  float glow = smoothstep(0.34, 0., length(p-m))*0.22;

  return lit*0.5 + glow;
}

void main(){
  vec2 uv = gl_FragCoord.xy/res;
  float acc = 0.;
  for(int i=0;i<24;i++){
    float fi = float(i);
    float a = hash(gl_FragCoord.xy+fi*17.31)*6.2831;
    float r = sqrt(hash(gl_FragCoord.xy*1.37+fi*9.17+floor(t*6.)))*0.075;
    acc += field(uv + vec2(cos(a),sin(a))*r*vec2(res.y/res.x,1.));
  }
  float v = acc/24.;
  vec3 col = mix(vec3(.32,.18,.02), vec3(.65,.45,.15), clamp(v, 0., 1.)) * v;       // subdued warm amber
  gl_FragColor = vec4(col*0.18, 1.);
}`;

/** Fixed, full-page grain-gradient background. Pure black where the field is flat. */
export default function GrainField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'res');
    const uT = gl.getUniformLocation(prog, 't');
    const uM = gl.getUniformLocation(prog, 'mouse');

    const scale = 0.6; // render below native res: cheaper, and the grain reads coarser
    const resize = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const target = { x: 0.7, y: 0.25 };
    const trail = { x: 0.7, y: 0.25 };
    const onMove = (e) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      trail.x += (target.x - trail.x) * 0.05; // decaying trail
      trail.y += (target.y - trail.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform2f(uM, trail.x, trail.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
