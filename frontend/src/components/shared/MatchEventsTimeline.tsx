import { motion, AnimatePresence } from 'framer-motion'
import { Goal, AlertTriangle, AlertCircle, Repeat2, Zap } from 'lucide-react'
import type { MatchEventResponse } from '../../api/matchEvents'

interface MatchEventsTimelineProps {
  events: MatchEventResponse[]
  teamAName: string
  teamBName: string
}

export default function MatchEventsTimeline({
  events,
  teamAName,
  teamBName,
}: MatchEventsTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No events recorded yet</p>
      </div>
    )
  }

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => a.time_minute - b.time_minute)

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Goal className="w-4 h-4 text-green-400" />
      case 'yellow_card':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'red_card':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case 'substitution':
        return <Repeat2 className="w-4 h-4 text-blue-400" />
      case 'own_goal':
        return <Zap className="w-4 h-4 text-orange-400" />
      default:
        return <Zap className="w-4 h-4 text-gray-400" />
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'Goal'
      case 'yellow_card':
        return 'Yellow Card'
      case 'red_card':
        return 'Red Card'
      case 'substitution':
        return 'Substitution'
      case 'own_goal':
        return 'Own Goal'
      default:
        return 'Event'
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'text-green-400 border-green-400/30'
      case 'yellow_card':
        return 'text-yellow-400 border-yellow-400/30'
      case 'red_card':
        return 'text-red-400 border-red-400/30'
      case 'substitution':
        return 'text-blue-400 border-blue-400/30'
      case 'own_goal':
        return 'text-orange-400 border-orange-400/30'
      default:
        return 'text-gray-400 border-gray-400/30'
    }
  }

  const isTeamA = (team: string) => team === 'team_a'

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sortedEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: isTeamA(event.team) ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-3 py-3 px-3 rounded-lg border ${getEventColor(
              event.event_type
            )} bg-gray-900/50 border-opacity-50 ${
              isTeamA(event.team) ? 'flex-row-reverse text-right' : 'text-left'
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">{getEventIcon(event.event_type)}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 justify-between">
                <div>
                  <p className="font-semibold text-white text-sm truncate">
                    {event.player_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isTeamA(event.team) ? teamAName : teamBName}
                  </p>
                </div>
              </div>
              {event.player_replaced && (
                <p className="text-xs text-gray-500 mt-1">
                  {event.player_replaced === 'in' ? 'Substituted in' : 'Replaced by'} {event.player_replaced}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-sm">{event.time_minute}'</p>
              <p className="text-xs text-gray-500">{getEventLabel(event.event_type)}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
