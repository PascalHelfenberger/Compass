'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ArrowApp() {
  const [alpha, setAlpha] = useState<number | null>(null)
  const [beta, setBeta] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)
  const [rotation, setRotation] = useState(0)
  const [initialBeta, setInitialBeta] = useState<number | null>(null)
  const [initialGamma, setInitialGamma] = useState<number | null>(null)
  const [status, setStatus] = useState('Initializing...')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('warning')
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha: a, beta: b, gamma: g } = event

      setAlpha(a)
      setBeta(b)
      setGamma(g)

      // Use beta and gamma for calculating rotation when phone is held upright
      if (b !== null && g !== null) {
        if (initialBeta === null || initialGamma === null) {
          setInitialBeta(b)
          setInitialGamma(g)
          setStatus('Tracking active!')
          setStatusType('success')
        }

        // Calculate rotation based on change in beta and gamma
        // atan2 gives us the angle in the 2D plane
        const currentAngle = Math.atan2(g, b) * (180 / Math.PI)
        const initialAngle = Math.atan2(initialGamma || g, initialBeta || b) * (180 / Math.PI)
        const currentRotation = initialAngle - currentAngle
        setRotation(currentRotation)
      }
    }

    const requestPermissionIOS = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
            setShowButton(false)
            setStatus('Permission granted. Waiting for data...')
            setStatusType('success')
          } else {
            setStatus('Permission denied')
            setStatusType('error')
          }
        } catch (error) {
          setStatus(`Error: ${(error as Error).message}`)
          setStatusType('error')
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation)
        setStatus('Waiting for orientation data...')
        setStatusType('warning')
      }
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setShowButton(true)
      setStatus('Click button to enable orientation tracking')
      setStatusType('warning')
    } else {
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation)
        setStatus('Waiting for orientation data...')
        setStatusType('warning')
      } else {
        setStatus('DeviceOrientation not supported')
        setStatusType('error')
      }
    }

    const timeoutId = setTimeout(() => {
      if ((initialBeta === null || initialGamma === null) && status === 'Waiting for orientation data...') {
        setStatus('No orientation data received. Make sure sensors are enabled.')
        setStatusType('error')
      }
    }, 3000)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      clearTimeout(timeoutId)
    }
  }, [initialBeta, initialGamma, status])

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setShowButton(false)
          setStatus('Permission granted. Waiting for data...')
          setStatusType('success')
        }
      } catch (error) {
        setStatus(`Error: ${(error as Error).message}`)
        setStatusType('error')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c8adcff 0%, #06cdc6ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Link href="/" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '24px'
      }}>
        ← Back
      </Link>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Arrow Direction Tracker</h1>
        <p style={{ fontSize: '14px', marginBottom: '30px', opacity: 0.9 }}>
          The arrow points to the initial top of the viewport
        </p>

        <div style={{
          width: '300px',
          height: '300px',
          position: 'relative',
          margin: '0 auto'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: 'transform 0.1s ease-out'
          }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
            }}>
              <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 50 10 L 80 60 L 65 60 L 65 90 L 35 90 L 35 60 L 20 60 Z"
                fill="url(#arrowGradient)"
                stroke="#333"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {showButton && (
          <button
            onClick={handleRequestPermission}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Enable Orientation
          </button>
        )}

        <div style={{
          marginTop: '30px',
          fontSize: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '300px'
        }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Alpha (Z-axis):</strong> {alpha !== null ? alpha.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Beta (X-axis):</strong> {beta !== null ? beta.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Gamma (Y-axis):</strong> {gamma !== null ? gamma.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Arrow Rotation:</strong> {rotation.toFixed(1)}°
          </p>
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: statusType === 'success' ? 'rgba(0, 255, 0, 0.3)' :
                        statusType === 'error' ? 'rgba(255, 0, 0, 0.3)' :
                        'rgba(255, 255, 255, 0.2)',
            borderRadius: '5px'
          }}>
            {status}
          </div>
        </div>
      </div>
    </div>
  )
}
