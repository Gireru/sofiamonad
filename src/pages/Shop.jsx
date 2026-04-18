import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, ShoppingBag, Gift, Star } from 'lucide-react';
import { toast } from 'sonner';

import Avatar3D from '@/components/avatars/Avatar3D';
import ShopItem from '@/components/gamification/ShopItem';
import RealRewardCard from '@/components/gamification/RealRewardCard';

// Items para personalizar el avatar (virtuales)
const AVATAR_CATALOG = [
  { item_id: 'hat_wizard', name: 'Gorro de Mago', type: 'hat', emoji: '🎩', cost: 500 },
  { item_id: 'hat_graduation', name: 'Birrete', type: 'hat', emoji: '🎓', cost: 800 },
  { item_id: 'hat_crown', name: 'Corona Real', type: 'hat', emoji: '👑', cost: 1500 },
  { item_id: 'glasses_cool', name: 'Lentes Cool', type: 'glasses', emoji: '😎', cost: 600 },
  { item_id: 'glasses_nerd', name: 'Lentes de Nerd', type: 'glasses', emoji: '🤓', cost: 600 },
  { item_id: 'bg_space', name: 'Espacio', type: 'background', emoji: '🌌', cost: 1200 },
  { item_id: 'bg_rainbow', name: 'Arcoíris', type: 'background', emoji: '🌈', cost: 1200 },
  { item_id: 'bg_galaxy', name: 'Galaxia', type: 'background', emoji: '✨', cost: 2000 },
  { item_id: 'acc_book', name: 'Libro Mágico', type: 'accessory', emoji: '📚', cost: 700 },
  { item_id: 'acc_trophy', name: 'Trofeo de Oro', type: 'accessory', emoji: '🏆', cost: 2500 },
];

// Recompensas del mundo real (canjeables con el maestro)
const REAL_REWARDS = [
  {
    id: 'bag_basic', name: 'Mochila Escolar', category: 'bag',
    emoji: '🎒', cost: 3000,
    description: 'Mochila resistente con varios compartimentos para tus útiles escolares.',
    label: 'Física'
  },
  {
    id: 'bag_premium', name: 'Mochila Premium', category: 'bag',
    emoji: '🧳', cost: 6000,
    description: 'Mochila ergonómica de alta calidad con porta laptop y botella.',
    label: 'Física'
  },
  {
    id: 'kit_pencils', name: 'Kit de Colores', category: 'supplies',
    emoji: '🖍️', cost: 1500,
    description: 'Set de 24 colores profesionales + lápices y sacapuntas.',
    label: 'Físico'
  },
  {
    id: 'kit_geometry', name: 'Juego de Geometría', category: 'supplies',
    emoji: '📐', cost: 1200,
    description: 'Compás, transportador, escuadras y regla metálica.',
    label: 'Físico'
  },
  {
    id: 'kit_science', name: 'Kit de Ciencias', category: 'supplies',
    emoji: '🔬', cost: 4000,
    description: 'Lupa, tubos de ensayo, pinzas y manual de experimentos.',
    label: 'Físico'
  },
  {
    id: 'calculator', name: 'Calculadora Científica', category: 'supplies',
    emoji: '🔢', cost: 5000,
    description: 'Calculadora científica CASIO fx-991 para matemáticas y física.',
    label: 'Físico'
  },
  {
    id: 'trip_museum', name: 'Excursión al Museo', category: 'trip',
    emoji: '🏛️', cost: 8000,
    description: 'Visita guiada a un museo de ciencias o historia de tu ciudad.',
    label: 'Excursión'
  },
  {
    id: 'trip_nature', name: 'Excursión a la Naturaleza', category: 'trip',
    emoji: '🌿', cost: 10000,
    description: 'Día de campo en parque natural con actividades ecológicas.',
    label: 'Excursión'
  },
  {
    id: 'trip_science', name: 'Visita Centro de Ciencias', category: 'trip',
    emoji: '🚀', cost: 12000,
    description: 'Tour en planetario o centro interactivo de ciencias.',
    label: 'Excursión'
  },
];

const SHOP_CATALOG = AVATAR_CATALOG;

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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-10">

        {/* ── SECCIÓN 1: Recompensas Reales ── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">Recompensas Reales</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Canjeable con tu maestro</span>
          </div>
          <p className="text-sm text-slate-500 mb-5">Acumula Monads estudiando y canjéalos por premios físicos reales. Tu maestro valida el canje.</p>

          {/* Mochilas */}
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">🎒 Mochilas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {REAL_REWARDS.filter(r => r.category === 'bag').map((reward, i) => (
              <RealRewardCard key={reward.id} reward={reward} neuronas={inventory.neuronas} redeemed={inventory.owned_items?.includes(reward.id)} onRedeem={() => handleBuy({ item_id: reward.id, name: reward.name, cost: reward.cost })} />
            ))}
          </div>

          {/* Útiles */}
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">📚 Útiles Escolares</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {REAL_REWARDS.filter(r => r.category === 'supplies').map((reward) => (
              <RealRewardCard key={reward.id} reward={reward} neuronas={inventory.neuronas} redeemed={inventory.owned_items?.includes(reward.id)} onRedeem={() => handleBuy({ item_id: reward.id, name: reward.name, cost: reward.cost })} />
            ))}
          </div>

          {/* Excursiones */}
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">🗺️ Excursiones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REAL_REWARDS.filter(r => r.category === 'trip').map((reward) => (
              <RealRewardCard key={reward.id} reward={reward} neuronas={inventory.neuronas} redeemed={inventory.owned_items?.includes(reward.id)} onRedeem={() => handleBuy({ item_id: reward.id, name: reward.name, cost: reward.cost })} />
            ))}
          </div>
        </section>

        <div className="border-t border-slate-200" />

        {/* ── SECCIÓN 2: Accesorios del Avatar ── */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-slate-800">Accesorios para tu Avatar</h2>
          </div>
          <p className="text-sm text-slate-500 mb-5">Personaliza a {profile.companion_name} con items virtuales.</p>

          {/* Preview */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl text-center mb-6">
            <div className="relative inline-block">
              <Avatar3D type={profile.avatar_type} size="xl" state="idle" />
              {inventory.equipped_items?.hat && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-4xl">
                  {AVATAR_CATALOG.find(i => i.item_id === inventory.equipped_items.hat)?.emoji}
                </div>
              )}
              {inventory.equipped_items?.glasses && (
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-3xl">
                  {AVATAR_CATALOG.find(i => i.item_id === inventory.equipped_items.glasses)?.emoji}
                </div>
              )}
            </div>
            <p className="text-slate-600 mt-3 text-sm">{profile.companion_name} con tus accesorios</p>
          </div>

          {['hat', 'glasses', 'background', 'accessory'].map((category) => {
            const categoryItems = AVATAR_CATALOG.filter(item => item.type === category);
            const categoryNames = { hat: '🎩 Gorras', glasses: '🤓 Lentes', background: '🌈 Fondos', accessory: '✨ Accesorios' };
            return (
              <div key={category} className="mb-6">
                <h3 className="font-semibold text-slate-700 mb-3">{categoryNames[category]}</h3>
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
        </section>

        {/* How to earn */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <img src="https://media.base44.com/images/public/69e3f8f663fc316a299cbdbd/453ae61fd_image.png" alt="Monad" className="w-5 h-5 object-contain" />
            <h3 className="font-bold text-slate-800">¿Cómo ganar Monads?</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Completar una misión del maestro: <strong>+50 🔷</strong></p>
            <p>• Completar tu racha diaria: <strong>+20 🔷</strong></p>
            <p>• Estudiar 15 minutos seguidos: <strong>+10 🔷</strong></p>
            <p>• Hacer preguntas complejas: <strong>+5 🔷</strong></p>
          </div>
        </div>

      </main>
    </div>
  );
}