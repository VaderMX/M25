let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedLevel = '';
let timeLeft = 0; // Se inicializará según el nivel
let timerInterval;

// Definimos los tiempos para cada nivel
const levelTimes = {
    'R': 20, // Nivel Básico (R) = 20 segundos
    'E': 30, // Nivel Intermedio (E) = 30 segundos
    'P': 45  // Nivel Avanzado (P) = 45 segundos
};

const levelSelectionDiv = document.querySelector('.level-selection');
const quizSection = document.getElementById('quiz-section');
const resultsSection = document.getElementById('results-section');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextQuestionBtn = document.getElementById('next-question-btn');
const restartQuizBtn = document.getElementById('restart-quiz-btn');
const correctAnswersCount = document.getElementById('correct-answers-count');
const totalQuestionsCount = document.getElementById('total-questions-count');
const currentLevelDisplay = document.getElementById('current-level-display');
const timerDisplay = document.getElementById('timer-display'); // Elemento para mostrar el temporizador

// Cambiar el texto de los botones de nivel
const levelButtons = levelSelectionDiv.querySelectorAll('button');
levelButtons.forEach(button => {
    const level = button.dataset.level;
    switch (level) {
        case 'E':
            button.textContent = 'Nivel Intermedio';
            break;
        case 'R':
            button.textContent = 'Nivel Básico';
            break;
        case 'P':
            button.textContent = 'Nivel Avanzado';
            break;
    }
});

// Event listeners para la selección de nivel
levelSelectionDiv.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        selectedLevel = event.target.dataset.level;
        currentLevelDisplay.textContent = `Nivel: ${event.target.textContent}`; // Usar el texto del botón
        await loadQuestions(selectedLevel);
        if (questions.length > 0) {
            startQuiz();
        } else {
            alert(`No hay preguntas disponibles para el Nivel ${event.target.textContent}.`); // Usar el texto del botón
            quizSection.style.display = 'none';
            levelSelectionDiv.style.display = 'block';
        }
    }
});

// Event listener para el botón de siguiente pregunta
nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < Math.min(10, questions.length)) { // Limitar a 10 preguntas o al número total de preguntas
        displayQuestion();
        nextQuestionBtn.disabled = true; // Deshabilita hasta que se seleccione una opción
    } else {
        showResults();
    }
});

// Event listener para el botón de reiniciar
restartQuizBtn.addEventListener('click', () => {
    resetQuiz();
});

async function loadQuestions(level) {
    try {
        const response = await fetch(`./data/preguntas_nivel_${level.toLowerCase()}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        // Mezcla aleatoriamente las preguntas una vez cargadas
        questions = shuffleArray(questions);
        console.log(`Preguntas cargadas para el nivel ${level}:`, questions);
    } catch (error) {
        console.error(`Error al cargar las preguntas del nivel ${level}:`, error);
        questions = []; // Asegúrate de que questions esté vacío si hay un error
    }
}

// Función para mezclar un array (algoritmo de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Intercambia elementos
    }
    return array;
}

function startQuiz() {
    levelSelectionDiv.style.display = 'none';
    resultsSection.style.display = 'none';
    quizSection.style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    
    // Inicializa el tiempo restante con el tiempo del nivel seleccionado
    timeLeft = levelTimes[selectedLevel]; 
    
    displayQuestion();
    nextQuestionBtn.disabled = true;
    startTimer(); // Inicia el temporizador
}

function displayQuestion() {
    if (!questions[currentQuestionIndex]) {
        console.error('No hay pregunta en el índice:', currentQuestionIndex);
        showResults(); // Si no hay pregunta, muestra los resultados
        return; // Detiene la ejecución
    }

    const question = questions[currentQuestionIndex];
    questionText.textContent = question.Enunciado;
    optionsContainer.innerHTML = '';

    // Crea un array con las opciones A, B, C, D y las mezcla
    const rawOptions = [
        question["Opción A"],
        question["Opción B"],
        question["Opción C"],
        question["Opción D"]
    ].filter(option => option); // Filtra cualquier opción que sea undefined

    const currentOptions = shuffleArray(rawOptions); // Mezcla las opciones

    currentOptions.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option-btn');
        // Pasamos la opción de texto y la letra de la respuesta correcta (A, B, C, D)
        button.addEventListener('click', () => selectAnswer(button, optionText, question["Respuesta Correcta"], currentOptions));
        optionsContainer.appendChild(button);
    });
    
    // Reinicia el temporizador para cada pregunta con el tiempo del nivel actual
    timeLeft = levelTimes[selectedLevel]; 
    startTimer(); 
}

function selectAnswer(selectedButton, selectedOptionText, correctAnswerLetter, allOptions) {
    clearInterval(timerInterval); // Detiene el temporizador al seleccionar una respuesta

    // Deshabilitar todos los botones de opción después de una selección
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
    });

    selectedButton.classList.add('selected');

    // Mapea la letra de la respuesta correcta a su texto
    let actualCorrectAnswerText = '';
    // Asegúrate de que correctAnswerLetter sea una de 'A', 'B', 'C', 'D'
    const validLetters = ['A', 'B', 'C', 'D'];
    if (validLetters.includes(correctAnswerLetter)) {
        actualCorrectAnswerText = allOptions[validLetters.indexOf(correctAnswerLetter)];
    } else {
        console.warn(`Letra de respuesta correcta inesperada: ${correctAnswerLetter}. Verifique su JSON.`);
        // Fallback si la letra no es A, B, C, D
        // Podrías asumir que es la primera opción, o dejarlo como estaba si es un caso excepcional
    }

    if (selectedOptionText === actualCorrectAnswerText) {
        selectedButton.classList.add('correct');
        score++;
    } else {
        selectedButton.classList.add('incorrect');
        // Opcional: Mostrar la respuesta correcta
        Array.from(optionsContainer.children).forEach(button => {
            if (button.textContent === actualCorrectAnswerText) {
                button.classList.add('correct');
            }
        });
    }
    nextQuestionBtn.disabled = false; // Habilitar el botón "Siguiente Pregunta"
}


function showResults() {
    quizSection.style.display = 'none';
    resultsSection.style.display = 'block';
    correctAnswersCount.textContent = score;
    totalQuestionsCount.textContent = Math.min(10, questions.length); // Muestra el máximo de 10 o el número real de preguntas
    clearInterval(timerInterval); // Detiene el temporizador al finalizar el quiz
}

function resetQuiz() {
    levelSelectionDiv.style.display = 'block';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'none';
    questions = []; // Limpiar las preguntas cargadas
    currentQuestionIndex = 0;
    score = 0;
    selectedLevel = '';
    timeLeft = 0; // Restablece el tiempo inicial a 0
    timerDisplay.textContent = ''; // Limpia el display del temporizador
}

function startTimer() {
    clearInterval(timerInterval); // Limpia cualquier temporizador anterior
    // timeLeft ya se establece en displayQuestion o startQuiz para el nivel actual
    timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;
    timerDisplay.style.color = '#d9534f'; // Rojo inicial

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tiempo restante: ${timeLeft}s`;

        if (timeLeft <= 3 && timeLeft > 0) { // Cambiar a naranja/amarillo cuando quedan 3 segundos
            timerDisplay.style.color = '#f0ad4e';
        } else if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerDisplay.textContent = `¡Tiempo agotado!`;
            timerDisplay.style.color = '#d9534f'; // Rojo final

            // Deshabilitar opciones cuando el tiempo se agota
            Array.from(optionsContainer.children).forEach(button => {
                button.disabled = true;
            });
            nextQuestionBtn.disabled = false; // Habilita el botón "Siguiente Pregunta"

            // Opcional: Marcar la respuesta correcta si el tiempo se agota y no se respondió
            const currentQuestion = questions[currentQuestionIndex];
            const correctLetter = currentQuestion["Respuesta Correcta"];
            const allOptions = [
                currentQuestion["Opción A"],
                currentQuestion["Opción B"],
                currentQuestion["Opción C"],
                currentQuestion["Opción D"]
            ];
            const validLetters = ['A', 'B', 'C', 'D'];
            let actualCorrectAnswerText = '';
            if (validLetters.includes(correctLetter)) {
                actualCorrectAnswerText = allOptions[validLetters.indexOf(correctLetter)];
            }

            Array.from(optionsContainer.children).forEach(button => {
                if (button.textContent === actualCorrectAnswerText) {
                    button.classList.add('correct'); // Muestra la respuesta correcta
                }
            });
            // nextQuestionBtn.click(); // Descomenta esta línea para avanzar automáticamente al agotarse el tiempo
        } else {
            timerDisplay.style.color = '#d9534f'; // Asegura que vuelva a rojo si se restablece
        }
    }, 1000);
}