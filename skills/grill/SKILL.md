---
name: grill
description: Settle a plan or decision with its owner through batches of multiple-choice questions, each with its context and a recommended option, until every decision has an answer. Use when asked to grill, stress-test or decide a plan, or for a spike the owner decides.
---

# Grill

The person deciding may not be a programmer. They decide by picking between options they understand, so every question carries the context they need to choose. Ask in their language.

## Before asking

Read the ticket, its epic and every doc or file the decision touches: the glossary (`CONTEXT.md`, or the `Glossary` line of `docs/agents/project.md`), the ADRs and the code. A fact the repo or the web can answer is yours to find, never a question: ask only for decisions. Research that is still running blocks only the questions that depend on it.

## The decision tree

Each decision opens the decisions that depend on it. The frontier is every open decision whose prerequisites are already answered. A batch asks only from the frontier, so no question in it depends on another question in the same batch. When the whole batch is answered, recompute the frontier and ask the next batch from what those answers unblocked.

## A batch

- At most four questions. A larger frontier goes out over several batches.
- Each question opens with its context in plain words: what is being decided, why it matters, and the fact behind it, such as a number from the data or what the system does today.
- Each option has a description of what choosing it means and what it costs. The recommended option goes first, marked "(Recommended)" in the person's language. Offer only realistic options, usually two or three.
- Use a multi-select question when the options are not exclusive, such as "what does the business use today?".

Ask each batch in the session, through the harness's multiple-choice question tool, or as numbered questions with lettered options when it has none. Questions never go to GitHub as comments or in descriptions. When the person is not in the session, write each question of the batch to its own file in `.eng-flow/questions/` of the main checkout, as described in `references/pending-questions.md`, and keep working on what does not depend on it. The next session that starts in the project lists those files and offers to grill them.

## Answers

- A free-text answer can settle the question, change an option or open new questions. Read it as written, and ask again only what it left unclear.
- An answer left for someone else, such as a client or a supplier, stays pending in `.eng-flow/questions/`, naming who answers. It is not a decision.
- A term that is expensive to change goes into the glossary, in the shape of `references/glossary-format.md`. A decision that passes the test in `references/adr-format.md` gets an ADR in that shape. Everything else lives in the ticket.

## Done

The frontier is empty: every decision has an answer or is listed as pending for someone named. Show a summary of the decisions and the pending questions and wait for a yes. Then record each decision, one line each and in English, in the ticket's `## Decisions` section (with `Tickets: none` in `docs/agents/project.md`, in the summary), and delete the question file it answered. Close the ticket only when nothing is pending, or when told to.
