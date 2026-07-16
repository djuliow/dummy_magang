-- 1. Tabel untuk Log Sensor
CREATE TABLE IF NOT EXISTS sensor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ph DECIMAL(3, 1),
  moisture INTEGER,
  temperature DECIMAL(4, 1),
  status TEXT
);

-- 2. Tabel untuk Peringatan (Alerts)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT,
  message TEXT,
  type TEXT
);

-- 3. Tabel untuk Status Hardware (Nodes)
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE,
  location TEXT,
  uptime TEXT,
  status TEXT,
  battery TEXT,
  signal TEXT,
  temperature TEXT
);

-- 4. Tabel Profil (PENTING: Harus dijalankan agar login & admin CRUD jalan)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'pekerja',
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses (Policies)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone.') THEN
        CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profile.') THEN
        CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile.') THEN
        CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Fungsi untuk otomatis membuat profil saat user baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'pekerja');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (Hapus dulu jika sudah ada agar tidak error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Data Sampel
INSERT INTO sensor_logs (ph, moisture, temperature, status)
VALUES (6.8, 42, 24.5, 'OK') ON CONFLICT DO NOTHING;

INSERT INTO nodes (name, location, uptime, status, battery, signal, temperature)
VALUES ('Node-A1', 'North Sector', '45d 12h', 'Online', '88%', '-65dBm', '32°C') ON CONFLICT DO NOTHING;
