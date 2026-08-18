import { ApiError } from '@/api/httpClient';

/**
 * Normalize various error types into a user-friendly message
 */
export function normalizeError(error: unknown): {
  title: string;
  message: string;
} {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        title: 'Ulanish xatosi',
        message: 'Backendga ulanib bo\'lmadi. Tarmoqni tekshiring.',
      };
    }
    if (error.status === 422) {
      const detail = error.detail as { detail?: Array<{ msg: string }> };
      const messages = detail?.detail?.map((d) => d.msg).join(', ');
      return {
        title: 'Ma\'lumot xatosi',
        message: messages || 'Yuborilgan ma\'lumot noto\'g\'ri formatda.',
      };
    }
    if (error.status === 400) {
      const detail = error.detail as { message?: string } | string;
      const msg = typeof detail === 'string' ? detail : detail?.message || '';
      return {
        title: 'So\'rov xatosi',
        message: msg || error.message,
      };
    }
    if (error.status >= 500) {
      return {
        title: 'Server xatosi',
        message: 'Backend ichki xatolik yuz berdi. Birozdan keyin urinib ko\'ring.',
      };
    }
    return { title: 'API xatosi', message: error.message };
  }

  if (error instanceof Error) {
    return { title: 'Xato', message: error.message };
  }

  return { title: 'Noma\'lum xato', message: 'Kutilmagan xato yuz berdi.' };
}
