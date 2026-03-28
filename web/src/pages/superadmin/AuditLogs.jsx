const AuditLogs = () => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-extrabold text-white">Audit Logs</h1>
                <p className="text-sm text-gray-400 mt-0.5">No logs available</p>
            </div>

            <div className="bg-[#0F1A2E] border border-white/5 rounded-2xl p-10 text-center text-gray-500 text-sm">
                No audit events recorded yet.
            </div>
        </div>
    );
};

export default AuditLogs;
