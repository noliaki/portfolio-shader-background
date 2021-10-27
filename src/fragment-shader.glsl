uniform float uTime;
uniform sampler2D uTexturePrev;
uniform sampler2D uTextureNext;
uniform vec2 uTexturePrevResolution;
uniform vec2 uTextureNextResolution;
uniform vec2 uResolution;
uniform float uProgress;

varying vec2 vUv;

float rand(vec2 co) {
  float a = fract(dot(co, vec2(2.067390879775102, 12.451168662908249))) - 0.5;
  float s = a * (6.182785114200511 + a * a * (-38.026512460676566 + a * a * 53.392573080032137));
  float t = fract(s * 43758.5453);

  return t;
}

vec2 imageRatio(vec2 resolution, vec2 imageResolution) {
  return vec2(
    min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
    min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
  );
}

vec2 imageUv(vec2 resolution, vec2 imageResolution, vec2 uv){
  vec2 ratio = imageRatio(resolution, imageResolution);

  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

float cubicBezier(float p0, float c0, float p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

const vec4 dl = vec4(0.3, 0.06, 0.3, 1.0);
const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;

void main(void) {
  float noise = snoise(vec3(vUv, uTime / 12000.0));
  float fNoise = ((noise + 1.0) * 0.5);

  float delay = (vUv.x + vUv.y) * 0.5 * maxDelay;
  float tProgress = clamp(uProgress - delay, 0.0, duration) / duration;
  float tBezier = cubicBezier(0.0, 1.0 + fNoise * 4.0, 0.0, tProgress);

  float stagger = (tBezier * noise + 1.0);

  vec2 prevUv = imageUv(uResolution, uTexturePrevResolution, vUv) * stagger;
  vec2 nextUv = imageUv(uResolution, uTextureNextResolution, vUv) * stagger;

  float r = rand(vUv) * 0.01;

  float noiseR = snoise(vec3(vUv, uTime / 5000.0)) * 0.07 + r;
  float noiseG = snoise(vec3(vUv * 0.9, uTime / 7000.0)) * 0.8 + r;
  float noiseB = snoise(vec3(vUv * 0.2, uTime / 4500.0)) * 0.07 + r;

  float pr = texture2D(uTexturePrev, prevUv + noiseR).r;
  float pg = texture2D(uTexturePrev, prevUv + noiseG).g;
  float pb = texture2D(uTexturePrev, prevUv + noiseB).b;

  float nr = texture2D(uTextureNext, nextUv + noiseR).r;
  float ng = texture2D(uTextureNext, nextUv + noiseG).g;
  float nb = texture2D(uTextureNext, nextUv + noiseB).b;

  float darkness = (tBezier * 2.0 + 1.0);

  vec4 prevColor = vec4(pr * darkness * 0.3, pg * darkness * 0.06, pb * darkness * 0.3, 1.0);
  vec4 nextColor = vec4(nr * darkness * 0.3, ng * darkness * 0.06, nb * darkness * 0.3, 1.0);

  gl_FragColor = mix(prevColor, nextColor, tProgress);
}
