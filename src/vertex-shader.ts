import main from './vertex-shader.glsl?raw'
import noise3D from '../webgl-noise/src/noise3D.glsl?raw'

export const vertexShader = `
  ${noise3D}
  ${main}
`
