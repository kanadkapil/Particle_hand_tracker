export const generateShape = (type, count) => {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0
    if (type === 'cloud') {
       x = (Math.random() - 0.5) * 12
       y = (Math.random() - 0.5) * 12
       z = (Math.random() - 0.5) * 12
    } else if (type === 'sphere') {
       const r = 6 * Math.cbrt(Math.random())
       const theta = Math.random() * 2 * Math.PI
       const phi = Math.acos(2 * Math.random() - 1)
       x = r * Math.sin(phi) * Math.cos(theta)
       y = r * Math.sin(phi) * Math.sin(theta)
       z = r * Math.cos(phi)
    } else if (type === 'galaxy') {
       const r = Math.pow(Math.random(), 0.5) * 8
       const spin = r * 2.5
       const angle = Math.random() * Math.PI * 2
       
       // Spiral arms
       const armOffset = Math.floor(Math.random() * 3) * (Math.PI * 2 / 3) 
       
       x = r * Math.cos(angle + spin + armOffset)
       y = (Math.random() - 0.5) * (r * 0.2)
       z = r * Math.sin(angle + spin + armOffset) 

    } else if (type === 'heart') {
       // Parametric heart
       const t = Math.random() * Math.PI * 2
       // Distribute points inside
       const r = Math.sqrt(Math.random())
       
       // Heart equation
       // x = 16sin^3(t)
       // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
       const scale = 0.3
       const xt = 16 * Math.pow(Math.sin(t), 3)
       const yt = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
       
       x = xt * scale * r
       y = yt * scale * r
       z = (Math.random() - 0.5) * 2
    } else if (type === 'ring') {
       const r = 6 + Math.random() * 2
       const theta = Math.random() * Math.PI * 2
       x = r * Math.cos(theta)
       y = (Math.random() - 0.5) * 0.5
       z = r * Math.sin(theta)
    } else if (type === 'dna') {
       const h = (Math.random() - 0.5) * 12 // Height
       const angle = h * 2.5 // Twist
       const r = 2
       const strand = Math.random() > 0.5 ? 1 : -1 // Two strands
       x = r * Math.cos(angle + (strand * Math.PI))
       y = h
       z = r * Math.sin(angle + (strand * Math.PI))
       // Add thickness to strands
       x += (Math.random() - 0.5) * 0.5
       z += (Math.random() - 0.5) * 0.5
    } else if (type === 'torusKnot') {
       // Torus Knot (p=2, q=3)
       const t = Math.random() * Math.PI * 2 * 3
       const tubo = 0.8 + (Math.random() - 0.5) * 0.5
       const p = 2, q = 3
       const r = 3 + Math.cos(q * t / p) * 1.5
       x = r * Math.cos(t) * tubo
       y = r * Math.sin(t) * tubo
       z = Math.sin(q * t / p) * 1.5 * tubo
    } else if (type === 'pyramid') {
       const h = Math.random() * 8 - 4
       // Width depends on height (bottom is wide, top is point)
       // Map h (-4 to 4) to w (4 to 0)
       const relH = (h + 4) / 8 // 0 to 1
       const w = 4 * (1 - relH)
       x = (Math.random() - 0.5) * 2 * w
       z = (Math.random() - 0.5) * 2 * w
       y = h
    }

    pos[i * 3] = x
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = z
  }
  return pos
}
