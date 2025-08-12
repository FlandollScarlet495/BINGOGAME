const socket = new WebSocket(`ws://${location.host}/ws`);
let bingoAchieved = false;

function generateBingoCard() {
  const card = document.getElementById('bingo-card');
  card.innerHTML = '';
  const numbersUsed = new Set();

  const ranges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('bingo-row');

    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.classList.add('bingo-cell');

      if (row === 2 && col === 2) {
        cell.textContent = 'FREE';
        cell.classList.add('checked');
        cell.dataset.number = 'FREE';
      } else {
        let num;
        do {
          num = Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];
        } while (numbersUsed.has(num));
        numbersUsed.add(num);

        cell.textContent = num;
        cell.dataset.number = num;
      }

      // 座標データを属性に入れておく（ビンゴ判定用）
      cell.dataset.row = row;
      cell.dataset.col = col;

      rowDiv.appendChild(cell);
    }
    card.appendChild(rowDiv);
  }
}

function addNumberToHistory(number) {
  if (number === 'FREE') return;

  const historyDiv = document.getElementById('number-history');
  if (historyDiv.querySelector(`[data-number='${number}']`)) {
    return;
  }

  const numElem = document.createElement('div');
  numElem.textContent = number;
  numElem.dataset.number = number;
  numElem.style.cssText = `
    width: 30px;
    height: 30px;
    line-height: 30px;
    margin: 2px;
    text-align: center;
    border: 1px solid #666;
    border-radius: 4px;
    background-color: #eee;
    font-weight: bold;
  `;

  historyDiv.appendChild(numElem);
}

function checkBingo() {
  const card = document.getElementById('bingo-card');
  // 5行5列のチェック状態を2D配列で取得
  const checked = Array(5).fill(0).map(() => Array(5).fill(false));

  // それぞれのセルのチェック状態を反映
  card.querySelectorAll('.bingo-cell').forEach(cell => {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    checked[row][col] = cell.classList.contains('checked');
  });

  // ビンゴ判定
  // 行チェック
  for (let r = 0; r < 5; r++) {
    if (checked[r].every(val => val)) return true;
  }
  // 列チェック
  for (let c = 0; c < 5; c++) {
    if (checked.map(row => row[c]).every(val => val)) return true;
  }
  // 斜めチェック
  if (checked.map((row, i) => row[i]).every(val => val)) return true;
  if (checked.map((row, i) => row[4 - i]).every(val => val)) return true;

  return false;
}

function showBingoMessage() {
  const msg = document.createElement('div');
  msg.textContent = 'ビンゴ！！🎉';
  msg.style.cssText = `
    font-size: 48px;
    color: #e91e63;
    text-align: center;
    margin-top: 20px;
    font-weight: bold;
  `;
  document.body.appendChild(msg);
}

socket.addEventListener('open', () => {
  console.log('WebSocket接続開始');
});

socket.addEventListener('message', (event) => {
  if (bingoAchieved) return;  // もうビンゴなら無視

  const number = event.data;
  console.log('数字受信:', number);
  document.getElementById('current-number').textContent = number;

  addNumberToHistory(number);

  if (number === 'FREE') return;

  const cell = document.querySelector(`.bingo-cell[data-number='${number}']`);
  if (cell) {
    cell.classList.add('checked');
  }

  if (checkBingo()) {
    bingoAchieved = true;
    showBingoMessage();

    // WebSocket閉じて数字受信を停止
    socket.close();
  }
});

socket.addEventListener('close', () => {
  console.log('WebSocket切断');
});

window.onload = () => {
  generateBingoCard();
};
