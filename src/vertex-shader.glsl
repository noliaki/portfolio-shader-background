uniform float uTime;
uniform vec2 uResolution;
uniform float uProgress;

varying vec2 vUv;

float cubicBezier(float p0, float c0, float p1, float t) {
  float tn = 1.0 - t;

  return (
    tn * tn * p0 +
    2.0 * tn * t * c0 +
    t * t * p1
  );
}

const float maxDelay = 0.6;
const float duration = 1.0 - maxDelay;

void main(void) {
  vUv = uv;

  vec2 p = vec2(
    ((position.x / (uResolution.x * 0.5)) + 1.0) * 0.5,
    ((position.y / (uResolution.y * 0.5)) + 1.0) * 0.5
  );
  float noise = snoise(vec3(p, uTime * 0.0003));
  float delay = ((p.x + p.y) * 0.5) * maxDelay;
  float tProgress = clamp(uProgress - delay, 0.0, duration) / duration;
  float tBezier = cubicBezier(1.0, ((noise + 1.0) * 0.5) + 1.0, 1.0, tProgress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy * tBezier, position.z, 1.0);
}
