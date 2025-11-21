/**
 * Timezone middleware
 * Extracts timezone information from request headers and attaches to request object
 */

import logger from '../../logger';

/**
 * Middleware to extract timezone information from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const timezoneMiddleware = (req, res, next) => {
  try {
    const timezone = req.headers['x-timezone'] || 'UTC';
    const timezoneOffset = req.headers['x-timezone-offset'];
    
    const isValidTimezone = /^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$|^GMT[+-]?\d*$|^Etc\/GMT[+-]?\d*$/.test(timezone);
    
    // Validate timezone offset (should be a number between -720 and 720 minutes)
    const isValidOffset = timezoneOffset === undefined || 
      (!isNaN(parseInt(timezoneOffset)) && 
       parseInt(timezoneOffset) >= -720 && 
       parseInt(timezoneOffset) <= 720);
    
    req.timezone = {
      id: isValidTimezone ? timezone : 'UTC',
      offset: timezoneOffset ? parseInt(timezoneOffset) : 0,
      detected: isValidTimezone && timezone !== 'UTC',
      valid: isValidTimezone && isValidOffset
    };
    
    next();
  } catch (error) {
    logger.error(`Error in timezone middleware: ${error.message}`);
    
    // Fallback to UTC if there's an error
    req.timezone = {
      id: 'UTC',
      offset: 0,
      detected: false,
      valid: false,
      error: error.message
    };
    
    next();
  }
};

export default {
  timezoneMiddleware
};
