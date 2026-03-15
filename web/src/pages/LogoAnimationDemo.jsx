import React, { useState, useEffect } from 'react';
import SkullarLogoAnimation from '../components/ui/SkullarLogoAnimation';

const LogoAnimationDemo = () => {
    const [key, setKey] = useState(0);

    const restartAnimation = () => {
        setKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <div className="bg-white p-24 rounded-[48px] shadow-2xl border border-gray-100 flex items-center justify-center min-h-[500px] min-w-[800px]">
                <SkullarLogoAnimation key={key} />
            </div>

            <div className="mt-12 flex flex-col items-center gap-4">
                <button
                    onClick={restartAnimation}
                    className="px-8 py-3 bg-[#003a5f] text-white rounded-2xl font-bold hover:bg-[#002a45] transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                    Replay Animation
                </button>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                    Clean • Minimal • Modern
                </p>
            </div>
        </div>
    );
};

export default LogoAnimationDemo;
