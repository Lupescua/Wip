import { of } from 'rxjs';
import { rxSandbox, RxSandboxInstance } from 'rx-sandbox';
import { SearchSignature, SuggestionService } from '../SuggestionService';

interface ITestSuggestion {
  title: string;
}

describe('SuggestionService', () => {
  let scheduler: RxSandboxInstance;
  let service: SuggestionService<ITestSuggestion>;
  let searchResponse: Array<ITestSuggestion>;

  beforeEach(() => {
    scheduler = rxSandbox.create(true);
    jest.resetAllMocks();

    searchResponse = [
      {
        title: 'suggestion 1'
      },
      {
        title: 'suggestion 2'
      },
      {
        title: 'suggestion 3'
      }
    ];

    const getSuggestions: SearchSignature<ITestSuggestion> = jest.fn(() =>
      of(searchResponse)
    );

    service = new SuggestionService({ getSuggestions, scheduler: scheduler.scheduler });
  });

  describe('search', () => {
    it('should set state', () => {
      service.setTerm('abc');

      expect(service.getValue().term).toEqual('abc');
    });
  });

  describe('suggestions', () => {
    it('should return default suggestions', () => {
      const { getMessages, e } = scheduler;

      const suggestions = getMessages(service.suggestions);

      expect(suggestions).toEqual(
        e('a', {
          a: []
        })
      );
    });

    it('should return suggestions fetched from the API', () => {
      const { getMessages, e } = scheduler;

      service.setTerm('abc');
      const suggestions = getMessages(service.suggestions);

      expect(suggestions).toEqual(
        e('a...149...b', {
          a: [],
          b: [
            {
              title: 'suggestion 1'
            },
            {
              title: 'suggestion 2'
            },
            {
              title: 'suggestion 3'
            }
          ]
        })
      );
    });
  });

  describe('term', () => {
    it('should return current term', () => {
      const { getMessages, e } = scheduler;

      service.setTerm('abc');
      const term = getMessages(service.term);

      expect(term).toEqual(
        e('a', {
          a: 'abc'
        })
      );
    });
  });
});
