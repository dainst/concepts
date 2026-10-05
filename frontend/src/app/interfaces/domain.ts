import {Domain} from 'concepts-common/interfaces/domain';

export interface AnnotatedDomain extends Domain {
  protagonist: boolean;
  title?: string;
}
