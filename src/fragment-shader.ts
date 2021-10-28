import main from './fragment-shader.glsl?raw'
import noise3D from '../webgl-noise/src/noise3D.glsl?raw'

export const fragmentShader = `
  ${noise3D}
  ${main}
`
