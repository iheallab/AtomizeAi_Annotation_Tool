import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/auth/login";
import Annotations from "./components/annot/annotations";
// import  Home  from "./components/home";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Annotations />} />
      </Route>
      <Route path="/login" element={<LoginForm />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/annotations" element={<Annotations />} />
      </Route>
    </Routes>
  );
};

export default App;
