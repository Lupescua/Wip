# Change Log - @salling-group/algolia-api

This log was last generated on Tue, 09 Jan 2024 13:10:57 GMT and should not be manually modified.

## 1.8.0
Tue, 09 Jan 2024 13:10:57 GMT

### Minor changes

- Add a new getSuggestion function that does not modify the response

### Patches

- Add getRankingInfo

## 1.7.2
Thu, 14 Dec 2023 13:57:09 GMT

### Patches

- Extended parameters of the search by index function

## 1.7.1
Thu, 23 Mar 2023 08:44:32 GMT

### Patches

- Use userId value if empty string for userToken

## 1.7.0
Tue, 21 Feb 2023 11:26:10 GMT

### Minor changes

- Support additional info for A/B testing

## 1.6.0
Wed, 15 Feb 2023 10:00:05 GMT

### Minor changes

- Accept getRankingInfo parameter on search method

## 1.5.0
Thu, 19 Jan 2023 11:08:02 GMT

### Minor changes

- Expose AlgoliaSearchSdk implementing IAlgoliaApi by algolias own sdk

## 1.4.5
Wed, 04 Jan 2023 23:48:29 GMT

### Patches

- Upgrade qs dependency to fix vulnerability

## 1.4.4
Mon, 19 Sep 2022 11:31:38 GMT

### Patches

- expose the userData in the AlgoliaSuggestionApi and utilise userData in the AlgoliaSearchSuggestionApi 

## 1.4.3
Fri, 26 Aug 2022 08:03:13 GMT

_Version update only_

## 1.4.2
Fri, 29 Jul 2022 09:40:04 GMT

### Patches

- Remove enablePersonalization from search parameters

## 1.4.1
Thu, 21 Jul 2022 08:06:09 GMT

### Patches

- Remove parenthesis wrapping the static filters on the algolia search api 

## 1.4.0
Tue, 21 Jun 2022 10:52:01 GMT

### Minor changes

- Add SearchByIds method and interface IBaseSearchPayload
- Extend algolia facets with numeric stats (min, max, setmin, setmax)

## 1.3.0
Wed, 15 Jun 2022 14:17:20 GMT

### Minor changes

- Allow persistedFilters when doing search
- Removing nextPage and prevPage from the search method return and instead passing two functions that will calculate next and previous page

## 1.2.0
Mon, 13 Jun 2022 11:26:04 GMT

### Minor changes

- Revert commit 3ef3205 - numeric-range doesn't covert cms filter scenarios

### Patches

- Fix on filter for numeric 

## 1.1.0
Mon, 13 Jun 2022 08:48:30 GMT

### Minor changes

- Extend algolia facets with numeric stats (min, max, setmin, setmax)

## 1.0.0
Wed, 08 Jun 2022 11:55:37 GMT

### Breaking changes

- Add new AlgoliaBufferedApi to package

### Minor changes

- Add support for additional Algolia analytic and tracking events to AlgoliaTracker

## 0.3.0
Mon, 30 May 2022 07:52:50 GMT

### Minor changes

- Extend suggestion entries with queryID

### Patches

- Handle partial facet name matches and single quotes when creating facet requests

## 0.2.0
Thu, 19 May 2022 06:47:50 GMT

### Minor changes

- Multiquery algolia searches for better facet results

## 0.1.1
Mon, 09 May 2022 11:41:11 GMT

### Patches

- Pass distinct parameter to the AlgoliaSuggestionApi

## 0.1.0
Mon, 11 Apr 2022 12:50:00 GMT

### Minor changes

- extend the search function to get facetingAfterDistinct as a parameter

## 0.0.2
Tue, 29 Mar 2022 06:52:31 GMT

### Patches

- Extend AlgoliaSuggestionApi to get filters as part of the configuration options

## 0.0.1
Mon, 21 Mar 2022 12:03:01 GMT

### Patches

- extend search function parameters, pass a distinct as part of the parameters

