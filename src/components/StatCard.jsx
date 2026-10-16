/**
 * StatCard.jsx — Compact statistics display card.
 */
import { motion } from 'motion/react'

export default function StatCard({ icon: Icon, label, value, unit, trend, pending = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-junction-card border border-junction-border rounded-lg p-3 flex flex-col gap-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-junction-accent" />}
          <span className="text-[10px] font-medium text-junction-muted uppercase tracking-wider">{label}</span>
        </div>
        {trend && (
          <span className={`text-[10px] font-medium ${trend === 'up' ? 'text-junction-green' : trend === 'down' ? 'text-junction-red' : 'text-junction-muted'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '–'}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        {pending ? (
          <span className="text-sm text-junction-muted italic">Awaiting data</span>
        ) : (
          <>
            <span className="text-xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs text-junction-muted">{unit}</span>}
          </>
        )}
      </div>
    </motion.div>
  )
}
