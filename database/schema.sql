create type id_type as enum (
  'concepts',
  'chronontology',
  'idai.gazetteer',
  'cidoc.crm.relationship',
  'idai.thesauri',
  'url',
  'pleiades',
  'geonames',
  'skos',
  'owl',
  'rdfs',
  'language'
);

create type label_type as enum (
  'title',
  'description'
);

create table domains (
  id varchar(25) not null primary key
);

create table concepts (
  id text not null,
  type id_type not null,
  domain_id varchar(25) not null,
  foreign key (domain_id)
    references domains (id) deferrable initially immediate,
  primary key (id, type)
);

create table inversions (
  concept1_id text not null,
  concept1_type id_type not null,
  concept2_id text not null,
  concept2_type id_type not null,
  primary key (concept1_id, concept1_type, concept2_id, concept2_type),
  unique (concept2_id, concept2_type, concept1_id, concept1_type)
);

create table domain_roots (
  concept_id text not null,
  concept_type id_type not null,
  domain_id varchar(25) not null,
  primary key (domain_id),
  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,
  foreign key (domain_id)
    references domains (id) deferrable initially immediate
);

create table labels (
  id uuid primary key default uuidv7(),

  concept_id text not null,
  concept_type id_type not null,

  type label_type not null,
  label text,
  language varchar(3) not null, -- ISO 639-3
  transliteration text,
  is_preferred boolean,

  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,

  constraint te_unique_id_concept unique(id, concept_id, concept_type)
);

create table geographical_extends (
  id uuid primary key default uuidv7(),

  concept_id text not null,
  concept_type id_type not null,

  center geography(Point, 4326) not null,
  shape geometry(Multipolygon, 4326),
  certainty smallint check (certainty between 0 and 100),
  precision smallint check (precision between 0 and 100),

  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,

  constraint ge_unique_id_concept unique(id, concept_id, concept_type)
);

create table temporal_extends (
  id uuid primary key default uuidv7(),

  concept_id text not null,
  concept_type id_type not null,

  start_min bigint,
  start_max bigint,
  end_min bigint,
  end_max bigint,
  start_precision smallint check (start_precision between 0 and 100),
  end_precision smallint check (end_precision between 0 and 100),
  start_certainty smallint check (start_certainty between 0 and 100),
  end_certainty smallint check (end_certainty between 0 and 100),

  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate,

  constraint unique_id_concept unique(id, concept_id, concept_type)
);

create table relations (
  subject_id text not null,
  subject_type id_type not null,
  predicate_id text not null,
  predicate_type id_type not null,
  object_id text not null,
  object_type id_type not null,

  primary key (
    subject_id,
    subject_type,
    predicate_id,
    predicate_type,
    object_id,
    object_type
  ),

  foreign key (subject_id, subject_type)
    references concepts (id, type) deferrable initially immediate,
  foreign key (predicate_id, predicate_type)
    references concepts (id, type) deferrable initially immediate,
  foreign key (object_id, object_type)
    references concepts (id, type) deferrable initially immediate
);

create table users (
  name text not null,
  email text not null primary key
);

create type concept_history_event_type as enum(
  'create',
  'set-status',
  'edit', -- for historic records only
  'transfer-ownership',
  'change-domain',
  'delete'
  'merge',
  'replace',
  'duplicate'
);

create table concept_history (
  id uuid primary key default uuidv7(),

  concept_id text not null,
  concept_type id_type not null,

  user_email text not null,

  timestamp timestamp default current_timestamp,

  event concept_history_event_type not null,
  value text,
  comment text,

  foreign key (user_email)
    references users (email),
  foreign key (concept_id, concept_type)
    references concepts (id, type) deferrable initially immediate
);

create table meta (
  key varchar(255) not null primary key,
  val text
);



insert into users (name, email) values ('importer', '@importer');
insert into meta (key, val) values ('schema-version', '0.4.0');

