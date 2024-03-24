# Change Log - @salling-group/gigya-service

This log was last generated on Tue, 21 Feb 2023 11:26:10 GMT and should not be manually modified.

## 0.7.1
Tue, 21 Feb 2023 11:26:10 GMT

_Version update only_

## 0.7.0
Tue, 14 Feb 2023 11:28:39 GMT

### Minor changes

- Add clearActiveOrganization function to GigyaService

## 0.6.3
Wed, 04 Jan 2023 23:48:30 GMT

_Version update only_

## 0.6.2
Wed, 23 Nov 2022 11:01:57 GMT

### Patches

- Make getSchema action complete always

## 0.6.1
Thu, 15 Sep 2022 08:13:58 GMT

_Version update only_

## 0.6.0
Fri, 26 Aug 2022 08:03:13 GMT

_Version update only_

## 0.5.4
Mon, 09 May 2022 11:41:11 GMT

_Version update only_

## 0.5.3
Wed, 23 Feb 2022 19:18:06 GMT

_Version update only_

## 0.5.2
Wed, 08 Dec 2021 08:51:45 GMT

_Version update only_

## 0.5.1
Mon, 22 Nov 2021 12:59:12 GMT

_Version update only_

## 0.5.0
Mon, 08 Nov 2021 09:04:30 GMT

### Minor changes

- Add status check to setActiveOrganization

## 0.4.0
Tue, 05 Oct 2021 09:33:35 GMT

### Minor changes

- Add getRegistrationInfo() method

### Patches

- Fix potential type error  

## 0.3.0
Fri, 01 Oct 2021 13:26:16 GMT

### Minor changes

- made logout() clear state and invalidate token even it the logout request fails

## 0.2.0
Wed, 29 Sep 2021 20:07:03 GMT

### Minor changes

- Add CHANGE_PASSWORD status

## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- add getter for accountCheck
- update tests
- add required consents to constructor
- add hasSubscription
- Add support for organizations 
- Add data.terms to updateRegistration
- Implement base functionality (login, get account, logout)
- Implemented "profile" and "setAccountInfo"
- added recentlyRegistered getter
- Add resetPassword
- Add registration methods

### Patches

- isLoggedIn now acts on isValid
- Fix test after changes in gigya api
- Add missing datafields subscriptions and data
- Fix missing profile data
- Added organization token invalidation to logout and small fixes
- Add updateRegistration, getSchema, preferenceSchema
- Dont consider using registered if account is pending
- Update rush-project.json

