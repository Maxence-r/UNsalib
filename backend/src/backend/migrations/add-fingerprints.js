/**
 * Migration Script: Add Fingerprinting to Existing Stats
 * 
 * This script adds fingerprint data to existing stat records that don't have it yet.
 * It processes records in batches to avoid memory issues with large datasets.
 * 
 * Usage:
 *   node src/backend/migrations/add-fingerprints.js
 * 
 * Safety:
 *   - Does not modify existing fingerprints
 *   - Processes in batches of 1000
 *   - Provides progress updates
 *   - Can be run multiple times safely (idempotent)
 */

import { connect, set } from 'mongoose';
import Stat from '../models/stat.js';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isBot as detectBot } from 'ua-parser-js/helpers';
import 'dotenv/config';

/**
 * Creates a fingerprint from userId and userAgent
 * Since we don't have historical IP data, we use userId as a proxy
 */
function createLegacyFingerprint(userId, userAgent) {
    // Hash userId for the IP component (best we can do without historical IPs)
    const userIdHash = crypto.createHash('sha256').update(userId || 'unknown').digest('hex').substring(0, 16);
    
    // Parse user agent to extract stable components
    const parsedUA = new UAParser({ Bots });
    parsedUA.setUA(userAgent);
    const ua = parsedUA.getResult();
    
    // Create a stable UA fingerprint
    const uaComponents = [
        ua.browser.name || 'unknown',
        ua.os.name || 'unknown',
        ua.device.type || 'desktop'
    ].join('|');
    
    const uaHash = crypto.createHash('sha256').update(uaComponents).digest('hex').substring(0, 16);
    
    // Composite fingerprint
    const fingerprint = crypto.createHash('sha256').update(userIdHash + uaHash).digest('hex');
    
    return {
        fingerprint,
        ipHash: userIdHash, // Using userId hash as proxy since we don't have IP
        isBot: detectBot(ua)
    };
}

async function migrateStats() {
    console.log('=== Stats Fingerprint Migration ===\n');
    
    try {
        // Connect to database
        set('strictQuery', true);
        await connect(`${process.env.MONGODB_URI}`, {});
        console.log('✓ Connected to MongoDB\n');
        
        // Count stats without fingerprints
        const totalWithoutFingerprint = await Stat.countDocuments({
            $or: [
                { fingerprint: { $exists: false } },
                { fingerprint: '' },
                { fingerprint: null }
            ]
        });
        
        console.log(`Found ${totalWithoutFingerprint} stats without fingerprints\n`);
        
        if (totalWithoutFingerprint === 0) {
            console.log('✓ All stats already have fingerprints. Nothing to migrate.');
            process.exit(0);
        }
        
        const batchSize = 1000;
        let processed = 0;
        let updated = 0;
        let skipped = 0;
        
        // Process in batches
        while (processed < totalWithoutFingerprint) {
            const stats = await Stat.find({
                $or: [
                    { fingerprint: { $exists: false } },
                    { fingerprint: '' },
                    { fingerprint: null }
                ]
            }).limit(batchSize);
            
            if (stats.length === 0) break;
            
            for (const stat of stats) {
                try {
                    // Generate fingerprint from existing data
                    const { fingerprint, ipHash, isBot } = createLegacyFingerprint(
                        stat.userId,
                        stat.userAgent
                    );
                    
                    // Update the stat
                    await Stat.updateOne(
                        { _id: stat._id },
                        {
                            $set: {
                                fingerprint: fingerprint,
                                ipHash: ipHash,
                                isBot: isBot,
                                lastActivity: stat.createdAt || new Date()
                            }
                        }
                    );
                    
                    updated++;
                } catch (error) {
                    console.error(`  ✗ Error processing stat ${stat._id}:`, error.message);
                    skipped++;
                }
                
                processed++;
                
                // Progress update every 100 records
                if (processed % 100 === 0) {
                    const percent = ((processed / totalWithoutFingerprint) * 100).toFixed(1);
                    process.stdout.write(`\rProgress: ${processed}/${totalWithoutFingerprint} (${percent}%) - Updated: ${updated}, Skipped: ${skipped}`);
                }
            }
        }
        
        console.log('\n\n=== Migration Complete ===');
        console.log(`Total processed: ${processed}`);
        console.log(`Successfully updated: ${updated}`);
        console.log(`Skipped (errors): ${skipped}`);
        
        // Verify results
        const remaining = await Stat.countDocuments({
            $or: [
                { fingerprint: { $exists: false } },
                { fingerprint: '' },
                { fingerprint: null }
            ]
        });
        
        console.log(`\nStats without fingerprints remaining: ${remaining}`);
        
        if (remaining === 0) {
            console.log('\n✓ Migration successful! All stats now have fingerprints.');
        } else {
            console.log('\n⚠ Some stats still missing fingerprints. Review errors above.');
        }
        
        // Show bot detection stats
        const totalStats = await Stat.countDocuments({});
        const botStats = await Stat.countDocuments({ isBot: true });
        const humanStats = await Stat.countDocuments({ isBot: false });
        
        console.log('\n=== Bot Detection Summary ===');
        console.log(`Total stats: ${totalStats}`);
        console.log(`Identified as bots: ${botStats} (${((botStats/totalStats)*100).toFixed(1)}%)`);
        console.log(`Identified as humans: ${humanStats} (${((humanStats/totalStats)*100).toFixed(1)}%)`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n✗ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateStats();
