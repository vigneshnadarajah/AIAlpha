// Test setup file for Jest
// This file runs before each test suite

// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['SUPABASE_URL'] = 'http://localhost:54321';
process.env['SUPABASE_ANON_KEY'] = 'test_anon_key';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'test_service_role_key';
process.env['JWT_SECRET'] = 'test_jwt_secret_for_testing_only';
process.env['PORT'] = '3001';
process.env['FRONTEND_URL'] = 'http://localhost:5173';

// Global test timeout
jest.setTimeout(10000);