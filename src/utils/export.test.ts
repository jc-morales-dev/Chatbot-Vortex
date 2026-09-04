import { describe, expect, it } from 'vitest';

import type { Conversation } from '../types';
import { createExportName, exportJson, exportMarkdown, slugifyTitle } from './export';

const sampleConversation = (): Conversation => ({
  id: 'conv-1',
  title: 'Hola VORTEX',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_100_000,
  messages: [
    {
      id: 'm1',
      role: 'user',
      content: 'Hola',
      timestamp: 1_700_000_000_000,
      attachments: [
        {
          id: 'a1',
          name: 'notes.md',
          size: 12,
          mimeType: 'text/markdown',
          type: 'text',
          status: 'ready',
          extension: 'md',
        },
      ],
    },
    {
      id: 'm2',
      role: 'assistant',
      content: 'Soy VORTEX',
      timestamp: 1_700_000_050_000,
    },
    {
      id: 'm3',
      role: 'user',
      content: 'borrado',
      timestamp: 1_700_000_060_000,
      deleted: true,
    },
  ],
});

describe('export utils', () => {
  it('builds JSON backups with conversation metadata', () => {
    const json = exportJson([sampleConversation()]);
    const parsed = JSON.parse(json) as {
      conversationCount: number;
      conversations: Conversation[];
      exportedAt: string;
    };

    expect(parsed.conversationCount).toBe(1);
    expect(parsed.conversations[0].title).toBe('Hola VORTEX');
    expect(parsed.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('builds markdown transcripts and skips deleted messages', () => {
    const markdown = exportMarkdown([sampleConversation()]);

    expect(markdown).toContain('# Hola VORTEX');
    expect(markdown).toContain('## Usuario');
    expect(markdown).toContain('## VORTEX');
    expect(markdown).toContain('notes.md');
    expect(markdown).toContain('Soy VORTEX');
    expect(markdown).not.toContain('borrado');
  });

  it('slugifies titles for download filenames', () => {
    expect(slugifyTitle('Hola, VORTEX!')).toBe('hola-vortex');
    expect(slugifyTitle('   ')).toBe('conversation');
    expect(createExportName('json', 'Chat Demo')).toMatch(/^chat-demo-.+\.json$/);
    expect(createExportName('md')).toMatch(/^vortex-export-.+\.md$/);
  });
});
