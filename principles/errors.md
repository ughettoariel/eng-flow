# Errors

## Expected failures are values; unexpected ones throw

An expected failure (invalid input, not found, a conflict) is returned as a typed result. An exception means a bug or a broken dependency, and it is caught once, at the outermost boundary, where it is logged and turned into a response.

**Why:** a result in the signature forces every caller to handle the case; an exception thrown for an expected case is invisible until it is swallowed somewhere.

## One style per runtime

Choose results or exceptions-plus-central-handler for each runtime and keep to it.

**Why:** mixing both means every call site has to guess which one it gets.

## Domain errors stay plain

The domain names its failures in business terms and knows nothing of codes, protocols or translations.

**Why:** presentation concerns in the domain make it change for reasons that are not business reasons.

## Errors outside the domain have a stable identity

Each one carries a stable code, a category (validation, network, system) and the key of the message users see.

**Why:** a stable code lets a user's report, a log line and a dashboard point at the same failure, and keeps copy out of logic.

## Failures are never swallowed

Every caught error is handled, rethrown or logged with context, never silently ignored or replaced by a default that looks like success.

**Why:** a hidden failure becomes wrong data that surfaces far from its cause.
