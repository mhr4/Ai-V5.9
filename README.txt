Sales AI / Smart Visit — V5.9 PWA

GitHub/Vercel deployment:
1. Upload the CONTENTS of this folder to the repository root (not the parent folder).
2. Keep these files together: index.html, manifest.json, service-worker.js, icon-192.png, icon-512.png.
3. Deploy/redeploy on Vercel.
4. On iPhone, close the installed app fully and reopen it after deployment. If the old screen persists, open the site in Safari once and refresh, then reopen the Home Screen app.
5. Before testing payment tracking on real data, export a JSON backup from Settings.

V5.9 additions:
- Payment tracking per invoice, partial payments and due dates/settlement terms.
- Cash payments are recorded as settled when the invoice is saved.
- Cheques remain outstanding until explicitly marked as received/cleared; returned cheques remain outstanding.
- Legacy invoices without payment data are marked “payment status not recorded” and excluded from receivables until manually classified.
- Payment data is stored in invoice records and included in existing JSON export/import.

Important: This is a local-first app. Keep regular JSON backups; data is stored in the browser on the device unless exported.
