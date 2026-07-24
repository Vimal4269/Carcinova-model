import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManualComparison = () => {
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
      
      
<div className="workspace-grid">
{/*  SideNavBar (240px as per grid, fixed for visual stability)  */}
<aside className="bg-inverse-surface flex flex-col py-margin-page gap-stack-default border-r border-outline relative h-full">
<div className="px-6 mb-8">
<h1 className="font-headline-md text-headline-md font-bold text-inverse-on-surface">Carcinova</h1>
<p className="font-body-base text-body-base text-outline-variant">Histopathology AI</p>
</div>

<div className="mt-auto px-6 flex items-center gap-3">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">P</div>
<div className="flex flex-col">
<span className="text-xs font-bold text-inverse-on-surface">Dr. Aristhos</span>
<span className="text-[10px] text-outline-variant">Pathologist</span>
</div>
</div>
</aside>
{/*  Main Content Area  */}
<main className="w-full flex flex-col overflow-hidden">
{/*  TopAppBar (48px)  */}

{/*  Diagnostic Workspace  */}
<section className="diagnostic-canvas flex flex-row overflow-hidden bg-background p-margin-page gap-gutter">
{/*  Left Side: Annotated Slide (Clinical Comparison View)  */}
<div className="flex-1 relative rounded-lg border border-outline-variant bg-white overflow-hidden shadow-sm group">
<img alt="Histopathology Slide" className="w-full h-full object-cover" data-alt="A high-resolution microscopic view of an H&amp;E stained tissue section showing cellular structures in shades of pink, purple, and magenta. A digital cyan-colored measurement caliper is overlaid on a specific cell cluster, showing a precise analytical line. The lighting is clean and clinical, mimicking a laboratory microscope view. The overall aesthetic is scientific and high-precision, typical of a modern medical diagnostic interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGOKzMHmVSDR3Nw6AVdOyr2A76VmzIjPTZkAG-YSIkZ81Tfgua7gkvcbM5-cmuMSjuQnTiWxSu-UNBhc26RzmY8J1QQ0tWeSFKlJ-trOhjkmnJRHbYGC_wEYNEwuivIxcnSQK1PvnQVtB38chIpRYt1eplc-jt3UF0gqFlGvJ2egNe8pLtQOwCV-fO8QS8uIGuHZr4eIiafp-K9Ecgxn31Xea3tEchZfCmNXI1Q_89lkU0RRTZtrwgJFCcMLGzvB2FZ3PFI_Z8H4o3"/>
{/*  Measurement Overlay  */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-px bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] flex items-center justify-center">
<div className="h-4 w-px bg-cyan-400 absolute left-0"></div>
<div className="h-4 w-px bg-cyan-400 absolute right-0"></div>
<div className="bg-black/60 text-white font-mono-data text-mono-data px-2 py-0.5 rounded-full mb-8">
                        4.2mm (AI)
                    </div>
</div>
{/*  Compass & Controls Overlay  */}
<div className="absolute bottom-4 right-4 flex flex-col gap-2">
<div className="bg-white/90 p-2 rounded border border-outline-variant shadow-sm flex flex-col gap-2">
<button className="material-symbols-outlined text-on-surface hover:text-primary" onClick={() => alert("Zoom In applied locally")}>3050</button>
<button className="material-symbols-outlined text-on-surface hover:text-primary" onClick={() => alert("Zoom Out applied locally")}>3194</button>
<button className="material-symbols-outlined text-on-surface hover:text-primary" onClick={() => alert("Fit to screen applied locally")}>3339</button>
</div>
</div>
<div className="absolute top-4 left-4">
<div className="bg-black/70 text-white font-label-caps text-label-caps px-3 py-1 rounded">
                        PRIMARY REGION OF INTEREST (ROI)
                    </div>
</div>
</div>
{/*  Right Side: Comparison Panel (AI/Manual data inputs)  */}
<div className="w-[420px] flex flex-col gap-stack-default overflow-y-auto pr-1">
{/*  Clinical Comparison Header  */}
<div className="bg-white p-6 border border-outline-variant rounded-lg shrink-0">
<h2 className="font-headline-md text-headline-md text-on-surface mb-2">Clinical Comparison</h2>
<p className="font-body-sm text-body-sm text-on-surface-variant">Validation of AI-assisted depth measurement vs. manual pathologist entry.</p>
</div>
{/*  Measurement Rows  */}
<div className="bg-white border border-outline-variant rounded-lg overflow-hidden flex flex-col divide-y divide-outline-variant shrink-0">
{/*  Manual Row  */}
<div className="p-6 flex items-center justify-between hover:bg-surface-container-low transition-colors">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-on-surface-variant">Manual Input</span>
<span className="text-xs text-outline italic">Enter confirmed value</span>
</div>
<div className="relative w-32 mr-6">
<input className="w-full bg-surface border-b-2 border-primary-container text-right font-mono-data text-xl py-1 px-2 focus:ring-0 focus:border-primary focus:outline-none" placeholder="0.0" type="text" defaultValue="3.6"/>
<span className="absolute right-[-32px] top-1/2 -translate-y-1/2 font-mono-data text-on-surface-variant">mm</span>
</div>
</div>
{/*  AI Row  */}
<div className="p-6 flex items-center justify-between bg-primary/5">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-primary font-bold">AI Measurement</span>
<span className="text-xs text-primary/70">Auto-detected via Carcinova Core</span>
</div>
<div className="flex items-baseline gap-1 mr-6">
<span className="font-mono-data text-2xl font-bold text-primary">4.2</span>
<span className="font-mono-data text-on-surface-variant">mm</span>
</div>
</div>
{/*  Delta Row  */}
<div className="p-4 bg-surface-container flex items-center justify-between">
<span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
<span className="material-symbols-outlined text-base">difference</span>
                            Delta (Δ)
                        </span>
<div className="flex items-center gap-2 text-error font-mono-data font-bold">
<span>+0.6mm</span>
<span className="material-symbols-outlined text-sm">trending_up</span>
</div>
</div>
</div>
{/*  Variability Stat Card (Bento Style)  */}
<div className="bg-primary text-white p-8 rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg shrink-0">
<div className="absolute top-0 right-0 p-4 opacity-20">
<span className="material-symbols-outlined text-6xl" data-icon="analytics" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>analytics</span>
</div>
<span className="font-label-caps text-label-caps text-on-primary-container mb-2">PRECISION INCREASE</span>
<div className="font-display-lg text-6xl font-extrabold tracking-tighter mb-2">15.4%</div>
<p className="font-body-base text-body-base text-on-primary-container max-w-[240px]">
                        Variability Reduction observed across cohort PT-88xx
                    </p>
</div>
{/*  Action Buttons  */}
<div className="grid grid-cols-2 gap-4 shrink-0">
<button className="bg-surface-container-highest text-on-surface py-3 rounded font-semibold border border-outline-variant hover:bg-surface-container-high transition-colors" onClick={() => handleMockAction('/api/misc/batch/start')}>
                        Discard Result
                    </button>
<button className="bg-primary text-white py-3 rounded font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all" onClick={() => handleMockAction('/api/misc/batch/start')}>
                        Verify &amp; Save
                    </button>
</div>
{/*  Bottom Metadata  */}
<div className="mt-auto bg-surface-container-low border border-outline-variant rounded p-4 shrink-0 mb-margin-page">
<div className="flex justify-between items-center text-[10px] text-outline font-label-caps">
<span>Processing Latency: 142ms</span>
<span>Model: DOI-V2.1.0</span>
</div>
</div>
</div>
</section>
</main>
</div>

      
    </div>
  );
};

export default ManualComparison;
