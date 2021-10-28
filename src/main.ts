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
import { Tween24, Ease24 } from 'tween24'
import { debounce, fetchData, loadImage } from './utils'
import { vertexShader } from './vertex-shader'
import { fragmentShader } from './fragment-shader'

interface ImageInfo {
  url: string
  width: number
  height: number
}

const { innerWidth: winWidth, innerHeight: winHeight } = window

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
        value: 0,
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

  camera.near = -1
  camera.far = 1

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

  uTime.value += 1

  renderer.render(scene, camera)

  requestAnimationFrame(() => {
    update()
  })
}

const imageInfos: ImageInfo[] = []

const fetchImageData = async (): Promise<any> => {
  const images = await fetchData(
    `{
      backgroundImageCollection {
        items {
          image {
            url
            width
            height
          }
        }
      }
    }`
  )

  return images?.data?.backgroundImageCollection?.items ?? []
}

const init = async () => {
  const images: { image: ImageInfo }[] = await fetchImageData()

  for (let i = images.length - 1; i >= 0; i--) {
    const r = Math.floor(Math.random() * (i + 1))
    const temp = images[i]

    images[i] = images[r]
    images[r] = temp
  }

  imageInfos.push(...images.map(({ image }) => image))

  setRenderer(winWidth, winHeight)
  setCamera(winWidth, winHeight)
  setMesh(winWidth, winHeight)

  scene.add(mesh)

  document.body.appendChild(renderer.domElement)

  update()

  nextImage(imageInfos[currentImageIndex])
}

const nextImage = async ({ url, width, height }: ImageInfo): Promise<void> => {
  const nextImageEl = await loadImage(url)
  const {
    material: {
      uniforms: {
        uProgress,
        uTexturePrev,
        uTexturePrevResolution,
        uTextureNext,
        uTextureNextResolution,
      },
    },
  } = mesh

  const progress = {
    value: 0,
  }

  uTextureNext.value.image = nextImageEl
  uTextureNext.value.needsUpdate = true
  uTextureNextResolution.value = [width, height]

  Tween24.tween(progress, 2.5, Ease24._2_QuadInOut, { value: 1 })
    .onUpdate(() => {
      uProgress.value = progress.value
    })
    .onComplete(() => {
      uProgress.value = 0
      uTexturePrev.value.image = nextImageEl
      uTexturePrev.value.needsUpdate = true
      uTexturePrevResolution.value = [width, height]

      setTimeout(() => {
        const { length: imageLen } = imageInfos

        currentImageIndex = (currentImageIndex + 1) % imageLen

        nextImage(imageInfos[currentImageIndex])
      }, 1000)
    })
    .play()
}

let currentImageIndex = 0

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

init()
