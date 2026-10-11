import assert from "node:assert/strict";
import { capturePhoto, CameraCaptureError } from "../src/lib/device/camera.ts";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function installBrowserMocks({ getUserMedia, toBlob }) {
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const tracks = [{ stopped: 0, stop() { this.stopped += 1; } }];
  const stream = { getTracks: () => tracks };
  const videos = [];
  const canvases = [];

  class MockVideo {
    readyState = 1;
    videoWidth = 640;
    videoHeight = 480;
    muted = false;
    playsInline = false;
    srcObject = null;
    paused = false;
    addEventListener() {}
    removeEventListener() {}
    play() { return Promise.resolve(); }
    pause() { this.paused = true; }
  }

  class MockCanvas {
    width = 0;
    height = 0;
    getContext() { return { drawImage() {} }; }
    toBlob(callback, type, quality) {
      toBlob({ callback, type, quality });
    }
  }

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { mediaDevices: { getUserMedia } }
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag) {
        if (tag === "video") {
          const video = new MockVideo();
          videos.push(video);
          return video;
        }
        const canvas = new MockCanvas();
        canvases.push(canvas);
        return canvas;
      }
    }
  });

  return {
    tracks,
    stream,
    videos,
    canvases,
    restore() {
      if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
      else delete globalThis.navigator;
      if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
      else delete globalThis.document;
    }
  };
}

async function flushMicrotasks() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function assertRejectsPromptly(operation, signal) {
  let timeout;
  try {
    const result = await Promise.race([
      operation.then(
        () => { throw new Error("Expected cancellation to reject."); },
        (error) => error
      ),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Cancellation did not reject promptly.")), 100);
      })
    ]);
    assert.ok(result instanceof CameraCaptureError);
    assert.equal(result.code, "aborted");
    assert.equal(signal.aborted, true);
  } finally {
    clearTimeout(timeout);
  }
}

{
  const permissionRequest = deferred();
  const browser = installBrowserMocks({
    getUserMedia: () => permissionRequest.promise,
    toBlob: () => { throw new Error("Canvas must not be reached before permission resolves."); }
  });
  try {
    const controller = new AbortController();
    const capture = capturePhoto({ signal: controller.signal });
    controller.abort();
    await assertRejectsPromptly(capture, controller.signal);

    permissionRequest.resolve(browser.stream);
    await flushMicrotasks();
    assert.equal(browser.tracks[0].stopped, 1, "A stream granted after cancellation must stop immediately.");
    assert.equal(browser.videos.length, 0, "No video element should be created after cancellation.");
  } finally {
    browser.restore();
  }
}

{
  let encoding;
  const browser = installBrowserMocks({
    getUserMedia: async () => browser.stream,
    toBlob: (request) => { encoding = request; }
  });
  try {
    const controller = new AbortController();
    const capture = capturePhoto({ signal: controller.signal });
    await flushMicrotasks();
    assert.ok(encoding, "Canvas encoding should have started.");
    assert.equal(encoding.type, "image/jpeg", "Camera captures must use JPEG.");

    controller.abort();
    await assertRejectsPromptly(capture, controller.signal);
    assert.equal(browser.tracks[0].stopped, 1, "Camera tracks must stop while encoding is pending.");
    assert.equal(browser.videos[0].paused, true);
    assert.equal(browser.videos[0].srcObject, null);

    encoding.callback(new Blob(["late image"], { type: encoding.type }));
    await flushMicrotasks();
    assert.equal(browser.tracks[0].stopped, 1, "A late encoding callback must not restart resources.");
  } finally {
    browser.restore();
  }
}

console.log("camera-cancellation.spec.mjs: PASS (permission cancellation, late stream release, JPEG, pending encoding cleanup)");
