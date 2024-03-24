import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Service } from '@salling-group/core-service';
import React from 'react';
import { Observable } from 'rxjs';
import { createServiceContext, ServiceContextApi } from '../ServiceContext';
import { ServiceProvider } from '../ServiceProvider';

interface ITestState {
  id: string;
}

class TestService extends Service<ITestState> {
  public constructor(initialState: ITestState) {
    super(initialState);
  }

  public get id(): Observable<string> {
    return this.selector((s) => s.id);
  }
}

const renderProvider = (
  context: ServiceContextApi<{
    TestService: TestService;
  }>
) => {
  function Consumer() {
    const { id } = context.useTestService();
    return <>{id}</>;
  }

  function Wrapper() {
    const serviceContext = context.useServiceContext({ TestService: { id: 'ID' } });

    return (
      <ServiceProvider serviceContext={serviceContext}>
        <Consumer />
      </ServiceProvider>
    );
  }

  render(<Wrapper />);
};

describe('ServiceProvider', () => {
  let context: ServiceContextApi<{
    TestService: TestService;
  }>;
  beforeEach(() => {
    context = createServiceContext(({ staticProps }) => ({
      TestService: new TestService(staticProps.TestService)
    }));
  });

  it('renders with the expected context', () => {
    renderProvider(context);

    expect(screen.getByText('ID')).toBeInTheDocument();
  });
});
