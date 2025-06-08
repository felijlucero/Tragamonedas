import { useRef, useState } from "react";
import "./styles.css";

function App() {
  const [rolling, setRolling] = useState(false);
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(1000);
  const [activeLines, setActiveLines] = useState(1);
  const [freeSpins, setFreeSpins] = useState(0);
  const [simulations, setSimulations] = useState([]);
  const [simulating, setSimulating] = useState(false);

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
    "🍒": { 3: 3, 4: 4, 5: 5 },
    "🍉": { 3: 3, 4: 4, 5: 5 },
    "🍊": { 3: 2.5, 4: 3.5, 5: 4.5 },
    "🍓": { 3: 2.5, 4: 3, 5: 4 },
    "🍇": { 3: 3, 4: 4, 5: 5 },
    "🥝": { 3: 3, 4: 4, 5: 5 },
    "✨": { 3: 0, 4: 0, 5: 0 },
    "🔮": { 3: 0, 4: 0, 5: 0 },
    "🐇": { 3: 0, 4: 0, 5: 0 },
  };

  const payoutMultiplier = { 1: 2, 3: 1.5, 5: 1 };

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

      const flatSymbols = visible.flat();
      const bonusCount = flatSymbols.filter((s) => s === "🐇").length;
      if (bonusCount >= 3) {
        setFreeSpins((prev) => prev + 1);
        alert("¡🐇 Bonificador! Ganaste 1 giro gratis.");
      }

      patterns.forEach((line) => {
        const symbols = line.map((row, col) => visible[col][row]);
        const first = symbols[0];
        if (first === "✨") return;

        let count = 1;
        for (let i = 1; i < symbols.length; i++) {
          if (symbols[i] === first || symbols[i] === "✨") {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3 && payouts[first]?.[count]) {
          let lineWin = payouts[first][count] * bet * payoutMultiplier[activeLines];
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

  const generateSimulatedGrid = () => {
    const visible = [];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * fruits.length);
      const columnSymbols = extendedFruits.slice(randomIndex, randomIndex + 3);
      visible.push(columnSymbols);
    }
    return visible;
  };

  const simulateSpins = async (count) => {
    setSimulating(true);
    const results = [];

    for (let i = 0; i < count; i++) {
      const visible = generateSimulatedGrid();
      const patterns = linesPatterns[activeLines];
      let totalWin = 0;

      const flatSymbols = visible.flat();
      const bonusCount = flatSymbols.filter((s) => s === "🐇").length;
      const gotFreeSpin = bonusCount >= 3;

      patterns.forEach((line) => {
        const symbols = line.map((row, col) => visible[col][row]);
        const first = symbols[0];
        if (first === "✨") return;

        let count = 1;
        for (let i = 1; i < symbols.length; i++) {
          if (symbols[i] === first || symbols[i] === "✨") {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3 && payouts[first]?.[count]) {
          let lineWin = payouts[first][count] * bet * payoutMultiplier[activeLines];
          if (symbols.includes("🔮")) {
            lineWin *= 2;
          }
          totalWin += lineWin;
        }
      });

      results.push({ win: totalWin, freeSpin: gotFreeSpin });
      await new Promise((r) => setTimeout(r, 1));
    }

    setSimulations(results);
    setSimulating(false);
  };

  return (
    <div className="App">
      <h1>🎰Tragamonedas</h1>

      <div className="balance-container">
        <div className="balance-display">
          Saldo actual: ${balance}
          {freeSpins > 0 && <div>🎁 Giros gratis: {freeSpins}</div>}
        </div>
        <button className="reset-button" onClick={() => { setBalance(1000); setFreeSpins(0); setSimulations([]); }} disabled={rolling}>
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

      <div className="simulation-stats">
        <button onClick={() => simulateSpins(1000)} disabled={simulating || rolling}>
          {simulating ? "Simulando..." : "▶ Simular 1000 tiradas"}
        </button>

        {simulations.length > 0 && (
          <div className="simulation-result">
            <p>Total de tiradas: {simulations.length}</p>
            <p>Ganadoras: {simulations.filter(r => r.win > 0).length}</p>
            <p>Total ganado: ${simulations.reduce((acc, r) => acc + r.win, 0).toFixed(2)}</p>
            <p>RTP estimado: {((simulations.reduce((acc, r) => acc + r.win, 0) / (simulations.length * bet)) * 100).toFixed(2)}%</p>
            <p>Giros gratis obtenidos: {simulations.filter(r => r.freeSpin).length}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
