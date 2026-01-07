/** * BASIC MATH OPERATIONS
 * Pure functions to keep logic separate from UI state.
 */
function add(x, y) {
  return Number(x) + Number(y);
}
function subtract(x, y) {
  return Number(x) - Number(y);
}
function multiply(x, y) {
  return Number(x) * Number(y);
}
function divide(x, y) {
  // Prevents application crash and provides user feedback for illegal operations
  if (y === 0) return "Can't divide by zero";
  return Number(x) / Number(y);
}

function operate(operator, x, y) {
  // Bridges UI symbols to mathematical logic
  if (operator == "+") return add(x, y);
  if (operator == "-") return subtract(x, y);
  if (operator == "×") return multiply(x, y);
  if (operator == "÷") return divide(x, y);
}

/**
 * APPLICATION STATE
 * Central truth for the calculator's memory and behavior modes.
 */
let calculatorState = {
  displayValue: "0",
  firstOperand: null,
  operator: null,
  waitingForSecondOperand: false, // Prevents appending numbers to the first operand
  isFinished: false, // Flags that a result is shown and new input should reset display
};

const historyDisplay = document.querySelector(".history-item");
const display = document.querySelector(".input-item");

/**
 * CORE LOGIC FUNCTIONS
 */
function handleOperator(nextOperator) {
  const currentValue = display.value;

  // Allows "chaining" (e.g., 5+5+5) by calculating the previous pair before setting the new operator
  if (calculatorState.operator && !calculatorState.waitingForSecondOperand) {
    const result = operate(
      calculatorState.operator,
      calculatorState.firstOperand,
      currentValue
    );
    display.value = result;
    calculatorState.firstOperand = result;
  } else {
    // Stores the initial number to prepare for the upcoming math operation
    calculatorState.firstOperand = currentValue;
  }

  calculatorState.waitingForSecondOperand = true;
  calculatorState.operator = nextOperator;
  // Visual feedback to confirm the operator was registered
  historyDisplay.textContent = `${calculatorState.firstOperand} ${nextOperator}`;
}

/**
 * EVENT LISTENERS
 */
const numberButtons = document.querySelectorAll("button.number-btn");
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Clears old results or operators to ensure the user starts typing a fresh number
    if (calculatorState.waitingForSecondOperand || calculatorState.isFinished) {
      display.value = button.textContent;
      calculatorState.waitingForSecondOperand = false;
      calculatorState.isFinished = false;
    } else {
      // Prevents leading zeros from creating invalid number strings
      if (display.value === "0") {
        display.value = button.textContent;
      } else {
        display.value += button.textContent;
      }
    }
  });
});

// Operator Assignments
document
  .querySelector(".add")
  .addEventListener("click", () => handleOperator("+"));
document
  .querySelector(".subtract")
  .addEventListener("click", () => handleOperator("-"));
document
  .querySelector(".multiply")
  .addEventListener("click", () => handleOperator("×"));
document
  .querySelector(".divide")
  .addEventListener("click", () => handleOperator("÷"));

const equalsButton = document.querySelector(".equals");
equalsButton.addEventListener("click", () => {
  // Guard clause: ignore clicks if the math problem is incomplete
  if (
    calculatorState.operator === null ||
    calculatorState.firstOperand === null
  )
    return;

  let result = operate(
    calculatorState.operator,
    calculatorState.firstOperand,
    display.value
  );

  // Prevents number overflow by converting giant results to scientific notation
  if (result.toString().length > 12) {
    result = Number(result).toPrecision(8);
  }

  // Finalizes the visual context of the math problem before resetting the state
  historyDisplay.textContent = `${calculatorState.firstOperand} ${calculatorState.operator} ${display.value} =`;

  display.value = result;
  calculatorState.firstOperand = result; // Allows user to continue math on the result
  calculatorState.operator = null; // Ends the current operation cycle
  calculatorState.isFinished = true; // Signals that next number press starts fresh
});

const acBtn = document.querySelector(".allClear");
acBtn.addEventListener("click", () => {
  // Hard reset to clear memory leaks and return to factory state
  calculatorState.firstOperand = null;
  calculatorState.operator = null;
  calculatorState.waitingForSecondOperand = false;
  calculatorState.isFinished = false;
  display.value = "0";
  historyDisplay.textContent = "";
});

const cBtn = document.querySelector(".clear");
cBtn.addEventListener("click", () => {
  // Prevents editing a finalized result; user must clear or start new calculation
  if (calculatorState.isFinished) return;

  // Standard backspace behavior: removes last digit or resets to zero
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1);
  } else {
    display.value = "0";
  }
});

const signButton = document.querySelector(".toggle-sign");
signButton.addEventListener("click", () => {
  // Avoids showing "-0" which is mathematically redundant in this UI
  if (display.value === "0") return;

  display.value = (Number(display.value) * -1).toString();

  // Ensures sign change persists if user decides to perform more math on the modified result
  if (calculatorState.isFinished) {
    calculatorState.firstOperand = display.value;
  }
});
