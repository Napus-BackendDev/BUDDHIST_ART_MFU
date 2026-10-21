export function hasInvalidSubmissionDates(form) {
  const invalid = (start, end) => start && end &&
    (!Number.isFinite(new Date(start).getTime()) || !Number.isFinite(new Date(end).getTime()) || new Date(end) < new Date(start));
  return Boolean(invalid(form.startDate, form.dueDate) || (form.assignments || []).some(a =>
    invalid(a.startDateTime || a.create?.startAt, a.endDateTime || a.create?.endAt)));
}
