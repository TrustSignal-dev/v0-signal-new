# Retired frontend schema provenance

These files are preserved for historical review only. They are deliberately
outside `supabase/migrations/` and every configured declarative-schema path, so
the Supabase CLI does not apply them during a local reset or a migration push.

They modeled API-key and verification records inside the customer frontend.
That ownership model is retired: API keys and receipts belong to the core
TrustSignal API and the frontend accesses them through authenticated server-side
routes.

Do not copy these files back into an active migration or schema directory. Any
future schema change must be forward-only, generated and reviewed against the
current active migration history.

## SHA-256 preservation manifest

| Original path | Archived path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `supabase/migrations/202604270001_account_scoped_monetization.sql` | `migrations/202604270001_account_scoped_monetization.sql` | 12473 | `fa611de20a8762eab869ee1325781e4298ddaf687d8d88d3829ac82577bcf767` |
| `supabase/migrations/20260507000048_remote_baseline.sql` | `migrations/20260507000048_remote_baseline.sql` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `supabase/migrations/20260507022501_remote_baseline_2.sql` | `migrations/20260507022501_remote_baseline_2.sql` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `supabase/migrations/20260507100000_add_api_key_display_columns.sql` | `migrations/20260507100000_add_api_key_display_columns.sql` | 1344 | `03034a8f8a6a929f113a1e8b63bd9ad0f5125f0019d90999c21398cd5a577da9` |
| `supabase/schemas/001_trustsignal_base.sql` | `schemas/001_trustsignal_base.sql` | 9534 | `3d017c79b06f4555bf7dbea3be721b557054ef3a3ee2c03aece7a9690e8287d2` |

The active migration `supabase/migrations/20260903041303_production_dashboard_account_schema.sql`
is not part of this archive and must remain byte-for-byte unchanged.
