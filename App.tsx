
import React, { useState, useMemo, useEffect } from 'react';
import { AppStep, UserProfile, VALUE_OPTIONS, Role, Message, Participant, ANIMAL_AVATARS, AVATAR_COLORS } from './types';
import { geminiService, MatchResult } from './services/geminiService';
import { SendIcon, SparklesIcon, ShareIcon, CopyIcon, GiftIcon, PlusIcon, StarIcon, ShieldCheckIcon } from './components/Icons';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('landing');
  const [pin, setPin] = useState('');
  const [fichas, setFichas] = useState(3);
  const [toast, setToast] = useState<{message: string, type: 'info' | 'success'} | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>(() => ({
    nickname: '',
    childAge: '',
    interest: '',
    role: '',
    audience: '',
    animalEmoji: ANIMAL_AVATARS[0].emoji,
    avatarColor: AVATAR_COLORS[0],
    isOwner: false,
    hasVerifiedSocial: true,
    values: { crianza: '', tecnologia: '', alimentacion: '', privacidad: '' }
  }));

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matchData, setMatchData] = useState<MatchResult | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');

  const roomUrl = useMemo(() => `${window.location.origin}/?sala=${pin}`, [pin]);

  const profileStats = useMemo(() => {
    let completed = 0;
    const items = ['nickname', 'childAge', 'crianza', 'tecnologia'];
    if (profile.nickname) completed++;
    if (profile.childAge) completed++;
    if (profile.values.crianza) completed++;
    if (profile.values.tecnologia) completed++;
    return { percent: Math.floor((completed / items.length) * 100), missingCount: items.length - completed };
  }, [profile]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
    }
  }, []);

  useEffect(() => {
    if (step === 'processing') {
      const runAIAnalysis = async () => {
        try {
          const result = await geminiService.processMatch({ ...profile, coords: userCoords }, participants);
          setMatchData(result);
          setStep('result');
        } catch (error) {
          setStep('room_lobby');
        }
      };
      runAIAnalysis();
    }
  }, [step]);

  const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-brand-bg/80 backdrop-blur-md border-b border-white/5">
      <div onClick={() => setStep('landing')} className="flex items-center gap-3 cursor-pointer group">
        <span className="text-3xl animate-float">🎠</span>
        <span className="font-display font-black text-xl tracking-tighter text-white group-hover:text-brand-primary transition-colors">CALESITA</span>
      </div>
      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-full">
            <span className="text-brand-secondary text-sm font-bold">🪙 {fichas}</span>
         </div>
      </div>
    </header>
  );

  const ParticipantsBar = () => (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 glass-panel px-6 py-4 rounded-full border-white/10 shadow-2xl animate-pop">
      <div className="flex -space-x-3">
        <div className="w-12 h-12 rounded-full border-2 border-brand-bg flex items-center justify-center text-2xl shadow-lg ring-2 ring-brand-primary/20" style={{ backgroundColor: profile.avatarColor }}>{profile.animalEmoji}</div>
        {participants.map(p => (
          <div key={p.id} className="w-12 h-12 rounded-full border-2 border-brand-bg flex items-center justify-center text-2xl shadow-lg" style={{ backgroundColor: p.avatarColor }}>{p.animalEmoji}</div>
        ))}
      </div>
      <button onClick={() => setStep('share_room')} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
        <PlusIcon />
      </button>
    </div>
  );

  return (
    <div className="font-sans text-slate-200">
      {step !== 'chat' && <Header />}
      
      <main className="pt-28 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        {step === 'landing' && <LandingView setPin={setPin} pin={pin} onEnter={() => setStep('share_room')} />}
        {step === 'share_room' && <ShareRoomView pin={pin} roomUrl={roomUrl} setStep={setStep} />}
        {step === 'room_lobby' && <RoomLobbyView profile={profile} profileStats={profileStats} setStep={setStep} />}
        {step === 'data_entry' && <DataEntryView profile={profile} setProfile={setProfile} setStep={setStep} />}
        {step === 'processing' && <ProcessingView />}
        {step === 'result' && <ResultView matchData={matchData} setStep={setStep} fichas={fichas} setFichas={setFichas} />}
        {step === 'game_plan' && <GamePlanView matchData={matchData} setStep={setStep} />}
        {step === 'chat' && <ChatView setStep={setStep} chatMessages={chatMessages} setChatMessages={setChatMessages} chatInput={chatInput} setChatInput={setChatInput} pin={pin} />}
      </main>

      {['room_lobby', 'data_entry', 'share_room', 'result', 'game_plan'].includes(step) && <ParticipantsBar />}
    </div>
  );
};

// --- VISTAS REDISEÑADAS ---

const LandingView = ({ setPin, pin, onEnter }: any) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-16 animate-pop">
    <div className="text-center space-y-6">
      <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight text-white leading-[0.9] text-balance">
        Jugamos <br/><span className="text-brand-primary">en comunidad.</span>
      </h1>
      <p className="text-lg md:text-xl text-slate-400 max-w-md mx-auto font-medium">
        Uniendo familias por valores y cercanía a través de inteligencia artificial.
      </p>
    </div>
    <div className="w-full space-y-8">
      <div className="relative group">
        <input 
          className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-2xl font-display font-bold text-center text-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
          placeholder="Nombre de tu sala"
          value={pin}
          onChange={(e) => setPin(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
        />
        <div className="text-center mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">Crea o únete a un círculo</div>
      </div>
      <button onClick={onEnter} className={`w-full py-6 rounded-3xl font-display font-black text-2xl btn-primary ${!pin && 'opacity-50 cursor-not-allowed grayscale'}`} disabled={!pin}>
        Empezar
      </button>
    </div>
  </div>
);

const ShareRoomView = ({ pin, roomUrl, setStep }: any) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=8B5CF6&data=${encodeURIComponent(roomUrl)}`;
  return (
    <div className="space-y-12 animate-pop py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-black text-white">¡Sala Lista!</h2>
        <p className="text-slate-400">Comparte el acceso con tu grupo de confianza.</p>
      </div>
      <div className="glass-panel p-10 rounded-[3rem] flex flex-col items-center space-y-10">
        <div className="p-6 bg-white rounded-3xl shadow-inner">
          <img src={qrUrl} alt="QR" className="w-64 h-64" />
        </div>
        <div className="w-full flex flex-col gap-4">
          <button onClick={() => navigator.clipboard.writeText(roomUrl)} className="w-full py-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all flex items-center justify-center gap-3">
            <CopyIcon /> Copiar Enlace
          </button>
          <button onClick={() => setStep('room_lobby')} className="w-full py-5 rounded-2xl btn-primary font-black">
            Entrar al Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomLobbyView = ({ profile, profileStats, setStep }: any) => (
  <div className="space-y-10 animate-pop">
    <div className="flex items-center gap-8 py-8 border-b border-white/5">
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl ring-4 ring-brand-primary/10" style={{ backgroundColor: profile.avatarColor }}>{profile.animalEmoji}</div>
      <div>
        <h2 className="text-3xl font-display font-black text-white">Hola, {profile.nickname || 'Explorador'}</h2>
        <p className="text-slate-400 font-medium">Lobby de la Sala</p>
      </div>
    </div>
    
    <div className="glass-panel p-8 rounded-[2.5rem] space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl">Tu Perfil IA</h3>
        <span className="text-xs font-black uppercase text-brand-primary tracking-widest">{profileStats.percent}% LISTO</span>
      </div>
      <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
        <div className="h-full bg-brand-primary transition-all duration-700" style={{ width: `${profileStats.percent}%` }} />
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">Necesitamos conocer tus valores de crianza para que la IA genere un match seguro y divertido.</p>
      <div className="flex gap-4">
        <button onClick={() => setStep('data_entry')} className="flex-1 py-4 rounded-2xl bg-white/10 hover:bg-white/15 font-bold transition-all">Editar</button>
        {profileStats.percent === 100 && (
          <button onClick={() => setStep('processing')} className="flex-[2] py-4 rounded-2xl btn-primary font-black animate-pulse">Analizar Match ✨</button>
        )}
      </div>
    </div>
  </div>
);

const DataEntryView = ({ profile, setProfile, setStep }: any) => (
  <div className="space-y-12 animate-pop pb-20">
    <div className="text-center">
       <div className="w-28 h-28 rounded-[2rem] flex items-center justify-center text-6xl mx-auto shadow-2xl mb-6 ring-4 ring-brand-primary/10" style={{ backgroundColor: profile.avatarColor }}>{profile.animalEmoji}</div>
       <h2 className="text-3xl font-display font-black text-white">Configura tu Perfil</h2>
    </div>

    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-4">
        <input className="bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white outline-none focus:border-brand-primary transition-all" placeholder="Tu Apodo" value={profile.nickname} onChange={e => setProfile({...profile, nickname: e.target.value})}/>
        <input className="bg-white/5 border border-white/10 rounded-2xl p-5 font-bold text-white outline-none focus:border-brand-primary transition-all" placeholder="Edad Hijo/a" value={profile.childAge} onChange={e => setProfile({...profile, childAge: e.target.value})}/>
      </div>

      <div className="space-y-6">
        <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Personaliza tu Identidad</label>
        <div className="flex flex-wrap gap-3 justify-center">
          {ANIMAL_AVATARS.slice(0, 8).map(a => (
            <button key={a.emoji} onClick={() => setProfile({...profile, animalEmoji: a.emoji})} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${profile.animalEmoji === a.emoji ? 'bg-brand-primary shadow-lg scale-110' : 'bg-white/5 hover:bg-white/10'}`}>{a.emoji}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {AVATAR_COLORS.map(c => (
            <button key={c} onClick={() => setProfile({...profile, avatarColor: c})} className={`w-8 h-8 rounded-full border-2 ${profile.avatarColor === c ? 'border-white scale-125 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="space-y-10">
        {Object.entries(VALUE_OPTIONS).map(([key, options]) => (
          <div key={key} className="space-y-4">
            <label className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] ml-2">{key}</label>
            <div className="grid grid-cols-3 gap-3">
              {options.map(opt => (
                <button key={opt} onClick={() => setProfile({...profile, values: {...profile.values, [key]: opt}})} className={`text-xs p-4 rounded-xl border font-bold transition-all ${profile.values[key as keyof typeof profile.values] === opt ? 'bg-brand-primary/20 border-brand-primary text-brand-primary shadow-sm' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}>{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <button onClick={() => setStep('room_lobby')} className="w-full py-5 rounded-3xl btn-primary font-black text-xl">Guardar Perfil</button>
  </div>
);

const ResultView = ({ matchData, setStep, fichas, setFichas }: any) => (
  <div className="space-y-10 animate-pop py-8 text-center">
    <div className="space-y-4">
      <h2 className="text-6xl font-display font-black text-white">¡Tenemos Match!</h2>
      <p className="text-brand-secondary font-bold uppercase tracking-widest text-sm">Afinidad Verificada por Calesita IA</p>
    </div>
    
    <div className="glass-panel p-10 rounded-[3rem] text-left relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:scale-110 transition-transform">✨</div>
      <p className="text-3xl md:text-4xl font-display font-black text-white leading-tight mb-12 text-balance">{matchData?.affinityReport}</p>
      
      <div className="space-y-6 pt-8 border-t border-white/10">
         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><StarIcon /> Experiencias de la Comunidad</h4>
         {matchData?.reviews?.map((r: any, i: number) => (
           <div key={i} className="bg-white/5 p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-300 text-sm">{r.author}</span>
                <div className="flex gap-0.5"><StarIcon /></div>
              </div>
              <p className="text-slate-400 text-sm italic font-medium">"{r.text}"</p>
           </div>
         ))}
      </div>
    </div>
    
    <button onClick={() => { if (fichas > 0) { setFichas(fichas - 1); setStep('game_plan'); } }} className="w-full py-6 rounded-3xl btn-primary font-black text-2xl flex items-center justify-center gap-4">
      Abrir Ficha de Encuentro <span className="opacity-50">•</span> 🪙 1
    </button>
  </div>
);

const GamePlanView = ({ matchData, setStep }: any) => (
  <div className="space-y-10 animate-pop py-8">
    <div className="text-center space-y-4">
       <h2 className="text-5xl font-display font-black text-white">Hoja de Ruta</h2>
       <p className="text-slate-400 font-medium">Todo listo para el encuentro real.</p>
    </div>
    <div className="glass-panel p-10 rounded-[3rem] space-y-10">
      <div className="space-y-4">
        <h4 className="text-xs font-black text-brand-secondary tracking-[0.3em] ml-2">📍 UBICACIÓN Y HORARIO</h4>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
           <p className="text-2xl font-display font-bold text-white leading-tight">{matchData?.gamePlan.locationTime}</p>
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-xs font-black text-brand-secondary tracking-[0.3em] ml-2">🤝 POR QUÉ VAN A CONECTAR</h4>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
          <p className="text-xl font-medium text-slate-300 leading-relaxed">{matchData?.gamePlan.interests}</p>
        </div>
      </div>
    </div>
    <button onClick={() => setStep('chat')} className="w-full py-6 rounded-3xl bg-white text-brand-bg font-black text-2xl shadow-xl hover:scale-[1.02] transition-all">Unirse al Chat Grupal</button>
  </div>
);

const ProcessingView = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-pop">
    <div className="relative">
      <div className="w-48 h-48 border-[12px] border-white/5 border-t-brand-primary rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center text-5xl">🎡</div>
    </div>
    <div className="text-center space-y-4">
      <h2 className="text-4xl font-display font-black text-white">IA Analizando...</h2>
      <p className="text-slate-500 font-medium max-w-xs mx-auto">Cruzando valores de crianza y geolocalización de todas las familias.</p>
    </div>
  </div>
);

const ChatView = ({ setStep, chatMessages, setChatMessages, chatInput, setChatInput, pin }: any) => {
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, content: chatInput, timestamp: new Date() };
    setChatMessages((prev: any) => [...prev, userMsg]);
    setChatInput('');
    setChatMessages((prev: any) => [...prev, { id: 'typing', role: Role.MODEL, content: '', timestamp: new Date() }]);
    try {
      const response = await geminiService.sendMessage(chatInput);
      setChatMessages((prev: any) => prev.filter((m: any) => m.id !== 'typing').concat({ id: (Date.now() + 1).toString(), role: Role.MODEL, content: response, timestamp: new Date() }));
    } catch (e) {
      setChatMessages((prev: any) => prev.filter((m: any) => m.id !== 'typing'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-brand-bg">
      <div className="p-6 bg-brand-bg/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <button onClick={() => setStep('game_plan')} className="text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <h3 className="font-display font-black text-lg text-white tracking-tight uppercase tracking-widest">SALA: {pin}</h3>
        </div>
        <div className="w-8"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        {chatMessages.map((msg: any) => <ChatMessage key={msg.id} message={msg} />)}
      </div>
      <div className="p-6 bg-brand-bg border-t border-white/5 flex gap-4 pb-12">
        <input 
          value={chatInput} 
          onChange={e => setChatInput(e.target.value)} 
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-brand-primary transition-all"
          placeholder="Escribe al círculo..."
        />
        <button onClick={handleSend} className="p-4 bg-brand-primary text-white rounded-2xl shadow-lg active:scale-90 transition-all">
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default App;
