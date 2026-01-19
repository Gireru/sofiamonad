import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, Play, RotateCcw } from 'lucide-react';

export default function VoiceSettings({ companionName = 'Lia' }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(0.95);
  const [pitch, setPitch] = useState(companionName === 'Lia' ? 1.1 : 1.0);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadVoices();
    loadSettings();
    
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    const spanishVoices = availableVoices.filter(voice => 
      voice.lang.includes('es')
    );
    setVoices(spanishVoices);
  };

  const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem('sofia_voice_settings') || '{}');
    if (settings.rate) setRate(settings.rate);
    if (settings.pitch !== undefined) setPitch(settings.pitch);
    if (settings.selectedVoiceUri) {
      const voice = voices.find(v => v.voiceURI === settings.selectedVoiceUri);
      setSelectedVoice(voice);
    }
  };

  const saveSettings = (newSettings) => {
    const current = JSON.parse(localStorage.getItem('sofia_voice_settings') || '{}');
    const updated = { ...current, ...newSettings };
    localStorage.setItem('sofia_voice_settings', JSON.stringify(updated));
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    saveSettings({ selectedVoiceUri: voice.voiceURI });
  };

  const handleRateChange = (value) => {
    setRate(value[0]);
    saveSettings({ rate: value[0] });
  };

  const handlePitchChange = (value) => {
    setPitch(value[0]);
    saveSettings({ pitch: value[0] });
  };

  const testVoice = () => {
    if (testing) {
      window.speechSynthesis.cancel();
      setTesting(false);
      return;
    }

    const testMessages = [
      `¡Hola! Soy ${companionName}. Esta es mi voz, ¿te gusta cómo sueno?`,
      `Me encanta ayudarte a aprender cosas nuevas. ¿Listo para estudiar juntos?`,
      `Con esta voz te explicaré matemáticas, ciencias y mucho más.`
    ];

    const utterance = new SpeechSynthesisUtterance(
      testMessages[Math.floor(Math.random() * testMessages.length)]
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    utterance.onstart = () => setTesting(true);
    utterance.onend = () => setTesting(false);
    utterance.onerror = () => setTesting(false);

    window.speechSynthesis.speak(utterance);
  };

  const resetToDefault = () => {
    const defaultRate = 0.95;
    const defaultPitch = companionName === 'Lia' ? 1.1 : 1.0;
    
    setRate(defaultRate);
    setPitch(defaultPitch);
    setSelectedVoice(null);
    
    saveSettings({ 
      rate: defaultRate, 
      pitch: defaultPitch,
      selectedVoiceUri: null 
    });
  };

  const getRecommendedVoices = () => {
    if (companionName === 'Lia') {
      // Voces femeninas recomendadas
      return voices.filter(v => 
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('mujer') ||
        v.name.toLowerCase().includes('monica') ||
        v.name.toLowerCase().includes('paulina')
      );
    } else {
      // Voces masculinas recomendadas
      return voices.filter(v => 
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('hombre') ||
        v.name.toLowerCase().includes('diego') ||
        v.name.toLowerCase().includes('jorge')
      );
    }
  };

  const recommendedVoices = getRecommendedVoices();
  const otherVoices = voices.filter(v => !recommendedVoices.includes(v));

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Volume2 className="w-5 h-5" />
          Personalización de Voz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Voice Test Button */}
        <div className="flex gap-2">
          <Button
            onClick={testVoice}
            className={`flex-1 rounded-xl ${
              testing 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600'
            }`}
          >
            {testing ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                </motion.div>
                Detener
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Probar voz
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-slate-700">Velocidad</label>
            <span className="text-sm text-slate-500">{rate.toFixed(2)}x</span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={handleRateChange}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Lenta</span>
            <span>Normal</span>
            <span>Rápida</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-slate-700">Tono</label>
            <span className="text-sm text-slate-500">{pitch.toFixed(2)}</span>
          </div>
          <Slider
            value={[pitch]}
            onValueChange={handlePitchChange}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Grave</span>
            <span>Normal</span>
            <span>Agudo</span>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <label className="font-medium text-slate-700">
            Seleccionar Voz
          </label>
          
          {recommendedVoices.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-sky-600 font-medium">⭐ Recomendadas para {companionName}</p>
              <div className="grid grid-cols-1 gap-2">
                {recommendedVoices.map((voice) => (
                  <motion.button
                    key={voice.voiceURI}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVoiceSelect(voice)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedVoice?.voiceURI === voice.voiceURI
                        ? 'border-sky-400 bg-sky-50'
                        : 'border-slate-200 bg-white hover:border-sky-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-slate-800">{voice.name}</p>
                    <p className="text-xs text-slate-500">{voice.lang}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {otherVoices.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">Otras voces disponibles</p>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {otherVoices.map((voice) => (
                  <motion.button
                    key={voice.voiceURI}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleVoiceSelect(voice)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedVoice?.voiceURI === voice.voiceURI
                        ? 'border-sky-400 bg-sky-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className="font-medium text-sm text-slate-800">{voice.name}</p>
                    <p className="text-xs text-slate-500">{voice.lang}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-700">
            💡 <strong>Consejo:</strong> Las voces disponibles dependen de tu dispositivo y navegador. 
            Para mejor calidad, usa Chrome o Edge con voces de sistema instaladas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}