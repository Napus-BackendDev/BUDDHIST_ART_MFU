import {checkoutAmounts,orderAmounts,orderLinePrice} from '@/utils/orderAmounts'
test.each([[0,0,0],[1000,0,1000],[1000.01,0,1000.01],[500,0,500]])('never adds shipping for %s',(price,shipping,total)=>{
 expect(checkoutAmounts([{price}])).toMatchObject({shipping,total})
})
test('preserves the saved artwork price while removing obsolete shipping charges',()=>{
 expect(orderAmounts({amounts:{subtotal:1000,shipping:25,total:1025},artwork:[{price:9000}]}).total).toBe(1000)
 expect(orderAmounts({amounts:{subtotal:0,shipping:0,total:0},artwork:[{price:9000}]}).total).toBe(0)
})
test('keeps historical orders at their original artwork-only total without inventing fees',()=>{
 expect(orderAmounts({artwork:[{price:1000}]})).toEqual({subtotal:1000,shipping:0,total:1000})
})

test('checkout confirmation uses its saved artwork subtotal without shipping',()=>{
 expect(orderAmounts({subtotal:700,shipping:25,total:725,items:[{price:9000}]})).toMatchObject({subtotal:700,shipping:0,total:700})
})

test('saved line prices include zero and populated artwork references',()=>{
 expect(orderLinePrice({amounts:{items:[{artwork:{_id:'qa'},price:0}]}},{_id:'qa',price:9000})).toBe(0)
 expect(orderLinePrice({}, {_id:'legacy',price:1250})).toBe(1250)
})
