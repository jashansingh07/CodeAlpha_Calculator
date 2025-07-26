// script.js

const display = document.getElementById('display');
let firstOperand = '';
let operator = '';
let secondOperand = '';
let resultShown = false;
let memory = 0;

function updateDisplay(value) {
  display.textContent = value;
}

function clearAll() {
  firstOperand = '';
  operator = '';
  secondOperand = '';
  resultShown = false;
  updateDisplay('0');
}

function clearEntry() {
  if (resultShown) {
    clearAll();
    return;
  }
  if (secondOperand) {
    secondOperand = secondOperand.slice(0, -1);
    updateDisplay(firstOperand + operator + secondOperand || '0');
  } else if (operator) {
    operator = '';
    updateDisplay(firstOperand || '0');
  } else if (firstOperand) {
    firstOperand = firstOperand.slice(0, -1);
    updateDisplay(firstOperand || '0');
  }
}

function appendNumber(num) {
  if (resultShown) { clearAll(); }
  if (!operator) {
    if (num === '.' && firstOperand.includes('.')) return;
    firstOperand += num;
    updateDisplay(firstOperand);
  } else {
    if (num === '.' && secondOperand.includes('.')) return;
    secondOperand += num;
    updateDisplay(firstOperand + operator + secondOperand);
  }
}

function appendOperator(op) {
  if (!firstOperand) return;
  if (operator && secondOperand) {
    calculate();
    firstOperand = display.textContent;
    secondOperand = '';
  }
  operator = op;
  resultShown = false;
  updateDisplay(firstOperand + operator);
}

function calculate() {
  let num1 = parseFloat(firstOperand);
  let num2 = parseFloat(secondOperand);
  let ans = '';
  if (operator === '+') ans = num1 + num2;
  else if (operator === '-') ans = num1 - num2;
  else if (operator === '×') ans = num1 * num2;
  else if (operator === '÷') {
    if (num2 === 0) { error('Error: Divide by zero'); return; }
    ans = num1 / num2;
  }
  else if (operator === '%') {
    ans = num1 * num2 / 100;
  }
  else return;

  if (isNaN(ans) || ans === Infinity || ans === -Infinity) error('Error');
  else {
    ans = +parseFloat(ans).toPrecision(12);
    updateDisplay(ans);
    firstOperand = ans.toString();
    operator = '';
    secondOperand = '';
    resultShown = true;
  }
}

function operateFunction(func) {
  let n = operator ? +secondOperand : +firstOperand;
  let label = operator ? firstOperand + operator + secondOperand : firstOperand;
  if (!n && n !== 0) return;
  let ans = '';
  if (func === 'square') ans = n * n;
  else if (func === 'sqrt') { if (n < 0) return error('Error: sqrt'); ans = Math.sqrt(n); }
  ans = +parseFloat(ans).toPrecision(12);
  updateDisplay(ans);
  if (!operator) firstOperand = ans.toString();
  else secondOperand = ans.toString();
  resultShown = true;
}

function memoryOp(type) {
  let v = parseFloat(display.textContent) || 0;
  if (type === 'MR') {
    updateDisplay(memory.toString());
    resultShown = true;
  } else if (type === 'M+') {
    memory += v;
  } else if (type === 'M-') {
    memory -= v;
  }
}

function error(msg) {
  updateDisplay(msg);
  firstOperand = '';
  operator = '';
  secondOperand = '';
  resultShown = true;
  setTimeout(clearAll, 1250);
}

// Event Binding
document.querySelectorAll('.number').forEach(btn =>
  btn.addEventListener('click', () => appendNumber(btn.textContent))
);
document.querySelectorAll('.operator').forEach(btn =>
  btn.addEventListener('click', () => {
    const val = btn.textContent;
    if (val === 'C') clearEntry();
    else if (val === '.') appendNumber('.');
    else if (val === '%') appendOperator('%');
    else appendOperator(val);
  })
);
document.querySelector('.equals').addEventListener('click', calculate);
document.querySelector('.function[aria-label="Square"]').addEventListener('click', () => operateFunction('square'));
document.querySelector('.function[aria-label="Square Root"]').addEventListener('click', () => operateFunction('sqrt'));
document.querySelector('.function[aria-label="Clear All"]').addEventListener('click', clearAll);
document.querySelectorAll('.mem').forEach(btn =>
  btn.addEventListener('click', () => memoryOp(btn.textContent))
);

// Keyboard Only Navigation Support
let allBtns = [...document.querySelectorAll('.btn'), document.querySelector('.equals')];
allBtns.forEach(btn => {
  btn.tabIndex = 0;
  btn.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      btn.setAttribute('aria-pressed', 'true');
      btn.click();
      setTimeout(() => btn.removeAttribute('aria-pressed'), 110);
      e.preventDefault();
    }
    // basic arrow key navigation: left/right/up/down
    let idx = allBtns.indexOf(btn);
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      let delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' ? -4 : 4;
      let newIdx = (idx + delta + allBtns.length) % allBtns.length;
      allBtns[newIdx].focus();
      e.preventDefault();
    }
  };
});

// 3D Animation on Mouse/Keyboard
allBtns.forEach(btn => {
  btn.addEventListener('mousedown', () => btn.setAttribute('aria-pressed', 'true'));
  btn.addEventListener('mouseup', () => btn.removeAttribute('aria-pressed'));
  btn.addEventListener('mouseleave', () => btn.removeAttribute('aria-pressed'));
  btn.addEventListener('touchstart', () => btn.setAttribute('aria-pressed', 'true'));
  btn.addEventListener('touchend', () => btn.removeAttribute('aria-pressed'));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') clearAll();
  else if (e.key === 'Backspace') clearEntry();
  else if ('0123456789.'.includes(e.key)) appendNumber(e.key);
  else if ('+-×÷%'.includes(e.key)) appendOperator(e.key);
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'm') memoryOp('MR');
  else if (e.key === 'M') memoryOp('M+');
  else if (e.key === 'm' && e.shiftKey) memoryOp('M-');
});