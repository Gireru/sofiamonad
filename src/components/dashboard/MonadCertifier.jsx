import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function MonadCertifier() {
  const [certified, setCertified] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setCertified(true)}
        className="w-full rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-lg shadow-purple-300/40 text-white font-semibold"
      >
        ⛓️ Certificar logro en Monad
      </Button>

      <AnimatePresence>
        {certified && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-300 text-green-700 rounded-2xl px-4 py-3 text-sm font-medium"
          >
            ✅ Logro certificado en Monad Testnet — Hash: 0x453...2a75a
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}