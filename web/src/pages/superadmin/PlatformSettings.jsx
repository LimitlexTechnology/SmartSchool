import React, { useState } from 'react';
import { Save } from 'lucide-react';

const Toggle = ({ value, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
        <div>
            <p className="text-sm font-bold text-white">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${value ? 'bg-primary-teal' : 'bg-white/10'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
        </button>
    </div>
);

const PlatformSettings = () => {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        newRegistrations: true,
        aiFeatures: true,
        parentPortal: true,
        smartIdScanning: true,
        virtualClass: true,
        emailNotifications: true,
        smsAlerts: false,
    });

    const [prices, setPrices] = useState({ basic: '49', premium: '99' });
    const [saved, setSaved] = useState(false);

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="flex flex-col gap-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Global configuration for SmartSchool</p>
                </div>
                <button onClick={handleSave}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-primary-teal text-white hover:bg-secondary-teal'}`}>
                    <Save size={16} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Toggles */}
                <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-white mb-1">Platform Controls</h3>
                    <p className="text-xs text-gray-500 mb-5">Toggle global platform features</p>
                    <Toggle value={settings.maintenanceMode} onChange={() => toggle('maintenanceMode')} label="Maintenance Mode" description="Temporarily disable access for all users except SuperAdmin" />
                    <Toggle value={settings.newRegistrations} onChange={() => toggle('newRegistrations')} label="New School Registrations" description="Allow new schools to sign up on the platform" />
                    <Toggle value={settings.aiFeatures} onChange={() => toggle('aiFeatures')} label="AI Features" description="Enable AI Lesson Notes and smart suggestions" />
                    <Toggle value={settings.virtualClass} onChange={() => toggle('virtualClass')} label="Virtual Classroom" description="Enable live video class sessions" />
                    <Toggle value={settings.smartIdScanning} onChange={() => toggle('smartIdScanning')} label="Smart ID Scanning" description="Enable student/staff ID card scanning" />
                    <Toggle value={settings.parentPortal} onChange={() => toggle('parentPortal')} label="Parent Portal" description="Allow parents to access the SmartSchool parent app" />
                </div>

                <div className="flex flex-col gap-6">
                    {/* Notification Settings */}
                    <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-1">Notifications</h3>
                        <p className="text-xs text-gray-500 mb-5">Control platform notification channels</p>
                        <Toggle value={settings.emailNotifications} onChange={() => toggle('emailNotifications')} label="Email Notifications" description="Send system emails to school admins" />
                        <Toggle value={settings.smsAlerts} onChange={() => toggle('smsAlerts')} label="SMS Alerts" description="Send SMS for critical events (additional cost)" />
                    </div>

                    {/* Pricing */}
                    <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-white mb-1">Subscription Pricing</h3>
                        <p className="text-xs text-gray-500 mb-5">Set monthly plan prices (USD)</p>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Basic Plan ($/month)</label>
                                <div className="flex items-center">
                                    <span className="px-3 py-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-sm text-gray-400">$</span>
                                    <input value={prices.basic} onChange={e => setPrices(p => ({ ...p, basic: e.target.value }))}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-r-xl text-sm text-white outline-none focus:border-primary-teal/50 transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1.5">Premium Plan ($/month)</label>
                                <div className="flex items-center">
                                    <span className="px-3 py-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-sm text-gray-400">$</span>
                                    <input value={prices.premium} onChange={e => setPrices(p => ({ ...p, premium: e.target.value }))}
                                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-r-xl text-sm text-white outline-none focus:border-primary-teal/50 transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
                        <h3 className="text-base font-bold text-rose-400 mb-1">Danger Zone</h3>
                        <p className="text-xs text-gray-500 mb-5">Irreversible platform actions</p>
                        <button className="w-full py-2.5 rounded-xl border border-rose-500/30 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition">
                            Clear All Audit Logs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformSettings;
