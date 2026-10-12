
export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return Response.json(
      { error: "Database is not configured." },
      { status: 500 }
    );
  }

  let data;

  try {
    data = await request.json();
  } catch
export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return Response.json(
      { error: "Database is not configured." },
      { status: 500 }
    );
  }

  let data;

  try {
    data = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const subject = String(data.subject || "").trim();
  const message = String(data.message || "").trim();

  if (
    !name || name.length > 100 ||
    !email || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    subject.length > 100 ||
    !message || message.length > 5000
  ) {
    return Response.json(
      { error: "Please check your details and message." },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO inquiries (name, email, service, message)
       VALUES (?, ?, ?, ?)`
    )
      .bind(name, email, subject || null, message)
      .run();

    return Response.json(
      {
        success: true,
        message: "Thanks! Your inquiry has been received."
      },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "Could not save your inquiry. Please try again." },
      { status: 500 }
    );
  }
}
 {
    return Response.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const service = String(data.service || "").trim();
  const message = String(data.message || "").trim();

  if (
    !name || name.length > 100 ||
    !email || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    service.length > 100 ||
    !message || message.length > 5000
  ) {
    return Response.json(
      { error: "Please check your contact details and message." },
      { status: 400 }
    );
  }

  try {
    await env.DB.prepare(
      `INSERT INTO inquiries (name, email, service, message)
       VALUES (?, ?, ?, ?)`
    )
      .bind(name, email, service || null, message)
      .run();

    return Response.json(
      { success: true, message: "Your inquiry was received." },
      { status: 201 }
    );
  } catch {
    return Response.json(
      { error: "Could not save your inquiry. Please try again." },
      { status: 500 }
    );
  }
}
