# Neon DB Migration - Club Logos Feature

## 🎯 Quick Steps for Neon

### **Step 1: Open Neon Dashboard**
1. Go to https://console.neon.tech
2. Login to your account
3. Select your project

### **Step 2: Open SQL Editor**
1. Click on "SQL Editor" in the left sidebar
2. You'll see a console where you can write SQL

### **Step 3: Run the Migration SQL**

Copy and paste this in the Neon SQL Editor:

```sql
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;
```

Then click "Execute" or press `Ctrl+Enter`

### **Step 4: Verify Migration**

Run this to confirm the columns were added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('team_a_logo', 'team_b_logo')
ORDER BY column_name;
```

You should see:
```
Column Name   | Data Type | Is Nullable
team_a_logo   | text      | YES
team_b_logo   | text      | YES
```

### **Step 5: Restart Backend**

After running the migration:
1. Redeploy your backend on Render/your hosting
2. Or restart the app if it's already running

### **Step 6: Test**

1. Go to Admin Dashboard → Fixtures
2. Create or edit a fixture
3. Upload logos for both teams
4. Click "Save Changes"
5. Go to Fixtures page - logos should display! ✅

## 🔗 Alternative: Using Neon CLI

If you prefer command line:

```bash
# Install Neon CLI
npm install -g neon-cli

# Or if you have it configured:
psql "your_neon_connection_string" << EOF
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;
EOF
```

## 📋 Common Neon Connection Methods

**Method 1: SQL Editor (Easiest)**
- Use https://console.neon.tech → SQL Editor

**Method 2: Connection String**
1. Go to Connection Details in Neon
2. Copy the connection string
3. Use with psql or any PostgreSQL client

**Method 3: GUI Tools**
- DBeaver
- pgAdmin
- Postico

## ✅ Verification Checklist

- [ ] Connected to Neon DB
- [ ] Ran ALTER TABLE commands
- [ ] Ran SELECT to verify columns exist
- [ ] Restarted backend
- [ ] Tried uploading logo in admin
- [ ] Logo appears on Fixtures page

## 🆘 Troubleshooting

**Error: "Permission denied"**
- Use the owner/admin connection string from Neon

**Error: "Already exists"**
- That's fine! The `IF NOT EXISTS` clause handles it

**Still getting "column does not exist"**
- Make sure you ran the SQL in the correct database
- Restart backend after running migration
- Clear browser cache

## 📞 Need Help?

Check your Neon dashboard:
1. Settings → Connection String
2. Make sure you're using the correct database URL
3. Ensure DATABASE_URL environment variable is set correctly

After migration is complete, all features will work:
✅ Club flag upload in admin
✅ Flags display on fixtures page
✅ Flags display on live scores page
✅ API includes logo fields
