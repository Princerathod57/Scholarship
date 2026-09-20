#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the MongoDB connection and helps diagnose connection issues.
 * Run with: node test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please check your .env file');
    return;
  }
  
  console.log('📡 DATABASE_URL found in environment');
  
  // Mask the password in the URL for logging
  const maskedUrl = process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@');
  console.log(`🔗 Connection string: ${maskedUrl}\n`);
  
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  });
  
  try {
    console.log('⏳ Attempting to connect to database...');
    
    // Test the connection with a simple query
    const result = await prisma.$runCommandRaw({
      ping: 1
    });
    
    console.log('✅ Database connection successful!');
    console.log('📊 Ping result:', result);
    
    // Try to count users to test actual data access
    try {
      const userCount = await prisma.user.count();
      console.log(`👥 Total users in database: ${userCount}`);
    } catch (error) {
      console.log('⚠️  Could not count users (might be a permissions issue)');
      console.log('Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error details:', error.message);
    
    // Provide specific troubleshooting steps
    if (error.message.includes('DNS resolution')) {
      console.log('\n🔧 Troubleshooting Steps for DNS Resolution Error:');
      console.log('1. Check if your MongoDB Atlas cluster is running');
      console.log('2. Verify the cluster URL in your DATABASE_URL');
      console.log('3. Check your internet connection');
      console.log('4. Try connecting from MongoDB Compass or Atlas UI');
    } else if (error.message.includes('authentication')) {
      console.log('\n🔧 Troubleshooting Steps for Authentication Error:');
      console.log('1. Verify username and password in DATABASE_URL');
      console.log('2. Check if the database user exists in Atlas');
      console.log('3. Ensure the user has proper permissions');
    } else if (error.message.includes('timeout') || error.message.includes('connection')) {
      console.log('\n🔧 Troubleshooting Steps for Connection/Timeout Error:');
      console.log('1. Check your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Try adding 0.0.0.0/0 temporarily to test');
      console.log('3. Check firewall settings');
      console.log('4. Verify the cluster is not paused');
    }
    
    console.log('\n📚 Additional Resources:');
    console.log('- MongoDB Atlas Troubleshooting: https://docs.atlas.mongodb.com/troubleshoot-connection/');
    console.log('- Check cluster status in Atlas dashboard');
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection().catch(console.error);
