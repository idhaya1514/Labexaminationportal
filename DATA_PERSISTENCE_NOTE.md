# Data Persistence in Examination Portal

## ✅ How Data is Stored

All data is stored in **browser localStorage** which persists until manually deleted.

### Storage Keys:

1. **`registeredStudents`** - All student registrations
2. **`adminQuestions`** - All exam questions created by admin
3. **`examResults`** - All student exam submissions
4. **`studentAssignedQuestions`** - Question assignments per student
5. **`currentStudent`** - Active student session

## 🔍 Data Will Persist UNLESS:

1. ❌ Browser cache is cleared
2. ❌ User clears site data manually
3. ❌ Using Private/Incognito mode
4. ❌ Using a different browser
5. ❌ Using a different device

## ✅ Data WILL Persist When:

1. ✅ Browser is closed and reopened
2. ✅ Computer is restarted
3. ✅ Page is refreshed (F5)
4. ✅ Navigating between pages
5. ✅ After logout and login

## 📝 Verifying Data Persistence

### Check if data is saved:

1. **Open Browser Console** (F12)
2. Go to **Application** tab
3. Click **Local Storage** → Your site URL
4. Look for these keys:
   - `registeredStudents`
   - `adminQuestions`
   - `examResults`
   - `studentAssignedQuestions`

### View stored data:

```javascript
// In browser console (F12)

// View all students
console.log(JSON.parse(localStorage.getItem('registeredStudents')));

// View all questions
console.log(JSON.parse(localStorage.getItem('adminQuestions')));

// View all exam results
console.log(JSON.parse(localStorage.getItem('examResults')));
```

## 🔧 Troubleshooting: Data Not Persisting

### Problem: Students/Questions disappear after refresh

**Possible Causes:**

1. **Browser in Private/Incognito Mode**
   - Solution: Use normal browser mode

2. **Browser auto-clearing data**
   - Solution: Check browser settings
   - Disable "Clear cookies on exit"

3. **Different browser/device**
   - Solution: Data is per-browser, use same browser

4. **Hard refresh (Ctrl+Shift+R)**
   - May clear some data
   - Use normal refresh (F5) instead

### Fix: Manually backup data

```javascript
// Backup all data (run in console)
const backup = {
  students: localStorage.getItem('registeredStudents'),
  questions: localStorage.getItem('adminQuestions'),
  results: localStorage.getItem('examResults'),
  assignments: localStorage.getItem('studentAssignedQuestions')
};

console.log(JSON.stringify(backup));
// Copy this output and save in a text file
```

### Restore from backup:

```javascript
// Paste your backup JSON here
const backup = {/* your backup data */};

localStorage.setItem('registeredStudents', backup.students);
localStorage.setItem('adminQuestions', backup.questions);
localStorage.setItem('examResults', backup.results);
localStorage.setItem('studentAssignedQuestions', backup.assignments);

// Refresh page
location.reload();
```

## 💾 For Production Use

### Recommended: Use Real Database

For permanent, multi-device data storage, integrate with:

1. **Supabase** (Recommended)
   - Free tier available
   - PostgreSQL database
   - Real-time updates
   - Easy integration

2. **Firebase**
   - Google's database
   - Free tier
   - Real-time sync

3. **MongoDB Atlas**
   - NoSQL database
   - Free tier
   - Cloud-hosted

### Why use a database?

✅ Data survives browser clear
✅ Accessible from any device
✅ Multiple admins can access
✅ Automatic backups
✅ Better security
✅ Scalable

## 🎯 Current System Limitations

**LocalStorage:**
- ⚠️ ~5-10MB storage limit
- ⚠️ Browser-specific (not synced)
- ⚠️ Clears if cache cleared
- ⚠️ Single device only
- ⚠️ No automatic backup

**Best for:**
- Testing/Demo purposes
- Small classroom (< 50 students)
- Single admin computer
- Temporary use

**NOT suitable for:**
- Multiple admin access
- Long-term storage
- Production environment
- Large student count (> 100)

## 📊 Storage Size Check

Check how much data is stored:

```javascript
// Run in browser console
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log('Total localStorage size: ' + (total / 1024).toFixed(2) + ' KB');
```

## 🔒 Data Security

**Important Notes:**

- localStorage is **NOT encrypted**
- Data visible in browser tools
- Anyone with browser access can view/modify
- No password protection on data itself

**For sensitive exams:**
- Use incognito mode for students (auto-clears)
- OR integrate with real database
- Use server-side authentication

## ✅ Best Practices

1. **Regular Backups**
   - Export results frequently
   - Save JSON files externally

2. **Same Browser**
   - Admin should use same browser consistently
   - Don't switch between Chrome/Firefox/Edge

3. **Don't Clear Cache**
   - Avoid "Clear browsing data"
   - Don't use CCleaner or similar tools

4. **Normal Mode Only**
   - Admin panel: Regular browser mode
   - Students: Can use incognito (but data won't persist for them)

5. **Test First**
   - Add 1 test student
   - Refresh browser
   - Verify student still exists
   - Then add real students

## 🆘 Emergency Recovery

If you lost data:

1. **Check browser history**
   - localStorage might be in cache

2. **Check other browsers**
   - Maybe you used different browser?

3. **Check export files**
   - If you exported, you can manually re-import

4. **Last resort**
   - Re-enter students from original list
   - Re-create questions from question bank

## 📱 Multi-Admin Setup

**Problem:** Two admins can't access same data

**Solution Options:**

**Option 1: Shared Computer**
- Both admins use same computer/browser
- Take turns accessing admin panel

**Option 2: Manual Sync**
- Admin 1: Adds students, exports JSON
- Admin 2: Imports JSON into their browser
- (Manual process, not automatic)

**Option 3: Database (Recommended)**
- Integrate with Supabase/Firebase
- Real multi-admin support
- Auto-sync across devices

---

## Summary

✅ **Data DOES persist** across:
- Page refreshes
- Browser restarts
- Computer restarts

❌ **Data WILL NOT persist** if:
- Browser cache cleared
- Incognito/Private mode
- Different browser/device used

💡 **Recommendation:**
- For testing: localStorage is fine
- For production: Use real database (Supabase)

---

**Last Updated:** May 2, 2026
**Storage Method:** Browser localStorage
**Persistence:** Until manually cleared
