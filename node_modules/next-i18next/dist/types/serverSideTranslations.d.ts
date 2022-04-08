import { UserConfig, SSRConfig } from './types';
export declare const serverSideTranslations: (initialLocale: string, namespacesRequired?: string[], configOverride?: UserConfig | null) => Promise<SSRConfig>;
