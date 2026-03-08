import React from "react";
import "./Area.css";
import GateCardArea from "./GateCard/GateCardArea.jsx";

export default function Area() {
  const sse = {
    name: "Parahyangan",
    disk: { used: 4930, total: 8220 },
    cpu: 16.9,
    ram: { used: 3558.6, total: 7671.0 },
    statuses: {
      serverToNas: "Stop",
      clientToServer: "Running",
    },
  };

  const gates = [
    { id: 1, name: "LPR", status: "Running" },
    { id: 2, name: "NFC", status: "Stop" },
    { id: 3, name: "QRC", status: "Running" },
    { id: 4, name: "LVD", status: "Stop" },
    { id: 5, name: "ALB", status: "Running" },
    { id: 6, name: "CAM", status: "Running" },
    { id: 7, name: "FLO", status: "Stop" },
  ];

  return (
    <div className="pagear-wrap">
      <div className="pagear">
        <div className="pagear-header">
          <h1 className="pagear-title">Area</h1>
          <p className="pagear-subtitle">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </p>
        </div>

        <GateCardArea sse={sse} gates={gates} />
      </div>
    </div>
  );
}
