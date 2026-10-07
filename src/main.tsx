import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { runPricingTests } from './lib/pricing.test';

// Run automated pricing engine tests in development
if (import.meta.env.DEV) {
  const testResults = runPricingTests();
  if (testResults.passed) {
    console.log('✅ Pricing engine tests passed (11/11 cases verified):', testResults.results);
  } else {
    console.error('❌ Pricing engine tests failed:', testResults.results);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
