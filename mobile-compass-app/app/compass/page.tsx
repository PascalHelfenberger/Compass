'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type CompassMethod = 'webkit' | 'absolute' | 'magnetometer' | null

export default function CompassApp() {
  const [heading, setHeading] = useState(0)
  const [smoothedHeading, setSmoothedHeading] = useState(0)
  const [alpha, setAlpha] = useState<number | null>(null)
  const [beta, setBeta] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)
  const [absolute, setAbsolute] = useState(false)
  const [method, setMethod] = useState<string>('Not started')
  const [status, setStatus] = useState('Initializing...')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('warning')
  const [showButton, setShowButton] = useState(false)
  const [browser, setBrowser] = useState('Unknown')
  const [activeMethod, setActiveMethod] = useState<CompassMethod>(null)
  const [headingHistory, setHeadingHistory] = useState<number[]>([])

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

  const smoothHeading = (newHeading: number) => {
    // Normalize heading to 0-360
    newHeading = ((newHeading % 360) + 360) % 360

    // Update history with new heading
    setHeadingHistory(prevHistory => {
      const newHistory = [...prevHistory, newHeading]

      // Keep only last 5 readings for smoothing
      if (newHistory.length > 5) {
        newHistory.shift()
      }

      // Calculate average, handling circular nature of angles
      if (newHistory.length > 0) {
        let sumSin = 0
        let sumCos = 0

        newHistory.forEach(h => {
          sumSin += Math.sin(h * Math.PI / 180)
          sumCos += Math.cos(h * Math.PI / 180)
        })

        const avgSin = sumSin / newHistory.length
        const avgCos = sumCos / newHistory.length
        let avgHeading = Math.atan2(avgSin, avgCos) * 180 / Math.PI
        avgHeading = ((avgHeading % 360) + 360) % 360

        setSmoothedHeading(avgHeading)
      }

      return newHistory
    })

    setHeading(newHeading)
  }

  const updateCompass = (newHeading: number) => {
    smoothHeading(newHeading)
  }

  const startWebkitCompass = () => {
    if (typeof window === 'undefined') return

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as any).webkitCompassHeading
      if (webkitHeading !== undefined) {
        // webkitCompassHeading gives true north heading (0-360)
        // No need to invert, use directly
        updateCompass(webkitHeading)

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
      setBeta(event.beta)
      setGamma(event.gamma)
      setAbsolute(event.absolute || false)

      if (event.absolute && event.alpha !== null) {
        // For absolute orientation on Android:
        // Alpha is 0-360 where 0 is north
        // The device must be held flat (parallel to ground) for accurate readings
        // When held upright, we need to compensate with beta/gamma

        let compassHeading = event.alpha

        // If device is significantly tilted (not flat), adjust using beta and gamma
        if (event.beta !== null && event.gamma !== null) {
          const betaRad = event.beta * Math.PI / 180
          const gammaRad = event.gamma * Math.PI / 180

          // Tilt compensation formula
          const tiltAngle = Math.atan2(
            Math.sin(gammaRad),
            Math.sin(betaRad) * Math.cos(gammaRad)
          ) * 180 / Math.PI

          // Apply compensation when device is upright
          if (Math.abs(event.beta) > 45) {
            compassHeading = (compassHeading + tiltAngle) % 360
          }
        }

        updateCompass(compassHeading)

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
            // Calculate heading from magnetometer values
            // atan2(y, x) gives angle from east, convert to north
            let newHeading = Math.atan2(magY, magX) * (180 / Math.PI)

            // Convert from math angle (0=east, counter-clockwise) to compass (0=north, clockwise)
            newHeading = 90 - newHeading
            newHeading = (newHeading + 360) % 360

            updateCompass(newHeading)

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
          width: '340px',
          height: '340px',
          position: 'relative',
          margin: '0 auto'
        }}>
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4))'
          }}>
            <defs>
              <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="70%" style={{ stopColor: '#f5f5f5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
              </radialGradient>
              <linearGradient id="compassRing" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#2c2c2c', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#1a1a1a', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Outer ring */}
            <circle cx="200" cy="200" r="195" fill="url(#compassRing)" />
            <circle cx="200" cy="200" r="185" fill="none" stroke="#4a4a4a" strokeWidth="2" />

            {/* Main compass face */}
            <circle cx="200" cy="200" r="175" fill="url(#compassBg)" stroke="#2c2c2c" strokeWidth="3" />

            {/* Degree markings */}
            {Array.from({ length: 72 }).map((_, i) => {
              const angle = i * 5
              const isMajor = angle % 30 === 0
              const isCardinal = angle % 90 === 0
              const rad = (angle - 90) * Math.PI / 180
              const r1 = isCardinal ? 145 : isMajor ? 150 : 160
              const r2 = 175
              const x1 = 200 + r1 * Math.cos(rad)
              const y1 = 200 + r1 * Math.sin(rad)
              const x2 = 200 + r2 * Math.cos(rad)
              const y2 = 200 + r2 * Math.sin(rad)

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCardinal ? "#d32f2f" : isMajor ? "#333" : "#999"}
                  strokeWidth={isCardinal ? "3" : isMajor ? "2" : "1"}
                />
              )
            })}

            {/* Inner decorative rings */}
            <circle cx="200" cy="200" r="130" fill="none" stroke="#ccc" strokeWidth="1" />
            <circle cx="200" cy="200" r="125" fill="none" stroke="#999" strokeWidth="2" />
            <circle cx="200" cy="200" r="115" fill="none" stroke="#ccc" strokeWidth="1" />

            {/* Decorative star pattern */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45
              const rad = (angle - 90) * Math.PI / 180
              const r = 110
              const x = 200 + r * Math.cos(rad)
              const y = 200 + r * Math.sin(rad)

              return (
                <line
                  key={`star${i}`}
                  x1={200}
                  y1={200}
                  x2={x}
                  y2={y}
                  stroke="#ddd"
                  strokeWidth="1"
                  opacity="0.5"
                />
              )
            })}

            {/* Cardinal directions */}
            <text x="200" y="30" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#d32f2f" fontFamily="Georgia, serif">N</text>

            {/* E with white stroke */}
            <text x="370" y="210" textAnchor="middle" fontSize="28" fontWeight="bold" fill="white" stroke="white" strokeWidth="6" fontFamily="Georgia, serif">E</text>
            <text x="370" y="210" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#333" fontFamily="Georgia, serif">E</text>

            {/* S with white stroke */}
            <text x="200" y="380" textAnchor="middle" fontSize="28" fontWeight="bold" fill="white" stroke="white" strokeWidth="6" fontFamily="Georgia, serif">S</text>
            <text x="200" y="380" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#333" fontFamily="Georgia, serif">S</text>

            {/* W with white stroke */}
            <text x="30" y="210" textAnchor="middle" fontSize="28" fontWeight="bold" fill="white" stroke="white" strokeWidth="6" fontFamily="Georgia, serif">W</text>
            <text x="30" y="210" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#333" fontFamily="Georgia, serif">W</text>

            {/* Intercardinal directions */}
            <text x="285" y="85" textAnchor="middle" fontSize="16" fill="#666" fontFamily="Arial, sans-serif">NE</text>
            <text x="315" y="315" textAnchor="middle" fontSize="16" fill="#666" fontFamily="Arial, sans-serif">SE</text>
            <text x="85" y="315" textAnchor="middle" fontSize="16" fill="#666" fontFamily="Arial, sans-serif">SW</text>
            <text x="115" y="85" textAnchor="middle" fontSize="16" fill="#666" fontFamily="Arial, sans-serif">NW</text>
          </svg>

          {/* Rotating needle */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            transform: `translate(-50%, -50%) rotate(${-smoothedHeading}deg)`,
            transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}>
            <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{
              width: '100%',
              height: '100%'
            }}>
              <defs>
                <linearGradient id="needleNorth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff5252', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#c62828', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="needleSouth" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#e0e0e0', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#9e9e9e', stopOpacity: 1 }} />
                </linearGradient>
                <filter id="needleShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/>
                </filter>
              </defs>

              {/* North pointer */}
              <path
                d="M 200 80 L 215 195 L 200 190 L 185 195 Z"
                fill="url(#needleNorth)"
                stroke="#8b0000"
                strokeWidth="2"
                filter="url(#needleShadow)"
              />

              {/* South pointer */}
              <path
                d="M 200 320 L 215 205 L 200 210 L 185 205 Z"
                fill="url(#needleSouth)"
                stroke="#424242"
                strokeWidth="2"
                filter="url(#needleShadow)"
              />

              {/* Center cap */}
              <circle cx="200" cy="200" r="15" fill="#fff" stroke="#333" strokeWidth="2" />
              <circle cx="200" cy="200" r="8" fill="#d32f2f" stroke="#8b0000" strokeWidth="1" />
            </svg>
          </div>

          {/* Heading display */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {Math.round(smoothedHeading)}°
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
            <strong>Heading:</strong> {Math.round(smoothedHeading)}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Alpha:</strong> {alpha !== null ? alpha.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Beta:</strong> {beta !== null ? beta.toFixed(1) : '--'}°
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Gamma:</strong> {gamma !== null ? gamma.toFixed(1) : '--'}°
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
