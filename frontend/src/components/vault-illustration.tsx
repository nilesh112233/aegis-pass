import { useEffect, useState } from "react";

const WORDS = [
  "zero-knowledge",
  "AES-256-GCM encrypted",
  "end-to-end encrypted",
  "your keys, your data",
  "client-side encryption",
];

const VaultIllustration = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="vault-il relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden pr-3 pb-8">
        <style>{`
          /* ── illustration palette: light ── */
          .vault-il {
            --il-fill-light:  #EEF5FF;
            --il-fill-mid:    #DAEAF8;
            --il-fill-strong: #C8D8F6;
            --il-stroke:      #1B2A6B;
            --il-accent:      #4F72E3;
            --il-white:       #ffffff;
            --il-dot:         rgba(27,42,107,0.18);
            --il-shadow:      rgba(27,42,107,0.09);
            --il-dash:        rgba(27,42,107,0.22);
            background: #fcfcfc;
          }
          /* ── illustration palette: dark ── */
          .dark .vault-il {
            --il-fill-light:  #141b2e;
            --il-fill-mid:    #1a2540;
            --il-fill-strong: #243560;
            --il-stroke:      #8aabec;
            --il-accent:      #5d7ff0;
            --il-white:       #0f1624;
            --il-dot:         rgba(138,171,236,0.25);
            --il-shadow:      rgba(0,0,0,0.40);
            --il-dash:        rgba(138,171,236,0.28);
            background: #0c0c0f;
          }
          @keyframes fade-slide-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0px); }
          }
          @keyframes fade-slide-out {
            from { opacity: 1; transform: translateY(0px); }
            to   { opacity: 0; transform: translateY(-6px); }
          }
          .word-in  { animation: fade-slide-in  0.4s ease forwards; }
          .word-out { animation: fade-slide-out 0.4s ease forwards; }
        `}</style>
        
      <svg
        width="460" height="500"
        viewBox="0 0 460 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* ── CLOUD ── */}
        <path
          d="M32 90 Q32 104 50 104 L154 104 Q172 104 172 88 Q172 74 156 72 Q158 52 136 50 Q132 32 110 36 Q96 24 76 30 Q54 34 52 54 Q34 56 32 72Z"
          style={{ fill: "var(--il-fill-light)", stroke: "var(--il-stroke)" }}
          strokeWidth="2.2" strokeLinejoin="round"
        />

        {/* ── GEAR large ── */}
        <circle cx="370" cy="66" r="22" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <circle cx="370" cy="66" r="11" style={{ fill: "var(--il-white)",        stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        {/* cardinal teeth */}
        <rect x="366" y="33"  width="9" height="11" rx="3" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="366" y="87"  width="9" height="11" rx="3" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="337" y="62"  width="11" height="9" rx="3" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="392" y="62"  width="11" height="9" rx="3" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        {/* diagonal teeth */}
        <rect x="347" y="42"  width="9" height="11" rx="3" transform="rotate(45 352 48)"  style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="386" y="42"  width="9" height="11" rx="3" transform="rotate(-45 390 48)" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="347" y="78"  width="9" height="11" rx="3" transform="rotate(-45 352 84)" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="386" y="78"  width="9" height="11" rx="3" transform="rotate(45 390 84)"  style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>

        {/* ── GEAR small ── */}
        <circle cx="414" cy="106" r="14" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <circle cx="414" cy="106" r="7"  style={{ fill: "var(--il-white)",        stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="411" y="88"  width="6" height="10" rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="411" y="114" width="6" height="10" rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="396" y="103" width="10" height="6"  rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="422" y="103" width="10" height="6"  rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>

        {/* ── decorative dots ── */}
        <circle cx="330" cy="40"  r="4"   style={{ fill: "var(--il-dot)" }}/>
        <circle cx="320" cy="50"  r="2.5" style={{ fill: "var(--il-dot)" }}/>
        <circle cx="188" cy="38"  r="3.5" style={{ fill: "var(--il-dot)" }}/>
        <circle cx="198" cy="30"  r="2"   style={{ fill: "var(--il-dot)" }}/>
        <circle cx="44"  cy="280" r="3"   style={{ fill: "var(--il-dot)" }}/>
        <circle cx="54"  cy="290" r="2"   style={{ fill: "var(--il-dot)" }}/>
        <circle cx="430" cy="208" r="3"   style={{ fill: "var(--il-dot)" }}/>
        <circle cx="438" cy="218" r="2"   style={{ fill: "var(--il-dot)" }}/>

        {/* ── plus signs ── */}
        <g opacity="0.2">
          <rect x="218" y="28" width="5" height="15" rx="2.5" style={{ fill: "var(--il-stroke)" }}/>
          <rect x="213" y="33" width="15" height="5"  rx="2.5" style={{ fill: "var(--il-stroke)" }}/>
        </g>
        <g opacity="0.14">
          <rect x="34"  y="320" width="4" height="13" rx="2" style={{ fill: "var(--il-stroke)" }}/>
          <rect x="30"  y="324" width="13" height="4" rx="2" style={{ fill: "var(--il-stroke)" }}/>
        </g>
        <g opacity="0.14">
          <rect x="424" y="360" width="4" height="13" rx="2" style={{ fill: "var(--il-stroke)" }}/>
          <rect x="420" y="364" width="13" height="4" rx="2" style={{ fill: "var(--il-stroke)" }}/>
        </g>

        {/* ── CREDENTIAL CARD ── */}
        <rect x="27" y="150" width="114" height="66" rx="11" style={{ fill: "var(--il-shadow)" }} transform="translate(4,5)"/>
        <rect x="27" y="150" width="114" height="66" rx="11" style={{ fill: "var(--il-white)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="39" y="162" width="54"  height="8"  rx="3" style={{ fill: "var(--il-fill-strong)" }}/>
        <rect x="101" y="159" width="28" height="20" rx="4" style={{ fill: "var(--il-fill-light)", stroke: "var(--il-stroke)" }} strokeWidth="1.5"/>
        <circle cx="111" cy="171" r="2.5" style={{ fill: "var(--il-stroke)" }}/>
        {[40, 55, 70, 85, 100].map((cx, i) => (
          <circle key={i} cx={cx} cy="188" r="4.5" style={{ fill: "var(--il-accent)" }} opacity="0.75"/>
        ))}
        <rect x="39" y="200" width="90" height="6" rx="3" style={{ fill: "var(--il-fill-light)" }}/>

        {/* ── MONITOR ── */}
        <rect x="115" y="164" width="262" height="192" rx="14" style={{ fill: "var(--il-shadow)" }} transform="translate(4,5)"/>
        <rect x="112" y="160" width="262" height="192" rx="14" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="124" y="172" width="238" height="168" rx="8" style={{ fill: "var(--il-fill-light)" }}/>
        {/* screen lines */}
        <rect x="140" y="188" width="88"  height="10" rx="4" style={{ fill: "var(--il-fill-strong)" }}/>
        <rect x="140" y="206" width="168" height="7"  rx="3" style={{ fill: "var(--il-fill-mid)" }}/>
        <rect x="140" y="220" width="148" height="7"  rx="3" style={{ fill: "var(--il-fill-mid)" }}/>
        <rect x="140" y="234" width="128" height="7"  rx="3" style={{ fill: "var(--il-fill-mid)" }}/>
        <rect x="140" y="248" width="108" height="7"  rx="3" style={{ fill: "var(--il-fill-mid)" }}/>
        {/* screen button */}
        <rect x="140" y="262" width="78"  height="26" rx="7" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="1.5"/>
        <rect x="150" y="270" width="38"  height="8"  rx="4" style={{ fill: "var(--il-accent)" }} opacity="0.55"/>
        {/* stand */}
        <rect x="230" y="352" width="28" height="16" rx="4" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="198" y="366" width="90" height="12" rx="6" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>

        {/* signal arcs */}
        <path d="M376 222 Q392 206 376 190" style={{ stroke: "var(--il-stroke)" }} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.28"/>
        <path d="M385 230 Q407 206 385 182" style={{ stroke: "var(--il-stroke)" }} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.18"/>
        <path d="M394 238 Q422 206 394 174" style={{ stroke: "var(--il-stroke)" }} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.10"/>

        {/* ── MOBILE PHONE ── */}
        <rect x="38"  y="324" width="106" height="172" rx="18" style={{ fill: "var(--il-shadow)" }} transform="translate(4,5)"/>
        <rect x="36"  y="320" width="106" height="172" rx="18" style={{ fill: "var(--il-white)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <rect x="44"  y="332" width="90"  height="148" rx="12" style={{ fill: "var(--il-fill-light)" }}/>
        {/* notch */}
        <rect x="66"  y="326" width="46"  height="8"   rx="4"  style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="1.5"/>
        <circle cx="89" cy="330" r="3" style={{ fill: "var(--il-stroke)" }} opacity="0.35"/>
        {/* home bar */}
        <rect x="69" y="480" width="40" height="5" rx="2.5" style={{ fill: "var(--il-fill-strong)" }}/>
        {/* header */}
        <rect x="52" y="340" width="74" height="20" rx="5" style={{ fill: "var(--il-fill-strong)" }}/>
        <rect x="58" y="345" width="36" height="8"  rx="3" style={{ fill: "var(--il-accent)" }} opacity="0.55"/>
        <rect x="106" y="347" width="10" height="10" rx="3" style={{ fill: "var(--il-fill-light)", stroke: "var(--il-stroke)" }} strokeWidth="1.2"/>
        <path d="M108 344V342C108 340.3 109.3 339 111 339C112.7 339 114 340.3 114 342V344"
          style={{ stroke: "var(--il-stroke)" }} transform="translate(0,3)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="111" cy="352" r="1.8" style={{ fill: "var(--il-stroke)" }}/>

        {/* phone entry 1 */}
        <rect x="52" y="368" width="74" height="34" rx="8" style={{ fill: "var(--il-white)", stroke: "var(--il-stroke)" }} strokeWidth="1.5"/>
        <rect x="60" y="375" width="26" height="6"  rx="3" style={{ fill: "var(--il-fill-strong)" }}/>
        {[64,75,86,97,108].map((cx,i)=>(
          <circle key={i} cx={cx} cy="392" r="3.5" style={{ fill: "var(--il-stroke)" }} opacity="0.65"/>
        ))}
        <rect x="109" y="374" width="8" height="10" rx="2" style={{ fill: "var(--il-fill-light)", stroke: "var(--il-stroke)" }} strokeWidth="1.2"/>
        <rect x="106" y="372" width="8" height="10" rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="1.2"/>

        {/* phone entry 2 */}
        <rect x="52" y="410" width="74" height="34" rx="8" style={{ fill: "var(--il-white)", stroke: "var(--il-stroke)" }} strokeWidth="1.5"/>
        <rect x="60" y="417" width="34" height="6"  rx="3" style={{ fill: "var(--il-fill-strong)" }}/>
        {[64,75,86,97,108].map((cx,i)=>(
          <circle key={i} cx={cx} cy="434" r="3.5" style={{ fill: "var(--il-stroke)" }} opacity="0.65"/>
        ))}
        <rect x="109" y="416" width="8" height="10" rx="2" style={{ fill: "var(--il-fill-light)", stroke: "var(--il-stroke)" }} strokeWidth="1.2"/>
        <rect x="106" y="414" width="8" height="10" rx="2" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="1.2"/>

        {/* phone entry 3 muted */}
        <rect x="52" y="452" width="74" height="20" rx="6" style={{ fill: "var(--il-fill-light)", stroke: "var(--il-fill-strong)" }} strokeWidth="1.2"/>
        {[64,75,86,97].map((cx,i)=>(
          <circle key={i} cx={cx} cy="462" r="3" style={{ fill: "var(--il-stroke)" }} opacity="0.3"/>
        ))}

        {/* shield badge on phone corner */}
        <circle cx="136" cy="482" r="13" style={{ fill: "var(--il-accent)", stroke: "var(--il-white)" }} strokeWidth="2.5"/>
        <path d="M136 474L129 477V482C129 487 132 491 136 492.5C140 491 143 487 143 482V477L136 474Z"
          fill="white" opacity="0.92"/>

        {/* ── SHIELD — standalone bottom right ── */}
        <path d="M336 316L280 340V378C280 408 302 432 336 444C370 432 392 408 392 378V340L336 316Z"
          style={{ fill: "var(--il-shadow)" }} transform="translate(5,6)"/>
        <path d="M336 316L280 340V378C280 408 302 432 336 444C370 432 392 408 392 378V340L336 316Z"
          style={{ fill: "var(--il-fill-strong)" }}/>
        <path d="M336 316L280 340V378C280 408 302 432 336 444C370 432 392 408 392 378V340L336 316Z"
          fill="none" style={{ stroke: "var(--il-stroke)" }} strokeWidth="3" strokeLinejoin="round"/>
        {/* shackle */}
        <path d="M318 372V360C318 348 326 342 336 342C346 342 354 348 354 360V372"
          style={{ stroke: "var(--il-stroke)" }} strokeWidth="7.5" strokeLinecap="round" fill="none"/>
        {/* lock body */}
        <rect x="315" y="373" width="46" height="38" rx="8" style={{ fill: "var(--il-shadow)" }} transform="translate(3,3)"/>
        <rect x="313" y="371" width="46" height="38" rx="8" style={{ fill: "var(--il-white)", stroke: "var(--il-stroke)" }} strokeWidth="2.5"/>
        <circle cx="336" cy="386" r="7" style={{ fill: "var(--il-stroke)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="333.5" y="390" width="5" height="11" rx="2.5" style={{ fill: "var(--il-stroke)", stroke: "var(--il-stroke)" }} strokeWidth="1.8"/>

        {/* ── dashed connectors ── */}
        <path d="M142 380 Q166 352 174 318"
          style={{ stroke: "var(--il-dash)" }} strokeWidth="1.5" strokeDasharray="4 5" fill="none"/>
        <path d="M108 195 Q152 208 165 228"
          style={{ stroke: "var(--il-dash)" }} strokeWidth="1.5" strokeDasharray="4 5" fill="none"/>
        {/* <circle cx="156" cy="350" r="3"   style={{ fill: "var(--il-dot)" }}/> */}
        {/* <circle cx="152" cy="214" r="2.5" style={{ fill: "var(--il-dot)" }}/> */}

        {/* ── PLANT ── */}
        <path d="M418 438 L413 458 L441 458 L436 438Z" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="411" y="436" width="36" height="7" rx="3" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2"/>
        <rect x="416" y="438" width="26" height="6" rx="2" style={{ fill: "var(--il-fill-mid)" }}/>
        <path d="M427 436 Q427 416 427 410" style={{ stroke: "var(--il-stroke)" }} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M427 426 Q412 418 414 404 Q425 410 427 426Z" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M427 420 Q442 412 440 398 Q429 404 427 420Z" style={{ fill: "var(--il-fill-strong)", stroke: "var(--il-stroke)" }} strokeWidth="2" strokeLinejoin="round"/>
        <path d="M427 424 Q418 416 416 406" style={{ stroke: "var(--il-stroke)" }} strokeWidth="1" opacity="0.4" fill="none"/>
        <path d="M427 418 Q436 410 438 400" style={{ stroke: "var(--il-stroke)" }} strokeWidth="1" opacity="0.4" fill="none"/>
      </svg>

      {/* cycling text */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 mt-10">
        <div className="h-px w-10" style={{ backgroundColor: "var(--il-stroke)", opacity: 0.3 }}/>
        <span
          key={index}
          className={`text-[10px] tracking-[0.2em] uppercase whitespace-nowrap ${visible ? "word-in" : "word-out"}`}
          style={{ color: "var(--il-accent)" }}
        >
          {WORDS[index]}
        </span>
        <div className="h-px w-10" style={{ backgroundColor: "var(--il-stroke)", opacity: 0.3 }}/>
      </div>
    </div>
  );
};

export default VaultIllustration;