export class ProviderError extends Error {
  public readonly statusCode: number;
  public readonly provider: string;

  constructor(provider: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends ProviderError {
  constructor(provider: string, message: string) {
    super(provider, message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ProviderError {
  constructor(provider: string, message: string = 'Rate limit exceeded') {
    super(provider, message, 429);
    this.name = 'RateLimitError';
  }
}
