require('dotenv').config();
const mongoose = require('mongoose');
const { initMatcher, findBestProcedureMatch } = require('./src/services/matcher');
const { generateAuditReport } = require('./src/services/auditEngine');
const connectDB = require('./src/config/db');

async function test() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Initializing Matcher...');
    await initMatcher();

    console.log('\n' + '='.repeat(50));
    console.log('🔍 TEST 1: SINGLE MATCH (CT COR ANGIO)');
    console.log('='.repeat(50));
    const match1 = await findBestProcedureMatch("CT COR ANGIO");
    console.log(JSON.stringify(match1, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('🔍 TEST 2: SINGLE MATCH (MRI BRAIN WITH CONTRAST)');
    console.log('='.repeat(50));
    const match2 = await findBestProcedureMatch("MRI BRAIN W/CONTRAST");
    console.log(JSON.stringify(match2, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST 3: FULL AUDIT REPORT');
    console.log('='.repeat(50));
    const items = [
      { name: "CT COR ANGIO", amount: 24000 },
      { name: "MRI BRAIN W/CONTRAST", amount: 15000 },
      { name: "COMPLETE BLOOD COUNT", amount: 1200 }
    ];
    const report = await generateAuditReport(items);
    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('\nDatabase connection closed.');
    }
  }
}

test();
