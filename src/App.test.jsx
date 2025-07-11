import React from 'react';
import { render } from '@testing-library/react';
import App from './App'; // Make sure to specify the correct path to your App component

test('renders without crashing', () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});
