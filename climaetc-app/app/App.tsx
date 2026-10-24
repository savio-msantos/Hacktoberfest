import { BrowserRouter, Route, Routes } from 'react-router'
import routes from './router/routes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route, index) => (
          <Route element={route.element} key={index} path={route.path} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}
