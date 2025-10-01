# Crawler Moderation & Publishing Product Brief

## Vision

Enable administrators to configure web crawlers that collect content from curated sources, evaluate relevance using maintained keyword sets, and feed a moderation queue where approved posts are published to a Pinterest-style portal hosted on crawler-specific subdomains.

## Goals

- CRUD experience for crawlers, sources, keyword strategies, and publishing configuration.
- Reliable ingestion pipeline that fetches content, deduplicates, scores, and stores pending items.
- Moderation workflow with clear actions, audit trail, and metrics.
- Configurable subdomain portal that serves approved posts with caching and purge capabilities.
- Automated CI/CD coverage for linting, tests, builds, deployments, and migrations.

## Acceptance Criteria

1. **Crawler Management**
   - Create, edit, delete crawlers with name, description, active flag, minimum match score, and assigned subdomain.
   - Manage associated sources (URL, type, rate limits) and keyword sets (AI-derived, manual).

2. **Ingestion Pipeline**
   - Scheduled/triggered jobs fetch content from each source respecting rate limits.
   - Extracted posts scored against crawler keywords; relevant posts stored in moderation queue with metadata and similarity score.
   - Duplicate detection by URL hash/normalized content.

3. **Moderation Queue**
   - Admin UI tab displays pending posts with filtering by score, source, age.
   - Approve/Reject actions update status, move to portal or archive with audit log capturing moderator, time, decision.
   - Batch operations and pagination for high-volume queues.

4. **Portal Publishing**
   - Each crawler subdomain renders approved posts in a masonry/Pinterest layout.
   - Include shareable links, metadata preview, and optional CTA link to original source.
   - Cache layer with configurable TTL and purge hook when moderation decisions change.

5. **CI/CD**
   - Workflows for lint, test, build, docker push, migration validate, deploy (staging + prod).
   - Artifact uploads for build outputs and Playwright reports.

6. **Observability**
   - Metrics for crawl runs, queue size, approval latency.
   - Alerts for ingestion failures or queue SLA breaches.

## Roadmap Milestones

1. **Schema & API Foundations**
   - Data model updates, migrations, repository services.

2. **Admin UX Enhancements**
   - Crawler CRUD wizard, keyword tools, moderation tabs.

3. **Ingestion Engine**
   - Extend crawler runtime, integrate scoring, queue persistence, logging.

4. **Moderation & Publishing**
   - Queue processing, approval UI, portal rendering.

5. **DevOps & QA**
   - CI/CD workflows, testing strategy implementation, documentation.

## Open Questions

- Should moderation support custom statuses (e.g., needs edits)?
- Do portals require authentication or are they public by default?
- Do we provide analytics dashboards for portal performance?


