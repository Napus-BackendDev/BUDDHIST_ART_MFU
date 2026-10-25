import Create from '@/views/Admin/components/modal/submission/SubmissionCreateModal.vue'

test('portal dates cover the whole local day instead of UTC midnight', () => {
  const emit = jest.fn()
  const vm = {
    isFormValid: true, selectedStudents: [], $emit: emit,
    form: { title: 'T', courseLevel: '6', startDate: '2026-10-25', dueDate: '2026-11-30', assignments: [{ title: 'A', startDateTime: '2026-10-25T09:00', endDateTime: '2026-11-30T18:00' }] },
  }
  Create.methods.handleSave.call(vm)
  const payload = emit.mock.calls[0][1]
  expect(new Date(payload.create.startAt).getTime()).toBe(new Date(2026, 9, 25, 0, 0, 0).getTime())
  expect(new Date(payload.create.endAt).getTime()).toBe(new Date(2026, 10, 30, 23, 59, 59).getTime())
})
