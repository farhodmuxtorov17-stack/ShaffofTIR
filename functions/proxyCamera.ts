Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const apiBaseUrl = 'https://soldier.mrdev.uz';
    
    if (body.action === 'health') {
      const response = await fetch(`${apiBaseUrl}/api/camera-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ camera_id: body.camera_id, rtsp_url: body.rtsp_url || '' }),
      });
      
      if (!response.ok) {
        return new Response(JSON.stringify({ success: false, status: 'OFFLINE', message: `Camera health check failed: ${response.status}` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      
      const data = await response.json();
      return new Response(JSON.stringify({ success: true, status: data.status || 'ONLINE', message: data.message || 'Camera is operational', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (body.action === 'snapshot') {
      return new Response(JSON.stringify({ success: true, snapshot_url: `${apiBaseUrl}/api/camera-snapshot/${body.camera_id}`, message: 'Snapshot requested', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ success: false, message: `Unknown action: ${body.action}` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, status: 'ERROR', message: 'Camera proxy request failed', timestamp: new Date().toISOString() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
});
