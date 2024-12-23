let goalWord = "";
let gameOver = false;
let currentRow = 0;
let isValidating = false;

const colors = {
    green: "#add69c",
    yellow: "#faecaf",
    red: "#ffc8c8",
    white: "#ffffff"
}
async function init(){

    await getWordFromAPI();
    obtainInputWord();
}
function obtainInputWord(){
    // Obtain the word when the row is completed
    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (gameOver) return;
            
            let cols = window.wordleConfig.cols;
            const rowIndex = Math.floor(index / cols); // Determine row
            if (input.value && index % cols === cols - 1) { // When the row has been completed
                let currentWord = getWordForRow(rowIndex); // Store the word

                isValidating = true;
                disableInputs();

                validateWord(currentWord).then(isValid => {
                    if (isValid) {
                        console.log("The word is valid!");
                        let colorList = compareWords(goalWord, currentWord);
                        assignColorsToCells(colorList, rowIndex);
                        disableRow(rowIndex);
                        checkGameStatus(colorList);
                        if(!gameOver)currentRow++; 
                    } else {
                        console.log("The word is not valid!");
                        clearRow(rowIndex);
                    }
                    isValidating = false;
                    enableInputs();
                });

            }
        });
    });
}
async function getWordFromAPI(){
    const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
    try {
        const response = await fetch(WORD_URL);
        const processedResponse = await response.json();
        goalWord = processedResponse.word;
    } catch (error) {
        console.error("Error fetching the word:", error);
    }
}
function getIndexFromRowCol(row, col) {
    // Obtain index of the grid given the row and the column
    return row * window.wordleConfig.cols + col;
}
function getWordForRow(rowIndex) {
    let word = '';

    for (let col = 0; col < window.wordleConfig.cols; col++) {
        const index = getIndexFromRowCol(rowIndex, col);
        word += inputs[index].value.toLowerCase();
    }
    return word;
}
async function validateWord(word){
    const VALIDATE_URL = "https://words.dev-apis.com/validate-word";

    const response = await fetch(VALIDATE_URL, {
        method: "POST",
        body: JSON.stringify({ word }),
    });

    const result = await response.json(); // Processar la resposta en format JSON
    console.log(`Validation result for "${word}":`, result);
    return result.validWord;
}
function clearRow(rowIndex) {
    
    // Add a warning in the screen
    document.querySelector(".warning-box").textContent = "This word doesn't exist!";

    // Clear all inputs in the row
    for (let col = 0; col < window.wordleConfig.cols; col++) {
        const index = getIndexFromRowCol(rowIndex, col);
        inputs[index].value = '';
        inputs[index].style.backgroundColor = colors.red; // Set the border to red
    }

    // Add a small delay to reset the borders back to white after a few seconds
    setTimeout(() => {
        for (let col = 0; col < window.wordleConfig.cols; col++) {
            const index = getIndexFromRowCol(rowIndex, col);
            inputs[index].style.backgroundColor = colors.white;  // Reset the border to white
            document.querySelector(".warning-box").textContent = "";
        }
    }, 1000); // Delay for 1 second
    
    // Focus the first input in the row
    const firstInputInRow = inputs[getIndexFromRowCol(rowIndex, 0)];
    firstInputInRow.focus();
}
function compareWords(goalWord, inputWord){    
    let goalWordArray = goalWord.split("");
    let inputWordArray = inputWord.split("");

    const result = [];

    // First pass: Check for exact matches (green)
    // First, mark green (exact matches)
    inputWordArray.forEach((letter, index) => {
        if (letter === goalWordArray[index]) {
            result[index] = 'green';
            goalWordArray[index] = null; // Mark this position as already matched
        }
    });

    // Second pass: Check for yellow (correct letter, wrong position)
    inputWordArray.forEach((letter, index) => {
        if (!result[index]) { // Only check if it wasn't already marked as green
            const foundIndex = goalWordArray.indexOf(letter);
            if (foundIndex !== -1) {
                result[index] = 'yellow';
                goalWordArray[foundIndex] = null; // Mark this letter as used
            } else {
                result[index] = 'red'; // No match at all
            }
        }
    });
    return result;
}
function assignColorsToCells(colorList, row){
    for (let col = 0; col < window.wordleConfig.cols; col++) {
        const index = getIndexFromRowCol(row, col); // Get the index for the current row and column
        const input = inputs[index]; // Get the input at the current index

        switch (colorList[col]) {
            case 'green':
                input.style.backgroundColor = colors.green;
                break;
            case 'yellow':
                input.style.backgroundColor = colors.yellow;
                break;
            case 'red':
                input.style.backgroundColor = colors.red;
                break;
            default:
                input.style.backgroundColor = colors.white;
                break;
        }
    }
}
function disableRow(rowIndex) {
    for (let col = 0; col < window.wordleConfig.cols; col++) {
        const index = getIndexFromRowCol(rowIndex, col);
        inputs[index].disabled = true;
    }
}
function checkGameStatus(colorList) {
    if (colorList.every(color => color === 'green')) {
        finishGame("won");
    } else if (currentRow >= window.wordleConfig.rows - 1) {
        finishGame("lost");
    }
}
function finishGame(result){
    gameOver = true;
    disableInputs();

    if(result === "won") youWon();    
    else if(result === "lost") youLost();
}
function youWon(){
    document.querySelector('h1').style.backgroundColor = colors.green;
    const gameResult = document.querySelector('.game-result');
    gameResult.style.backgroundColor = colors.green;
    gameResult.style.borderRadius = "20px";
    gameResult.textContent = "YOU WON!";

    const goalWordShow = document.querySelector('.game-goal-word');
    goalWordShow.textContent = "YOU GUESSED THE WORD!";
}
function youLost(){
    document.querySelector('h1').style.backgroundColor = colors.red;
    const gameResult = document.querySelector('.game-result');
    gameResult.style.backgroundColor = colors.red;
    gameResult.style.borderRadius = "20px";
    gameResult.textContent = "YOU LOST!";

    const goalWordShow = document.querySelector('.game-goal-word');
    goalWordShow.textContent = "THE WORD WAS: "+goalWord.toLocaleUpperCase();
}
function disableInputs() {
    // Disable all inputs, preventing further typing or deletion
    inputs.forEach(input => {
        input.disabled = true; // Disable input
    });
}
function enableInputs() {
    // Enable all inputs except those in permanently disabled rows
    inputs.forEach(input => {
        if (!input.classList.contains('disabled')) {
            input.disabled = false;
        }
    });

    // Focus the first input in the current row
    const firstInputInRow = inputs[getIndexFromRowCol(currentRow, 0)];
    firstInputInRow.focus();
}
init();


