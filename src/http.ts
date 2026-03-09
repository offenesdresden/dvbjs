interface GetOptions {
  url: string;
  params: Record<string, string | number | boolean | undefined>;
  timeout: number;
}

interface PostOptions {
  url: string;
  body: Record<string, unknown>;
  timeout: number;
}

export async function get<T>(options: GetOptions): Promise<T> {
  const url = new URL(options.url);
  for (const [key, value] of Object.entries(options.params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function post<T>(options: PostOptions): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout);
  try {
    const response = await fetch(options.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
      signal: controller.signal,
    });
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}
