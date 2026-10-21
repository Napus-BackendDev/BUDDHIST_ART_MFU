jest.doMock('vue-multiselect/dist/vue-multiselect.min.css', () => ({}))
const Table = require('@/views/Admin/components/table/AssignmentTable.vue').default

const context = updateStatus => {
  const item = { id: 'qa-work', status: 'Pending' }
  return { selectedItem: item, items: [item], isUpdating: null, updateStatus,
    $emit: jest.fn(), $nextTick: () => Promise.resolve() }
}

test('row approval does not mutate server-owned status before saving', () => {
  const item = { id: 'qa-work', status: 'Pending' }, handleAction = jest.fn()
  Table.methods.updateStatusForItem.call({ isUpdating: null, handleAction }, item, 'Approved')
  expect(item.status).toBe('Pending')
  expect(handleAction).toHaveBeenCalledWith('Approved')
})

test('approval waits for the parent request and only adopts refreshed server state', async () => {
  let finish
  const vm = context(jest.fn(() => new Promise(resolve => { finish = resolve })))
  const operation = Table.methods.handleAction.call(vm, 'Approved')
  expect(vm.isUpdating).toBe('Approved')
  expect(vm.selectedItem.status).toBe('Pending')
  expect(vm.updateStatus).toHaveBeenCalledWith({ artworkId: 'qa-work', statusName: 'Approved' })
  expect(vm.$emit).not.toHaveBeenCalled()
  vm.items = [{ id: 'qa-work', status: 'Approved' }]
  finish(); await operation
  expect(vm.selectedItem.status).toBe('Approved')
  expect(vm.isUpdating).toBeNull()
})

test('failed request preserves Pending and unlocks a retry', async () => {
  const vm = context(jest.fn().mockRejectedValue(new Error('offline')))
  await expect(Table.methods.handleAction.call(vm, 'Approved')).rejects.toThrow('offline')
  expect(vm.selectedItem.status).toBe('Pending')
  expect(vm.items[0].status).toBe('Pending')
  expect(vm.isUpdating).toBeNull()
})

test('duplicate row click while a request runs does not replace its selection', () => {
  const first = { id: 'first', status: 'Pending' }, second = { id: 'second', status: 'Pending' }
  const vm = { isUpdating: 'Approved', selectedItem: first, handleAction: jest.fn() }
  Table.methods.updateStatusForItem.call(vm, second, 'Approved')
  expect(vm.selectedItem).toBe(first)
  expect(second.status).toBe('Pending')
  expect(vm.handleAction).not.toHaveBeenCalled()
})

test('legacy event consumer remains supported without an optimistic status', async () => {
  const vm = context(null)
  await Table.methods.handleAction.call(vm, 'Approved')
  expect(vm.$emit).toHaveBeenCalledWith('update-status', { artworkId: 'qa-work', statusName: 'Approved' })
  expect(vm.selectedItem.status).toBe('Pending')
})
