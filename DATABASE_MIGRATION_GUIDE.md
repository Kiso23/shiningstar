# Database Migration Guide - Club Logos Feature

## ❌ Current Error
```
column matches.team_a_logo does not exist
```

This means the database columns haven't been added yet.

## ✅ Solution

### **Step 1: Identify Your Database**

**For Render Deployed App:**
1. Go to https://dashboard.render.com
2. Select your PostgreSQL database service
3. Click "Shell" or use the connection string to connect

**For Local Development:**
```bash
# Your local PostgreSQL
psql -U postgres
```

### **Step 2: Run the Migration SQL**

**Using Render Shell/PostgreSQL Console:**
```sql
-- Copy and paste this in your Render PostgreSQL console:

ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;

-- Verify it worked:
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'matches' 
AND column_name IN ('team_a_logo', 'team_b_logo');
```

**Using Command Line (Render):**
```bash
# Get your database URL from Render dashboard
psql "your_render_database_url" << EOF
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_logo TEXT NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_logo TEXT NULL;
EOF
```

**Using DBeaver/pgAdmin GUI:**
1. Connect to your database
2. Open "Query Tool" or "SQL Editor"
3. Paste the SQL above
4. Execute

### **Step 3: Verify Migration**

Run this query to confirm:
```sql
\d matches
```

You should see:
```
 team_a_logo | text            |           | 
 team_b_logo | text            |           |
```

## 🎯 What the Migration Does

- Adds `team_a_logo` column (TEXT, nullable)
- Adds `team_b_logo` column (TEXT, nullable)
- Stores base64 image data or image URLs
- Doesn't affect existing data

## 📝 After Migration

1. ✅ Restart your backend app
2. ✅ Go to Admin Dashboard → Fixtures
3. ✅ Create/Edit a fixture
4. ✅ Upload club logos for both teams
5. ✅ Click "Save Changes"
6. ✅ Logos will now display on Fixtures and Live Scores pages

## 🔄 Rollback (if needed)

If you need to remove these columns:
```sql
ALTER TABLE matches DROP COLUMN IF EXISTS team_a_logo;
ALTER TABLE matches DROP COLUMN IF EXISTS team_b_logo;
```

## 🆘 Common Issues

**Issue: "Column already exists"**
- Solution: The SQL uses `IF NOT EXISTS`, so it's safe to run multiple times

**Issue: "Permission denied"**
- Solution: You need admin/owner access to the database

**Issue: Still getting the error after running SQL**
- Solution: Restart your backend server after running the migration

## 📞 Need Help?

Run this to check current schema:
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matches' 
ORDER BY ordinal_position;
```

This will show all columns in the matches table.
