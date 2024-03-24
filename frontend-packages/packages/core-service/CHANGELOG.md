# Change Log - @salling-group/core-service

This log was last generated on Thu, 15 Sep 2022 08:13:58 GMT and should not be manually modified.

## 0.3.0
Thu, 15 Sep 2022 08:13:58 GMT

### Minor changes

- Add static getState to Service.
- Getting raw state from getState.

## 0.2.0
Wed, 08 Dec 2021 08:51:45 GMT

### Minor changes

- Add selector test utility
- Implement parameterized getters

## 0.1.0
Wed, 29 Sep 2021 11:28:42 GMT

### Minor changes

- Add new ActionEventHub
- Add resetState to abstract Service
- Add `ActionHandler`
- Add `dispatchEvent()` operator
- Add `dispose()` to ActionExecution
- Add `ActionStatus.SKIP`
- Add limitByGroup concurrency operator
- Initial release
- Add `takeHeadAndTail()` operator
- Add `dispatchActionEvent()` operator
- Remove the emission timeout from `ActionExecution.shared`
- Add `State` with support for optimistic updates
- Add ServiceDescriptor and adjust Service

### Patches

- Fix setState return type inferrence 
- Fix state replay
- Improve core service tests and remove service test adapter
- Rename and improve Action decorator
- Update rush-project.json
- Remove ServiceFactory
- Fix an issue where errors are caught and lost in `optimisticNext()`
- Add parameter `config?: IOptimisticUpdateConfig` to `Service.setState()`
- Reduce the amount of emits from `State`
- Improve the handling and clean up of reducers
- Fix event hub type
- Adjust `headAndTail` key selection typings
- Add helper function `Service.setState()`

