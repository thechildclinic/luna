
import React, { useState } from 'react';
import { SYMBOLIC_NAMES_LIST } from '../constants';
import { SymbolicNameData, JournalingMode, UserProfile } from '../types';
import { PaperPlaneIcon, CheckCircleIcon } from './icons';

interface SymbolicNameInputProps {
  onProfileSelected: (profile: UserProfile) => void;
}

const SymbolicNameInput: React.FC<SymbolicNameInputProps> = ({ onProfileSelected }) => {
  const [customName, setCustomName] = useState('');
  const [selectedPredefinedName, setSelectedPredefinedName] = useState<SymbolicNameData | null>(null);
  const [currentSymbolicName, setCurrentSymbolicName] = useState<SymbolicNameData | null>(null);
  const [selectedMode, setSelectedMode] = useState<JournalingMode | null>(null);
  const [step, setStep] = useState(1);

  const handleSelectPredefinedName = (name: SymbolicNameData) => {
    setSelectedPredefinedName(name);
    setCustomName('');
    setCurrentSymbolicName(name);
    setStep(2);
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomName(e.target.value);
    setSelectedPredefinedName(null);
  };
  
  const handleCustomNameSubmit = () => {
    if (customName.trim()) {
      const newName = { id: customName.trim().toLowerCase().replace(/\s+/g, '-'), name: customName.trim() };
      setCurrentSymbolicName(newName);
      setStep(2);
    }
  };

  const handleModeSelected = (mode: JournalingMode) => {
    setSelectedMode(mode);
    if (currentSymbolicName) {
      onProfileSelected({ symbolicName: currentSymbolicName, journalingMode: mode });
    }
  };

  const getPredefinedNameButtonClass = (nameId: string) => {
    let base = "p-3 rounded-lg transition-all duration-200 ease-in-out text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-primary)]";
    if (selectedPredefinedName?.id === nameId) {
      return `${base} shadow-lg scale-105`
    }
    return `${base}`;
  };
  
  const getModeButtonClass = (mode: JournalingMode) => {
    let base = "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ease-in-out flex items-center";
    if (selectedMode === mode) {
      return `${base} shadow-lg`; // Specific colors via style
    }
    return base; // Specific colors via style
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8" style={{ background: `linear-gradient(to bottom right, var(--theme-bg-gradient-from), var(--theme-bg-gradient-to))`, color: 'var(--theme-text-primary)' }}>
      <div className="p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg text-center" style={{ backgroundColor: 'var(--theme-settings-drawer-bg)'}}>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-serif" style={{fontFamily: "'Lora', serif", color: 'var(--theme-accent-primary)'}}>Welcome to Luna</h1>
        
        {step === 1 && (
          <>
            <p className="text-md sm:text-lg mb-6 sm:mb-8" style={{color: 'var(--theme-text-secondary)'}}>Choose a symbolic name for our journey together. This is your private space.</p>
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3" style={{color: 'var(--theme-accent-primary)'}}>Choose a name:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {SYMBOLIC_NAMES_LIST.map(name => (
                  <button
                    key={name.id}
                    onClick={() => handleSelectPredefinedName(name)}
                    className={getPredefinedNameButtonClass(name.id)}
                    style={{
                      backgroundColor: selectedPredefinedName?.id === name.id ? 'var(--theme-accent-primary)' : 'var(--theme-input-bg)',
                      color: selectedPredefinedName?.id === name.id ? 'var(--theme-button-primary-text)' : 'var(--theme-text-primary)',
                      borderColor: selectedPredefinedName?.id === name.id ? 'var(--theme-accent-primary-hover)' : 'var(--theme-input-border)',
                      // ringColor was here, removed as it's handled by className
                    }}
                     onMouseOver={e => { if (selectedPredefinedName?.id !== name.id) e.currentTarget.style.borderColor = 'var(--theme-accent-primary)';}}
                     onMouseOut={e => { if (selectedPredefinedName?.id !== name.id) e.currentTarget.style.borderColor = 'var(--theme-input-border)';}}
                  >
                    {name.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="my-4" style={{color: 'var(--theme-text-secondary)'}}>Or, create your own:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={handleCustomNameChange}
                  placeholder="Enter your symbolic name"
                  className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-[var(--theme-input-focus-ring)] outline-none placeholder-[var(--theme-text-muted)]"
                  style={{
                     backgroundColor: 'var(--theme-input-bg)', 
                     borderColor: 'var(--theme-input-border)',
                     color: 'var(--theme-text-primary)',
                     // ringColor was here, removed as it's handled by className
                    }}
                />
                 <button
                    onClick={handleCustomNameSubmit}
                    disabled={!customName.trim()}
                    className="p-3 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Submit custom name"
                    style={{backgroundColor: 'var(--theme-button-primary-bg)'}}
                    onMouseOver={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--theme-button-primary-hover)';}}
                    onMouseOut={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--theme-button-primary-bg)';}}
                >
                    <PaperPlaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && currentSymbolicName && (
          <>
            <button onClick={() => { setStep(1); setSelectedMode(null); }} className="text-sm hover:underline mb-4 inline-block" style={{color: 'var(--theme-accent-primary)'}}>&larr; Back to name selection</button>
            <p className="text-md sm:text-lg mb-2" style={{color: 'var(--theme-text-secondary)'}}>Hello, <span className="font-semibold" style={{color: 'var(--theme-accent-primary)'}}>{currentSymbolicName.name}</span>.</p>
            <p className="text-md sm:text-lg mb-6" style={{color: 'var(--theme-text-secondary)'}}>How would you like Luna to accompany you?</p>
            
            <div className="space-y-4 mb-8">
              {[JournalingMode.EPHEMERAL, JournalingMode.PERSISTENT].map(mode => {
                const isSelected = selectedMode === mode;
                const modeDetails = {
                  [JournalingMode.EPHEMERAL]: { name: "Daily Reflection (Ephemeral)", desc: "Ideal for daily 'purging' and self-reflection. Your conversation is not stored, offering a fresh start each time.", accent: 'var(--theme-accent-secondary)' },
                  [JournalingMode.PERSISTENT]: { name: "Continuous Journey (Persistent)", desc: "Luna remembers (data stored only in your browser) for more personalized support over time.", accent: 'var(--theme-accent-primary)' }
                };
                return (
                  <button
                    key={mode}
                    onClick={() => handleModeSelected(mode)}
                    className={getModeButtonClass(mode)}
                    style={{
                      backgroundColor: isSelected ? modeDetails[mode].accent : 'var(--theme-input-bg)',
                      borderColor: isSelected ? modeDetails[mode].accent : 'var(--theme-input-border)',
                      color: isSelected ? 'var(--theme-button-primary-text)' : 'var(--theme-text-primary)'
                    }}
                    onMouseOver={e => { if (!isSelected) e.currentTarget.style.borderColor = modeDetails[mode].accent; }}
                    onMouseOut={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--theme-input-border)'; }}
                  >
                    {isSelected && <CheckCircleIcon className="w-6 h-6 mr-3 flex-shrink-0 text-[var(--theme-button-primary-text)]" />}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-md sm:text-lg">{modeDetails[mode].name}</h3>
                      <p className="text-sm opacity-90" style={{color: isSelected ? 'var(--theme-button-primary-text)' : 'var(--theme-text-secondary)'}}>{modeDetails[mode].desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
        
        <p className="text-xs mt-8" style={{color: 'var(--theme-text-muted)'}}>
          Luna is designed for your privacy. Interactions are processed by AI, but this application does not store your journal entries on external servers.
        </p>
      </div>
    </div>
  );
};

export default SymbolicNameInput;
