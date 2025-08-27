import React from 'react'

/**
 * Box sizes used below:
 * - Device: 200x80 (width x height)
 * - Firewall cluster: 200x90
 * Site group offsets:
 * - NDC: translate(120, 220)
 * - CDC: translate(720, 220)
 */

export default function Diagram() {
  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <svg viewBox="0 0 1200 780" className="w-full h-[740px]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#eee" strokeWidth="1" />
          </pattern>
          <linearGradient id="cloudGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#eef2ff" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
          </filter>
        </defs>
        <rect x="0" y="0" width="1200" height="780" fill="url(#grid)" />

        {/* Cloud: Extranet (MPLS) */}
        <g transform="translate(450,40)" filter="url(#softShadow)">
          <path d="M200 80c0-26.5-21.5-48-48-48-10.2 0-19.7 3.2-27.4 8.7C118.7 25.5 98.7 16 76 16 42.7 16 16 42.7 16 76c0 3 .2 5.9.7 8.8C7.3 91.8 0 104.4 0 119c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48 0-21.6-14.2-39.8-33.7-45.8 0-.7.1-1.4.1-2.2z" fill="url(#cloudGrad)" stroke="#c7d2fe" strokeWidth="2" />
          <text x="136" y="88" textAnchor="middle" className="fill-gray-800" fontSize="16" fontWeight="600">Extranet (MPLS)</text>
          <text x="136" y="108" textAnchor="middle" className="fill-gray-500" fontSize="12">Single MPLS Cloud</text>
        </g>

        {/* NDC site */}
        <g transform="translate(120,220)">
          <text x="0" y="-30" className="fill-gray-700" fontSize="18" fontWeight="700">NDC</text>

          {/* Devices */}
          <Device x={0}   y={0}   width={200} label="PSBA CPE-1" subtitle="NDC" tier="cpe" />
          <Device x={260} y={0}   width={200} label="PSBA CPE-2" subtitle="NDC" tier="cpe" />
          <Device x={0}   y={170} width={200} label="DHCW WAN-1" subtitle="NDC" tier="wan" />
          <Device x={260} y={170} width={200} label="DHCW WAN-2" subtitle="NDC" tier="wan" />
          <FirewallCluster x={130} y={360} width={200} label="Check Point Edge FW Cluster" subtitle="NDC" />

          {/* CPE -> WAN (edge-to-edge: bottom of CPE to top of WAN) */}
          <Link x1={100} y1={80}  x2={100} y2={170} />
          <Link x1={360} y1={80}  x2={360} y2={170} />

          {/* WAN -> FW (edge-to-edge: bottom of WAN to top of FW) */}
          <Link x1={100} y1={170+80} x2={230} y2={360} />
          <Link x1={360} y1={170+80} x2={230} y2={360} />
        </g>

        {/* CDC site */}
        <g transform="translate(720,220)">
          <text x="0" y="-30" className="fill-gray-700" fontSize="18" fontWeight="700">CDC</text>

          {/* Devices */}
          <Device x={0}   y={0}   width={200} label="PSBA CPE-1" subtitle="CDC" tier="cpe" />
          <Device x={260} y={0}   width={200} label="PSBA CPE-2" subtitle="CDC" tier="cpe" />
          <Device x={0}   y={170} width={200} label="DHCW WAN-1" subtitle="CDC" tier="wan" />
          <Device x={260} y={170} width={200} label="DHCW WAN-2" subtitle="CDC" tier="wan" />
          <FirewallCluster x={130} y={360} width={200} label="Check Point Edge FW Cluster" subtitle="CDC" />

          {/* CPE -> WAN */}
          <Link x1={100} y1={80}  x2={100} y2={170} />
          <Link x1={360} y1={80}  x2={360} y2={170} />

          {/* WAN -> FW */}
          <Link x1={100} y1={170+80} x2={230} y2={360} />
          <Link x1={360} y1={170+80} x2={230} y2={360} />
        </g>

        {/* Extranet (absolute coords) -> Top edges of CPEs (absolute coords) */}
        {/* Cloud bottom anchor ~ (586,168) based on the drawn path */}
        {/* NDC CPE top edges: group(120,220) => (220,220) and (480,220) */}
        {/* CDC CPE top edges: group(720,220) => (820,220) and (1080,220) */}
        <Link x1={586} y1={168} x2={220}  y2={220}  dashed label="Extranet→NDC CPE-1" />
        <Link x1={586} y1={168} x2={480}  y2={220}  dashed label="Extranet→NDC CPE-2" />
        <Link x1={586} y1={168} x2={820}  y2={220}  dashed label="Extranet→CDC CPE-1" />
        <Link x1={586} y1={168} x2={1080} y2={220}  dashed label="Extranet→CDC CPE-2" />

        {/* Legend */}
        <g transform="translate(24,24)" className="opacity-90">
          <rect x="0" y="0" width="260" height="126" rx="12" ry="12" fill="#ffffff" stroke="#e5e7eb" />
          <text x="16" y="24" className="fill-gray-700" fontSize="14" fontWeight="700">Legend</text>

          <rect x="16" y="40" width="20" height="10" fill="#1f2937" />
          <text x="44" y="49" className="fill-gray-600" fontSize="12">Solid link: On-site connection</text>

          <rect x="16" y="64" width="20" height="10" fill="none" stroke="#1f2937" strokeDasharray="6 6" />
          <text x="44" y="73" className="fill-gray-600" fontSize="12">Dashed link: MPLS path</text>

          <rect x="16" y="88" width="20" height="10" fill="#eef2ff" stroke="#6366f1" />
          <text x="44" y="97" className="fill-gray-600" fontSize="12">Cloud: Extranet (MPLS)</text>
        </g>
      </svg>
    </div>
  )
}

function Device({ x, y, width, label, subtitle, tier }) {
  const colors = {
    cpe: { stroke: '#10b981', fill: '#ecfdf5' },
    wan: { stroke: '#0ea5e9', fill: '#eff6ff' },
  }[tier] || { stroke: '#6b7280', fill: '#f9fafb' }

  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="0" y="0" width={width} height="80" rx="12" ry="12" fill={colors.fill} stroke={colors.stroke} />
      <text x={width/2} y="34" textAnchor="middle" className="fill-gray-800" fontSize="14" fontWeight="700">{label}</text>
      <text x={width/2} y="56" textAnchor="middle" className="fill-gray-500" fontSize="12">{subtitle}</text>
    </g>
  )
}

function FirewallCluster({ x, y, width, label, subtitle }) {
  return (
    <g transform={`translate(${x},${y})`}>
      {/* stylized firewall cluster */}
      <rect x="0" y="0" width={width} height="90" rx="12" ry="12" fill="#fff7ed" stroke="#fb923c" />
      <g transform={`translate(${width/2 - 70},12)`}>
        <rect x="0" y="0" width="140" height="24" rx="4" fill="#fed7aa" stroke="#fb923c" />
        <rect x="0" y="30" width="140" height="24" rx="4" fill="#fed7aa" stroke="#fb923c" />
      </g>
      <text x={width/2} y="74" textAnchor="middle" className="fill-gray-700" fontSize="12">{label} – {subtitle}</text>
    </g>
  )
}

function Link({ x1, y1, x2, y2, dashed=false, label }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1f2937" strokeWidth="2.5" strokeDasharray={dashed ? '8 8' : '0'} />
      {label && (
        <text x={(x1+x2)/2} y={(y1+y2)/2 - 6} textAnchor="middle" className="fill-gray-500" fontSize="11">{label}</text>
      )}
    </g>
  );
}
