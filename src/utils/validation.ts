/**
 * Input validation and sanitization utilities for frontend security
 */

/**
 * Sanitizes and validates stock symbol input
 * @param input Raw user input
 * @returns Sanitized symbol or null if invalid
 */
export const sanitizeStockSymbol = (input: string): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  // Remove any HTML tags, scripts, and special characters
  const cleaned = input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/[^\w.-]/g, '') // Only allow alphanumeric, dots, and hyphens
    .toUpperCase();

  // Validate length and format
  if (cleaned.length === 0 || cleaned.length > 10) {
    return null;
  }

  // Basic stock symbol pattern validation (1-10 alphanumeric characters)
  const symbolPattern = /^[A-Z0-9.-]{1,10}$/;
  return symbolPattern.test(cleaned) ? cleaned : null;
};

/**
 * Sanitizes numeric input for financial calculations
 * @param input Raw user input
 * @returns Sanitized number or null if invalid
 */
export const sanitizeNumericInput = (input: string | number): number | null => {
  if (typeof input === 'number') {
    return isNaN(input) || !isFinite(input) ? null : input;
  }

  if (typeof input !== 'string') {
    return null;
  }

  // Remove any non-numeric characters except decimal point and negative sign
  const cleaned = input.trim().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
};

/**
 * Validates and sanitizes company name for search/display
 * @param input Raw company name input
 * @returns Sanitized company name or null if invalid
 */
export const sanitizeCompanyName = (input: string): string | null => {
  if (typeof input !== 'string') {
    return null;
  }

  // Remove HTML tags and potentially dangerous characters
  const cleaned = input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100); // Limit length

  return cleaned.length > 0 ? cleaned : null;
};

/**
 * General text sanitizer for display purposes
 * @param input Raw text input
 * @param maxLength Maximum allowed length
 * @returns Sanitized text
 */
export const sanitizeDisplayText = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, maxLength);
};

/**
 * Validates email format (for any future email inputs)
 * @param email Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};