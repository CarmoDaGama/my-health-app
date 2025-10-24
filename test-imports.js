// Simple test to verify import paths are resolvable
const fs = require('fs');
const path = require('path');

function testImportPath(from, to) {
  const fromDir = path.dirname(from);
  const resolved = path.resolve(fromDir, to);
  
  // Test with .ts extension
  const tsPath = resolved + '.ts';
  const tsxPath = resolved + '.tsx';
  const indexPath = path.join(resolved, 'index.ts');
  
  console.log(`Testing import from "${from}" to "${to}"`);
  console.log(`  Looking for: ${resolved}`);
  
  if (fs.existsSync(tsPath)) {
    console.log(`  ✅ Found: ${tsPath}`);
    return true;
  } else if (fs.existsSync(tsxPath)) {
    console.log(`  ✅ Found: ${tsxPath}`);
    return true;
  } else if (fs.existsSync(indexPath)) {
    console.log(`  ✅ Found: ${indexPath}`);
    return true;
  } else {
    console.log(`  ❌ Not found. Checked:`);
    console.log(`    - ${tsPath}`);
    console.log(`    - ${tsxPath}`);
    console.log(`    - ${indexPath}`);
    return false;
  }
}

// Test the imports from SmartDashboard
const smartDashboardPath = 'components/common/SmartDashboard.tsx';

console.log('=== Testing SmartDashboard imports ===\n');

testImportPath(smartDashboardPath, '../../types');
testImportPath(smartDashboardPath, '../../screens/dashboards');
testImportPath(smartDashboardPath, '../../screens/AdminDashboardScreen');

console.log('\n=== Testing dashboard exports ===\n');

const dashboardIndexPath = 'screens/dashboards/index.ts';
if (fs.existsSync(dashboardIndexPath)) {
  const content = fs.readFileSync(dashboardIndexPath, 'utf8');
  console.log(`Dashboard index.ts content:\n${content}`);
  
  // Check that individual dashboard files exist
  ['GuestDashboard', 'PatientDashboard', 'ProfessionalDashboard', 'InstitutionDashboard'].forEach(dashboard => {
    const dashboardPath = `screens/dashboards/${dashboard}.tsx`;
    if (fs.existsSync(dashboardPath)) {
      console.log(`✅ ${dashboard}.tsx exists`);
    } else {
      console.log(`❌ ${dashboard}.tsx missing`);
    }
  });
} else {
  console.log('❌ Dashboard index.ts not found');
}
