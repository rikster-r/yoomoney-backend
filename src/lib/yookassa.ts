import { Request, Response, NextFunction } from 'express';
import ip from 'ip';

const notificationsAllowedIPs = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32',
];

export function isIPAllowed(clientIP: string) {
  for (const allowedIP of notificationsAllowedIPs) {
    // Check if it's a CIDR range
    if (allowedIP.includes('/')) {
      if (ip.cidrSubnet(allowedIP).contains(clientIP)) {
        return true;
      }
    } else {
      // Direct IP match
      if (clientIP === allowedIP) {
        return true;
      }
    }
  }
  return false;
}

export function checkYooKassaIP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Get client IP
  const clientIP =
    req.ip ||
    req.socket.remoteAddress ||
    (req.headers['x-forwarded-for']?.at(0) || '').split(',')[0].trim();

  // Check if IP is allowed
  const isAllowed = notificationsAllowedIPs.some((allowedIP) => {
    if (allowedIP.includes('/')) {
      return ip.cidrSubnet(allowedIP).contains(clientIP);
    }
    return clientIP === allowedIP;
  });

  if (isAllowed) {
    next();
  } else {
    console.log(`Blocked YooKassa notification from IP: ${clientIP}`);
    res.status(403).json({ error: 'Access denied' });
  }
}
