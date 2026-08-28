const display = document.getElementById("display");
const expression = document.getElementById("expression");
let current = "0";
let previous = null;
let operator = null;
let waitingForNumber = false;

function updateDisplay() {
  display.textContent = current;
  expression.textContent = previous !== null && operator ? `${previous} ${operator}` : "";
}

function inputNumber(value) {
  if (waitingForNumber) { current = value; waitingForNumber = false; }
  else if (value === "." && current.includes(".")) return;
  else current = current === "0" && value !== "." ? value : current + value;
  updateDisplay();
}

function calculate() {
  if (previous === null || !operator) return;
  const left = Number(previous);
  const right = Number(current);
  let result;
  if (operator === "+") result = left + right;
  if (operator === "−") result = left - right;
  if (operator === "×") result = left * right;
  if (operator === "÷") result = right === 0 ? "Error" : left / right;
  current = result === "Error" ? result : String(Number(result.toFixed(10)));
  previous = null; operator = null; waitingForNumber = true; updateDisplay();
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;
  if (operator && !waitingForNumber) calculate();
  previous = current; operator = nextOperator; waitingForNumber = true; updateDisplay();
}

document.querySelectorAll(".key").forEach((button) => button.addEventListener("click", () => {
  const value = button.dataset.value;
  const action = button.dataset.action;
  if (value && /\d|\./.test(value)) inputNumber(value);
  else if (value) chooseOperator(value);
  else if (action === "clear") { current = "0"; previous = null; operator = null; waitingForNumber = false; updateDisplay(); }
  else if (action === "sign" && current !== "0" && current !== "Error") current = String(Number(current) * -1), updateDisplay();
  else if (action === "percent" && current !== "Error") current = String(Number(current) / 100), updateDisplay();
  else if (action === "equals") calculate();
}));

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key) || event.key === ".") inputNumber(event.key);
  else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator({ "*": "×", "/": "÷", "-": "−", "+": "+" }[event.key]);
  else if (event.key === "Enter" || event.key === "=") calculate();
  else if (event.key === "Escape") document.querySelector('[data-action="clear"]').click();
  else if (event.key === "%") document.querySelector('[data-action="percent"]').click();
  else return;
  event.preventDefault();
});
document.getElementById("themeButton").addEventListener("click", () => document.body.classList.toggle("dark"));
updateDisplay();
