// Test import paths for ProtectedComponent
const fs = require('fs');
const path = require('path');

function testImportPath(from, to) {
  const fromDir = path.dirname(from);
  const resolved = path.resolve(fromDir, to);
  
  // Test with different extensions
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

// Test the imports from ProtectedComponent
const protectedComponentPath = 'components/common/ProtectedComponent.tsx';

console.log('=== Testing ProtectedComponent imports ===\n');

testImportPath(protectedComponentPath, '../../hooks/useAuth-firebase');
testImportPath(protectedComponentPath, '../../utils/permissions');
testImportPath(protectedComponentPath, '../../constants');
testImportPath(protectedComponentPath, '../../hooks/useTranslation');
