export default class UI {
  buttons = []
  memory = {
    '<status>': {},
  }
  constructor({ selector, map }) {
    this.root = document.querySelector(selector)
    map.forEach((opts) => {
      const button = {
        name: opts.name,
        el: document.querySelector(opts.selector),
      }
      if (opts.disable) {
        button.el.disabled = true
      }
      this.buttons.push(button)
    })
  }

  click(name, handler) {
    this.buttons.forEach((button) => {
      if (Array.isArray(name)) {
        name.forEach((element) => {
          if (button.name === element) {
            button.el.addEventListener('click', handler)
          }
        })
      } else {
        if (button.name === name) {
          button.el.addEventListener('click', handler)
        }
      }
    })
  }

  enable(name) {
    this.buttons.forEach((button) => {
      if (Array.isArray(name)) {
        name.forEach((element) => {
          if (button.name === element) {
            button.el.disabled = false
          }
        })
      } else {
        if (button.name === name || name === 'all') {
          button.el.disabled = false
        }
      }
    })
  }

  disable(name) {
    this.buttons.forEach((button) => {
      if (Array.isArray(name)) {
        name.forEach((element) => {
          if (button.name === element) {
            button.el.disabled = true
          }
        })
      } else {
        if (button.name === name || name === 'all') {
          button.el.disabled = true
        }
      }
    })
  }
}
