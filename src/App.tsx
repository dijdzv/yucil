import Dashboard from './Dashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
      <Dashboard />
    </GoogleOAuthProvider>
  );
}

export default App;
