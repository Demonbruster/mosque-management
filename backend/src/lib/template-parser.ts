// ============================================
// WhatsApp Template Variable Parser
// ============================================
// Utility to replace placeholders like {{first_name}} or {{1}}
// with actual data from a person or context.
// ============================================

interface PersonContext {
  first_name: string;
  last_name: string;
  phone_number?: string;
  [key: string]: any;
}

/**
 * Resolves variables in a template string.
 * Supports both named variables {{first_name}} and indexed variables {{1}}.
 *
 * @param template The raw template body string.
 * @param person The person record to extract data from.
 * @param additionalContext Any extra key-value pairs (e.g. donation amount).
 * @returns The resolved message string.
 */
export function resolveTemplateVariables(
  template: string,
  person: PersonContext,
  additionalContext: Record<string, any> = {},
): string {
  let resolved = template;

  // 1. Resolve named variables from person or additionalContext
  // Format: {{variable_name}}
  const namedRegex = /\{\{([a-zA-Z_0-9]+)\}\}/g;
  resolved = resolved.replace(namedRegex, (match, key) => {
    // Check additional context first, then person
    if (additionalContext[key] !== undefined) return String(additionalContext[key]);
    if (person[key] !== undefined) return String(person[key]);
    return match; // Leave as is if not found
  });

  // 2. Resolve indexed variables (Twilio/Meta standard)
  // Format: {{1}}, {{2}}, etc.
  // We assume a predefined mapping if using indexed variables,
  // but for now we look for a 'variables' array in additionalContext
  if (additionalContext.variables && Array.isArray(additionalContext.variables)) {
    const indexedRegex = /\{\{(\d+)\}\}/g;
    resolved = resolved.replace(indexedRegex, (match, indexStr) => {
      const index = parseInt(indexStr) - 1; // 1-indexed to 0-indexed
      if (additionalContext.variables[index] !== undefined) {
        return String(additionalContext.variables[index]);
      }
      return match;
    });
  }

  return resolved;
}
