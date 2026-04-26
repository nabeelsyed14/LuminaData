import { create } from 'zustand';

export const useStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  savedDatasets: [],
  fileId: null, // 'common' means the global chat, null means no file selected
  fileName: null,
  schema: null,
  chatHistories: {}, // { [fileId]: messages[] }
  commonMessages: [],
  isLoading: false,
  view: 'analysis',
  
  // Settings
  provider: localStorage.getItem('provider') || 'ollama',
  apiKeys: JSON.parse(localStorage.getItem('apiKeys') || '{}'),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    } else {
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false, fileId: null, fileName: null, schema: null, chatHistories: {}, commonMessages: [], savedDatasets: [] });
    }
  },
  
  setSavedDatasets: (datasets) => set({ savedDatasets: datasets }),
  
  setFile: (fileId, fileName) => set({ fileId, fileName }),
  
  setSchema: (schema) => set({ schema }),
  
  setView: (view) => set({ view }),
  
  addMessage: (msg) => set((state) => {
    if (state.fileId === 'common') {
      return { commonMessages: [...state.commonMessages, msg] };
    }
    if (!state.fileId) return state;
    const history = state.chatHistories[state.fileId] || [];
    return {
      chatHistories: {
        ...state.chatHistories,
        [state.fileId]: [...history, msg]
      }
    };
  }),

  setSettings: (provider, keys) => {
    localStorage.setItem('provider', provider);
    localStorage.setItem('apiKeys', JSON.stringify(keys));
    set({ provider, apiKeys: keys });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

