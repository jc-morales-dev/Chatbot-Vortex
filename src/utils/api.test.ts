import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AISettings } from '../types';
import {
  getDefaultSettings,
  getProviderConfig,
  loadSettings,
  saveSettings,
  sendToAI,
} from './api';

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  vi.stubGlobal('localStorage', localStorageMock);
  return store;
}

describe('api settings', () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns offline defaults', () => {
    const defaults = getDefaultSettings();
    expect(defaults.provider).toBe('offline');
    expect(defaults.apiKey).toBe('');
    expect(defaults.model).toBe('built-in');
  });

  it('persists and reloads settings with provider fallbacks', () => {
    const settings: AISettings = {
      provider: 'openrouter',
      apiKey: 'test-key',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      temperature: 0.2,
      maxTokens: 1024,
      systemPrompt: 'custom',
    };

    expect(saveSettings(settings)).toEqual({ ok: true });
    expect(loadSettings()).toEqual(settings);
  });

  it('falls back to defaults when storage is empty or corrupt', () => {
    expect(loadSettings()).toEqual(getDefaultSettings());
    localStorage.setItem('vortex-ai-settings', '{not-json');
    expect(loadSettings()).toEqual(getDefaultSettings());
  });

  it('resolves known providers and falls back to offline', () => {
    expect(getProviderConfig('groq').name).toBe('Groq');
    expect(getProviderConfig('offline').models[0]?.id).toBe('built-in');
    expect(getProviderConfig('not-a-provider' as AISettings['provider']).id).toBe('offline');
  });
});

describe('sendToAI guards', () => {
  it('rejects offline mode and missing API keys before fetching', async () => {
    await expect(
      sendToAI(getDefaultSettings(), 'hola', []),
    ).rejects.toThrow('OFFLINE_MODE');

    await expect(
      sendToAI(
        { ...getDefaultSettings(), provider: 'openrouter', apiKey: '   ', model: 'x' },
        'hola',
        [],
      ),
    ).rejects.toThrow('NO_API_KEY');
  });
});
