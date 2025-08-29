import React, { useMemo, useState } from 'react'

/**
 * ===========================
 *  EDIT ME – HOVER TEXT DATA
 * ===========================
 * Put all your device hover text here (separate from the visible label).
 * Use \n for new lines.
 */
const DEVICE_INFO = {
  // NDC
  N_CPE1: { label: 'CPE-1', subtitle: 'NDC', hover: 'Cisco Nexus 9000\nIP: 192.168.1.1' },
  N_CPE2: { label: 'CPE-2', subtitle: 'NDC', hover: 'Cisco Nexus 9000\nIP: 192.168.1.2' },
  N_WAN1: { label: 'WAN-1', subtitle: 'NDC', hover: 'DHCW WAN Router\nGIG01NSWWAN001\nN9336C-FX\n1U 36 x 40/100 Gbps QSFP28 ports 2 X 750W PSU\nMgmt – 192.168.7.19/24' },
  N_WAN2: { label: 'WAN-2', subtitle: 'NDC', hover: 'DHCW WAN Router\nIP: 10.0.0.2' },
  N_FW:   { label: 'Edge FW Cluster', subtitle: 'NDC', hover: 'Check Point Cluster\nVIP: 172.16.0.1' },

  // CDC
  C_CPE1: { label: 'CPE-1', subtitle: 'CDC', hover: 'Cisco Nexus 9000\nIP: 192.168.2.1' },
  C_CPE2: { label: 'CPE-2', subtitle: 'CDC', hover: 'Cisco Nexus 9000\nIP: 192.168.2.2' },
  C_WAN1: { label: 'WAN-1', subtitle: 'CDC', hover: 'DHCW WAN Router\nIP: 10.1.0.1' },
  C_WAN2: { label: 'WAN-2', subtitle: 'CDC', hover: 'DHCW WAN Router\nIP: 10.1.0.2' },
  C_FW:   { label: 'Edge FW Cluster', subtitle: 'CDC', hover: 'Check Point Cluster\nVIP: 172.16.1.1' },
}

/**
 * Sizes and site offsets
 */
const DEVICE = { w: 200, h: 80 }
const FIREWALL = { w: 200, h: 90 }

const CLOUD = { x: 450, y: 40, w: 272, h: 151 } // visual bbox for the cloud
const SITES = {
  NDC: { ox: 120, oy: 220 },
  CDC: { ox: 720, oy: 220 },
}

function edgePoint({ x, y, w, h }, side) {
  switch (side) {
    case 'top': return { x: x + w / 2, y }
    case 'bottom': return { x: x + w / 2, y: y + h }
    case 'left': return { x, y: y + h / 2 }
    case 'right': return { x: x + w, y: y + h / 2 }
    default: return { x: x + w / 2, y: y + h / 2 }
  }
}
function lineBetween(a, b) { return { x1: a.x, y1: a.y, x2: b.x, y2: b.y } }
function absBox(origin, dx, dy, size) { return { x: origin.ox + dx, y: origin.oy + dy, w: size.w, h: size.h } }
function bottomCenter(box) { return { x: box.x + box.w / 2, y: box.y + box.h } }

function linkFromCloud(id, label, fromPoint, toPoint, dashed=false) {
  return { id, label, dashed, ...lineBetween(fromPoint, toPoint) }
}
function mkLink(id, label, fromPoint, toPoint, dashed=false) {
  return { id, label, dashed, ...lineBetween(fromPoint, toPoint) }
}

export default function Diagram() {
  const [zoom, setZoom] = useState(1)
  const [hover, setHover] = useState(null)   // { type:'device'|'link', id, label, text?, x, y }
  const [selected, setSelected] = useState(null)

  const zoomIn = () => setZoom(z => Math.min(2.5, +(z + 0.1).toFixed(2)))
  const zoomOut = () => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(2)))
  const zoomReset = () => setZoom(1)

  // Build layout (boxes + links) with easy-to-edit labels & hover text from DEVICE_INFO
  const layout = useMemo(() => {
    // NDC
    const n_cpe1 = { id: 'N_CPE1', tier: 'cpe',   info: DEVICE_INFO.N_CPE1, box: absBox(SITES.NDC,   0,   0, DEVICE) }
    const n_cpe2 = { id: 'N_CPE2', tier: 'cpe',   info: DEVICE_INFO.N_CPE2, box: absBox(SITES.NDC, 260,   0, DEVICE) }
    const n_wan1 = { id: 'N_WAN1', tier: 'wan',   info: DEVICE_INFO.N_WAN1, box: absBox(SITES.NDC,   0, 170, DEVICE) }
    const n_wan2 = { id: 'N_WAN2', tier: 'wan',   info: DEVICE_INFO.N_WAN2, box: absBox(SITES.NDC, 260, 170, DEVICE) }
    const n_fw   = { id: 'N_FW',   tier: 'fw',    info: DEVICE_INFO.N_FW,   box: absBox(SITES.NDC, 130, 360, FIREWALL) }

    // CDC
    const c_cpe1 = { id: 'C_CPE1', tier: 'cpe',   info: DEVICE_INFO.C_CPE1, box: absBox(SITES.CDC,   0,   0, DEVICE) }
    const c_cpe2 = { id: 'C_CPE2', tier: 'cpe',   info: DEVICE_INFO.C_CPE2, box: absBox(SITES.CDC, 260,   0, DEVICE) }
    const c_wan1 = { id: 'C_WAN1', tier: 'wan',   info: DEVICE_INFO.C_WAN1, box: absBox(SITES.CDC,   0, 170, DEVICE) }
    const c_wan2 = { id: 'C_WAN2', tier: 'wan',   info: DEVICE_INFO.C_WAN2, box: absBox(SITES.CDC, 260, 170, DEVICE) }
    const c_fw   = { id: 'C_FW',   tier: 'fw',    info: DEVICE_INFO.C_FW,   box: absBox(SITES.CDC, 130, 360, FIREWALL) }

    const devices = [n_cpe1, n_cpe2, n_wan1, n_wan2, n_fw, c_cpe1, c_cpe2, c_wan1, c_wan2, c_fw]

    const links = [
      // Extranet -> CPE tops
      linkFromCloud('L_EX_NCPE1', 'Extranet→NDC CPE-1', bottomCenter(CLOUD), edgePoint(n_cpe1.box, 'top'), true),
      linkFromCloud('L_EX_NCPE2', 'Extranet→NDC CPE-2', bottomCenter(CLOUD), edgePoint(n_cpe2.box, 'top'), true),
      linkFromCloud('L_EX_CCPE1', 'Extranet→CDC CPE-1', bottomCenter(CLOUD), edgePoint(c_cpe1.box, 'top'), true),
      linkFromCloud('L_EX_CCPE2', 'Extranet→CDC CPE-2', bottomCenter(CLOUD), edgePoint(c_cpe2.box, 'top'), true),

      // NDC verticals
      mkLink('L_N_CPE1_WAN1', 'NDC CPE-1→WAN-1', edgePoint(n_cpe1.box, 'bottom'), edgePoint(n_wan1.box, 'top')),
      mkLink('L_N_CPE2_WAN2', 'NDC CPE-2→WAN-2', edgePoint(n_cpe2.box, 'bottom'), edgePoint(n_wan2.box, 'top')),
      mkLink('L_N_WAN1_FW',   'NDC WAN-1→FW',    edgePoint(n_wan1.box, 'bottom'), edgePoint(n_fw.box, 'top')),
      mkLink('L_N_WAN2_FW',   'NDC WAN-2→FW',    edgePoint(n_wan2.box, 'bottom'), edgePoint(n_fw.box, 'top')),

      // CDC verticals
      mkLink('L_C_CPE1_WAN1', 'CDC CPE-1→WAN-1', edgePoint(c_cpe1.box, 'bottom'), edgePoint(c_wan1.box, 'top')),
      mkLink('L_C_CPE2_WAN2', 'CDC CPE-2→WAN-2', edgePoint(c_cpe2.box, 'bottom'), edgePoint(c_wan2.box, 'top')),
      mkLink('L_C_WAN1_FW',   'CDC WAN-1→FW',    edgePoint(c_wan1.box, 'bottom'), edgePoint(c_fw.box, 'top')),
      mkLink('L_C_WAN2_FW',   'CDC WAN-2→FW',    edgePoint(c_wan2.box, 'bottom'), edgePoint(c_fw.box, 'top')),
    ]

    return { devices, links }
  }, [])

  return (
    <div className="rounded-2xl border p-4 shadow-sm relative">
      {/* Zoom controls */}
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <button onClick={zoomOut} className="px-3 py-1 rounded-lg border shadow-sm hover:bg-gray-50">-</button>
        <button onClick={zoomReset} className="px-3 py-1 rounded-lg border shadow-sm hover:bg-gray-50">100%</button>
        <button onClick={zoomIn} className="px-3 py-1 rounded-lg border shadow-sm hover:bg-gray-50">+</button>
      </div>

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

        {/* Apply zoom to all content */}
        <g transform={`translate(${(1-zoom)*600} ${(1-zoom)*390}) scale(${zoom})`}>

          {/* Cloud: Extranet (MPLS) */}
          <g transform={`translate(${CLOUD.x},${CLOUD.y})`} filter="url(#softShadow)">
            <path
              d="M200 80c0-26.5-21.5-48-48-48-10.2 0-19.7 3.2-27.4 8.7C118.7 25.5 98.7 16 76 16 42.7 16 16 42.7 16 76c0 3 .2 5.9.7 8.8C7.3 91.8 0 104.4 0 119c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48 0-21.6-14.2-39.8-33.7-45.8 0-.7.1-1.4.1-2.2z"
              fill="url(#cloudGrad)" stroke="#c7d2fe" strokeWidth="2"
            />
            <text x="136" y="88" textAnchor="middle" className="fill-gray-800" fontSize="16" fontWeight="600">
              Extranet (MPLS)
            </text>
            <text x="136" y="108" textAnchor="middle" className="fill-gray-500" fontSize="12">
              Single MPLS Cloud
            </text>
          </g>

          {/* NDC */}
          <SiteLabel x={SITES.NDC.ox} y={SITES.NDC.oy - 30} text="NDC" />
          {layout.devices.filter(d => d.info.subtitle === 'NDC').map(d => (
            d.tier === 'fw'
              ? <FirewallBox key={d.id} id={d.id} x={d.box.x} y={d.box.y} label={d.info.label} subtitle={d.info.subtitle}
                             hoverText={d.info.hover} hover={hover} setHover={setHover} selected={selected} setSelected={setSelected} />
              : <DeviceBox   key={d.id} id={d.id} x={d.box.x} y={d.box.y} tier={d.tier} label={d.info.label} subtitle={d.info.subtitle}
                             hoverText={d.info.hover} hover={hover} setHover={setHover} selected={selected} setSelected={setSelected} />
          ))}

          {/* CDC */}
          <SiteLabel x={SITES.CDC.ox} y={SITES.CDC.oy - 30} text="CDC" />
          {layout.devices.filter(d => d.info.subtitle === 'CDC').map(d => (
            d.tier === 'fw'
              ? <FirewallBox key={d.id} id={d.id} x={d.box.x} y={d.box.y} label={d.info.label} subtitle={d.info.subtitle}
                             hoverText={d.info.hover} hover={hover} setHover={setHover} selected={selected} setSelected={setSelected} />
              : <DeviceBox   key={d.id} id={d.id} x={d.box.x} y={d.box.y} tier={d.tier} label={d.info.label} subtitle={d.info.subtitle}
                             hoverText={d.info.hover} hover={hover} setHover={setHover} selected={selected} setSelected={setSelected} />
          ))}

          {/* Links */}
          <Links hover={hover} setHover={setHover} selected={selected} links={layout.links} />
        </g>

        {/* Legend (not zoomed) */}
        <Legend />
      </svg>

      {/* Tooltip */}
      <Tooltip hover={hover} />
    </div>
  )
}

/** ====== Render helpers ====== */
function Links({ hover, setHover, selected, links }) {
  return (
    <g>
      {links.map(l => {
        const active = (hover?.type === 'link' && hover.id === l.id) || (selected && selected.type === 'link' && selected.id === l.id)
        return (
          <g
            key={l.id}
            onMouseEnter={() => setHover({ type: 'link', id: l.id, label: l.label, x: (l.x1 + l.x2) / 2, y: (l.y1 + l.y2) / 2 })}
            onMouseLeave={() => setHover(null)}
          >
            <line
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={active ? '#7c3aed' : '#1f2937'}
              strokeWidth={active ? 3.5 : 2.5}
              strokeDasharray={l.dashed ? '8 8' : '0'}
            />
          </g>
        )
      })}
    </g>
  )
}

function SiteLabel({ x, y, text }) {
  return <text x={x} y={y} className="fill-gray-700" fontSize="18" fontWeight="700">{text}</text>
}

function DeviceBox({ id, label, subtitle, hoverText, x, y, tier='wan', hover, setHover, selected, setSelected }) {
  const active = (hover?.type === 'device' && hover.id === id) || (selected && selected.type === 'device' && selected.id === id)
  const palette = tier === 'cpe'
    ? { stroke: '#10b981', fill: '#ecfdf5' }
    : { stroke: '#0ea5e9', fill: '#eff6ff' }

  return (
    <g transform={`translate(${x},${y})`} className="cursor-pointer"
       onMouseEnter={() => setHover({ type:'device', id, label, text: hoverText, x: x + DEVICE.w/2, y })}
       onMouseLeave={() => setHover(null)}
       onClick={() => setSelected({ type:'device', id, label })}
    >
      <rect x="0" y="0" width={DEVICE.w} height={DEVICE.h} rx="12" ry="12"
            fill={palette.fill} stroke={active ? '#7c3aed' : palette.stroke} strokeWidth={active ? 3 : 1.5} />
      {/* Visible label only */}
      <text x={DEVICE.w/2} y="34" textAnchor="middle" className="fill-gray-800" fontSize="14" fontWeight="700">{label}</text>
      <text x={DEVICE.w/2} y="56" textAnchor="middle" className="fill-gray-500" fontSize="12">{subtitle}</text>
    </g>
  )
}

function FirewallBox({ id, label, subtitle, hoverText, x, y, hover, setHover, selected, setSelected }) {
  const active = (hover?.type === 'device' && hover.id === id) || (selected && selected.type === 'device' && selected.id === id)
  return (
    <g transform={`translate(${x},${y})`} className="cursor-pointer"
       onMouseEnter={() => setHover({ type:'device', id, label, text: hoverText, x: x + FIREWALL.w/2, y })}
       onMouseLeave={() => setHover(null)}
       onClick={() => setSelected({ type:'device', id, label })}
    >
      <rect x="0" y="0" width={FIREWALL.w} height={FIREWALL.h} rx="12" ry="12"
            fill="#fff7ed" stroke={active ? '#7c3aed' : '#fb923c'} strokeWidth={active ? 3 : 1.5} />
      <g transform={`translate(${FIREWALL.w/2 - 70},12)`}>
        <rect x="0" y="0" width="140" height="24" rx="4" fill="#fed7aa" stroke="#fb923c" />
        <rect x="0" y="30" width="140" height="24" rx="4" fill="#fed7aa" stroke="#fb923c" />
      </g>
      {/* Visible label only */}
      <text x={FIREWALL.w/2} y="74" textAnchor="middle" className="fill-gray-700" fontSize="12">{label} – {subtitle}</text>
    </g>
  )
}

function Legend() {
  return (
    <g transform="translate(24,24)" className="opacity-90">
      <rect x="0" y="0" width="300" height="166" rx="12" ry="12" fill="#ffffff" stroke="#e5e7eb" />
      <text x="16" y="24" className="fill-gray-700" fontSize="14" fontWeight="700">Legend & Tips</text>

      <rect x="16" y="40" width="20" height="10" fill="#1f2937" />
      <text x="44" y="49" className="fill-gray-600" fontSize="12">Solid link: On-site connection</text>

      <rect x="16" y="64" width="20" height="10" fill="none" stroke="#1f2937" strokeDasharray="6 6" />
      <text x="44" y="73" className="fill-gray-600" fontSize="12">Dashed link: MPLS path</text>

      <rect x="16" y="88" width="20" height="10" fill="#eef2ff" stroke="#6366f1" />
      <text x="44" y="97" className="fill-gray-600" fontSize="12">Cloud: Extranet (MPLS)</text>

      <text x="16" y="122" className="fill-gray-500" fontSize="11">Hover shows device details (separate from label).</text>
      <text x="16" y="142" className="fill-gray-500" fontSize="11">Click to select. Use +/− for zoom.</text>
    </g>
  )
}

function Tooltip({ hover }) {
  if (!hover) return null
  const left = hover.x + 14
  const top = hover.y + 14
  const text = hover.type === 'device' ? (hover.text || hover.label) : (hover.label || '')
  return (
    <div style={{
      position: 'absolute', left, top, pointerEvents: 'none',
      background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
      padding: '6px 10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      fontSize: 12, whiteSpace: 'pre-line' // respects \n in DEVICE_INFO.hover
    }}>
      {text}
    </div>
  )
}
