import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilSpreadsheet,
  cilImage,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'


const _nav = [
  {
    component: CNavTitle,
    name: "Dispositivos",
  },
  {
    component: CNavItem,
    name: 'Listado',
    to: '/devices',
    icon: <CIcon icon={cilSpreadsheet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Imagenes IA',
    to: '/gallery',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: "Perfil",
  },
  {
    component: CNavItem,
    name: 'Mis datos',
    to: '/dashboard',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
]

export default _nav
