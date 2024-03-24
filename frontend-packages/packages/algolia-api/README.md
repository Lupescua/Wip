# Algolia API Wrapper

This is a very thin wrapper around the Algolia API's search and search multiple endpoints. At the moment these are the only two endpoints needed for our frontend purposes.

## How to Use

Should be used through a service, but can be used on its own by instantiating a new AlgoliaApi object and passing it a request handler and the Application ID and API Key in the constructor, both can be found in the Algolia Dashboard.

`algoliaApi = new AlgoliaApi(requestHandler, {applicationId: 'APPLICATION_ID', apiKey: 'API_KEY'});`

To execute a single query:

`algoliaApi.search('nameOfIndex', queryObject);`

where queryObject is a valid query, see https://www.algolia.com/doc/api-reference/search-api-parameters/ for information on the query parameters and the general Algolia API documentation on how to search (https://www.algolia.com/doc/api-reference/api-methods/search/).
