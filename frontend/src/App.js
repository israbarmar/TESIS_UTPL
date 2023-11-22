import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Appointment from "./Pages/Patient/Appointment";
import AddPatient from "./Pages/Doctor/addPatient";
import ManageAppointments from "./Pages/Doctor/manageAppointments";


function App() {
  
   return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/home" element={<Home />} />

        <Route path="/appointment" element={<Appointment />} />

        <Route path="/manageAppointments" element={<ManageAppointments />} />
        <Route path="/addpatient" element={<AddPatient />} />

      </Routes>   
    </BrowserRouter>
   );
}

export default App;