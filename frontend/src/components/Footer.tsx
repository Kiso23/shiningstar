import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  
  // Color variables matching HomePage
  const bg = '#080c08'
  const bgDark = '#050a05'
  const border = 'rgba(255,255,255,0.06)'
  const textMain = '#f0f4f0'
  const textMute = '#6b7a6b'

  const footerSections = [
    {
      title: 'Acts and Policies',
      links: [
        { label: 'Tournament Regulation', href: '#' },
        { label: 'University Act', href: '#' },
        { label: 'Refund Policy', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
      ]
    },

    {
      title: 'Follow Us On',
      links: [
        { label: 'Facebook', href: 'https://www.facebook.com/share/g/17jJ3n6gXt/', icon: Facebook, color: '#1877f2' },
        { label: 'Instagram', href: 'https://www.instagram.com/shiningstarunitedfc_official?igsh=Y2NiYzBiOTh4MmM%3D&utm_source=qr', icon: Instagram, color: '#E4405F' },
      ]
    }
  ]

  const contactInfo = [
    { icon: MapPin, label: 'Location', value: 'Hamren, Assam, India', color: '#22c55e' },
    { icon: Phone, label: 'Phone', value: '+91 88227 16085', color: '#06b6d4' },
    { icon: Mail, label: 'Email', value: 'info@shiningstarunitedfc.com', color: '#a78bfa' },
  ]

  return (
    <footer style={{ backgroundColor: bgDark, borderTopColor: border }} className="border-t py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SSU" className="w-10 h-10 rounded-full object-cover border-2 border-green-500/40" />
              <div>
                <p style={{ color: textMain }} className="font-black text-base">SHINING STAR</p>
                <p className="text-green-400 font-bold text-xs">UNITED FC</p>
              </div>
            </div>
            <p style={{ color: textMute }} className="text-xs leading-relaxed">
              Representing Hamren with pride. A community-driven football club committed to excellence and fair play.
            </p>
            <p style={{ color: textMute }} className="text-xs font-medium">
              © 2025 Shining Star United FC. All rights reserved.
            </p>
          </motion.div>

          {/* Footer Link Sections */}
          {footerSections.slice(0, 1).map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx + 1) * 0.1 }}
              className="flex flex-col gap-4"
            >
              <h3 style={{ color: textMain }} className="font-black text-sm uppercase tracking-wide">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ color: textMute }}
                      className="text-xs hover:text-green-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social Media & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <h3 style={{ color: textMain }} className="font-black text-sm uppercase tracking-wide">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/share/g/17jJ3n6gXt/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: 'rgba(24,119,242,0.15)',
                  border: '1px solid rgba(24,119,242,0.3)',
                }}
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/shiningstarunitedfc_official?igsh=Y2NiYzBiOTh4MmM%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: 'rgba(225,48,108,0.15)',
                  border: '1px solid rgba(225,48,108,0.3)',
                }}
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="url(#ig-gradient-footer)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="ig-gradient-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f09433" />
                      <stop offset="25%" stopColor="#e6683c" />
                      <stop offset="50%" stopColor="#dc2743" />
                      <stop offset="75%" stopColor="#cc2366" />
                      <stop offset="100%" stopColor="#bc1888" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
            <div className="text-xs mt-2">
              <p style={{ color: textMute }} className="mb-2">Connect with us on social media</p>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div style={{ borderTopColor: border }} className="border-t my-8" />

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 style={{ color: textMain }} className="font-black text-sm uppercase tracking-wide mb-6">Contact Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactInfo.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, borderWidth: 1 }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: textMute }} className="text-xs font-semibold uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p style={{ color: textMain }} className="text-sm font-medium">
                    {label === 'Email' ? (
                      <a href={`mailto:${value}`} className="hover:text-green-400 transition-colors">
                        {value}
                      </a>
                    ) : label === 'Phone' ? (
                      <a href={`tel:${value.replace(/\s/g, '')}`} className="hover:text-green-400 transition-colors">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ borderTopColor: border }} className="border-t my-8" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        >
          <p style={{ color: textMute }}>
            Developed and maintained by <span className="text-green-400 font-semibold">Sarlongki Teron (SDE)</span>
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Fixtures', path: '/fixtures' },
              { label: 'Leaderboard', path: '/leaderboard' },
              { label: 'Live', path: '/live' },
              { label: 'Admin', path: '/admin/login' },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{ color: textMute }}
                className="hover:text-green-400 transition-colors duration-200"
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
