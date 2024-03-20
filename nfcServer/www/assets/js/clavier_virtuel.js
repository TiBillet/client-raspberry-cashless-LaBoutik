export let pos = { debSel: 0, finSel: 0}
export let ancienEtatAlpha = 'alpahMin'

let etatsClavier = {
  "alpahMin": [
    [
      {"type": "nombre", "taille": 1, "val": 97},
      {"type": "nombre", "taille": 1, "val": 122},
      {"type": "nombre", "taille": 1, "val": 101},
      {"type": "nombre", "taille": 1, "val": 114},
      {"type": "nombre", "taille": 1, "val": 116},
      {"type": "nombre", "taille": 1, "val": 121},
      {"type": "nombre", "taille": 1, "val": 117},
      {"type": "nombre", "taille": 1, "val": 105},
      {"type": "nombre", "taille": 1, "val": 111},
      {"type": "nombre", "taille": 1, "val": 112}
      ],
    [
      {"type": "caractere", "taille": 1, "val": 'q'},
      {"type": "caractere", "taille": 1, "val": 's'},
      {"type": "caractere", "taille": 1, "val": 'd'},
      {"type": "caractere", "taille": 1, "val": 'f'},
      {"type": "caractere", "taille": 1, "val": 'g'},
      {"type": "caractere", "taille": 1, "val": 'h'},
      {"type": "caractere", "taille": 1, "val": 'j'},
      {"type": "caractere", "taille": 1, "val": 'k'},
      {"type": "caractere", "taille": 1, "val": 'l'},
      {"type": "caractere", "taille": 1, "val": 'm'}
      ],
    [
      {"type": "mot", "taille": 1, "val": 'MAJ'},
      {"type": "caractere", "taille": 1, "val": 'w'},
      {"type": "caractere", "taille": 1, "val": 'x'},
      {"type": "caractere", "taille": 1, "val": 'c'},
      {"type": "caractere", "taille": 1, "val": 'v'},
      {"type": "caractere", "taille": 1, "val": 'b'},
      {"type": "caractere", "taille": 1, "val": 'n'},
      {"type": "caractere", "taille": 1, "val": '?'},
      {"type": "mot", "taille": 1, "val": "simpleGuillemet"},
      {"type": "mot", "taille": 1, "val": 'SUP'}
      ],
    [
      {"type": "mot", "taille": 1, "val": 'ALT'},
      {"type": "mot", "taille": 1, "val": 'NUM'},
      {"type": "caractere", "taille": 1, "val": ','},
      {"type": "mot", "taille": 2, "val": 'ESPACE'},
      {"type": "caractere", "taille": 1, "val": '.'},
      {"type": "mot", "taille": 2, "val": 'VALIDER'},
      {"type": "mot", "taille": 2, "val": 'RETOUR LIGNE'}
    ],
  ],
  "alpahMaj": [
    [
      {"type": "caractere", "taille": 1, "val": 'A'},
      {"type": "caractere", "taille": 1, "val": 'Z'},
      {"type": "caractere", "taille": 1, "val": 'E'},
      {"type": "caractere", "taille": 1, "val": 'R'},
      {"type": "caractere", "taille": 1, "val": 'T'},
      {"type": "caractere", "taille": 1, "val": 'Y'},
      {"type": "caractere", "taille": 1, "val": 'U'},
      {"type": "caractere", "taille": 1, "val": 'I'},
      {"type": "caractere", "taille": 1, "val": 'O'},
      {"type": "caractere", "taille": 1, "val": 'P'}
      ],
    [
      {"type": "caractere", "taille": 1, "val": 'Q'},
      {"type": "caractere", "taille": 1, "val": 'S'},
      {"type": "caractere", "taille": 1, "val": 'D'},
      {"type": "caractere", "taille": 1, "val": 'F'},
      {"type": "caractere", "taille": 1, "val": 'G'},
      {"type": "caractere", "taille": 1, "val": 'H'},
      {"type": "caractere", "taille": 1, "val": 'J'},
      {"type": "caractere", "taille": 1, "val": 'K'},
      {"type": "caractere", "taille": 1, "val": 'L'},
      {"type": "caractere", "taille": 1, "val": 'M'}
      ],
    [
      {"type": "mot", "taille": 1, "val": 'MAJ'},
      {"type": "caractere", "taille": 1, "val": 'W'},
      {"type": "caractere", "taille": 1, "val": 'X'},
      {"type": "caractere", "taille": 1, "val": 'C'},
      {"type": "caractere", "taille": 1, "val": 'V'},
      {"type": "caractere", "taille": 1, "val": 'B'},
      {"type": "caractere", "taille": 1, "val": 'N'},
      {"type": "mot", "taille": 1, "val": "simpleGuillemet"},
      {"type": "mot", "taille": 2, "val": 'SUP'},
      ],
    [
      {"type": "mot", "taille": 2, "val": 'NUM'},
      {"type": "caractere", "taille": 1, "val": ','},
      {"type": "mot", "taille": 4, "val": 'ESPACE'},
      {"type": "caractere", "taille": 1, "val": '.'},
      {"type": "mot", "taille": 2, "val": 'RETOUR LIGNE'}
      ],
   ],
   "num": [
    [
      {"type": "caractere", "taille": 1, "val": '1'},
      {"type": "caractere", "taille": 1, "val": '2'},
      {"type": "caractere", "taille": 1, "val": '3'},
      {"type": "caractere", "taille": 1, "val": '4'},
      {"type": "caractere", "taille": 1, "val": '5'},
      {"type": "caractere", "taille": 1, "val": '6'},
      {"type": "caractere", "taille": 1, "val": '7'},
      {"type": "caractere", "taille": 1, "val": '8'},
      {"type": "caractere", "taille": 1, "val": '9'},
      {"type": "caractere", "taille": 1, "val": '0'}
      ],
    [
      {"type": "caractere", "taille": 1, "val": '@'},
      {"type": "caractere", "taille": 1, "val": '#'},
      {"type": "caractere", "taille": 1, "val": '$'},
      {"type": "caractere", "taille": 1, "val": '%'},
      {"type": "caractere", "taille": 1, "val": '&'},
      {"type": "caractere", "taille": 1, "val": '*'},
      {"type": "caractere", "taille": 1, "val": '_'},
      {"type": "caractere", "taille": 1, "val": '+'},
      {"type": "caractere", "taille": 1, "val": '('},
      {"type": "caractere", "taille": 1, "val": ')'},
      ],
    [
      {"type": "caractere", "taille": 1, "val": '-'},
      {"type": "caractere", "taille": 1, "val": '['},
      {"type": "caractere", "taille": 1, "val": ']'},
      {"type": "caractere", "taille": 1, "val": '!'},
      {"type": "caractere", "taille": 1, "val": '"'},
      {"type": "mot", "taille": 1, "val": "simpleGuillemet"},
      {"type": "caractere", "taille": 1, "val": ':'},
      {"type": "caractere", "taille": 1, "val": ';'},
      {"type": "caractere", "taille": 1, "val": '/'},
      {"type": "caractere", "taille": 1, "val": '?'}
      ],
    [
      {"type": "mot", "taille": 2, "val": 'ABC'},
      {"type": "mot", "taille": 1, "val": 'ALT'},
      {"type": "mot", "taille": 4, "val": 'ESPACE'},
      {"type": "caractere", "taille": 1, "val": '.'},
      {"type": "mot", "taille": 2, "val": 'RETOUR LIGNE'}
      ],
   ],
   "alt": [
    [
      {"type": "caractere", "taille": 1, "val": '~'},
      {"type": "caractere", "taille": 1, "val": '`'},
      {"type": "caractere", "taille": 1, "val": '|'},
      {"type": "caractere", "taille": 1, "val": '.'},
      {"type": "caractere", "taille": 1, "val": 'x'},
      {"type": "caractere", "taille": 1, "val": '{'},
      {"type": "caractere", "taille": 1, "val": '}'},
      {"type": "caractere", "taille": 1, "val": '€'},
      {"type": "caractere", "taille": 1, "val": '°'},
      {"type": "caractere", "taille": 1, "val": '^'},
      ],
    [
      {"type": "mot", "taille": 2, "val": 'NUM'},
      {"type": "caractere", "taille": 1, "val": '_'},
      {"type": "caractere", "taille": 1, "val": '='},
      {"type": "caractere", "taille": 1, "val": '['},
      {"type": "caractere", "taille": 1, "val": ']'},
      {"type": "caractere", "taille": 1, "val": '<'},
      {"type": "caractere", "taille": 1, "val": '>'},
      {"type": "mot", "taille": 1, "val": 'antiSlash'},
      {"type": "caractere", "taille": 1, "val": '"'}
      ],
    [
      {"type": "mot", "taille": 2, "val": 'ABC'},
      {"type": "mot", "taille": 4, "val": 'ESPACE'},
      {"type": "mot", "taille": 2, "val": 'VALIDER'},
      {"type": "mot", "taille": 2, "val": 'RETOUR LIGNE'}
      ],
   ],
  "numSolo": [
    [
      {"type": "caractere", "taille": 1, "val": '1'},
      {"type": "caractere", "taille": 1, "val": '2'},
      {"type": "caractere", "taille": 1, "val": '3'},
      {"type": "caractere", "taille": 1, "val": '4'}
    ],
    [
      {"type": "caractere", "taille": 1, "val": '5'},
      {"type": "caractere", "taille": 1, "val": '6'},
      {"type": "caractere", "taille": 1, "val": '7'},
      {"type": "caractere", "taille": 1, "val": '8'}
    ],
    [
      {"type": "caractere", "taille": 1, "val": '9'},
      {"type": "caractere", "taille": 1, "val": '0'},
      {"type": "caractere", "taille": 1, "val": '.'},
      {"type": "mot", "taille": 1, "val": 'C'}
    ],
    [
      {"type": "mot", "taille": 2, "val": 'SUP'},
      {"type": "mot", "taille": 2, "val": 'VALIDER'}
    ]
  ]
}


function obtEtatSelection (cible){
  let element = document.getElementById(cible)
  // plage de sélection
  let debSel = element.selectionStart
  let finSel = element.selectionEnd
  return { debSel: debSel, finSel: finSel }
}

export function simule(touche, typeTouche, cible) {
  let etat
  let element = document.getElementById(cible)

  // ajout de cartères qui induisent des erreurs de d'interprétation du code html/javascript
  if (touche === 'simpleGuillemet') {
    touche = "'"
    typeTouche = 'caractere'
  }

  if (touche === 'antiSlash') {
    touche = "\\"
    typeTouche = 'caractere'
  }

  if (touche === 'ESPACE') {
    touche = ' '
    typeTouche = 'caractere'
  }

  if (touche === 'RETOUR LIGNE') {
    touche = '\n'
    typeTouche = 'caractere'
  }

  // entrée clavier
  if (typeTouche !== 'mot') {
    let texte = element.value
    // tout le texte avant le début de sélection
    let texteAvant = texte.substring(0, pos.debSel)
    // tout le texte après la fin de sélection
    let texteApres  = texte.substring(pos.finSel, texte.length)
    // nouveau texte
    element.value = texteAvant + touche + texteApres
    // maj position curseur
    pos.debSel += 1
    pos.finSel = pos.debSel
  }

  // état du clavier
  if (touche === 'MAJ') {
    if (etat === 'alpahMaj' ){
      etat = 'alpahMin'
      ancienEtatAlpha = 'alpahMin'
    } else {
      etat = 'alpahMaj'
      ancienEtatAlpha = 'alpahMaj'
    }
    afficher(cible, etat)
  }

  if (touche === 'NUM') {
    etat = 'num'
    afficher(cible, etat)
  }

  if (touche === 'ABC') {
    etat = ancienEtatAlpha
    afficher(cible, etat)
  }

  if (touche === 'ALT') {
    etat = 'alt'
    afficher(cible, etat)
  }

  // touche supprimer
  if (touche === 'SUP') {
    let texteAvant, texteApres
    let texte = element.value

    // selection ?
    let sel = obtEtatSelection(cible)
    if (sel.debSel !== sel.finSel) {
      pos.debSel = sel.debSel
      pos.finSel = sel.finSel
    }

    if (sel.debSel === sel.finSel) { // pas de sélection
      texteAvant = texte.substring(0, pos.debSel-1)
      pos.debSel -= 1
    } else { // sélection
      texteAvant = texte.substring(0, pos.debSel)
    }
    texteApres  = texte.substring(pos.finSel, texte.length)
    pos.finSel = pos.debSel
    element.value = texteAvant + texteApres
  }

  //Vider l'entréé
  if (touche === 'C') {
    document.querySelector('#' + cible).value = ''
  }

  // validation
   if (touche === 'VALIDER') {
     let eleSup = document.querySelector('#clavier-virtuel-conteneur')
      eleSup.parentNode.removeChild(eleSup)
   }
}

export function obtPosition(cible){
  let element = document.getElementById(cible)
  pos = { debSel: element.selectionStart, finSel: element.selectionEnd}
}

export function afficher(cible, etat) {
  let largeurTouche = 50
  try {
    // supprime un ancien clavier virtuel et son évènement
    let eleSup = document.querySelector('#clavier-virtuel-conteneur')
    eleSup.parentNode.removeChild(eleSup)
  } catch (error) {
    console.log("info: l'élément clavier n'existait pas !")
  }

  let touches = etatsClavier[etat]

  let clavierFrag = `
    <div id="clavier-virtuel-conteneur">
  `
  for (let i = 0; i < touches.length; i++) {
    let ligne = touches[i]
    clavierFrag += `
      <div class="clavier-virtuel-ligne">
    `
    for (let j = 0; j < ligne.length; j++) {
      let typeData = ligne[j].type
      let taille = ligne[j].taille
      let val = ligne[j].val
      let retour, goutiere = 0
      if (typeData === 'nombre') {
        retour  = String.fromCharCode(val)
      } else {
        retour = val
      }

      if (taille > 1) {
        goutiere = (taille-1) * 8
      }

      // console.log('-> typeData = ' + typeData + '  --  taille = ' + taille + '  --  val = ' + val + '  --  retour = ' + retour)
      clavierFrag += `
          <div class="clavier-virtuel-touche" onclick="clavierVirtuel.simule('${ retour }', '${ typeData }', '${ cible }')"
           style="width: ${ (goutiere + taille * largeurTouche) }px">
      `
      if (typeData === 'nombre' || typeData === 'caractere' || typeData === 'caractereSpecial') {
        clavierFrag += `<div class="clavier-virtuel-text">${ retour }</div>`
      }

      if (typeData === 'mot') {
        if (val === 'simpleGuillemet') {
          clavierFrag += `<div class="clavier-virtuel-text">'</div>`
        }

        if (val === 'antiSlash') {
          clavierFrag += `<div class="clavier-virtuel-text">\\</div>`
        }

        if (val !== 'simpleGuillemet' && val !== 'antiSlash') {
          let text = val.split(' ')
          for (let k = 0; k < text.length; k++) {
            clavierFrag += `<div class="clavier-virtuel-text">${text[k]}</div>`
          }
        }
      }
      clavierFrag += `</div>`
    }
    clavierFrag += `</div>`
  }
  clavierFrag += '</div>'
  document.querySelector('body').insertAdjacentHTML('beforeend', clavierFrag)
}