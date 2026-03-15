import React from 'react';

const SkullarLogoAnimation = () => {
    return (
        <div className="flex items-center justify-center -space-x-1">
            <style>
                {`
                    /* Total Animation Cycle: 8s (approx 5s animation + 3s rest) */
                    
                    /* Total Duration: 8s (approx 5s drawing + 3s rest) */
                    
                    @keyframes loopContainer {
                        0%, 2% { opacity: 0; transform: scale(0.9); }
                        10%, 98% { opacity: 1; transform: scale(1); }
                        100% { opacity: 0; transform: scale(0.9); }
                    }

                    @keyframes loopPath {
                        0%, 10% { stroke-dashoffset: 2500; fill: transparent; opacity: 1; }
                        25% { stroke-dashoffset: 1250; fill: transparent; opacity: 1; }
                        32.5% { stroke-dashoffset: 0; fill: rgba(255,255,255,0.2); }
                        35%, 98% { stroke-dashoffset: 0; fill: white; opacity: 1; }
                        100% { stroke-dashoffset: 0; fill: white; opacity: 0; }
                    }

                    @keyframes loopDot {
                        0%, 32.5% { transform: translateY(-40px); opacity: 0; filter: drop-shadow(0 0 2px #ffbc00); }
                        37% { transform: translateY(5px); opacity: 1; }
                        40% { transform: translateY(0); opacity: 1; }
                        45%, 65%, 85% { filter: drop-shadow(0 0 15px #ffbc00); opacity: 1; transform: translateY(0); }
                        55%, 75%, 95% { filter: drop-shadow(0 0 5px #ffbc00); opacity: 1; transform: translateY(0); }
                        98% { transform: translateY(0); filter: drop-shadow(0 0 5px #ffbc00); opacity: 1; }
                        100% { transform: translateY(0); filter: drop-shadow(0 0 2px #ffbc00); opacity: 0; }
                    }

                    @keyframes loopLetter1 {
                        0%, 41.25% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        45.75% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        48.75%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    @keyframes loopLetter2 {
                        0%, 43.75% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        48.25% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        51.25%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    @keyframes loopLetter3 {
                        0%, 46.25% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        50.75% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        53.75%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    @keyframes loopLetter4 {
                        0%, 48.75% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        53.25% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        56.25%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    @keyframes loopLetter5 {
                        0%, 51.25% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        55.75% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        58.75%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    @keyframes loopLetter6 {
                        0%, 53.75% { transform: translateY(40px) scaleY(0.5); opacity: 0; }
                        58.25% { transform: translateY(-10px) scaleY(1.1); opacity: 1; }
                        61.25%, 98% { transform: translateY(0) scaleY(1); opacity: 1; }
                        100% { opacity: 0; transform: translateY(0) scaleY(1); }
                    }

                    .animate-container { animation: loopContainer 8s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
                    .animate-path { stroke-dasharray: 2500; stroke-dashoffset: 2500; animation: loopPath 8s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
                    .animate-dot { opacity: 0; animation: loopDot 8s ease-in-out infinite; }

                    .animate-l1 { opacity: 0; display: inline-block; animation: loopLetter1 8s ease-in-out infinite; }
                    .animate-l2 { opacity: 0; display: inline-block; animation: loopLetter2 8s ease-in-out infinite; }
                    .animate-l3 { opacity: 0; display: inline-block; animation: loopLetter3 8s ease-in-out infinite; }
                    .animate-l4 { opacity: 0; display: inline-block; animation: loopLetter4 8s ease-in-out infinite; }
                    .animate-l5 { opacity: 0; display: inline-block; animation: loopLetter5 8s ease-in-out infinite; }
                    .animate-l6 { opacity: 0; display: inline-block; animation: loopLetter6 8s ease-in-out infinite; }
                `}
            </style>

            {/* Icon Container */}
            <div className="relative animate-container w-32 h-32 bg-[#003a5f] rounded-tl-[32px] rounded-tr-[32px] rounded-bl-[32px] rounded-br-[4px] flex items-center justify-center overflow-hidden shadow-2xl shadow-[#003a5f]/30 ring-1 ring-white/10">
                <svg
                    viewBox="104.221 -712.482 551.926 656.375"
                    className="w-24 h-24"
                >
                    <g transform="scale(1, -1)">
                        {/* Main S Shape - Accurate Curvature */}
                        <path
                            className="animate-path"
                            d="M 294.209,128.152 C 266.482,138.903 243.229,153.929 224.479,173.225 C 205.68,192.517 191.461,215.055 181.744,240.842 L 284.704,300.514 C 290.84,285.997 298.707,273.341 308.329,262.522 C 317.951,251.718 329.797,243.296 343.887,237.295 C 357.991,231.29 374.811,228.242 394.367,228.149 C 413.083,228.303 427.619,230.493 437.94,234.702 C 448.271,238.918 455.442,244.234 459.466,250.686 C 463.492,257.148 465.423,263.813 465.24,270.682 C 465.359,281.187 461.819,290.084 454.606,297.342 C 447.409,304.594 435.839,311.262 419.94,317.371 C 414.487,319.453 408.446,321.606 401.82,323.784 C 409.119,323.745 416.329,323.303 423.147,326.602 C 443.955,337.018 435.519,355.935 446.948,365.068 C 462.873,377.794 473.865,394.49 479.556,412.967 C 497.998,405.694 514.918,396.559 530.34,385.561 C 546.639,373.928 559.681,358.97 569.504,340.684 C 579.315,322.397 584.354,299.564 584.61,272.169 C 584.312,238.483 575.959,209.686 559.528,185.82 C 543.098,161.935 520.351,143.653 491.328,130.966 C 462.293,118.282 428.73,111.878 390.632,111.76 C 354.072,111.93 321.929,117.387 294.209,128.152 Z M 300.312,356.967 C 282.091,364.944 265.682,375.011 251.129,387.148 C 236.574,399.295 225.019,414.25 216.494,432.014 C 207.961,449.788 203.573,471.123 203.383,495.97 C 203.592,521.197 208.489,543.652 218.082,563.297 C 227.666,582.968 240.706,599.596 257.196,613.203 C 273.674,626.81 292.361,637.154 313.232,644.227 C 334.111,651.288 355.927,654.846 378.702,654.891 C 421.819,654.779 459.612,644.737 492.108,624.769 C 524.584,604.793 550.438,575.535 569.688,537.011 L 476.146,482.281 L 476.389,482.41 C 475.897,483.518 475.386,484.545 474.862,485.517 C 457.327,527.082 406.548,551.197 362.942,541.048 C 344.755,536.816 334.815,530.606 319.882,519.952 C 281.859,486.378 273.082,436.243 297.976,392.098 C 302.628,383.811 308.163,378.35 314.316,371.343 C 318.676,366.381 324.175,364.429 326.274,357.517 C 327.527,353.398 328.47,349.339 329.697,345.486 C 319.729,348.934 309.928,352.76 300.312,356.967 Z"
                            fill="none"
                            stroke="white"
                            strokeWidth="15"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Bulb Details (Base and Neck/Filament) */}
                        {/* Filament Stem - Horizontal Neck Part */}
                        <path
                            className="animate-path"
                            d="M 368.24,254.284 C 361.87,256.382 355.001,258.295 356.222,266.716 C 356.354,267.723 355.986,271.372 356.272,272.015 C 357.273,274.161 366.348,273.159 368.854,273.294 L 390.748,273.294 C 397.462,273.294 405.277,273.76 411.835,273.055 C 413.689,266.982 413.676,258.505 405.967,256.177 C 395.007,251.527 379.731,251.559 368.24,254.284 Z"
                            fill="white"
                        />
                        {/* 3 Horizontal Base Bars */}
                        <path className="animate-path" d="M 388.756,281.311 L 359.569,281.311 C 356.348,281.447 351.626,280.583 348.986,282.667 C 345.928,285.101 346.235,292.526 350.265,293.986 C 353.662,295.193 363.421,294.576 367.525,294.576 C 383.675,294.576 399.812,294.655 415.939,294.562 C 423.384,294.946 423.829,282.312 417.244,281.465" fill="white" />
                        <path className="animate-path" d="M 399.367,302.627 L 358.912,302.627 C 354.635,302.611 347.5,301.681 347.045,307.838 C 344.803,315.773 353.151,315.947 358.246,315.87 L 404.671,315.87" fill="white" />
                        <path className="animate-path" d="M 399.367,302.627 L 358.912,302.627 C 354.635,302.611 347.5,301.681 347.045,307.838 C 344.803,315.773 353.151,315.947 358.246,315.87 L 404.671,315.87" fill="white" />

                        {/* VERTICAL FILAMENT STEM - CONNECTS TO DOT AND BASE */}
                        <path
                            className="animate-path"
                            d="M 384,316 L 384,415"
                            fill="none"
                            stroke="white"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />

                        {/* Innovation Pulse Dot (Yellow Ball) */}
                        <ellipse
                            className="animate-dot"
                            cx="384.094"
                            cy="442.688"
                            rx="30"
                            ry="30"
                            fill="#ffbc00"
                        />
                    </g>
                </svg>
            </div>

            {/* Typography Section */}
            <div className="flex items-center text-[#003a5f] font-black text-[7rem] tracking-tighter select-none" style={{ fontFamily: "'Montserrat', sans-serif", lineHeight: 1, marginTop: '20px', marginLeft: '6px' }}>
                <span className="animate-l1">k</span>
                <span className="animate-l2">u</span>
                <span className="animate-l3">l</span>
                <span className="animate-l4">l</span>
                <span className="animate-l5">a</span>
                <span className="animate-l6">r</span>
            </div>
        </div>
    );
};

export default SkullarLogoAnimation;
