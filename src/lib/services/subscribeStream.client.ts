export const subscribeToSubmissionStream = async (
  token: string,
  onMessage: (data: any) => void,
  onError?: (err: any) => void
) => {
  try {
    const response = await fetch(
      "http://localhost:9090/api/v1/stream/subscribe",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SSE Error ${response.status}`);
    }

    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error("No reader found");
    }

    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);

      console.log("RAW CHUNK:", chunk);

      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const json = line.replace("data:", "").trim();

          if (!json) continue;

          try {
            const parsed = JSON.parse(json);

            console.log("PARSED SSE:", parsed);

            onMessage(parsed);
          } catch (err) {
            console.error("Parse error:", err);
          }
        }
      }
    }
  } catch (err) {
    console.error("SSE CONNECTION ERROR", err);

    if (onError) {
      onError(err);
    }
  }
};