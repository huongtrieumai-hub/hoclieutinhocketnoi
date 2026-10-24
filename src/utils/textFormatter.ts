/**
 * Utility functions for formatting lesson text and knowledge sentences.
 * Ensures each sentence after a period, exclamation/question mark, or bullet dash
 * breaks cleanly into a separate line for optimal readability.
 */

/**
 * Splits raw text into an array of lines, breaking after periods (. ! ? …),
 * and bullet point markers (- ).
 */
export function splitSentencesToLines(rawText: string | undefined | null): string[] {
  if (!rawText || typeof rawText !== 'string') return [];

  // 1. Normalize line endings
  let text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 2. Break before bullet markers when preceded by dot/colon/semicolon/comma or ellipsis
  // Example: "...phần mềm. - Phần cứng...", "...máy in,... - Phần mềm..."
  text = text.replace(/([.!?…,:])\s*-\s+/g, '$1\n- ');

  // 3. Break before any standalone "- " inside text if preceded by space
  text = text.replace(/\s+-\s+(?=[A-ZÀ-ỸĐa-zà-ỹđ0-9])/g, '\n- ');

  // 4. Break after punctuation (. ! ?) followed by whitespace
  // Lookahead avoids breaking on decimals like 3.14 or trailing dots
  text = text.replace(/([.!?…])\s+(?=[A-ZÀ-ỸĐa-zà-ỹđ0-9\-"'“‘(\[])/g, '$1\n');

  // 5. Split by newlines, trim and filter empty
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Formats a raw text block by inserting clean newlines (\n) after each sentence.
 */
export function formatSentenceBreaks(rawText: string | undefined | null): string {
  if (!rawText || typeof rawText !== 'string') return '';
  const lines = splitSentencesToLines(rawText);
  return lines.join('\n');
}
