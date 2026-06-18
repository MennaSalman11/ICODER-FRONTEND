export const subscribeToSubmissionStream = (
  token: string,
  onMessage: (data: any) => void,
  onError: (err: any) => void
): (() => void) => {
  const url = `http://localhost:9090/api/v1/stream/subscribe`;

  const controller = new AbortController();
  const { signal } = controller;

  const startStream = async () => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive"
        },
        signal,
      });

      if (!response.ok) {
        onError(new Error(`SSE connection failed: ${response.status}`));
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError(new Error("No readable stream in response"));
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done || signal.aborted) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newlines
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.trim().split("\n");

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const raw = line.replace(/^data:\s*/, "").trim();

              if (!raw || raw === "[DONE]") continue;

              try {
                const parsed = JSON.parse(raw);
                onMessage(parsed);
              } catch (e) {
                console.error("SSE parse error:", e, "raw:", raw);
              }
            }
          }
        }
      }
    } catch (err: any) {
      // AbortError is expected when we close intentionally — don't propagate it
      if (err?.name !== "AbortError") {
        console.error("SSE stream error:", err);
        onError(err);
      }
    }
  };

  startStream();

  // Return cleanup function
  return () => controller.abort();
};