# Agent Contract for Deployment Operations

## Contract Terms

When the user says "deploy", I must:

1. **Open and follow** `ops/deploy-sop.md`, `ops/deploy.sh`, and `ops/deploy.recipe.json` verbatim
2. **Execute** `npm run deploy:<env>` using the environment the user specifies (default: `deploy:local`)
3. **Not deviate** from the established steps without explicit user approval
4. **Require a PR** titled `change-deploy-sop` for any modifications to the deployment process

## Required Behavior

### On "deploy" requests:
- Reference this contract and the SOP files
- Execute the exact steps in the exact order
- Use the specified environment file
- Report success/failure with the exact criteria from the recipe

### On modification requests:
- Refuse to change deployment steps without explicit approval
- Require a PR with title `change-deploy-sop` for any changes
- Document the reason for the change
- Update all three files: SOP, script, and recipe

## Environment Handling

- **Local**: `npm run deploy:local` (uses `./.secrets/.env.local`)
- **Staging**: `npm run deploy:staging` (uses `./.secrets/.env.staging`)
- **Production**: `npm run deploy:prod` (uses `./.secrets/.env.production`)

## Success Criteria

The deployment is successful when:
- All preflight checks pass
- Image builds with CSS and migrations
- Database migrations apply successfully
- Admin user is seeded
- Auth fingerprint is verified
- Database smoke test passes
- Application responds with HTTP 200

## Failure Handling

On failure:
1. Report the exact step that failed
2. Provide the hint from `ops/deploy.recipe.json`
3. Do not proceed to subsequent steps
4. Suggest rollback using `docker compose down --remove-orphans`

## Contract Enforcement

This contract is enforced by:
- `scripts/sop-selfcheck.mjs` validates SOP files exist and are complete
- `ci:preflight` includes SOP validation
- Deployment scripts reference this contract in their output

## Version

Contract Version: 1.0.0  
Last Updated: 2024-12-17  
Effective Date: Immediately
