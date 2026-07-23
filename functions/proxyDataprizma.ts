Deno.serve(async (req) => {
  try {
    const body = await req.json();
    
    const validEventTypes = ['START_TEST', 'END_TEST', 'START_MAIN', 'END_MAIN'];
    if (!body.event_type || !body.session_id) {
      return new Response(JSON.stringify({ success: false, message: 'Event type and session ID are required', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!validEventTypes.includes(body.event_type)) {
      return new Response(JSON.stringify({ success: false, message: `Invalid event type: ${body.event_type}`, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const apiBaseUrl = 'https://soldier.mrdev.uz';
    const response = await fetch(`${apiBaseUrl}/api/dataprizma/shooting-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: body.event_type,
        session_id: body.session_id,
        soldier_seq: body.soldier_seq,
        metadata: body.metadata || {},
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, message: `Dataprizma request failed: ${response.status}`, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, message: data.message || 'Dataprizma event sent successfully', event_id: data.event_id, timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Dataprizma proxy request failed', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});
