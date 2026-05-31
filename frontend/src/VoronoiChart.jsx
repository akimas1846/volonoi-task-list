import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function VoronoiChart({ tasks, onSelectTask }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null); // ⬅️ 外側の枠（コンテナ）用のRefを復活

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
        // タスクが空になったらクリアして終了
        d3.select(svgRef.current).selectAll('*').remove();
        return;
    }

    const width = 800;
    const height = 550;
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    svg.selectAll('*').remove();

    const nodes = tasks.map(t => ({
      ...t,
      r: Math.max(20, (t.importance || 1) * 8)
    }));

    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(15))
      .force('collide', d3.forceCollide().radius(d => d.r + 5).iterations(3));

    const cellLayer = svg.append('g');

    simulation.on('tick', () => {
      const delaunay = d3.Delaunay.from(nodes, d => d.x, d => d.y);
      const voronoi = delaunay.voronoi([0, 0, width, height]);

      const paths = cellLayer.selectAll('path').data(nodes);
      paths.enter().append('path')
        .merge(paths)
        .attr('d', (d, i) => voronoi.renderCell(i))
        .attr('fill', d => {
            // ⬇️ 完了済みの色の計算（カテゴリーの色を活かす）
            const baseColor = d3.hsl(d.category?.color || '#ccc');
            if (d.isCompleted) {
                baseColor.s *= 0.2; // 彩度を20%に落とす
                baseColor.l = 0.8;  // 明るくする
            }
            return baseColor.toString();
        })
        .attr('stroke', d => d.isCompleted ? '#ddd' : '#ffffff')
        .attr('stroke-width', d => d.isCompleted ? 1 : 2)
        // ⬇️ 完了済みは点線にする
        .attr('stroke-dasharray', d => d.isCompleted ? '4 3' : 'none')
        .style('opacity', d => d.isCompleted ? 0.4 : 0.8)
        .style('cursor', 'pointer')
        
        .on('click', (event, d) => onSelectTask(d))
        
        // 1️⃣ ホバーイベント（ツールチップの表示）
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget).style('opacity', d.isCompleted ? 0.6 : 1);
          tooltip.style('opacity', 1)
            .html(`
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #333;">${d.name || '無題'}</div>
              <div style="font-size: 12px; color: #666;">
                重要度: ${d.importance}<br/>
                区分: ${d.category?.name || 'なし'}<br/>
                ${d.isCompleted ? '✅ 完了済み' : '⏳ 未完了'}
              </div>
            `);
        })
        
        // 2️⃣ マウス移動イベント（位置の計算：以前の実装を復活）
        .on('mousemove', (event) => {
          // A. コンテナに対するマウスの相対座標を取得（これが抜け落ちていた）
          const [mx, my] = d3.pointer(event, containerRef.current);
          
          // B. ツールチップ自身のサイズを取得
          const tooltipWidth = tooltipRef.current.offsetWidth;
          const containerWidth = width; // 800
          
          // ツールチップの基本位置（マウスの右下 +15px）
          let left = mx + 15;
          let top = my + 15;

          // C. 【右側のはみ出し防止】
          if (left + tooltipWidth > containerWidth) {
            left = mx - tooltipWidth - 15;
          }

          tooltip
            .style('left', left + 'px')
            .style('top', top + 'px');
        })
        
        .on('mouseout', (event, d) => {
          d3.select(event.currentTarget).style('opacity', d.isCompleted ? 0.4 : 0.8);
          tooltip.style('opacity', 0);
        });

      paths.exit().remove();
    });

    return () => simulation.stop();
  }, [tasks, onSelectTask]);

  return (
    // 3. 外側のdivにcontainerRefを復活
    <div className="chart-wrapper" ref={containerRef} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} width="800" height="550" viewBox="0 0 800 550"></svg>
      
      {/* ⬇️ インラインスタイルでツールチップを再定義（以前の実装を復活） */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #ddd',
          textAlign: 'left',
          zIndex: 1000,
          transition: 'opacity 0.2s ease-in-out',
          /* 文字の折り返しを防ぐ（ツールチップの幅を安定させるため） */
          whiteSpace: 'nowrap'
        }}
      ></div>
    </div>
  );
}