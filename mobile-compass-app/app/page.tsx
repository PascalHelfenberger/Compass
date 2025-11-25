import Link from 'next/link'
import { styleText } from 'util'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c8adcff 0%, #06cdc6ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', textAlign: 'center' }}>
        P12 Mobile Web APIs
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
        <ul style={{ paddingLeft: '20px', justifyContent: 'center', lineHeight: '1.6' }}>
          <h4>MOBA1 - ZHAW School of Applied Sciences</h4>
          <a>Developed by helfepa1, ismhaj01, sivaksiv</a>
          <br />
          <a style={{ fontStyle: 'italic' }}>©️2025 - all rights reserved</a>
        </ul>
      </div>
    </div>
  )
}
