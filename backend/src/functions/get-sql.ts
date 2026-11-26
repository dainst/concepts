export const getConceptHistorySql =
  `select
    users.email as user_email,
    users.name as user_name,
    extract(epoch from timestamp) as timestamp,
    event,
    value,
    comment,
    app_concept_snapshots.id as snapshot_id
  from
    concept_history
    left join users on users.email = concept_history.user_email
    left join app_concept_snapshots on concept_history.id = app_concept_snapshots.event_id
  where
    concept_type = $1 and concept_id = $2
  order by timestamp`;

export const getDomainSql =
  `select domain_tree($1) as node`;

export const getAllDomainsSql =
  `select
    domain_tree(domains.id) as node
  from
    domains
  where not exists (select 1 from domain_roots where domain_roots.domain_id = domains.id)`;
// TODO root nodes sind eigentlich anders definiert.
