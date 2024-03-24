# LayoutService

 The purpose of `LayoutService` is to provide a way to manage the visibility of multiple elements.

 Allows the consumer to `open`, `close` and `toggle` the visibility of elements.
 When an element is opened, it will close any other elements that it conflicts with. This is done by setting the `conflicts` property on the element.

 The service also provides an `index` for each element, which can be used to determine the order of the elements. E.g. to set the z-index to make the latest interacted element appear on top of others.