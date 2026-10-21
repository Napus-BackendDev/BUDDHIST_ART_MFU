import { shallowMount } from '@vue/test-utils'
import SignIn from '@/projects/components/dialog/SignIn.vue'
import LoginRoute from '@/projects/views/Login.vue'
import Vue from 'vue'

const signInWrapper = locale => shallowMount({...SignIn,mounted(){}},{
 mocks:{$i18n:Vue.observable({locale}),$store:{getters:{'auth/showSignInModal':true}}},
 stubs:{CModal:{template:'<div><slot name="header-wrapper"/><slot name="body-wrapper"/><slot name="footer-wrapper"/></div>'}}
})

describe('Google SDK loading recovery',()=>{
 let google,promise,client,append,scripts,log
 beforeEach(()=>{
  google=window.google;promise=window.__googleIdentityScriptPromise;client=process.env.VUE_APP_CLIENTID
  delete window.google;delete window.__googleIdentityScriptPromise;process.env.VUE_APP_CLIENTID='qa-google-client'
  scripts=[];append=jest.spyOn(document.head,'appendChild').mockImplementation(script=>{scripts.push(script);return script})
  log=jest.spyOn(console,'error').mockImplementation(()=>{})
 })
 afterEach(()=>{
  append.mockRestore();log.mockRestore();window.google=google
  if(promise===undefined)delete window.__googleIdentityScriptPromise;else window.__googleIdentityScriptPromise=promise
  if(client===undefined)delete process.env.VUE_APP_CLIENTID;else process.env.VUE_APP_CLIENTID=client
  jest.useRealTimers()
 })
 test('failed SDK loads are not cached and the visible retry uses Google verification again',async()=>{
  const w=signInWrapper('th')
  try {
   const failed=w.vm.initializeGoogleSignIn();scripts[0].onerror();await failed;await Vue.nextTick()
   const retry=w.findAll('button').wrappers.find(b=>b.text()==='ลองอีกครั้ง')
   expect(retry).toBeDefined()
   await retry.trigger('click');expect(scripts).toHaveLength(2)
   expect(retry.attributes('disabled')).toBeDefined()
   const initialize=jest.fn(),renderButton=jest.fn()
   window.google={accounts:{id:{initialize,renderButton}}};scripts[1].onload()
   await Vue.nextTick();await Vue.nextTick();await Vue.nextTick();await Vue.nextTick()
   expect(initialize).toHaveBeenCalledTimes(1)
   expect(initialize.mock.calls[0][0]).toEqual(expect.objectContaining({client_id:'qa-google-client',callback:w.vm.onGoogleCredential}))
   expect(w.find('[role="alert"]').exists()).toBe(false)
   expect(w.find('input').exists()).toBe(false)
  } finally {w.destroy()}
 })
 test('concurrent callers share one load and a stalled download can be retried',async()=>{
  jest.useFakeTimers()
  const w=signInWrapper('en')
  try {
   const first=w.vm.loadGoogleIdentity(),second=w.vm.loadGoogleIdentity()
   const failures=Promise.allSettled([first,second])
   expect(scripts).toHaveLength(1)
   jest.advanceTimersByTime(15000)
   expect((await failures).map(r=>r.status)).toEqual(['rejected','rejected'])
   const retry=w.vm.loadGoogleIdentity();expect(scripts).toHaveLength(2)
   scripts[1].onload();await retry
   expect(jest.getTimerCount()).toBe(0)
  } finally {w.destroy()}
 })
})

describe('Google Identity visibility lifecycle',()=>{
 let previousGoogle,previousClient,initialize,renderButton
 const create = (shown, methods={}) => {
  const getters=Vue.observable({'auth/showSignInModal':shown})
  const locale=Vue.observable({locale:'th'})
  const wrapper=shallowMount(SignIn,{methods,mocks:{$i18n:locale,$store:{getters,commit:jest.fn()}},
   stubs:{CModal:{template:'<div><slot name="body-wrapper"/></div>'}}})
  return {wrapper,getters,locale}
 }
 const settle=async()=>{await Vue.nextTick();await Vue.nextTick();await Vue.nextTick()}
 beforeEach(()=>{
  previousGoogle=window.google;previousClient=process.env.VUE_APP_CLIENTID
  initialize=jest.fn();renderButton=jest.fn()
  window.google={accounts:{id:{initialize,renderButton}}};process.env.VUE_APP_CLIENTID='qa-google-client'
 })
 afterEach(()=>{
  window.google=previousGoogle
  if(previousClient===undefined)delete process.env.VUE_APP_CLIENTID;else process.env.VUE_APP_CLIENTID=previousClient
 })
 test('a closed dialog does not load or render Google, including locale changes',async()=>{
  const loadGoogleIdentity=jest.fn().mockResolvedValue()
  const {wrapper,locale}=create(false,{loadGoogleIdentity})
  try{
   await settle();locale.locale='en';await settle();await wrapper.vm.initializeGoogleSignIn()
   expect(loadGoogleIdentity).not.toHaveBeenCalled()
   expect(initialize).not.toHaveBeenCalled();expect(renderButton).not.toHaveBeenCalled()
  }finally{wrapper.destroy()}
 })
 test('opening initializes once and reopening redraws the current locale',async()=>{
  const {wrapper,getters,locale}=create(false)
  try{
   getters['auth/showSignInModal']=true;await settle()
   expect(initialize).toHaveBeenCalledTimes(1)
   getters['auth/showSignInModal']=false;await settle()
   const rendered=renderButton.mock.calls.length
   locale.locale='en';await settle();expect(renderButton).toHaveBeenCalledTimes(rendered)
   getters['auth/showSignInModal']=true;await settle()
   expect(initialize).toHaveBeenCalledTimes(1)
   expect(renderButton).toHaveBeenLastCalledWith(wrapper.vm.$refs.googleSignInButton,expect.objectContaining({locale:'en'}))
  }finally{wrapper.destroy()}
 })
 test('closing during SDK load skips hidden initialization and reopening can recover',async()=>{
  let finish;const pending=new Promise(resolve=>{finish=resolve})
  const {wrapper,getters}=create(true,{loadGoogleIdentity:()=>pending})
  try{
   getters['auth/showSignInModal']=false;await settle();finish();await settle()
   expect(initialize).not.toHaveBeenCalled();expect(renderButton).not.toHaveBeenCalled()
   getters['auth/showSignInModal']=true;await settle()
   expect(initialize).toHaveBeenCalledTimes(1);expect(renderButton).toHaveBeenCalledTimes(1)
  }finally{wrapper.destroy()}
 })
 test('overlapping opens share initialization and use the latest visible locale',async()=>{
  let finish;const pending=new Promise(resolve=>{finish=resolve})
  const loadGoogleIdentity=jest.fn(()=>pending)
  const {wrapper,getters,locale}=create(true,{loadGoogleIdentity})
  try{
   getters['auth/showSignInModal']=false;await settle()
   locale.locale='en';getters['auth/showSignInModal']=true;await settle()
   const extra=wrapper.vm.initializeGoogleSignIn();finish();await extra;await settle()
   expect(loadGoogleIdentity).toHaveBeenCalledTimes(1);expect(initialize).toHaveBeenCalledTimes(1)
   expect(renderButton).toHaveBeenLastCalledWith(wrapper.vm.$refs.googleSignInButton,expect.objectContaining({locale:'en'}))
  }finally{wrapper.destroy()}
 })
 test('destroying a dialog while SDK loads prevents late initialization',async()=>{
  let finish;const pending=new Promise(resolve=>{finish=resolve})
  const {wrapper}=create(true,{loadGoogleIdentity:()=>pending})
  wrapper.destroy();finish();await settle()
  expect(initialize).not.toHaveBeenCalled();expect(renderButton).not.toHaveBeenCalled()
 })
})

test.each(['th','en'])('Google library uses the initial %s locale',async locale=>{
 const oldGoogle=window.google,oldPromise=window.__googleIdentityScriptPromise
 window.google=undefined;delete window.__googleIdentityScriptPromise
 let script
 const append=jest.spyOn(document.head,'appendChild').mockImplementation(node=>{script=node;return node})
 const wrapper=signInWrapper(locale)
 try {
  const loaded=wrapper.vm.loadGoogleIdentity()
  expect(script.src).toBe(`https://accounts.google.com/gsi/client?hl=${locale}`)
  script.onload()
  await loaded
 } finally {
  append.mockRestore();wrapper.destroy();window.google=oldGoogle
  if(oldPromise===undefined)delete window.__googleIdentityScriptPromise;else window.__googleIdentityScriptPromise=oldPromise
 }
})

test('Google initialization error is localized and announced without a credential fallback',async()=>{
 const previousClient=process.env.VUE_APP_CLIENTID
 delete process.env.VUE_APP_CLIENTID
 const log=jest.spyOn(console,'error').mockImplementation(()=>{})
 const wrapper=signInWrapper('th')
 try {
  await wrapper.vm.initializeGoogleSignIn();await wrapper.vm.$nextTick()
  expect(wrapper.find('[role="alert"]').text()).toBe('ไม่สามารถเปิด Google Sign-In ได้ กรุณารีเฟรชและลองใหม่')
  wrapper.vm.$i18n.locale='en';await wrapper.vm.$nextTick()
  expect(wrapper.find('[role="alert"]').text()).toBe('Google Sign-In is unavailable. Please refresh and try again.')
  expect(wrapper.find('input').exists()).toBe(false)
 }finally{
  log.mockRestore();wrapper.destroy()
  if(previousClient===undefined)delete process.env.VUE_APP_CLIENTID;else process.env.VUE_APP_CLIENTID=previousClient
 }
})

test.each([
 ['th','ยินดีต้อนรับ','ปิดหน้าต่างเข้าสู่ระบบ','เข้าสู่ระบบด้วยบัญชี Google เพื่อดำเนินการต่อ'],
 ['en','Welcome Back','Close sign in dialog','Sign in with your Google account to continue.']
])('sign-in modal localizes its text and close control in %s', (locale,title,close,description)=>{
 const wrapper=signInWrapper(locale)
 expect(wrapper.find('h5').text()).toBe(title)
 expect(wrapper.find('button').attributes('aria-label')).toBe(close)
 expect(wrapper.text()).toContain(description)
 expect(wrapper.text()).toContain(String(new Date().getFullYear()))
 wrapper.destroy()
})

test('locale changes redraw the Google button without initializing Google twice', async()=>{
 const previousGoogle=window.google,previousClient=process.env.VUE_APP_CLIENTID
 const initialize=jest.fn(),renderButton=jest.fn()
 window.google={accounts:{id:{initialize,renderButton}}}
 process.env.VUE_APP_CLIENTID='qa-google-client'
 const wrapper=signInWrapper('th')
 try {
  await wrapper.vm.initializeGoogleSignIn()
  expect(renderButton).toHaveBeenLastCalledWith(wrapper.vm.$refs.googleSignInButton,expect.objectContaining({locale:'th'}))
  wrapper.vm.$i18n.locale='en'
  await wrapper.vm.$nextTick()
  expect(renderButton).toHaveBeenLastCalledWith(wrapper.vm.$refs.googleSignInButton,expect.objectContaining({locale:'en'}))
  expect(initialize).toHaveBeenCalledTimes(1)
 } finally {
  wrapper.destroy();window.google=previousGoogle
  if(previousClient===undefined)delete process.env.VUE_APP_CLIENTID;else process.env.VUE_APP_CLIENTID=previousClient
 }
})

test('missing Google credential error is announced and follows locale changes',async()=>{
 const wrapper=signInWrapper('th')
 await wrapper.vm.onGoogleCredential({})
 await wrapper.vm.$nextTick()
 expect(wrapper.find('[role="alert"]').text()).toBe('Google ไม่ได้ส่งข้อมูลยืนยันตัวตน กรุณาลองใหม่')
 wrapper.vm.$i18n.locale='en'
 await wrapper.vm.$nextTick()
 expect(wrapper.find('[role="alert"]').text()).toBe('Google did not return an identity token. Please try again.')
 wrapper.destroy()
})

test.each([
 ['en', 'Sign in', 'Continue with Google', 'Back to Home'],
 ['th', 'เข้าสู่ระบบ', 'เข้าสู่ระบบด้วย Google', 'กลับหน้าหลัก']
])('login route offers recovery after dismissing OAuth in %s', async (locale, title, action, home) => {
 const commit=jest.fn()
 const wrapper=shallowMount(LoginRoute,{mocks:{$i18n:{locale},$store:{commit}},stubs:{'router-link':{props:['to'],template:'<a :href="to"><slot/></a>'}}})
 expect(commit).toHaveBeenLastCalledWith('auth/showSignInModal',true)
 expect(wrapper.find('h1').text()).toBe(title)
 expect(wrapper.find('button').text()).toBe(action)
 commit.mockClear()
 await wrapper.find('button').trigger('click')
 expect(commit).toHaveBeenCalledTimes(1)
 expect(commit).toHaveBeenCalledWith('auth/showSignInModal',true)
 expect(wrapper.find('a').attributes('href')).toBe('/')
 expect(wrapper.find('a').text()).toBe(home)
 expect(wrapper.find('input').exists()).toBe(false)
 wrapper.destroy()
})
test('sign in exposes Google OAuth only, even when the old QA flag is set',()=>{
 const old=process.env.VUE_APP_LOCAL_LOGIN;process.env.VUE_APP_LOCAL_LOGIN='true'
 try {
  const wrapper=shallowMount({...SignIn,mounted(){}},{mocks:{$i18n:{locale:'en'},$store:{getters:{'auth/showSignInModal':true}}},stubs:{CModal:{template:'<div><slot name="body-wrapper"/></div>'}}})
  expect(wrapper.find('[aria-label="Sign in with Google"]').exists()).toBe(true)
  expect(wrapper.find('input').exists()).toBe(false)
  expect(SignIn.methods.signInLocal).toBeUndefined()
  wrapper.destroy()
 }finally{if(old===undefined)delete process.env.VUE_APP_LOCAL_LOGIN;else process.env.VUE_APP_LOCAL_LOGIN=old}
})
