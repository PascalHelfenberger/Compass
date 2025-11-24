# Mobile Compass Apps - Assignment 12

This is a Next.js application for ZHAW MOBA 1 Praktika-12, implementing device orientation and compass features.

## Features

### Exercise 1: Arrow App (`/arrow`)
- Shows an arrow pointing towards the initial top of the viewport
- Arrow maintains its direction when device rotates around the z-axis
- Uses the `deviceorientation` event API

### Exercise 2: Compass App (`/compass`) - Optional
- Arrow always points North
- Three compass methods:
  - **webkitCompassHeading** (iOS Safari)
  - **Absolute Alpha** (Android Chrome)
  - **Magnetometer API** (Experimental)

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### 3. Access on Your Phone

#### Option A: On Same WiFi Network
1. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
2. On your phone's browser, visit: `http://YOUR-IP-ADDRESS:3000`
   - Example: `http://192.168.1.105:3000`

#### Option B: Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Follow the prompts to get a public URL

## Browser Support

- **iOS Safari**: Best support with permission prompts
- **Android Chrome**: Works with absolute orientation
- **Desktop**: Limited sensor support (for testing UI only)

## Important Notes

- **HTTPS Required**: Some features require HTTPS (use Vercel for production)
- **iOS Permission**: iOS 13+ requires user to grant permission
- **Sensors**: Must be tested on actual mobile device with sensors

## Project Structure

```
mobile-compass-app/
├── app/
│   ├── page.tsx          # Home page with navigation
│   ├── arrow/
│   │   └── page.tsx      # Exercise 1: Arrow app
│   ├── compass/
│   │   └── page.tsx      # Exercise 2: Compass app
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── package.json
└── README.md
```

## Assignment Requirements

This project fulfills:
- ✅ Exercise 1: Device orientation tracking with gyroscope
- ✅ Exercise 2: Compass functionality with magnetometer (optional)
- ✅ Single-file HTML alternatives also provided in parent directory
