# Example: Aillom Vox Client Overlay

## Mode

Hybrid brownfield overlay.

## C.A.S.A flow

1. Add C.A.S.A as an overlay to the existing client project.
2. Map runtime dependencies, API contracts and voice-provider boundaries.
3. Treat audio, provider auth, secrets and production deploy as high-risk areas.
4. Use specs for behavior changes and sensors for smoke tests.

## Safety example

- Before changing voice runtime behavior, capture current provider, session and smoke-test evidence.
- Keep secrets out of generated context and audit logs.
