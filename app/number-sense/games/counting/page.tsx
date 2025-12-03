"use client";
import React, { useEffect, useRef } from "react";
import Head from "next/head";

const BALLOON_COLORS = [
  "#FF5252",
  "#FFEB3B",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#FF9800",
  "#00BCD4",
];

const PARTICLE_COUNT = 12;

export default function CountingBalloonsGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const targetDisplayRef = useRef<HTMLDivElement | null>(null);
  const currentDisplayRef = useRef<HTMLDivElement | null>(null);
  const modalMessageRef = useRef<HTMLDivElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const checkButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextActionRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    const modal = modalRef.current;
    const targetDisplay = targetDisplayRef.current;
    const currentDisplay = currentDisplayRef.current;
    const modalMessage = modalMessageRef.current;
    const nextBtn = nextButtonRef.current;
    const checkBtn = checkButtonRef.current;

    if (!container || !modal || !targetDisplay || !currentDisplay || !modalMessage || !nextBtn || !checkBtn) {
      return;
    }

    let targetNumber = 0;
    let currentCount = 0;
    let gameActive = true;
    let balloonInterval: ReturnType<typeof setInterval> | null = null;

    const AudioContextClass =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let audioCtx: AudioContext | null = null;

    const getAudioContext = () => {
      if (!AudioContextClass) {
        return null;
      }

      if (!audioCtx) {
        try {
          audioCtx = new AudioContextClass();
        } catch {
          audioCtx = null;
        }
      }

      return audioCtx;
    };

    const setModalVisible = (visible: boolean) => {
      modal.style.display = visible ? "flex" : "none";
    };

    const setNextAction = (label: string, action: () => void) => {
      nextActionRef.current = action;
      nextBtn.textContent = label;
    };

    const playSound = (type: "pop" | "win" | "wrong") => {
      const ctx = getAudioContext();
      if (!ctx) {
        return;
      }

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "pop") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    };

    const createParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.backgroundColor = color;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        document.body.appendChild(particle);

        setTimeout(() => {
          particle.remove();
        }, 600);
      }
    };

    const popBalloon = (balloon: HTMLDivElement) => {
      if (balloon.style.pointerEvents === "none") {
        return;
      }

      playSound("pop");
      balloon.style.pointerEvents = "none";

      const rect = balloon.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const balloonColor = balloon.dataset.color || "#FF5252";

      createParticles(centerX, centerY, balloonColor);
      balloon.style.visibility = "hidden";

      currentCount += 1;
      currentDisplay.textContent = String(currentCount);

      setTimeout(() => {
        balloon.remove();
      }, 100);
    };

    const createBalloon = () => {
      if (!gameActive) {
        return;
      }

      const balloon = document.createElement("div");
      balloon.className = "balloon";

      const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      balloon.style.backgroundColor = color;
      balloon.dataset.color = color;

      const left = Math.random() * 84 + 8;
      balloon.style.left = `${left}%`;
      const scale = 0.8 + Math.random() * 0.4;
      balloon.style.transform = `scale(${scale})`;
      const duration = Math.random() * 5 + 6;
      balloon.style.animationDuration = `${duration}s`;

      balloon.onpointerdown = (event) => {
        event.stopPropagation();
        popBalloon(balloon);
      };

      container.appendChild(balloon);

      balloon.addEventListener("animationend", () => {
        balloon.remove();
      });
    };

    const showModal = () => setModalVisible(true);

    const startGame = () => {
      targetNumber = Math.floor(Math.random() * 20) + 1;
      currentCount = 0;
      gameActive = true;
      targetDisplay.textContent = String(targetNumber);
      currentDisplay.textContent = String(currentCount);
      setModalVisible(false);

      container.querySelectorAll(".balloon").forEach((node) => node.remove());

      if (balloonInterval) {
        clearInterval(balloonInterval);
      }
      balloonInterval = setInterval(createBalloon, 700);
      createBalloon();
      setNextAction("下一局", () => startGame());
    };

    const checkResult = () => {
      if (currentCount === targetNumber) {
        playSound("win");
        modalMessage.innerHTML = "🎉 <strong style='color:green'>太棒了！</strong><br/>答案正确！<br/>就是 " + targetNumber + " 个";
        gameActive = false;
        setNextAction("下一局", () => startGame());
        showModal();
        if (balloonInterval) {
          clearInterval(balloonInterval);
          balloonInterval = null;
        }
      } else if (currentCount < targetNumber) {
        playSound("wrong");
        const diff = targetNumber - currentCount;
        modalMessage.innerHTML = "🤔 还没够哦<br/>还差 <strong style='color:#FF9800'>" + diff + "</strong> 个";
        setNextAction("继续加油", () => setModalVisible(false));
        showModal();
      } else {
        playSound("wrong");
        modalMessage.innerHTML = "😲 哎呀多了<br/>现在有 <strong style='color:red'>" + currentCount + "</strong> 个<br/>重来一次吧";
        setNextAction("重新开始", () => startGame());
        showModal();
      }
    };

    const handleCheck = () => {
      if (gameActive) {
        checkResult();
      }
    };

    const handleNextClick = () => {
      nextActionRef.current();
    };

    checkBtn.addEventListener("click", handleCheck);
    nextBtn.addEventListener("click", handleNextClick);

    startGame();

    return () => {
      if (balloonInterval) {
        clearInterval(balloonInterval);
      }
      checkBtn.removeEventListener("click", handleCheck);
      nextBtn.removeEventListener("click", handleNextClick);
      if (audioCtx) {
        audioCtx.close().catch(() => undefined);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>快乐数气球 - 精致版 | Easy Math</title>
        <meta
          name="description"
          content="打爆彩色气球，准确数出目标数量的趣味数感游戏。"
        />
        <link rel="canonical" href="https://kids-math.com/number-sense/games/counting" />
      </Head>
      <div className="balloon-game-shell">
        <div id="game-container" ref={containerRef}>
          <div className="cloud" style={{ width: "200px", height: "60px", top: "10%", left: "10%" }} />
          <div className="cloud" style={{ width: "150px", height: "50px", top: "20%", right: "15%" }} />
          <div className="cloud" style={{ width: "180px", height: "70px", top: "50%", left: "30%" }} />
          <div className="cloud" style={{ width: "120px", height: "40px", top: "70%", right: "10%" }} />

          <div id="top-ui" className="ui-panel">
            <h2>目标:</h2>
            <div id="target-display" ref={targetDisplayRef} className="number-box">
              ?
            </div>
          </div>

          <div id="bottom-ui" className="ui-panel">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2>已打爆:</h2>
              <div
                id="current-display"
                ref={currentDisplayRef}
                className="number-box"
                style={{ color: "#2196F3", borderColor: "#2196F3" }}
              >
                0
              </div>
            </div>
            <button id="check-btn" ref={checkButtonRef}>
              检查
            </button>
          </div>
        </div>

        <div id="modal" ref={modalRef} className="modal">
          <div className="modal-content">
            <div id="modal-message" ref={modalMessageRef} />
            <button id="next-btn" ref={nextButtonRef}>
              下一局
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .balloon-game-shell {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(to bottom, #87ceeb, #e0f6ff);
          font-family: "Mady", "Rounded Mplus 1c", "Microsoft YaHei", sans-serif;
          user-select: none;
          touch-action: manipulation;
        }

        #game-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .ui-panel {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.85);
          border-radius: 15px;
          padding: 8px 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 15px;
          z-index: 20;
        }

        #top-ui {
          top: 15px;
        }

        #bottom-ui {
          bottom: 15px;
          flex-direction: column;
          gap: 10px;
        }

        h1,
        h2 {
          margin: 0;
          color: #333;
          font-size: 20px;
        }

        .number-box {
          font-size: 32px;
          font-weight: 900;
          color: #ff4500;
          background: #fff;
          padding: 2px 15px;
          border-radius: 8px;
          border: 3px solid #ffd700;
          min-width: 40px;
          text-align: center;
        }

        :global(.balloon) {
          position: absolute;
          bottom: -150px;
          width: 80px;
          height: 100px;
          background-color: red;
          border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
          cursor: pointer;
          box-shadow: inset -10px -10px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: floatUp 8s linear forwards;
          z-index: 5;
          touch-action: none;
        }

        :global(.balloon::before) {
          content: "";
          position: absolute;
          top: 15px;
          left: 15px;
          width: 20px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: rotate(45deg);
        }

        :global(.balloon::after) {
          content: "";
          position: absolute;
          bottom: -20px;
          width: 2px;
          height: 20px;
          background: #555;
        }

        :global(@keyframes floatUp) {
          0% {
            bottom: -150px;
            transform: translateX(0);
          }
          25% {
            transform: translateX(25px) rotate(5deg);
          }
          50% {
            transform: translateX(-25px) rotate(-5deg);
          }
          75% {
            transform: translateX(25px) rotate(5deg);
          }
          100% {
            bottom: 110vh;
            transform: translateX(0);
          }
        }

        :global(.particle) {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 15;
          animation: particles-fly 0.6s ease-out forwards;
        }

        :global(@keyframes particles-fly) {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }

        #check-btn {
          background-color: #4caf50;
          border: none;
          color: #fff;
          padding: 8px 30px;
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: 0 4px #2e7d32;
          transition: 0.1s;
        }

        #check-btn:active {
          box-shadow: 0 2px #2e7d32;
          transform: translateY(2px);
        }

        .modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 100;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background: rgba(255, 255, 255, 0.95);
          padding: 20px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          width: 280px;
          max-width: 80%;
        }

        @keyframes popIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        #modal-message {
          font-size: 22px;
          margin-bottom: 20px;
          color: #333;
          line-height: 1.4;
        }

        #next-btn {
          background-color: #2196f3;
          color: #fff;
          border: none;
          padding: 10px 25px;
          font-size: 18px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px #1976d2;
        }

        #next-btn:active {
          transform: translateY(2px);
          box-shadow: 0 2px #1976d2;
        }

        .cloud {
          position: absolute;
          background: #fff;
          border-radius: 50px;
          opacity: 0.8;
          z-index: 0;
        }
      `}</style>
    </>
  );
}

