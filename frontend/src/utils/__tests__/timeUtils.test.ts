import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime, formatMessageTime } from '../timeUtils';

describe('timeUtils', () => {
  // Mock date for consistent testing
  const mockNow = new Date('2025-02-22T18:30:00');
  let originalDate: typeof Date;

  beforeEach(() => {
    originalDate = global.Date;
    global.Date = class extends Date {
      constructor(date?: string | number | Date) {
        if (date) {
          super(date);
          return new originalDate(date);
        }
        super();
        return mockNow;
      }
    } as DateConstructor;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('formatRelativeTime', () => {
    it('formats just now', () => {
      const time = new Date('2025-02-22T18:29:45').toISOString(); // 15 seconds ago
      expect(formatRelativeTime(time)).toBe('just now');
    });

    it('formats seconds ago', () => {
      const time = new Date('2025-02-22T18:29:00').toISOString(); // 60 seconds ago
      expect(formatRelativeTime(time)).toBe('60s ago');
    });

    it('formats minutes ago', () => {
      const time = new Date('2025-02-22T18:25:00').toISOString(); // 5 minutes ago
      expect(formatRelativeTime(time)).toBe('5m ago');
    });

    it('formats hours ago', () => {
      const time = new Date('2025-02-22T13:30:00').toISOString(); // 5 hours ago
      expect(formatRelativeTime(time)).toBe('5h ago');
    });

    it('formats days ago', () => {
      const time = new Date('2025-02-20T18:30:00').toISOString(); // 2 days ago
      expect(formatRelativeTime(time)).toBe('2d ago');
    });
  });

  describe('formatMessageTime', () => {
    it('formats time for messages from today', () => {
      const time = new Date('2025-02-22T13:45:00').toISOString();
      expect(formatMessageTime(time)).toBe('1:45 PM');
    });

    it('formats date for messages from this year', () => {
      const time = new Date('2025-01-15T13:45:00').toISOString();
      expect(formatMessageTime(time)).toBe('Jan 15');
    });

    it('formats date with year for older messages', () => {
      const time = new Date('2024-12-25T13:45:00').toISOString();
      expect(formatMessageTime(time)).toBe('Dec 25, 2024');
    });
  });
});
