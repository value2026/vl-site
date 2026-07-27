const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log files mapping
const logFiles = {
  error: path.join(logsDir, 'error.log'),
  combined: path.join(logsDir, 'combined.log'),
  access: path.join(logsDir, 'access.log'),
  exception: path.join(logsDir, 'exception.log'),
  rejection: path.join(logsDir, 'rejection.log'),
  audit: path.join(logsDir, 'audit.log'),
  frontend: path.join(logsDir, 'frontend-error.log')
};

// Internal function to format and write
function writeLog(type, level, data, source = 'Backend') {
  const timestamp = new Date().toISOString();
  const pid = process.pid;
  const env = process.env.NODE_ENV || 'development';

  let message = `[${timestamp}]\n`;
  message += `Level: ${level.toUpperCase()}\n`;
  message += `PID: ${pid}\n`;
  message += `Environment: ${env}\n`;
  message += `Source: ${source}\n`;

  // Custom formatting based on type of data
  if (typeof data === 'string') {
    message += `Message: ${data}\n`;
  } else if (data instanceof Error) {
    message += `Message: ${data.message}\n`;
    
    // Explicitly track DB (Prisma) Error properties if they exist
    if (data.code) message += `DB Error Code: ${data.code}\n`;
    if (data.meta) message += `DB Error Meta: ${JSON.stringify(data.meta)}\n`;
    if (data.clientVersion) message += `Prisma Version: ${data.clientVersion}\n`;

    message += `Stack:\n${data.stack}\n`;
  } else if (data && typeof data === 'object') {
    if (data.message) message += `Message: ${data.message}\n`;
    if (data.stack) message += `Stack:\n${data.stack}\n`;
    if (data.url) message += `URL: ${data.url}\n`;
    if (data.userAgent) message += `User Agent: ${data.userAgent}\n`;
    if (data.clientTime) message += `Client Time: ${data.clientTime}\n`;
    
    // For access and audit logs
    if (data.method) message += `Method: ${data.method}\n`;
    if (data.path) message += `Path: ${data.path}\n`;
    if (data.status) message += `Status: ${data.status}\n`;
    if (data.duration) message += `Duration: ${data.duration}ms\n`;
    if (data.ip) message += `IP: ${data.ip}\n`;
    if (data.user) message += `User: ${data.user}\n`;
    if (data.action) message += `Action: ${data.action}\n`;
    if (data.details) message += `Details: ${JSON.stringify(data.details)}\n`;
  } else {
    message += `Data: ${JSON.stringify(data)}\n`;
  }

  message += '--------------------------------------------------\n\n';

  // Write to specific file
  if (logFiles[type]) {
    fs.appendFile(logFiles[type], message, (err) => {
      if (err) process.stderr.write(`Failed to write to ${type} log: ${err.message}\n`);
    });
  }

  // Always append to combined.log (unless it is already combined)
  if (type !== 'combined') {
    fs.appendFile(logFiles.combined, message, (err) => {
      if (err) process.stderr.write(`Failed to write to combined log: ${err.message}\n`);
    });
  }
}

module.exports = {
  // 1. Errors only
  logError: (err) => writeLog('error', 'error', err),
  
  // 2. HTTP Requests
  logAccess: (reqData) => writeLog('access', 'info', reqData),
  
  // 3. Uncaught Exceptions
  logException: (err) => writeLog('exception', 'fatal', err),
  
  // 4. Unhandled Rejections
  logRejection: (err) => writeLog('rejection', 'fatal', err),
  
  // 5. Audit (Login, role changes, etc)
  logAudit: (auditData) => writeLog('audit', 'info', auditData),

  // 6. Frontend Errors
  logFrontendError: (errData) => writeLog('frontend', 'error', errData, 'Frontend'),

  // 7. Generic Info for combined
  logInfo: (msg) => writeLog('combined', 'info', msg)
};
