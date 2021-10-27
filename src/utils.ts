export const debounce = (
  fn: (...args: any) => any,
  interval: number = 300
): ((...args: any[]) => void) => {
  let timerId: number

  return (...args: any[]): void => {
    if (typeof timerId !== 'undefined') {
      window.clearTimeout(timerId)
    }

    timerId = window.setTimeout(() => {
      fn(...args)
    }, interval)
  }
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.addEventListener(
      'load',
      (): void => {
        resolve(img)
      },
      {
        once: true,
      }
    )

    img.addEventListener('error', (error: ErrorEvent) => {
      reject(error)
    })

    img.src = src
  })
}
