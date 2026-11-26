create view app_expanded_relations as
select
  subject_id,
  subject_type,
  predicate_id,
  predicate_type,
  object_id,
  object_type
from relations
union
select
  object_id as subject_id,
  object_type as subject_type,
  concept2_id as predicate_id,
  concept2_type as predicate_type,
  subject_id as object_id,
  subject_type as object_type
from relations
   join inversions on inversions.concept1_id = predicate_id and concept1_type = predicate_type
union
select
  object_id as subject_id,
  object_type as subject_type,
  concept1_id as predicate_id,
  concept1_type as predicate_type,
  subject_id as object_id,
  subject_type as object_type
from relations
   join inversions on inversions.concept2_id = predicate_id and concept2_type = predicate_type;


create table app_label_comment (-- TODO rename to comments
  id uuid primary key default uuidv7(),
  type text,
  text text,
  user_email text not null,
  label_id uuid not null,
  timestamp timestamp default current_timestamp,
  foreign key (label_id)
    references labels (id) deferrable initially immediate,
  foreign key (user_email)
    references users (email)
);

create table app_concept_comment (-- TODO rename to comments
  id uuid primary key default uuidv7(),
  type text,
  text text,
  user_email text not null,
  concept_id text not null,
  concept_type id_type not null,
  timestamp timestamp default current_timestamp,
  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,
  foreign key (user_email)
    references users (email)
);

create table app_concept_snapshots (
  id uuid primary key default uuidv7(),
  event_id uuid not null,
  format_version integer not null,
  snapshot jsonb not null NOT NULL,
  foreign key (event_id) references concept_history (id)
);

create or replace function domain_tree(p_domain_id varchar, p_path varchar[] default array []::varchar[])
  returns jsonb
  language sql
  stable
as
$function$

select
  jsonb_build_object(
      'id', d.id,
      'root', case
                when root_concept.id is not null then
                  jsonb_build_object(
                      'id', root_concept.id,
                      'type', root_concept.type
                  )
        end,
      'subDomains', coalesce(
          (select
             jsonb_agg(
                 domain_tree(
                     child.id,
                     p_path || d.id
                 )
                 order by child.id
             )
           from
             domains child
               join domain_roots child_dr on child_dr.domain_id = child.id
               join concepts parent_concept
                    on parent_concept.id = child_dr.concept_id and parent_concept.type = child_dr.concept_type
           where
             parent_concept.domain_id = d.id
             and child.id <> d.id
             and not child.id = any (p_path || d.id)
          ),
          '[]'::jsonb
                    )
  )

from
  domains d
    left join domain_roots dr on dr.domain_id = d.id
    left join concepts root_concept
              on root_concept.id = dr.concept_id and root_concept.type = dr.concept_type
where
  d.id = p_domain_id;
$function$;


create view app_concepts as
  select
    concepts.id,
    concepts.type,
    history.event as last_event,
    history.timestamp as last_event_ts,
    history.value as last_event_value,
    concepts.domain_id
  from concepts
    left join lateral (
      select
        event,
        timestamp,
        value
      from
        concept_history
      where
        concept_id = concepts.id
        and concept_type = concepts.type
      order by timestamp desc
      limit 1
    ) history on true;