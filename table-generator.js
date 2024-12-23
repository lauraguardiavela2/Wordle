// Store wordle configuration
window.wordleConfig = {
    rows: 6,
    cols: 5
};

const grid = document.getElementById('word-grid');

const inputs = [];
for (let i = 0; i < window.wordleConfig.rows * window.wordleConfig.cols; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('default-input');
    input.placeholder = '';
    input.maxLength = 1;

    // Add an event listener for when the user types a letter into the input skip to the next cell
    input.addEventListener('input', (e) => {
        const index = inputs.indexOf(e.target);
        
        // Allow only alphabetic characters (A-Z, a-z)
        if (!/^[a-zA-Z]$/.test(e.target.value)) {
            e.target.value = '';  // Clear the input if it's not a letter
        } else if (e.target.value && index < inputs.length - 1) {
            inputs[index + 1].focus();  // Move to the next input
        }
    });

    // Add an event listener for when the user presses the backspace key inside the input remove the content of the prev cell
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
            const index = inputs.indexOf(e.target);
            if (index > 0) {
                inputs[index - 1].focus();
            }
        }
    });

    inputs.push(input);
    grid.appendChild(input);
}
