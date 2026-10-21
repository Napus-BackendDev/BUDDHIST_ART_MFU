import {createLocalVue,mount} from '@vue/test-utils'
import Coreui from '@coreui/vue-pro'
import installModalKeyboard from '@/utils/modalKeyboard'
const localVue=createLocalVue();localVue.use(Coreui);installModalKeyboard(localVue)
test('Escape closes a visible CoreUI modal while ordinary typing keeps it open',async()=>{
 const w=mount(localVue.component('CModal'),{localVue,propsData:{show:true,fade:false}})
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'a',keyCode:65}))
 expect(w.emitted('update:show')).toBeUndefined()
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27}))
 await localVue.nextTick()
 expect(w.emitted('update:show')).toBeTruthy()
 w.destroy()
})

test('custom keyboard veto and hidden dialogs do not emit a close',()=>{
 const veto=jest.fn(()=>false)
 const w=mount(localVue.component('CModal'),{localVue,propsData:{show:true,fade:false,onKey:veto}})
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27}))
 expect(veto).toHaveBeenCalledWith('',27)
 expect(w.emitted('update:show')).toBeUndefined()
 w.destroy()
 const hidden=mount(localVue.component('CModal'),{localVue,propsData:{show:false,fade:false}})
 window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27}))
 expect(hidden.emitted('update:show')).toBeUndefined()
 hidden.destroy()
})
test('destroyed modals release their keyboard listeners',()=>{
 const w=mount(localVue.component('CModal'),{localVue,propsData:{show:true,fade:false}})
 const listener=w.vm.hideEsc
 const remove=jest.spyOn(window,'removeEventListener')
 w.destroy()
 expect(remove).toHaveBeenCalledWith('keydown',listener)
 remove.mockRestore()
})


const settle = async () => { await new Promise(resolve => setTimeout(resolve, 0)); await localVue.nextTick() }

test('opening a modal moves focus inside, traps Tab at both boundaries, and restores the opener', async () => {
 const opener=document.createElement('button');document.body.appendChild(opener);opener.focus()
 const w=mount(localVue.component('CModal'),{localVue,attachToDocument:true,propsData:{show:false,fade:false},slots:{default:'<input id="focus-input"><button id="focus-last">Save</button>'}})
 try {
  await w.setProps({show:true});await settle()
  const dialog=w.find('[role="dialog"]').element
  expect(dialog.contains(document.activeElement)).toBe(true)
  const controls=dialog.querySelectorAll('button,input')
  controls[controls.length-1].focus()
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',keyCode:9,cancelable:true}))
  expect(document.activeElement).toBe(controls[0])
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',keyCode:9,shiftKey:true,cancelable:true}))
  expect(document.activeElement).toBe(controls[controls.length-1])
  await w.setProps({show:false});await settle()
  expect(document.activeElement).toBe(opener)
 } finally {w.destroy();opener.remove()}
})

test('Escape closes only the top nested modal and focus returns to its parent', async () => {
 const parent=mount(localVue.component('CModal'),{localVue,attachToDocument:true,propsData:{show:true,fade:false},slots:{default:'<button id="nested-opener">Open child</button>'}})
 await settle()
 const opener=parent.find('#nested-opener').element;opener.focus()
 const child=mount(localVue.component('CModal'),{localVue,attachToDocument:true,propsData:{show:true,fade:false}})
 try {
  await settle()
  expect(child.vm._modalOpener).toBe(opener)
  expect(opener.isConnected).toBe(true)
  expect(parent.vm.modalDialog()).toBe(opener.closest('[role="dialog"]'))
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27}))
  expect(child.emitted('update:show')).toBeTruthy()
  expect(parent.emitted('update:show')).toBeUndefined()
  await child.setProps({show:false});await settle()
  expect(document.activeElement).toBe(opener)
 } finally {child.destroy();parent.destroy()}
})
