# Change Log - @salling-group/request-handlers

This log was last generated on Wed, 04 Jan 2023 23:48:30 GMT and should not be manually modified.

## 1.0.1
Wed, 04 Jan 2023 23:48:29 GMT

### Patches

- Upgrade qs dependency to fix vulnerability

## 1.0.0
Wed, 23 Feb 2022 19:18:06 GMT

### Breaking changes

- add support for reading response headers

## 0.2.0
Mon, 22 Nov 2021 12:59:12 GMT

### Minor changes

- add responseType to calls

## 0.1.1
Tue, 05 Oct 2021 09:33:35 GMT

### Patches

- Fix an issue where `OneTimetoken.invalidate()` triggers `IOneTimeTokenConfig.request()`

## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Cancel requests on auth fail
- Make tokens and token request handler fully generic
- Make request handlers more generic
- ReadonlyToken and LocalStorageToken added
- Expose redonly field on RefreshableToken
- Add retry option to RefreshableToken

### Patches

- Change LocalStorageToken to use defer in getter
- Fix eslint warning
- Handle undefined tokens and fix multi emitting tokens
- Stringify arrays as comma seperated
- Bump @types/qs
- Add DataType to control encoding of request
- Add Body in request
- Update rush-project.json
- Add PATCH to allowed request methods
- Remove 403 http status check

