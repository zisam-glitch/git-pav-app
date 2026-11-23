-- Patient registrations from the website (/services/regestration) are stored as
-- form submissions, so the form_type check has to allow them. Widening a check
-- only adds a value: every existing row still passes, and re-running is safe.
ALTER TABLE form_submissions DROP CONSTRAINT IF EXISTS form_submissions_form_type_check;
ALTER TABLE form_submissions
  ADD CONSTRAINT form_submissions_form_type_check
  CHECK (form_type IN ('contact', 'vacancy', 'petition', 'registration', 'other'));
