import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';

beforeAll(() => {
  // Global test setup
});

afterEach(() => {
  cleanup();
});