<template>
  <div :class="['gravity-visual', `gravity-visual--${variant}`, { 'is-light': light }]" aria-hidden="true">
    <div class="gravity-glow"></div>
    <div class="orbit orbit-one"><span class="orbit-dot"></span></div>
    <div class="orbit orbit-two"><span class="orbit-dot"></span></div>
    <div class="mandala-logo">
      <img :src="buddhistArtLogo" alt="Buddhist Art MFU" class="mandala-logo-image">
    </div>
  </div>
</template>

<script>
import buddhistArtLogo from '@/assets/icons/logo.png'

export default {
  name: 'HeroGravityVisual',
  data () {
    return { buddhistArtLogo }
  },
  props: {
    variant: { type: String, default: 'home' },
    light: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.gravity-visual { position:absolute; inset:0 0 0 auto; width:48%; overflow:hidden; pointer-events:none; color:#efc46f; }
.gravity-glow { position:absolute; width:420px; height:420px; right:8%; top:50%; transform:translateY(-50%); border-radius:50%; background:radial-gradient(circle, rgba(232,185,100,.16), transparent 68%); animation:breathe 5s ease-in-out infinite; }
.meaning-label { position:absolute; right:10%; bottom:13%; font:700 .68rem/1 var(--app-font-family); letter-spacing:.28em; color:rgba(255,255,255,.55); }
.is-light .meaning-label { color:rgba(97,39,33,.55); }
.is-light .gravity-glow { background:radial-gradient(circle, rgba(196,154,74,.18), transparent 68%); }
.is-light .gallery-ring,
.is-light .signal-ring { border-color:rgba(107,47,40,.18); }
.is-light .art-frame { border-color:rgba(107,47,40,.16); background:rgba(107,47,40,.05); box-shadow:0 24px 48px rgba(107,47,40,.12); }
.is-light .news-sheet { border-color:rgba(107,47,40,.14); background:rgba(107,47,40,.06); box-shadow:0 20px 42px rgba(107,47,40,.12); }
.is-light .news-sheet b,
.is-light .message-card i { background:rgba(107,47,40,.28); }
.is-light .connection-map path { stroke:rgba(107,47,40,.24); }
.is-light .connection-map circle { fill:#c49a4a; filter:drop-shadow(0 0 8px rgba(196,154,74,.55)); }
.is-light .connection-map .hub { fill:#fffaf0; stroke:#6b2f28; }
.is-light .message-card { border-color:rgba(107,47,40,.18); background:rgba(107,47,40,.06); box-shadow:0 18px 34px rgba(107,47,40,.12); }
.orbit { position:absolute; left:50%; top:50%; border:1px solid rgba(224,178,92,.32); border-radius:50%; transform:translate(-50%,-50%); }
.orbit-one { width:330px; height:330px; animation:spin 16s linear infinite; }
.orbit-two { width:460px; height:220px; animation:spinReverse 22s linear infinite; }
.orbit-dot { position:absolute; width:10px; height:10px; left:50%; top:-5px; border-radius:50%; background:#c58d35; box-shadow:0 0 22px #d8a64f; }
.mandala-logo { position:absolute; left:50%; top:50%; width:150px; height:270px; transform:translate(-50%,-50%); animation:float 5s ease-in-out infinite; display:grid; place-items:center; }
.mandala-logo-image { display:block; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 12px 18px rgba(97,39,33,.16)); }
.gallery-ring { position:absolute; right:8%; top:12%; width:360px; height:360px; border:1px solid rgba(239,196,111,.2); border-radius:50%; animation:spin 28s linear infinite; }
.art-frame { position:absolute; width:150px; height:190px; padding:10px; border:1px solid rgba(244,210,145,.55); background:rgba(255,255,255,.06); box-shadow:0 25px 50px rgba(0,0,0,.22); backdrop-filter:blur(6px); }
.art-frame span { display:block; width:100%; height:100%; background:radial-gradient(circle at 65% 35%,#d9ad62 0 8%,transparent 9%), linear-gradient(145deg,#9c513c,#401814 55%,#c28b43); opacity:.72; }
.frame-one { right:25%; top:20%; transform:rotate(-7deg); animation:frameFloat 6s ease-in-out infinite; }
.frame-two { right:8%; top:35%; transform:rotate(8deg) scale(.82); animation:frameFloat 7s ease-in-out -2s infinite; }
.frame-three { right:43%; top:43%; transform:rotate(4deg) scale(.68); animation:frameFloat 8s ease-in-out -4s infinite; }
.signal-ring { position:absolute; right:17%; top:45%; border:1px solid rgba(239,196,111,.3); border-radius:50%; animation:signal 4s ease-out infinite; }
.signal-two { animation-delay:2s; }
.news-sheet { position:absolute; width:190px; height:125px; padding:18px; border:1px solid rgba(255,255,255,.22); border-radius:8px; background:rgba(255,255,255,.09); box-shadow:0 20px 45px rgba(0,0,0,.2); backdrop-filter:blur(8px); }
.news-sheet i { float:left; width:48px; height:48px; margin-right:12px; background:linear-gradient(135deg,#d6a655,#7c3128); border-radius:4px; }
.news-sheet b { display:block; height:6px; margin:7px 0; border-radius:9px; background:rgba(255,255,255,.55); }
.sheet-one { right:12%; top:24%; animation:newsDrift 7s ease-in-out infinite; }
.sheet-two { right:39%; top:48%; transform:scale(.75) rotate(-8deg); opacity:.55; animation:newsDrift 8s ease-in-out -3s infinite; }
.news-pulse { position:absolute; right:27%; top:52%; width:12px; height:12px; border-radius:50%; background:#efc46f; box-shadow:0 0 24px #efc46f; }
.connection-map { position:absolute; right:4%; top:14%; width:90%; height:68%; overflow:visible; }
.connection-map path { fill:none; stroke:rgba(239,196,111,.3); stroke-width:1.5; stroke-dasharray:8 8; animation:dash 12s linear infinite; }
.connection-map circle { fill:#efc46f; filter:drop-shadow(0 0 8px rgba(239,196,111,.8)); animation:nodePulse 3s ease-in-out infinite; }
.connection-map .hub { fill:#fff; stroke:#efc46f; stroke-width:4; }
.message-card { position:absolute; right:25%; top:37%; width:112px; height:76px; padding:16px; border:1px solid rgba(255,255,255,.3); border-radius:14px; background:rgba(255,255,255,.1); backdrop-filter:blur(8px); animation:float 5s ease-in-out infinite; }
.message-card span { color:#efc46f; }
.message-card i { display:block; height:5px; margin-top:8px; border-radius:5px; background:rgba(255,255,255,.55); }
@keyframes spin { to { transform:translate(-50%,-50%) rotate(360deg); } }
@keyframes spinReverse { to { transform:translate(-50%,-50%) rotate(-360deg); } }
@keyframes breathe { 50% { transform:translateY(-50%) scale(1.12); opacity:.7; } }
@keyframes float { 50% { transform:translate(-50%,-57%); } }
@keyframes frameFloat { 50% { margin-top:-18px; } }
@keyframes signal { from { width:20px;height:20px;opacity:.8;transform:translate(50%,-50%); } to { width:390px;height:390px;opacity:0;transform:translate(50%,-50%); } }
@keyframes newsDrift { 50% { margin-top:-16px; transform:rotate(2deg); } }
@keyframes dash { to { stroke-dashoffset:-160; } }
@keyframes nodePulse { 50% { opacity:.45; } }
@media (max-width:991.98px) { .gravity-visual { width:42%; opacity:.72; } .meaning-label { display:none; } }
@media (max-width:575.98px) {
  .gravity-visual { width:100%; opacity:.22; overflow:hidden; max-width:100vw; }
  .gravity-glow { width:260px; height:260px; }
  .orbit-one { width:240px; height:240px; }
  .orbit-two { width:300px; height:300px; }
  .art-frame { right:5%; }
}
@media (prefers-reduced-motion:reduce) { .gravity-visual * { animation:none !important; } }
</style>
