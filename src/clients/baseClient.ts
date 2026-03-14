import { APIRequestContext, APIResponse } from '@playwright/test';
import { logInfo } from '../tools/logger';

export type UploadFile = {
  filename: string;
  buffer: Buffer;
  contentType: string;
};

type RequestOptions = {
  params?: Record<string, string | number | boolean>;
  json?: unknown;
  data?: Record<string, unknown>;
  files?: Record<string, UploadFile>;
  headers?: Record<string, string>;
};

export class PlaywrightHttpClient {
  constructor(private readonly context: APIRequestContext) {}

  async request(method: string, url: string, options: RequestOptions = {}): Promise<APIResponse> {
    const requestOptions: Record<string, unknown> = {
      params: options.params,
      headers: options.headers,
      failOnStatusCode: false,
    };

    if (options.files) {
      const multipart: Record<string, unknown> = {};
      if (options.data) {
        for (const [key, value] of Object.entries(options.data)) {
          if (value !== undefined && value !== null) {
            multipart[key] = String(value);
          }
        }
      }
      for (const [fieldName, file] of Object.entries(options.files)) {
        multipart[fieldName] = {
          name: file.filename,
          mimeType: file.contentType,
          buffer: file.buffer,
        };
      }
      requestOptions.multipart = multipart;
    } else if (options.json !== undefined) {
      requestOptions.data = options.json;
    } else if (options.data) {
      requestOptions.form = options.data;
    }

    logInfo('HTTP_CLIENT', `Make ${method.toUpperCase()} request to ${url}`);
    const response = await this.context.fetch(url, { method: method.toUpperCase(), ...requestOptions });
    logInfo('HTTP_CLIENT', `Got response ${response.status()} from ${response.url()}`);
    return response;
  }
}

export class BaseClient {
  constructor(public readonly client: PlaywrightHttpClient) {}

  async get(url: string, params?: Record<string, string | number | boolean>, headers?: Record<string, string>): Promise<APIResponse> {
    return this.client.request('GET', url, { params, headers });
  }

  async post(
    url: string,
    json?: unknown,
    data?: Record<string, unknown>,
    files?: Record<string, UploadFile>,
    headers?: Record<string, string>,
  ): Promise<APIResponse> {
    return this.client.request('POST', url, { json, data, files, headers });
  }

  async patch(url: string, json?: unknown): Promise<APIResponse> {
    return this.client.request('PATCH', url, { json });
  }

  async delete(url: string): Promise<APIResponse> {
    return this.client.request('DELETE', url);
  }
}
