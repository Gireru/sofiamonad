import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, Zap } from 'lucide-react';
import Avatar3D from '@/components/avatars/Avatar3D';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ClassGrid({ students = [], onSelectStudent }) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-700">
          <Users className="w-5 h-5" />
          Lista de Clase ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Estudiante</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Última Conexión</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-slate-600">Tema Actual</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-slate-600">XP</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelectStudent?.(student)}
                    className="border-b border-slate-100 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <Avatar3D type={student.avatar_type} size="sm" state="idle" />
                        <div>
                          <p className="font-medium text-slate-800">{student.display_name}</p>
                          <p className="text-xs text-slate-500">
                            {student.grade?.replace('_', '° ').replace('primaria', 'Pri').replace('secundaria', 'Sec')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {student.lastActive ? format(new Date(student.lastActive), 'dd MMM', { locale: es }) : 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs">
                        {student.currentTopic || 'Sin actividad'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-600 font-medium">
                        <Zap className="w-4 h-4" />
                        {student.xp_points || 0}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sin estudiantes vinculados</p>
            <p className="text-sm">Ingresa códigos de invitación para comenzar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}