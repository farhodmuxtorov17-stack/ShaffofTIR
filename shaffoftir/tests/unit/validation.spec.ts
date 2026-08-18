import { describe, it, expect, beforeEach } from 'vitest';
import {
  processTurnSchema,
  startSessionSchema,
  dataprizmaEventSchema,
} from '@/utils/validation';

describe('Validation Schemas', () => {
  beforeEach(() => {
    // Setup if needed
  });

  describe('processTurnSchema', () => {
    it('should pass with valid data', () => {
      const validData = {
        session_id: 'session-123',
        soldier_seq: 1,
        shot_type: 'MAIN',
        expected_shots: 5,
      };
      const result = processTurnSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should fail with invalid shot_type', () => {
      const invalidData = {
        session_id: 'session-123',
        soldier_seq: 1,
        shot_type: 'PRACTICE', // Invalid enum
        expected_shots: 5,
      };
      const result = processTurnSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some(issue => issue.path.includes('shot_type'))).toBe(true);
      }
    });

    it('should fail with missing session_id', () => {
      const invalidData = {
        soldier_seq: 1,
        shot_type: 'TEST',
        expected_shots: 5,
      };
      const result = processTurnSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some(issue => issue.path.includes('session_id'))).toBe(true);
      }
    });

    it('should fail with expected_shots out of range (too small)', () => {
      const invalidData = {
        session_id: 'session-123',
        soldier_seq: 1,
        shot_type: 'MAIN',
        expected_shots: 0, // < 1
      };
      const result = processTurnSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some(issue => issue.path.includes('expected_shots'))).toBe(true);
      }
    });

    it('should fail with expected_shots out of range (too large)', () => {
      const invalidData = {
        session_id: 'session-123',
        soldier_seq: 1,
        shot_type: 'MAIN',
        expected_shots: 51, // > 50
      };
      const result = processTurnSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some(issue => issue.path.includes('expected_shots'))).toBe(true);
      }
    });
  });

  describe('startSessionSchema', () => {
    it('should fallback to default soldier_count and cameras when empty object passed', () => {
      const result = startSessionSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.soldier_count).toBe(5);
        expect(result.data.cameras).toEqual([]);
      }
    });

    it('should validate with custom soldier_count and valid cameras list', () => {
      const validData = {
        soldier_count: 10,
        cameras: [
          {
            camera_ip: '192.168.1.50',
            username: 'admin',
            password: 'secretpassword',
            label: 'Lane 1',
          },
        ],
      };
      const result = startSessionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.soldier_count).toBe(10);
        expect(result.data.cameras).toHaveLength(1);
        expect(result.data.cameras[0].camera_ip).toBe('192.168.1.50');
      }
    });

    it('should set default camera fields when optional ones are omitted', () => {
      const data = {
        cameras: [
          {
            camera_ip: '192.168.1.50',
          },
        ],
      };
      const result = startSessionSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cameras[0].username).toBe('admin');
        expect(result.data.cameras[0].password).toBe('');
        expect(result.data.cameras[0].label).toBeUndefined();
      }
    });

    it('should fail if camera_ip is empty in cameras list', () => {
      const invalidData = {
        cameras: [
          {
            camera_ip: '',
          },
        ],
      };
      const result = startSessionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('dataprizmaEventSchema', () => {
    it('should validate valid action names', () => {
      const actions: Array<'START_TEST' | 'END_TEST' | 'START_MAIN' | 'END_MAIN'> = [
        'START_TEST',
        'END_TEST',
        'START_MAIN',
        'END_MAIN',
      ];

      actions.forEach(action => {
        const data = { action_name: action };
        const result = dataprizmaEventSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should fail with invalid action_name', () => {
      const invalidData = {
        action_name: 'PAUSE_TEST', // Invalid enum
      };
      const result = dataprizmaEventSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate full dataprizma request structure with optional data array', () => {
      const fullData = {
        action_name: 'START_TEST',
        data: [
          {
            external_id: 'ext-soldier-1',
            bullet_count: 5,
            shooting_session: {
              external_id: 'ext-session-100',
              shooting_lane_cameras: [
                {
                  camera_ip: '192.168.10.11',
                  username: 'admin',
                  password: 'password123',
                },
              ],
            },
          },
        ],
      };

      const result = dataprizmaEventSchema.safeParse(fullData);
      expect(result.success).toBe(true);
    });
  });
});
