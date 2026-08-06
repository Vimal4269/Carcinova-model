import React from 'react';
import { useNavigate } from 'react-router-dom';

const BatchMonitor = () => {
  const navigate = useNavigate();
  const handleMockAction = async (url) => {
    try {
      const res = await fetch('http://localhost:5000' + url, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert('Error connecting to backend: ' + e.message);
    }
  };

  return (
    <div className="w-full h-full relative">
      
      
{/*  SideNavBar (Authority: Shared Components JSON)  */}

<div className="flex-1 flex flex-col ">
{/*  TopAppBar (Authority: Shared Components JSON)  */}

{/*  Main Workspace  */}
<main className="flex-1 flex overflow-hidden">
{/*  Slide Queue Sidebar (Secondary Navigation Style)  */}
<div className="w-[320px] bg-surface-container-low border-r border-outline-variant flex flex-col">
<div className="p-4 border-b border-outline-variant bg-surface">
<h2 className="font-label-caps text-label-caps text-outline uppercase">Queue Processing (24)</h2>
</div>
<div className="flex-1 overflow-y-auto p-2 space-y-2">
{/*  Active Slide  */}
<div className="p-3 bg-white border-2 border-primary rounded-lg shadow-sm">
<div className="flex justify-between items-start mb-2">
<span className="font-mono-data text-mono-data font-bold text-primary">SLIDE_7741_B</span>
<span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Active</span>
</div>
<div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
<div className="h-full bg-primary w-[65%]"></div>
</div>
<p className="text-[10px] text-on-surface-variant">Scanning layer 4 of 6 · Tiled Analysis</p>
</div>
{/*  Completed Slides  */}
<div className="p-3 bg-surface hover:bg-surface-container transition-colors rounded border border-outline-variant/30 opacity-80">
<div className="flex justify-between items-start mb-1">
<span className="font-mono-data text-mono-data font-medium">SLIDE_7740_A</span>
<span className="text-tertiary material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
</div>
<p className="text-[10px] text-outline">Processed in 00:04:12 · High Confidence</p>
</div>
<div className="p-3 bg-surface hover:bg-surface-container transition-colors rounded border border-outline-variant/30 opacity-80">
<div className="flex justify-between items-start mb-1">
<span className="font-mono-data text-mono-data font-medium">SLIDE_7739_C</span>
<span className="text-tertiary material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
</div>
<p className="text-[10px] text-outline">Processed in 00:03:45 · Manual Review Recommended</p>
</div>
{/*  Error Slide  */}
<div className="p-3 bg-error-container/20 hover:bg-error-container/30 transition-colors rounded border border-error/20">
<div className="flex justify-between items-start mb-1">
<span className="font-mono-data text-mono-data font-medium text-error">SLIDE_7738_Z</span>
<span className="text-error material-symbols-outlined text-[16px]" style={{"fontVariationSettings":"'FILL' 1"}}>error</span>
</div>
<p className="text-[10px] text-error font-medium">Calibration Error · Sensor Timeout</p>
</div>
{/*  Queued Slides  */}
<div className="p-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded">
<div className="flex justify-between items-start">
<span className="font-mono-data text-mono-data font-medium text-on-surface-variant/60">SLIDE_7742_D</span>
<span className="text-outline-variant material-symbols-outlined text-[16px]">schedule</span>
</div>
</div>
<div className="p-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded">
<div className="flex justify-between items-start">
<span className="font-mono-data text-mono-data font-medium text-on-surface-variant/60">SLIDE_7743_E</span>
<span className="text-outline-variant material-symbols-outlined text-[16px]">schedule</span>
</div>
</div>
<div className="p-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded">
<div className="flex justify-between items-start">
<span className="font-mono-data text-mono-data font-medium text-on-surface-variant/60">SLIDE_7744_F</span>
<span className="text-outline-variant material-symbols-outlined text-[16px]">schedule</span>
</div>
</div>
</div>
</div>
{/*  Central Progress Dashboard  */}
<div className="flex-1 bg-surface-container-lowest flex flex-col relative">
<div className="flex-1 flex flex-col items-center justify-center p-margin-page">
{/*  Progress Gauge Container  */}
<div className="relative w-[480px] h-[480px] flex items-center justify-center">
{/*  SVG Gauge  */}
<svg className="w-full h-full transform -rotate-90">
{/*  Background Track  */}
<circle className="text-surface-container-highest" cx="240" cy="240" fill="transparent" r="220" stroke="currentColor" strokeWidth="24"></circle>
{/*  Active Progress Track  */}
<circle className="text-primary" cx="240" cy="240" fill="transparent" r="220" stroke="currentColor" stroke-dasharray="1382" stroke-dashoffset="483" strokeLinecap="round" strokeWidth="24"></circle>
</svg>
{/*  Percentage Indicator  */}
<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
<span className="font-display-lg text-[80px] leading-none text-primary font-bold">65%</span>
<span className="font-label-caps text-label-caps text-on-surface-variant tracking-[0.2em] uppercase mt-2">Batch Progress</span>
</div>
{/*  Outer Detail Ornaments  */}
<div className="absolute top-0 right-0 p-4 border border-outline-variant rounded-lg bg-surface/50 backdrop-blur-sm">
<div className="flex flex-col gap-1">
<span className="text-[10px] text-outline font-bold uppercase">Scanning Sensitivity</span>
<span className="font-mono-data text-mono-data text-primary">0.024µm/pixel</span>
</div>
</div>
</div>
{/*  Metrics Grid  */}
<div className="mt-12 grid grid-cols-2 gap-24">
<div className="flex flex-col items-center">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">Elapsed Time</span>
<span className="font-display-lg text-display-lg text-on-surface font-bold font-mono-data">02:14:30</span>
</div>
<div className="flex flex-col items-center">
<span className="font-label-caps text-label-caps text-outline uppercase mb-1">Remaining Est.</span>
<span className="font-display-lg text-display-lg text-tertiary font-bold font-mono-data">01:04:12</span>
</div>
</div>
</div>
{/*  Footer Status Bar  */}
<div className="h-toolbar-height bg-surface border-t border-outline-variant flex items-center justify-between px-margin-page">
<div className="flex gap-8">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-primary"></div>
<span className="text-xs text-on-surface font-medium">Neural Core active</span>
</div>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-outline">database</span>
<span className="text-xs text-outline">Writing results to PACS...</span>
</div>
</div>
<button className="flex items-center gap-2 px-6 py-2 bg-tertiary text-on-tertiary rounded shadow-sm hover:opacity-90 active:scale-95 transition-all" onClick={() => handleMockAction('/api/misc/batch/start')}>
<span className="material-symbols-outlined text-[18px]">file_download</span>
<span className="font-bold text-body-sm">Export All Results</span>
</button>
</div>
</div>
{/*  Contextual Tool Panel (Asymmetric Design Rule)  */}
<div className="w-[80px] bg-surface-container-high border-l border-outline-variant flex flex-col items-center py-6 gap-6">
<button className="p-3 rounded-lg bg-white shadow-sm text-primary hover:bg-primary hover:text-on-primary transition-all group" onClick={() => handleMockAction('/api/misc/batch/start')}>
<span className="material-symbols-outlined text-[24px]">analytics</span>
</button>
<button className="p-3 rounded-lg text-on-surface-variant hover:bg-white hover:text-primary transition-all" onClick={() => handleMockAction('/api/misc/batch/start')}>
<span className="material-symbols-outlined text-[24px]">visibility</span>
</button>
<button className="p-3 rounded-lg text-on-surface-variant hover:bg-white hover:text-primary transition-all" onClick={() => handleMockAction('/api/misc/batch/start')}>
<span className="material-symbols-outlined text-[24px]">tune</span>
</button>
<div className="mt-auto p-3 rounded-lg text-error hover:bg-error/10 transition-all cursor-pointer">
<span className="material-symbols-outlined text-[24px]">pause_circle</span>
</div>
</div>
</main>
</div>
{/*  Decorative Image Layer (Instrument-like Detail)  */}
<div className="fixed bottom-12 right-[340px] w-64 h-64 opacity-5 pointer-events-none">
<img alt="Icon Layer" className="w-full h-full filter invert" data-alt="A technical blueprint overlay of concentric circles and diagnostic scanner components. The style is minimalist and high-precision, with thin architectural lines in a clean clinical setting. The palette consists of subtle grays and medical teal accents, suggesting advanced laboratory technology and scientific rigor." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD61a5IMlWVvCdH8GqQGwg3BweILyKOjyCP5Nur6evsy48XTMvRMPrR5a8z1-4tEWO8IeYcY2XSU6eQjc9QxogKUOI8IXhG3b2SQIjUUNs04ymV6Y8ZJNcMLni5Hp3utlc1LhIhn7_blK5SInVf_Lql6xZjAb_Sy2c5txyzvEVrpdd5IqCIrvpltmKI6gsUMWxKh0tfzQmHAWULffMwGUXjQ5KZEUTrtoWAboPaGrNSexwhglsJFhOQyEkQHnPgWcd8I4dPrAYeXmMB"/>
</div>

      
    </div>
  );
};

export default BatchMonitor;
