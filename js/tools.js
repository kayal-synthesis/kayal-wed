/* ============================================================
   KAYAL SoulPath — Tools JavaScript (tools.js)
   Numerology Calculator, Name Vibration, Universal Day,
   Meditation Timer

   UPDATED:
   - Hyper-personalised results using visitor's actual name,
     numbers, and current timing — not generic archetypes
   - Backend call to api.kayalsoulpath.com for AI language
   - saveVisitorData() for smart widget routing in lifeos-widget.js
   - Conversion CTAs pointing to specific paid tools
   - All original structure (window.KAYAL, CSS .show class) intact
   ============================================================ */

(function () {
  'use strict';

  /* ── KAYAL helpers from global.js ──────────────────────── */
  const K = window.KAYAL;

  const APP      = 'https://app.kayalsoulpath.com'
  const API_BASE = 'https://api.kayalsoulpath.com'
  const pinNames = ['First', 'Second', 'Third', 'Fourth']

  /* ── Save visitor data for smart widget routing ─────────
     Called whenever visitor uses a tool with their own data.
     lifeos-widget.js reads this key to route widget links.
  ─────────────────────────────────────────────────────── */
  function saveVisitorData(name, dob) {
    if (!name || !dob) return
    try {
      localStorage.setItem('kayal_visitor_data', JSON.stringify({
        name,
        dob,
        source:    'free-tools',
        timestamp: new Date().toISOString(),
      }))
    } catch (e) {}
  }

  /* ── Call backend for AI-personalised language ──────────
     Falls back silently — local content always shows.
  ─────────────────────────────────────────────────────── */
  async function fetchPersonalised(payload) {
    try {
      const res = await fetch(`${API_BASE}/tools/free-reading`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  AbortSignal.timeout(12000),
      })
      if (!res.ok) throw new Error('API ' + res.status)
      return await res.json()
    } catch (e) {
      return null
    }
  }

  /* ── Inject personalised section into a result panel ────
     Appended after the existing elements so original layout
     is fully preserved.
  ─────────────────────────────────────────────────────── */
  function injectPersonalised(containerId, html) {
    const el = document.getElementById(containerId)
    if (!el) return
    // Remove any previous injected section
    el.querySelectorAll('.kayal-personalised').forEach(n => n.remove())
    const div = document.createElement('div')
    div.className = 'kayal-personalised'
    div.innerHTML = html
    // Insert before the tool-result-cta if it exists, else append
    const cta = el.querySelector('.tool-result-cta')
    if (cta) el.insertBefore(div, cta)
    else el.appendChild(div)
  }

  /* ── Teaser block (what the full reading reveals) ──────── */
  function teaserBlock(items) {
    const rows = items.map(i => `
      <div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid rgba(201,158,44,0.08);last-child:border:none">
        <span style="color:var(--terra);font-size:9px;flex-shrink:0;margin-top:3px">✦</span>
        <p style="font-size:12.5px;color:var(--slate);line-height:1.65;margin:0">${i}</p>
      </div>`).join('')
    return `
      <div style="margin:20px 0 0;padding:16px;background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.12);border-radius:10px">
        <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(99,102,241,0.6);font-family:var(--ff-body);font-weight:600;margin-bottom:12px">What the full reading reveals</p>
        ${rows}
        <p style="font-size:11px;color:rgba(99,102,241,0.45);margin-top:10px;font-style:italic;text-align:center">This is approximately 20% of what the complete reading surfaces.</p>
      </div>`
  }

  /* ── Conversion CTA button ──────────────────────────────── */
  function ctaBlock(toolId, toolName, price, description) {
    return `
      <div style="margin-top:20px;padding:20px;background:linear-gradient(135deg,var(--parchment),var(--cream));border:1px solid rgba(201,158,44,0.2);border-radius:12px">
        <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--terra);font-family:var(--ff-body);font-weight:600;margin-bottom:6px">Go Deeper</p>
        <p style="font-family:var(--ff-heading);font-size:15px;color:var(--ink);margin-bottom:4px">${toolName}</p>
        <p style="font-size:12px;color:var(--stone);margin-bottom:16px">${description}</p>
        <a href="${APP}/tool/${toolId}" target="_blank" rel="noopener"
          style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:var(--terra);color:white;border-radius:8px;text-decoration:none;font-family:var(--ff-body);font-weight:600;font-size:13px"
          onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          <span>Get the Complete Reading</span>
          <span style="display:flex;align-items:center;gap:8px">
            <span style="font-size:17px;font-family:var(--ff-heading)">$${price}</span>
            <span style="font-size:18px">→</span>
          </span>
        </a>
        <p style="font-size:10px;color:var(--stone);text-align:center;margin-top:10px">Delivered in 20 minutes · 256-bit encrypted</p>
      </div>`
  }

  /* ── Personalised headline block ─────────────────────────── */
  function headlineBlock(text) {
    return `
      <div style="padding:16px;background:var(--parchment);border-radius:10px;border:1px solid rgba(201,158,44,0.15);margin-top:16px">
        <p style="font-family:var(--ff-heading);font-size:15px;font-style:italic;color:var(--ink);line-height:1.65;margin:0">"${text}"</p>
      </div>`
  }

  /* ══════════════════════════════════════════════════════════
     Life Path archetype content — specific not generic
  ══════════════════════════════════════════════════════════ */
  const LP_ARCH = {
    1:  { name:'The Initiator',  shadow:'The specific pattern most Life Path 1s carry is a cycle of bold initiation followed by quiet abandonment. Not failure — abandonment.',        teaser:'Your chart shows the specific decision you have been circling for the last 18 months — and why it has not been made yet.',                                 tool:'life-path-deep-dive',    toolName:'The Life Path Deep Dive',      price:57 },
    2:  { name:'The Weaver',     shadow:'The pattern most Life Path 2s carry is the belief that clarity will come from consensus. It will not. Your chart shows when this was installed.',  teaser:'Your chart shows the specific relationship dynamic that has been repeating — and the exact moment it entered your life.',                               tool:'soul-contract-reading',  toolName:'The Soul Contract Reading',    price:47 },
    3:  { name:'The Alchemist',  shadow:'Life Path 3s have a specific relationship with joy that turns self-destructive under stress. Your chart names the trigger precisely.',            teaser:'Your chart shows the creative channel you have been blocking — and what restoring it changes across every other domain.',                              tool:'calling-decoder',        toolName:'The Calling Decoder',          price:47 },
    4:  { name:'The Architect',  shadow:'Most Life Path 4s carry a belief that security must be earned before life can begin. Your chart shows exactly how this belief was formed.',       teaser:'Your chart shows the foundation you have been avoiding building — and the compound cost of continuing to avoid it.',                                   tool:'income-ceiling-breaker', toolName:'The Income Ceiling Breaker',   price:57 },
    5:  { name:'The Seeker',     shadow:'The specific pattern most Life Path 5s carry is a cycle of expansion followed by self-sabotage at exactly the point where commitment would be required.', teaser:'Your chart shows the specific commitment you have been avoiding — and what your life looks like on both sides of making it.',                   tool:'north-node-reading',     toolName:'The North Node Reading',       price:37 },
    6:  { name:'The Keeper',     shadow:"Most Life Path 6s carry a pattern of giving to others what they most need for themselves. The chart shows this pattern's origin and its current cost.", teaser:'Your chart shows the relationship where this pattern is most active right now — and what it is asking you to do differently.',                   tool:'self-love-blueprint',    toolName:'The Self Love Blueprint',      price:37 },
    7:  { name:'The Oracle',     shadow:'Most Life Path 7s carry a pattern of accumulating insight without converting it to movement. Your chart names exactly where this loop began.',       teaser:'Your chart shows the specific question you have been researching instead of answering — and what answering it actually requires.',                    tool:'life-path-deep-dive',    toolName:'The Life Path Deep Dive',      price:57 },
    8:  { name:'The Sovereign',  shadow:"The pattern most Life Path 8s carry is an unconscious equation between money and worth. Your chart shows when this was installed and how it's limiting your ceiling.", teaser:'Your chart shows the specific financial pattern that has been operating below your awareness — and its compound cost.',               tool:'income-ceiling-breaker', toolName:'The Income Ceiling Breaker',   price:57 },
    9:  { name:'The Sage',       shadow:'Most Life Path 9s carry a pattern of giving everything to others while quietly depleting themselves. Your chart shows the specific domain where this is most active.', teaser:'Your chart shows the thing you came here to complete — and the pattern that has been preventing its completion.',                      tool:'soul-contract-reading',  toolName:'The Soul Contract Reading',    price:47 },
    11: { name:'The Illuminator',shadow:'Most Life Path 11s live most of their life as a 2 — managing the anxiety of their sensitivity without ever stepping into the transmission they were built for.', teaser:'Your chart shows the activation point for your master number — and what has been standing in front of it.',                              tool:'master-number-reading',  toolName:'The Master Number Reading',    price:47 },
    22: { name:'The Master Builder', shadow:'The specific pattern of Life Path 22 is the fear of the scale of their own assignment. Your chart shows where this fear lives and what it costs.', teaser:'Your chart shows the specific structure you were built to create — and the exact reason it has not been built yet.',                             tool:'master-number-reading',  toolName:'The Master Number Reading',    price:47 },
    33: { name:'The Master Teacher', shadow:'The greatest risk for a Life Path 33 is martyrdom — the substitution of self-sacrifice for the more difficult work of genuine teaching.',      teaser:'Your chart shows the teaching you have been given and the specific reason you have been withholding it.',                                            tool:'master-number-reading',  toolName:'The Master Number Reading',    price:47 },
  }

  const PINNACLE_TEASERS = {
    1:'This Pinnacle demands independent action. The resistance you feel is the curriculum.',
    2:'This Pinnacle is teaching you the difference between patience and passivity.',
    3:'This Pinnacle calls for expression. What has been suppressed is asking to be made real.',
    4:'This Pinnacle demands foundation work. The structure being built now determines the next 20 years.',
    5:'This Pinnacle demands freedom and change. Resistance to change costs more than change itself.',
    6:'This Pinnacle calls for service and relationship. What you give here comes back multiplied.',
    7:'This Pinnacle demands deep study and reflection. Understanding is being built that will serve everything.',
    8:'This Pinnacle brings material power. How you handle authority now shapes everything that follows.',
    9:'This Pinnacle calls for completion and release. What you let go of here clears the way for the next cycle.',
  }

  /* ══════════════════════════════════════════════════════════
     1. LIFE BLUEPRINT CALCULATOR
  ══════════════════════════════════════════════════════════ */
  document.getElementById('calc-num')?.addEventListener('click', async function () {
    const dobInput  = document.getElementById('num-dob')
    const nameInput = document.getElementById('num-name')
    const dob       = dobInput?.value
    const name      = nameInput?.value?.trim() || ''

    if (!dob) { dobInput?.focus(); return }

    // Save for widget routing
    saveVisitorData(name, dob)

    const lp        = K.lifePath(dob)
    const pins      = K.pinnacles(dob)
    const arch      = LP_ARCH[lp] || LP_ARCH[7]
    const firstName = name ? name.split(' ')[0] : 'Seeker'

    // Personal Year (local calculation)
    function personalYear(d) {
      const [,m,dy] = d.split('-').map(Number)
      const y  = new Date().getFullYear()
      let s = m + dy + String(y).split('').reduce((a,c) => a+Number(c), 0)
      while (s > 9 && s !== 11 && s !== 22 && s !== 33) {
        s = String(s).split('').reduce((a,c) => a+Number(c), 0)
      }
      return s
    }
    function ageFrom(d) {
      const b = new Date(d), t = new Date()
      let a = t.getFullYear() - b.getFullYear()
      if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--
      return a
    }

    const py  = personalYear(dob)
    const age = ageFrom(dob)

    // Find current pinnacle
    const end1 = 36 - lp
    const currentPinnNum = age < end1 ? pins[0] : age < end1+9 ? pins[1] : age < end1+18 ? pins[2] : pins[3]
    const currentPinnLabel = age < end1 ? 'First' : age < end1+9 ? 'Second' : age < end1+18 ? 'Third' : 'Fourth'

    // --- Populate original elements (unchanged) ---
    document.getElementById('num-lp-num').textContent = lp
    document.getElementById('num-lp-desc').textContent =
      K.lpDesc[lp] || 'A unique path of profound growth and self-discovery.'

    const pinGrid = document.getElementById('num-pinnacles')
    pinGrid.innerHTML = pins.map((p, i) => `
      <div class="pinnacle-box">
        <div class="pinnacle-num">${p}</div>
        <div class="pinnacle-label">${pinNames[i]} Pinnacle</div>
        <div class="pinnacle-desc">${K.pinDesc[p] || ''}</div>
      </div>`).join('')

    const panel = document.getElementById('result-num')
    panel.classList.add('show')

    // --- Fetch AI personalisation (async, non-blocking) ---
    const ai = await fetchPersonalised({ tool:'life-blueprint', name, dob, life_path:lp, personal_year:py, age })

    // Build personalised layer
    const headline  = ai?.headline  || `${firstName}, your Life Path ${lp} is carrying a pattern most readings never surface`
    const shadowMsg = ai?.shadow    || arch.shadow
    const teaserMsg = ai?.teaser    || arch.teaser

    const teaserItems = ai?.what_you_cant_see || [
      `The specific pattern your current ${currentPinnLabel} Pinnacle (${currentPinnNum}) has been asking you to master`,
      `Why Personal Year ${py} is either amplifying or suppressing your Life Path ${lp} right now`,
      `The one decision your chart shows has been available for the last 18 months that you have not made yet`,
      `The shadow of Life Path ${lp} that is most active in your chart at age ${age}`,
    ]

    // Current pinnacle teaser
    const pinnTeaser = PINNACLE_TEASERS[currentPinnNum] || ''

    injectPersonalised('result-num', `
      ${headlineBlock(headline)}
      <div style="margin-top:16px;padding:14px 16px;background:rgba(201,158,44,0.06);border-left:3px solid var(--terra);border-radius:0 8px 8px 0">
        <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--terra);margin-bottom:6px">Current Chapter · ${currentPinnLabel} Pinnacle ${currentPinnNum} · Personal Year ${py}</p>
        <p style="font-size:13px;color:var(--bark);font-style:italic;line-height:1.65;margin:0">${pinnTeaser}</p>
      </div>
      <p style="font-size:13.5px;color:var(--slate);line-height:1.8;margin-top:16px">${shadowMsg}</p>
      <div style="margin-top:14px;padding:14px 16px;background:rgba(99,102,241,0.04);border-radius:8px;border:1px solid rgba(99,102,241,0.1)">
        <p style="font-size:13px;font-style:italic;color:var(--bark);line-height:1.7;margin:0">${teaserMsg}</p>
      </div>
      ${teaserBlock(teaserItems)}
      ${ctaBlock(arch.tool, arch.toolName, arch.price,
        `A complete decoding of your Life Path ${lp} in your current Pinnacle — including the specific pattern your chart shows most clearly right now.`)}
    `)

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  /* ══════════════════════════════════════════════════════════
     Expression Number content
  ══════════════════════════════════════════════════════════ */
  const letterVals = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
    J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
    S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8,
  }

  const expressionDesc = {
    1:  'This name vibrates with independence, leadership, and original creative force. Those carrying this vibration are designed to initiate — to begin things, lead them, and define what is possible.',
    2:  'This name vibrates with diplomacy, sensitivity, and the gift of creating harmony between people. The expression 2 is built for partnership — for deep attentiveness that makes cooperation effortless.',
    3:  'This name vibrates with creative expression, communication, and joy. It carries the energy of the performer, the storyteller — someone who makes the world feel more alive by adding their voice to it.',
    4:  'This name vibrates with discipline, order, and the capacity to build things that last. The expression 4 is the architect — methodical, reliable, and genuinely capable of constructing what they commit to.',
    5:  'This name vibrates with freedom, adaptability, and the magnetic quality of someone who makes change look natural. The expression 5 moves through life like water — finding the path and making everything interesting.',
    6:  'This name vibrates with nurturing, responsibility, and the deep human impulse to care for others. The expression 6 carries a natural authority in the realm of service — in family, community, healing, and beauty.',
    7:  'This name vibrates with inquiry, depth, and a restless need to understand what lies beneath the surface. The expression 7 is the researcher who cannot be satisfied by shallow answers — and who arrives at truths others never find.',
    8:  'This name vibrates with power, material mastery, and the capacity to organise people and resources toward significant goals. The expression 8 carries innate authority — one that others feel before they can explain why.',
    9:  'This name vibrates with compassion, universality, and the kind of love that is not possessive. The expression 9 carries the energy of completion — of someone who has come to give rather than to take.',
    11: 'This name carries the vibration of master number 11 — the Illuminator. It vibrates on a higher frequency that amplifies intuition, spiritual sensitivity, and the capacity to inspire.',
    22: 'This name carries the vibration of master number 22 — the Master Builder. It holds the potential to turn the grandest visions into physical reality.',
    33: 'This name carries the vibration of master number 33 — the Master Teacher. It holds the energy of unconditional love expressed through service to humanity.',
  }

  const EXP_TEASERS = {
    1:  { tension:'The gap between your vision and your follow-through',                                              tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    2:  { tension:'The habit of mediating other people\'s conflicts at the expense of your own direction',            tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    3:  { tension:'The tendency to scatter this gift across too many channels simultaneously',                        tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    4:  { tension:'The belief that discipline is the same as progress — they are not',                               tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    5:  { tension:'The difficulty converting freedom into lasting form',                                              tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    6:  { tension:'The depletion that comes from giving this gift without clear boundaries',                          tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    7:  { tension:'The isolation that comes from perceiving things others cannot validate',                           tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    8:  { tension:'The conflation of authority with control — two completely different things',                       tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    9:  { tension:'The grief that accumulates when the work of completion is avoided',                                tool:'numerology-name-reading', toolName:'The Name Numerology Reading', price:29 },
    11: { tension:'The anxiety of operating at 2 when the chart is calling for 11',                                  tool:'master-number-reading',   toolName:'The Master Number Reading',   price:47 },
    22: { tension:'The fear of the scale of your own assignment',                                                    tool:'master-number-reading',   toolName:'The Master Number Reading',   price:47 },
    33: { tension:'The substitution of self-sacrifice for the more difficult work of genuine teaching',              tool:'master-number-reading',   toolName:'The Master Number Reading',   price:47 },
  }

  /* ══════════════════════════════════════════════════════════
     2. NAME VIBRATION TOOL
  ══════════════════════════════════════════════════════════ */
  document.getElementById('calc-name')?.addEventListener('click', async function () {
    const raw = document.getElementById('name-input').value.trim()
    if (!raw) { document.getElementById('name-input').focus(); return }

    const clean   = raw.toUpperCase().replace(/[^A-Z ]/g, '')
    const letters = clean.split('').filter(c => c !== ' ')
    let total = 0
    letters.forEach(c => { total += letterVals[c] || 0 })
    const expr = K.reduce(total)
    const exp  = EXP_TEASERS[expr] || EXP_TEASERS[1]

    // --- Populate original elements (unchanged) ---
    document.getElementById('name-num').textContent = expr

    const breakdown = document.getElementById('name-breakdown')
    breakdown.innerHTML = raw.toUpperCase().split('').map(char => {
      if (char === ' ') return '<span style="width:10px;display:inline-block"></span>'
      const v = letterVals[char]
      if (!v) return ''
      return `<div class="name-letter-cell"><div class="name-letter-char">${char}</div><div class="name-letter-val">${v}</div></div>`
    }).join('')

    document.getElementById('name-desc').textContent =
      expressionDesc[expr] || 'A unique vibration that holds within it a distinctive set of qualities and gifts.'

    const panel = document.getElementById('result-name')
    panel.classList.add('show')

    // --- Fetch AI personalisation ---
    const ai = await fetchPersonalised({ tool:'name-vibration', name:raw, expression:expr })

    const words     = raw.split(' ')
    const firstName = words[0]
    const isFullName = words.length > 1

    const headline   = ai?.headline || `The name "${raw}" carries a ${expr} vibration — and what that means is more specific than the number suggests`
    const tensionMsg = ai?.tension  || `The specific challenge of a ${expr} Expression: ${exp.tension}.`
    const teaserMsg  = ai?.teaser   || `${firstName}'s name vibration has a specific pattern that the complete reading maps in detail.`

    const teaserItems = ai?.what_you_cant_see || [
      isFullName
        ? `Whether "${firstName}" (${K.reduce(Object.values(firstName.toUpperCase().split('').reduce((acc, c) => { acc.sum = (acc.sum || 0) + (letterVals[c] || 0); return acc }, {})).join('') || '1')}) is aligned with or in conflict with the full name's ${expr} Expression`
        : `How your Expression ${expr} interacts with your Life Path number`,
      `The specific domain where your ${expr} Expression is most underutilised right now`,
      `Whether your professional name is amplifying or suppressing your natural Expression`,
      `The one adjustment that your chart shows would shift your reception immediately`,
    ]

    injectPersonalised('result-name', `
      ${headlineBlock(headline)}
      <p style="font-size:13.5px;color:var(--slate);line-height:1.8;margin-top:16px">${tensionMsg}</p>
      <div style="margin-top:12px;padding:14px 16px;background:rgba(99,102,241,0.04);border-radius:8px;border:1px solid rgba(99,102,241,0.1)">
        <p style="font-size:13px;font-style:italic;color:var(--bark);line-height:1.7;margin:0">${teaserMsg}</p>
      </div>
      ${teaserBlock(teaserItems)}
      ${ctaBlock(exp.tool, exp.toolName, exp.price,
        `A complete reading of what "${raw}" vibrates — and whether it is working for or against you in every domain of your life.`)}
    `)

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  /* ══════════════════════════════════════════════════════════
     3. UNIVERSAL DAY CALCULATOR
  ══════════════════════════════════════════════════════════ */
  const udDescriptions = {
    1: 'A Day of New Beginnings. The vibration today favours initiation — starting projects, making first contact, and acting on ideas that have been waiting. Independent action is supported. Hesitation is the only real risk.',
    2: 'A Day of Patience and Partnership. The energy today is cooperative, sensitive, and attuned to subtle dynamics. Negotiations, conversations, and collaborative decisions made today benefit from a slower, more listening-based approach.',
    3: 'A Day of Expression and Connection. Creative energy flows today — writing, speaking, connecting, and expressing ideas all carry additional weight. Social gatherings and communications made today have a naturally warm quality.',
    4: 'A Day of Work and Foundation. Discipline is rewarded today. Methodical, focused effort builds something that will last. This is not a day for shortcuts — it is a day for doing the real work with full attention.',
    5: 'A Day of Change and Movement. The unexpected is not a disruption today — it is the point. Flexibility, adaptability, and openness to new information allow the best possibilities to emerge. Hold plans loosely.',
    6: 'A Day of Care and Responsibility. The energy today turns toward home, relationships, and those in need of support. Service offered freely today returns compounded. Beauty and harmony in the environment matter more than usual.',
    7: 'A Day of Stillness and Inner Work. The quality of today\'s energy is contemplative, analytical, and inward. Major external decisions are better deferred. Research, writing, meditation, and deep thinking are all well supported.',
    8: 'A Day of Authority and Achievement. Business decisions, financial matters, and professional moves are particularly well supported today. The energy of the 8 amplifies whatever effort is directed toward material goals.',
    9: 'A Day of Completion and Release. Something is completing today — a cycle, a relationship, a project, a pattern. The most productive use of this energy is to consciously recognise what belongs to the past and release it with grace.',
  }

  const udThemes = {
    1: { domain:'New Projects',     relationship:'First Contacts',     avoid:'Indecision',       emphasise:'Initiative'   },
    2: { domain:'Collaboration',    relationship:'Deep Listening',     avoid:'Confrontation',    emphasise:'Patience'     },
    3: { domain:'Creative Work',    relationship:'Social Connection',  avoid:'Scattered Focus',  emphasise:'Expression'   },
    4: { domain:'Structured Work',  relationship:'Reliability',        avoid:'Shortcuts',        emphasise:'Discipline'   },
    5: { domain:'Change & Travel',  relationship:'New Encounters',     avoid:'Rigidity',         emphasise:'Adaptability' },
    6: { domain:'Home & Family',    relationship:'Acts of Care',       avoid:'Resentment',       emphasise:'Service'      },
    7: { domain:'Research & Study', relationship:'Solitude',           avoid:'Major Decisions',  emphasise:'Reflection'   },
    8: { domain:'Business & Finance',relationship:'Professional Moves',avoid:'Passivity',        emphasise:'Authority'    },
    9: { domain:'Completion',       relationship:'Forgiveness',        avoid:'New Beginnings',   emphasise:'Release'      },
  }

  const UD_SPECIFIC = {
    1:'What is started today carries disproportionate momentum. The universe is paying attention to first moves.',
    2:'The most important conversation today is the one you have been postponing. The other person is ready.',
    3:'What is created today carries particular energy. The thing that feels too honest to say is the right thing to say.',
    4:'The task that requires the most effort today is the one that will matter most in 12 months.',
    5:'Today rewards flexibility. The disruption is the gift. The deviation is the direction.',
    6:'What is neglected today will be noticed. Small acts of care land with unusual weight.',
    7:'The answer you need today will not come from more research. It is already inside you.',
    8:'Decisions made today carry unusual weight. Authority is most legible. The call you have been deferring needs to be made.',
    9:'Something is ready to be finished. Holding onto it costs more than releasing it.',
  }

  function calcUniversalDay(dateStr) {
    const d = new Date(dateStr)
    let s = 0
    ;[d.getDate(), d.getMonth() + 1, d.getFullYear()].forEach(n => {
      String(n).split('').forEach(c => (s += +c))
    })
    while (s > 9) {
      let t = 0; String(s).split('').forEach(c => (t += +c)); s = t
    }
    return s || 9
  }

  // Default today
  document.getElementById('ud-today')?.addEventListener('click', () => {
    const t = new Date()
    const yyyy = t.getFullYear()
    const mm   = String(t.getMonth() + 1).padStart(2, '0')
    const dd   = String(t.getDate()).padStart(2, '0')
    document.getElementById('ud-date').value = `${yyyy}-${mm}-${dd}`
  })

  document.getElementById('calc-ud')?.addEventListener('click', async function () {
    const dateInput = document.getElementById('ud-date').value
    if (!dateInput) { document.getElementById('ud-date').focus(); return }

    const num       = calcUniversalDay(dateInput)
    const d         = new Date(dateInput)
    const formatted = d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

    // --- Populate original elements (unchanged) ---
    document.getElementById('ud-num').textContent       = num
    document.getElementById('ud-date-label').textContent = `Universal Day — ${formatted}`
    document.getElementById('ud-desc').textContent       = udDescriptions[num] || ''

    const themes    = udThemes[num] || {}
    const guidanceEl = document.getElementById('ud-guidance')
    guidanceEl.innerHTML = Object.entries(themes).map(([k, v]) => `
      <div class="ud-guidance-box">
        <div class="ud-guidance-label">${k.replace(/([A-Z])/g, ' $1').trim()}</div>
        <div class="ud-guidance-val">${v}</div>
      </div>`).join('')

    const panel = document.getElementById('result-ud')
    panel.classList.add('show')

    // --- Fetch AI personalisation ---
    const ai = await fetchPersonalised({ tool:'universal-day', date:dateInput, universal_day:num })

    const headline   = ai?.headline || `${formatted} — this vibration carries a specific message most people will miss`
    const specificMsg = ai?.specific || UD_SPECIFIC[num] || ''

    const teaserItems = ai?.what_you_cant_see || [
      'How this Universal Day interacts with your specific Personal Year and current Pinnacle',
      'Which energy window today (morning, afternoon, evening) is most aligned with your chart',
      'The specific type of decision this day supports — and the type it does not',
      'Your complete 12-month timing map showing peak windows and caution periods',
    ]

    // Personal Day inner calculator
    const pdHtml = `
      <div style="margin-top:20px;padding:16px;background:var(--parchment);border-radius:10px;border:1px solid rgba(201,158,44,0.2)">
        <p style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--terra);margin-bottom:8px">Want your Personal Day for this date?</p>
        <p style="font-size:12px;color:var(--stone);margin-bottom:12px">Enter your birth date to see the vibration that is specifically yours — not just the universal one.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input type="date" id="pd-dob-input" style="flex:1;padding:8px 12px;border:1px solid var(--cream);border-radius:6px;font-size:12px;min-width:140px">
          <button id="calc-pd-inline" style="padding:8px 16px;background:var(--terra);color:white;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">Calculate Mine →</button>
        </div>
        <div id="pd-result-inline" style="display:none;margin-top:12px"></div>
      </div>`

    injectPersonalised('result-ud', `
      ${headlineBlock(headline)}
      <p style="font-size:13.5px;color:var(--slate);line-height:1.8;margin-top:16px;font-style:italic">${specificMsg}</p>
      ${pdHtml}
      ${teaserBlock(teaserItems)}
      ${ctaBlock('personal-year-deep-dive', 'The Personal Year Deep Dive', 29,
        'Every Personal Year mapped — with your peak windows, caution periods, and the specific type of move your chart supports right now.')}
    `)

    // Personal Day inline calculator
    document.getElementById('calc-pd-inline')?.addEventListener('click', function () {
      const dobVal = document.getElementById('pd-dob-input')?.value
      if (!dobVal) return

      function pdCalc(dob, dateStr) {
        function reduce(n) { while (n > 9 && n !== 11 && n !== 22 && n !== 33) { n = String(n).split('').reduce((a,c) => a+Number(c), 0) } return n }
        const lp = K.lifePath(dob)
        const [y, m, dd2] = dateStr.split('-').map(Number)
        const ud2 = reduce(String(y).split('').reduce((a,c) => a+Number(c), 0) + m + dd2)
        return reduce(ud2 + lp)
      }

      const PD_MEANINGS = {
        1:'A day for bold action and new beginnings — your energy aligns with initiation today.',
        2:'A day for patience and partnership — your best moves involve another person.',
        3:'A day for expression and connection — say what has been unsaid.',
        4:'A day for focused work — the compound interest of today\'s discipline pays in weeks.',
        5:'A day for change and curiosity — follow the unexpected thread.',
        6:'A day for relationship and care — small gestures land unusually deeply today.',
        7:'A day for reflection and insight — stillness is more productive than action.',
        8:'A day for authority and financial decisions — your power is most visible today.',
        9:'A day for completion and release — finish something that has been waiting.',
      }

      const pd    = pdCalc(dobVal, dateInput)
      const pdEl  = document.getElementById('pd-result-inline')
      if (pdEl) {
        pdEl.style.display = 'block'
        pdEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:white;border-radius:8px;border:1px solid var(--cream)">
            <div style="font-family:var(--ff-display);font-size:40px;font-weight:300;color:var(--terra);line-height:1;flex-shrink:0">${pd}</div>
            <div>
              <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--stone);margin-bottom:4px">Your Personal Day</p>
              <p style="font-size:13px;color:var(--slate);line-height:1.6;margin:0">${PD_MEANINGS[pd] || PD_MEANINGS[5]}</p>
            </div>
          </div>
          <a href="${APP}/tool/daily-personal-oracle" target="_blank" rel="noopener"
            style="display:block;text-align:center;padding:10px;background:rgba(201,158,44,0.08);border:1px solid rgba(201,158,44,0.2);border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;color:var(--terra);margin-top:8px">
            Get Your Daily Oracle — $19/month →
          </a>`
        saveVisitorData('', dobVal)  // save DOB for widget routing even without a name
      }
    })

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  /* ══════════════════════════════════════════════════════════
     4. MEDITATION TIMER — unchanged from original
  ══════════════════════════════════════════════════════════ */
  const teachings = [
    'The practice of stilling the mind is not the absence of thought. It is the development of a witness — a self that can observe thoughts without being moved by them.',
    'Every minute of genuine inner stillness is worth more than an hour of scattered outward activity. The quality of your life is largely determined by the quality of your inner silence.',
    'In the traditions of the First Pillar, the number 7 is the number of the inner seeker — the one who turns away from noise and toward the truth that can only be heard in stillness.',
    'The mind that has been trained to pause before reacting has access to a quality of decision-making that the untrained mind cannot reach. Meditation is not relaxation. It is training.',
    'Every great teacher across every tradition has pointed to the same practice: be still, observe, return. It is not complicated. It is only difficult until it becomes natural.',
    'The quality of your outer life is largely a reflection of the quality of your inner world. The most effective investment you can make in your circumstances is an investment in the clarity of your own mind.',
  ]

  const teachingEl = document.getElementById('timer-teaching')
  if (teachingEl) {
    teachingEl.textContent = teachings[Math.floor(Math.random() * teachings.length)]
  }

  let tSeconds = 600
  let tInterval = null
  let tRunning  = false
  const displayEl = document.getElementById('timer-display')
  const stateEl   = document.getElementById('timer-state')
  const startBtn  = document.getElementById('t-start')
  const pauseBtn  = document.getElementById('t-pause')
  const resetBtn  = document.getElementById('t-reset')

  function formatTime(s) {
    return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  }
  function updateDisplay() {
    if (displayEl) displayEl.textContent = formatTime(tSeconds)
  }
  function setState(state) {
    if (!displayEl || !stateEl) return
    displayEl.classList.remove('running', 'done')
    if (state === 'running') {
      displayEl.classList.add('running')
      stateEl.textContent = 'In session — breathe.'
    } else if (state === 'done') {
      displayEl.classList.add('done')
      displayEl.textContent = 'Complete ✦'
      stateEl.textContent = 'Session complete. Return gently.'
      if (teachingEl) teachingEl.textContent = teachings[Math.floor(Math.random() * teachings.length)]
    } else {
      stateEl.textContent = 'Ready to begin'
    }
  }

  startBtn?.addEventListener('click', () => {
    if (tRunning) return
    tRunning = true
    startBtn.disabled = true
    pauseBtn.disabled = false
    setState('running')
    tInterval = setInterval(() => {
      tSeconds--
      updateDisplay()
      if (tSeconds <= 0) {
        clearInterval(tInterval)
        tRunning = false
        startBtn.disabled = false
        pauseBtn.disabled = true
        setState('done')
        try {
          const ctx  = new (window.AudioContext || window.webkitAudioContext)()
          const osc  = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain); gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(528, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2)
          gain.gain.setValueAtTime(0.3, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)
          osc.start(); osc.stop(ctx.currentTime + 2.5)
        } catch (e) {}
      }
    }, 1000)
  })

  pauseBtn?.addEventListener('click', () => {
    clearInterval(tInterval)
    tRunning = false
    startBtn.disabled = false
    pauseBtn.disabled = true
    setState('paused')
    if (stateEl) stateEl.textContent = 'Paused — press Start to resume.'
  })

  resetBtn?.addEventListener('click', () => {
    clearInterval(tInterval)
    tRunning = false
    startBtn.disabled = false
    pauseBtn.disabled = true
    const active = document.querySelector('.timer-pre.active')
    tSeconds = (active ? parseInt(active.dataset.min, 10) : 10) * 60
    updateDisplay()
    setState('idle')
  })

  document.querySelectorAll('.timer-pre').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timer-pre').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      clearInterval(tInterval)
      tRunning = false
      startBtn.disabled = false
      pauseBtn.disabled = true
      tSeconds = parseInt(btn.dataset.min, 10) * 60
      updateDisplay()
      setState('idle')
      const customInput = document.getElementById('custom-min')
      if (customInput) customInput.value = btn.dataset.min
    })
  })

  document.getElementById('set-custom')?.addEventListener('click', () => {
    const val = parseInt(document.getElementById('custom-min').value, 10)
    if (!val || val < 1 || val > 120) { alert('Please enter a duration between 1 and 120 minutes.'); return }
    document.querySelectorAll('.timer-pre').forEach(b => b.classList.remove('active'))
    clearInterval(tInterval)
    tRunning = false
    startBtn.disabled = false
    pauseBtn.disabled = true
    tSeconds = val * 60
    updateDisplay()
    setState('idle')
  })

  updateDisplay()

})();
