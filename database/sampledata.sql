BEGIN;

set constraints all deferred;
-- domains: 5 rows
insert into domains (id) values ('relations');
insert into domains (id) values ('chronontology:types');
insert into domains (id) values ('Chronontology');
insert into domains (id) values ('world');
insert into domains (id) values ('languages');

-- concepts: 17 rows
insert into concepts (id, type, domain_id) values ('follows', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('hasCoreArea', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('hasPart', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('hasSense', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('isFollowedBy', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('isPartOf', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('isSenseOf', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('hasPeriodType', 'chronontology', 'relations');
insert into concepts (id, type, domain_id) values ('cultural', 'chronontology', 'chronontology:types');
insert into concepts (id, type, domain_id) values ('2044273', 'idai.gazetteer', 'world');
insert into concepts (id, type, domain_id) values ('C2HPkFYjZhFh', 'chronontology', 'Chronontology');
insert into concepts (id, type, domain_id) values ('WeenJPbpkvgg', 'chronontology', 'Chronontology');
insert into concepts (id, type, domain_id) values ('Cp0pDVwmsa8T', 'chronontology', 'Chronontology');
insert into concepts (id, type, domain_id) values ('OdfSbdiTo00V', 'chronontology', 'Chronontology');
insert into concepts (id, type, domain_id) values ('deu', 'language', 'languages');
insert into concepts (id, type, domain_id) values ('eng', 'language', 'languages');
insert into concepts (id, type, domain_id) values ('fra', 'language', 'languages');

-- labels: 49 rows
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('bbd5d29e-1324-5224-9195-b48c2c6ef961', 'follows', 'chronontology', 'title', 'Folgt auf', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('21ea1e17-b83c-55c9-8561-1eb8cf1391a4', 'follows', 'chronontology', 'title', 'Follows', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('18d27f2a-6177-5a4f-9820-051aed11472d', 'hasCoreArea', 'chronontology', 'title', 'Hat Kerngebiet', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('60ee747d-1402-52da-8c73-e41939d8c32b', 'hasCoreArea', 'chronontology', 'title', 'Has core area', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('2bfcba84-1f44-5934-8307-bef6a86b3b20', 'hasPart', 'chronontology', 'title', 'Hat Unterteilungen', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('87d18c3e-dd0c-59eb-b48b-a8a7a8700362', 'hasPart', 'chronontology', 'title', 'Has parts', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('47561ccc-6aaa-5def-8985-ba1badeccc74', 'hasSense', 'chronontology', 'title', 'Hat als eine Bedeutung', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('45c20cc7-7ecd-5114-89f9-02f6fb2fd726', 'hasSense', 'chronontology', 'title', 'Has senses', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('a33dd625-edc0-5c23-a0c5-499f77248c3a', 'isFollowedBy', 'chronontology', 'title', 'Wird gefolgt von', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('a139ebf4-7d61-56dc-9356-a9ce57db327d', 'isFollowedBy', 'chronontology', 'title', 'Is followed by', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('3c3024b9-88b5-5f1c-a64d-ebb818f1d259', 'isPartOf', 'chronontology', 'title', 'Ist Teil von', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('12788307-e039-5071-a9be-055d8a2e6ecb', 'isPartOf', 'chronontology', 'title', 'Is part of', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('b481f1aa-76ba-5eb4-8338-b605ecf17c22', 'isSenseOf', 'chronontology', 'title', 'Ist eine Bedeutung von', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('4280d59a-71ae-5605-9c70-e6e08b2e423b', 'isSenseOf', 'chronontology', 'title', 'Is a sense of', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('f0e356be-923d-5f46-9574-265dd30b668c', 'hasPeriodType', 'chronontology', 'title', 'Hat Datierungstyp', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('4aa2157d-27bf-5803-ba90-54126bf0a2b9', 'hasPeriodType', 'chronontology', 'title', 'Has type of dating', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('c529bb57-05fa-5a18-80d8-805088355eab', 'cultural', 'chronontology', 'title', 'Kulturell', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('4867265f-f21f-545d-8860-0e140e1f00d6', 'cultural', 'chronontology', 'title', 'Cultural', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('8c912afb-8150-5c51-b4e8-00553384d3d2', 'cultural', 'chronontology', 'description', 'Are related to the existance (appearance/disappearance) of a specific culture or cultural group, regardless of the contemporary political, technological or material developments. Might be reflected in material culture and/or other cultural markers.', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('9156d46b-618f-546f-b826-3d7b1c937b0c', 'C2HPkFYjZhFh', 'chronontology', 'title', 'Hallstatt B', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('0825438a-3f60-56e6-a7c9-f33b3a3ae072', 'C2HPkFYjZhFh', 'chronontology', 'title', 'Ha B', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('029673c2-c5a8-51ab-a624-4443ef14d2fb', 'C2HPkFYjZhFh', 'chronontology', 'title', 'Hallstatt B', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('93558de1-d96f-5273-9571-43fd25571943', 'C2HPkFYjZhFh', 'chronontology', 'title', 'Ha B', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('cfd895c7-a70f-5cbf-b03d-80da1106888c', 'C2HPkFYjZhFh', 'chronontology', 'description', 'the Hallstatt cultural sequence is subdivided into four units, A–D, of which A (12th and 11th centuries bc) and B (10th to 8th centuries bc) are regarded as Bronze Age cultures, and equate to the older and younger Urnfield cultures, while C and D were Iron Age cultures, dating to the 7th and 6th centuries bc.
(source: The Concise Oxford Dictionary of Archaeology (2 ed.). 2008. Timothy Darvill; https://zenon.dainst.org/Record/000805500)', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('6cf60299-3c0f-57b4-a339-b1c1fda970f2', 'Cp0pDVwmsa8T', 'chronontology', 'title', 'Hallstattzeit', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('dc4cde29-855b-532c-a3ed-ab610c909cf3', 'Cp0pDVwmsa8T', 'chronontology', 'title', 'Hallstatt', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('68a7144f-4ace-5cce-8b97-2aabf483805f', 'Cp0pDVwmsa8T', 'chronontology', 'title', 'Hallstatt period', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('98778e76-5011-548a-a5a6-247739e025e4', 'OdfSbdiTo00V', 'chronontology', 'title', 'Hallstatt A', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('79c17364-05af-520d-9d4c-f858a0cb05a2', 'OdfSbdiTo00V', 'chronontology', 'title', 'Ha A', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('9216dacf-c448-53b0-84e7-b38918695dae', 'OdfSbdiTo00V', 'chronontology', 'title', 'Hallstatt A', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('47a90adb-1f7b-5501-a9e1-2cee43de4c5d', 'OdfSbdiTo00V', 'chronontology', 'title', 'Ha A', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('fb5a2d1a-065d-5c15-a2ee-60b1899f4bdd', 'OdfSbdiTo00V', 'chronontology', 'description', 'the Hallstatt cultural sequence is subdivided into four units, A–D, of which A (12th and 11th centuries bc) and B (10th to 8th centuries bc) are regarded as Bronze Age cultures, and equate to the older and younger Urnfield cultures, while C and D were Iron Age cultures, dating to the 7th and 6th centuries bc.
(source: The Concise Oxford Dictionary of Archaeology (2 ed.). 2008. Timothy Darvill; https://zenon.dainst.org/Record/000805500)', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('8a8b5776-a62c-5aae-8d14-90922836107f', 'WeenJPbpkvgg', 'chronontology', 'title', 'Hallstatt', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('db2979c1-839b-5bcb-97d6-2a221d5b041d', 'WeenJPbpkvgg', 'chronontology', 'title', 'Hallstattkultur', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('e3675625-a6ea-5b7a-8ada-15fca4484e30', 'WeenJPbpkvgg', 'chronontology', 'title', 'Hallstatt culture', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('8421369d-e5a9-5336-82e6-c628df4c5063', 'WeenJPbpkvgg', 'chronontology', 'description', 'Late Bronze Age and early Iron Age culture of central Europe named after the type‐site at Hallstatt, Austria. In the German system of classification the Hallstatt cultural sequence is subdivided into four units, A–D, of which A (12th and 11th centuries bc) and B (10th to 8th centuries bc) are regarded as Bronze Age cultures, and equate to the older and younger Urnfield cultures, while C and D were Iron Age cultures, dating to the 7th and 6th centuries bc.
Although the Hallstatt Culture developed from the preceding Urnfield cultures there were a number of marked changes. First was the introduction of ironworking technology. Second, inhumation replaced cremation as the principal burial mode. And, third, Hallstatt society appears to have been highly differentiated, with wealthy chieftains buried in richly furnished graves that included amongst their grave goods material imported from the Mediterranean world.
(source: The Concise Oxford Dictionary of Archaeology (2 ed.). 2008. Timothy Darvill; https://zenon.dainst.org/Record/000805500)', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-748c-8033-60bf0ee0a4b2', '2044273', 'idai.gazetteer', 'title', 'Mitteleuropa', 'deu', 'Mitteleuropa', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-7c82-a8d7-703912b14d01', '2044273', 'idai.gazetteer', 'title', 'Mitteleuropa', 'deu', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-7a2b-a7a0-3115a3a80c49', '2044273', 'idai.gazetteer', 'title', 'Europa Srodkowa', 'pol', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-7fd1-b6e4-0d7528bb27e1', '2044273', 'idai.gazetteer', 'title', 'Europe centrale', 'fra', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-732c-b382-0273925cb9cc', '2044273', 'idai.gazetteer', 'title', 'Europa centrale', 'ita', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-7639-8524-b38eb42b9dc3', '2044273', 'idai.gazetteer', 'title', 'Europa danubiana', 'ita', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fc-7267-9823-a6c6027f4b42', '2044273', 'idai.gazetteer', 'title', 'Центральная Европа', 'rus', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fd-77c1-b337-fc61b4a733ac', '2044273', 'idai.gazetteer', 'title', 'Střední Evropa', 'ces', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fd-7dc9-90f3-ba6b83560a7a', '2044273', 'idai.gazetteer', 'title', 'Средња Европа', 'srp', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a0f183-65fd-7c81-9f5e-985c30aabb47', '2044273', 'idai.gazetteer', 'title', 'Közép-Európa', 'hun', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a08b2b-3228-7aa6-b95b-1baa66ec09e0', 'deu', 'language', 'title', 'German', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a08b2b-3228-76b1-a095-7095037a298d', 'eng', 'language', 'title', 'English', 'eng', '', 'f');
insert into labels (id, concept_id, concept_type, type, label, language, transliteration, is_preferred) values ('01a08b2b-3229-7a1d-9523-2e93a541ed67', 'fra', 'language', 'title', 'French', 'eng', '', 'f');

-- geographical_extends: 0 rows

-- temporal_extends: 1 rows
insert into temporal_extends (id, concept_id, concept_type, start_min, start_max, end_min, end_max, start_precision, end_precision, start_certainty, end_certainty) values ('01a11bfc-dd7d-7b56-a191-e71510c7398c', 'OdfSbdiTo00V', 'chronontology', '-1300', '-1300', '-1000', '-1000', '50', '50', NULL, NULL);

-- relations: 8 rows
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('C2HPkFYjZhFh', 'chronontology', 'follows', 'chronontology', 'OdfSbdiTo00V', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('Cp0pDVwmsa8T', 'chronontology', 'hasSense', 'chronontology', 'OdfSbdiTo00V', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('OdfSbdiTo00V', 'chronontology', 'hasCoreArea', 'chronontology', '2044273', 'idai.gazetteer');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('OdfSbdiTo00V', 'chronontology', 'hasPeriodType', 'chronontology', 'cultural', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('OdfSbdiTo00V', 'chronontology', 'isFollowedBy', 'chronontology', 'C2HPkFYjZhFh', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('OdfSbdiTo00V', 'chronontology', 'isPartOf', 'chronontology', 'WeenJPbpkvgg', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('OdfSbdiTo00V', 'chronontology', 'isSenseOf', 'chronontology', 'Cp0pDVwmsa8T', 'chronontology');
insert into relations (subject_id, subject_type, predicate_id, predicate_type, object_id, object_type) values ('WeenJPbpkvgg', 'chronontology', 'hasPart', 'chronontology', 'OdfSbdiTo00V', 'chronontology');

-- inversions: 3 rows
insert into inversions (concept1_id, concept1_type, concept2_id, concept2_type) values ('follows', 'chronontology', 'isFollowedBy', 'chronontology');
insert into inversions (concept1_id, concept1_type, concept2_id, concept2_type) values ('isPartOf', 'chronontology', 'hasPart', 'chronontology');
insert into inversions (concept1_id, concept1_type, concept2_id, concept2_type) values ('hasSense', 'chronontology', 'isSenseOf', 'chronontology');

-- users: 2 rows
insert into users (name, email) values ('Maximilian Heiden', 'maximilian.heiden@dainst.de');
insert into users (name, email) values ('Alexander Dorn', 'alexander.dorn@dainst.de');

-- concept_history: 4 rows
insert into concept_history (id, concept_id, concept_type, user_email, timestamp, event, value, comment) values ('01a11c06-caa6-7ac9-b1ad-df901638e232', '2044273', 'idai.gazetteer', 'alexander.dorn@dainst.de', '2023-09-06 13:17:12', 'edit', NULL, NULL);
insert into concept_history (id, concept_id, concept_type, user_email, timestamp, event, value, comment) values ('01a11c06-3258-71ac-8b45-fa75e1298e6d', '2044273', 'idai.gazetteer', 'maximilian.heiden@dainst.de', '2015-11-10 12:29:47', 'edit', NULL, NULL);
insert into concept_history (id, concept_id, concept_type, user_email, timestamp, event, value, comment) values ('01a11c06-3258-7b6e-b481-27373c8ccc0a', '2044273', 'idai.gazetteer', 'maximilian.heiden@dainst.de', '2015-11-10 13:11:55', 'edit', NULL, NULL);
insert into concept_history (id, concept_id, concept_type, user_email, timestamp, event, value, comment) values ('01a11c06-687f-7875-93f4-e3d218b0ef66', '2044273', 'idai.gazetteer', 'maximilian.heiden@dainst.de', '2017-05-22 10:37:57', 'edit', NULL, NULL);

-- domain_roots: 0 rows

-- app_concept_comment: 0 rows

-- app_concept_snapshots: 0 rows

COMMIT;
