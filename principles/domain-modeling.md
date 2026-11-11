# Domain modeling

## Model only where there are rules

Put a concept in the domain when it has rules, invariants across fields, meaningful state changes or behaviour. Plain records, configuration and reference data skip the domain.

**Why:** a domain object with no rules is ceremony that adds a mapper to every change and protects nothing.

## Rules live on the concept they govern

When a concept has rules, the concept enforces them; services do not reach into its fields to do it.

**Why:** rules spread across services drift apart, and nothing stops a caller from building an invalid object.

## Invalid states cannot be built

An aggregate is created only through a factory that checks its invariants, and a change returns a new value instead of mutating in place.

**Why:** if the only way to get the object is through the check, no invalid one exists anywhere in the program.

## Values validate themselves

A value with rules (a quantity, an amount of money, an identifier) is its own type that can only be obtained by passing its check.

**Why:** validation happens once, and every function that accepts the type can trust it without checking again.

## Expected outcomes are part of the signature

A domain operation that can fail for a business reason returns that outcome as a value instead of throwing.

**Why:** the caller cannot forget a failure that is in the return type.

## Time and identity are inputs

Domain functions receive the current time, time zone and any new identifier as arguments.

**Why:** a function that reads the clock or generates ids cannot be tested at the edges that matter: day boundaries, time zones, ordering.

## Names are the documentation

Business concepts are named as the business names them, with no technical suffix. Avoid generic names (manager, helper, base service). Each concept has one name, kept in a glossary, used the same in code, docs and conversation.

**Why:** a precise name removes the need for a comment; a generic one attracts unrelated code; two names for one thing produce two implementations.
