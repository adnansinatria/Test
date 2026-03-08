import React, { useState, useRef, useEffect } from "react";
import "./GateCard.css";
import sseImg from "./sse-section.png";
import gateImg from "./gate-section.png";

export default function GateCard({
  id,
  location = "Unknown",
  gates = [],
  sse,
  zIndex,
  onFocus,
  onDrag,
  position,
}) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const gateRefs = useRef({});
  const pos = position || { x: 0, y: 0 };

  // DRAG 
  const startDrag = (e) => {
    e.stopPropagation();
    setDragging(true);
    if (onFocus) onFocus();

    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
  };

  const whileDrag = (e) => {
    if (!dragging) return;

    const newPos = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };

    if (onDrag) onDrag(newPos);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  // Sort gates
  const sortedGates = [
    ...gates.filter((g) => g.status === "error"),
    ...gates.filter((g) => g.status === "ok"),
  ];

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!search) return;
    const found = sortedGates.find((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
    if (found && gateRefs.current[found.id]) {
      gateRefs.current[found.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [search]);

  return (
    <div
      className={`gate-card ${dragging ? "dragging" : ""}`}
      onMouseMove={whileDrag}
      onMouseUp={stopDrag}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex,
      }}
    >
      <div className="gate-list-container">
        <div className="gate-list">
          {sortedGates.map((g) => {
            const isMatch =
              search && g.name.toLowerCase().includes(search.toLowerCase());
            return (
              <div
                key={g.id}
                ref={(el) => (gateRefs.current[g.id] = el)}
                className={`gate-item ${
                  g.status === "error" ? "gate-error" : "gate-ok"
                } ${isMatch ? "gate-highlight" : ""}`}
              >
                <span className="gate-name">{g.name}</span>
                <div className="gate-right">
                  <span className="gate-latency">
                    {g.latency != null ? `${g.latency.toFixed(3)} ms` : "-"}
                  </span>

                  <svg
                    className="gate-status-loader"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke={g.status === "ok" ? "#4ade80" : "#ff6b6b"}
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke={g.status === "ok" ? "#4ade80" : "#ff6b6b"}
                      strokeWidth="4"
                      strokeDasharray="15.7 62.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <div className="searchbar">
          <div className="gate-search">
            <input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sse-wrapper" onMouseDown={startDrag}>
          <img src={sseImg} className="sse-img" alt="sse" />
          <div className="sse-title">SSE</div>

          <div className="sse-latency-wrapper">
            <span className="sse-latency">{sse.latency}</span>
            <svg className="sse-loader" viewBox="0 0 24 24" fill="none">
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
          </div>

          <div className="sse-dash"></div>

          <div className="sse-metrics">
            <div className="metric-item">
              <div className="metric-title">Disk</div>
              <div className="metric-value">
                <span>
                  {sse.disk.used}/{sse.disk.total}
                </span>
                <span className="metric-percent">
                  ({((sse.disk.used / sse.disk.total) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${(sse.disk.used / sse.disk.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-title">CPU</div>
              <div className="metric-value">{sse.cpu}%</div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${sse.cpu}%` }}
                ></div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-title">RAM</div>
              <div className="metric-value">
                {sse.ram.used}/{sse.ram.total}
              </div>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{
                    width: `${(sse.ram.used / sse.ram.total) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="gate-card-header" onMouseDown={startDrag}>
          {location}
        </div>

        <img src={gateImg} className="gate-bg" alt="gate-bg" />
      </div>
    </div>
  );
}
