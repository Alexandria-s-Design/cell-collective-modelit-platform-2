import React from 'react';

import AppRoutes from '../Routes';
import ErrorBoundary from '../ErrorBoundary';

class App extends React.Component {
  render() {
    return (
      <div>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </div>
    );
  }
}

export default App;