import type { Conversation } from '../types';

export function exportJson(conversations: Conversation[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      conversationCount: conversations.length,
      conversations,
    },
    null,
    2,
  );
}

export function exportMarkdown(conversations: Conversation[]): string {
  return conversations
    .map((conversation) => {
      const sections = [
        `# ${conversation.title}`,
        '',
        `Creada: ${new Date(conversation.createdAt).toLocaleString('es-ES')}`,
        `Actualizada: ${new Date(conversation.updatedAt).toLocaleString('es-ES')}`,
        '',
      ];

      for (const message of conversation.messages.filter((item) => !item.deleted)) {
        sections.push(`## ${message.role === 'user' ? 'Usuario' : 'VORTEX'}`);
        sections.push(`Hora: ${new Date(message.timestamp).toLocaleString('es-ES')}`);

        if (message.attachments?.length) {
          sections.push('Adjuntos:');
          for (const attachment of message.attachments) {
            sections.push(`- ${attachment.name} (${attachment.type}, ${attachment.size} bytes)`);
          }
        }

        sections.push('');
        sections.push(message.content || '(sin texto)');
        sections.push('');
      }

      return sections.join('\n');
    })
    .join('\n---\n\n');
}

export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'conversation';
}

export function createExportName(extension: 'json' | 'md', title = 'vortex-export'): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${slugifyTitle(title)}-${stamp}.${extension}`;
}
