'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface TemplateImage {
  name: string
  path: string
}

export default function HomePage() {
  const [images, setImages] = useState<TemplateImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadImages() {
      try {
        const res = await fetch('/api/templates')
        if (res.ok) {
          const data = await res.json()
          setImages(data.images || [])
        }
      } catch (error) {
        console.log('[v0] Error loading template images:', error)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #1a1a1a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #2a2a2a'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e5e5e5' }}>M</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#e5e5e5' }}>MuyMuy AI</h1>
        </div>
        <Link href="/chat" style={{
          padding: '12px 24px',
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          color: '#e5e5e5',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Ir al Chat
        </Link>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #333 0%, #1a1a1a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          border: '1px solid #2a2a2a'
        }}>
          <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#e5e5e5' }}>M</span>
        </div>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#e5e5e5',
          marginBottom: '20px',
          lineHeight: '1.2'
        }}>
          Bienvenido a MuyMuy AI
        </h2>
        <p style={{
          fontSize: '18px',
          color: '#737373',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.7'
        }}>
          Una plataforma de chat AI cifrada y segura. Personaliza tu experiencia con prompts 
          personalizados, edita mensajes y mantén un historial completo de tus conversaciones.
        </p>
        <Link href="/chat" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 32px',
          background: '#e5e5e5',
          color: '#0a0a0a',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}>
          Comenzar a chatear
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#e5e5e5',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          Características
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            }
            title="Cifrado Seguro"
            description="Todas tus conversaciones están protegidas con cifrado de extremo a extremo."
          />
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            }
            title="Edición de Mensajes"
            description="Edita tus mensajes y regenera respuestas en cualquier momento."
          />
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"/>
                <line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/>
                <line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            }
            title="Prompts Personalizados"
            description="Configura instrucciones personalizadas para adaptar la IA a tus necesidades."
          />
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
            title="Historial Completo"
            description="Accede a todas tus conversaciones anteriores cuando lo necesites."
          />
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
            title="Múltiples Chats"
            description="Crea y gestiona múltiples conversaciones simultáneamente."
          />
          <FeatureCard 
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <polyline points="23 20 23 14 17 14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            }
            title="Regenerar Respuestas"
            description="No te gustó la respuesta? Regenera desde cualquier punto de la conversación."
          />
        </div>
      </section>

      {/* Templates Gallery */}
      <section style={{
        padding: '60px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#e5e5e5',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Galería de Templates
        </h3>
        <p style={{
          fontSize: '16px',
          color: '#737373',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          Explora ejemplos y casos de uso de MuyMuy AI
        </p>
        
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '60px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #2a2a2a',
              borderTopColor: '#e5e5e5',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}/>
          </div>
        ) : images.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {images.map((img) => (
              <div key={img.name} style={{
                background: '#141414',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #2a2a2a',
                transition: 'all 0.2s'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  background: '#1a1a1a'
                }}>
                  <Image 
                    src={img.path} 
                    alt={img.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{
                    color: '#a3a3a3',
                    fontSize: '14px',
                    wordBreak: 'break-all'
                  }}>
                    {img.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: '#141414',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #2a2a2a'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ color: '#737373', fontSize: '16px' }}>
              No hay imágenes en /templates todavía
            </p>
            <p style={{ color: '#525252', fontSize: '14px', marginTop: '8px' }}>
              Añade imágenes PNG o JPG a la carpeta templates
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid #1a1a1a',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <p style={{ color: '#525252', fontSize: '14px' }}>
          MuyMuy AI - Chat Cifrado con CoreHub
        </p>
      </footer>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div style={{
      background: '#141414',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #2a2a2a',
      transition: 'all 0.2s'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: '#a3a3a3'
      }}>
        {icon}
      </div>
      <h4 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#e5e5e5',
        marginBottom: '8px'
      }}>
        {title}
      </h4>
      <p style={{
        fontSize: '14px',
        color: '#737373',
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </div>
  )
}
