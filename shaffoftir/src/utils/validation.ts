import { z } from 'zod';

// Session start validation
export const startSessionSchema = z.object({
  soldier_count: z.number().min(1).max(50).optional().default(5),
  cameras: z
    .array(
      z.object({
        camera_ip: z.string().min(1, 'Kamera IP majburiy'),
        username: z.string().optional().default('admin'),
        password: z.string().optional().default(''),
        label: z.string().nullable().optional(),
      })
    )
    .optional()
    .default([]),
});

// Process turn validation
export const processTurnSchema = z.object({
  session_id: z.string().min(1, 'Session ID majburiy'),
  soldier_seq: z.number().min(1, 'Askar raqami 1 dan kichik bo\'lmasin'),
  shot_type: z.enum(['TEST', 'MAIN'], {
    errorMap: () => ({ message: 'Shot type TEST yoki MAIN bo\'lishi kerak' }),
  }),
  expected_shots: z
    .number()
    .min(1, 'O\'q soni kamida 1 bo\'lishi kerak')
    .max(50, 'O\'q soni 50 dan oshmasin'),
});

// Dataprizma event validation
export const dataprizmaEventSchema = z.object({
  action_name: z.enum(['START_TEST', 'END_TEST', 'START_MAIN', 'END_MAIN']),
  data: z
    .array(
      z.object({
        external_id: z.string().min(1),
        bullet_count: z.number().min(1).max(50),
        shooting_session: z.object({
          external_id: z.string().min(1),
          shooting_lane_cameras: z
            .array(
              z.object({
                camera_ip: z.string().min(1),
                username: z.string().min(1),
                password: z.string().min(1),
              })
            )
            .optional(),
        }),
      })
    )
    .optional(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type ProcessTurnInput = z.infer<typeof processTurnSchema>;
export type DataprizmaEventInput = z.infer<typeof dataprizmaEventSchema>;
