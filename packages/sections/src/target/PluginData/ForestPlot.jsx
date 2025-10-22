import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * ForestPlot React component (single-file)
 * - Uses D3 for scales and axes, renders into an SVG.
 * - Tailwind classes used for layout/styling (no CSS file required).
 *
 * Props
 * - data: array of { id?, label, estimate, lower, upper, group? }
 * - width (optional) - if omitted the component will fill the container's width
 * - height (optional, default 400)
 * - margin (optional)
 * - xDomain (optional) - [min, max]
 * - showGrid (optional)
 * - pointSize (optional)
 * - onPointClick (optional)
 *
 * Example usage:
 * <ForestPlot
 *   data={[{label: 'Study A', estimate: 0.3, lower: 0.1, upper: 0.5}, ...]}
 *   height={500}
 * />
 */

export default function ForestPlot({
  data = [],
  width: propWidth = null,
  height = 480,
  margin = { top: 20, right: 150, bottom: 40, left: 200 },
  xDomain = null,
  showGrid = true,
  pointSize = 8,
  onPointClick = null,
  label = "method",
  upper = "upper",
  lower = "lower",
  estimate = "estimate",
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [width, setWidth] = useState(propWidth || 700);

  console.log(lower)

  // responsive resize observer (used only if propWidth not provided)
  useEffect(() => {
    if (propWidth) {
      setWidth(propWidth);
      return;
    }
    const node = containerRef.current;
    if (!node) return;
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const w = Math.max(300, Math.floor(entry.contentRect.width));
        setWidth(w);
      }
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [propWidth]);

  // b=estimate
  // se=lower
  // label=method


  // Draw chart
  useEffect(() => {
    if (!data || data.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = Math.max(200, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    // sort data in original order but maybe allow later sorting externally
    const mapped = data.map((d, i) => ({ ...d, __idx: i }));

    // y scale - categorical
    const y = d3
      .scaleBand()
      .domain(mapped.map(d => d[label]))
      .range([0, innerHeight])
      .padding(0.6);

    // x scale - linear
    const ests = mapped.map(d => d[estimate]).filter(v => isFinite(v));
    const lowers = mapped.map(d => (d[estimate] - d[lower])).filter(v => isFinite(v));
    const uppers = mapped.map(d => (d[estimate] + d[upper])).filter(v => isFinite(v));
    const combined = ests.concat(lowers).concat(uppers);
    const defaultExtent = d3.extent(combined.length ? combined : [0, 1]);

    const pad = (r = defaultExtent) => {
      const span = r[1] - r[0] || Math.abs(r[0]) || 1;
      return [r[0] - 0.12 * span, r[1] + 0.12 * span];
    };

    const xRange = xDomain ? xDomain : pad(defaultExtent);

    const x = d3.scaleLinear().domain(xRange).nice().range([0, innerWidth]);

    // container group
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .attr("role", "img")
      .attr("aria-label", "Forest plot showing estimates and confidence intervals")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // gridlines
    if (showGrid) {
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(x).ticks(6).tickSize(innerHeight).tickFormat("") )
        .attr("opacity", 0.08);
    }

    // x axis
    const xAxis = d3.axisBottom(x).ticks(6).tickSizeOuter(0);
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr("class", "text-sm")
      .selectAll("text")
      .attr("dy", "0.6em");

    // y axis (labels)
    const yAxisG = g.append("g").attr("class", "y-axis text-sm");
    yAxisG
      .selectAll("text")
      .data(mapped)
      .enter()
      .append("text")
      .attr("x", -12)
      .attr("y", d => y(d[label]) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(d => d[label])
      .style("font-size", "0.9rem");

    // rows group
    const rows = g
      .append("g")
      .attr("class", "rows")
      .selectAll("g.row")
      .data(mapped)
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("transform", d => `translate(0,${y(d[label]) + y.bandwidth()/2})`);

    // confidence interval lines
    rows
      .append("line")
      .attr("class", "ci-line")
      .attr("x1", d => x((d[estimate] - d[lower])))
      .attr("x2", d => x((d[estimate] + d[upper])))
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2)
      .attr("opacity", 0.85)
      .attr("stroke-linecap", "round");

    // whiskers caps
    rows
      .append("line")
      .attr("class", "cap left")
      .attr("x1", d => x((d[estimate] - d[lower])))
      .attr("x2", d => x((d[estimate] - d[lower])))
      .attr("y1", -6)
      .attr("y2", 6)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2);

    rows
      .append("line")
      .attr("class", "cap right")
      .attr("x1", d => x((d[estimate] + d[upper])))
      .attr("x2", d => x((d[estimate] + d[upper])))
      .attr("y1", -6)
      .attr("y2", 6)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2);

    // point estimates (rect for easier hit area)
    rows
      .append("rect")
      .attr("class", "estimate-box")
      .attr("x", d => x(d[estimate]) - pointSize / 2)
      .attr("y", -pointSize / 2)
      .attr("width", pointSize)
      .attr("height", pointSize)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", "currentColor")
      .attr("opacity", 0.95)
      .style("cursor", onPointClick ? "pointer" : "default")
      .on("mousemove", (event, d) => {
        const tt = tooltipRef.current;
        if (!tt) return;
        const [mx, my] = d3.pointer(event, containerRef.current);
        tt.style.display = "block";
        tt.style.left = `${mx + 12}px`;
        tt.style.top = `${my + 12}px`;
        tt.innerHTML = `<div class='font-semibold'>${d[label]}</div>
                        <div>Estimate: ${formatNumber(d[estimate])}</div>
                        <div>95% CI: [${formatNumber((d[estimate] - d[lower]))}, ${formatNumber((d[estimate] + d[upper]))}]</div>`;
      })
      .on("mouseleave", () => {
        const tt = tooltipRef.current;
        if (tt) tt.style.display = "none";
      })
      .on("click", (event, d) => {
        if (onPointClick) onPointClick(d);
      });

    // optional numeric column on right showing values
    const valuesG = g.append("g").attr("transform", `translate(${innerWidth + 8},0)`);
    valuesG
      .selectAll("text")
      .data(mapped)
      .enter()
      .append("text")
      .attr("x", 0)
      .attr("y", d => y(d[label]) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("class", "text-sm")
      .text(d => `${formatNumber(d[estimate])} [${formatNumber((d[estimate] - d[lower]))}, ${formatNumber((d[estimate] + d[upper]))}]`)
      .style("font-size", "0.8rem");

    // central vertical reference line if 0 inside domain
    if (x.domain()[0] <= 0 && x.domain()[1] >= 0) {
      g.append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", -6)
        .attr("y2", innerHeight + 6)
        .attr("stroke", "currentColor")
        .attr("opacity", 0.12)
        .attr("stroke-dasharray", "4 4");
    }

    // helper: format numbers
    function formatNumber(n) {
      if (n == null || !isFinite(n)) return "–";
      if (Math.abs(n) < 0.01) return n.toExponential(2);
      return d3.format(".2f")(n);
    }

    // make svg accessible: add title/desc
    svg.selectAll("title").remove();
    svg.append("title").text("Forest plot: point estimates with 95% confidence intervals");

  }, [data, width, height, margin, xDomain, showGrid, pointSize, onPointClick]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="relative bg-white border rounded-lg shadow-sm p-2">
        <svg ref={svgRef} className="w-full block" />
        <div
          ref={tooltipRef}
          style={{ position: "absolute", display: "none", pointerEvents: "none", zIndex: 50 }}
          className="bg-white border rounded-md p-2 text-sm shadow-lg"
        />
      </div>
    </div>
  );
}
