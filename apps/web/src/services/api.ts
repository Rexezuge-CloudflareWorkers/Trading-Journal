interface ExceptionBody {
  Exception?: {
    Type?: string;
    Message?: string;
  };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response: Response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message: string = `Request Failed (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null && (body as ExceptionBody).Exception?.Message) {
        message = (body as ExceptionBody).Exception!.Message!;
      }
    } catch {
      // non-JSON error body; keep default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function downloadUrl(path: string): void {
  window.open(path, '_blank');
}
