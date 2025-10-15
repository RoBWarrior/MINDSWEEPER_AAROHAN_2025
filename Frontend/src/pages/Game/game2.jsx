import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// safe API base -- your Vite env var
const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE || "";

const ITEMS_COUNT = 13;

export default function Game2() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [values, setValues] = useState(Array(ITEMS_COUNT).fill(""));
  const [loading, setLoading] = useState(true);
  const [gameId, setGameId] = useState(null);
  const [structureType, setStructureType] = useState("graph");
  const [message, setMessage] = useState("");
  const [badEdges, setBadEdges] = useState([]);

  // viewBox string and svg display height (px)
  const [viewBox, setViewBox] = useState("0 0 600 600");
  const [svgHeightPx, setSvgHeightPx] = useState(Math.min(window.innerHeight * 0.7, 640));

  // update svg height to fit viewport so tree never forces vertical scroll
  const recomputeSvgHeight = useCallback(() => {
    // reserve space for header + buttons (approx)
    const reservedPx = 160; // header + controls + margins
    const avail = Math.max(220, window.innerHeight - reservedPx);
    // limit max so desktop doesn't make it huge
    const height = Math.min(avail, 720);
    setSvgHeightPx(height);
  }, []);

  useEffect(() => {
    recomputeSvgHeight();
    window.addEventListener("resize", recomputeSvgHeight);
    return () => window.removeEventListener("resize", recomputeSvgHeight);
  }, [recomputeSvgHeight]);

  // compute viewBox from current nodes with padding,
  // centers the content and allows the SVG to scale responsively.
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of nodes) {
      if (!n) continue;
      if (typeof n.x === "number") {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
      }
      if (typeof n.y === "number") {
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
    }
    if (minX === Infinity || minY === Infinity) {
      setViewBox("0 0 600 600");
      return;
    }
    const pad = 48; // padding around tree
    const vbX = Math.floor(minX - pad);
    const vbY = Math.floor(minY - pad);
    const vbW = Math.ceil(maxX - minX + pad * 2);
    const vbH = Math.ceil(maxY - minY + pad * 2);
    setViewBox(`${vbX} ${vbY} ${vbW} ${vbH}`);
  }, [nodes]);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      setMessage("");
      setBadEdges([]);
      const base = API_BASE_URL.replace(/\/+$/, "");
      const url = `${base}/api/generate-graph`;
      // debug: console.log("fetching", url);
      const res = await axios.get(url);
      const data = res.data;
      if (!data || !data.success) {
        setMessage("⚠️ Failed to load constellation. Please try again.");
        setLoading(false);
        return;
      }
      setNodes(Array.isArray(data.nodes) ? data.nodes : []);
      setEdges(Array.isArray(data.edges) ? data.edges : []);
      setGameId(data.gameId || null);
      setStructureType(data.type || "graph");
      setValues(Array(ITEMS_COUNT).fill(""));
      setBadEdges([]);
    } catch (err) {
      console.error("fetch graph error", err);
      setMessage("⚠️ Error fetching constellation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      setMessage("");
      const payload = {
        gameId,
        userNodes: values.map((v) => (v === "" ? null : Number(v))),
        edges,
        email: localStorage.getItem("email") || undefined,
      };
      const base = API_BASE_URL.replace(/\/+$/, "");
      const url = `${base}/api/validate-graph`;
      const resp = await axios.post(url, payload);
      const data = resp.data || {};
      if (data.valid) {
        setMessage(data.message || "Correct!");
        if (data.newGame) {
          setNodes(data.newGame.nodes || []);
          setEdges(data.newGame.edges || []);
          setGameId(data.newGame.gameId || null);
          setValues(Array(ITEMS_COUNT).fill(""));
          setBadEdges([]);
        } else {
          // if no newGame provided, refresh
          fetchGraph();
        }
      } else {
        setMessage(data.message || "Found invalid edges.");
        setBadEdges(Array.isArray(data.badEdges) ? data.badEdges : []);
      }
    } catch (err) {
      console.error("Validation error:", err);
      setMessage("❌ Server error during validation.");
    }
  };

  // helper: check guard for node existence
  const getNode = (idx) => {
    if (!nodes || !nodes[idx]) return null;
    return nodes[idx];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 12,
        boxSizing: "border-box",
        background:
          "linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 100%)",
        color: "white",
      }}
    >
      {/* header + instructions */}
      <div style={{ width: "100%", maxWidth: 980, textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
          {structureType === "tree" ? "🌌 Constellation Labeling Challenge" : "Graph Labeling Challenge"}
        </h1>
        <p style={{ margin: "8px 0 10px", color: "#cbd5e1" }}>
          Place numbers <strong>1–7</strong> on the nodes so that <strong>no connected nodes</strong> have consecutive values.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 6 }}>
          <button
            onClick={handleSubmit}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            Submit
          </button>
          <button
            onClick={fetchGraph}
            style={{
              background: "#6b7280",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            New Constellation
          </button>
        </div>
        {message && <div style={{ color: "#fbbf24", marginBottom: 6 }}>{message}</div>}
      </div>

      {/* SVG container: width 100% up to max, centered. SVG height set so it fits viewport */}
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          // keep no extra vertical margins so SVG fits in viewport
          margin: "0 auto",
        }}
      >
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: "block",
            width: "100%",
            height: svgHeightPx + "px",
            touchAction: "manipulation", // helps on mobile
          }}
        >
          {/* edges */}
          {edges.map((edge, i) => {
            const n1 = getNode(edge.u);
            const n2 = getNode(edge.v);
            if (!n1 || !n2) return null;
            const isBad = badEdges.some(
              (e) =>
                (e.u === edge.u && e.v === edge.v) ||
                (e.u === edge.v && e.v === edge.u)
            );
            return (
              <line
                key={i}
                x1={n1.x}
                y1={n1.y}
                x2={n2.x}
                y2={n2.y}
                stroke={isBad ? "#f87171" : "#84cc16"}
                strokeWidth={isBad ? 3 : 2}
                strokeLinecap="round"
                opacity={isBad ? 0.95 : 0.7}
              />
            );
          })}

          {/* nodes */}
          {nodes.map((node, i) => {
            if (!node) return null;
            const isBadConnected =
              badEdges.some((e) => e.u === i || e.v === i) || false;
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={26}
                  fill="#22c55e"
                  stroke="#bbf7d0"
                  strokeWidth={3}
                />
                {/* centered input using foreignObject */}
                <foreignObject x={-24} y={-24} width={48} height={48}>
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      type="text"
                      value={values[i] || ""}
                      onChange={(e) => {
                        // accept only digits and limit length to 2
                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
                        const copy = values.slice();
                        copy[i] = v;
                        setValues(copy);
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        textAlign: "center",
                        background: "transparent",
                        color: "#fff",
                        border: "none",
                        fontWeight: 800,
                        fontSize: 18,
                        outline: "none",
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* subtle spacer so content doesn't feel stuck to bottom on very small screens */}
      <div style={{ height: 12 }} />
    </div>
  );
}
