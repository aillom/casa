# Brownfield Modernization Spec: <Area Name>

## Goal

Describe what part of the legacy system will be understood, protected or modernized.

## Current State

- Modules involved
- Known dependencies
- Known risks
- Missing documentation
- Missing tests

## Business Behavior To Preserve

- Behavior 1
- Behavior 2

## Safety Baseline

- Characterization tests
- Smoke tests
- Contract tests
- Observability checks

## Modernization Strategy

- Discovery
- Baseline
- Seams
- Strangler
- Retirement

## Acceptance Criteria

> EARS format with stable ids. Characterization and smoke tests reference them as `(AC1)`.

- AC1: WHEN the modernized path runs THE SYSTEM SHALL preserve the documented legacy behavior
- AC2: WHILE the strangler migration is in progress THE SYSTEM SHALL keep the old path available
- AC3: IF the new path fails THEN THE SYSTEM SHALL fall back or roll back without data loss

## Risks and Questions

- Risk or unknown 1
- Risk or unknown 2
