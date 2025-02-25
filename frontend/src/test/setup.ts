import { vi, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  constructor(
    private callback: IntersectionObserverCallback,
    private options: IntersectionObserverInit = {}
  ) {
    if (options.root && options.root instanceof Element) this.root = options.root;
    if (options.rootMargin) this.rootMargin = options.rootMargin;
    if (options.threshold) this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold];
  }

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}

(window as any).IntersectionObserver = IntersectionObserverMock;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock document methods
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(() => false),
  toggle: vi.fn(),
  replace: vi.fn(),
};

Object.defineProperty(document.documentElement, 'classList', {
  configurable: true,
  get: () => mockClassList,
});

// Mock window methods
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
});

// Reset all mocks and cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  
  // Reset storage mocks
  [localStorageMock, sessionStorageMock].forEach(storageMock => {
    (storageMock.getItem as any).mockReset();
    (storageMock.setItem as any).mockReset();
    (storageMock.removeItem as any).mockReset();
    (storageMock.clear as any).mockReset();
    (storageMock.key as any).mockReset();
  });
  
  // Reset classList mocks
  Object.values(mockClassList).forEach(mock => {
    if (typeof mock === 'function') {
      (mock as any).mockReset();
    }
  });
  
  // Reset observers
  [ResizeObserverMock, IntersectionObserverMock].forEach(Observer => {
    Object.values(Observer.prototype).forEach(method => {
      if (typeof method === 'function') {
        (method as any).mockReset();
      }
    });
  });
  
  // Reset matchMedia
  matchMediaMock.mockClear();
});

export {
  localStorageMock,
  sessionStorageMock,
  mockClassList,
  ResizeObserverMock,
  IntersectionObserverMock,
  matchMediaMock,
};
