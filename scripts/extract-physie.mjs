/**
 * Extract three profile artifacts from the physie source input
 * For EDM v0.6.0 whitepaper Appendix B examples
 */
import { extractFromContent } from '../dist/index.js';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

const SOURCE_INPUT = `Just got these photos and what an absolute ball I had on the weekend competing in my physie comps! About 8 years ago I was diagnosed with psoriatic arthritis which affects my joints and I'm on medication that I will need to take forever to keep them mobile. However, it's continuing to move that really keeps it at bay. Not only does physie do this for me, it's also so good for my mental health, something else that was suffering after covid times. As working mums, we tend to put ourselves last and as a single mum for many years, there was no choice but to be last. I believe we all need something in our lives that we can do just for us, and for me, dance has always been it. I adore teaching my @pose_pa kids but I couldn't get through a ballet or open dance class myself anymore, and my days on the stage as a professional dancer are long gone. Getting to still do physie and perform in front of a crowd makes me feel like I'm still in my 20's and getting to do it with other supportive women is really such a gift. Thanks to @jasonpb75 for talking me in to going back to it 4 years ago @thepointphysieclub for such a fun and positive class every week and @bjp_physie for giving us ladies a place to stay young and keep active!`;

const OUTPUT_DIR = 'C:/Users/JasonHarvey-ModularW/Documents/GitHub/planning/edm-v0.6.0/artifacts';

const METADATA = {
  consentBasis: 'consent',
  visibility: 'private',
  piiTier: 'moderate',
};

async function extractProfile(profile) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Extracting ${profile.toUpperCase()} profile...`);
  console.log('='.repeat(60));

  try {
    const artifact = await extractFromContent({
      content: { text: SOURCE_INPUT },
      metadata: METADATA,
      profile,
      provider: 'anthropic',
    });

    // Count domains and fields
    const domains = Object.keys(artifact);
    let fieldCount = 0;
    for (const domain of domains) {
      const domainData = artifact[domain];
      if (domainData && typeof domainData === 'object') {
        fieldCount += Object.keys(domainData).length;
      }
    }

    console.log(`Profile: ${profile}`);
    console.log(`Domains: ${domains.length} (${domains.join(', ')})`);
    console.log(`Fields: ${fieldCount}`);

    return artifact;
  } catch (error) {
    console.error(`Error extracting ${profile} profile:`, error.message);
    throw error;
  }
}

async function main() {
  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  const profiles = ['essential', 'extended', 'full'];
  const results = {};

  for (const profile of profiles) {
    const artifact = await extractProfile(profile);
    results[profile] = artifact;

    // Save to file
    const outputPath = `${OUTPUT_DIR}/physie-${profile}.json`;
    await writeFile(outputPath, JSON.stringify(artifact, null, 2));
    console.log(`Saved to: ${outputPath}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('EXTRACTION SUMMARY');
  console.log('='.repeat(60));

  for (const profile of profiles) {
    const artifact = results[profile];
    const domains = Object.keys(artifact);
    let fieldCount = 0;
    for (const domain of domains) {
      const domainData = artifact[domain];
      if (domainData && typeof domainData === 'object') {
        fieldCount += Object.keys(domainData).length;
      }
    }
    console.log(`\n${profile.toUpperCase()}:`);
    console.log(`  Domains: ${domains.length}`);
    console.log(`  Fields: ${fieldCount}`);
    console.log(`  Domains present: ${domains.join(', ')}`);

    // Check for potential issues
    const meta = artifact.meta;
    const core = artifact.core;
    const constellation = artifact.constellation;
    const gravity = artifact.gravity;

    const issues = [];

    if (!core?.narrative) issues.push('core.narrative is empty');
    if (!constellation?.emotion_primary) issues.push('constellation.emotion_primary is empty');
    if (gravity?.emotional_weight === 0) issues.push('gravity.emotional_weight is 0.0 (may be incorrect)');
    if (gravity?.strength_score === 0) issues.push('gravity.strength_score is 0.0 (may be incorrect)');

    if (issues.length > 0) {
      console.log(`  FLAGS FOR REVIEW:`);
      for (const issue of issues) {
        console.log(`    - ${issue}`);
      }
    }
  }
}

main().catch(console.error);
