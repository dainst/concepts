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
  user_id uuid not null,
  label_id uuid not null,
  timestamp timestamp default current_timestamp,
  foreign key (label_id)
    references labels (id) deferrable initially immediate,
  foreign key (user_id)
    references users (id)
);

create table app_concept_comment (-- TODO rename to comments
  id uuid primary key default uuidv7(),
  type text,
  text text,
  user_id uuid not null,
  concept_id text not null,
  concept_type id_type not null,
  timestamp timestamp default current_timestamp,
  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,
  foreign key (user_id)
    references users (id)
);

create table app_concept_snapshots (
  id uuid primary key default uuidv7(),
  event_id uuid not null,
  format_version integer not null,
  snapshot jsonb not null NOT NULL,
  foreign key (event_id) references concept_history (id)
);