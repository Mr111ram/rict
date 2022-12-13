import '@fontsource/montserrat' /* spell-checker: disable-line;  */
import './index.css'
import ImageCrops from './scripts/ImageCrops'
import UI from './scripts/UI'

document.addEventListener('DOMContentLoaded', () => {
  const crops = new ImageCrops({
    width: '#image_width',
    height: '#image_height',
    canvas: '#canvas',
  })
  const tools = new UI({
    selector: '#tools',
    map: [
      {
        name: 'button_load',
        selector: '#load',
      },
      {
        name: 'button_save',
        selector: '#save',
        disable: true,
      },
      {
        name: 'button_prev',
        selector: '#prev',
        disable: true,
      },
      {
        name: 'button_next',
        selector: '#next',
        disable: true,
      },
    ],
  })

  // Options Control Button
  tools.click('button_next', next)
  tools.click('button_prev', prev)

  // Options Cords Support
  crops.positionCord({
    x: '#image_cord_x',
    y: '#image_cord_y',
  })

  // Options Scale Support
  crops.scaleSize('#image_scale')
  crops.canvasSize()
  // Upload Image
  tools.click(
    'button_load',
    crops.loadImage(() => {
      crops.resetOffset()
      crops.renderImage()
      crops.movableImage()
      crops.scalableImage()
      crops.effects({
        brightness: '#brightness',
        contrast: '#contrast',
        grayscale: '#grayscale',
        invert: '#invert',
      })
      tools.enable(['button_next', 'button_save'])
    }),
  )

  // Save Image After Edits
  tools.click('button_save', crops.saveImage())

  /* Options Block Switch Button */ {
    const stages = ['#adjustment', '#editing']
    let currentStage = stages[0]

    const active = () => {
      const el = document.querySelector(currentStage)
      el.classList.add('active')
    }
    const disableAll = () => {
      stages.forEach((sel) => {
        const el = document.querySelector(sel)
        el.classList.remove('active')
      })
    }

    active()
    tools.enable('button_next')
    tools.click('button_next', (event) => {
      let next = false
      stages.forEach((sel, i) => {
        if (sel === currentStage) {
          next = true
        } else if (next) {
          currentStage = sel
        }
        disableAll()
        active()
      })
      if (stages[stages.length - 1] === currentStage) {
        tools.disable('button_next')
        tools.enable('button_prev')
      }
    })

    tools.click('button_prev', (event) => {
      let memory = ''
      stages.forEach((sel, i) => {
        if (sel !== currentStage) {
          memory = sel
        } else {
          currentStage = memory
        }
        disableAll()
        active()
      })
      if (stages[0] === currentStage) {
        tools.enable('button_next')
        tools.disable('button_prev')
      }
    })
  }
})
