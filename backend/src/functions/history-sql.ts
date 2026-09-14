export const getConceptHistorySql =
  `select
    user_id,
    users.name as user_name,
    extract(epoch from timestamp) as timestamp,
    event,
    value,
    comment
  from
    concept_history
    left join users on users.id = concept_history.user_id
  where
    concept_type = $1 and concept_id = $2
  order by timestamp`;
