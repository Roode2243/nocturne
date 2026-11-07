import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Cloud, Download, Eye, EyeOff, Heart, Layers, LibraryBig, LoaderCircle, LockKeyhole, LogOut, Mail, Pencil, Plus, Search, Settings2, ShieldCheck, Shuffle, Sparkles, UserRound, WifiOff, X } from 'lucide-react'
import { configured, supabase } from './supabase'
import type { Piece } from './data'
import { dateLabel, density, exportedMarkdown } from './data'

type Tab = 'deck' | 'library' | 'saved' | 'me'
type LibraryMode = 'collection' | 'timeline' | 'random'
type EditorData = { id?: string, title: string, body: string, kind: Piece['kind'] }

const initialEditor = (): EditorData => ({ title: '', body: '', kind: 'Poem' })
const id = () => crypto.randomUUID()
const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'Something went wrong. Please try again.'
function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

function SignIn() {
  type AuthView = 'login' | 'signup' | 'reset'
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [method, setMethod] = useState<'password' | 'magic'>('password')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'success', message: string } | null>(null)
  const redirectTo = window.location.origin + import.meta.env.BASE_URL
  const changeView = (next: AuthView) => { setView(next); setFeedback(null); setPassword(''); setConfirm(''); setMethod('password') }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || busy) return
    setFeedback(null)
    if (view === 'signup' && password !== confirm) { setFeedback({ kind: 'error', message: 'Your passwords do not match.' }); return }
    if (view === 'signup' && method === 'password' && password.length < 8) { setFeedback({ kind: 'error', message: 'Use at least 8 characters for your password.' }); return }
    setBusy(true)
    try {
      if (view === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
        if (error) throw error
        setFeedback({ kind: 'success', message: 'If an account exists for this address, a password reset link is on its way. Open it in the same browser.' })
      } else if (method === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo, shouldCreateUser: false } })
        if (error) throw error
        setFeedback({ kind: 'success', message: 'If an account exists for this address, your sign-in link is on its way. Check your inbox.' })
      } else if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } })
        if (error) throw error
        setFeedback({ kind: 'success', message: data.session ? 'Account created. Opening your collection…' : 'Check your inbox to confirm your email. Your collection will be ready when you return.' })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch (error) { setFeedback({ kind: 'error', message: errorMessage(error) }) }
    finally { setBusy(false) }
  }
  return <main className="auth-v2">
    <div className="auth-v2-frame">
      <section className="auth-v2-story" aria-label="About Nocturne">
        <div className="auth-v2-brand"><span className="auth-v2-symbol" aria-hidden="true"><span /></span><span>nocturne<span className="auth-v2-brand-period">.</span></span></div>
        <div className="auth-v2-art" aria-hidden="true"><span className="auth-v2-orbit orbit-one"/><span className="auth-v2-orbit orbit-two"/><span className="auth-v2-art-moon"/></div>
        <div className="auth-v2-story-copy"><div className="auth-v2-overline"><span className="auth-v2-line"/> AN ARCHIVE OF ALMOSTS</div><h2>Some things<br/>are better <em>kept.</em></h2><p>A quiet home for the words you write, the ones you revisit, and the thoughts you aren't ready to share.</p></div>
        <div className="auth-v2-story-foot"><span>PRIVATE BY DEFAULT</span><span>MADE FOR YOUR WORDS</span></div>
      </section>
      <section className="auth-v2-form-section">
        <div className="auth-v2-mobile-brand"><span className="auth-v2-symbol" aria-hidden="true"><span/></span><span>nocturne<span className="auth-v2-brand-period">.</span></span></div>
        <div className="auth-v2-form-wrap">
          <div className="auth-v2-topline"><span className="auth-v2-asterisk" aria-hidden="true">✳</span> YOUR WORDS. YOUR SPACE.</div>
          <h1>{view === 'signup' ? 'Begin your collection.' : view === 'reset' ? 'Find your way back.' : 'Welcome back.'}</h1>
          <p className="auth-v2-subtitle">{view === 'signup' ? 'A place for every poem, fragment and in-between thought.' : view === 'reset' ? 'Enter your email and we’ll send you a password reset link.' : 'There’s room for another thought.'}</p>
          {view !== 'reset' && <div className="auth-v2-tabs" role="group" aria-label="Account access">
            <button type="button" className={view === 'login' ? 'active' : ''} onClick={() => changeView('login')} aria-pressed={view === 'login'}>Sign in</button>
            <button type="button" className={view === 'signup' ? 'active' : ''} onClick={() => changeView('signup')} aria-pressed={view === 'signup'}>Create account</button>
          </div>}
          <form className="auth-v2-form" onSubmit={submit}>
            <label htmlFor="auth-email-v2">Email address</label>
            <div className="auth-v2-input"><Mail size={18} aria-hidden="true"/><input id="auth-email-v2" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            {view !== 'reset' && method === 'password' && <>
              <div className="auth-v2-label-row"><label htmlFor="auth-password-v2">Password</label>{view === 'login' && <button type="button" className="auth-v2-inline-link" onClick={() => changeView('reset')}>Forgot password?</button>}</div>
              <div className="auth-v2-input"><LockKeyhole size={18} aria-hidden="true"/><input id="auth-password-v2" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete={view === 'signup' ? 'new-password' : 'current-password'} placeholder={view === 'signup' ? 'At least 8 characters' : 'Enter your password'} value={password} onChange={e => setPassword(e.target.value)}/><button className="auth-v2-eye" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
              {view === 'signup' && <><label htmlFor="auth-confirm-v2">Confirm password</label><div className="auth-v2-input"><LockKeyhole size={18} aria-hidden="true"/><input id="auth-confirm-v2" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" placeholder="Type your password again" value={confirm} onChange={e => setConfirm(e.target.value)}/></div><p className="auth-v2-help">Use a unique password with at least 8 characters.</p></>}
            </>}
            {feedback && <div role={feedback.kind === 'error' ? 'alert' : 'status'} className={'auth-v2-feedback ' + feedback.kind}>{feedback.kind === 'success' ? <Check size={17}/> : <X size={17}/>}<span>{feedback.message}</span></div>}
            <button className="auth-v2-submit" type="submit" disabled={busy}>{busy ? <><LoaderCircle size={18} className="spin"/> One moment…</> : <>{view === 'reset' ? 'Send reset link' : method === 'magic' ? 'Send sign-in link' : view === 'signup' ? 'Create my space' : 'Enter my space'} <ArrowRight size={19}/></>}</button>
          </form>
          {view !== 'reset' ? <div className="auth-v2-alternative"><div className="auth-v2-divider"><span>or</span></div><button type="button" className="auth-v2-alt-button" onClick={() => { setMethod(method === 'password' ? 'magic' : 'password'); setFeedback(null) }}>{method === 'password' ? <Mail size={18}/> : <LockKeyhole size={18}/>} {method === 'password' ? 'Continue with an email link' : 'Use your password instead'}</button></div> : <button className="auth-v2-back" type="button" onClick={() => changeView('login')}><ArrowLeft size={17}/> Back to sign in</button>}
          <div className="auth-v2-privacy"><ShieldCheck size={16}/><span>Your collection is private to your account. Only you can read your writing.</span></div>
        </div>
        <footer className="auth-v2-bottom"><span>NOCTURNE · A QUIET PLACE TO WRITE</span><span>✦</span></footer>
      </section>
    </div>
  </main>
}

function ResetPassword({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Use at least 8 characters.'); return }
    if (!supabase) return
    setBusy(true); setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else onComplete()
  }
  return <main className="auth-v2"><div className="auth-v2-frame">
    <section className="auth-v2-story"><div className="auth-v2-brand"><span className="auth-v2-symbol"><span/></span>nocturne<span className="auth-v2-brand-period">.</span></div><div className="auth-v2-art" aria-hidden="true"><span className="auth-v2-orbit orbit-one"/><span className="auth-v2-orbit orbit-two"/><span className="auth-v2-art-moon"/></div><div className="auth-v2-story-copy"><div className="auth-v2-overline">A PLACE TO RETURN TO</div><h2>Every word<br/>is still <em>yours.</em></h2></div><div className="auth-v2-story-foot">PRIVATE BY DEFAULT</div></section>
    <section className="auth-v2-form-section"><div className="auth-v2-mobile-brand">nocturne<span className="auth-v2-brand-period">.</span></div><div className="auth-v2-form-wrap"><div className="auth-v2-topline">ACCOUNT RECOVERY</div><h1>A fresh start.</h1><p className="auth-v2-subtitle">Set a new password for your collection.</p><form className="auth-v2-form" onSubmit={submit}><label htmlFor="reset-password">New password</label><div className="auth-v2-input"><LockKeyhole size={18}/><input id="reset-password" type={visible?'text':'password'} autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" aria-label={visible?'Hide password':'Show password'} className="auth-v2-eye" onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div><label htmlFor="reset-confirm">Confirm new password</label><div className="auth-v2-input"><LockKeyhole size={18}/><input id="reset-confirm" type={visible?'text':'password'} autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat new password"/></div>{error&&<div role="alert" className="auth-v2-feedback error">{error}</div>}<button disabled={busy} className="auth-v2-submit">{busy?'Updating…':'Update password'} <ArrowRight size={18}/></button></form></div><footer className="auth-v2-bottom">NOCTURNE · YOUR PRIVATE COLLECTION</footer></section>
  </div></main>
}

function SwipeCard({ piece, behind, onSwipe, onRead, onFavorite }: { piece: Piece, behind?: Piece, onSwipe: (direction: number) => void, onRead: () => void, onFavorite: () => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-230, 0, 230], [-14, 0, 14])
  const opacity = useTransform(x, [-420, -230, 0, 230, 420], [0, 1, 1, 1, 0])
  const dragged = useRef(false)
  return <div className="deck-stage">
    <div className="poem-card back-card" aria-hidden="true"><span className="meta">{behind?.kind.toUpperCase() ?? 'ANOTHER THOUGHT'}</span></div>
    <motion.article key={piece.id} className="poem-card front-card" style={{ x, rotate, opacity, touchAction: 'pan-y' }} drag="x" dragMomentum={false} dragElastic={0.14} dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { dragged.current = true }} onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 95 || Math.abs(info.velocity.x) > 600) { onSwipe(info.offset.x > 0 ? -1 : 1) } else { setTimeout(() => { dragged.current = false }, 100) } }}
      onClick={() => { if (!dragged.current) onRead(); dragged.current=false }} tabIndex={0} role="button" aria-label={'Read ' + piece.title}
      onKeyDown={e=>{if(e.key==='Enter' || e.key===' ') { e.preventDefault(); onRead() } }}>
      <div className="meta">{piece.kind.toUpperCase()} / {dateLabel(piece.created_at)}</div>
      <div className="card-content"><h2>{piece.title}</h2><p className={'poem ' + density(piece.body)}>{piece.body}</p></div>
      <div className="card-footer"><span>PRIVATE THOUGHT</span><button className={'icon-btn heart '+(piece.favorite?'active':'')} aria-label={piece.favorite?'Remove favourite':'Add favourite'} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onFavorite()}}><Heart fill={piece.favorite?'currentColor':'none'} size={20}/></button></div>
    </motion.article>
  </div>
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<Tab>('deck')
  const [libraryMode, setLibraryMode] = useState<LibraryMode>('collection')
  const [filter, setFilter] = useState<'All' | Piece['kind']>('All')
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [reader, setReader] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorData | null>(null)
  const [rediscovered, setRediscovered] = useState<string | null>(null)
  const [online, setOnline] = useState(navigator.onLine)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const currentUser = session?.user.id

  const announce = useCallback((message: string) => { setNotice(message); clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4000) }, [])
  useEffect(()=>{const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update)}},[])
  useEffect(()=>{
    if (!supabase) {setAuthReady(true);return}
    void supabase.auth.getSession().then(({data,error})=>{if(error)announce(error.message);setSession(data.session);setAuthReady(true)}).catch(e=>{announce(errorMessage(e));setAuthReady(true)})
    const { data } = supabase.auth.onAuthStateChange((event, s) => { if (event === 'PASSWORD_RECOVERY') setRecovering(true); setSession(s);setAuthReady(true)})
    return ()=>data.subscription.unsubscribe()
  },[announce])

  const refresh = useCallback(async () => {
    if (!supabase || !currentUser) return
    setLoading(true)
    const { data, error } = await supabase.from('pieces').select('*').eq('user_id', currentUser).order('created_at', {ascending:false})
    if (error) announce('Could not load writing: ' + error.message)
    else setPieces((data ?? []) as Piece[])
    setLoading(false)
  }, [currentUser, announce])
  useEffect(()=>{if(currentUser){void refresh()}else {setPieces([]);setIndex(0)}},[currentUser,refresh])
  useEffect(()=>{
    if (!currentUser || !supabase) return
    const handler=()=>{if(document.visibilityState==='visible' && navigator.onLine)void refresh()}
    document.addEventListener('visibilitychange',handler)
    const channel=supabase.channel('nocturne-'+currentUser).on('postgres_changes',{event:'*',schema:'public',table:'pieces',filter:'user_id=eq.'+currentUser},()=>void refresh()).subscribe()
    return ()=>{document.removeEventListener('visibilitychange',handler);void supabase?.removeChannel(channel)}
  },[currentUser,refresh])
  const sorted = useMemo(()=>[...pieces].sort((a,b)=>b.created_at.localeCompare(a.created_at)),[pieces])
  const piece=sorted.length?sorted[((index%sorted.length)+sorted.length)%sorted.length]:null
  const next=sorted.length?sorted[(index+1)%sorted.length]:undefined
  const displayedReader = pieces.find(p=>p.id===reader)
  const onSwipe=(delta:number)=>setIndex(i=>sorted.length?(i+delta+sorted.length)%sorted.length:0)

  const persist=async (data:EditorData) => {
    if(!supabase || !currentUser || busy)return
    if (!online){announce('You are offline. Reconnect before saving to the cloud.');return}
    const title = data.title.trim() || 'Untitled', body=data.body.trim()
    if (!body){announce('Write something before saving.');return}
    if (title.length>180 || body.length>50000){announce('This piece exceeds the length limit.');return}
    setBusy(true)
    try {
      if (data.id) {
        const {error}=await supabase.from('pieces').update({title,body,kind:data.kind}).eq('id',data.id).eq('user_id',currentUser)
        if(error)throw error
      } else {
        const {error}=await supabase.from('pieces').insert({id:id(),user_id:currentUser,title,body,kind:data.kind})
        if(error)throw error
      }
      setEditor(null);setReader(null);setTab('deck');setIndex(0);await refresh();announce('Saved to your private collection')
    } catch(e){announce('Could not save: '+errorMessage(e))}finally{setBusy(false)}
  }
  const toggleFavorite=async (p:Piece)=>{
    if(!supabase||!currentUser||busy||!online){announce('Reconnect to update your favourites.');return}
    setBusy(true)
    const {error}=await supabase.from('pieces').update({favorite:!p.favorite}).eq('id',p.id).eq('user_id',currentUser)
    if(error)announce('Could not update favourite: '+error.message)
    else {setPieces(old=>old.map(x=>x.id===p.id?{...x,favorite:!x.favorite}:x))}
    setBusy(false)
  }
  const remove=async(p:Piece)=>{
    if(!supabase||!currentUser||busy||!online)return
    if(!window.confirm('Delete this piece permanently? Export a backup first if you want to keep it.'))return
    setBusy(true)
    const {error}=await supabase.from('pieces').delete().eq('id',p.id).eq('user_id',currentUser)
    if(error)announce('Could not delete: '+error.message)
    else{setReader(null);setPieces(old=>old.filter(x=>x.id!==p.id));announce('Piece deleted')}
    setBusy(false)
  }
  const exportAll=()=>download('nocturne-poems-'+new Date().toISOString().slice(0,10)+'.md',exportedMarkdown(sorted),'text/markdown')
  const randomize=()=>{
    const pool=pieces.filter(p=>p.id!==rediscovered)
    const selection=(pool.length?pool:pieces)[Math.floor(Math.random()*(pool.length||pieces.length))]
    if(selection){setRediscovered(selection.id);setReader(selection.id)}
  }
  const signOut=async()=>{const{error}=await supabase!.auth.signOut();if(error)announce(error.message)}
  useEffect(()=>{const key=(e:KeyboardEvent)=>{
    if(e.key==='Escape'){setReader(null);setEditor(null)}
    if(tab==='deck'&&!reader&&!editor&&sorted.length&&!['INPUT','TEXTAREA'].includes((e.target as HTMLElement).tagName)){
      if(e.key==='ArrowRight')onSwipe(1)
      if(e.key==='ArrowLeft')onSwipe(-1)
    }
  };document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key)},[tab,reader,editor,sorted.length])

  if(!configured)return <main className="auth-screen"><div className="auth-inner"><div className="brand-mark"><span className="crescent"/></div><div className="eyebrow">NOCTURNE SETUP</div><h1>Almost there.</h1><p>This deployment needs a Supabase project before private sign-in can work.</p><div className="auth-panel"><p>Add the <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> repository variables, run the SQL schema, then redeploy.</p><small>See README.md for the full setup.</small></div></div></main>
  if(!authReady)return <main className="splash"><LoaderCircle className="spin"/><p>Opening your space…</p></main>
  if(recovering && session)return <ResetPassword onComplete={() => {setRecovering(false);announce('Password updated successfully.')}}/>
  if(!session)return <SignIn/>

  const heading={deck:['AN ARCHIVE OF ALMOSTS','the in-between.','a collection of quiet things'],library:['YOUR COLLECTION','Library',"Everything you've kept, in one place."],saved:['THE ONES YOU LOVE','Saved','Your most revisited words.'],me:['YOUR SPACE','Your corner','A home for everything you’ve written.']}[tab]
  return <div className="app-shell">
    <main className="app-main">
      <header className="header"><div><div className="eyebrow">{heading[0]}</div><h1>{heading[1]}</h1><small>{heading[2]}</small></div>{loading?<LoaderCircle size={17} className="spin muted"/>:!online?<WifiOff size={18} className="muted"/>:null}</header>
      <section className="main-pad">
        {tab==='deck' && (piece ? <>
          <SwipeCard key={piece.id} piece={piece} behind={next} onRead={()=>setReader(piece.id)} onSwipe={onSwipe} onFavorite={()=>void toggleFavorite(piece)}/>
          <p className="hint">DRAG TO EXPLORE · TAP TO READ</p>
          <div className="deck-buttons"><button onClick={()=>onSwipe(-1)}><ArrowLeft size={15}/> Previous</button><button onClick={()=>onSwipe(1)} className="primary-inline">Next <ArrowRight size={15}/></button></div>
        </> : <div className="empty-state"><BookOpen size={32}/><h2>Your story starts here.</h2><p>Your first poem, passing thought or unfinished sentence can live here.</p><button className="primary-btn" onClick={()=>setEditor(initialEditor())}><Plus size={17}/> Write something</button></div>)}
        {tab==='library' && <>
          <div className="search-box"><Search size={18}/><input placeholder="Search your words" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Search your writing"/></div>
          <div className="segmented" role="tablist">{(['collection','timeline','random'] as LibraryMode[]).map(mode=><button role="tab" aria-selected={libraryMode===mode} className={libraryMode===mode?'selected':''} key={mode} onClick={()=>setLibraryMode(mode)}>{mode==='collection'?'Collection':mode==='timeline'?'Timeline':'Random'}</button>)}</div>
          {libraryMode==='random'?<div className="random-panel"><Shuffle size={31}/><h2>Meet an old thought.</h2><p>Rediscover a piece without choosing a date or title.</p><button className="primary-btn" onClick={randomize} disabled={!pieces.length}><Sparkles size={16}/> Surprise me</button></div>:<>
            {libraryMode==='collection' && <div className="filters">{(['All','Poem','Fragment','Thought'] as const).map(f=><button key={f} className={filter===f?'chosen':''} onClick={()=>setFilter(f)}>{f==='All'?'All pieces':f+'s'}</button>)}</div>}
            {(() => {const selected=sorted.filter(p=>(libraryMode!=='collection'||filter==='All'||p.kind===filter)&&`${p.title} ${p.body}`.toLowerCase().includes(query.toLowerCase()))
              if(!selected.length)return <div className="empty-state small"><Search size={25}/><p>No pieces found.</p></div>
              if(libraryMode==='timeline'){let previous='';return selected.map(p=>{const month=new Date(p.created_at).toLocaleDateString('en-GB',{month:'long',year:'numeric'}).toUpperCase();const newMonth=month!==previous;previous=month;return <div key={p.id}>{newMonth&&<div className="timeline-month">{month}</div>}<button className="timeline-row" onClick={()=>setReader(p.id)}><b>{p.title}</b><small>{dateLabel(p.created_at)} · {p.kind}</small></button></div>})}
              return <><p className="section-label">{selected.length} PIECES</p>{selected.map(p=><button key={p.id} className="list-item" onClick={()=>setReader(p.id)}><div className="meta">{p.kind.toUpperCase()} · {dateLabel(p.created_at)}</div><h3>{p.title}</h3><p>{p.body}</p></button>)}</>
            })()}
          </>}
        </>}
        {tab==='saved'&&<><p className="section-label">YOUR FAVOURITES</p>{sorted.filter(p=>p.favorite).length ? sorted.filter(p=>p.favorite).map(p=><button className="list-item" key={p.id} onClick={()=>setReader(p.id)}><div className="meta">{p.kind.toUpperCase()} · {dateLabel(p.created_at)} <Heart size={15} fill="currentColor"/></div><h3>{p.title}</h3><p>{p.body}</p></button>):<div className="empty-state small"><Heart size={32}/><h2>Nothing saved yet.</h2><p>Tap the heart on a poem to keep it close.</p></div>}</>}
        {tab==='me'&&<><div className="profile-panel"><div className="profile-head"><div className="avatar">{session.user.email?.charAt(0).toUpperCase()||'N'}</div><div><b>Your words, your world.</b><small>{session.user.email}</small></div></div><div className="stats"><div><b>{pieces.length}</b><small>pieces</small></div><div><b>{pieces.filter(p=>p.favorite).length}</b><small>saved</small></div><div><b>{pieces.filter(p=>p.kind==='Fragment').length}</b><small>fragments</small></div></div></div>
          <p className="section-label">PREFERENCES</p>
          <div className="setting-row"><Settings2 size={20}/><div><b>Appearance</b><small>Black + Ice Blue</small></div><ChevronRight size={18}/></div>
          <div className="setting-row"><Cloud size={20}/><div><b>Privacy & sync</b><small>Signed in · private cloud collection</small></div><Check size={18}/></div>
          <button className="setting-row" onClick={exportAll}><Download size={20}/><div><b>Export your writing</b><small>Markdown backup · {pieces.length} pieces</small></div><ChevronRight size={18}/></button>
          <button className="setting-row" onClick={()=>void signOut()}><LogOut size={20}/><div><b>Sign out</b><small>Leave this device</small></div><ChevronRight size={18}/></button>
          <p className="settings-footnote">Sync requires internet. Your poems stay in Supabase, protected by database access policies. Export regularly as a separate backup.</p>
        </>}
      </section>
    </main>
    <nav className="bottom-nav" aria-label="Primary navigation">
      {([{key:'deck',label:'deck',Icon:Layers},{key:'library',label:'library',Icon:LibraryBig}] as const).map(({key,label,Icon})=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon size={21}/><span>{label}</span></button>)}
      <button className="create-btn" onClick={()=>setEditor(initialEditor())} aria-label="Create new writing"><Plus size={29} strokeWidth={2.3}/></button>
      {([{key:'saved',label:'saved',Icon:Heart},{key:'me',label:'me',Icon:UserRound}] as const).map(({key,label,Icon})=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}><Icon size={21}/><span>{label}</span></button>)}
    </nav>
    <AnimatePresence>
      {displayedReader&&!editor&&<motion.div className="overlay" key={'reader-'+displayedReader.id} initial={{opacity:0,scale:.97,y:28}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.97,y:20}} transition={{type:'spring',damping:28,stiffness:290}}>
        <div className="overlay-inner"><div className="topbar"><button className="icon-btn" aria-label="Back" onClick={()=>setReader(null)}><ArrowLeft size={21}/></button><span className="meta">READING</span><button className="icon-btn" aria-label="Edit piece" onClick={()=>setEditor({id:displayedReader.id,title:displayedReader.title,body:displayedReader.body,kind:displayedReader.kind})}><Pencil size={20}/></button></div>
          <div className="reader-meta">{displayedReader.kind.toUpperCase()} · {dateLabel(displayedReader.created_at)}</div><h1 className="reader-title">{displayedReader.title}</h1><p className={'reader-body '+density(displayedReader.body)}>{displayedReader.body}</p>
          <div className="reader-actions"><button onClick={()=>void toggleFavorite(displayedReader)}><Heart size={19} fill={displayedReader.favorite?'currentColor':'none'}/> {displayedReader.favorite?'Saved to favourites':'Save to favourites'}</button><button onClick={()=>void remove(displayedReader)} className="danger">Delete</button></div>
        </div></motion.div>}
      {editor&&<motion.div className="overlay" key="editor" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:24}} transition={{duration:.24}}>
        <div className="overlay-inner editor"><div className="topbar"><button className="icon-btn" aria-label="Close editor" onClick={()=>setEditor(null)}><X size={21}/></button><span className="meta">{editor.id?'EDIT PIECE':'NEW PIECE'}</span><button className="save-btn" disabled={busy} onClick={()=>void persist(editor)}>{busy?'Saving…':'Save'}</button></div>
          <p className="editor-intro">A quiet place to begin.</p><input aria-label="Title" placeholder="Untitled" maxLength={180} value={editor.title} onChange={e=>setEditor(prev=>prev&&({...prev,title:e.target.value}))}/>
          <textarea aria-label="Your writing" placeholder="Write whatever comes to mind..." maxLength={50000} value={editor.body} onChange={e=>setEditor(prev=>prev&&({...prev,body:e.target.value}))}/>
          <div className="editor-footer"><div className="kind-picker">{(['Poem','Fragment','Thought'] as Piece['kind'][]).map(k=><button className={editor.kind===k?'chosen':''} onClick={()=>setEditor(prev=>prev&&({...prev,kind:k}))} key={k}>{k}</button>)}</div><span>Cloud save</span></div>
        </div></motion.div>}
    </AnimatePresence>
    {notice&&<div role="status" className="toast">{notice}</div>}
  </div>
}

export default App
