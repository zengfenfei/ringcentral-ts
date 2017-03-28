# For Developers/Contributors

## npm publish

The content published to npm is in the `build/src` not the root directory. `npm publish` should be done in `build/src`. Generally, npm publish is done by travis, you should not do it manually.

## Coding guide

### Do not use string literal for events emitter

List all event names as string constants, reference the string constant where event name is needed. Refer to `src/Subscription.ts` for example.