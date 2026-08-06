import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load initial state from localStorage or defaults
  const [magnification, setMagnification] = useState(localStorage.getItem('setting_mag') || '10x');
  const [threshold, setThreshold] = useState(localStorage.getItem('setting_threshold') || '80');
  const [units, setUnits] = useState(localStorage.getItem('setting_units') || 'mm');
  const [autoRedirect, setAutoRedirect] = useState(localStorage.getItem('setting_redirect') !== 'false'); // Default true

  const handleSave = () => {
    localStorage.setItem('setting_mag', magnification);
    localStorage.setItem('setting_threshold', threshold);
    localStorage.setItem('setting_units', units);
    localStorage.setItem('setting_redirect', autoRedirect.toString());
    alert('Settings saved successfully! They will apply to all future actions.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-outline-variant pb-4">
        <h1 className="font-headline-lg text-primary font-bold">Preferences & Settings</h1>
        <p className="font-body-base text-on-surface-variant">
          Customize your clinical workflow, user account, and diagnostic thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Account & Security Section */}
        <section className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant">
          <h2 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            User Account & Session
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center shadow-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-title-md text-on-surface font-semibold">{user?.username || 'Authenticated User'}</h3>
                <p className="text-sm text-on-surface-variant">Role: Pathologist / AI Specialist</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-error/10 hover:bg-error/20 text-error border border-error/30 font-label-large rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </section>
        
        {/* Workflow Section */}
        <section className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant">
          <h2 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">route</span>
            Workflow Preferences
          </h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface">Auto-Redirect to Case Details</label>
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={autoRedirect}
                  onChange={(e) => setAutoRedirect(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
                <span className="text-body-base text-on-surface-variant">
                  Automatically open the Case Details analysis page immediately after successfully uploading and classifying an image.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface">Default Magnification Preset</label>
              <select 
                value={magnification}
                onChange={(e) => setMagnification(e.target.value)}
                className="max-w-[200px] h-11 px-4 bg-surface border border-outline rounded-lg text-body-base focus:border-primary focus:outline-none transition-colors"
              >
                <option value="4x">4x (Scanning View)</option>
                <option value="10x">10x (Low Power)</option>
                <option value="20x">20x (High Power)</option>
                <option value="40x">40x (Diagnostic Power)</option>
              </select>
              <p className="text-sm text-on-surface-variant">Pre-selects this magnification level when opening a new slide in the annotation workspace.</p>
            </div>
          </div>
        </section>

        {/* Diagnostics Section */}
        <section className="bg-surface-container rounded-2xl p-6 shadow-sm border border-outline-variant">
          <h2 className="font-title-lg text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Diagnostic Thresholds
          </h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface">Low Confidence Warning Threshold ({threshold}%)</label>
              <input 
                type="range" 
                min="50" max="99" 
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full max-w-md accent-primary cursor-pointer"
              />
              <p className="text-sm text-on-surface-variant">
                If the AI classification confidence falls below this percentage, the system will flag the case and strongly advise manual pathologist review.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-md text-on-surface">DOI Measurement Units</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="units" 
                    value="mm" 
                    checked={units === 'mm'}
                    onChange={(e) => setUnits(e.target.value)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>Millimeters (mm)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="units" 
                    value="um" 
                    checked={units === 'um'}
                    onChange={(e) => setUnits(e.target.value)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>Micrometers (µm)</span>
                </label>
              </div>
              <p className="text-sm text-on-surface-variant">Changes how Depth of Invasion (DOI) distances are displayed throughout the app.</p>
            </div>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-primary text-on-primary font-label-large rounded-xl hover:opacity-90 shadow-sm flex items-center gap-2 transition-opacity"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            Save Settings
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
