function m(c){return 135+c/100*270}function F(c,r,l,o){const f=(o-90)*Math.PI/180;return{x:c+l*Math.cos(f),y:r+l*Math.sin(f)}}function T(c,r,l,o,f){const e=F(c,r,l,o),n=F(c,r,l,f),i=f-o>180?1:0;return`M ${e.x.toFixed(2)} ${e.y.toFixed(2)} A ${l} ${l} 0 ${i} 1 ${n.x.toFixed(2)} ${n.y.toFixed(2)}`}const L=[{from:0,to:50,color:"#964219"},{from:50,to:70,color:"#D19900"},{from:70,to:85,color:"#20808D"},{from:85,to:95,color:"#1B474D"},{from:95,to:100,color:"#437A22"}];function D(c,r){const{predictedRC:l,rcLow:o,rcHigh:f,grade:e,gradeColor:n}=c,i=160,t=155,s=110,A=L.map($=>`<path d="${T(i,t,s,m($.from),m($.to))}" fill="none" stroke="${$.color}" stroke-width="22" stroke-opacity="0.30"/>`).join(""),u=`<path d="${T(i,t,s,135,405)}" fill="none" stroke="#E5E4E0" stroke-width="${r==="arc"?22:3}"/>`,g=`<path d="${T(i,t,s,m(o),m(f))}" fill="none" stroke="${n}" stroke-width="${r==="arc"?22:6}" stroke-opacity="0.22"/>`,a=`<path d="${T(i,t,s,135,m(l))}" fill="none" stroke="${n}" stroke-width="${r==="arc"?22:4}" stroke-linecap="round"/>`,p=[0,50,100].map($=>{const y=F(i,t,s+(r==="arc"?20:-30),m($));return`<text x="${y.x.toFixed(1)}" y="${(y.y+4).toFixed(1)}" text-anchor="middle" font-size="10" fill="#9A9996" font-family="Arial,sans-serif">${$}</text>`}).join("");let d="";if(r==="speedometer"){const $=m(l),y=F(i,t,s-10,$),b=F(i,t,14,$+90),E=F(i,t,14,$-90);d=`
      <polygon points="${y.x.toFixed(1)},${y.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${E.x.toFixed(1)},${E.y.toFixed(1)}" fill="${n}" opacity="0.9"/>
      <circle cx="${i}" cy="${t}" r="12" fill="${n}"/>
      <circle cx="${i}" cy="${t}" r="6"  fill="white"/>
    `,d+=[0,25,50,75,100].map(H=>{const R=m(H),_=F(i,t,s-16,R),v=F(i,t,s+3,R);return`<line x1="${_.x.toFixed(1)}" y1="${_.y.toFixed(1)}" x2="${v.x.toFixed(1)}" y2="${v.y.toFixed(1)}" stroke="#9A9996" stroke-width="1.5"/>`}).join("")}const w=r==="arc"?t+22:t+40,x=r==="arc"?t-6:t+58,h=`
    <text x="${i}" y="${x}" text-anchor="middle" font-size="12" fill="${n}" font-family="Arial,sans-serif" font-weight="600">${e}</text>
    <text x="${i}" y="${w}"  text-anchor="middle" font-size="38" fill="${n}" font-family="Arial,sans-serif" font-weight="700">${l}%</text>
    <text x="${i}" y="${w+18}" text-anchor="middle" font-size="9" fill="#9A9996" font-family="Arial,sans-serif">90% CI: ${o}% – ${f}%</text>
  `;return`<svg width="320" height="260" viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="260" fill="white"/>
    ${A}
    ${u}
    ${g}
    ${a}
    ${d}
    ${p}
    ${h}
  </svg>`}const k=[{key:"moistureContent",label:"Moisture Content (MC)",weight:"33%"},{key:"porosity",label:"Porosity",weight:"24%"},{key:"al2o3",label:"Al₂O₃",weight:"18%"},{key:"cao",label:"CaO",weight:"14%"},{key:"sio2",label:"SiO₂",weight:"7%"},{key:"fe2o3",label:"Fe₂O₃",weight:"4%"}],B={positive:"#437A22",neutral:"#20808D",negative:"#964219"};function I(c){const e=k.length*32+50,n=490,i=33,t=k.map(({key:A,label:u,weight:g},a)=>{const p=c[A],d=Math.max(3,p.contribution/i*280),w=B[p.impact]??"#20808D",x=32+a*32;return`
      <text x="182" y="${x+24/2-4}" text-anchor="end" font-size="9" fill="#7A7974" font-family="Arial,sans-serif">${g}</text>
      <text x="182" y="${x+24/2+7}" text-anchor="end" font-size="10" fill="#28251D" font-family="Arial,sans-serif">${u}</text>
      <rect x="190" y="${x}" width="280" height="24" rx="4" fill="#F0EFEB"/>
      <rect x="190" y="${x}" width="${d.toFixed(1)}" height="24" rx="4" fill="${w}" opacity="0.85"/>
      <text x="${190+d+5}" y="${x+24/2+4}" font-size="9" fill="${w}" font-family="Arial,sans-serif" font-weight="600">${p.contribution.toFixed(1)}</text>
    `}).join(""),s=[{label:"Positive",color:"#437A22"},{label:"Neutral",color:"#20808D"},{label:"Negative",color:"#964219"}].map(({label:A,color:u},g)=>`<rect x="${190+g*130}" y="${e-12}" width="10" height="10" rx="2" fill="${u}" opacity="0.85"/>
     <text x="${190+g*130+14}" y="${e-3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">${A}</text>`).join("");return`<svg width="${n}" height="${e}" viewBox="0 0 ${n} ${e}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${n}" height="${e}" fill="white"/>
    <text x="0" y="16" font-size="12" font-weight="600" fill="#28251D" font-family="Arial,sans-serif">Factor Contributions to Adhesivity Score</text>
    ${t}
    ${s}
  </svg>`}function z(c){const{variableChecks:r,stoneType:l}=c;if(r.length===0)return'<svg width="100" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="white"/><text x="10" y="24" font-size="10" fill="#9A9996" font-family="Arial,sans-serif">No variable data</text></svg>';const o=20,f=6,e=80,n=380,i=o*2+f+8,t=r.length*i+50,s=e+n+70,A=Math.max(...r.flatMap(a=>[a.userValue,a.refValue]),1),u=r.map((a,p)=>{const d=Math.max(3,a.userValue/A*n),w=Math.max(3,a.refValue/A*n),x=a.inBounds?"#437A22":"#D19900",h=32+p*i,$=y=>y<.1?y.toFixed(4):y.toFixed(2);return`
      <text x="${e-5}" y="${h+o-3}"   text-anchor="end" font-size="10" fill="#28251D" font-family="Arial,sans-serif">${a.label}</text>
      <text x="${e-5}" y="${h+9}"            text-anchor="end" font-size="8"  fill="${x}" font-family="Arial,sans-serif">${a.inBounds?"✓ in range":"⚠ deviation"}</text>
      <rect x="${e}" y="${h}"             width="${n}" height="${o}" rx="3" fill="#F0EFEB"/>
      <rect x="${e}" y="${h}"             width="${d.toFixed(1)}" height="${o}" rx="3" fill="${x}" opacity="0.75"/>
      <text x="${e+d+4}" y="${h+o-4}" font-size="8" fill="${x}" font-family="Arial,sans-serif" font-weight="600">${$(a.userValue)}%</text>
      <rect x="${e}" y="${h+o+3}" width="${n}" height="${o}" rx="3" fill="#F0EFEB"/>
      <rect x="${e}" y="${h+o+3}" width="${w.toFixed(1)}" height="${o}" rx="3" fill="#9A9996" opacity="0.45"/>
      <text x="${e+w+4}" y="${h+o*2}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">${$(a.refValue)}%</text>
    `}).join(""),g=`
    <rect x="${e}"       y="${t-12}" width="10" height="10" rx="2" fill="#437A22" opacity="0.75"/>
    <text x="${e+14}" y="${t-3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Entered (in range)</text>
    <rect x="${e+120}" y="${t-12}" width="10" height="10" rx="2" fill="#D19900" opacity="0.75"/>
    <text x="${e+134}" y="${t-3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Entered (deviation)</text>
    <rect x="${e+250}" y="${t-12}" width="10" height="10" rx="2" fill="#9A9996" opacity="0.45"/>
    <text x="${e+264}" y="${t-3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Reference (${l})</text>
  `;return`<svg width="${s}" height="${t}" viewBox="0 0 ${s} ${t}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${s}" height="${t}" fill="white"/>
    <text x="0" y="16" font-size="12" font-weight="600" fill="#28251D" font-family="Arial,sans-serif">Variable Comparison — Entered vs ${l} Reference</text>
    ${u}
    ${g}
  </svg>`}export{I as buildFactorChartSvg,D as buildScoreMeterSvg,z as buildStoneChartSvg};
