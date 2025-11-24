'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type CompassMethod = 'webkit' | 'absolute' | 'magnetometer' | null

export default function CompassApp() {
  const [heading, setHeading] = useState(0)
  const [alpha, setAlpha] = useState<number | null>(null)
  const [absolute, setAbsolute] = useState(false)
  const [method, setMethod] = useState<string>('Not started')
  const [status, setStatus] = useState('Initializing...')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('warning')
  const [showButton, setShowButton] = useState(false)
  const [browser, setBrowser] = useState('Unknown')
  const [activeMethod, setActiveMethod] = useState<CompassMethod>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent
    let detectedBrowser = 'Unknown'
    if (ua.includes('Chrome') && !ua.includes('Edge')) detectedBrowser = 'Chrome/Android'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) detectedBrowser = 'Safari/iOS'
    else if (ua.includes('Firefox')) detectedBrowser = 'Firefox'
    setBrowser(detectedBrowser)
  }, [])

  const updateCompass = (newHeading: number) => {
    setHeading(newHeading)
  }

  const startWebkitCompass = () => {
    if (typeof window === 'undefined') return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as any).webkitCompassHeading
      if (webkitHeading !== undefined) {
        const newHeading = 360 - webkitHeading
        updateCompass(newHeading)

        if (statusType !== 'success') {
          setStatus('Tracking with webkitCompassHeading')
          setStatusType('success')
        }
      } else {
        setStatus('webkitCompassHeading not available')
        setStatusType('error')
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    setMethod('webkitCompassHeading')
    setActiveMethod('webkit')
  }

  const startAbsoluteOrientation = () => {
    if (typeof window === 'undefined') return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setAlpha(event.alpha)
      setAbsolute(event.absolute || false)

      if (event.absolute && event.alpha !== null) {
        const newHeading = 360 - event.alpha
        updateCompass(newHeading)

        if (statusType !== 'success') {
          setStatus('Tracking with absolute orientation')
          setStatusType('success')
        }
      } else {
        setStatus('Absolute orientation not available')
        setStatusType('warning')
      }
    }

    window.addEventListener('deviceorientationabsolute', handleOrientation)
    window.addEventListener('deviceorientation', handleOrientation)
    setMethod('Absolute Alpha')
    setActiveMethod('absolute')
  }

  const startMagnetometer = async () => {
    if (typeof window === 'undefined') return

    if ('Magnetometer' in window) {
      try {
        const Magnetometer = (window as any).Magnetometer
        const magnetometer = new Magnetometer({ frequency: 60 })

        magnetometer.addEventListener('reading', () => {
          const magX = magnetometer.x
          const magY = magnetometer.y

          if (magX !== undefined && magY !== undefined) {
            let newHeading = Math.atan2(magY, magX) * (180 / Math.PI)
            newHeading = (newHeading + 360) % 360
            updateCompass(360 - newHeading)

            if (statusType !== 'success') {
              setStatus('Tracking with Magnetometer API')
              setStatusType('success')
            }
          }
        })

        await magnetometer.start()
        setMethod('Magnetometer API')
        setActiveMethod('magnetometer')
        setStatus('Magnetometer started')
        setStatusType('success')
      } catch (error) {
        setStatus(`Magnetometer error: ${(error as Error).message}`)
        setStatusType('error')
      }
    } else {
      setStatus('Magnetometer API not supported')
      setStatusType('error')
    }
  }

  const autoStart = async () => {
    if (browser.includes('Safari')) {
      startWebkitCompass()
    } else if (browser.includes('Chrome')) {
      startAbsoluteOrientation()
    } else {
      setStatus('Please select a method above')
      setStatusType('warning')
    }
  }

  const requestPermissionIOS = async () => {
    if (typeof window === 'undefined') return

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          setShowButton(false)
          await autoStart()
        } else {
          setStatus('Permission denied')
          setStatusType('error')
        }
      } catch (error) {
        setStatus(`Error: ${(error as Error).message}`)
        setStatusType('error')
      }
    } else {
      await autoStart()
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setShowButton(true)
      setStatus('Click button to enable sensors')
      setStatusType('warning')
    } else {
      autoStart()
    }
  }, [browser])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
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
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Compass App</h1>
        <p style={{ fontSize: '14px', marginBottom: '30px', opacity: 0.9 }}>
          Arrow points North
        </p>

        <div style={{
          width: '300px',
          height: '300px',
          position: 'relative',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', fontWeight: 'bold', color: '#ff4444' }}>N</div>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: 'bold' }}>E</div>
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', fontWeight: 'bold' }}>S</div>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: 'bold' }}>W</div>

            <div style={{
              width: '80px',
              height: '80px',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${heading}deg)`,
              transition: 'transform 0.2s ease-out'
            }}>
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))'
              }}>
                <defs>
                  <linearGradient id="northGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ff4444', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#cc0000', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="southGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="50%" style={{ stopColor: '#cccccc', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#888888', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path d="M 50 10 L 65 50 L 50 45 L 35 50 Z" fill="url(#northGradient)" stroke="#660000" strokeWidth="1" />
                <path d="M 50 90 L 65 50 L 50 55 L 35 50 Z" fill="url(#southGradient)" stroke="#333333" strokeWidth="1" />
                <circle cx="50" cy="50" r="8" fill="white" stroke="#333" strokeWidth="2" />
              </svg>
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              marginTop: '50px',
              fontSize: '32px',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              {Math.round(heading)}°
            </div>
          </div>
        </div>

        <div style={{
          margin: '15px 0',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={startWebkitCompass}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: activeMethod === 'webkit' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
              border: activeMethod === 'webkit' ? '2px solid #4CAF50' : '2px solid white',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            webkitCompassHeading
          </button>
          <button
            onClick={startAbsoluteOrientation}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: activeMethod === 'absolute' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
              border: activeMethod === 'absolute' ? '2px solid #4CAF50' : '2px solid white',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Absolute Alpha
          </button>
          <button
            onClick={startMagnetometer}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              background: activeMethod === 'magnetometer' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
              border: activeMethod === 'magnetometer' ? '2px solid #4CAF50' : '2px solid white',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Magnetometer API
          </button>
        </div>

        {showButton && (
          <button
            onClick={requestPermissionIOS}
            style={{
              marginTop: '15px',
              padding: '12px 24px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid white',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Enable Sensors
          </button>
        )}

        <div style={{
          marginTop: '30px',
          fontSize: '12px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '350px'
        }}>
          <p style={{ margin: '5px 0' }}>
            <strong>Method:</strong> {method}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Heading:</strong> {heading.toFixed(1)}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Alpha:</strong> {alpha !== null ? alpha.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Absolute:</strong> {absolute ? 'true' : 'false'}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Browser:</strong> {browser}
          </p>
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: statusType === 'success' ? 'rgba(0, 255, 0, 0.3)' :
                        statusType === 'error' ? 'rgba(255, 0, 0, 0.3)' :
                        'rgba(255, 165, 0, 0.3)',
            borderRadius: '5px'
          }}>
            {status}
          </div>
        </div>
      </div>
    </div>
  )
}
