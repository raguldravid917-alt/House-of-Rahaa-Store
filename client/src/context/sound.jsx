import React, { createContext, useContext, useState } from "react";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  // --- 🔊 SOUND ASSETS (Sci-Fi UI Sounds) ---
  const sounds = {
    hover: new Audio("https://cdn.freesound.org/previews/242/242501_4414128-lq.mp3"), // Short Blip
    click: new Audio("https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3"), // Glass Tap
    success: new Audio("https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3"), // Power Up
    open: new Audio("https://cdn.freesound.org/previews/277/277325_4548252-lq.mp3") // Swish
  };

  // --- SET VOLUME ---
  // சத்தம் அலறக்கூடாது, மெல்லியதாக இருக்க வேண்டும்
  Object.values(sounds).forEach(s => { s.volume = 0.2; }); 
  sounds.success.volume = 0.4; // வெற்றி சத்தம் கொஞ்சம் சத்தமாக இருக்கலாம்

  const playSound = (type) => {
    if (isMuted || !sounds[type]) return;
    
    // Reset time to allow rapid replay
    const audio = sounds[type];
    audio.currentTime = 0; 
    
    // Play with catch for browser blocking policies
    audio.play().catch(e => console.log("Audio interaction needed first"));
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);