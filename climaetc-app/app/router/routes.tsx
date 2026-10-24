import { type RouteObject } from 'react-router'
import AlertaClimatico from '../../pages/Dashboard'
import CompararTurnos from '../../pages/CompararTurnos'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AlertaClimatico />,
  },
  {
    path: '/comparar-turnos',
    element: <CompararTurnos />,
  },
]

export default routes
