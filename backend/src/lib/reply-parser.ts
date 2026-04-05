// ============================================
// Reply Parser Utility
// ============================================
// Parses structured WhatsApp replies (e.g., numeric menus, "Yes/No").

export type ParsedReply = {
  type: 'numeric' | 'keyword' | 'text';
  value: string | number;
  original: string;
};

/**
 * Parses an incoming message body to identify structured input.
 */
export function parseReply(body: string): ParsedReply {
  const trimmed = body.trim().toLowerCase();

  // 1. Check for numeric replies (e.g., "1", "1.", "1 )", "1)")
  const numericMatch = trimmed.match(/^(\d+)[.\s)]*$/);
  if (numericMatch) {
    return {
      type: 'numeric',
      value: parseInt(numericMatch[1], 10),
      original: body,
    };
  }

  // 2. Check for common keywords
  const keywords: Record<string, string[]> = {
    yes: ['yes', 'y', 'confirm', 'correct', 'yep', 'ha'],
    no: ['no', 'n', 'cancel', 'stop', 'nope', 'na'],
    help: ['help', 'assist', 'sos', 'support'],
    back: ['back', 'previous', 'prev'],
  };

  for (const [key, variants] of Object.entries(keywords)) {
    if (variants.includes(trimmed)) {
      return {
        type: 'keyword',
        value: key,
        original: body,
      };
    }
  }

  // 3. Default to raw text
  return {
    type: 'text',
    value: body.trim(),
    original: body,
  };
}

/**
 * Matches a parsed reply against a list of options.
 * Options can be numeric indices or keyword values.
 */
export function matchOption<
  T extends { value?: string | number; id?: string | number; label?: string },
>(parsed: ParsedReply, options: T[]): T | null {
  if (parsed.type === 'numeric') {
    const index = (parsed.value as number) - 1;
    if (index >= 0 && index < options.length) {
      return options[index];
    }
  }

  if (parsed.type === 'keyword') {
    return (
      options.find(
        (opt) =>
          opt.value?.toString().toLowerCase() === parsed.value ||
          opt.id?.toString().toLowerCase() === parsed.value ||
          opt.label?.toString().toLowerCase() === parsed.value,
      ) || null
    );
  }

  // For text, try label match
  return (
    options.find(
      (opt) => opt.label?.toString().toLowerCase() === parsed.value.toString().toLowerCase(),
    ) || null
  );
}
