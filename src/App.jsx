import { useRef, useState } from "react";
import "./styles.css";

function App() {
  const [rolling, setRolling] = useState(false);
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [activeLines, setActiveLines] = useState(1);
  const [freeSpins, setFreeSpins] = useState(0);
  const slotRef = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const fruits = ["🍒", "🍉", "🍊", "🍓", "🍇", "🥝", "✨", "🔮", "🐇"];
  const fruitHeight = 100;
  const repetitions = 3;

  const extendedFruits = Array.from({ length: repetitions }, () => fruits).flat();

  const linesPatterns = {
    1: [[1, 1, 1, 1, 1]],
    3: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
    ],
    5: [
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2],
      [0, 1, 2, 1, 0],
      [2, 1, 0, 1, 2],
    ],
  };

  const payouts = {
    "🍒": { 3: 1, 4: 2, 5: 3 },
    "🍉": { 3: 1, 4: 2, 5: 3 },
    "🍊": { 3: 1.5, 4: 2, 5: 3 },
    "🍓": { 3: 1.5, 4: 2, 5: 3 },
    "🍇": { 3: 2, 4: 3, 5: 4 },
    "🥝": { 3: 2, 4: 3, 5: 4 },
    "✨": { 3: 0, 4: 0, 5: 0 },
    "🔮": { 3: 0, 4: 0, 5: 0 },
    "🐇": { 3: 0, 4: 0, 5: 0 },
  };

  const roll = () => {
    if (rolling) return;

    if (bet > balance && freeSpins <= 0) {
      alert("Saldo insuficiente");
      return;
    }

    if (freeSpins <= 0) {
      setBalance((prev) => prev - bet);
    } else {
      setFreeSpins((prev) => prev - 1);
    }

    setRolling(true);

    slotRef.forEach((slot, i) => {
      setTimeout(() => {
        triggerSlotRotation(slot.current);
      }, i * 15);
    });

    setTimeout(() => {
      setRolling(false);
      const visible = getVisibleSymbols();
      const patterns = linesPatterns[activeLines];
      let totalWin = 0;

      // 🐇 Bonificador
      const flatSymbols = visible.flat();
      const bonusCount = flatSymbols.filter((s) => s === "🐇").length;
      if (bonusCount >= 3) {
        setFreeSpins((prev) => prev + 1);
        alert("¡🐇 Bonificador! Ganaste 1 giro gratis.");
      }

      const payoutMultiplier = { 1: 2, 3: 1.5, 5: 1 };

      // Verificar líneas ganadoras
      patterns.forEach((line) => {
        const symbols = line.map((row, col) => visible[col][row]);
        const first = symbols[0];
        if (first === "✨") return; // No se puede empezar con comodín

        let count = 1;
        for (let i = 1; i < symbols.length; i++) {
          if (symbols[i] === first || symbols[i] === "✨") {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3 && payouts[first]?.[count]) {
          let lineWin = payouts[first][count] * bet* payoutMultiplier[activeLines];
          if (symbols.includes("🔮")) {
            lineWin *= 2;
          }

          totalWin += lineWin;
        }
      });

      if (totalWin > 0) {
        setBalance((prev) => prev + totalWin);
        alert(`¡Ganaste $${totalWin}!`);
      }
    }, 1500);
  };

  const triggerSlotRotation = (ref) => {
    const offset = fruits.length;
    const randomIndex = Math.floor(Math.random() * fruits.length) + offset;
    ref.style.top = `-${randomIndex * fruitHeight}px`;
  };

  const getVisibleSymbols = () => {
    const visible = [];

    slotRef.forEach((ref) => {
      const container = ref.current;
      const topValue = parseInt(container.style.top.replace("px", ""), 10) || 0;
      const currentIndex = Math.abs(topValue) / fruitHeight;
      const columnSymbols = extendedFruits.slice(currentIndex, currentIndex + 3);
      visible.push(columnSymbols);
    });

    return visible;
  };

  return (
    <div className="App">
      <h1>🎰Tragamonedas</h1>

      <div className="balance-container">
        <div className="balance-display">
          Saldo actual: ${balance}
          {freeSpins > 0 && <div>🎁 Giros gratis: {freeSpins}</div>}
        </div>
        <button className="reset-button" onClick={() => { setBalance(1000); setFreeSpins(0); }} disabled={rolling}>
          Reiniciar saldo
        </button>
      </div>

      <div className="bet-container">
        <label htmlFor="bet">Apuesta: $</label>
        <input
          id="bet"
          type="number"
          value={bet}
          min={1}
          max={1000}
          onChange={(e) => setBet(Number(e.target.value))}
        />
      </div>

      <div className="SlotMachine">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className="slot" key={i}>
            <section>
              <div className="container" ref={slotRef[i]}>
                {extendedFruits.map((fruit, j) => (
                  <div key={j}>
                    <span>{fruit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>

      <div className="roll-controls">
        <button className="roll-button" onClick={roll} disabled={rolling}>
          {rolling ? "Girando..." : `Girar (${freeSpins > 0 ? "Gratis" : `$${bet}`})`}
        </button>

        <select
          className="lines-selector"
          value={activeLines}
          onChange={(e) => setActiveLines(Number(e.target.value))}
          disabled={rolling}
        >
          <option value={1}>1 línea</option>
          <option value={3}>3 líneas</option>
          <option value={5}>5 líneas</option>
        </select>
      </div>
    </div>
  );
}

export default App;
