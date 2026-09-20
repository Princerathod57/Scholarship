#!/usr/bin/env node

/**
 * Environment Variables Check
 * 
 * This script checks what environment variables Next.js sees at runtime
 */

require('dotenv').config();

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_API_URL'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '****' 
      : varName === 'DATABASE_URL' 
        ? value.replace(/:([^@]+)@/, ':****@')
        : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n📊 All environment variables starting with DATABASE_ or NEXTAUTH_:');
Object.keys(process.env)
  .filter(key => key.startsWith('DATABASE_') || key.startsWith('NEXTAUTH_'))
  .forEach(key => {
    const value = process.env[key];
    const maskedValue = key.includes('SECRET') || key.includes('PASSWORD') 
      ? '****' 
      : key === 'DATABASE_URL' 
        ? value.replace(/:([^@]+)@/, ':****@')
        : value;
    console.log(`   ${key}: ${maskedValue}`);
  });
