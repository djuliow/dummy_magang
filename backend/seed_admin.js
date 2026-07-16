const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Gunakan Service Role Key untuk bypass RLS dan Admin tasks

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDefaultAdmin() {
  const adminEmail = 'admin@agritech.com';
  const adminPassword = 'AdminPassword123!';

  console.log(`Checking for admin user: ${adminEmail}...`);

  // 1. Cek apakah user sudah ada
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const adminExists = users.users.find(u => u.email === adminEmail);

  if (adminExists) {
    console.log('Admin user already exists.');
  } else {
    // 2. Buat user baru di Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' }
    });

    if (createError) {
      console.error('Error creating admin auth:', createError);
      return;
    }

    // 3. Update role di profiles menjadi 'admin'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Error updating admin role:', profileError);
    } else {
      console.log('Default Admin created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }
  }
}

createDefaultAdmin();
