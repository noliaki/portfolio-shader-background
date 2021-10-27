import './style.css'

import {
  WebGLRenderer,
  Mesh,
  Scene,
  OrthographicCamera,
  PlaneBufferGeometry,
  ShaderMaterial,
  Texture,
} from 'three'
import { debounce } from './utils'
import { vertexShader } from './vertex-shader'
import { fragmentShader } from './fragment-shader'

const winWidth = window.innerWidth
const winHeight = window.innerHeight

const startTime = Date.now()

const renderer = new WebGLRenderer()
const scene = new Scene()
const camera = new OrthographicCamera(
  -winWidth / 2,
  winWidth / 2,
  winHeight / 2,
  -winHeight / 2
)
const mesh = new Mesh(
  new PlaneBufferGeometry(winWidth, winHeight, 1, 1),
  new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: {
        value: Date.now() - startTime,
      },
      uResolution: {
        value: [winWidth, winHeight],
      },
      uTexturePrev: {
        value: new Texture(),
      },
      uTextureNext: {
        value: new Texture(),
      },
      uTexturePrevResolution: {
        value: [0, 0],
      },
      uTextureNextResolution: {
        value: [0, 0],
      },
      uProgress: {
        value: 0,
      },
    },
  })
)

const setRenderer: (winWidth?: number, winHeight?: number) => void = (
  winWidth = window.innerWidth,
  winHeight = window.innerHeight
): void => {
  renderer.setSize(winWidth, winHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
}

const setCamera: (winWidth?: number, winHeight?: number) => void = (
  winWidth = window.innerWidth,
  winHeight = window.innerHeight
): void => {
  camera.top = winHeight / 2
  camera.right = winWidth / 2
  camera.bottom = -winHeight / 2
  camera.left = -winWidth / 2

  camera.near = -10000
  camera.far = 10000

  camera.updateProjectionMatrix()
}

const setMesh: (winWidth?: number, winHeight?: number) => void = (
  winWidth = window.innerWidth,
  winHeight = window.innerHeight
): void => {
  mesh.geometry = new PlaneBufferGeometry(winWidth, winHeight, 1, 1)
  mesh.material.uniforms.uResolution.value = [winWidth, winHeight]
}

const update = () => {
  const {
    material: {
      uniforms: { uTime },
    },
  } = mesh

  uTime.value = Date.now() - startTime
}

window.addEventListener(
  'resize',
  debounce(() => {
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    setRenderer(winWidth, winHeight)
    setCamera(winWidth, winHeight)
    setMesh(winWidth, winHeight)
  }, 300),
  {
    passive: true,
  }
)
