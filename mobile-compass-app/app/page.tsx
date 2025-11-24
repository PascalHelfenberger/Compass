import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', textAlign: 'center' }}>
        Mobile Web APIs
      </h1>
      <p style={{ fontSize: '16px', marginBottom: '40px', textAlign: 'center', opacity: 0.9 }}>
        Choose an application
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
        <Link
          href="/arrow"
          style={{
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid white',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Arrow App</h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Arrow maintains its direction when device rotates
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Exercise 1 - deviceorientation API
          </p>
        </Link>

        <Link
          href="/compass"
          style={{
            padding: '30px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid white',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'white',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Compass App</h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Arrow always points North
          </p>
          <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Exercise 2 - Magnetometer API (Optional)
          </p>
        </Link>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        maxWidth: '400px',
        fontSize: '14px'
      }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>Note:</strong> These apps require device sensors.
        </p>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>iOS: Grant permission when prompted</li>
          <li>Android: Should work automatically</li>
          <li>Works best on actual devices (not desktop)</li>
        </ul>
      </div>
    </div>
  )
}
