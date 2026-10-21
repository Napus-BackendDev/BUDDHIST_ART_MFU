let handleError,store
beforeEach(()=>{
 jest.resetModules();localStorage.clear();window.history.replaceState({},'','/login')
 const instance={defaults:{},interceptors:{request:{use:jest.fn()},response:{use:jest.fn()}}}
 store={state:{xAccessToken:'qa-old-session'},getters:{},dispatch:jest.fn().mockResolvedValue()}
 jest.doMock('axios',()=>({create:()=>instance}))
 jest.doMock('@/store/store',()=>store)
 require('@/service/api')
 handleError=instance.interceptors.response.use.mock.calls[0][1]
})
afterEach(()=>localStorage.clear())

test.each([
 {'X-Access-Token':'qa-old-session'},
 {get:name=>name==='X-Access-Token'?'qa-old-session':undefined},
 {}
])('an old or unauthenticated request cannot erase a newer Google session (%#)',async headers=>{
 const session=JSON.stringify({xAccessToken:'qa-new-google-session',accounts:'qa-customer',role:'Customer'})
 localStorage.setItem('objs',session)
 const error={config:{headers},response:{status:401}}
 await expect(handleError(error)).rejects.toBe(error)
 expect(localStorage.getItem('objs')).toBe(session)
 expect(localStorage.getItem('pendingCheckout')).toBe(null)
 expect(store.dispatch).toHaveBeenCalledWith('auth/supportReload')
})

test('401 from the current session still clears it and rejects the original request',async()=>{
 localStorage.setItem('objs',JSON.stringify({xAccessToken:'qa-current-session'}))
 const error={config:{headers:{'X-Access-Token':'qa-current-session'}},response:{status:401}}
 await expect(handleError(error)).rejects.toBe(error)
 expect(localStorage.getItem('objs')).toBe(null)
 expect(store.dispatch).not.toHaveBeenCalled()
})
