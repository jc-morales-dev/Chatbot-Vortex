import { describe, expect, it } from 'vitest';

import type { FileAttachment } from '../types';
import { analyzeFiles } from './analyzer';
import { generateBotResponse, generateTitle } from './chat';

const attachment = (overrides: Partial<FileAttachment> = {}): FileAttachment => ({
  id: 'file-1',
  name: 'notes.md',
  size: 1024,
  mimeType: 'text/markdown',
  type: 'text',
  status: 'ready',
  extension: 'md',
  content: 'hola mundo',
  ...overrides,
});

describe('chat utils', () => {
  it('uses attachment names for empty conversation titles', () => {
    expect(generateTitle('', [attachment()])).toBe('notes.md');
    expect(generateTitle('', [attachment(), attachment({ id: 'file-2', name: 'todo.txt' })])).toBe('2 archivos');
  });

  it('truncates long message titles used when sending the first message', () => {
    expect(generateTitle('Hola VORTEX')).toBe('Hola VORTEX');
    expect(generateTitle('uno dos tres cuatro cinco seis')).toBe('uno dos tres cuatro cinco');
    expect(generateTitle('abcdefghijklmnopqrstuvwxyz0123456789')).toBe('abcdefghijklmnopqrstuvwxyz0123...');
  });

  it('summarizes multiple attachments in analysis mode', () => {
    const summary = analyzeFiles([
      attachment(),
      attachment({ id: 'file-2', name: 'image.png', type: 'image', mimeType: 'image/png', extension: 'png', content: '{"width":1920,"height":1080,"format":"PNG"}' }),
    ]);

    expect(summary).toContain('He analizado 2 archivos');
    expect(summary).toContain('notes.md');
    expect(summary).toContain('image.png');
  });

  it('answers offline send prompts without attachments', () => {
    const reply = generateBotResponse('Hola, ¿qué puedes hacer?');
    expect(reply).toMatch(/VORTEX|puedo/i);
  });
});
