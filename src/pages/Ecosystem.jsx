import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Sparkles, Wifi, Shield, BookOpen, Volume2, Mic, Cpu, Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Ecosystem() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Transformaciones para la línea conductora
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative bg-slate-950 overflow-x-hidden">
      {/* Línea conductora de luz */}
      <motion.div
        className="fixed left-1/2 top-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 origin-top z-10 blur-sm"
        style={{ height: lineHeight, x: '-50%' }}
      />

      {/* Hero Section */}
      <HeroSection scrollProgress={scrollYProgress} />

      {/* Bocina Hardware Section */}
      <HardwareSection scrollProgress={scrollYProgress} mousePosition={mousePosition} />

      {/* App Software Section */}
      <SoftwareSection scrollProgress={scrollYProgress} mousePosition={mousePosition} />

      {/* Comparativa y CTA */}
      <ComparisonSection navigate={navigate} />

      {/* Botón flotante de regreso */}
      <motion.button
        onClick={() => navigate(createPageUrl('Home'))}
        className="fixed top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 text-white hover:bg-white/20 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

// ============ HERO SECTION ============
function HeroSection({ scrollProgress }) {
  const opacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollProgress, [0, 0.15], [1, 0.8]);

  return (
    <motion.section 
      style={{ opacity, scale }}
      className="relative h-screen flex items-center justify-center"
    >
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
      
      {/* Punto de luz que respira */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-3xl"
      />

      <div className="relative z-10 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight"
        >
          Más que una app.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
        >
          Un compañero para crecer.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex gap-3 justify-center"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

// ============ HARDWARE SECTION ============
function HardwareSection({ scrollProgress, mousePosition }) {
  const sectionStart = 0.15;
  const sectionEnd = 0.45;
  
  const opacity = useTransform(scrollProgress, [sectionStart - 0.05, sectionStart, sectionEnd, sectionEnd + 0.05], [0, 1, 1, 0]);
  const explodeFactor = useTransform(scrollProgress, [sectionStart, sectionEnd], [0, 1]);

  return (
    <motion.section 
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center py-20"
    >
      <div className="relative w-full max-w-6xl mx-auto px-6">
        <motion.h2
          style={{
            opacity: useTransform(scrollProgress, [sectionStart, sectionStart + 0.05], [0, 1])
          }}
          className="text-5xl md:text-7xl font-black text-white text-center mb-20"
        >
          Sofia Bocina IA
        </motion.h2>

        {/* Vista explosionada 3D de la bocina */}
        <div className="relative w-full h-[600px] flex items-center justify-center">
          {/* Carcasa superior */}
          <motion.div
            style={{
              y: useTransform(explodeFactor, [0, 1], [0, -150]),
              rotateX: useTransform(explodeFactor, [0, 1], [0, 15]),
            }}
            className="absolute"
          >
            <div className="w-64 h-32 bg-gradient-to-br from-purple-300 to-pink-300 rounded-t-[3rem] opacity-80 backdrop-blur-sm border-2 border-white/30 shadow-2xl" />
            <FloatingLabel 
              show={explodeFactor} 
              text="Tela suave al tacto"
              delay={0.2}
            />
          </motion.div>

          {/* Chip Central (Corazón) */}
          <motion.div
            style={{
              scale: useTransform(explodeFactor, [0, 1], [1, 1.3]),
            }}
            className="absolute"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                  '0 0 60px rgba(139, 92, 246, 0.9)',
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-purple-300"
            >
              <Cpu className="w-16 h-16 text-white" />
            </motion.div>
            <FloatingLabel 
              show={explodeFactor} 
              text="Chip de IA Local"
              delay={0.4}
              position="left"
            />
          </motion.div>

          {/* Micrófono */}
          <motion.div
            style={{
              x: useTransform(explodeFactor, [0, 1], [0, -200]),
              y: useTransform(explodeFactor, [0, 1], [0, 50]),
            }}
            className="absolute"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl border-2 border-cyan-200">
              <Mic className="w-10 h-10 text-white" />
            </div>
            <FloatingLabel 
              show={explodeFactor} 
              text="Cancelación de ruido"
              delay={0.6}
            />
          </motion.div>

          {/* Altavoz */}
          <motion.div
            style={{
              x: useTransform(explodeFactor, [0, 1], [0, 200]),
              y: useTransform(explodeFactor, [0, 1], [0, 50]),
            }}
            className="absolute"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-xl border-2 border-pink-200">
              <Volume2 className="w-10 h-10 text-white" />
            </div>
            <FloatingLabel 
              show={explodeFactor} 
              text="Audio HD 360°"
              delay={0.8}
              position="right"
            />
          </motion.div>

          {/* Base */}
          <motion.div
            style={{
              y: useTransform(explodeFactor, [0, 1], [0, 150]),
            }}
            className="absolute"
          >
            <div className="w-72 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-b-[3rem] opacity-90 shadow-2xl border-2 border-slate-600" />
            <FloatingLabel 
              show={explodeFactor} 
              text="LED de estado emocional"
              delay={1}
            />
          </motion.div>
        </div>

        {/* Texto ventaja clave */}
        <motion.div
          style={{
            opacity: useTransform(scrollProgress, [sectionEnd - 0.1, sectionEnd], [0, 1])
          }}
          className="text-center mt-20"
        >
          <h3 className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Aprendizaje sin Pantallas
          </h3>
          <p className="text-xl text-slate-400 mt-4">Cuida sus ojos. Estimula su imaginación.</p>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ============ SOFTWARE SECTION ============
function SoftwareSection({ scrollProgress, mousePosition }) {
  const sectionStart = 0.5;
  const sectionEnd = 0.75;
  
  const opacity = useTransform(scrollProgress, [sectionStart - 0.05, sectionStart, sectionEnd, sectionEnd + 0.05], [0, 1, 1, 0]);
  const chipTravel = useTransform(scrollProgress, [sectionStart, sectionStart + 0.1], [0, 1]);

  const screenshots = [
    { title: 'Dashboard Padres', emoji: '🛡️', gradient: 'from-green-400 to-emerald-600', depth: 0 },
    { title: 'Chat con Lia', emoji: '💬', gradient: 'from-purple-400 to-pink-600', depth: 50 },
    { title: 'Libros SEP', emoji: '📚', gradient: 'from-blue-400 to-cyan-600', depth: 100 },
  ];

  return (
    <motion.section 
      style={{ opacity }}
      className="relative min-h-screen flex items-center justify-center py-20"
    >
      <div className="relative w-full max-w-6xl mx-auto px-6">
        <motion.h2
          style={{
            opacity: useTransform(scrollProgress, [sectionStart, sectionStart + 0.05], [0, 1])
          }}
          className="text-5xl md:text-7xl font-black text-white text-center mb-20"
        >
          Sofia Digital
        </motion.h2>

        {/* Animación del chip viajando */}
        <div className="relative h-[500px] flex items-center justify-center">
          <motion.div
            style={{
              x: useTransform(chipTravel, [0, 1], [-300, 0]),
              opacity: useTransform(chipTravel, [0, 0.5, 1], [1, 0.5, 0]),
            }}
            className="absolute"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Cpu className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Teléfono 3D */}
          <motion.div
            style={{
              opacity: useTransform(chipTravel, [0.5, 1], [0, 1]),
              scale: useTransform(chipTravel, [0.5, 1], [0.8, 1]),
            }}
            className="relative"
          >
            <div className="w-72 h-[600px] bg-gradient-to-br from-slate-800 to-slate-950 rounded-[3rem] p-4 shadow-2xl border-4 border-slate-700 relative overflow-hidden">
              {/* Pantalla */}
              <div className="w-full h-full bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 rounded-[2rem] overflow-hidden relative">
                {/* Screenshots carousel con parallax */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {screenshots.map((screen, i) => (
                    <motion.div
                      key={i}
                      style={{
                        x: useTransform(scrollProgress, [sectionStart + 0.1, sectionEnd], [screen.depth - 150, screen.depth + 150]),
                        rotateY: (mousePosition.x - window.innerWidth / 2) / 50,
                        rotateX: -(mousePosition.y - window.innerHeight / 2) / 50,
                      }}
                      className={`absolute w-48 h-64 bg-gradient-to-br ${screen.gradient} rounded-2xl shadow-2xl border-2 border-white/50 flex flex-col items-center justify-center p-4`}
                      whileHover={{ scale: 1.05, zIndex: 10 }}
                    >
                      <span className="text-6xl mb-4">{screen.emoji}</span>
                      <h4 className="text-white font-bold text-center">{screen.title}</h4>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl" />
            </div>
          </motion.div>
        </div>

        <motion.p
          style={{
            opacity: useTransform(scrollProgress, [sectionEnd - 0.1, sectionEnd], [0, 1])
          }}
          className="text-center text-2xl text-slate-300 mt-16"
        >
          La misma IA poderosa. Ahora en tu bolsillo.
        </motion.p>
      </div>
    </motion.section>
  );
}

// ============ COMPARISON SECTION ============
function ComparisonSection({ navigate }) {
  const features = [
    { name: 'Chatbot IA Educativo', digital: true, hardware: true, hardwareExtra: 'Voz Natural' },
    { name: 'Libros SEP', digital: true, hardware: true, hardwareExtra: 'Lectura en voz alta' },
    { name: 'Dashboard Padres', digital: true, hardware: true },
    { name: 'Experiencia sin Pantallas', digital: false, hardware: true, exclusive: true },
    { name: 'Modo Cuentacuentos Nocturno', digital: false, hardware: true, exclusive: true },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-black text-white text-center mb-16"
        >
          Elige tu Ecosistema
        </motion.h2>

        {/* Tabla comparativa con glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-slate-400 font-medium">Característica</div>
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400 mb-1">Sofia Digital</div>
              <div className="text-sm text-slate-500">App</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                Sofia Hardware
              </div>
              <div className="text-sm text-slate-500">Bocina + App</div>
            </div>
          </div>

          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`grid grid-cols-3 gap-4 py-4 border-t border-white/5 ${
                feature.exclusive ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 -mx-4 px-4 rounded-lg' : ''
              }`}
            >
              <div className="text-white font-medium flex items-center gap-2">
                {feature.name}
                {feature.exclusive && <Sparkles className="w-4 h-4 text-yellow-400" />}
              </div>
              <div className="text-center">
                {feature.digital ? (
                  <Check className="w-6 h-6 text-green-400 mx-auto" />
                ) : (
                  <X className="w-6 h-6 text-slate-600 mx-auto" />
                )}
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <Check className="w-6 h-6 text-green-400" />
                  {feature.hardwareExtra && (
                    <span className="text-xs text-purple-400">({feature.hardwareExtra})</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-6 justify-center mt-16"
        >
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            size="lg"
            className="text-lg px-10 py-7 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-xl shadow-cyan-500/30"
          >
            Probar App Gratis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-lg px-10 py-7 rounded-2xl font-semibold overflow-hidden group"
          >
            <motion.div
              animate={{
                background: [
                  'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
                  'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
                  'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0"
            />
            <span className="relative z-10 text-slate-950 flex items-center gap-2">
              Comprar Bocina Sofia
              <Sparkles className="w-5 h-5" />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ============ COMPONENTES AUXILIARES ============
function FloatingLabel({ show, text, delay = 0, position = 'top' }) {
  const positions = {
    top: 'top-0 -translate-y-full',
    left: 'left-0 -translate-x-full top-1/2 -translate-y-1/2',
    right: 'right-0 translate-x-full top-1/2 -translate-y-1/2',
  };

  return (
    <motion.div
      style={{
        opacity: useTransform(show, [0, 0.3], [0, 1]),
        y: useTransform(show, [0, 0.3], [20, 0]),
      }}
      className={`absolute ${positions[position] || positions.top} whitespace-nowrap`}
    >
      <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
        <p className="text-sm text-white font-medium">{text}</p>
      </div>
      <svg className="absolute left-1/2 -translate-x-1/2 -bottom-2" width="12" height="8" viewBox="0 0 12 8">
        <path d="M6 8L0 0h12z" fill="rgba(255,255,255,0.1)" />
      </svg>
    </motion.div>
  );
}