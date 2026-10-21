import Header from '@/containers/page/TheHeader.vue'

test.each([undefined,{name:'NavigationDuplicated'}])('account navigation tolerates router cancellation %p',async error=>{
 const vm={$route:{path:'/user/order'},$router:{push:jest.fn().mockRejectedValue(error)}}
 await expect(Header.methods.handleNavigateTo.call(vm,'/user/profile')).resolves.toBeUndefined()
})

test('account navigation preserves genuine router failures',async()=>{
 const error=new Error('QA route load failed')
 const vm={$route:{path:'/user/order'},$router:{push:jest.fn().mockRejectedValue(error)}}
 await expect(Header.methods.handleNavigateTo.call(vm,'/user/profile')).rejects.toBe(error)
})
test('guest checkout keeps a redirect to the checkout form before showing login', () => {
  const calls=[]
  Header.methods.handleCheckout.call({userId:null,$i18n:{locale:'th'},$store:{commit:(...args)=>calls.push(args)},openLoginModal:jest.fn(),setShowCart:jest.fn()})
  expect(calls).toContainEqual(['auth/postLoginContext',{redirect:'/payment',reopenCart:false}])
})

test.each([['startShopping', '/artworks'], ['handleCheckout', '/payment']])('%s closes cart without duplicating current route', (method, target) => {
  const vm = { ...Header.methods, userId: 'qa-user', $route: { path: target }, $router: { push: jest.fn().mockResolvedValue() }, setShowCart: jest.fn() }
  vm[method]()
  expect(vm.$router.push).not.toHaveBeenCalled()
  expect(vm.setShowCart).toHaveBeenCalledWith(false)
  vm.$route.path = '/'
  vm[method]()
  expect(vm.$router.push).toHaveBeenCalledWith(target)
})
