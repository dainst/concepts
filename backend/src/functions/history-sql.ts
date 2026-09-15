export const getConceptHistorySql =
  `select
    user_id,
    users.name as user_name,
    extract(epoch from timestamp) as timestamp,
    event,
    value,
    comment,
    app_concept_snapshots.id as snapshot_id
  from
    concept_history
    left join users on users.id = concept_history.user_id
    left join app_concept_snapshots on concept_history.id = app_concept_snapshots.event_id
  where
    concept_type = $1 and concept_id = $2
  order by timestamp`;
