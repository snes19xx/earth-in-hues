function _1(md){return(
md`# Earth in Hues`
)}

function _earth_hues(FileAttachment){return(
FileAttachment("earth_hues.json").json()
)}

function _categories(){return(
[
  "Oceans", "Fresh Water", "Snow and Ice", "Deserts", "Mountains",
  "Forests", "Grasslands", "Shrublands", "Croplands", "Wetlands", "Urban Areas",
  "Total Land Mean", "Total Ocean Mean", "Total Earth Mean"
]
)}

function _months(){return(
["jan","feb","mar","apr","may","jun","jul","aug","sept","oct","nov","dec"]
)}

function _monthLabels(){return(
["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
)}

function _helpers(){return(
{
  hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1,3),16),
      g: parseInt(hex.slice(3,5),16),
      b: parseInt(hex.slice(5,7),16)
    }
  },
  luminance(hex) {
    const {r,g,b} = this.hexToRgb(hex);
    return (0.2126*r + 0.7152*g + 0.0722*b) / 255;
  },
  hexToHsl(hex) {
    let {r,g,b} = this.hexToRgb(hex);
    r/=255; g/=255; b/=255;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b);
    let h=0,s=0,l=(mx+mn)/2;
    if(mx!==mn){
      const d=mx-mn;
      s=l>0.5?d/(2-mx-mn):d/(mx+mn);
      if(mx===r) h=((g-b)/d+(g<b?6:0))/6;
      else if(mx===g) h=((b-r)/d+2)/6;
      else h=((r-g)/d+4)/6;
    }
    return {h:h*360, s:s*100, l:l*100};
  },
  boost(hex, minL=26) {
    const {h,s,l}=this.hexToHsl(hex);
    return l<minL ? `hsl(${h},${Math.max(s,18)}%,${minL}%)` : hex;
  },
  contrastText(hex) {
    return this.luminance(hex) > 0.38 ? "#00000077" : "#ffffff55";
  }
}
)}

function _chart(months,categories,d3,monthLabels,earth_hues,helpers)
{
  const cellW = 80, cellH = 60, gap = 2;
  const m = { top: 104, right: 32, bottom: 28, left: 166 };
  const iW = months.length * cellW;
  const iH = categories.length * cellH;
  const W = iW + m.left + m.right;
  const H = iH + m.top + m.bottom;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width","100%")
    .style("background","#f7f6f1")
    .style("font-family","Georgia, 'Times New Roman', serif");
  
// Line under the title
  svg.append("line")
    .attr("x1", m.left).attr("x2", m.left + iW)
    .attr("y1", 78).attr("y2", 78)
    .attr("stroke","#c8c4b8").attr("stroke-width", 0.6);

  svg.append("text")
    .attr("x", m.left).attr("y", 42)
    .attr("font-size","26px").attr("font-weight","bold")
    .attr("letter-spacing","5px").attr("fill","#111")
    .text("TRUE MEAN EARTH COLOR");

  svg.append("text")
    .attr("x", m.left).attr("y", 62)
    .attr("font-size","10.5px").attr("fill","#aaa")
    .attr("font-style","italic").attr("letter-spacing","0.3px")
    .text("Area-weighted Terra/MODIS global composites");

  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  // Month column headers
  months.forEach((month, mi) => {
    const cx = mi * cellW + cellW / 2;
    g.append("text")
      .attr("x", cx).attr("y", -10)
      .attr("text-anchor","middle")
      .attr("font-size","10px").attr("letter-spacing","1.8px")
      .attr("fill","#555").attr("font-family","system-ui, sans-serif")
      .text(monthLabels[mi].toUpperCase());
    g.append("line")
      .attr("x1",cx).attr("x2",cx)
      .attr("y1",-12).attr("y2",-5)
      .attr("stroke","#bbb").attr("stroke-width",0.6);
  });

  // Category rows 
  categories.forEach((cat, ci) => {
    const isTotal = cat.startsWith("Total");
    const y = ci * cellH;

    // Category label
    g.append("text")
      .attr("x",-14).attr("y", y + cellH/2)
      .attr("text-anchor","end").attr("dominant-baseline","middle")
      .attr("font-size", isTotal ? "10px" : "11.5px")
      .attr("fill", isTotal ? "#999" : "#222")
      .attr("font-style", isTotal ? "italic" : "normal")
      .attr("font-family", isTotal ? "system-ui" : "Georgia, serif")
      .text(cat);

    months.forEach((month, mi) => {
      const entry = earth_hues.find(d => d.month === month);
      const color = entry?.[cat] ?? "#0a0a14";
      const cx = mi * cellW;

      // Swatch
      g.append("rect")
        .attr("x", cx + gap/2).attr("y", y + gap/2)
        .attr("width",  cellW - gap)
        .attr("height", cellH - gap)
        .attr("rx", 2.5)
        .attr("fill", color);

// Hex label inside swatch 
      g.append("text")
        .attr("x", cx + cellW/2)
        .attr("y", y + cellH/2)          
        .attr("text-anchor","middle")
        .attr("dominant-baseline","middle")
        .attr("font-family","'Courier New', Courier, monospace")
        .attr("font-size","12px")            
        .attr("letter-spacing","0.5px")
        .attr("fill", helpers.contrastText(color))
        .text(color.toUpperCase());

      // Tooltip
      g.append("rect")
        .attr("x",cx+gap/2).attr("y",y+gap/2)
        .attr("width",cellW-gap).attr("height",cellH-gap)
        .attr("fill","transparent")
        .append("title")
        .text(`${cat}\n${monthLabels[mi]}\n${color.toUpperCase()}`);
    });
  });


  return svg.node();
}


function _driftLines(categories,d3,earth_hues,helpers,months,monthLabels)
{
  const W = 860, H = 480;
  const m = { top: 64, right: 24, bottom: 44, left: 58 };
  const iW = W - m.left - m.right;
  const iH = H - m.top - m.bottom;

  // hide "Oceans" and "Total" means
  const visibleCategories = categories.filter(c => c !== "Oceans" && !c.startsWith("Total"));
  const Colors = {
    "Fresh Water": "#2196f3",
    "Snow and Ice": "#879cae",
    "Deserts": "#ffbf00",
    "Mountains": "#4d3e39",
    "Forests": "#2e7d32",
    "Grasslands": "#23db57",
    "Shrublands": "#9bb42b",
    "Croplands": "#f57f17",
    "Wetlands": "#00897b",
    "Urban Areas": "#ff1100",
    "Total Land Mean": "#5d4037",
    "Total Ocean Mean": "#1565c0",
    "Total Earth Mean": "#212121"
  };

  const colorScale = d3.scaleOrdinal()
    .domain(visibleCategories)
    .range(visibleCategories.map(c => Colors[c] ?? "#cccccc"));

  const driftData = visibleCategories.map(cat => {
    const jan = earth_hues.find(d => d.month === "jan");
    const {r:r0,g:g0,b:b0} = helpers.hexToRgb(jan?.[cat] ?? "#000000");

    const pts = months.map((month, mi) => {
      const e = earth_hues.find(d => d.month === month);
      const {r,g,b} = helpers.hexToRgb(e?.[cat] ?? "#000000");
      return { month, mi, drift: Math.sqrt((r-r0)**2+(g-g0)**2+(b-b0)**2) };
    });

    const lineColor = colorScale(cat);

    return { cat, pts, lineColor };
  });

  const xScale = d3.scalePoint().domain(months).range([0, iW]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(driftData, d => d3.max(d.pts, p => p.drift)) * 1.06])
    .nice()
    .range([iH, 0]);

  const lineGen = d3.line()
    .x(d => xScale(d.month))
    .y(d => yScale(d.drift))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const svg = d3.create("svg")
    .attr("viewBox",[0,0,W,H])
    .style("max-width","100%")
    .style("background","#f7f6f1")
    .style("font-family","Georgia, serif");

  svg.append("text")
    .attr("x", m.left).attr("y", 20)
    .attr("font-size","17px")
    .attr("font-weight","bold")
    .attr("letter-spacing","1px")
    .attr("fill","#1a1918")
    .text("SEASONAL COLOR DRIFT FROM JANUARY");

  svg.append("text")
    .attr("x", m.left).attr("y", 38)
    .attr("font-size","11px")
    .attr("fill","#aaa")
    .attr("font-style","italic")
    .text("Euclidean RGB distance of each month's mean color from January");

  const g = svg.append("g")
    .attr("transform",`translate(${m.left},${m.top})`);

  // grid
  yScale.ticks(5).forEach(t => {
    g.append("line")
      .attr("x1",0).attr("x2",iW)
      .attr("y1",yScale(t)).attr("y2",yScale(t))
      .attr("stroke","#e8e5de")
      .attr("stroke-width",0.5)
      .attr("stroke-opacity",0.6);

    g.append("text")
      .attr("x",-6)
      .attr("y",yScale(t))
      .attr("text-anchor","end")
      .attr("dominant-baseline","middle")
      .attr("font-size","9px")
      .attr("fill","#ccc")
      .attr("font-family","system-ui")
      .text(t);
  });

  // draw lines (totals on top)
  const sorted = [...driftData].sort((a,b) =>
    (a.cat.startsWith("Total")?1:0) - (b.cat.startsWith("Total")?1:0)
  );

  const animationDuration = 2000;

  sorted.forEach(d => {
    const isTotal = d.cat.startsWith("Total");

    const path = g.append("path")
      .datum(d.pts)
      .attr("d", lineGen)
      .attr("fill","none")
      .attr("stroke", d.lineColor)
      .attr("stroke-width", isTotal ? 2.4 : 1.4)
      .attr("stroke-opacity", isTotal ? 1 : 0.75);

    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(animationDuration)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    d.pts.forEach((pt, i) => {
      const circle = g.append("circle")
        .attr("cx", xScale(pt.month))
        .attr("cy", yScale(pt.drift))
        .attr("r", isTotal ? 0 : 2)
        .attr("fill", d.lineColor)
        .attr("opacity", 0);

      circle.append("title")
        .text(`${d.cat}  ·  ${monthLabels[pt.mi]}\nΔ ${pt.drift.toFixed(1)} RGB units`);

      const delayTime = (i / (d.pts.length - 1)) * animationDuration;

      circle.transition()
        .delay(delayTime)
        .duration(300)
        .attr("opacity", 0.6);
    });
  });

  // x axis
  g.append("g")
    .attr("transform",`translate(0,${iH})`)
    .call(
      d3.axisBottom(xScale)
        .tickSize(3)
        .tickFormat((_,i) => monthLabels[i])
    )
    .call(ax => ax.select(".domain").attr("stroke","#ccc").attr("stroke-opacity",0.5))
    .call(ax => ax.selectAll(".tick line").attr("stroke","#ccc").attr("stroke-opacity",0.5))
    .selectAll("text")
    .attr("fill","#999")
    .attr("font-size","10px");

  // y axis label
  g.append("text")
    .attr("transform","rotate(-90)")
    .attr("x",-iH/2)
    .attr("y",-44)
    .attr("text-anchor","middle")
    .attr("fill","#ccc")
    .attr("font-size","9px")
    .attr("font-family","system-ui")
    .text("RGB Euclidean distance from January");

  // legend
  const COL_W = 70, ROW_H = 16;
  const COLS = 2;

  const legItems = [
    ...visibleCategories.filter(c => !c.startsWith("Total")),
    ...visibleCategories.filter(c =>  c.startsWith("Total"))
  ];

  const legX = iW - COL_W * COLS + 14;
  const legY = -51;

  g.append("rect")
    .attr("x", legX - 8)
    .attr("y", legY - 10)
    .attr("width", COL_W * COLS + 16)
    .attr("height", Math.ceil(legItems.length / COLS) * ROW_H + 16)
    .attr("fill","#f7f6f1")
    .attr("fill-opacity",0.88)
    .attr("stroke","#e4e0d8")
    .attr("stroke-width",0.6)
    .attr("rx",2);

  legItems.forEach((cat, i) => {

    const col  = i % COLS;
    const row  = Math.floor(i / COLS);

    const lx   = legX + col * COL_W;
    const ly   = legY + row * ROW_H;

    const d    = driftData.find(d => d.cat === cat);
    if (!d) return;

    const isTotal = cat.startsWith("Total");

    g.append("line")
      .attr("x1", lx)
      .attr("x2", lx + 16)
      .attr("y1", ly)
      .attr("y2", ly)
      .attr("stroke", d.lineColor)
      .attr("stroke-width", isTotal ? 2.4 : 1.4);

    if (!isTotal) {
      g.append("circle")
        .attr("cx", lx + 8)
        .attr("cy", ly)
        .attr("r", 2)
        .attr("fill", d.lineColor);
    }

    const label = cat
      .replace("Total Earth Mean","Earth Mean")
      .replace("Total Ocean Mean","Ocean Mean")
      .replace("Total Land Mean","Land Mean");

    g.append("text")
      .attr("x", lx + 20)
      .attr("y", ly)
      .attr("dominant-baseline","middle")
      .attr("font-size","8.5px")
      .attr("font-weight", isTotal ? "600" : "normal")
      .attr("fill","#333")
      .attr("font-family","system-ui, sans-serif")
      .text(label);
  });

  return svg.node();
}


function _earthSignature(months,d3,monthLabels,earth_hues,helpers)
{
  const blockH = 88, blockGap = 32;
  const annotH = 48;
  const m = { top: 96, right: 48, bottom: 48, left: 48 };
  const labelW = 88;
  const rows = ["Total Earth Mean","Total Land Mean","Total Ocean Mean"];
  const W = 1100;
  const blockW = (W - m.left - m.right - labelW) / months.length;
  const H = m.top + rows.length * (blockH + annotH + blockGap) + m.bottom;

  const BG      = "#f7f5f0";
  const INK     = "#1a1918";
  const SUBINK  = "#9a9590";
  const RULE    = "#dedad4";

  const svg = d3.create("svg")
    .attr("viewBox",[0,0,W,H])
    .style("max-width","100%")
    .style("background", BG)
    .style("font-family","Georgia, 'Times New Roman', serif");

  // Title 
  svg.append("text")
    .attr("x", m.left + labelW).attr("y", 38)
    .attr("fill", INK).attr("font-size","21px")
    .attr("font-weight","bold").attr("letter-spacing","3px")
    .text("THE EARTH'S ANNUAL COLOR SIGNATURE");

  svg.append("text")
    .attr("x", m.left + labelW).attr("y", 60)
    .attr("fill", SUBINK).attr("font-size","10px")
    .attr("font-style","italic").attr("letter-spacing","0.2px")
    .text("Area-weighted mean color of Earth's three great systems · Terra/MODIS global composites");

  // Rule under title
  svg.append("line")
    .attr("x1", m.left + labelW).attr("x2", W - m.right)
    .attr("y1", 70).attr("y2", 70)
    .attr("stroke", RULE).attr("stroke-width", 0.8);

  // Month column headers
  months.forEach((month, mi) => {
    const cx = m.left + labelW + mi * blockW + blockW / 2;
    svg.append("text")
      .attr("x", cx).attr("y", 86)
      .attr("text-anchor","middle")
      .attr("fill", SUBINK).attr("font-size","10px")
      .attr("font-family","system-ui, sans-serif")
      .attr("letter-spacing","1.4px")
      .text(monthLabels[mi].toUpperCase());
  });

  rows.forEach((rowCat, ri) => {
    const rowLabel = rowCat.replace("Total ","").replace(" Mean","").toUpperCase();
    const baseY = m.top + ri * (blockH + annotH + blockGap);

    // Row label
    svg.append("text")
      .attr("transform",
        `translate(${m.left + labelW - 16},${baseY + blockH/2}) rotate(-90)`)
      .attr("text-anchor","middle")
      .attr("fill", INK).attr("font-size","12px")
      .attr("font-family","system-ui, sans-serif")
      .attr("font-weight","600").attr("letter-spacing","2.5px")
      .text(rowLabel);

    months.forEach((month, mi) => {
      const entry  = earth_hues.find(d => d.month === month);
      const hex    = entry?.[rowCat] ?? "#c8c4bc";
      const {r,g,b} = helpers.hexToRgb(hex);
      const lum    = helpers.luminance(hex);
      const cx     = m.left + labelW + mi * blockW;

      // Color block
      svg.append("rect")
        .attr("x", cx).attr("y", baseY)
        .attr("width", blockW).attr("height", blockH)
        .attr("fill", hex);

      // Thin rule between blocks
      if (mi > 0) {
        svg.append("line")
          .attr("x1", cx).attr("x2", cx)
          .attr("y1", baseY).attr("y2", baseY + blockH)
          .attr("stroke", BG).attr("stroke-width", 0.6);
      }

      // Annotation zone
      const ay = baseY + blockH;
      const displayHex = helpers.boost(hex, 10);

      // Color echo 
      svg.append("rect")
        .attr("x", cx + blockW/2 - 5).attr("y", ay + 8)
        .attr("width", 10).attr("height", 6)
        .attr("fill", displayHex);

      // Hex code
      svg.append("text")
        .attr("x", cx + blockW/2).attr("y", ay + 24)
        .attr("text-anchor","middle")
        .attr("font-family","'Courier New', Courier, monospace")
        .attr("font-size","10px").attr("fill","#6a6660")
        .text(hex.toUpperCase());

      // RGB
      svg.append("text")
        .attr("x", cx + blockW/2).attr("y", ay + 33)
        .attr("text-anchor","middle")
        .attr("font-family","'Courier New', Courier, monospace")
        .attr("font-size","6px").attr("fill","#aaa8a2")
        .text(`${r} · ${g} · ${b}`);

      // Tooltip
      svg.append("rect")
        .attr("x",cx).attr("y",baseY)
        .attr("width",blockW).attr("height",blockH)
        .attr("fill","transparent")
        .style("cursor","crosshair")
        .append("title")
        .text(`${rowCat}\n${monthLabels[mi]}\n${hex.toUpperCase()}\nR ${r}  G ${g}  B ${b}\nLuminance ${(lum*100).toFixed(1)}%`);
    });

    if (ri < rows.length - 1) {
      const ruleY = baseY + blockH + annotH + blockGap / 2;
      svg.append("line")
        .attr("x1", m.left + labelW).attr("x2", W - m.right)
        .attr("y1", ruleY).attr("y2", ruleY)
        .attr("stroke", RULE).attr("stroke-width", 0.7);
    }
  });

  // Bottom rule
  const footY = H - m.bottom + 12;
  svg.append("line")
    .attr("x1", m.left + labelW).attr("x2", W - m.right)
    .attr("y1", footY).attr("y2", footY)
    .attr("stroke", RULE).attr("stroke-width", 0.7);

  svg.append("text")
    .attr("x", m.left + labelW).attr("y", footY + 14)
    .attr("fill","#c0bdb7").attr("font-size","8px")
    .attr("font-family","system-ui").attr("letter-spacing","0.5px")
    .text("SOURCE: NASA Terra/MODIS MCD43C3 · GEBCO 2025 · MODIS MCD12C1 Land Cover");

  return svg.node();
}


function _seasonalOutlineMap(categories,months,d3,earth_hues)
{
  const ecoCategories = categories.filter(c => !c.startsWith("Total"));
  const yearMonths = months; 
  const totalMonths = yearMonths.length;

  const gridCols = 4;                
  const gridRows = Math.ceil(ecoCategories.length / gridCols);
  const wheelRadius = 70;       
  const wheelGap = 32;            
  const canvasW = gridCols * (wheelRadius * 2 + wheelGap) + 100;
  const canvasH = gridRows * (wheelRadius * 2 + wheelGap) + 120;

  const pad = { top: 70, right: 40, bottom: 60, left: 40 };

  const rimSvg = d3.create("svg")
    .attr("viewBox", [0, 0, canvasW, canvasH])
    .style("max-width", "100%")
    .style("background", "#ffffff")
    .style("font-family", "'Times New Roman', Georgia, serif");

  rimSvg.append("text")
    .attr("x", pad.left)
    .attr("y", 30)
    .attr("fill", "#2c3e50")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Seasonal Color Wheels");

  rimSvg.append("text")
    .attr("x", pad.left)
    .attr("y", 48)
    .attr("fill", "#556573")
    .attr("font-size", "11px")
    .attr("font-style", "italic")
    .text("Each biome · 12 months (Jan–Dec)");

  const radStep = (2 * Math.PI) / totalMonths;
  const initAngle = -Math.PI / 2; 
  const wedgeDuration = 120; // animation speed per month in milliseconds

  const quarterDefs = [
    { label: "Winter", hex: "#add8e6", start: initAngle - radStep, end: initAngle + 2 * radStep },
    { label: "Spring", hex: "#ffb7c5", start: initAngle + 2 * radStep, end: initAngle + 5 * radStep },
    { label: "Summer", hex: "#228b22", start: initAngle + 5 * radStep, end: initAngle + 8 * radStep },
    { label: "Fall", hex: "#e6501a", start: initAngle + 8 * radStep, end: initAngle + 11 * radStep }
  ];

  // Generators built without static angles so they can be tweened
  const wedgeArcGen = d3.arc()
    .innerRadius(0)
    .outerRadius(wheelRadius - 2)
    .padAngle(0.01)
    .padRadius(wheelRadius);

  const rimArcGen = d3.arc()
    .innerRadius(wheelRadius - 2)
    .outerRadius(wheelRadius);

  ecoCategories.forEach((eco, cIdx) => {
    const colIdx = cIdx % gridCols;
    const rowIdx = Math.floor(cIdx / gridCols);
    const xCenter = pad.left + colIdx * (wheelRadius * 2 + wheelGap) + wheelRadius;
    const yCenter = pad.top + rowIdx * (wheelRadius * 2 + wheelGap) + wheelRadius;

    const wheelGroup = rimSvg.append("g")
      .attr("transform", `translate(${xCenter}, ${yCenter})`);

    // Draw inner month wedges
    yearMonths.forEach((mName, mIdx) => {
      const monthData = earth_hues.find(d => d.month === mName);
      const hexColor = monthData?.[eco] || "#cccccc";

      const sAngle = initAngle + mIdx * radStep;
      const eAngle = sAngle + radStep;

      const wedge = wheelGroup.append("path")
        .attr("fill", hexColor)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

      // Animate the end angle
      wedge.transition()
        .delay(mIdx * wedgeDuration)
        .duration(wedgeDuration)
        .ease(d3.easeLinear)
        .attrTween("d", function() {
          const interpolate = d3.interpolate(sAngle, eAngle);
          return function(t) {
            return wedgeArcGen({ startAngle: sAngle, endAngle: interpolate(t) });
          };
        });

      wedge.append("title")
        .text(`${eco}  ·  ${mName}\n${hexColor.toUpperCase()}`);
    });

    // Draw outer seasonal rims
    quarterDefs.forEach((quarter, qIdx) => {
      const qPath = wheelGroup.append("path")
        .attr("fill", quarter.hex)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

      const startMonthIdx = qIdx * 3;
      const qDuration = 3 * wedgeDuration;

      // Animate the rim in sync with the 3 underlying months
      qPath.transition()
        .delay(startMonthIdx * wedgeDuration)
        .duration(qDuration)
        .ease(d3.easeLinear)
        .attrTween("d", function() {
          const interpolate = d3.interpolate(quarter.start, quarter.end);
          return function(t) {
            return rimArcGen({ startAngle: quarter.start, endAngle: interpolate(t) });
          };
        });

      qPath.append("title")
        .text(quarter.label);
    });

    // Biome label
    wheelGroup.append("text")
      .attr("y", wheelRadius + 22)
      .attr("text-anchor", "middle")
      .attr("fill", "#2c3e50")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .text(eco);
  });

  const legX = canvasW - 260;
  const legY = canvasH - 30;

  const legendGroup = rimSvg.append("g")
    .attr("transform", `translate(${legX}, ${legY})`);

  quarterDefs.forEach((q, i) => {
    const itemX = i * 60;

    legendGroup.append("rect")
      .attr("x", itemX)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", q.hex)
      .attr("rx", 2);

    legendGroup.append("text")
      .attr("x", itemX + 16)
      .attr("y", 9)
      .attr("font-size", "11px")
      .attr("fill", "#556573")
      .attr("font-family", "system-ui, sans-serif")
      .text(q.label);
  });

  return rimSvg.node();
}


function _spectralMap(categories,months,d3,earth_hues)
{

  const biomes = categories.filter(c => !c.startsWith("Total"));
  const monthsList = months; 
  const nMonths = monthsList.length;
  const cols = 4;                
  const rows = Math.ceil(biomes.length / cols);
  const circleRadius = 70; 
  const spacing = 20;             
  const width = cols * (circleRadius * 2 + spacing) + 100;
  const height = rows * (circleRadius * 2 + spacing) + 120;
  const margin = { top: 70, right: 40, bottom: 40, left: 40 };

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("max-width", "100%")
    .style("background", "#ffffff")
    .style("font-family", "'Times New Roman', Georgia, serif");

  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 30)
    .attr("fill", "#2c3e50")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Seasonal Color Wheels");

  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 48)
    .attr("fill", "#556573")
    .attr("font-size", "11px")
    .attr("font-style", "italic")
    .text("Each biome · 12 months (Jan–Dec)");

  const angleStep = (2 * Math.PI) / nMonths;
  const startAngle = -Math.PI / 2; // put January at top
  
  biomes.forEach((biome, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = margin.left + col * (circleRadius * 2 + spacing) + circleRadius;
    const cy = margin.top + row * (circleRadius * 2 + spacing) + circleRadius;

    const g = svg.append("g")
      .attr("transform", `translate(${cx}, ${cy})`);
    
    monthsList.forEach((month, mi) => {
      const entry = earth_hues.find(d => d.month === month);
      const color = entry?.[biome] || "#cccccc";

      const start = startAngle + mi * angleStep;
      const end = start + angleStep;

      const path = d3.arc()
        .innerRadius(0)
        .outerRadius(circleRadius - 2)
        .startAngle(start)
        .endAngle(end)
        .padAngle(0.01)
        .padRadius(circleRadius);

      const sector = g.append("path")
        .attr("d", path)
        .attr("fill", color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);

      sector.append("title")
        .text(`${biome} — ${month}\n${color.toUpperCase()}`);
    });

    g.append("circle")
      .attr("r", circleRadius - 2)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);

    g.append("text")
      .attr("y", circleRadius + 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#2c3e50")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .text(biome);
  });
  return svg.node();
}


function _rgbChannels(categories,d3,months,earth_hues,helpers,monthLabels)
{
  const COLS = 4;
  const ROWS = Math.ceil(categories.length / COLS);
  const cellW = 218, cellH = 118;
  const cp = { top: 26, right: 10, bottom: 26, left: 36 };
  const op = { top: 68, right: 24, bottom: 24, left: 24 };

  const W = COLS * cellW + op.left + op.right;
  const H = ROWS * cellH + op.top  + op.bottom;

  const iCW = cellW - cp.left - cp.right;
  const iCH = cellH - cp.top  - cp.bottom;

  const xScale = d3.scalePoint().domain(months).range([0, iCW]);
  const yScale = d3.scaleLinear().domain([0,255]).range([iCH,0]);

  const channels = [
    { key:"r", stroke:"#b94040", label:"R" },
    { key:"g", stroke:"#4a7c59", label:"G" },
    { key:"b", stroke:"#3a62a7", label:"B" },
  ];

  const mkLine = ch => d3.line()
    .x(d => xScale(d.month))
    .y(d => yScale(d[ch]))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const svg = d3.create("svg")
    .attr("viewBox",[0,0,W,H])
    .style("max-width","100%")
    .style("background","#faf9f6")
    .style("font-family","Georgia, serif");

  svg.append("text")
    .attr("x", op.left).attr("y", 28)
    .attr("font-size","15px").attr("font-weight","bold")
    .attr("letter-spacing","1.5px").attr("fill","#1a1a1a")
    .text("RGB CHANNEL DECOMPOSITION BY SURFACE TYPE");

  svg.append("text")
    .attr("x", op.left).attr("y", 48)
    .attr("font-size","10px").attr("fill","#888").attr("font-style","italic")
    .text("Red, green, and blue channel intensity (0–255) across the annual cycle");

  // Legend
  channels.forEach((ch, ci) => {
    const lx = op.left + 720 + ci * 55;
    svg.append("line")
      .attr("x1",lx).attr("x2",lx+18)
      .attr("y1",42).attr("y2",42)
      .attr("stroke",ch.stroke).attr("stroke-width",1.8);
    svg.append("text")
      .attr("x",lx+22).attr("y",46)
      .attr("font-size","9px").attr("fill","#555")
      .attr("font-family","system-ui")
      .text(ch.label);
  });

  categories.forEach((cat, ci) => {
    const col = ci % COLS;
    const row = Math.floor(ci / COLS);
    const tx  = op.left + col * cellW + cp.left;
    const ty  = op.top  + row * cellH + cp.top;

    const panelData = months.map(month => {
      const entry = earth_hues.find(d => d.month === month);
      const hex   = entry?.[cat] ?? "#000000";
      return { month, ...helpers.hexToRgb(hex) };
    });

    const g = svg.append("g").attr("transform",`translate(${tx},${ty})`);

    // Panel background
    g.append("rect")
      .attr("x",-3).attr("y",-3)
      .attr("width",iCW+6).attr("height",iCH+6)
      .attr("fill","#f0efe9").attr("rx",2);

    // Grid at 64, 128, 192
    [64,128,192].forEach(v => {
      g.append("line")
        .attr("x1",0).attr("x2",iCW)
        .attr("y1",yScale(v)).attr("y2",yScale(v))
        .attr("stroke","#dddbd5").attr("stroke-width",0.7);
    });

    // R, G, B lines
    channels.forEach(ch => {
      g.append("path")
        .datum(panelData)
        .attr("d",mkLine(ch.key))
        .attr("fill","none")
        .attr("stroke",ch.stroke)
        .attr("stroke-width",1.6)
        .attr("opacity",0.9);
    });

    // Panel title
    g.append("text")
      .attr("x",0).attr("y",-9)
      .attr("font-size","8.5px").attr("fill","#333")
      .attr("font-family","system-ui").attr("font-weight","600")
      .attr("letter-spacing","0.5px")
      .text(cat.toUpperCase());

    // X labels on bottom-row panels
    if (row === ROWS-1 || (categories.length - ci) <= COLS) {
      ["jan","jun","dec"].forEach(m => {
        g.append("text")
          .attr("x",xScale(m)).attr("y",iCH+15)
          .attr("text-anchor","middle")
          .attr("font-size","8px").attr("fill","#aaa")
          .attr("font-family","system-ui")
          .text(monthLabels[months.indexOf(m)]);
      });
    }

    // Y labels on left-column panels
    if (col === 0) {
      [0,128,255].forEach(v => {
        g.append("text")
          .attr("x",-6).attr("y",yScale(v))
          .attr("text-anchor","end").attr("dominant-baseline","middle")
          .attr("font-size","7.5px").attr("fill","#bbb")
          .attr("font-family","system-ui")
          .text(v);
      });
    }
  });

  return svg.node();
}


function _anomalyHeatmap(categories,months,earth_hues,helpers,d3,monthLabels)
{
  const W = 1180, H = 660;
  const m = { top: 88, right: 140, bottom: 44, left: 168 };
  const iW = W - m.left - m.right;
  const iH = H - m.top  - m.bottom;

  // Compute per-category luminance
  const anomalyRows = categories.map(cat => {
    const lums = months.map(month => {
      const entry = earth_hues.find(d => d.month === month);
      return helpers.luminance(entry?.[cat] ?? "#000");
    });
    const mean = d3.mean(lums);
    return {
      cat,
      pts: lums.map((lum, mi) => ({
        month: months[mi],
        delta: lum - mean,
        lum,
        mean
      }))
    };
  });

  const allDeltas  = anomalyRows.flatMap(d => d.pts.map(p => p.delta));
  const maxDelta   = d3.max(allDeltas, Math.abs);

  // Custom palette
  const colorScale = d3.scaleLinear()
    .domain([-maxDelta, 0, maxDelta])
    .range(["#1b4332", "#F2EDED", "#F53838"]);

  const xScale = d3.scaleBand().domain(months).range([0, iW]).padding(0.04);
  const yScale = d3.scaleBand().domain(categories).range([0, iH]).padding(0.07);
  
/*
const cellW = 72;
const cellH = 40;

const xScale = d3.scaleBand()
  .domain(months)
  .range([0, months.length * cellW])
  .padding(0.04);

const yScale = d3.scaleBand()
  .domain(categories)
  .range([0, categories.length * cellH])
  .padding(0.08);
*/
  
  const svg = d3.create("svg")
    .attr("viewBox",[0,0,W,H])
    .style("max-width","100%")
    .style("background","#faf9f6")
    .style("font-family","Georgia, serif");

  svg.append("text")
    .attr("x", m.left).attr("y", 30)
    .attr("font-size","17px").attr("font-weight","bold")
    .attr("letter-spacing","1.5px").attr("fill","#1a1a1a")
    .text("SEASONAL BRIGHTNESS (Δ)");

  svg.append("text")
    .attr("x", m.left).attr("y", 50)
    .attr("font-size","12px").attr("fill","#888").attr("font-style","italic")
    .text("Deviation of monthly luminance from each surface type's annual mean")
  
  const g = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);

  // Draw all cells
  anomalyRows.forEach(d => {
    d.pts.forEach(pt => {
      const x = xScale(pt.month);
      const y = yScale(d.cat);

      g.append("rect")
        .attr("x",x).attr("y",y)
        .attr("width",xScale.bandwidth())
        .attr("height",yScale.bandwidth())
        .attr("rx",2)
        .attr("fill", colorScale(pt.delta));

      // Dynamic text contrast based on color depth
      const absDelta = Math.abs(pt.delta);
      const textColor = absDelta > maxDelta * 0.4 ? "#ffffff" : "#333333";
      
      g.append("text")
        .attr("x", x + xScale.bandwidth()/2)
        .attr("y", y + yScale.bandwidth()/2)
        .attr("text-anchor","middle").attr("dominant-baseline","middle")
        .attr("font-size","10px").attr("font-family","system-ui").attr("font-weight","500")
        .attr("fill", textColor)
        .text((pt.delta >= 0 ? "+" : "") + (pt.delta * 100).toFixed(1));
    });
  });

  // Separator above Total rows
  const sepY = yScale("Total Land Mean") - 1.2;
  g.append("line")
    .attr("x1",-16).attr("x2",iW)
    .attr("y1",sepY).attr("y2",sepY)
    .attr("stroke","#aaa").attr("stroke-width",0.8)
    .attr("stroke-dasharray","5,3");

  // X axis on top
  g.append("g")
    .call(d3.axisTop(xScale).tickSize(0).tickFormat((_,i) => monthLabels[i]))
    .call(ax => ax.select(".domain").remove())
    .selectAll("text")
    .style("font-size","11px").style("fill","#555").style("font-weight", "bold")
    .attr("dy","-9px");

  // Y axis
  g.append("g")
    .call(d3.axisLeft(yScale).tickSize(0))
    .call(ax => ax.select(".domain").remove())
    .selectAll("text")
    .style("font-size","11.5px").style("fill","#333")
    .attr("dx","-8px");

  // Legend
  const legH = Math.round(iH * 0.68);
  const legX = iW + 36;
  const legY = (iH - legH) / 2;

  const defs  = svg.append("defs");
  const lGrad = defs.append("linearGradient")
    .attr("id","anomLegGrad")
    .attr("x1","0%").attr("x2","0%")
    .attr("y1","0%").attr("y2","100%");

  d3.range(0, 1.01, 0.04).forEach(t => {
    lGrad.append("stop")
      .attr("offset",`${t*100}%`)
      .attr("stop-color", colorScale(maxDelta * (1 - 2*t)));
  });

  g.append("rect")
    .attr("x",legX).attr("y",legY)
    .attr("width",14).attr("height",legH)
    .attr("fill","url(#anomLegGrad)").attr("rx",3);

  // Legend tick labels and descriptions
  [
    [legY,            `+${(maxDelta*100).toFixed(1)}%`, "Brighter"],
    [legY + legH,     `−${(maxDelta*100).toFixed(1)}%`, "Darker"]
  ].forEach(([y, val, desc]) => {
    
    // Number label
    g.append("text")
      .attr("x",legX+20).attr("y",y - 4)
      .attr("dominant-baseline","middle")
      .attr("font-size","9px").attr("fill","#222").attr("font-weight", "bold")
      .attr("font-family","system-ui")
      .text(val);

    // Descriptor text
    g.append("text")
      .attr("x",legX+20).attr("y",y + 6)
      .attr("dominant-baseline","middle")
      .attr("font-size","8.5px").attr("fill","#777")
      .attr("font-family","system-ui")
      .text(desc);

    g.append("line")
      .attr("x1",legX+14).attr("x2",legX+17)
      .attr("y1",y).attr("y2",y)
      .attr("stroke","#888").attr("stroke-width",1);
  });

  g.append("text")
    .attr("x",legX+7).attr("y",legY-16)
    .attr("text-anchor","middle")
    .attr("font-size","9px").attr("fill","#666").attr("font-weight", "bold")
    .attr("font-family","system-ui")
    .text("Δ lum.");

  return svg.node();
}


function _seasonalStripes(categories,d3,months,earth_hues)
{
  const W = 1200;
  const rowH = 40;
  const gap = 9;
  const m = { top: 60, right: 40, bottom: 40, left: 140 };
  const H = m.top + categories.length * (rowH + gap) + m.bottom;
  const iW = W - m.left - m.right-50;

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("background", "#fcfcf9")
    .style("font-family", "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif");

  svg.append("text")
    .attr("x", m.left)
    .attr("y", 34)
    .attr("font-size", "17px")
    .attr("font-weight", "600")
    .attr("letter-spacing", "2px")
    .attr("fill", "#111")
    .text("EARTH'S COLOR STRIPES");

  const defs = svg.append("defs");

  categories.forEach((cat, ci) => {
    const gradId = `stripeGrad_${ci.toString().replace(/\s/g, "")}`;
    const linearGrad = defs.append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    const catData = months.map(month => {
      const entry = earth_hues.find(d => d.month === month);
      const hex = entry?.[cat] ?? "#000000";
      return { month, hex };
    });

    catData.forEach((d, i) => {
      linearGrad.append("stop")
        .attr("offset", `${(i / (months.length - 1)) * 100}%`)
        .attr("stop-color", d.hex);
    });

    const y = m.top + ci * (rowH + gap);

    if (cat === "Total Land Mean") {
      svg.append("line")
        .attr("x1", m.left - 20)
        .attr("x2", m.left + iW)
        .attr("y1", y - gap / 2)
        .attr("y2", y - gap / 2)
        .attr("stroke", "#d1d1d1")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4");
    }

    svg.append("text")
      .attr("x", m.left - 16)
      .attr("y", y + rowH / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", cat.startsWith("Total") ? "#111" : "#555")
      .attr("font-weight", cat.startsWith("Total") ? "600" : "400")
      .text(cat);

    svg.append("rect")
      .attr("x", m.left)
      .attr("y", y)
      .attr("height", rowH)
      .attr("fill", `url(#${gradId})`)
      .attr("rx", 4)
      .attr("width", 0)
      .transition()
      .delay(ci * 80)
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("width", iW);
  });

  return svg.node();
}


function _colorCards(earth_hues)
{
  // ─── Manual gradient config per category ──────────────────────────────────
  // lin: linear gradient [x0%,y0%, x1%,y1%] as % of card (0–1)
  // glow: radial highlight [cx%, cy%, radius%] + alpha
  // darkBoost: multiplier to push the dark stop darker (1 = no change)
  const CFG = {
    "Oceans":       { lin:[0.1,1, 0.6,0],  glow:[0.75,0.25,0.85,0.55], darkBoost:0.5 },
    "Fresh Water":  { lin:[0.0,1, 0.5,0],  glow:[0.65,0.30,0.80,0.60], darkBoost:0.6 },
    "Snow and Ice": { lin:[0.5,1, 0.5,0],  glow:[0.60,0.25,0.90,0.75], darkBoost:0.9 },
    "Deserts":      { lin:[0.0,1, 0.55,0], glow:[0.70,0.22,0.90,0.80], darkBoost:0.4 },
    "Forests":      { lin:[0.0,1, 0.5,0],  glow:[0.55,0.30,0.75,0.55], darkBoost:0.3 },
    "Grasslands":   { lin:[0.0,1, 0.5,0],  glow:[0.60,0.28,0.80,0.60], darkBoost:0.4 },
    "Shrublands":   { lin:[0.0,1, 0.55,0], glow:[0.65,0.25,0.85,0.65], darkBoost:0.4 },
    "Croplands":    { lin:[0.0,1, 0.5,0],  glow:[0.60,0.30,0.80,0.60], darkBoost:0.35 },
    "Wetlands":     { lin:[0.0,1, 0.5,0],  glow:[0.55,0.30,0.80,0.55], darkBoost:0.35 },
    "Urban Areas":  { lin:[0.0,1, 0.5,0],  glow:[0.60,0.28,0.80,0.50], darkBoost:0.45 },
    "Mountains":    { lin:[0.05,1,0.55,0], glow:[0.68,0.25,0.85,0.65], darkBoost:0.45 },
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const toRgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const toHex = (r,g,b) => '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
  const lum = h => { const [r,g,b]=toRgb(h); return 0.299*r+0.587*g+0.114*b; };
  const scaleRgb = (h, f) => { const [r,g,b]=toRgb(h); return toHex(r*f,g*f,b*f); };
  const avgHex = arr => {
    const v = arr.filter(h=>h?.startsWith('#')&&h.length>=7);
    if(!v.length) return '#888888';
    const s = v.reduce((a,h)=>{const[r,g,b]=toRgb(h);return[a[0]+r,a[1]+g,a[2]+b]},[0,0,0]);
    return toHex(s[0]/v.length,s[1]/v.length,s[2]/v.length);
  };
  const months = ["jan","feb","mar","apr","may","jun","jul","aug","sept","oct","nov","dec"];

  // ─── Only non-aggregate categories ────────────────────────────────────────
  const catList = Object.keys(CFG);

  const S = 340; // card size (square)
  const GAP = 28;
  const PAD = 52;

  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    background: "#ffffff",
    padding: `${PAD}px`,
    display: "flex",
    flexWrap: "wrap",
    gap: `${GAP}px`,
    fontFamily: "system-ui"
  });

  catList.forEach(cat => {
    const hexes = months.map(m => earth_hues.find(d=>d.month===m)?.[cat]).filter(Boolean);
    const avg = avgHex(hexes);
    const sorted = [...hexes].sort((a,b)=>lum(a)-lum(b));
    const n = sorted.length;
    const dark  = sorted[0];
    const light = sorted[n-1];
    const mid   = sorted[Math.floor(n/2)];
    const cfg   = CFG[cat] ?? { lin:[0,1,0.5,0], glow:[0.65,0.25,0.85,0.60], darkBoost:0.4 };

    // ── canvas ──
    const cvs = document.createElement("canvas");
    cvs.width = S; cvs.height = S;
    Object.assign(cvs.style, { display:"block", width:"100%", height:"100%" });
    const ctx = cvs.getContext("2d");

    // Layer 1 — linear gradient base (very dark bottom → mid top)
    const [x0,y0,x1,y1] = cfg.lin.map((v,i)=>i%2===0?v*S:v*S);
    const darkStop = scaleRgb(dark, cfg.darkBoost);
    const lg = ctx.createLinearGradient(x0,y0,x1,y1);
    lg.addColorStop(0,   darkStop);
    lg.addColorStop(0.45, scaleRgb(dark, cfg.darkBoost*1.6));
    lg.addColorStop(0.75, mid);
    lg.addColorStop(1,   light);
    ctx.fillStyle = lg;
    ctx.fillRect(0,0,S,S);

    // Layer 2 — atmospheric radial glow (light source)
    const [cx,cy,r,alpha] = cfg.glow.map((v,i)=>i<3?v*S:v);
    const rg = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    rg.addColorStop(0,   light + Math.round(alpha*255).toString(16).padStart(2,'0'));
    rg.addColorStop(0.35, mid  + Math.round(alpha*0.25*255).toString(16).padStart(2,'0'));
    rg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0,0,S,S);

    // Layer 3 — subtle corner vignette
    const vg = ctx.createRadialGradient(S*0.5,S,S*0.55,S*0.5,S*0.8,0);
    vg.addColorStop(0, 'rgba(0,0,0,0.20)');
    vg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,S,S);

    // ── card shell (no border-radius) ──
    const card = document.createElement("div");
    Object.assign(card.style, {
      position: "relative",
      width: `${S}px`,
      height: `${S}px`,
      flexShrink: "0",
      boxShadow: "0 4px 32px rgba(0,0,0,0.10)"
    });
    card.appendChild(cvs);

    // ── text overlay ──
    const txt = document.createElement("div");
    Object.assign(txt.style, {
      position: "absolute",
      top: "26px",
      left: "28px",
      pointerEvents: "none"
    });

    const titleEl = document.createElement("div");
    Object.assign(titleEl.style, {
      fontFamily: "'DM Serif Display', serif",
      fontSize: "17px",
      fontWeight: "400",
      letterSpacing: "4px",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.93)",
      marginBottom: "2px",
      lineHeight: "1.3",
      textShadow: "0 1px 8px rgba(0,0,0,0.45)"
    });
    titleEl.textContent = cat;

    const hexEl = document.createElement("div");
    Object.assign(hexEl.style, {
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "13px",
      color: "rgba(255,255,255,0.68)",
      letterSpacing: "1px",
      textShadow: "0 1px 4px rgba(0,0,0,0.35)"
    });
    hexEl.textContent = avg;

    txt.appendChild(titleEl);
    txt.appendChild(hexEl);
    card.appendChild(txt);
    wrap.appendChild(card);
  });

  return wrap;
}


export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["earth_hues.json", {url: new URL("./files/2b4ba9da9abe0126b79ecba364424edff06579830e1e8acdbb412854c060b32365919437adf15ee447761fbdf3e6e4d359b90b9756a09f5c7c8aff5755f7dbc6.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("earth_hues")).define("earth_hues", ["FileAttachment"], _earth_hues);
  main.variable(observer("categories")).define("categories", _categories);
  main.variable(observer("months")).define("months", _months);
  main.variable(observer("monthLabels")).define("monthLabels", _monthLabels);
  main.variable(observer("helpers")).define("helpers", _helpers);
  main.variable(observer("chart")).define("chart", ["months","categories","d3","monthLabels","earth_hues","helpers"], _chart);
  main.variable(observer("driftLines")).define("driftLines", ["categories","d3","earth_hues","helpers","months","monthLabels"], _driftLines);
  main.variable(observer("earthSignature")).define("earthSignature", ["months","d3","monthLabels","earth_hues","helpers"], _earthSignature);
  main.variable(observer("seasonalOutlineMap")).define("seasonalOutlineMap", ["categories","months","d3","earth_hues"], _seasonalOutlineMap);
  main.variable(observer("spectralMap")).define("spectralMap", ["categories","months","d3","earth_hues"], _spectralMap);
  main.variable(observer("rgbChannels")).define("rgbChannels", ["categories","d3","months","earth_hues","helpers","monthLabels"], _rgbChannels);
  main.variable(observer("anomalyHeatmap")).define("anomalyHeatmap", ["categories","months","earth_hues","helpers","d3","monthLabels"], _anomalyHeatmap);
  main.variable(observer("seasonalStripes")).define("seasonalStripes", ["categories","d3","months","earth_hues"], _seasonalStripes);
  main.variable(observer("colorCards")).define("colorCards", ["earth_hues"], _colorCards);
  return main;
}
