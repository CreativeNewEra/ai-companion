import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';
import { ModelProvider, ModelService } from '../context/ModelContext';

const mockModelService: ModelService = {
  getCapabilityDescription: (capability: string) => `Mock description for ${capability}`,
  getModels: () => ({
    'model-1': {
      name: 'Model 1',
      capabilities: ['capability-1', 'capability-2'],
      groups: ['group-1']
    }
  }),
  getCurrentModel: () => 'model-1',
  setCurrentModel: () => {},
};

interface WrapperProps {
  children: React.ReactNode;
  modelService?: ModelService;
}

const AllTheProviders = ({ children, modelService = mockModelService }: WrapperProps) => {
  return (
    <ModelProvider modelService={modelService}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ModelProvider>
  );
};

const render = (
  ui: React.ReactElement,
  { modelService, ...options }: { modelService?: ModelService } & Parameters<typeof rtlRender>[1] = {}
) =>
  rtlRender(ui, {
    wrapper: (props) => <AllTheProviders {...props} modelService={modelService} />,
    ...options,
  });

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
export { mockModelService };
