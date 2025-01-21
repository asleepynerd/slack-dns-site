interface R2Bucket {
  get(key: string): Promise<R2Object | null>;
}

interface R2Object {
  body: ReadableStream;
  writeHttpMetadata(headers: Headers): void;
  httpEtag: string;
}
