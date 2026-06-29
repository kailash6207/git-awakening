import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaTerminal, FaShieldHalved, FaDungeon, FaGithub, FaCalendarDays, FaBookmark, FaChartPie, FaCircleNodes, FaWeightHanging, FaStar, FaEye, FaCodeFork, FaTriangleExclamation, FaChartLine, FaArrowRotateLeft } from 'react-icons/fa6';

const GitVisualizer = dynamic(
  () => import('../components/GitVisualizer'),
  { ssr: false }
);

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [hunterMeta, setHunterMeta] = useState({ public_repos: 17, name: "Kailash N H" });
  const [refreshCounter, setRefreshCounter] = useState(0); // Trigger sequence tracker for camera resets
  const [chartMetrics, setChartMetrics] = useState({
    languages: {},
    ranks: { 'S-RANK': 0, 'A-RANK': 0, 'B-RANK': 0 },
    timeline: []
  });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";

    fetch(`https://api.github.com/users/kailash6207`)
      .then(res => res.json())
      .then(data => {
        if (data && data.public_repos) setHunterMeta(data);
      })
      .catch(err => console.error("Profile check failed:", err));

    fetch('http://localhost:8585/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.nodes)) {
          const langCounts = {};
          const rankCounts = { 'S-RANK': 0, 'A-RANK': 0, 'B-RANK': 0 };
          
          const sortedNodes = [...data.nodes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          
          let accumulatedXp = 0;
          const growthTimeline = sortedNodes.map((node, i) => {
            const xpGain = node.size > 5000 ? 500 : node.size > 500 ? 250 : 100;
            accumulatedXp += xpGain;
            return { index: i, xp: accumulatedXp, name: node.label };
          });

          data.nodes.forEach(node => {
            const lang = node.language || 'Code';
            langCounts[lang] = (langCounts[lang] || 0) + 1;

            if (node.size > 5000) rankCounts['S-RANK'] += 1;
            else if (node.size > 500) rankCounts['A-RANK'] += 1;
            else rankCounts['B-RANK'] += 1;
          });

          setChartMetrics({ languages: langCounts, ranks: rankCounts, timeline: growthTimeline });
        }
      })
      .catch(err => console.error("Failed compiling charts:", err));
  }, []);

  const getLangColor = (lang) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return '#38bdf8';
    if (l.includes('javascript') || l.includes('typescript')) return '#f59e0b';
    if (l.includes('kotlin') || l.includes('java')) return '#a855f7';
    if (l.includes('html') || l.includes('css')) return '#ef4444';
    return '#22c55e';
  };

  const executeCameraReset = () => {
    setRefreshCounter(prev => prev + 1); // Increments to push update updates to GitVisualizer
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#02040a', color: '#f8fafc', fontFamily: 'monospace' }}>
      
      {/* LEFT PANEL: SYSTEM CONTROL DECK */}
      <div style={{ 
        position: 'absolute', top: '16px', left: '16px', zIndex: 10, 
        backgroundColor: 'rgba(6, 10, 23, 0.9)', backdropFilter: 'blur(12px)', 
        border: '1px solid #38bdf8', padding: '14px 16px', borderRadius: '4px', 
        boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)', width: '360px',
        maxHeight: '96vh', overflowY: 'auto', boxSizing: 'border-box'
      }}>
        
        {/* Profile Identity Layer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '4px', backgroundColor: '#0f172a', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '18px' }}>
              <FaGithub />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff', textShadow: '0 0 8px #38bdf8' }}>{hunterMeta.name}</div>
              <div style={{ fontSize: '9px', color: '#a855f7', fontWeight: 'bold' }}>
                RANK: MASTER INFRASTRUCTURE • REALMS: {hunterMeta.public_repos}
              </div>
            </div>
          </div>
          
          {/* TACTICAL SYSTEM CAMERA RESET CONTROLLER BUTTON */}
          <button 
            onClick={executeCameraReset}
            title="Recalibrate Dimensional Camera View"
            style={{ 
              cursor: 'pointer', backgroundColor: '#02040a', border: '1px solid #22c55e', 
              color: '#22c55e', padding: '6px 10px', borderRadius: '2px', fontSize: '11px',
              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#02040a'; }}
          >
            <FaArrowRotateLeft /> RESET
          </button>
        </div>

        {/* 2D GRAPH MODULE: POTENTIAL SYSTEM GROWTH LINE */}
        <div style={{ marginTop: '12px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '12px', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', textShadow: '0 0 5px rgba(34,197,94,0.2)' }}>
            <FaChartLine /> <span>[ HUNTER XP GROWTH MATRIX ]</span>
          </div>
          
          {chartMetrics.timeline.length > 0 && (
            <div style={{ width: '100%', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="100%" height="80" viewBox="0 0 100 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <line x1="0" y1="40" x2="100" y2="40" stroke="#1e293b" strokeWidth="0.2" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="1" />
                <line x1="0" y1="0" x2="100" y2="0" stroke="#1e293b" strokeWidth="0.2" strokeDasharray="1" />
                
                {(() => {
                  const maxIdx = chartMetrics.timeline.length - 1;
                  const maxXp = chartMetrics.timeline[maxIdx].xp;
                  
                  const points = chartMetrics.timeline.map(pt => {
                    const x = (pt.index / maxIdx) * 100;
                    const y = 40 - (pt.xp / maxXp) * 38;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <>
                      <polygon points={`0,40 ${points} 100,40`} fill="url(#growthGlow)" opacity="0.15" />
                      <polyline points={points} fill="transparent" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 0px 4px #22c55e)' }} />
                    </>
                  );
                })()}
                <defs>
                  <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#cbd5e1', marginTop: '4px' }}>
            <span>Ecosystem Origin</span>
            <span>Total XP: {chartMetrics.timeline[chartMetrics.timeline.length - 1]?.xp || 0}</span>
          </div>
        </div>

        {/* DONUT CHART COMPOSITION */}
        <div style={{ marginTop: '12px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '10px 12px', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FaChartPie /> <span>[ MANA COMPOSITION ]</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
            <svg width="105" height="105" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0f172a" strokeWidth="4" />
              {(() => {
                let accumulatedOffset = 0;
                return Object.entries(chartMetrics.languages).map(([lang, count]) => {
                  const percentage = (count / hunterMeta.public_repos) * 100;
                  const strokeDash = `${percentage} ${100 - percentage}`;
                  const currentOffset = 100 - accumulatedOffset;
                  accumulatedOffset += percentage;
                  return (
                    <circle 
                      key={lang} cx="21" cy="21" r="15.915" fill="transparent" 
                      stroke={getLangColor(lang)} strokeWidth="4.2" 
                      strokeDasharray={strokeDash} strokeDashoffset={currentOffset}
                    />
                  );
                });
              })()}
            </svg>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px', fontSize: '9px' }}>
            {Object.entries(chartMetrics.languages).map(([lang, count]) => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: getLangColor(lang), borderRadius: '1px' }} />
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{lang}: {count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* THREAT MATRIX CARDS */}
        <div style={{ marginTop: '12px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '10px', borderRadius: '2px' }}>
          <div style={{ fontSize: '10px', color: '#eab308', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FaCircleNodes /> <span>[ SYSTEM THREAT MATRIX ]</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', textAlign: 'center' }}>
            {Object.entries(chartMetrics.ranks).map(([rank, count]) => {
              const rankColor = rank.includes('S-RANK') ? '#ef4444' : rank.includes('A-RANK') ? '#eab308' : '#22c55e';
              return (
                <div key={rank} style={{ flex: 1, border: '1px solid #1e293b', padding: '6px 0', backgroundColor: '#02040a' }}>
                  <span style={{ fontSize: '8px', color: '#ffffff', display: 'block', fontWeight: 'bold' }}>{rank}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: rankColor }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Viewport Layer (Receives refreshTrigger to automate coordinate repositioning) */}
      <div style={{ width: '100%', height: '100%', zIndex: 0, position: 'absolute', top: 0, left: 0 }}>
        <GitVisualizer onSelectCommit={setSelectedProject} refreshTrigger={refreshCounter} />
      </div>

      {/* RIGHT PANEL: ARTIFACT INSPECTOR PANEL */}
      {selectedProject && (
        <div style={{ 
          position: 'absolute', top: '16px', right: '16px', zIndex: 10, 
          width: '410px', height: 'calc(100vh - 32px)', 
          backgroundColor: 'rgba(5, 8, 18, 0.96)', backdropFilter: 'blur(16px)', 
          border: `2px solid ${selectedProject.color || '#38bdf8'}`, 
          padding: '14px 20px', boxShadow: `0 0 35px ${(selectedProject.color || '#38bdf8')}44`,
          fontFamily: 'monospace',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)',
          boxSizing: 'border-box'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: `1px solid ${selectedProject.color || '#38bdf8'}44`, paddingBottom: '6px' }}>
            <div>
              <div style={{ color: selectedProject.color || '#38bdf8', fontSize: '9px', letterSpacing: '2px', fontWeight: 'bold', textShadow: `0 0 8px ${selectedProject.color || '#38bdf8'}` }}>
                [ SYSTEM PROTOCOL CODE ]
              </div>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', color: '#ffffff', fontWeight: 'bold' }}>
                {selectedProject.label}
              </h2>
            </div>
            <button onClick={() => setSelectedProject(null)} style={{ cursor: 'pointer', color: '#ffffff', fontWeight: 'bold', backgroundColor: '#0f172a', border: '1px solid #38bdf8', padding: '3px 8px', fontSize: '10px' }}>ESC</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', flexGrow: 1, justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#090d16', border: `1px solid ${selectedProject.color}44`, padding: '10px 14px', borderRadius: '2px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
              <span style={{ color: selectedProject.color || '#38bdf8', display: 'block', fontSize: '9px', fontWeight: 'bold', marginBottom: '4px' }}>&gt; CORE LOG MEMORY</span>
              {selectedProject.description}
            </div>

            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '8px', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '9px', color: '#38bdf8', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '2px' }}>
                <span>[ CORE TELEMETRY PROFILE STATS ]</span>
              </div>
              
              <div style={{ position: 'relative', width: '170px', height: '135px' }}>
                <svg width="170" height="135" viewBox="0 0 100 100" style={{ margin: 'auto', display: 'block' }}>
                  <polygon points="50,5 93,30 93,80 50,95 7,80 7,30" fill="transparent" stroke="#1e293b" strokeWidth="0.5" />
                  <polygon points="50,27.5 71.5,40 71.5,65 50,72.5 28.5,65 28.5,40" fill="transparent" stroke="#0f172a" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="7" y1="30" x2="93" y2="80" stroke="#1e293b" strokeWidth="0.5" />
                  <line x1="7" y1="80" x2="93" y2="30" stroke="#1e293b" strokeWidth="0.5" />

                  {(() => {
                    const s = Math.min(((selectedProject.size || 100) / 6000) * 45, 45);
                    const st = Math.min(((selectedProject.stars || 0) + 1) * 35, 43);
                    const w = Math.min(((selectedProject.watchers || 0) + 1) * 30, 43);
                    const fk = Math.min(((selectedProject.forks || 0) + 1) * 35, 43);
                    const iss = Math.min(((selectedProject.open_issues || 0) + 1) * 25, 43);
                    const c = Math.min(35, 45);

                    const p1 = `${50},${50 - s}`;
                    const p2 = `${50 + st * 0.86},${50 - st * 0.5}`;
                    const p3 = `${50 + w * 0.86},${50 + w * 0.5}`;
                    const p4 = `${50},${50 + fk}`;
                    const p5 = `${50 - iss * 0.86},${50 + iss * 0.5}`;
                    const p6 = `${50 - c * 0.86},${50 - c * 0.5}`;
                    
                    return (
                      <polygon points={`${p1} ${p2} ${p3} ${p4} ${p5} ${p6}`} fill={`${selectedProject.color}18`} stroke={selectedProject.color || '#38bdf8'} strokeWidth="1.5" />
                    );
                  })()}
                </svg>
                <div style={{ position: 'absolute', top: '-4px', left: '42%', fontSize: '8px', color: '#ffffff', fontWeight: 'bold' }}>SIZE</div>
                <div style={{ position: 'absolute', top: '24px', right: '-12px', fontSize: '8px', color: '#f59e0b', fontWeight: 'bold' }}>STARS</div>
                <div style={{ position: 'absolute', bottom: '24px', right: '-14px', fontSize: '8px', color: '#22d3ee', fontWeight: 'bold' }}>WATCH</div>
                <div style={{ position: 'absolute', bottom: '-4px', left: '40%', fontSize: '8px', color: '#22c55e', fontWeight: 'bold' }}>FORKS</div>
                <div style={{ position: 'absolute', bottom: '24px', left: '-18px', fontSize: '8px', color: '#ef4444', fontWeight: 'bold' }}>ISSUES</div>
                <div style={{ position: 'absolute', top: '24px', left: '-12px', fontSize: '8px', color: '#a855f7', fontWeight: 'bold' }}>CORE</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaDungeon style={{ color: selectedProject.color || '#38bdf8', fontSize: '13px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '9px', color: '#ffffff', fontWeight: 'bold' }}>ELEMENT CORE TECH TYPE</p>
                <span style={{ display: 'inline-block', marginTop: '2px', padding: '1px 6px', backgroundColor: '#02040a', borderRadius: '2px', fontSize: '10px', color: selectedProject.color, border: `1px solid ${selectedProject.color}66`, fontWeight: 'bold' }}>
                  {(selectedProject.language || 'CODE').toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaShieldHalved style={{ color: '#eab308', fontSize: '13px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '9px', color: '#ffffff', fontWeight: 'bold' }}>DUNGEON COMPLEXITY EVAL</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#eab308', fontWeight: 'bold' }}>
                  {(selectedProject.size || 0) > 5000 ? '👑 LEGENDARY S-RANK INSTANCE' : (selectedProject.size || 0) > 500 ? '⚔️ ELITE A-RANK RAID' : '🛡️ STANDARD B-RANK VAULT'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '6px 8px', borderRadius: '2px', fontSize: '10px' }}>
              <div>
                <span style={{ fontSize: '8px', color: '#cbd5e1', display: 'block', fontWeight: 'bold' }}><FaWeightHanging /> SIZE</span>
                <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{selectedProject.size || 0} KB</span>
              </div>
              <div>
                <span style={{ fontSize: '8px', color: '#f59e0b', display: 'block', fontWeight: 'bold' }}><FaStar /> STARS</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{selectedProject.stars || 0}</span>
              </div>
              <div>
                <span style={{ fontSize: '8px', color: '#22d3ee', display: 'block', fontWeight: 'bold' }}><FaEye /> WATCH</span>
                <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{selectedProject.watchers || 0}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '8px', color: '#22c55e', display: 'block', fontWeight: 'bold' }}><FaCodeFork /> FORKS</span>
                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{selectedProject.forks || 0}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '8px', color: '#ef4444', display: 'block', fontWeight: 'bold' }}><FaTriangleExclamation /> THREATS</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{selectedProject.open_issues || 0}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaCalendarDays style={{ color: '#a855f7', fontSize: '13px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '9px', color: '#ffffff', fontWeight: 'bold' }}>DIMENSIONAL MATERIALIZATION TIMING</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#f1f5f9', fontWeight: 'bold' }}>{selectedProject.created_at ? new Date(selectedProject.created_at).toLocaleDateString() : 'UNKNOWN EPOCH'}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FaBookmark style={{ color: '#38bdf8', fontSize: '12px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '9px', color: '#ffffff', fontWeight: 'bold' }}>GATEWAY DEPLOYMENT PATH REFERENCE</p>
                <a href={selectedProject.id} target="_blank" rel="noreferrer" style={{ margin: 0, fontSize: '10px', color: '#38bdf8', textDecoration: 'none', borderBottom: '1px dashed #38bdf8', wordBreak: 'break-all', fontWeight: 'bold' }}>
                  {selectedProject.id}
                </a>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}