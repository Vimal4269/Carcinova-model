import React from 'react';
import { useNavigate } from 'react-router-dom';

const Calibration = () => {
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
      
      
{/*  Side Navigation Bar  */}

{/*  Top App Bar  */}

{/*  Main Content Canvas  */}
<main className="  h-full flex">
{/*  Live Feed Workspace (Fluid)  */}
<section className="flex-grow bg-background p-margin-page flex flex-col gap-gutter overflow-hidden">
<div className="flex justify-between items-center mb-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
<h2 className="font-headline-md text-headline-md text-on-surface">Live Calibration Feed</h2>
</div>
<div className="flex items-center gap-2 bg-surface px-3 py-1 rounded border border-outline-variant">
<span className="material-symbols-outlined text-sm text-outline" data-icon="straighten">straighten</span>
<span className="font-mono-data text-mono-data text-primary font-bold">Current Scale Factor: 3.968 px/µm</span>
</div>
</div>
{/*  Calibration Feed Container  */}
<div className="relative flex-grow bg-black rounded-lg border border-outline-variant overflow-hidden shadow-inner group">
{/*  Mock Calibration Slide Image  */}
<div className="absolute inset-0 opacity-80 mix-blend-screen bg-[url('https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&amp;w=2000&amp;auto=format&amp;fit=crop')] bg-cover bg-center" data-alt="A high-resolution microscopic view of a calibration stage micrometer with precise chrome-on-glass markings. The image has a clean, scientific laboratory aesthetic with subtle monochromatic tones. Sharp vertical and horizontal lines are visible against a translucent background, illuminated by bright, even medical-grade lighting. The mood is clinical and high-precision.">
</div>
{/*  Overlay Grid (Subtle)  */}
<div className="absolute inset-0 pointer-events-none opacity-10" style={{"backgroundImage":"linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)","backgroundSize":"40px 40px"}}></div>
{/*  Digital Calipers (Cyan)  */}
{/*  Horizontal C2  */}
<div className="absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)] caliper-line">
<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-[#00E5FF]"></div>
<div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-12 bg-[#00E5FF]"></div>
<div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-[#00E5FF] px-2 py-0.5 rounded text-[10px] font-mono-data font-bold">C2: 500.00 µm</div>
</div>
{/*  Vertical C1  */}
<div className="absolute left-1/2 top-[20%] bottom-[20%] w-[2px] bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.6)] caliper-line">
<div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-[#00E5FF]"></div>
<div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 bg-[#00E5FF]"></div>
<div className="absolute top-1/2 -right-16 -translate-y-1/2 bg-black/80 text-[#00E5FF] px-2 py-0.5 rounded text-[10px] font-mono-data font-bold rotate-90">C1: 1000.00 µm</div>
</div>
{/*  Viewport Controls (Overlay)  */}
<div className="absolute bottom-4 left-4 flex gap-2">
<button className="w-8 h-8 bg-black/60 rounded flex items-center justify-center text-white hover:bg-black/80 transition-colors" onClick={() => alert("Zoom In applied locally")}>
<span className="material-symbols-outlined text-sm" data-icon="zoom_in">zoom_in</span>
</button>
<button className="w-8 h-8 bg-black/60 rounded flex items-center justify-center text-white hover:bg-black/80 transition-colors" onClick={() => alert("Zoom Out applied locally")}>
<span className="material-symbols-outlined text-sm" data-icon="zoom_out">zoom_out</span>
</button>
<button className="w-8 h-8 bg-black/60 rounded flex items-center justify-center text-white hover:bg-black/80 transition-colors" onClick={() => alert("Fit to screen applied locally")}>
<span className="material-symbols-outlined text-sm" data-icon="fit_screen">fit_screen</span>
</button>
</div>
</div>
</section>
{/*  Right Tool Panel (Fixed Width)  */}
<aside className="w-[360px] bg-white border-l border-outline-variant flex flex-col">
{/*  Header  */}
<div className="p-6 border-b border-outline-variant">
<h3 className="font-label-caps text-label-caps text-outline uppercase">Calibration Parameters</h3>
</div>
<div className="p-6 flex flex-col gap-8 overflow-y-auto">
{/*  Objective Selector  */}
<div className="flex flex-col gap-3">
<label className="font-body-sm text-body-sm text-on-surface-variant font-semibold">Objective Lens Selector</label>
<div className="grid grid-cols-4 gap-2">
<button className="py-2 border border-outline-variant rounded text-xs font-bold hover:bg-surface-container transition-colors" onClick={() => alert("Objective set to 4x")}>4705</button>
<button className="py-2 border border-outline-variant rounded text-xs font-bold hover:bg-surface-container transition-colors" onClick={() => alert("Objective set to 10x")}>4890</button>
<button className="py-2 border-2 border-primary bg-primary-container text-primary rounded text-xs font-bold" onClick={() => alert("Objective set to 40x")}>5076</button>
<button className="py-2 border border-outline-variant rounded text-xs font-bold hover:bg-surface-container transition-colors" onClick={() => alert("Objective set to 100x")}>5245</button>
</div>
</div>
{/*  Micrometer Dropdown  */}
<div className="flex flex-col gap-2">
<label className="font-body-sm text-body-sm text-on-surface-variant font-semibold">Target Micrometer</label>
<div className="relative">
<select className="w-full bg-surface border border-outline-variant rounded p-2 text-sm font-body-base appearance-none focus:outline-none focus:border-primary">
<option>Stage Micrometer (1.0mm/0.01mm)</option>
<option>Custom Reticle Pattern A</option>
<option>Precision NIST Grid</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="expand_more">expand_more</span>
</div>
</div>
{/*  Pixel Pitch Inputs  */}
<div className="flex flex-col gap-3">
<label className="font-body-sm text-body-sm text-on-surface-variant font-semibold">Sensor Pixel Pitch (µm)</label>
<div className="grid grid-cols-2 gap-4">
<div className="flex flex-col gap-1">
<span className="text-[10px] text-outline font-bold uppercase">X-Axis</span>
<input className="w-full bg-surface border border-outline-variant rounded p-2 text-sm font-mono-data focus:ring-0 focus:border-primary" type="text" defaultValue="3.45"/>
</div>
<div className="flex flex-col gap-1">
<span className="text-[10px] text-outline font-bold uppercase">Y-Axis</span>
<input className="w-full bg-surface border border-outline-variant rounded p-2 text-sm font-mono-data focus:ring-0 focus:border-primary" type="text" defaultValue="3.45"/>
</div>
</div>
</div>
{/*  Workflow Checklist  */}
<div className="flex flex-col gap-3">
<label className="font-body-sm text-body-sm text-on-surface-variant font-semibold">Calibration Workflow</label>
<div className="flex flex-col gap-stack-compact">
<div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30">
<span className="material-symbols-outlined text-primary text-lg" data-icon="check_circle" data-weight="fill">check_circle</span>
<span className="text-xs text-on-surface">Align micrometer grid to viewport axes</span>
</div>
<div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30">
<span className="material-symbols-outlined text-primary text-lg" data-icon="check_circle" data-weight="fill">check_circle</span>
<span className="text-xs text-on-surface">Adjust vertical C1 calipers</span>
</div>
<div className="flex items-center gap-3 p-3 bg-primary-container/10 rounded-lg border border-primary/20">
<span className="material-symbols-outlined text-primary text-lg" data-icon="radio_button_checked">radio_button_checked</span>
<span className="text-xs text-primary font-semibold">Verify horizontal C2 alignment</span>
</div>
<div className="flex items-center gap-3 p-3 opacity-40">
<span className="material-symbols-outlined text-outline text-lg" data-icon="radio_button_unchecked">radio_button_unchecked</span>
<span className="text-xs text-on-surface">Finalize and commit scale factor</span>
</div>
</div>
</div>
</div>
{/*  Action Footer  */}
<div className="mt-auto p-6 bg-surface-container-low border-t border-outline-variant flex flex-col gap-4">
<div className="flex justify-between items-end">
<div>
<p className="text-[10px] text-outline font-bold uppercase">Computed Scale</p>
<p className="text-xl font-mono-data font-bold text-primary">3.968 <span className="text-xs font-normal">px/µm</span></p>
</div>
<button className="text-primary text-xs font-bold underline hover:no-underline" onClick={() => alert("Defaults Reset")}>8820</button>
</div>
<button className="w-full py-3 bg-primary text-white rounded font-bold text-sm tracking-wide shadow-sm hover:opacity-95 active:scale-[0.98] transition-all" onClick={() => handleMockAction('/api/misc/calibration/confirm')}>8961</button>
</div>
</aside>
</main>

      
    </div>
  );
};

export default Calibration;
