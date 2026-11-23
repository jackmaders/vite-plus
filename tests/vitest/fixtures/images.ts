const TEST_IMAGE_BYTES = new Uint8Array([1, 2, 3, 4]);

const TEST_IMAGE_FILE = new globalThis.File([TEST_IMAGE_BYTES], "pic.png", { type: "image/png" });
const TEST_COMPRESSED_IMAGE_FILE = new globalThis.File(["compressed"], "pic.webp", {
  type: "image/webp",
});
const TEST_IMAGE_DATA_URL = "data:image/webp;base64,abc";
const TEST_TEMP_IMAGE_KEY = "temp/user-1/pic.webp";

function createMockR2Object(overrides?: Partial<R2ObjectBody>): R2ObjectBody {
  const stream = new globalThis.ReadableStream({
    start(controller) {
      controller.enqueue(TEST_IMAGE_BYTES);
      controller.close();
    },
  });

  return {
    body: stream,
    httpEtag: '"etag-123"',
    httpMetadata: { contentType: "image/webp" },
    ...overrides,
  } as unknown as R2ObjectBody;
}

export {
  TEST_COMPRESSED_IMAGE_FILE,
  TEST_IMAGE_DATA_URL,
  TEST_IMAGE_FILE,
  TEST_TEMP_IMAGE_KEY,
  createMockR2Object,
};
