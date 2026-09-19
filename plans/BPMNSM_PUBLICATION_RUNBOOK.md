# BPMNSM — Publication Runbook

## Purpose

This runbook makes BPMNSM publication reproducible without an AI assistant.
The repository is the authority for the product identity and its publication
policy. A forge is an operational provider of that policy.

## Registry

The source of truth is `publication/versions.json`.

It records nominal BPMNSM release identities. Test identities such as
`publication-test-*` are experimental evidence and are not entries in the
nominal `releases` array.

The initial registry deliberately contains zero nominal releases. The
repository package version `1.0.0` is not promoted to a BPMNSM release by
this registry.

Validate locally with:

```text
npm run validate:publication-registry
```

The validator is local and forge-independent. It validates structure and
semantic invariants; it does not claim that remote GitHub/GitLab objects
exist.

## Required release traceability

A nominal published release records, at minimum:

- BPMNSM identity;
- maturity and status;
- exact source Git commit;
- optional source tag;
- publication URL;
- publication date;
- CI evidence;
- deployment evidence;
- lifecycle predecessor/successor when applicable;
- resource-repository compatibility constraints when applicable.

## Publication sequence

Before a nominal release:

1. Start from the exact source commit selected for publication.
2. Install dependencies from the lockfile.
3. Run the required tests.
4. Build the distributions.
5. Verify the produced artifacts and their references.
6. Publish a preview when the experiment requires one.
7. For a nominal release, create the immutable release identity only after
   the source commit and build evidence are fixed.
8. Record the exact source identity and external evidence in the registry.
9. Verify the deployed publication independently.
10. Never silently replace the content of an already published nominal
    version. A correction creates a new version.

## Demonstrated publication experiment

The repository governance required a test-only publication identity before
the first nominal alpha. That experiment was completed with:

- `publication-test-001`: preview, versioned Pages publication, tag and
  mutable test Release, followed by controlled cleanup;
- `publication-test-002`: immutable test Release, demonstration that its tag
  could not be deleted while the immutable Release existed, followed by
  Release deletion and subsequent tag deletion.

Both test identities were cleaned up. They must not be interpreted as
nominal BPMNSM releases.

The experiment also demonstrated that GitHub immutable Releases can protect
a published tag during the Release lifetime, while cleanup can proceed in
the order:

```text
Release -> tag
```

without disabling the repository's immutable-release setting.

## Forge boundary

The registry and release identity are BPMNSM concepts. GitHub is the current
provider for CI, Releases and Pages. Provider-specific URLs and references
belong in evidence fields and operational procedures, not in the meaning of
the BPMNSM release identity.

A future provider adapter must preserve the same repository-level release
semantics.

## Reproducible resource compatibility

A BPMNSM deployment is conceptually:

```text
BPMNSM version / deployment
    ×
resource repository
    ×
repository revision
```

A BPMNSM correction can therefore create a new application version while
using exactly the same resource-repository revision.

## `latest`

`/latest/` is an alias, not a version identity. No `latest` promotion is
implied by an alpha release unless a separate decision and experiment
introduce that channel.

## AI independence

AI assistants are optional tools. They are not part of the BPMNSM source of
truth, verification, publication or recovery process. The repository,
documented commands, configuration and forge permissions must be sufficient
for another developer to reproduce the process.
