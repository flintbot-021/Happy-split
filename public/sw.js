if(!self.define){let e,i={};const s=(s,a)=>(s=new URL(s+".js",a).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(a,t)=>{const d=e||("document"in self?document.currentScript.src:"")||location.href;if(i[d])return;let n={};const c=e=>s(e,d),r={module:{uri:d},exports:n,require:c};i[d]=Promise.all(a.map((e=>r[e]||c(e)))).then((e=>(t(...e),n)))}}define(["./workbox-cb477421"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"66ff9c2f658e0f7b4700bfa1fb2f12a0"},{url:"/_next/static/chunks/170-62d224b56971375c.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/4bd1b696-950f18c28bf7cd17.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/517-2657f9a375b49813.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/703-33b1f83d08d655b8.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/735.6e9c7e96f28c50e2.js",revision:"6e9c7e96f28c50e2"},{url:"/_next/static/chunks/814-3860c811458ebefa.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/9-8c1e0e4930a373a5.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/9da6db1e-b8153dd875ad12e3.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/_not-found/page-df687e041a553006.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/bills/%5Bid%5D/route-f0cdaab52eabf2a1.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/bills/route-5910b461ee55e369.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/diners/%5Bid%5D/items/%5BitemId%5D/route-7fe0ad85611b5657.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/diners/%5Bid%5D/items/route-00ce04a84a4e46d7.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/diners/%5Bid%5D/route-792be40ee6635117.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/diners/route-307fd388de536a3a.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/api/process-bill/route-973199df68390914.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/bills/%5Bid%5D/error-f9381e308aa8b5a8.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/bills/%5Bid%5D/loading-f9905454425c6e7f.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/bills/%5Bid%5D/page-f3feb3aa1cfd7a73.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/create/loading-9eaf2978cd57207d.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/create/page-bba2a70c1cf2b562.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/join/page-a53e29607abf4093.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/layout-72abb0dcaeee24d7.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/app/page-db5c766d66f207a2.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/framework-6b27c2b7aa38af2d.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/main-4d8234944cdacab7.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/main-app-39a386637c8b7cb6.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/pages/_app-d23763e3e6c904ff.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/pages/_error-9b7125ad1a1e68fa.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-d6417e5c46d43e85.js",revision:"mdFj2HHf3TCJ9_diLHSAT"},{url:"/_next/static/css/2c125d6a57b419d5.css",revision:"2c125d6a57b419d5"},{url:"/_next/static/mdFj2HHf3TCJ9_diLHSAT/_buildManifest.js",revision:"48920db963266ec8617f5bd08789132e"},{url:"/_next/static/mdFj2HHf3TCJ9_diLHSAT/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/26a46d62cd723877-s.woff2",revision:"befd9c0fdfa3d8a645d5f95717ed6420"},{url:"/_next/static/media/55c55f0601d81cf3-s.woff2",revision:"43828e14271c77b87e3ed582dbff9f74"},{url:"/_next/static/media/581909926a08bbc8-s.woff2",revision:"f0b86e7c24f455280b8df606b89af891"},{url:"/_next/static/media/6d93bde91c0c2823-s.woff2",revision:"621a07228c8ccbfd647918f1021b4868"},{url:"/_next/static/media/97e0cb1ae144a2a9-s.woff2",revision:"e360c61c5bd8d90639fd4503c829c2dc"},{url:"/_next/static/media/a34f9d1faa5f3315-s.p.woff2",revision:"d4fe31e6a2aebc06b8d6e558c9141119"},{url:"/_next/static/media/df0a9ae256c0569c-s.woff2",revision:"d54db44de5ccb18886ece2fda72bdfe0"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.png",revision:"11cdc5b1990f01bb00c4b937776e2176"},{url:"/icons/icon-512x512.png",revision:"62e56d4da3ad6ed5948d0a6d76001fc9"},{url:"/manifest.json",revision:"9cb615533dbdf19e7158f380377c75f5"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:i,event:s,state:a})=>i&&"opaqueredirect"===i.type?new Response(i.body,{status:200,statusText:"OK",headers:i.headers}):i}]}),"GET"),e.registerRoute(/^https:\/\/nesbrgmtxtpgkkqgjukv\.supabase\.co/,new e.NetworkFirst({cacheName:"supabase-cache",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET")}));
