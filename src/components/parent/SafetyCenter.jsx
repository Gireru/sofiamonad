import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Shield, Globe, Image, Clock } from 'lucide-react';

export default function SafetyCenter({ 
  settings = {},
  onSettingChange 
}) {
  const { 
    internetMode = true, 
    imageGeneration = true, 
    screenTimeLimit = 45 
  } = settings;

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Shield className="w-5 h-5" />
          Centro de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Internet Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-800">Modo Internet</p>
              <p className="text-xs text-slate-500">Permite búsquedas en la web</p>
            </div>
          </div>
          <Switch
            checked={internetMode}
            onCheckedChange={(checked) => onSettingChange?.('internetMode', checked)}
          />
        </div>

        {/* Image Generation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-slate-800">Generación de Imágenes</p>
              <p className="text-xs text-slate-500">Crear dibujos con IA</p>
            </div>
          </div>
          <Switch
            checked={imageGeneration}
            onCheckedChange={(checked) => onSettingChange?.('imageGeneration', checked)}
          />
        </div>

        {/* Screen Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-800">Tiempo de Pantalla</p>
              <p className="text-xs text-slate-500">Límite diario: {screenTimeLimit} minutos</p>
            </div>
          </div>
          <Slider
            value={[screenTimeLimit]}
            onValueChange={(value) => onSettingChange?.('screenTimeLimit', value[0])}
            min={15}
            max={120}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>15min</span>
            <span>60min</span>
            <span>120min</span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <p className="text-xs text-amber-700">
            💡 Los cambios se aplican inmediatamente en la experiencia del estudiante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}