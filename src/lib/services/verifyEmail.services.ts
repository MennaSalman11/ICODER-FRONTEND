export async function sendVerificationEmail(handle: string) {
  try {
    const res = await fetch(`http://localhost:9090/api/v1/auth/verify/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });

    const data = await res.json();
    console.log("verify email", data);

    return {
      ok: res.ok,
      status: res.status,
      data,
    };

  } catch (error) {
    console.error(error);

    return {
      ok: false,
      status: 500,
      data: { message: "Network error" },
    };
  }
}
