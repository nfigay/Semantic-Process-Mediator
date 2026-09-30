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

## Demonstrator checkpoint 2026-09-21

Before publishing the post-LW12 demonstrator, preserve the distinction between a local demonstrated checkpoint and a nominal BPMNSM release.

The checkpoint to package demonstrates Local Workspace experiments LW01 through LW12 in their documented boundaries, including heterogeneous resource discovery, multi-document repository save, autonomous Business Model JSON loading, canonical BO/BR mutation, physical save and fresh reload.

A publication candidate for this checkpoint must be built from an explicitly selected Git commit. The current working tree at the documented handover is intentionally dirty and must not be treated as a reproducible release merely because the browser runtime has been demonstrated.

Before any nominal publication:

1. capitalize and verify the 2026-09-21 documentation checkpoint;
2. define the exact source boundary to commit without absorbing unrelated files accidentally;
3. run the agreed grouped regression and standalone build from that source boundary;
4. inspect the generated demonstrator artifacts;
5. commit only after explicit authorization;
6. push and collect CI evidence only after explicit authorization;
7. decide separately whether the result is a preview/test publication or a nominal release recorded in `publication/versions.json`.

Do not infer a release identity from `package.json` or from the LW experiment number.

## Hosted Viewer and deep-link validation — 2026-09-30

For Viewer publication experiments, the primary validation path is now the hosted Vite/HTTP path. The standalone single-file build remains a supported distribution artifact, but it is not a substitute for validating the canonical hosted Viewer when the claim concerns URL-addressable publication or portal integration.

### Hosted validation sequence

For a Viewer increment, use this evidence order unless the experiment documents a narrower reason:

1. run the targeted tests for the changed publication/Viewer contract;
2. run the relevant regression set;
3. build the Pages/Vite target using the repository's existing build chain;
4. verify the expected Viewer entry and publication payload/package in `dist`;
5. deploy through the existing Pages publication mechanism when deployment evidence is required;
6. open the canonical HTTP URL in Chrome and verify the claimed interaction;
7. when deep links are part of the claim, reload/copy the URL with its parameters and verify that the requested consultation context is restored;
8. when portal integration is part of the claim, verify that the portal consumes the hosted URL rather than a copied BPMNSM code bundle, unless an explicit offline/attachment experiment is being tested.

A canonical hosted Viewer URL may carry consultation parameters such as CoC, role, Process and BPMN element. These parameters select Viewer state; they do not by themselves create release identities or distinct published versions.

### Portal integration boundary

Google Sites, Confluence and similar systems are integration consumers. Record the exact hosted URL and the portal mechanism used as external evidence. Portal-specific framing, allowlist, macro or wrapper behavior is not evidence that the BPMNSM publication package itself must change.

The demonstrated 2026-09-30 path establishes that a Vite Pages publication served from GitHub Pages can be opened through a parameterized URL and rendered with bpmn-js in Chrome. Google Sites embedding of the hosted Viewer was also demonstrated. A Confluence integration was demonstrated in the tested environment using its available HTML integration mechanism. These are product proofs for the integration principle, not nominal release identities.

### Standalone relationship

A self-contained HTML export is an optional delivery form for offline or constrained environments. It should consume the same logical publication data/resolution rules as the hosted Viewer as the architecture converges. Do not fork business resolution logic merely to produce the standalone artifact.
