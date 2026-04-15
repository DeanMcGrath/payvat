# PayVAT Paid Beta Readiness Evidence

## Automated Gate Results

- `npm run -s test:trust-copy`
  - Expected: `PASS (0 prohibited claims found)`
  - Status: _record result at release time_
- `npm run -s test:extraction-fixtures`
  - Expected: `processed=8 needs_review=0 failed=0`
  - Status: _record result at release time_
- `npm run build`
  - Expected: successful production build
  - Status: _record result at release time_

## Fresh-Account Manual QA Checklist

- [ ] Sign up and log in with a new account.
- [ ] Upload mixed sales and purchase sample documents.
- [ ] Confirm per-file lifecycle is truthful (`Uploading` -> `Uploaded` -> `Processing` -> `Processed`/`Needs review`/`Failed`).
- [ ] Confirm batch summary counts match file outcomes.
- [ ] Confirm `Needs review` reasons are clear and actionable.
- [ ] Correct one flagged document and verify status clears.
- [ ] Confirm dashboard/documents counts update after refresh.
- [ ] Confirm VAT returns page shows the current draft as the primary object.
- [ ] Confirm VAT submission blockers are shown and enforced.
- [ ] Confirm record step uses paid-beta trust language and creates a PayVAT tracking reference.
- [ ] Confirm export artifact language states it is not a Revenue ROS filing receipt.
- [ ] Confirm payments page shows period, status, reference, and amount clearly.
- [ ] Confirm support email and beta-limitations link are visible on returns/submission/payments/documents.

## Production Smoke Checklist

- [ ] Confirm production SHA includes latest trust/status/search commits.
- [ ] Hard refresh (or incognito) and verify updated UI copy appears.
- [ ] Upload 3 known sample invoices and confirm deterministic extraction outcomes.
- [ ] Confirm no `/api/upload` `503` appears during controlled smoke run.
- [ ] Confirm no discoverable page contradicts paid-beta ROS boundary.
- [ ] Confirm no legacy route is surfaced via header/footer/sitemap/search.

## Evidence Attachments (Release Manager)

- Build log: _attach_
- Trust-copy scan output: _attach_
- Extraction fixture output: _attach_
- Manual QA notes + screenshots: _attach_
- Production smoke notes + screenshots: _attach_
