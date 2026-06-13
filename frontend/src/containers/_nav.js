export default [{
  _name: 'CSidebarNav',
  _children: [
    {
      _name: 'CSidebarNavItem',
      name: 'Dashboard',
      to: '/dashboard',
      icon: 'cil-speedometer',
    },
    {
      _name: 'CSidebarNavTitle',
      _children: ['Management']
    },
    {
      _name: 'CSidebarNavDropdown',
      name: 'Artwork',
      route: '/artwork',
      icon: 'cil-paint',
      items: [
        {
          name: 'Artwork List',
          to: '/artwork/list'
        },
        {
          name: 'Add New',
          to: '/artwork/form'
        }
      ]
    },
    {
      _name: 'CSidebarNavItem',
      name: 'Orders',
      to: '/orders',
      icon: 'cil-cart'
    },
    {
      _name: 'CSidebarNavItem',
      name: 'Submissions',
      to: '/submissions',
      icon: 'cil-cloud-upload'
    },
    {
      _name: 'CSidebarNavItem',
      name: 'news',
      to: '/news',
      icon: 'cil-newspaper'
    },
    {
      _name: 'CSidebarNavTitle',
      _children: ['Administration']
    },
    {
      _name: 'CSidebarNavItem',
      name: 'Users',
      to: '/users',
      icon: 'cil-people'
    },
    {
      _name: 'CSidebarNavDropdown',
      name: 'Organization',
      route: '/organization',
      icon: 'cil-building',
      items: [
        {
          name: 'Departments',
          to: '/organization/departments'
        }
      ]
    },
    {
      _name: 'CSidebarNavDropdown',
      name: 'Settings',
      route: '/settings',
      icon: 'cil-settings',
      items: [
        {
          name: 'General',
          to: '/settings/general'
        }
      ]
    }
  ]
}]
