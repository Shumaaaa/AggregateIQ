const B={basalt:{porosity:.49,moistureContent:.0245,sio2:47.4,al2o3:8.33,fe2o3:16.7,cao:7.28},granite:{porosity:1.36,moistureContent:.1526,sio2:68.88,al2o3:8.91,fe2o3:3.19,cao:1.71},limestone:{porosity:20.2,moistureContent:2.2531,sio2:5.01,al2o3:1.39,fe2o3:.27,cao:51.9}},R={porosity:"Porosity (%)",moistureContent:"MC (%)",sio2:"SiO₂ (%)",al2o3:"Al₂O₃ (%)",fe2o3:"Fe₂O₃ (%)",cao:"CaO (%)"},M=135,D=270;function u(a){return M+a/100*D}function p(a,n,s,i){const f=(i-90)*Math.PI/180;return{x:a+s*Math.cos(f),y:n+s*Math.sin(f)}}function C(a,n,s,i,f){const e=p(a,n,s,i),l=p(a,n,s,f),t=f-i>180?1:0;return`M ${e.x.toFixed(2)} ${e.y.toFixed(2)} A ${s} ${s} 0 ${t} 1 ${l.x.toFixed(2)} ${l.y.toFixed(2)}`}const T=[{from:0,to:50,color:"#964219"},{from:50,to:70,color:"#D19900"},{from:70,to:85,color:"#20808D"},{from:85,to:95,color:"#1B474D"},{from:95,to:100,color:"#437A22"}];function V(a,n){const{predictedRC:s,rcLow:i,rcHigh:f,grade:e,gradeColor:l}=a,t=160,o=155,c=110,x=T.map(r=>`<path d="${C(t,o,c,u(r.from),u(r.to))}" fill="none" stroke="${r.color}" stroke-width="22" stroke-opacity="0.30"/>`).join(""),F=`<path d="${C(t,o,c,M,M+D)}" fill="none" stroke="#E5E4E0" stroke-width="${n==="arc"?22:3}"/>`,G=`<path d="${C(t,o,c,u(i),u(f))}" fill="none" stroke="${l}" stroke-width="${n==="arc"?22:6}" stroke-opacity="0.22"/>`,v=`<path d="${C(t,o,c,M,u(s))}" fill="none" stroke="${l}" stroke-width="${n==="arc"?22:4}" stroke-linecap="round"/>`,$=[0,50,100].map(r=>{const d=p(t,o,c+(n==="arc"?20:-30),u(r));return`<text x="${d.x.toFixed(1)}" y="${(d.y+4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#9A9996" font-family="Georgia,serif">${r}</text>`}).join("");let g="";if(n==="speedometer"){const r=u(s),d=p(t,o,c-10,r),m=p(t,o,14,r+90),b=p(t,o,14,r-90);g=`
      <polygon points="${d.x.toFixed(1)},${d.y.toFixed(1)} ${m.x.toFixed(1)},${m.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}" fill="${l}" opacity="0.9"/>
      <circle cx="${t}" cy="${o}" r="12" fill="${l}"/>
      <circle cx="${t}" cy="${o}" r="6"  fill="white"/>
    `,g+=[0,25,50,75,100].map(k=>{const y=u(k),z=p(t,o,c-16,y),E=p(t,o,c+3,y);return`<line x1="${z.x.toFixed(1)}" y1="${z.y.toFixed(1)}" x2="${E.x.toFixed(1)}" y2="${E.y.toFixed(1)}" stroke="#9A9996" stroke-width="1.5"/>`}).join("")}const A=n==="arc"?o+22:o+40,w=n==="arc"?o-6:o+58,h=`
    <text x="${t}" y="${w}" text-anchor="middle" font-size="13" fill="${l}" font-family="Georgia,serif" font-weight="bold">${e}</text>
    <text x="${t}" y="${A}"  text-anchor="middle" font-size="40" fill="${l}" font-family="Georgia,serif" font-weight="bold">${s}%</text>
    <text x="${t}" y="${A+20}" text-anchor="middle" font-size="10" fill="#9A9996" font-family="Georgia,serif">90% CI: ${i}% – ${f}%</text>
  `;return`<svg width="320" height="265" viewBox="0 0 320 265" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="265" fill="white"/>
    ${x}
    ${F}
    ${G}
    ${v}
    ${g}
    ${$}
    ${h}
  </svg>`}function H(a){const{variableChecks:n,stoneType:s}=a;if(n.length===0)return`<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" fill="white"/>
      <text x="10" y="28" font-size="11" fill="#9A9996" font-family="Georgia,serif">No variable data available.</text>
    </svg>`;const i=22,f=8,e=110,l=360,t=i*2+f+10,o=n.length*t+60,c=e+l+80,x=Math.max(...n.flatMap($=>[$.userValue,$.refValue]),1),F=n.map(($,g)=>{const A=Math.max(4,$.userValue/x*l),w=Math.max(4,$.refValue/x*l),h=$.inBounds?"#437A22":"#D19900",r=42+g*t,d=m=>m<.1?m.toFixed(4):m.toFixed(2);return`
      <text x="${e-8}" y="${r+i-3}"    text-anchor="end" font-size="11" fill="#28251D" font-family="Georgia,serif" font-weight="bold">${$.label}</text>
      <text x="${e-8}" y="${r+i+8}"    text-anchor="end" font-size="9"  fill="${h}" font-family="Georgia,serif">${$.inBounds?"✓ in range":"⚠ deviation"}</text>
      <rect x="${e}" y="${r}"             width="${l}" height="${i}" rx="3" fill="#F0EFEB"/>
      <rect x="${e}" y="${r}"             width="${A.toFixed(1)}" height="${i}" rx="3" fill="${h}" opacity="0.80"/>
      <text x="${e+A+6}" y="${r+i-5}" font-size="10" fill="${h}" font-family="Georgia,serif" font-weight="bold">${d($.userValue)}%</text>
      <rect x="${e}" y="${r+i+4}" width="${l}" height="${i}" rx="3" fill="#F0EFEB"/>
      <rect x="${e}" y="${r+i+4}" width="${w.toFixed(1)}" height="${i}" rx="3" fill="#9A9996" opacity="0.45"/>
      <text x="${e+w+6}" y="${r+i*2+1}" font-size="10" fill="#7A7974" font-family="Georgia,serif">${d($.refValue)}%</text>
    `}).join(""),G=`
    <rect x="${e}"       y="${o-14}" width="12" height="12" rx="2" fill="#437A22" opacity="0.80"/>
    <text x="${e+16}" y="${o-3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered (in range)</text>
    <rect x="${e+140}" y="${o-14}" width="12" height="12" rx="2" fill="#D19900" opacity="0.80"/>
    <text x="${e+156}" y="${o-3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered (deviation)</text>
    <rect x="${e+290}" y="${o-14}" width="12" height="12" rx="2" fill="#9A9996" opacity="0.45"/>
    <text x="${e+306}" y="${o-3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Reference (${s})</text>
  `,v=`<text x="0" y="20" font-size="13" font-weight="bold" fill="#28251D" font-family="Georgia,serif">Variable Comparison — Entered vs ${s} Reference</text>`;return`<svg width="${c}" height="${o}" viewBox="0 0 ${c} ${o}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${c}" height="${o}" fill="white"/>
    ${v}
    ${F}
    ${G}
  </svg>`}function S(a,n){const s=B[n],i=Object.keys(R),f=n.charAt(0).toUpperCase()+n.slice(1),e=22,l=8,t=110,o=340,c=e*2+l+10,x=i.length*c+60,F=t+o+80,G=i.map((g,A)=>{const w=a[g]??0,h=s[g]??0,r=Math.max(w,h,.001),d=Math.max(4,w/r*o),m=Math.max(4,h/r*o),b=h>0?Math.abs((w-h)/h)*100:0,k=b<=30?"#437A22":b<=60?"#D19900":"#964219",y=42+A*c,z=E=>E<.1?E.toFixed(4):E.toFixed(2);return`
      <text x="${t-8}" y="${y+e-3}"    text-anchor="end" font-size="11" fill="#28251D" font-family="Georgia,serif" font-weight="bold">${R[g]}</text>
      <text x="${t-8}" y="${y+e+8}"    text-anchor="end" font-size="9"  fill="${k}" font-family="Georgia,serif">dev: ${b.toFixed(1)}%</text>
      <rect x="${t}" y="${y}"             width="${o}" height="${e}" rx="3" fill="#F0EFEB"/>
      <rect x="${t}" y="${y}"             width="${d.toFixed(1)}" height="${e}" rx="3" fill="${k}" opacity="0.80"/>
      <text x="${t+d+6}" y="${y+e-5}" font-size="10" fill="${k}" font-family="Georgia,serif" font-weight="bold">${z(w)}%</text>
      <rect x="${t}" y="${y+e+4}" width="${o}" height="${e}" rx="3" fill="#F0EFEB"/>
      <rect x="${t}" y="${y+e+4}" width="${m.toFixed(1)}" height="${e}" rx="3" fill="#20808D" opacity="0.45"/>
      <text x="${t+m+6}" y="${y+e*2+1}" font-size="10" fill="#7A7974" font-family="Georgia,serif">${z(h)}%</text>
    `}).join(""),v=`
    <rect x="${t}"       y="${x-14}" width="12" height="12" rx="2" fill="#437A22" opacity="0.80"/>
    <text x="${t+16}" y="${x-3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered values</text>
    <rect x="${t+120}" y="${x-14}" width="12" height="12" rx="2" fill="#20808D" opacity="0.45"/>
    <text x="${t+136}" y="${x-3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Reference (${f})</text>
  `,$=`<text x="0" y="20" font-size="13" font-weight="bold" fill="#28251D" font-family="Georgia,serif">Comparison vs ${f} Reference Values</text>`;return`<svg width="${F}" height="${x}" viewBox="0 0 ${F} ${x}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${F}" height="${x}" fill="white"/>
    ${$}
    ${G}
    ${v}
  </svg>`}function O(a,n){const s=B[n],i=Object.keys(R);let f=0,e=0;for(const l of i){const t=a[l],o=s[l];if(t==null||t===0)continue;const c=o>0?Math.abs((t-o)/o)*100:100;f+=c,e++}return e>0?f/e:999}export{V as buildScoreMeterSvg,H as buildStoneChartSvg,S as buildTripleChartSvg,O as calcSimilarityScore};
