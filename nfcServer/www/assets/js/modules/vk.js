const vkSpaces = {
  keyMargin: 3,
  forceTypeNumberToText: true,
  virtualKeybordSvgPath: '/assets/images/',
  icons: {
    up: 'keyboard_capslock_black_24dp.svg',
    del: 'keyboard_backspace_black_24dp.svg',
    enter: 'keyboard_return_black_24dp.svg',
  },
  texts: {
    number: '123',
    alpha: 'abc',
    emp: ' '
  },
  content: {
    alpha: {
      "0": "azertyuiop",
      "1": "qsdfghjklm",
      "2": "[up,1,1]wxcvbn'[del,1]",
      "3": "[number,1],[space,4].[enter,2]"
    },
    number: {
      "0": "123456789",
      "1": "0@#€%+-()",
      "2": `&*"':;!?[del,1]`,
      "3": "[alpha,1],-[space,2]/.[enter,2]"
    },
    numpad: {
      "0": "789[del,1]",
      "1": "456.",
      "2": "0123",
      "3": "[enter,4]"
    }
  }
}

export class Keyboard {
  constructor(keySize) {
    this.keySize = keySize
    this.keyboardType = null
    this.verrNum = null
  }

  /**
   * show keyboard
   * @param {*} target 
   * @param {string} keyboardType 
   */
  init(target, keyboardType) {
    this.keyboardType = keyboardType
    let block = '', startBlock = false, keyb = '', touche = ''
    Object.keys(vkSpaces.content[this.keyboardType]).forEach((item) => {
      const ligne = vkSpaces.content[this.keyboardType][item]
      keyb += '<div class="keyboard-line">'
      for (let i = 0; i < ligne.length; i++) {
        const value = ligne[i]
        if (value === '[') {
          startBlock = true
          block = ''
        }
        if (value === ']') {
          startBlock = false
          touche = block.split(',')[0]
          const nbx = parseFloat(block.split(',')[1])
          const active = block.split(',')[2]
          let classAdd = '', fonction = ''

          // led status
          if (active !== undefined) {
            classAdd = 'keyboard-key-activatable'
            if (this.verrNum === true) {
              classAdd += ' keyboard-key-active'
            }
          }

          let margin = vkSpaces.keyMargin, width = this.keySize
          if (nbx > 1) {
            margin = vkSpaces.keyMargin + (vkSpaces.keyMargin / nbx)
            width = (this.keySize * nbx) + (vkSpaces.keyMargin * nbx)
          }

          keyb += `<button type="button" ${fonction} class="keyboard-key-${touche} keyboard-key ${classAdd}" style="width: ${width}px;height: ${this.keySize}px;margin: ${vkSpaces.keyMargin}px;">`
          if (vkSpaces.icons[touche]) {
            keyb += `<img src="${vkSpaces.virtualKeybordSvgPath}${vkSpaces.icons[touche]}" alt="">`
          }
          if (vkSpaces.texts[touche]) {
            keyb += vkSpaces.texts[touche]
          }
          keyb += '</button>'
        }
        if (startBlock === true && value !== '[' && value !== ']') {
          block += value
        }
        // afficher touches ordinaires
        if (startBlock === false && value !== '[' && value !== ']') {
          keyb += `<button type="button" class="keyboard-key-simple keyboard-key" style="width: ${this.keySize}px;height: ${this.keySize}px;margin: ${vkSpaces.keyMargin}px;">${value}</button>`
        }
        touche = ''
      }
      keyb += '</div>'
    })
    document.querySelector('.keyboard').innerHTML = keyb

    if (this.verrNum === true) {
      this.upperCaseKeys()
    } else {
      this.lowerCaseKeys()
    }

    // fonction touches ordinaires
    document.querySelectorAll('.keyboard-key-simple').forEach(ele => {
      ele.addEventListener('click', () => {
        this.updateValue(ele, target)
      })
    })

    // fonction espace
    document.querySelectorAll('.keyboard-key-space').forEach(ele => {
      ele.addEventListener('click', () => {
        this.updateValue({ innerText: ' ' }, target)
      })
    })

    // fonction verr/num
    document.querySelectorAll('.keyboard-key-up').forEach(ele => {
      ele.addEventListener('click', () => {
        this.toggleNumberAlpha(ele)
      })
    })

    // fonction entrée
    document.querySelectorAll('.keyboard-key-enter').forEach(ele => {
      ele.addEventListener('click', () => {
        this.hide()
      })
    })

    // fonction sup/del
    document.querySelectorAll('.keyboard-key-del').forEach(ele => {
      ele.addEventListener('click', () => {
        this.delKey(target)
      })
    })

    // fonction 123
    document.querySelectorAll('.keyboard-key-number').forEach(ele => {
      ele.addEventListener('click', () => {
        this.init(target, 'number')
      })
    })

    // fonction abc
    document.querySelectorAll('.keyboard-key-alpha').forEach(ele => {
      ele.addEventListener('click', () => {
        this.init(target, 'alpha')
      })
    })

    // fonction show keyboard
    document.querySelector('.keyboard-use').addEventListener('click', this.show)
  }

  show() {
    document.querySelector('.keyboard').classList.remove('keyboard-hidden')
  }

  hide() {
    document.querySelector('.keyboard').classList.add('keyboard-hidden')
  }

  updateValue(element, target) {
    const cible = document.querySelector(target)
    const value = cible.value
    cible.value = cible.value + element.innerText
  }

  delKey(target) {
    const cible = document.querySelector(target)
    const value = cible.value
    cible.value = value.substring(0, value.length - 1)
  }

  upperCaseKeys() {
    document.querySelectorAll('.keyboard-key-simple').forEach(ele => {
      ele.innerText = ele.innerText.toUpperCase()
    })
  }

  lowerCaseKeys() {
    document.querySelectorAll('.keyboard-key-simple').forEach(ele => {
      ele.innerText = ele.innerText.toLowerCase()
    })
  }

  toggleNumberAlpha(element) {
    this.verrNum = !this.verrNum
    if (this.verrNum === false) {
      element.classList.remove('keyboard-key-active')
      this.lowerCaseKeys()
    } else {
      element.classList.add('keyboard-key-active')
      this.upperCaseKeys()
    }
  }

  run() {
    document.querySelectorAll('.keyboard-use').forEach(ele => {
      let target = '#', keyboardType = 'alpha'
      if (ele.id === '') {
        ele.id = "vk-" + window.crypto.randomUUID()
      }
      const inputType = ele.getAttribute('type')
      if (inputType === null) {
        ele.setAttribute('text')
        inputType = 'text'
      }

      if (inputType === 'number') {
        if (vkSpaces.forceTypeNumberToText === true) {
          document.querySelector(target + ele.id).setAttribute('type', 'text')
        }
        keyboardType = 'numpad'
      }
      this.init(target + ele.id, keyboardType)
    })
  }
}