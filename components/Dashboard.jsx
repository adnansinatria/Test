import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import GateCard from "./GateCard/GateCard.jsx";

export default function Dashboard() {
  const [activeType, setActiveType] = useState("DISK");

  // CORE STATE
  const [coreSummary, setCoreSummary] = useState(null);
  const [settlementLatency, setSettlementLatency] = useState(0);
  const cpuValue = coreSummary ? parseFloat(coreSummary.cpu) || 0 : 0;

  const diskValue = coreSummary
    ? (() => {
        const match = coreSummary.disk.match(/\((\d+)%\)/);
        return match ? parseFloat(match[1]) : 0;
      })()
    : 0;

  const ramUsed = coreSummary
    ? (() => {
        const match = coreSummary.ram.match(/([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
      })()
    : 0;
  const ramTotal = coreSummary
    ? (() => {
        const match = coreSummary.ram.match(/\/([\d.]+)/);
        return match ? parseFloat(match[1]) : 1;
      })()
    : 1;
  const ramPercent = ramTotal > 0 ? (ramUsed / ramTotal) * 100 : 0;

  const circleValue = activeType === "DISK" ? diskValue : cpuValue;
  const [topZ, setTopZ] = useState(10);
  const [cardZ, setCardZ] = useState({});
  const [cardPos, setCardPos] = useState({
    parahyangan: { x: 0, y: 0 },
    bumn: { x: 330, y: 0 },
    travoy: { x: 660, y: 0 },
  });

  const bringToFront = (key) => {
    setTopZ((prevTop) => {
      const newTop = prevTop + 1;
      setCardZ((prev) => ({
        ...prev,
        [key]: newTop,
      }));
      return newTop;
    });
  };

  const parseApiToGateCards = (api) => {
    const gatesBySse = {};
    api.gates.forEach((g) => {
      if (!gatesBySse[g.sse_id]) gatesBySse[g.sse_id] = [];

      const existingIndex = gatesBySse[g.sse_id].findIndex(
        (gate) => gate.name === g.name
      );

      const parsedLatency =
        g.latency_ms != null ? parseFloat(g.latency_ms) : null;

      if (existingIndex !== -1) {
        gatesBySse[g.sse_id][existingIndex] = {
          ...gatesBySse[g.sse_id][existingIndex],
          latency: parsedLatency,
          status: g.ok ? "ok" : "error",
        };
      } else {
        gatesBySse[g.sse_id].push({
          id: g.id,
          name: g.name,
          status: g.ok ? "ok" : "error",
          latency: parsedLatency,
        });
      }
    });

    const locationAlias = {
      "Universitas Parahyangan": "parahyangan",
      "Kementerian BUMN": "bumn",
      "TRAVOY HUB": "travoy",
      "RS. Brawijaya": "brawijaya",
      "Kantor Pusat": "kantor_pusat"
    };

    return (api.sses || []).map((sse) => {
      const usage = sse.usage || {};
      const safeCpu = usage.cpu ? parseFloat(usage.cpu) : 0;
      const safeDisk = usage.disk || "";
      const safeRam = usage.ram || "";

      const alias = locationAlias[sse.location] ?? sse.id;

      return {
        id: alias,
        location: sse.location,
        gates: gatesBySse[sse.id] ?? [],
        sse: {
          latency:
            sse.latency_ms != null
              ? `${parseFloat(sse.latency_ms).toFixed(3)} ms`
              : "0 ms",

          cpu: safeCpu,

          disk: {
            used: (() => {
              if (!safeDisk) return 0;
              const match = safeDisk.match(/([\d.]+)[GT]?\/([\d.]+)/);
              return match ? parseFloat(match[1]) * 1000 || 0 : 0;
            })(),
            total: (() => {
              if (!safeDisk) return 100;
              const match = safeDisk.match(/\/([\d.]+)/);
              return match ? parseFloat(match[1]) * 1000 || 100 : 100;
            })(),
          },

          ram: {
            used: (() => {
              if (!safeRam) return 0;
              const match = safeRam.match(/([\d.]+)\//);
              return match ? parseFloat(match[1]) : 0;
            })(),
            total: (() => {
              if (!safeRam) return 100;
              const match = safeRam.match(/\/([\d.]+)/);
              return match ? parseFloat(match[1]) : 100;
            })(),
          },
        },
      };
    });
  };

  const summarizeSettlementLatency = (sses) => {
    const valid = sses.filter((s) => s.latency_ms != null);
    if (valid.length === 0) return 0;

    const total = valid.reduce((a, b) => a + b.latency_ms, 0);
    return total / valid.length;
  };

  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch("http://172.17.17.4:5005/api/status/cache")
      .then((res) => res.json())
      .then((data) => {
        const parsed = parseApiToGateCards(data);
        setCards(parsed);

        if (data.core_usage) {
          setCoreSummary({
            cpu: data.core_usage.cpu || "0%",
            disk: data.core_usage.disk || "0G/0G (0%)",
            ram: data.core_usage.ram || "0/0 MiB"
          });
        }

        setSettlementLatency(summarizeSettlementLatency(data.sses || []));

        const savedPos = localStorage.getItem("cardPositions");
        if (savedPos) {
          const parsedPos = JSON.parse(savedPos);
          const validPos = {};
          parsed.forEach((c) => {
            validPos[c.id] = parsedPos[c.id] ?? { x: 0, y: 0 };
          });
          setCardPos(validPos);
        } else {
          const newPos = {};
          parsed.forEach((card, index) => {
            const col = Math.floor(index / 3);
            const row = index % 3;
            newPos[card.id] = {
              x: col * 360,
              y: row * 280,
            };
          });
          setCardPos(newPos);
        }

        // Z-index awal
        const zValues = {};
        parsed.forEach((c, i) => {
          zValues[c.id] = 10 + i;
        });
        setCardZ(zValues);
      })
      .catch((err) => console.error("Fetch gagal:", err));
  }, []);

  return (
    <div className="dashboard-layout">
      {/* LEFT SECTION */}
      <div className="core-section">
        <h1 className="core-title">CORE</h1>

        {/* CIRCLE CARD */}
        <div className="disk-glass-card">
          <h3 className="disk-title">
            {activeType} <span>Capacity</span>
          </h3>

          <div className="disk-circle-wrapper">
            <svg
              className="disk-circle"
              width="160"
              height="160"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#0000000e"
                strokeWidth="4"
                fill="none"
              />
              <circle
                className="circle-progress"
                cx="60"
                cy="60"
                r="50"
                stroke="#1e4d89"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${(circleValue / 100) * 314} 314`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="disk-percentage">{circleValue.toFixed(1)}%</div>
          </div>
        </div>

        {/* CPU & DISK BAR */}
        <div className="core-card">
          <div className="capacity-bar-chart-container">
            <div
              className={`capacity-bar-item cpu ${
                activeType === "CPU" ? "active-bar" : ""
              }`}
              onClick={() => setActiveType("CPU")}
            >
              <div
                className={`capacity-bar-fill cpu-fill ${
                  activeType === "CPU" ? "active-fill" : ""
                }`}
                style={{ height: `${Math.min(cpuValue, 100)}%` }}
              ></div>
              <span
                className={`capacity-bar-text ${
                  cpuValue > 100 ? "text-visible" : ""
                }`}
              >
                CPU
              </span>
            </div>

            <div
              className={`capacity-bar-item disk ${
                activeType === "DISK" ? "active-bar" : ""
              }`}
              onClick={() => setActiveType("DISK")}
            >
              <div
                className={`capacity-bar-fill disk-fill ${
                  activeType === "DISK" ? "active-fill" : ""
                }`}
                style={{ height: `${Math.min(diskValue, 100)}%` }}
              ></div>
              <span
                className={`capacity-bar-text ${
                  diskValue > 100 ? "text-visible" : ""
                }`}
              >
                DISK
              </span>
            </div>
          </div>
        </div>

        {/* RAM */}
        <div className="ram-card">
          <h3 className="core-card-title">RAM</h3>

          <div className="ram-bar-wrapper">
            <div
              className="ram-value-floating"
              style={{
                left: `calc(${Math.min(ramPercent, 100)}% - 15px)`,
              }}
            >
              {ramUsed.toFixed(1)}
            </div>

            <div className="ram-bar">
              <div
                className="ram-bar-fill"
                style={{ width: `${Math.min(ramPercent, 100)}%` }}
              ></div>
            </div>

            <div className="ram-ticks"></div>
          </div>

          <div className="ram-values">
            <span>0</span>
            <span>{ramTotal.toFixed(1)}</span>
          </div>
        </div>

        {/* Settlement */}
        <div className="settlement-row">
          <span className="plus-icon">+</span>
          <span className="settlement-name">SETTLEMENT</span>

          <span className="settlement-badge">
            <span className="settlement-time">
              {settlementLatency.toFixed(1)} ms
            </span>

            <svg className="settlement-icon" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#4ade80"
                strokeWidth="4"
                opacity="0.3"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#4ade80"
                strokeWidth="4"
                strokeDasharray="15.7 62.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="divider"></div>

      {/* RIGHT SECTION */}
      <div className="dashboard-content">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Data diperbarui secara real-time, geser kartu untuk re-arrange.
        </p>

        {/* Render GateCard */}
        {cards.map((card) => (
          <GateCard
            key={card.id}
            id={card.id}
            location={card.location}
            gates={card.gates}
            sse={card.sse}
            zIndex={cardZ[card.id]}
            position={cardPos[card.id]}
            onDrag={(pos) =>
              setCardPos((prev) => {
                const updated = { ...prev, [card.id]: pos };
                localStorage.setItem("cardPositions", JSON.stringify(updated));
                return updated;
              })
            }
            onFocus={() => bringToFront(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
