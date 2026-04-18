import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import Avatar3D from '@/components/avatars/Avatar3D';
import ShopItem from '@/components/gamification/ShopItem';

const SHOP_CATALOG = [
  // Gorras
  { item_id: 'hat_wizard', name: 'Gorro de Mago', type: 'hat', emoji: '🎩', cost: 50 },
  { item_id: 'hat_graduation', name: 'Birrete', type: 'hat', emoji: '🎓', cost: 100 },
  { item_id: 'hat_crown', name: 'Corona Real', type: 'hat', emoji: '👑', cost: 200 },
  
  // Lentes
  { item_id: 'glasses_cool', name: 'Lentes Cool', type: 'glasses', emoji: '😎', cost: 75 },
  { item_id: 'glasses_nerd', name: 'Lentes de Nerd', type: 'glasses', emoji: '🤓', cost: 75 },
  
  // Fondos
  { item_id: 'bg_space', name: 'Espacio', type: 'background', emoji: '🌌', cost: 150 },
  { item_id: 'bg_rainbow', name: 'Arcoíris', type: 'background', emoji: '🌈', cost: 150 },
  { item_id: 'bg_galaxy', name: 'Galaxia', type: 'background', emoji: '✨', cost: 250 },
  
  // Accesorios
  { item_id: 'acc_book', name: 'Libro Mágico', type: 'accessory', emoji: '📚', cost: 100 },
  { item_id: 'acc_trophy', name: 'Trofeo de Oro', type: 'accessory', emoji: '🏆', cost: 300 }
];

export default function Shop() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.StudentProfile.filter({ created_by: user.email });
      
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        
        // Load or create inventory
        const inventories = await base44.entities.StudentInventory.filter({ 
          student_id: profiles[0].id 
        });
        
        if (inventories.length > 0) {
          setInventory(inventories[0]);
        } else {
          // Create initial inventory
          const newInventory = await base44.entities.StudentInventory.create({
            student_id: profiles[0].id,
            neuronas: 100, // Starting neuronas
            owned_items: [],
            equipped_items: {}
          });
          setInventory(newInventory);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBuy = async (item) => {
    if (!inventory || inventory.neuronas < item.cost) {
      toast.error('No tienes suficientes Monads 🔷');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.StudentInventory.update(inventory.id, {
        neuronas: inventory.neuronas - item.cost,
        owned_items: [...(inventory.owned_items || []), item.item_id]
      });

      setInventory({
        ...inventory,
        neuronas: inventory.neuronas - item.cost,
        owned_items: [...(inventory.owned_items || []), item.item_id]
      });

      toast.success(`¡Compraste ${item.name}! 🎉`);
    } catch (error) {
      toast.error('Error al comprar item');
    }
    setLoading(false);
  };

  const handleEquip = async (item) => {
    if (!inventory) return;

    const updatedEquipped = { ...inventory.equipped_items, [item.type]: item.item_id };

    try {
      await base44.entities.StudentInventory.update(inventory.id, {
        equipped_items: updatedEquipped
      });

      setInventory({ ...inventory, equipped_items: updatedEquipped });
      toast.success(`¡${item.name} equipado!`);
    } catch (error) {
      toast.error('Error al equipar item');
    }
  };

  if (!profile || !inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Tienda de Accesorios
                </h1>
                <p className="text-sm text-slate-500">Personaliza a {profile.companion_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
              <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/453ae61fd_image.png" alt="Monad" className="w-5 h-5 object-contain" />
              <span className="font-bold">{inventory.neuronas}</span>
              <span className="text-sm">Monads</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* Preview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl text-center">
          <h2 className="text-lg font-bold text-slate-700 mb-4">Vista previa</h2>
          <div className="relative inline-block">
            <Avatar3D type={profile.avatar_type} size="xl" state="idle" />
            
            {/* Show equipped items */}
            {inventory.equipped_items?.hat && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl">
                {SHOP_CATALOG.find(i => i.item_id === inventory.equipped_items.hat)?.emoji}
              </div>
            )}
            {inventory.equipped_items?.glasses && (
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-3xl">
                {SHOP_CATALOG.find(i => i.item_id === inventory.equipped_items.glasses)?.emoji}
              </div>
            )}
          </div>
          <p className="text-slate-600 mt-4">{profile.companion_name} con tus accesorios</p>
        </div>

        {/* Shop sections */}
        {['hat', 'glasses', 'background', 'accessory'].map((category) => {
          const categoryItems = SHOP_CATALOG.filter(item => item.type === category);
          const categoryNames = {
            hat: '🎩 Gorras',
            glasses: '🤓 Lentes',
            background: '🌈 Fondos',
            accessory: '✨ Accesorios'
          };

          return (
            <div key={category}>
              <h2 className="text-xl font-bold text-slate-700 mb-4">{categoryNames[category]}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryItems.map((item) => (
                  <ShopItem
                    key={item.item_id}
                    item={item}
                    owned={inventory.owned_items?.includes(item.item_id)}
                    equipped={inventory.equipped_items?.[category] === item.item_id}
                    onBuy={() => handleBuy(item)}
                    onEquip={() => handleEquip(item)}
                    canAfford={inventory.neuronas >= item.cost}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* How to earn */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/453ae61fd_image.png" alt="Monad" className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-slate-800">¿Cómo ganar Monads?</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Estudiar 15 minutos seguidos: <strong>+10 🔷</strong></p>
            <p>• Hacer preguntas complejas: <strong>+5 🔷</strong></p>
            <p>• Completar tu racha diaria: <strong>+20 🔷</strong></p>
            <p>• Sin faltas de ortografía: <strong>+3 🔷</strong></p>
          </div>
        </div>

      </main>
    </div>
  );
}