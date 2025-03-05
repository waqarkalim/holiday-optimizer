// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Set a longer default timeout for all tests
jest.setTimeout(300000); // 5 minutes for all tests

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
})) 