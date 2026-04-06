import sys, re

path = r'c:\Users\kobby\OneDrive\Documentos\GitHub\SmartSchool\web\src\pages\SkullarConnect.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

dm_component = '''
const DirectMessaging = ({ users, schoolId, userId, userRole, userName, userProfilePhoto }) => {
    const [chats, setChats] = React.useState([]);
    const [activeTarget, setActiveTarget] = React.useState(null);
    const [msgText, setMsgText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const msgsEndRef = React.useRef(null);

    const fetchChats = async (targetId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/connect/chats/${targetId}`, { headers: { 'x-user-id': userId, 'x-school-id': schoolId } });
            if(res.ok) setChats(await res.json());
        } catch(e){}
        setLoading(false);
    };

    React.useEffect(() => {
        if(activeTarget) { fetchChats(activeTarget.id); const iv = setInterval(()=>fetchChats(activeTarget.id), 5000); return ()=>clearInterval(iv); }
    }, [activeTarget]);
    
    React.useEffect(() => {
        msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats]);

    const handleSend = async () => {
        if(!msgText.trim() || !activeTarget) return;
        const tempText = msgText;
        setMsgText('');
        try {
            const res = await fetch(`/api/connect/chats/${activeTarget.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId, 'x-school-id': schoolId },
                body: JSON.stringify({ text: tempText, authorName: userName, authorPhoto: userProfilePhoto })
            });
            if(res.ok) setChats(c => [...c, await res.json()]);
        } catch(e){}
    };

    return (
        <div className="flex bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden min-h-[600px] col-span-2">
            {/* Sidebar */}
            <div className="w-[280px] border-r border-purple-50 flex flex-col bg-purple-50/20 shrink-0">
                <div className="p-4 border-b border-purple-50 bg-white"><h3 className="font-black text-sm text-dark-text">Direct Messages</h3></div>
                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {users.map(u => (
                        <button key={u.id} onClick={()=>setActiveTarget(u)} className={clx("w-full flex items-center gap-3 p-3 rounded-xl transition-all", activeTarget?.id === u.id ? 'bg-violet-100/50 shadow-sm border border-violet-100' : 'hover:bg-purple-50')}>
                            <Avatar name={u.name} photo={u.profilePhoto} size={10} />
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-xs font-black text-dark-text truncate">{u.name}</p>
                                <p className="text-[10px] tracking-wider text-purple-400 font-bold uppercase">{u.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            {/* Main Chat */}
            <div className="flex-1 flex flex-col bg-[#FAFAFA]">
                {activeTarget ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-purple-50 flex items-center gap-3 shadow-sm z-10">
                            <Avatar name={activeTarget.name} photo={activeTarget.profilePhoto} size={10} />
                            <div>
                                <h3 className="font-black text-sm text-dark-text">{activeTarget.name}</h3>
                                <p className="text-[10px] text-purple-400 font-bold">{activeTarget.handle}</p>
                            </div>
                        </div>
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                            {chats.length === 0 && <div className="my-auto text-center text-xs text-purple-300 font-bold">Say hello to {activeTarget.name}!</div>}
                            {chats.map(c => {
                                const isMe = c.fromId === userId;
                                return (
                                    <div key={c.id} className={clx("flex flex-col max-w-[70%]", isMe ? 'self-end items-end' : 'self-start items-start')}>
                                        <div className={clx("px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm", isMe ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-br-sm' : 'bg-white border border-purple-100 text-dark-text rounded-bl-sm')}>
                                            {c.text}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={msgsEndRef} />
                        </div>
                        {/* Input */}
                        <div className="p-4 bg-white border-t border-purple-50">
                            <div className="flex items-center gap-2 bg-purple-50/50 rounded-full p-1 pl-5 border border-purple-100 focus-within:border-violet-300 focus-within:bg-white shadow-sm transition-all">
                                <input type="text" value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Message..." className="flex-1 bg-transparent text-sm py-1.5 outline-none font-medium placeholder:text-purple-300 text-dark-text" />
                                <button onClick={handleSend} className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition shadow-md shrink-0"><Send size={15} className="ml-0.5" /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-purple-300 gap-3 bg-white">
                        <MessageSquare size={48} className="opacity-20" />
                        <p className="text-sm font-bold text-purple-300">Select a connection to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    )
}

'''
if 'const DirectMessaging' not in c:
    c = c.replace('export default function SkullarConnect() {', dm_component + '\nexport default function SkullarConnect() {')

# 2. Add userProfilePhoto to constants
to_replace = """    const userName = localStorage.getItem('superAdminName') || localStorage.getItem('teacherName') || localStorage.getItem('studentName') || 'Member';
    const userId = localStorage.getItem('userPhone') || localStorage.getItem('teacherId') || localStorage.getItem('studentId') || 'user';"""
replacement = """    const userName = localStorage.getItem('superAdminName') || localStorage.getItem('teacherName') || localStorage.getItem('studentName') || 'Member';
    const userProfilePhoto = localStorage.getItem('superAdminPhoto') || localStorage.getItem('teacherPhoto') || localStorage.getItem('studentPhoto') || null;
    const userId = localStorage.getItem('userPhone') || localStorage.getItem('teacherId') || localStorage.getItem('studentId') || 'user';"""
c = c.replace(to_replace, replacement)

# 3. Add authorPhoto to handlePostStory
to_replace_post = """                    authorName: userName,
                    content: storyContent,"""
repl_post = """                    authorName: userName,
                    authorPhoto: userProfilePhoto,
                    content: storyContent,"""
c = c.replace(to_replace_post, repl_post)

# Add authorPhoto to handlePost
to_replace_feed = """                    authorName: userName,
                    role: displayRole,"""
repl_feed = """                    authorName: userName,
                    authorPhoto: userProfilePhoto,
                    role: displayRole,"""
c = c.replace(to_replace_feed, repl_feed)

# 4. Avatar instances formatting
# Header Avatar
c = c.replace(
'''                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(userName)} text-white flex items-center justify-center font-black text-sm shadow-md`}>
                                {userName[0]?.toUpperCase()}
                            </div>''',
'''                            <Avatar name={userName} photo={userProfilePhoto} size={9} />'''
)

# Compose Input Avatar
c = c.replace(
'''                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(userName)} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md`}>
                                {userName[0]?.toUpperCase()}
                            </div>''',
'''                            <Avatar name={userName} photo={userProfilePhoto} size={10} />'''
)

# Feed Posts Avatar
c = c.replace(
'''                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(post.authorName)} text-white flex items-center justify-center font-black shrink-0`}>
                                    {post.authorName[0]?.toUpperCase()}
                                </div>''',
'''                                <Avatar name={post.authorName} photo={post.authorPhoto} size={10} />'''
)

c = c.replace(
'''                                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getGradient(c.authorName)} text-white flex items-center justify-center font-black text-xs shrink-0`}>
                                        {c.authorName[0]?.toUpperCase()}
                                    </div>''',
'''                                    <Avatar name={c.authorName} photo={c.authorPhoto} size={7} />'''
)

# Story Carousel Add story avatars
c = c.replace(
'''                                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGradient(s.authorName)} text-white flex items-center justify-center font-black text-xl border-3 border-white shadow-md ring-2 ring-violet-400 cursor-pointer`}>
                                        {s.authorName[0]?.toUpperCase()}
                                    </div>''',
'''                                    <Avatar name={s.authorName} photo={s.imageUrl} size={14} className="border-3 ring-2 ring-violet-400 cursor-pointer" />'''
)

# Right Sidebar connections
c = c.replace(
'''                                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getGradient(u.name)} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md`}>
                                        {u.name[0]}{u.name.split(' ')[1]?.[0] || ''}
                                    </div>''',
'''                                    <Avatar name={u.name} photo={u.profilePhoto} size={9} />'''
)

# Story Viewer Sidebar elements
c = c.replace(
'''                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getGradient(viewStory.authorName)} text-white flex items-center justify-center font-black shadow-md border-2 border-white/20 shrink-0`}>
                                                {viewStory.authorName[0]?.toUpperCase()}
                                            </div>''',
'''                                            <Avatar name={viewStory.authorName} photo={viewStory.authorPhoto} size={10} className="border-white/20" />'''
)


# 5. Conditionally hide <main> and right <aside> if activeNav == Messages
c = c.replace(
'''            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-[220px_1fr_260px] gap-5">''',
'''            {/* ── Body ── */}
            <div className={clx("max-w-7xl mx-auto px-4 py-5 grid gap-5 transition-all", activeNav === 'Messages' ? 'grid-cols-[220px_1fr]' : 'grid-cols-[220px_1fr_260px]')}>'''
)

# Hide Main and Aside
c = c.replace(
'''                {/* ── Main Feed ── */}
                <main className="space-y-4 min-w-0">''',
'''                {/* ── Dynamic Content ── */}
                {activeNav === 'Messages' ? (
                    <DirectMessaging 
                        users={users} 
                        schoolId={schoolId} 
                        userId={userId} 
                        userName={userName} 
                        userRole={userRole} 
                        userProfilePhoto={userProfilePhoto} 
                    />
                ) : (
                <><main className="space-y-4 min-w-0">'''
)

# Close fragment after aside
c = c.replace(
'''                        <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1"><Lock size={10} />Intra-school only</p>
                    </div>
                </aside>
            </div>''',
'''                        <p className="text-[10px] text-white/70 mt-1 flex items-center gap-1"><Lock size={10} />Intra-school only</p>
                    </div>
                </aside></>
                )}
            </div>'''
)


with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Rewrite successful')
