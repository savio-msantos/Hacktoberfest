import { type RouteObject } from 'react-router'
import AlertaClimatico from '../../pages/Dashboard'
import CompararTurnos from '../../pages/CompararTurnos'
import { Navigate } from 'react-router'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AlertaClimatico />,
  },
  {
    path: '/comparar-turnos',
    element: <CompararTurnos />,
  },
  { path: '/rotas', element: <AlertaClimatico /> },
  { path: '*', element: <Navigate to="/" replace /> },
]

export default routes
