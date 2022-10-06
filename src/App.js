import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import {
  QueryClient,
  QueryClientProvider
} from 'react-query'

import SearchPage from './pages/SearchPage';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <SearchPage />
      </div>
    </QueryClientProvider>
  );
}

export default App;
