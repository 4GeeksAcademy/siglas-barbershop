// Import necessary components and functions from react-router-dom.

import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Registrarse from "./components/Registrarse";
import Login from "./components/Login";
import ListUsers from "./components/ListUsers";
import Logout from "./components/Logout";
import Dashboard from "./pages/Dashboard";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminCreateUser from "./pages/AdminCreatedUser";
import MyPerfilCliente from "./pages/MyPerfilCliente";

export const router = createBrowserRouter(
    createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.

      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path= "/" element={<Home />} />
        <Route path= "/registrarse" element={ <Registrarse /> }/>
        <Route path= "/login" element={ <Login />}/>
        <Route path= "/logout" element={ <Logout />}/>
        <Route path= "/usuarios" element={ <ListUsers />}/>
        <Route path= "/admin/usuarios" element={ < AdminCreateUser/>} />

        <Route path= "/dashboard" element={ <Dashboard />} />
        <Route path= "/bookappointment" element={ <BookAppointment />} />
        <Route path= "/myappointments" element={ <MyAppointments /> } />
        <Route path= "/me" element={ <MyPerfilCliente /> } />
        <Route path="/single/:theId" element={ <Single />} />  {/* Dynamic route for single items */}
        <Route path="/demo" element={<Demo />} />
      </Route>
    )
);