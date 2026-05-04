import { motion } from 'framer-motion'
import FootballLoader from './FootballLoader'

interface Props {
  text?: string
}

export default function PageLoader({ text }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-950 flex items-center justify-center"
    >
      <FootballLoader text={text} />
    </motion.div>
  )
}
