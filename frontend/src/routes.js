import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const AdminDashboard = React.lazy(() => import('./views/dashboard/AdminDashboard'))
const Devices = React.lazy(() => import('./views/devices/Devices'))

const routes = [
  { path: '/', exact: true, name: 'Login' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/adminDashboard', name: 'AdminDashboard', element: AdminDashboard },
  { path: '/devices', name: 'Devices', element: Devices },
]

export default routes
