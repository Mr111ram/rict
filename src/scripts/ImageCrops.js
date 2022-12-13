import { minMaxExecute } from './utilFuncs'

export default class ImageCrops {
  preload = false

  __filters = {}

  image = {
    scale: 1,
    crop: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    move: false,
  }

  stagesHandler = {
    draw: [],
    move: [],
    scale: [],
  }

  constructor(opts) {
    const canvas = document.querySelector(opts.canvas)
    const ctx = canvas.getContext('2d')
    this.imageWidth = document.querySelector(opts.width)
    this.imageHeight = document.querySelector(opts.height)
    this.preload = document.querySelector('#preload')
    this.canvas = canvas
    this.ctx = ctx
    this.imageWidth.value = this.imageHeight.value = 500
    this.outputImageSize()
  }

  async uploadImage(handler) {
    this.preload.style.display = 'block'
    const { src, width, height, name } = await electron.chooseImage()
    const img = new Image(width, height)
    img.src = `data:image/jpg;base64,${src}`
    img.onload = () => {
      const path = name.split('\\')
      this.image.el = img
      this.image.name = path[path.length - 1].split('.')
      this.image.name = this.image.name[0] + '_cropped.png'
      handler(this.image)
      setTimeout(() => {
        this.preload.style.display = 'none'
      }, 100)
    }
  }

  loadImage(handler) {
    return async () => {
      return await this.uploadImage(handler)
    }
  }

  renderImage() {
    const origWidth = this.image.el.width
    const origHeight = this.image.el.height

    this.image.conversion = {
      canvas: {
        width: this.canvas.width,
        height: this.canvas.height,
      },
      direction: 'x',
      width: 0,
      height: 0,
    }
    this.image.conversion.cof = minMaxExecute(
      [origHeight, origWidth],
      (min, max) => max / min,
    )

    const canvasWidth = this.image.conversion.canvas.width
    const canvasHeight = this.image.conversion.canvas.height

    // image size conversion
    if (origWidth > origHeight) {
      this.image.conversion.direction = 'y'
      this.image.conversion.width = Math.min(canvasWidth, origWidth)
      this.image.conversion.height =
        this.image.conversion.width / this.image.conversion.cof
    } else {
      this.image.conversion.direction = 'x'
      this.image.conversion.height = Math.min(canvasHeight, origHeight)
      this.image.conversion.width =
        this.image.conversion.height / this.image.conversion.cof
    }

    // offset reset
    this.image.offsetDefault = this.image.offset = {
      x: 0,
      y: 0,
    }

    // offset image
    if (this.image.conversion.direction === 'x') {
      this.image.offset.x =
        (this.image.conversion.canvas.width - this.image.conversion.width) / 2
      this.image.offsetDefault.x = this.image.offset.x
    } else {
      this.image.offset.y =
        (this.image.conversion.canvas.height - this.image.conversion.height) / 2
      this.image.offsetDefault.y = this.image.offset.y
    }

    this.image.origin = {
      width: origWidth,
      height: origHeight,
    }

    this.drawImage()
  }

  drawImage() {
    this.stagesHandler.draw.map((fn) => fn && fn(this.image))
    this.cleanCanvas()
    this.ctx.drawImage(
      this.image.el,
      this.image.crop.x,
      this.image.crop.y,
      this.image.origin.width,
      this.image.origin.height,
      this.image.offset.x,
      this.image.offset.y,
      this.image.conversion.width * this.image.scale,
      this.image.conversion.height * this.image.scale,
    )
  }

  cleanCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  resetOffset() {
    this.image.offset = { x: 0, y: 0 }
  }

  $eventMouseDown(event) {
    this.image.move = true
  }

  $eventMouseDisableMove(event) {
    this.image.move = false
  }

  $eventMouseMove(event) {
    if (this.image.move) {
      this.image.offset.x += event.movementX
      this.image.offset.y += event.movementY
      this.drawImage()
    }
  }

  movableImage() {
    this.canvas.addEventListener('mousedown', this.$eventMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.$eventMouseMove.bind(this))
    this.canvas.addEventListener(
      'mouseup',
      this.$eventMouseDisableMove.bind(this),
    )
    this.canvas.addEventListener(
      'mouseover',
      this.$eventMouseDisableMove.bind(this),
    )
  }

  outputImageSize() {
    const imageWidth = parseInt(this.imageWidth.value)
    const imageHeight = parseInt(this.imageHeight.value)
    const dif = minMaxExecute(
      [this.imageHeight.value, this.imageWidth.value],
      (min, max) => max / min,
    )

    this.canvas.width = imageWidth
    this.canvas.height = imageHeight

    if (imageWidth > imageHeight) {
      this.canvas.style.width = '100%'
      this.canvas.style.height = `${100 / dif}%`
    } else if (imageHeight > imageWidth) {
      this.canvas.style.height = '100%'
      this.canvas.style.width = `${100 / dif}%`
    } else {
      this.canvas.style.height = '100%'
      this.canvas.style.width = '100%'
    }
  }

  eventCanvasSize() {
    const handler = (event) => this.outputImageSize()
    return handler.bind(this)
  }

  canvasSize() {
    this.imageWidth.addEventListener('change', this.eventCanvasSize())
    this.imageHeight.addEventListener('change', this.eventCanvasSize())
  }

  positionCord({ x, y }) {
    const icx = document.querySelector(x)
    const icy = document.querySelector(y)

    icx.value = 0
    icy.value = 0

    const writeCords = (image) => {
      icx.value = image.offset.x
      icy.value = image.offset.y
    }

    const moveToCord = (cord) => {
      return (event) => {
        const value = parseInt(event.target.value)
        if (this.image.conversion) {
          this.image.offset[cord] = value
          this.drawImage()
        } else {
          event.target.value = 0
        }
      }
    }

    icx.addEventListener('change', moveToCord('x'))
    icy.addEventListener('change', moveToCord('y'))

    this.stagesHandler.draw.push(writeCords)
  }

  scaleSize(selector) {
    const input = document.querySelector(selector)
    input.value = 1

    this.stagesHandler.scale.push(({ scale }) => {
      input.value = scale
    })

    input.addEventListener('change', (event) => {
      if (this.image.conversion) {
        this.image.scale = parseFloat(event.target.value)
        this.drawImage()
      } else {
        event.target.value = 1
      }
    })
  }

  scalableImage() {
    this.canvas.addEventListener('wheel', (event) => {
      this.image.scale = parseFloat(
        (this.image.scale + event.deltaY / 1000).toFixed(3),
      )
      if (this.image.scale < 0.1) this.image.scale = 0.1
      if (this.image.scale > 5) this.image.scale = 5
      this.stagesHandler.scale.map((fn) => fn && fn(this.image))
      this.drawImage()
    })
  }

  resetEdits(handler) {
    return () => {
      if (handler) handler()
      ;(this.image.scale = 1),
        (this.image.offset = {
          x: this.image.offsetDefault.x,
          y: this.image.offsetDefault.y,
        })
      this.drawImage()
    }
  }
  renderFilter() {
    const filtersKeys = Object.keys(this.__filters)
    let resultEffects = ''
    filtersKeys.forEach((effect) => {
      resultEffects += this.__filters[effect]
    })
    this.ctx.filter = resultEffects
  }

  effectChangeRange(event) {
    const { min, max, value } = event.target
    console.log(min, value, max)
    if (parseInt(value) > parseInt(max)) event.target.value = parseInt(max)
    if (parseInt(value) < parseInt(min)) event.target.value = parseInt(min)
  }

  effectRenderHandle(event) {
    this.renderFilter()
    this.drawImage()
  }

  effectBrightness() {
    const handler = (event) => {
      this.effectChangeRange(event)
      this.__filters.brightness = `brightness(${
        parseInt(event.target.value) / 100
      })`
      this.effectRenderHandle()
    }
    return handler.bind(this)
  }

  effectContrast() {
    const handler = (event) => {
      this.effectChangeRange(event)
      this.__filters.contrast = `contrast(${
        parseInt(event.target.value) / 100
      })`
      this.effectRenderHandle()
    }
    return handler.bind(this)
  }
  effectGrayscale() {
    const handler = (event) => {
      this.effectChangeRange(event)
      this.__filters.grayscale = `grayscale(${
        parseInt(event.target.value) / 100
      })`
      this.effectRenderHandle()
    }
    return handler.bind(this)
  }
  effectInvert() {
    const handler = (event) => {
      this.effectChangeRange(event)
      this.__filters.invert = `invert(${parseInt(event.target.value) / 100})`
      this.effectRenderHandle()
    }
    return handler.bind(this)
  }

  effects({ brightness, contrast, grayscale, invert }) {
    this.effect = {}

    this.effect.brightness = document.querySelector(brightness)
    this.effect.contrast = document.querySelector(contrast)
    this.effect.grayscale = document.querySelector(grayscale)
    this.effect.invert = document.querySelector(invert)

    console.log(this.effect)

    this.effect.brightness.addEventListener('change', this.effectBrightness())
    this.effect.contrast.addEventListener('change', this.effectContrast())
    this.effect.grayscale.addEventListener('change', this.effectGrayscale())
    this.effect.invert.addEventListener('change', this.effectInvert())
  }
  s
  saveImage() {
    return () => {
      this.drawImage()
      const outputImage = this.canvas.toDataURL('image/png')
      const a = document.createElement('a')

      a.style.position = 'absolute'
      a.style.height = 0
      a.style.opacity = 0
      a.href = outputImage
      a.download = this.image.name || 'image.png'
      a.click()
    }
  }
}
