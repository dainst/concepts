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

create view app_domain_tree as
with recursive
  relations as (
    select
      domains.id as child_domain_id,
      concepts.domain_id as parent_domain_id
    from domains
           join domain_roots on domain_roots.domain_id = domains.id
           join concepts on concepts.id = domain_roots.concept_id and concepts.type = domain_roots.concept_type
    where concepts.domain_id <> domains.id
  ),

  domain_info as (
    select
      domains.id as domain_id,
      concepts.id as root_id,
      concepts.type as root_type
    from domains
           left join domain_roots on domain_roots.domain_id = domains.id
           left join concepts on domain_roots.concept_id = concepts.id and domain_roots.concept_type = concepts.type
  ),

  domain_list as (
    select
      father.domain_id,
      father.root_id,
      father.root_type,

      coalesce(
          jsonb_agg(
          jsonb_build_object(
            'id', child.domain_id,
            'root', case
                      when child.root_id is not null then
                        jsonb_build_object(
                          'id', child.root_id,
                          'type', child.root_type
                        )
              end
          ) order by child.domain_id
                   ) filter (where child.domain_id is not null),
          '[]'::jsonb
      ) as children,

      coalesce(
          array_agg(child.domain_id) filter (where child.domain_id is not null),
          array[]::varchar[]
      ) as child_ids

    from domain_info father
           left join relations on relations.parent_domain_id = father.domain_id
           left join domain_info child on child.domain_id = relations.child_domain_id

    group by
      father.domain_id,
      father.root_id,
      father.root_type
  ),

  tree as (
    select
      domain_list.domain_id,
      null::varchar as parent_domain_id,
      jsonb_build_object(
        'id', domain_list.domain_id,
        'root', case
                  when domain_list.root_id is not null then
                    jsonb_build_object(
                      'id', domain_list.root_id,
                      'type', domain_list.root_type
                    )
          end
      ) as node

    from domain_list
    where
      cardinality(domain_list.child_ids) = 0

    union all

    select
      domain_list.domain_id,
      relations.parent_domain_id,

      jsonb_build_object(
        'id', domain_list.domain_id,
        'root', case
                  when domain_list.root_id is not null then
                    jsonb_build_object(
                      'id', domain_list.root_id,
                      'type', domain_list.root_type
                    )
          end,
        'subDomains', jsonb_set(
          domain_list.children,
          array[(array_position(domain_list.child_ids, tree.domain_id) - 1)::text],
          tree.node,
          true
                      )
      )

    from tree
           join relations on relations.child_domain_id = tree.domain_id
           join domain_list on domain_list.domain_id = relations.parent_domain_id

    where not (domain_list.domain_id = any(array[tree.domain_id]))
  )
select
  domain_list.domain_id,
  coalesce(
    node,
    jsonb_build_object(
      'id', domain_list.domain_id,
      'warning', true,
      'root', case
                when domain_list.root_id is not null
                  then jsonb_build_object(
                  'id', domain_list.root_id,
                  'type', domain_list.root_type
                       )
        end
    )
  ) as node
from domain_list
       left join tree on domain_list.domain_id = tree.domain_id
