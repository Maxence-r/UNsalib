import Stat from "../models/stat.js";
import wsManager from "../../../server.js";
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isBot as detectBot } from 'ua-parser-js/helpers';

// Compares two statistics to sort them
function compareStatsObjs(a, b) {
    if (a.date < b.date) {
        return -1;
    } else if (a.date > b.date) {
        return 1;
    } else {
        return 0;
    }
}

/**
 * Creates a unique fingerprint for a visitor using industry-standard methods
 * Combines IP address hash + User Agent hash for better accuracy
 * Following best practices from Google Analytics, Matomo, and other analytics platforms
 */
function createVisitorFingerprint(ipAddress, userAgent) {
    // Hash IP address for privacy (GDPR compliance)
    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);
    
    // Parse user agent to extract stable components
    const parsedUA = new UAParser({ Bots });
    parsedUA.setUA(userAgent);
    const ua = parsedUA.getResult();
    
    // Create a stable UA fingerprint (browser + OS + device type)
    // This is more stable than full UA string which may include version updates
    const uaComponents = [
        ua.browser.name || 'unknown',
        ua.os.name || 'unknown',
        ua.device.type || 'desktop'
    ].join('|');
    
    const uaHash = crypto.createHash('sha256').update(uaComponents).digest('hex').substring(0, 16);
    
    // Composite fingerprint: IP + UA components
    // This approach is used by major analytics platforms
    const fingerprint = crypto.createHash('sha256').update(ipHash + uaHash).digest('hex');
    
    return {
        fingerprint,
        ipHash,
        isBot: detectBot(ua)
    };
}

/**
 * Extracts the real IP address from the request
 * Handles proxies, load balancers, and CDNs (like Cloudflare)
 */
function getClientIP(req) {
    // Check various headers in order of reliability
    // X-Forwarded-For can contain multiple IPs, we take the first (client IP)
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        const ips = xForwardedFor.split(',');
        return ips[0].trim();
    }
    
    // Fallback headers
    return req.headers['x-real-ip'] || 
           req.headers['cf-connecting-ip'] || // Cloudflare
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           req.connection.socket?.remoteAddress ||
           '0.0.0.0';
}

// Adds records to the database for statistical purposes
async function updateStats(statName, userId, userAgent, req) {
    if (userId && userAgent && req) {
        try {
            let today = new Date().toISOString().split('T')[0];
            
            // Get client IP and create fingerprint
            const clientIP = getClientIP(req);
            const { fingerprint, ipHash, isBot } = createVisitorFingerprint(clientIP, userAgent);
            
            // Try to find existing stat by fingerprint first (more reliable)
            let userStats = await Stat.findOne({ fingerprint: fingerprint, date: today });
            
            // Fallback to userId if fingerprint doesn't exist (for backward compatibility)
            if (!userStats) {
                userStats = await Stat.findOne({ userId: userId, date: today });
            }
            
            if (!userStats) {
                const userStatsToday = new Stat({
                    date: today,
                    roomRequests: statName === 'room_requests' ? 1 : 0,
                    roomsListRequests: statName === 'rooms_list_requests' ? 1 : 0,
                    availableRoomsRequests: statName === 'available_rooms_requests' ? 1 : 0,
                    internalErrors: statName === 'internal_errors' ? 1 : 0,
                    userId: userId,
                    userAgent: userAgent,
                    ipHash: ipHash,
                    fingerprint: fingerprint,
                    isBot: isBot,
                    lastActivity: new Date()
                });
                await userStatsToday.save();
            } else {
                let update;
                if (statName === 'rooms_list_requests') {
                    update = { $inc: { roomsListRequests: 1 } };
                } else if (statName === 'available_rooms_requests') {
                    update = { $inc: { availableRoomsRequests: 1 } };
                } else if (statName === 'room_requests') {
                    update = { $inc: { roomRequests: 1 } };
                } else if (statName === 'internal_errors') {
                    update = { $inc: { internalErrors: 1 } };
                }
                
                // Update all tracking fields
                update.userAgent = userAgent;
                update.ipHash = ipHash;
                update.fingerprint = fingerprint;
                update.isBot = isBot;
                update.lastActivity = new Date();
                
                await Stat.findOneAndUpdate({ fingerprint: fingerprint, date: today }, update, {});
            }
            wsManager.sendStatsUpdate();
        } catch (error) {
            console.error(`Erreur pendant l'enregistrement de statistiques (${error})`);
        }
    }
}

export { updateStats, compareStatsObjs };