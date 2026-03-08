import React, { useMemo, useState, useRef, useEffect } from "react";
import "./GateCardArea.css";
import sseArea from "./sse-area.png";
import sseImg from "./sse-section.png";
import gateImg from "./gate-section.png";

export default function GateCardArea({ sse = {}, gates = [] }) {
  // safe disk/ram/cpu values
  const diskUsed = sse?.disk?.used ?? 0;
  const diskTotal = sse?.disk?.total ?? 0;
  const diskPercent =
    diskTotal > 0 ? ((diskUsed / diskTotal) * 100).toFixed(1) : "0.0";

  const ramUsed = sse?.ram?.used ?? 0;
  const ramTotal = sse?.ram?.total ?? 0;
  const ramPercent =
    ramTotal > 0 ? ((ramUsed / ramTotal) * 100).toFixed(1) : "0.0";

  const cpuPercent =
    sse?.cpu != null ? Number(sse.cpu).toFixed(1) : (0).toFixed(1);

  // ========= FILTER STATE =========
  const [selectedSse, setSelectedSse] = useState(sse?.name ?? "Semua SSE");
  const [selectedGate, setSelectedGate] = useState("Semua Gate");
  const [appliedFilter, setAppliedFilter] = useState({
    sse: sse?.name ?? "Semua SSE",
    gate: "Semua Gate",
  });

  // opsi SSE (dummy – sesuaikan bila perlu)
  const sseOptions = [
    "Parahyangan",
    "BUMN",
    "RS. Brawijaya",
    "Travoy Hub",
    "Kantor Pusat",
  ];

  // opsi Gate berdasarkan ID gate (safe)
  const gateOptions = useMemo(() => {
    if (!Array.isArray(gates) || gates.length === 0) return ["Semua Gate"];
    const ids = gates.map((g) => g?.id).filter((id) => id != null);
    const uniq = Array.from(new Set(ids));
    return ["Semua Gate", ...uniq.map((id) => `Gate ${id}`)];
  }, [gates]);

  // ========= SEARCH LIST GATE =========
  const [search, setSearch] = useState("");
  const gateRefs = useRef({});

  // sort error dulu, lalu ok (safe: gates default [])
  const sortedGates = useMemo(
    () => [
      ...gates.filter((g) => g?.status === "error"),
      ...gates.filter((g) => g?.status === "ok"),
    ],
    [gates]
  );

  // terapkan filter Gate (yang sudah di-Apply) ke sortedGates
  const displayedGates = useMemo(() => {
    if (!appliedFilter?.gate || appliedFilter.gate === "Semua Gate")
      return sortedGates;
    const gateId = String(appliedFilter.gate).replace("Gate ", "").trim();
    return sortedGates.filter((g) => String(g?.id) === gateId);
  }, [sortedGates, appliedFilter]);

  // auto scroll ke hasil search
  useEffect(() => {
    if (!search) return;
    if (!Array.isArray(displayedGates) || displayedGates.length === 0) return;
    const found = displayedGates.find((g) =>
      String(g?.name ?? "").toLowerCase().includes(search.toLowerCase())
    );
    if (found && gateRefs.current[found.id]) {
      gateRefs.current[found.id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [search, displayedGates]);

  const handleApply = () => {
    setAppliedFilter({
      sse: selectedSse,
      gate: selectedGate,
    });
  };

  // safe statuses
  const statuses = sse?.statuses ?? {};
  const serverToNas = statuses.serverToNas ?? "Unknown";
  const clientToServer = statuses.clientToServer ?? "Unknown";

  return (
    <div className="gcarea-root">
      {/* SSE BIG CARD */}
      <div className="gcarea-sse-card">
        <img src={sseArea} alt="sse-bg" className="gcarea-sse-bg" />

        {/* FILTER BAR DI ATAS SSE AREA */}
        <div className="gcarea-filter-bar">
          <div className="gcarea-filter-group">
            <label className="gcarea-filter-label">SSE:</label>
            <select
              className="gcarea-filter-select"
              value={selectedSse}
              onChange={(e) => setSelectedSse(e.target.value)}
            >
              <option value="Semua SSE">Semua SSE</option>
              {sseOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="gcarea-filter-group">
            <label className="gcarea-filter-label">Gate:</label>
            <select
              className="gcarea-filter-select"
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
            >
              {gateOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <button className="gcarea-filter-apply" onClick={handleApply}>
            Apply
          </button>
        </div>

        <div className="gcarea-sse-content">
          {/* LEFT AREA */}
          <div className="gcarea-sse-left">
            <div className="gcarea-sse-title">SSE - {sse?.name ?? "-"}</div>
            <div className="gcarea-sse-dash"></div>
            <div className="gcarea-sse-metrics-row">
              <div className="gcarea-sse-metric">
                <div className="gcarea-metric-name">Disk</div>
                <div className="gcarea-metric-value">
                  {diskUsed}/{diskTotal} ({diskPercent}%)
                </div>
                <div className="gcarea-metric-bar">
                  <div
                    className="gcarea-metric-bar-fill"
                    style={{ width: `${Number(diskPercent)}%` }}
                  />
                </div>
              </div>

              <div className="gcarea-sse-metric">
                <div className="gcarea-metric-name">CPU</div>
                <div className="gcarea-metric-value">{cpuPercent}%</div>
                <div className="gcarea-metric-bar">
                  <div
                    className="gcarea-metric-bar-fill"
                    style={{ width: `${Number(cpuPercent)}%` }}
                  />
                </div>
              </div>

              <div className="gcarea-sse-metric">
                <div className="gcarea-metric-name">RAM</div>
                <div className="gcarea-metric-value">
                  {ramUsed}/{ramTotal} ({ramPercent}%)
                </div>
                <div className="gcarea-metric-bar">
                  <div
                    className="gcarea-metric-bar-fill"
                    style={{ width: `${Number(ramPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT AREA – STATUS */}
          <div className="gcarea-sse-right-area">
            <div className="gcarea-sse-statuses">
              <div
                className={`gcarea-status-pill ${
                  serverToNas === "Running" ? "running" : "stopped"
                }`}
              >
                [Rsync] Server to NAS &nbsp; {serverToNas}
                <svg
                  className="gcarea-sse-loaderar"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#de4a4aff"
                    strokeWidth="4"
                    opacity="0.3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#de4a4aff"
                    strokeWidth="4"
                    strokeDasharray="15.7 62.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div
                className={`gcarea-status-pill ${
                  clientToServer === "Running" ? "running" : "stopped"
                }`}
              >
                [Rsync] Client to Server &nbsp; {clientToServer}
                <svg
                  className="gcarea-sse-loaderar"
                  viewBox="0 0 24 24"
                  fill="none"
                >
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
            </div>
          </div>
        </div>
      </div>

      {/* GATES LIST + SEARCH (tanpa drag) */}
      <div className="gcarea-gate-list-container">
        <div className="gcarea-gate-list">
          {displayedGates.map((g) => {
            const isMatch =
              search && String(g?.name ?? "").toLowerCase().includes(search.toLowerCase());
            // safe latency formatting
            const latencyDisplay =
              g?.latency != null && !Number.isNaN(Number(g.latency))
                ? `${Number(g.latency).toFixed(3)} ms`
                : "-";
            return (
              <div
                key={g?.id ?? Math.random()}
                ref={(el) => {
                  if (g?.id != null) gateRefs.current[g.id] = el;
                }}
                className={`gcarea-gate-item ${
                  g?.status === "error" ? "gate-error" : "gate-ok"
                } ${isMatch ? "gate-highlight" : ""}`}
              >
                <span className="gcarea-gate-name">{g?.name ?? "-"}</span>
                <div className="gcarea-gate-right">
                  <span className="gcarea-gate-latency">{latencyDisplay}</span>

                  <svg
                    className="gcarea-gate-status-loader"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke={g?.status === "ok" ? "#4ade80" : "#ff6b6b"}
                      strokeWidth="4"
                      opacity="0.25"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke={g?.status === "ok" ? "#4ade80" : "#ff6b6b"}
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

        <div className="gcarea-searchbar">
          <div className="gcarea-gate-search">
            <input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* reuse dekorasi SSE kecil + header gate seperti di GateCard jika mau */}
        <div className="gcarea-sse-wrapper-static">
          <img src={sseImg} className="gcarea-sse-img" alt="sse" />
          <div className="gcarea-sse-title">SSE</div>

          <div className="gcarea-sse-latency-wrapper">
            <span className="gcarea-sse-latency">
              {sse?.latency != null ? sse.latency : "-"}
            </span>
            <svg className="gcarea-sse-loader" viewBox="0 0 24 24" fill="none">
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

          <div className="gcarea-sse-metrics">
            <div className="gcarea-metric-item">
              <div className="gcarea-metric-title">Disk</div>
              <div className="gcarea-metric-value">
                <span>
                  {diskUsed}/{diskTotal}
                </span>
                <span className="gcarea-metric-percent">({diskPercent}%)</span>
              </div>
              <div className="gcarea-metric-bar">
                <div
                  className="gcarea-metric-fill"
                  style={{
                    width: `${Number(diskPercent)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="gcarea-metric-item">
              <div className="gcarea-metric-title">CPU</div>
              <div className="gcarea-metric-value">{cpuPercent}%</div>
              <div className="gcarea-metric-bar">
                <div
                  className="gcarea-metric-fill"
                  style={{ width: `${Number(cpuPercent)}%` }}
                ></div>
              </div>
            </div>

            <div className="gcarea-metric-item">
              <div className="gcarea-metric-title">RAM</div>
              <div className="gcarea-metric-value">
                {ramUsed}/{ramTotal}
              </div>
              <div className="gcarea-metric-bar">
                <div
                  className="gcarea-metric-fill"
                  style={{
                    width: `${Number(ramPercent)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="gcarea-gate-card-header-static">{sse?.location ?? "-"}</div>
        <img src={gateImg} className="gcarea-gate-bg" alt="gate-bg" />
      </div>
    </div>
  );
}
