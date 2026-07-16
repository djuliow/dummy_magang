const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_SENSOR_PH = Number(process.env.DEFAULT_SENSOR_PH || 6.8);
const DEFAULT_SENSOR_TEMPERATURE = Number(process.env.DEFAULT_SENSOR_TEMPERATURE || 24.0);
const DEFAULT_NODE_NAME = process.env.DEFAULT_NODE_NAME || 'SoilMonitoringESP8266';
const DEFAULT_NODE_LOCATION = process.env.DEFAULT_NODE_LOCATION || 'Field Sector A';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LOCAL_DATA_FILE = path.join(__dirname, 'local-data.json');

app.use(cors());
app.use(express.json());

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getSupabaseConfigError() {
  if (!SUPABASE_URL) {
    return 'SUPABASE_URL belum diisi.';
  }

  if (!isValidUrl(SUPABASE_URL)) {
    return 'SUPABASE_URL bukan URL yang valid.';
  }

  if (!SUPABASE_KEY) {
    return 'SUPABASE_KEY belum diisi.';
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return 'SUPABASE_SERVICE_ROLE_KEY belum diisi.';
  }

  return null;
}

function createSupabaseClient(key) {
  return createClient(SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function findNetworkError(err) {
  let current = err;

  while (current) {
    if (current.code && ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH', 'EACCES'].includes(current.code)) {
      return current;
    }

    current = current.cause;
  }

  return null;
}

function getSupabaseRequestErrorMessage(err) {
  const networkError = findNetworkError(err);

  if (!networkError) {
    return null;
  }

  if (networkError.code === 'ENOTFOUND' || networkError.code === 'EAI_AGAIN') {
    return `Gagal terhubung ke Supabase (${networkError.code}). Periksa SUPABASE_URL, DNS, atau koneksi internet server.`;
  }

  return `Gagal terhubung ke Supabase (${networkError.code}). Periksa koneksi jaringan server ke ${SUPABASE_URL}.`;
}

function ensureLocalDataFile() {
  if (!fs.existsSync(LOCAL_DATA_FILE)) {
    const initialData = {
      sensor_logs: [],
      alerts: [],
      nodes: []
    };

    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function readLocalData() {
  ensureLocalDataFile();

  try {
    const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      sensor_logs: Array.isArray(parsed.sensor_logs) ? parsed.sensor_logs : [],
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : []
    };
  } catch {
    return {
      sensor_logs: [],
      alerts: [],
      nodes: []
    };
  }
}

function writeLocalData(data) {
  fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function createLocalSensorLog(sensorData) {
  return {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    ph: sensorData.ph,
    moisture: sensorData.moisture,
    temperature: sensorData.temperature,
    status: sensorData.status
  };
}

function createLocalAlert(sensorData) {
  if (sensorData.moisture === null) {
    return null;
  }

  if (sensorData.moisture <= 30) {
    return {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      title: 'Kelembaban Tanah Rendah',
      message: `${sensorData.nodeName} mendeteksi kelembaban ${sensorData.moisture}%.`,
      type: 'warning'
    };
  }

  if (sensorData.moisture >= 80) {
    return {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      title: 'Kelembaban Tanah Tinggi',
      message: `${sensorData.nodeName} mendeteksi kelembaban ${sensorData.moisture}%.`,
      type: 'info'
    };
  }

  return null;
}

function createLocalNodeRecord(sensorData) {
  return {
    id: randomUUID(),
    name: sensorData.nodeName,
    location: sensorData.location,
    uptime: 'active',
    status: 'Online',
    battery: 'External Power',
    signal: sensorData.adc !== null ? `ADC ${sensorData.adc}` : 'WiFi Connected',
    temperature: `${sensorData.temperature} C`,
    updated_at: new Date().toISOString()
  };
}

function saveSensorDataLocally(sensorData) {
  const data = readLocalData();
  const sensorLog = createLocalSensorLog(sensorData);
  const alert = createLocalAlert(sensorData);
  const nodeRecord = createLocalNodeRecord(sensorData);
  const nodeIndex = data.nodes.findIndex((node) => node.name === nodeRecord.name);

  data.sensor_logs.unshift(sensorLog);
  data.sensor_logs = data.sensor_logs.slice(0, 100);

  if (alert) {
    data.alerts.unshift(alert);
    data.alerts = data.alerts.slice(0, 50);
  }

  if (nodeIndex >= 0) {
    data.nodes[nodeIndex] = {
      ...data.nodes[nodeIndex],
      ...nodeRecord,
      id: data.nodes[nodeIndex].id || nodeRecord.id
    };
  } else {
    data.nodes.unshift(nodeRecord);
  }

  writeLocalData(data);

  return sensorLog;
}

function getLatestLocalSummary() {
  return readLocalData().sensor_logs[0] || {};
}

function getLocalSensorLogs(limit = 20) {
  return readLocalData().sensor_logs.slice(0, limit);
}

function getLocalAlerts() {
  return readLocalData().alerts;
}

function getLocalNodes() {
  return readLocalData().nodes;
}

const supabaseConfigError = getSupabaseConfigError();

if (supabaseConfigError) {
  console.error(`Supabase configuration error: ${supabaseConfigError}`);
}

// Supabase Clients
const supabase = supabaseConfigError ? null : createSupabaseClient(SUPABASE_KEY);
const supabaseAdmin = supabaseConfigError ? null : createSupabaseClient(SUPABASE_SERVICE_ROLE_KEY);

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSensorPayload(payload = {}) {
  const moisture = toNumber(payload.moisture ?? payload.kelembaban);
  const ph = toNumber(payload.ph, DEFAULT_SENSOR_PH);
  const temperature = toNumber(payload.temperature ?? payload.suhu, DEFAULT_SENSOR_TEMPERATURE);
  const adc = toNumber(payload.adc);
  const status = payload.status || (moisture !== null ? 'OK' : 'UNKNOWN');
  const nodeName = payload.node_name || payload.nodeName || DEFAULT_NODE_NAME;
  const location = payload.location || DEFAULT_NODE_LOCATION;

  return {
    moisture,
    ph,
    temperature,
    adc,
    status,
    nodeName,
    location
  };
}

async function createAlertIfNeeded(sensorData) {
  if (sensorData.moisture === null) {
    return;
  }

  let alert = null;

  if (sensorData.moisture <= 30) {
    alert = {
      title: 'Kelembaban Tanah Rendah',
      message: `${sensorData.nodeName} mendeteksi kelembaban ${sensorData.moisture}%.`,
      type: 'warning'
    };
  } else if (sensorData.moisture >= 80) {
    alert = {
      title: 'Kelembaban Tanah Tinggi',
      message: `${sensorData.nodeName} mendeteksi kelembaban ${sensorData.moisture}%.`,
      type: 'info'
    };
  }

  if (alert) {
    const { error } = await supabaseAdmin.from('alerts').insert(alert);
    if (error) {
      console.error('Failed to create alert:', error.message);
    }
  }
}

async function upsertNodeStatus(sensorData) {
  const nodeRecord = {
    name: sensorData.nodeName,
    location: sensorData.location,
    uptime: 'active',
    status: 'Online',
    battery: 'External Power',
    signal: sensorData.adc !== null ? `ADC ${sensorData.adc}` : 'WiFi Connected',
    temperature: `${sensorData.temperature} C`
  };

  const { error } = await supabaseAdmin.from('nodes').upsert(nodeRecord, { onConflict: 'name' });
  if (error) {
    console.error('Failed to update node status:', error.message);
  }
}

async function insertSensorData(sensorData) {
  const localRecord = saveSensorDataLocally(sensorData);

  if (!supabaseAdmin || supabaseConfigError) {
    return {
      data: localRecord,
      source: 'local'
    };
  }

  try {
    const payload = {
      ph: sensorData.ph,
      moisture: sensorData.moisture,
      temperature: sensorData.temperature,
      status: sensorData.status
    };

    const { data, error } = await supabaseAdmin
      .from('sensor_logs')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    await Promise.all([
      createAlertIfNeeded(sensorData),
      upsertNodeStatus(sensorData)
    ]);

    return {
      data,
      source: 'supabase'
    };
  } catch (err) {
    console.warn('Falling back to local sensor storage:', err.message);

    return {
      data: localRecord,
      source: 'local'
    };
  }
}

async function getSummaryData() {
  if (!supabase || supabaseConfigError) {
    return getLatestLocalSummary();
  }

  try {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    return data || {};
  } catch (err) {
    console.warn('Using local summary data:', err.message);
    return getLatestLocalSummary();
  }
}

async function getSensorLogsData() {
  if (!supabase || supabaseConfigError) {
    return getLocalSensorLogs(20);
  }

  try {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.warn('Using local sensor logs:', err.message);
    return getLocalSensorLogs(20);
  }
}

async function getAlertsData() {
  if (!supabase || supabaseConfigError) {
    return getLocalAlerts();
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.warn('Using local alerts:', err.message);
    return getLocalAlerts();
  }
}

async function getNodesData() {
  if (!supabase || supabaseConfigError) {
    return getLocalNodes();
  }

  try {
    const { data, error } = await supabase.from('nodes').select('*');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (err) {
    console.warn('Using local nodes:', err.message);
    return getLocalNodes();
  }
}

// --- AUTH ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (supabaseConfigError || !supabase) {
    return res.status(500).json({
      error: `Konfigurasi Supabase bermasalah. ${supabaseConfigError || 'Client gagal dibuat.'}`
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Ambil profile untuk tahu role-nya
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({ user: data.user, profile, session: data.session });
  } catch (err) {
    const connectionErrorMessage = getSupabaseRequestErrorMessage(err);

    if (connectionErrorMessage) {
      return res.status(503).json({ error: connectionErrorMessage });
    }

    res.status(401).json({ error: err.message });
  }
});

// --- ADMIN: USER MANAGEMENT (CRUD) ---
// 1. Get All Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create New User (Only Admin via Service Role)
app.post('/api/admin/users', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });
    if (error) throw error;

    // Update profile yang dibuat otomatis oleh trigger
    const { error: profError } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, role })
      .eq('id', data.user.id);
    
    if (profError) throw profError;

    res.json({ message: 'User created successfully', user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update User
app.put('/api/admin/users/:id', async (req, res) => {
  const { full_name, role } = req.body;
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, role })
      .eq('id', req.params.id);
    
    if (error) throw error;
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Delete User
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DASHBOARD DATA ---
app.get('/api/summary', async (req, res) => {
  try {
    const data = await getSummaryData();
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/sensor-logs', async (req, res) => {
  try {
    const data = await getSensorLogsData();
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const data = await getAlertsData();
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/nodes', async (req, res) => {
  try {
    const data = await getNodesData();
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dummy-backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dummy-backend',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/sensor', async (req, res) => {
  const sensorData = normalizeSensorPayload(req.body);

  if (sensorData.moisture === null) {
    return res.status(400).json({
      error: 'Payload sensor tidak valid. Nilai moisture atau kelembaban wajib diisi.'
    });
  }

  try {
    const result = await insertSensorData(sensorData);

    res.status(201).json({
      message: 'Data sensor berhasil disimpan',
      source: result.source,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
