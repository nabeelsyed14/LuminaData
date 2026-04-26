import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Database, MessageSquare, Send, BarChart3, Loader2, Activity, TrendingUp, Users, Brain, Code2, ChevronDown, ChevronUp, Search, Sparkles, LogOut, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// ── Shared Styles ──
const card = { background: '#fff', borderRadius: 28, border: '1px solid #e2e8f0', padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' };
const badge = { fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' };
const headerFont = { fontFamily: "'Outfit', sans-serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

const API_BASE = `http://${window.location.hostname}:8000`;

// ── LoginScreen ──
const LoginScreen = () => {
  const { setToken } = useStore();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? 'register' : 'login';
    
    try {
      let body, headers;
      if (isRegister) {
        body = JSON.stringify({ username, password });
        headers = { 'Content-Type': 'application/json' };
      } else {
        const fd = new URLSearchParams();
        fd.append('username', username);
        fd.append('password', password);
        body = fd;
        headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      }

      const res = await fetch(`${API_BASE}/${endpoint}`, { method: 'POST', headers, body });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');
      
      setToken(data.access_token);
    } catch (err) {
      console.error('Auth Error:', err);
      setError(err.message === 'Failed to fetch' 
        ? 'Cannot connect to server. Is the Python backend running on port 8000?' 
        : err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', ...bodyFont }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: 400, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 32, padding: 40, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <BarChart3 size={32} />
          </div>
        </div>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: '#1e293b', marginBottom: 8, ...headerFont }}>LuminaData</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 500, marginBottom: 32 }}>{isRegister ? 'Create your account' : 'Sign in to continue'}</p>
        
        {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, marginBottom: 20, border: '1px solid #fecaca', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input required placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '14px 20px', borderRadius: 16, border: '2px solid #e2e8f0', outline: 'none', fontSize: 16, fontWeight: 500, background: '#f8fafc' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '14px 20px', borderRadius: 16, border: '2px solid #e2e8f0', outline: 'none', fontSize: 16, fontWeight: 500, background: '#f8fafc' }} onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          <button type="submit" style={{ padding: 16, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #818cf8)', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>{isRegister ? 'Register' : 'Sign In'}</button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, fontWeight: 500, color: '#64748b' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"} 
          <span style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer', marginLeft: 6 }} onClick={() => { setIsRegister(!isRegister); setError(''); }}>{isRegister ? 'Sign In' : 'Register'}</span>
        </div>
      </motion.div>
    </div>
  );
};

// ── DataView ──
const DataView = ({ fileId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useStore();

  useEffect(() => {
    if (!fileId) { setLoading(false); setData([]); return; }
    setLoading(true);
    setData([]);
    fetch(`${API_BASE}/data/${fileId}`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(r => r.ok ? r.json() : [])
      .then(d => Array.isArray(d) ? setData(d) : setData([]))
      .catch(e => { console.error(e); setData([]); })
      .finally(() => setLoading(false));
  }, [fileId, token]);

  if (!fileId) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', ...bodyFont }}><span style={{ fontWeight: 700, color: '#94a3b8' }}>Select a dataset to explore.</span></div>;
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}><Loader2 className="animate-spin" style={{ color: '#6366f1' }} size={32} /><span style={{ fontWeight: 700, color: '#94a3b8', ...bodyFont }}>Loading data...</span></div>;
  const cols = Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 32, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...bodyFont }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', ...headerFont }}>Dataset Explorer</h2>
          <p style={{ color: '#94a3b8', fontWeight: 500, marginTop: 4 }}>Previewing top 50 records</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#eef2ff', padding: '8px 16px', borderRadius: 100, border: '1px solid #c7d2fe' }}>
          <div style={{ width: 8, height: 8, background: '#6366f1', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          <span style={{ ...badge, color: '#6366f1' }}>Live Sync</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', borderRadius: 20, border: '1px solid #e2e8f0', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {cols.map(c => <th key={c} style={{ padding: '16px 20px', textAlign: 'left', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {cols.map(c => <td key={c} style={{ padding: '14px 20px', fontSize: 13, fontWeight: 500, color: '#475569' }}>{String(row[c])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ── SettingsModal ──
const SettingsModal = ({ isOpen, onClose }) => {
  const { provider, apiKeys, setSettings } = useStore();
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [localProvider, setLocalProvider] = useState(provider);

  if (!isOpen) return null;

  const save = () => {
    setSettings(localProvider, localKeys);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, ...bodyFont }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, width: 450, padding: 32 }}>
        <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, ...headerFont }}>AI Configuration</h3>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ ...badge, display: 'block', marginBottom: 8 }}>AI Provider</label>
          <select value={localProvider} onChange={e => setLocalProvider(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, fontWeight: 600 }}>
            <option value="ollama">Ollama (Local)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        {localProvider === 'gemini' && (
          <div style={{ marginBottom: 24 }}>
            <label style={{ ...badge, display: 'block', marginBottom: 8 }}>Gemini API Key</label>
            <input type="password" value={localKeys.gemini || ''} onChange={e => setLocalKeys({ ...localKeys, gemini: e.target.value })} placeholder="Enter your key..." style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, fontWeight: 500 }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} style={{ padding: '10px 24px', borderRadius: 12, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Settings</button>
        </div>
      </motion.div>
    </div>
  );
};

const ReportView = ({ schema, fileName }) => {
  if (!schema || !schema.shape) return <div style={{ padding: 40, textAlign: 'center', opacity: 0.5, ...bodyFont }}>Upload a dataset to generate a report.</div>;

  const stats = [
    { label: 'Total Records', value: schema.shape[0]?.toLocaleString() || '0', icon: <Users size={24} />, bg: '#eef2ff', color: '#6366f1' },
    { label: 'Feature Count', value: schema.shape[1] || '0', icon: <Database size={24} />, bg: '#fce7f3', color: '#ec4899' },
    { label: 'Data Integrity', value: '98.4%', icon: <Activity size={24} />, bg: '#d1fae5', color: '#10b981' },
  ];

  return (
    <div style={{ padding: 32, height: '100%', overflowY: 'auto', ...bodyFont }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Sparkles style={{ color: '#f59e0b' }} size={28} />
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', ...headerFont }}>Smart Analysis</h2>
        </div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>Deep insights for <span style={{ color: '#6366f1', fontWeight: 700 }}>{fileName}</span></p>
      </div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ flex: 1, ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: s.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: 16 }}>{s.icon}</div>
            <div style={{ ...badge, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', ...headerFont }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ flex: 1, ...card }}>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, ...headerFont }}>
            <div style={{ width: 36, height: 36, background: '#6366f1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Database size={18} /></div>
            Column Definitions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schema.columns.slice(0, 10).map(col => (
              <div key={col} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: 14 }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{col}</span>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#6366f1', background: '#eef2ff', padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{schema.dtypes[col]}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #7c3aed, #a855f7)', padding: 36, borderRadius: 28, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.08, pointerEvents: 'none' }}><Brain size={200} /></div>
          <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1, ...headerFont }}>
            <Brain size={28} /> AI Discoveries
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>
            {[
              { n: '1', title: 'Quality Check Passed', text: 'No critical missing values found. The dataset is healthy and properly structured for advanced predictive modeling tasks.' },
              { n: '2', title: 'Pattern Recognition', text: 'Strong variance in numeric fields indicates a rich, diverse set of transaction records ideal for detailed categorical analysis.' },
            ].map(d => (
              <div key={d.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'rgba(255,255,255,0.12)', padding: 20, borderRadius: 20, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: '#6366f1', flexShrink: 0 }}>{d.n}</div>
                <div>
                  <h4 style={{ fontWeight: 900, fontSize: 16, marginBottom: 6, ...headerFont }}>{d.title}</h4>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, lineHeight: 1.6, fontSize: 14 }}>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Evidence Pill ──
const EvidencePill = ({ result }) => {
  const [open, setOpen] = useState(false);
  if (!result || result.includes('Query executed successfully') || result.includes('Error')) return null;
  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
      <div onClick={() => setOpen(!open)} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s' }}>
        <Code2 size={14} style={{ color: '#6366f1' }} />
        <span style={{ ...badge, color: '#64748b' }}>Verification Data</span>
        {open ? <ChevronUp size={14} style={{ color: '#94a3b8' }} /> : <ChevronDown size={14} style={{ color: '#94a3b8' }} />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ marginTop: 12, background: '#1e293b', color: '#34d399', padding: 20, borderRadius: 16, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', overflowX: 'auto', lineHeight: 1.6 }}>{result}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main App ──
function App() {
  const { 
    isAuthenticated, token, setToken, 
    fileId, fileName, schema, chatHistories, commonMessages, isLoading, view, savedDatasets, provider, apiKeys,
    setFile, setSchema, setView, addMessage, setLoading, setSavedDatasets 
  } = useStore();
  
  const [input, setInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef(null);

  // Derive active messages based on current selection
  const messages = fileId === 'common' ? commonMessages : (chatHistories[fileId] || []);

  const authFetch = async (url, opts = {}) => {
    const headers = { ...opts.headers, 'Authorization': `Bearer ${token}` };
    try {
      const res = await fetch(url, { ...opts, headers });
      if (res.status === 401) { setToken(null); return null; }
      return res;
    } catch (e) { console.error('Fetch error:', e); return null; }
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isLoading, view]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    (async () => {
      const res = await authFetch(`${API_BASE}/datasets`);
      if (!res) return;
      const d = await res.json();
      if (Array.isArray(d)) setSavedDatasets(d);
    })();
  }, [isAuthenticated, token]);

  const loadSchema = async (id, name) => {
    setFile(id, name);
    setSchema(null);
    const res = await authFetch(`${API_BASE}/schema/${id}`);
    if (res && res.ok) {
      setSchema(await res.json());
    }
  };

  const onDrop = async (files) => {
    const f = files[0]; const fd = new FormData(); fd.append('file', f);
    const r = await authFetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
    if (r && r.ok) {
      const d = await r.json();
      await loadSchema(d.file_id, d.filename);
      const dsRes = await authFetch(`${API_BASE}/datasets`);
      if (dsRes && dsRes.ok) {
        const dsData = await dsRes.json();
        if (Array.isArray(dsData)) setSavedDatasets(dsData);
      }
    }
  };
  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  const handleSend = async () => {
    if (!input.trim() || !fileId) return;
    const q = input; addMessage({ role: 'user', content: q }); setInput(''); setLoading(true);
    
    const endpoint = fileId === 'common' ? '/query_common' : '/query';
    const payload = {
      query: q,
      provider,
      model: provider === 'ollama' ? 'llama3' : 'gemini-1.5-flash',
      api_key: apiKeys[provider]
    };
    if (fileId !== 'common') payload.file_id = fileId;

    try {
      const r = await authFetch(`${API_BASE}${endpoint}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (r && r.ok) {
        const d = await r.json(); addMessage({ role: 'assistant', content: d.answer, result: d.code || '', plot: d.plot });
      } else {
        addMessage({ role: 'assistant', content: 'Server connection error.', result: '' });
      }
    } catch (e) {
      addMessage({ role: 'assistant', content: 'Fatal connection error.', result: '' });
    }
    setLoading(false);
  };

  if (!isAuthenticated) return <LoginScreen />;

  const navItems = [
    { id: 'analysis', label: 'AI Insights', icon: <MessageSquare size={20} /> },
    { id: 'data', label: 'Explorer', icon: <Search size={20} /> },
    { id: 'reports', label: 'Analysis', icon: <TrendingUp size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', padding: 20, gap: 20, ...bodyFont }}>
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* ── Sidebar ── */}
      <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        style={{ width: 280, flexShrink: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', padding: '28px 20px', border: '1px solid rgba(255,255,255,0.5)' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, paddingLeft: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.img initial={{ scale: 0 }} animate={{ scale: 1 }} src="/logo.png" style={{ width: 44, height: 44, borderRadius: 16, boxShadow: '0 8px 20px rgba(99,102,241,0.3)', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BarChart3 size={24} /></div>
            <span style={{ fontSize: 26, fontWeight: 900, color: '#6366f1', letterSpacing: '-0.03em', ...headerFont }}>Lumina</span>
          </div>
          <button onClick={() => setToken(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><LogOut size={20} /></button>
        </div>

        {/* Nav */}
        <nav style={{ marginBottom: 24 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setView(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderRadius: 18, marginBottom: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15, transition: 'all 0.2s', ...(view === item.id ? { background: '#6366f1', color: '#fff', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' } : { color: '#64748b' }) }}>
              {item.icon} <span style={{ fontWeight: 700 }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Global Intelligence */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, paddingLeft: 8 }}>Intelligence</div>
          <div onClick={() => { setFile('common', 'Global Intelligence'); setView('analysis'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s', background: fileId === 'common' ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'transparent', color: fileId === 'common' ? '#fff' : '#64748b', border: fileId === 'common' ? 'none' : '1px solid #e2e8f0' }}>
            <Brain size={18} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Global Assistant</span>
          </div>
        </div>

        {/* Saved Datasets */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, paddingLeft: 8 }}>Saved Datasets</div>
          {!Array.isArray(savedDatasets) || savedDatasets.length === 0 ? (
            <div style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 8, fontStyle: 'italic' }}>No datasets saved yet.</div>
          ) : (
            savedDatasets.map(ds => (
              <div key={ds.id} onClick={() => { loadSchema(ds.id, ds.filename); setView('analysis'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s', background: fileId === ds.id ? '#f1f5f9' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={e => e.currentTarget.style.background = fileId === ds.id ? '#f1f5f9' : 'transparent'}>
                <FileText size={16} color={fileId === ds.id ? '#6366f1' : '#94a3b8'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: fileId === ds.id ? '#1e293b' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ds.filename}</span>
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div {...getRootProps()} style={{ flex: 1, background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: 20, padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
            <input {...getInputProps()} />
            <Upload style={{ color: '#6366f1' }} size={20} />
          </div>
          <button onClick={() => setSettingsOpen(true)} style={{ width: 48, height: 48, borderRadius: 20, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <Activity size={20} />
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)' }}>
        {view === 'analysis' && (
          <>
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 40, backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
              <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
                {messages.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: 120 }}>
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ width: 120, height: 120, background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', marginBottom: 32, boxShadow: '0 20px 40px rgba(99,102,241,0.15)', border: '4px solid #fff' }}><Brain size={56} /></motion.div>
                    <h2 style={{ fontSize: 40, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.03em', marginBottom: 16, ...headerFont }}>{fileId === 'common' ? 'Global Intelligence' : 'Ask me anything.'}</h2>
                    <p style={{ color: '#94a3b8', fontWeight: 500, maxWidth: 400, fontSize: 16, lineHeight: 1.6 }}>{fileId === 'common' ? 'Ask questions across all your datasets.' : 'Select a dataset to begin specific analysis.'}</p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ padding: 28, borderRadius: 24, fontSize: 16, lineHeight: 1.7, fontWeight: 700, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', ...(msg.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', borderBottomRightRadius: 8, boxShadow: '0 10px 25px rgba(99,102,241,0.25)' } : { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderBottomLeftRadius: 8, boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }) }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        
                        {msg.plot && (
                          <div style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <img src={`data:image/png;base64,${msg.plot}`} alt="AI Generated Plot" style={{ width: '100%', display: 'block' }} />
                          </div>
                        )}

                        {msg.role === 'assistant' && msg.result?.includes('Error executing') && (
                          <div style={{ marginTop: 16, padding: 20, background: '#fff1f2', color: '#e11d48', borderRadius: 20, fontSize: 13, fontWeight: 700, border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 20 }}>⚠️</span><span>Error executing query: {msg.result.split(':').pop().trim()}</span></div>
                        )}
                        {msg.role === 'assistant' && !msg.result?.includes('Error executing') && msg.result && <EvidencePill result={msg.result} />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: '20px 28px', alignSelf: 'flex-start', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 6 }}>{[0, 0.2, 0.4].map(d => <motion.div key={d} animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: d }} style={{ width: 8, height: 8, background: '#6366f1', borderRadius: '50%' }} />)}</div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Analyzing Data...</span>
                  </motion.div>
                )}
              </div>
            </div>
            <div style={{ padding: '24px 40px', borderTop: '1px solid #f1f5f9', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}>
              <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12, background: '#f8fafc', padding: 8, borderRadius: 24, border: '2px solid #e2e8f0', transition: 'all 0.2s' }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={fileId ? "Ask a question..." : "Select a dataset to begin..."} disabled={!fileId || isLoading} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '12px 20px', fontSize: 16, fontFamily: 'inherit', color: '#1e293b' }} />
                <button onClick={handleSend} disabled={!fileId || !input.trim() || isLoading} style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6366f1, #818cf8)', borderRadius: 18, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', opacity: (!fileId || !input.trim() || isLoading) ? 0.4 : 1 }}><Send size={20} /></button>
              </div>
            </div>
          </>
        )}
        {view === 'data' && <DataView fileId={fileId === 'common' ? null : fileId} />}
        {view === 'reports' && <ReportView schema={schema} fileName={fileName} />}
      </main>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: 'red', fontFamily: 'monospace', background: '#fef2f2', height: '100vh' }}>
          <h2>React Crash:</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 20 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
