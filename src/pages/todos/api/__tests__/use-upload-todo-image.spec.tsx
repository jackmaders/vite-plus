import { renderHook, waitFor } from "@testing-library/react";
import imageCompression from "browser-image-compression";
import { describe, expect, it, vi } from "vite-plus/test";

import { compressImage } from "@/shared/lib/compress-image.client";
import { createTestingWrapper } from "@test/vitest/wrappers/testing-wrapper";

import { uploadTodoImageFn } from "../todos.functions";
import { useUploadTodoImage } from "../use-upload-todo-image";

vi.mock(import("browser-image-compression"));
vi.mock(import("@/shared/lib/compress-image.client"));
vi.mock(import("../todos.functions"));

describe("useUploadTodoImage mutation hook", () => {
  it("compresses the image, converts it to a data URL, and invokes uploadTodoImageFn", async () => {
    expect.hasAssertions();

    // Arrange
    const rawFile = new File(["raw"], "photo.png", { type: "image/png" });
    const compressedFile = new File(["webp"], "photo.webp", { type: "image/webp" });
    vi.mocked(compressImage).mockResolvedValueOnce(compressedFile);
    vi.mocked(imageCompression.getDataUrlFromFile).mockResolvedValueOnce(
      "data:image/webp;base64,d2VicA==",
    );
    vi.mocked(uploadTodoImageFn).mockResolvedValueOnce({ tempKey: "temp/user-1/pic.webp" });
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useUploadTodoImage(), { wrapper });

    // Act
    const response = await result.current.mutateAsync(rawFile);

    // Assert
    expect(compressImage).toHaveBeenCalledWith(rawFile);
    expect(imageCompression.getDataUrlFromFile).toHaveBeenCalledWith(compressedFile);
    expect(uploadTodoImageFn).toHaveBeenCalledWith({
      data: { base64: "data:image/webp;base64,d2VicA==", contentType: "image/webp" },
    });
    expect(response).toStrictEqual({ tempKey: "temp/user-1/pic.webp" });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("calls custom onSuccess callback when provided", async () => {
    expect.assertions(1);

    // Arrange
    const rawFile = new File(["raw"], "photo.png", { type: "image/png" });
    const compressedFile = new File(["webp"], "photo.webp", { type: "image/webp" });
    vi.mocked(compressImage).mockResolvedValueOnce(compressedFile);
    vi.mocked(imageCompression.getDataUrlFromFile).mockResolvedValueOnce(
      "data:image/webp;base64,d2VicA==",
    );
    vi.mocked(uploadTodoImageFn).mockResolvedValueOnce({ tempKey: "temp/user-1/pic.webp" });
    const customOnSuccess = vi.fn<() => void>();
    const { wrapper } = createTestingWrapper();
    const { result } = renderHook(() => useUploadTodoImage({ onSuccess: customOnSuccess }), {
      wrapper,
    });

    // Act
    await result.current.mutateAsync(rawFile);

    // Assert
    expect(customOnSuccess).toHaveBeenCalledOnce();
  });
});
