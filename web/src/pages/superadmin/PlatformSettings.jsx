const PlatformSettings = () => {
    return (
        <div className="flex flex-col gap-7">
            <div>
                <h1 className="text-2xl font-extrabold text-white">Platform Settings</h1>
                <p className="text-sm text-gray-400 mt-0.5">No configurable settings</p>
            </div>

            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-10 text-center text-gray-500 text-sm">
                This section currently has no editable options.
            </div>
        </div>
    );
};

export default PlatformSettings;
