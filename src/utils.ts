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

    img.crossOrigin = 'anonymous'

    img.addEventListener(
      'load',
      (): void => {
        resolve(img)
      },
      {
        once: true,
      }
    )

    img.addEventListener('error', (error: Event) => {
      reject(error)
    })

    img.src = src
  })
}

export const fetchData = async (query: string): Promise<any> => {
  return await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${
      import.meta.env.VITE_CTF_SPACE_ID ?? ''
    }`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_CTF_ACCESS_TOKEN ?? ''}`,
      },
      body: JSON.stringify({ query }),
    }
  ).then(async (res: Response): Promise<any> => await res.json())
}
