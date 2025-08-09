/**
 * Debug script to check what guest data exists in the database
 */

async function checkGuestData() {
  try {
    console.log('🔍 INVESTIGATING GUEST DATA IN DATABASE')
    console.log('=' .repeat(60))
    
    // Check 1: Look for any GUEST users
    console.log('\n1️⃣ CHECKING FOR GUEST USERS...')
    const guestUsersResponse = await fetch('http://localhost:3000/api/debug/database-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT id, email, role, businessName, createdAt FROM User WHERE role = ? ORDER BY createdAt DESC LIMIT 10',
        params: ['GUEST']
      })
    })
    
    if (guestUsersResponse.ok) {
      const guestUsers = await guestUsersResponse.json()
      console.log(`   Found ${guestUsers.results?.length || 0} GUEST users`)
      guestUsers.results?.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.id} - ${user.email} (${user.createdAt})`)
      })
    } else {
      console.log('   ❌ Could not query guest users')
    }
    
    // Check 2: Look for recent documents (any user)
    console.log('\n2️⃣ CHECKING FOR RECENT DOCUMENTS...')
    const recentDocsResponse = await fetch('http://localhost:3000/api/debug/database-query', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'SELECT id, userId, originalName, category, isScanned, uploadedAt FROM Document WHERE uploadedAt > ? ORDER BY uploadedAt DESC LIMIT 5',
        params: [new Date(Date.now() - 1000 * 60 * 60).toISOString()] // Last hour
      })
    })
    
    if (recentDocsResponse.ok) {
      const recentDocs = await recentDocsResponse.json()
      console.log(`   Found ${recentDocs.results?.length || 0} recent documents`)
      recentDocs.results?.forEach((doc, i) => {
        console.log(`   ${i+1}. ${doc.originalName} - User: ${doc.userId} - Scanned: ${doc.isScanned}`)
      })
    } else {
      console.log('   ❌ Could not query recent documents')
    }
    
    // Check 3: Look for documents by GUEST role users 
    console.log('\n3️⃣ CHECKING FOR DOCUMENTS BY GUEST USERS...')
    const guestDocsResponse = await fetch('http://localhost:3000/api/debug/database-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          SELECT d.id, d.originalName, d.category, d.isScanned, d.uploadedAt, u.role 
          FROM Document d 
          JOIN User u ON d.userId = u.id 
          WHERE u.role = ? AND d.uploadedAt > ?
          ORDER BY d.uploadedAt DESC LIMIT 10
        `,
        params: ['GUEST', new Date(Date.now() - 1000 * 60 * 60).toISOString()] // Last hour
      })
    })
    
    if (guestDocsResponse.ok) {
      const guestDocs = await guestDocsResponse.json()
      console.log(`   Found ${guestDocs.results?.length || 0} documents by guest users`)
      guestDocs.results?.forEach((doc, i) => {
        console.log(`   ${i+1}. ${doc.originalName} - Scanned: ${doc.isScanned} - Role: ${doc.role}`)
      })
    } else {
      console.log('   ❌ Could not query guest documents')
    }
    
    console.log('\n📊 SUMMARY:')
    console.log('   If you see 0 results above, it means:')
    console.log('   - No guest uploads have happened recently, OR')
    console.log('   - Documents are not being processed/scanned properly')
    console.log('')
    console.log('💡 TRY THIS: Upload a document via the web interface and run this script again')
    
  } catch (error) {
    console.error('🚨 DEBUG SCRIPT ERROR:', error)
  }
}

// Run the debug check
console.log('🚀 Starting Guest Data Investigation...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
checkGuestData()