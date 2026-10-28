import { DashboardScreen } from './screens/DashboardScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';

export default function App() {
  return (
    <ErrorBoundary>
      <DashboardScreen />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}
