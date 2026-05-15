// variáveis que comunicam com a tela
const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')

// dica
const tipContainer = document.getElementById('tip-container')
const tipText = document.getElementById('tip-text')

// áudios
const successSound = new Audio('./sons/success.mp3')
const errorSound = new Audio('./sons/error.mp3')

const URL_API = 'https://api-palavras-8ptt.onrender.com/'

async function iniciarJogo(event) {

    if (event.key == "Enter") {

        const nickname = document.getElementById('nickname-input').value 

        if (!nickname) {
            alert('Preencha o nickname')
            return
        }

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: nickname })
        })

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText = data.mensagem

        buscarPalavra()
    }
}

async function buscarPalavra() {

    const response = await fetch(`${URL_API}/status`, {
        credentials: 'include',
        method: 'GET'
    })

    const data = await response.json()

    wordDisplay.innerHTML = ''

    // mostrar dica
    if (data.dica) {
        tipContainer.classList.remove('hidden')
        tipText.innerText = data.dica
    }

    for (let i = 0; i < data.qtde_caracteres; i++) {

        const span = document.createElement('span')

        span.className = 'letter-slot'
        span.id = `slot-${i}`

        wordDisplay.appendChild(span)
    }
}

async function tentarLetra(event) {

    if (event.key == "Enter") {

        const input = document.getElementById('letter-input')

        const caractere = input.value

        input.value = ''
        input.focus()

        if (!caractere) {
            alert('Digite um caractere para jogar!')
            return
        }

        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caractere: caractere })
        })

        const data = await response.json()

        // acertou
        if (data.posicoes.length > 0) {

            successSound.currentTime = 0
            successSound.play()

            data.posicoes.forEach(pos => {
                document.getElementById(`slot-${pos}`).innerText = caractere
            })

        } else {

            // errou
            errorSound.currentTime = 0
            errorSound.play()
        }

        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem

        // terminou o jogo
        if (data.status_jogo != 'Jogando') {

            resetBtn.classList.remove('hidden')

            // perdeu
            if (
                data.status_jogo.toLowerCase() == 'derrota' ||
                data.status_jogo.toLowerCase() == 'perdeu'
            ) {

                gameMessage.style.color = '#d96b8a'

                document.body.style.background =
                    'radial-gradient(circle at 20% 30%, #ffe0e6 0%, #ffd6d6 100%)'

                // mostra palavra correta
                const palavra = document.createElement('p')

                palavra.innerText = `A palavra era: ${data.palavra}`

                palavra.style.marginTop = '14px'
                palavra.style.color = '#c97a9d'
                palavra.style.fontSize = '0.9rem'
                palavra.style.fontWeight = '500'

                gameContainer.appendChild(palavra)

            } else {

                // ganhou
                gameMessage.style.color = '#69b97d'

                document.body.style.background =
                    'radial-gradient(circle at 20% 30%, #e8fff1 0%, #d8ffe8 100%)'
            }
        }
    }
}

function reiniciarJogo() {
    location.reload()
}