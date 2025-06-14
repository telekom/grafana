import { get } from 'lodash';

import { t } from '@grafana/i18n';
import { FetchError, isFetchError } from '@grafana/runtime';

export type SupportedErrors = 'alerting.notifications.conflict' | string;

export const ERROR_NEWER_CONFIGURATION = 'alerting.notifications.conflict';

/** This function gives us the opportunity to translate or transform error codes that are returned from the Kubernetes APIs */
export function getErrorMessageFromCode(code: string): string | undefined {
  const errorMessageMap: Record<SupportedErrors, string> = {
    [ERROR_NEWER_CONFIGURATION]: t(
      'alerting.policies.update-errors.conflict',
      'The notification policy tree has been updated by another user.'
    ),
  };

  return errorMessageMap[code];
}

export type ApiMachineryError = {
  kind: 'Status';
  apiVersion: string;
  code: number;
  details?: {
    uid: string;
    name?: string;
    group?: string;
    kind?: string;
    retryAfterSeconds?: number;
    causes?: []; // @TODO type this, see apimachinery@v0.31.1/pkg/apis/meta/v1/types.go
  };
  status: 'Failure';
  metadata?: Record<string, unknown>;
  message: string;
  reason: string;
};

export function isApiMachineryError(error: unknown): error is FetchError<ApiMachineryError> {
  return isFetchError(error) && get(error.data, 'kind') === 'Status' && get(error.data, 'status') === 'Failure';
}
