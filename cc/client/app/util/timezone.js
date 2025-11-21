/**
 * Timezone detection utility
 * Automatically detects user's timezone from browser and provides fallback to UTC
 */

/**
 * Detects the user's timezone from the browser
 * @returns {string} IANA timezone identifier (e.g., 'America/Denver') or 'UTC' as fallback
 */
export const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    console.warn('Timezone detection failed, falling back to UTC:', error);
    return 'UTC';
  }
};

/**
 * Gets timezone offset in minutes (same as Date.getTimezoneOffset())
 * @returns {number} Timezone offset in minutes
 */
export const getTimezoneOffset = () => {
  try {
    return new Date().getTimezoneOffset();
  } catch (error) {
    console.warn('Timezone offset detection failed, using 0 (UTC):', error);
    return 0;
  }
};

/**
 * Gets timezone information object with both IANA timezone and offset
 * @returns {Object} {timezone: string, offset: number}
 */
export const getTimezoneInfo = () => {
  return {
    timezone: detectTimezone(),
    offset: getTimezoneOffset()
  };
};

export default {
  detectTimezone,
  getTimezoneOffset,
  getTimezoneInfo
};
