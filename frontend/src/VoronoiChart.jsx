import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function VoronoiChart({ tasks }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null); // ⬅️ ツールチップ用のRefを追加

  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const width = 600;
    const height = 400;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current); // ツールチップをD3で操作できるようにする
    
    svg.selectAll('*').remove();

    const nodes = tasks.map(t => ({
      ...t,
      r: Math.max(15, (t.importance || 1) * 6)
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(5))
      .force('collide', d3.forceCollide().radius(d => d.r).iterations(3));

    const cellLayer = svg.append('g');

    simulation.on('tick', () => {
      const delaunay = d3.Delaunay.from(nodes, d => d.x, d => d.y);
      const voronoi = delaunay.voronoi([0, 0, width, height]);

      const paths = cellLayer.selectAll('path').data(nodes);
      paths.enter().append('path')
        .merge(paths)
        .attr('d', (d, i) => voronoi.renderCell(i))
        .attr('fill', d => d.category?.color || '#ccc')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .style('opacity', d => d.isCompleted ? 0.2 : 0.85)
        .style('transition', 'opacity 0.3s')
        
        // --- 🖱️ マウスイベントの追加（ツールチップ操作） ---
        .on('mouseover', (event, d) => {
          // マウスが乗ったら透明度を上げて強調し、ツールチップを表示
          d3.select(event.currentTarget).style('opacity', d.isCompleted ? 0.4 : 1);
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: bold; font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 6px;">
                ${d.name}
              </div>
              <div style="font-size: 13px; color: #444;">重要度: <strong>${d.importance}</strong></div>
              <div style="font-size: 13px; color: #444;">区分: ${d.category?.name || 'なし'}</div>
              <div style="font-size: 13px; color: #444; margin-top: 4px;">
                ${d.isCompleted ? '✅ 完了済み' : '⏳ 未完了'}
              </div>
            `);
        })
        .on('mousemove', (event) => {
          // マウスカーソルの少し右下にツールチップを追従させる
          tooltip
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY + 15) + 'px');
        })
        .on('mouseout', (event, d) => {
          // マウスが外れたら元の透明度に戻し、ツールチップを消す
          d3.select(event.currentTarget).style('opacity', d.isCompleted ? 0.2 : 0.85);
          tooltip.style('opacity', 0);
        });

      paths.exit().remove();
    });

    return () => {
      simulation.stop();
      tooltip.style('opacity', 0); // 画面遷移時などにツールチップが残らないようにする
    };
  }, [tasks]);

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <svg 
        ref={svgRef} 
        width="600" 
        height="400" 
        style={{ 
          background: '#e9ecef', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      ></svg>
      
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none', /* マウスイベントを邪魔しないようにする */
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #ddd',
          textAlign: 'left',
          zIndex: 1000,
          transition: 'opacity 0.2s ease-in-out' /* ふんわり表示・非表示 */
        }}
      ></div>
    </div>
  );
}