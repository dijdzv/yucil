import Dashboard from './Dashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="334026574425-anlocm3ioj1fipj516m5euh6n1imsdeo.apps.googleusercontent.com">
      <Dashboard />
    </GoogleOAuthProvider>
  );
}

export default App;
